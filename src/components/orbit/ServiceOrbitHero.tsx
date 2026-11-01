import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { ServiceIcon } from '../ui/ServiceIcon';
import { EASE_OUT } from '../ui/Reveal';
import { orbitServices } from '../../data/orbitServices';
import { OrbitStatic } from './OrbitStatic';
import { ServiceVisual } from './ServiceVisual';
import { progressForService, readTimeline, type OrbitStage } from './orbitTimeline';

// three.js is large; load it after the hero text has painted
const OrbitCanvas = lazy(() => import('./OrbitCanvas'));

/** Extra scroll distance (in svh) the orbit track adds beyond one screen. */
const TRACK_SVH = 400;

type Capability = { mode: '3d'; lowPower: boolean } | { mode: 'static' };

/** Decides once whether this device gets the WebGL orbit or the static composition. */
function detectCapability(): Capability {
  if (typeof window === 'undefined') return { mode: 'static' };
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData || (nav.deviceMemory !== undefined && nav.deviceMemory < 2)) return { mode: 'static' };
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return { mode: 'static' };
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const software = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    const lowPower = software || (nav.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 768;
    return { mode: '3d', lowPower };
  } catch {
    return { mode: 'static' };
  }
}

function useIsWide() {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

interface ServiceOrbitHeroProps {
  /** Existing hero copy and calls to action. */
  intro: React.ReactNode;
  isDark: boolean;
}

/**
 * Home hero: the MuQore crest with the eight services in orbit.
 *
 * The section is a tall scroll track with a sticky stage. Native scrolling
 * is never intercepted; the track's scroll progress drives the scene
 * (intro → one moment per service → hand-off to the page). Reduced-motion
 * users and devices without WebGL get a static composition instead.
 */
export const ServiceOrbitHero: React.FC<ServiceOrbitHeroProps> = ({ intro, isDark }) => {
  const reduceMotion = useReducedMotion();
  const [capability] = useState(detectCapability);

  if (reduceMotion || capability.mode === 'static') {
    return (
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="container-x relative grid items-center gap-12 pb-16 pt-12 sm:pt-16 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-12 lg:gap-6 lg:pb-20 lg:pt-8">
          <div className="text-center lg:col-span-6 lg:text-left">{intro}</div>
          <div className="lg:col-span-6">
            <OrbitStatic />
          </div>
        </div>
      </section>
    );
  }

  return <OrbitTrack intro={intro} isDark={isDark} lowPower={capability.lowPower} />;
};

const HeroBackdrop: React.FC = () => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <div className="absolute inset-0 bg-grid" />
    <div className="aurora-a absolute -left-[10%] top-[-20%] h-[520px] w-[620px] max-w-[120vw] rounded-full bg-[radial-gradient(closest-side,rgba(252,163,17,0.16),transparent)] blur-2xl" />
    <div className="aurora-b absolute right-[-10%] top-[10%] h-[520px] w-[620px] max-w-[120vw] rounded-full bg-[radial-gradient(closest-side,rgba(19,33,60,0.3),transparent)] blur-2xl" />
  </div>
);

const OrbitTrack: React.FC<{ intro: React.ReactNode; isDark: boolean; lowPower: boolean }> = ({ intro, isDark, lowPower }) => {
  const trackRef = useRef<HTMLElement>(null);
  const wide = useIsWide();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 72px', 'end end'] });

  const [stage, setStage] = useState<OrbitStage>('intro');
  const [active, setActive] = useState(-1);
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const t = readTimeline(p);
    setStage(t.stage);
    setActive(t.active);
  });

  // Overlays are driven straight from scroll progress (no React re-render per frame)
  const introOpacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);
  const canvasOpacity = useTransform(scrollYProgress, [0, 0.08, 0.93, 1], [wide ? 1 : 0.22, 1, 1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0]);
  const outroOpacity = useTransform(scrollYProgress, [0.9, 0.94, 0.98, 1], [0, 1, 1, 0]);
  const outroY = useTransform(scrollYProgress, [0.9, 1], [24, -24]);

  const scrollToProgress = (p: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    const scrollable = el.offsetHeight - (window.innerHeight - 72);
    window.scrollTo({ top: top + p * scrollable, behavior: 'smooth' });
  };

  const svc = active >= 0 ? orbitServices[active] : null;

  return (
    <section
      ref={trackRef}
      aria-label="MuQore Innovation and its services"
      className="relative"
      style={{ height: `calc(100svh - 4.5rem + ${TRACK_SVH}svh)` }}
    >
      {/* Lets keyboard visitors leave the journey straight away */}
      <a
        href="#services-list"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-fg focus:shadow-lg"
      >
        Skip the service journey <ArrowRight className="inline h-4 w-4" aria-hidden="true" />
      </a>

      {/* ---------------- sticky stage ---------------- */}
      <div className="sticky top-[4.5rem] h-[calc(100svh-4.5rem)] overflow-hidden">
        <HeroBackdrop />
        <motion.div className="absolute inset-0" style={{ opacity: canvasOpacity }}>
          <Suspense fallback={null}>
            <OrbitCanvas progress={scrollYProgress} isDark={isDark} lowPower={lowPower} />
          </Suspense>
        </motion.div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bg" aria-hidden="true" />

        {/* Service rail: jump to any service moment */}
        <nav
          aria-label="Services in the orbit"
          className={`absolute z-20 transition-opacity duration-500 ${
            stage === 'services' ? 'opacity-100' : 'invisible opacity-0'
          } left-1/2 top-3 -translate-x-1/2 lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 xl:left-10`}
        >
          <ol className="flex gap-1 rounded-full border border-line bg-surface/85 p-1 shadow-[var(--shadow-card)] backdrop-blur-md lg:flex-col">
            {orbitServices.map((s, i) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => scrollToProgress(progressForService(i))}
                  aria-label={`Show ${s.name}`}
                  aria-current={i === active ? 'step' : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 lg:h-9 lg:w-9 ${
                    i === active ? 'bg-accent text-on-accent' : 'text-fg-subtle hover:bg-surface-2 hover:text-fg'
                  }`}
                >
                  <ServiceIcon name={s.iconName} className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Focus panel for the service in view */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-20 sm:px-6 sm:pb-6 lg:inset-y-0 lg:left-auto lg:right-0 lg:flex lg:w-[min(46vw,500px)] lg:items-center lg:pb-0 lg:pr-10 xl:pr-16"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            {svc && (
              <motion.article
                key={svc.slug}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } }}
                className="pointer-events-auto mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface/90 shadow-[var(--shadow-lift)] backdrop-blur-xl"
              >
                <div className="grid grid-cols-[96px_1fr] items-center gap-4 p-4 sm:grid-cols-[140px_1fr] lg:block lg:p-0">
                  <div className="rounded-2xl bg-bg/60 p-2 lg:rounded-none lg:border-b lg:border-line lg:px-8 lg:py-6 [perspective:900px]">
                    <div className="lg:[transform:rotateX(8deg)_rotateY(-10deg)] lg:[transform-style:preserve-3d]">
                      <ServiceVisual kind={svc.visual} />
                    </div>
                  </div>
                  <div className="min-w-0 lg:p-7">
                    <p className="font-mono text-[0.6875rem] font-semibold tracking-[0.14em] text-accent-ink">
                      {String(active + 1).padStart(2, '0')} / {String(orbitServices.length).padStart(2, '0')}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold leading-snug text-fg sm:text-xl lg:mt-2 lg:text-2xl">
                      {svc.name}
                    </h2>
                    <p className="mt-2 hidden text-[0.9375rem] leading-relaxed text-fg-muted sm:line-clamp-2 lg:line-clamp-3">
                      {svc.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-line px-4 py-3 lg:px-7 lg:py-4">
                  <Link to={`/services/${svc.slug}`} className="btn btn-primary btn-sm">
                    Explore service
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link to="/get-a-quote" className="btn btn-ghost btn-sm">
                    Get a quote
                  </Link>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        {/* Outro line: hands the visitor over to the rest of the page */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[12%] z-10 px-4 text-center sm:top-[14%]"
          style={{ opacity: outroOpacity, y: outroY }}
          aria-hidden="true"
        >
          <p className="eyebrow justify-center">MuQore Innovation</p>
          <p className="h-display mx-auto mt-4 max-w-[18ch] text-3xl sm:text-5xl">
            Eight services. <span className="text-gradient">One connected team.</span>
          </p>
        </motion.div>
      </div>

      {/* ---------------- intro copy (scrolls away naturally) ---------------- */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex min-h-[calc(100svh-4.5rem)] items-start lg:items-center"
        style={{ opacity: introOpacity }}
      >
        <div className="container-x grid pb-24 pt-10 sm:pt-14 lg:grid-cols-12 lg:pb-12 lg:pt-0">
          <div className="pointer-events-auto text-center lg:col-span-6 lg:text-left xl:col-span-6">{intro}</div>
        </div>
      </motion.div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[calc(100svh-4.5rem-4.25rem)] z-10 flex justify-center"
        style={{ opacity: cueOpacity }}
      >
        <button
          type="button"
          onClick={() => scrollToProgress(progressForService(0))}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle transition-colors hover:text-accent-ink"
        >
          Scroll to explore<span className="hidden sm:inline"> our services</span>
          <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
        </button>
      </motion.div>
    </section>
  );
};
