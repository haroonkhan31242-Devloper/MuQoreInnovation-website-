import React from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check, Cpu, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { AnimatedLogoCard } from '../components/brand/AnimatedLogoCard';
import { ServiceOrbitHero } from '../components/orbit/ServiceOrbitHero';
import { ProcessSection } from '../components/home/ProcessSection';
import { LeadershipSection } from '../components/leadership/LeadershipSection';
import { RegionalPricingSection } from '../components/pricing/RegionalPricingSection';
import { HomeFaqSection } from '../components/home/HomeFaqSection';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Reveal, RevealGroup, revealItem, EASE_OUT } from '../components/ui/Reveal';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { SmartImage, SERVICE_IMAGES } from '../components/ui/SmartImage';
import { useSpotlight } from '../components/ui/Spotlight';
import { usePageMeta } from '../components/ui/usePageMeta';
import { servicesData } from '../data/servicesData';
import { portfolioData } from '../data/portfolioData';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';

const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE_OUT } },
};

const stats = [
  { value: '8', label: 'Core engineering services' },
  { value: '45+', label: 'Production systems deployed' },
  { value: '5', label: 'Stage delivery process' },
  { value: 'EN · اردو', label: 'Bilingual AI assistant' },
];

const strengths = [
  {
    icon: Layers,
    title: 'Architecture first',
    text: 'Maintainable, type-safe codebases designed from database to interface, so your product stays easy to change.',
  },
  {
    icon: Cpu,
    title: 'AI where it pays off',
    text: 'Practical automation and AI features built into real workflows to reduce manual work and improve accuracy.',
  },
  {
    icon: ShieldCheck,
    title: 'Security & reliability',
    text: 'Encrypted communication, automated testing and careful deployment practices protect your users and data.',
  },
];

export const HomePage: React.FC = () => {
  const { theme } = useTheme();
  const { openChat } = useChat();
  const onSpot = useSpotlight();
  usePageMeta('', 'MuQore Innovation builds websites, mobile and desktop applications, AI automation, APIs and backend systems.');

  return (
    <>
      {/* ============== HERO: crest + services in a scroll-driven orbit ============== */}
      <ServiceOrbitHero
        isDark={theme === 'dark'}
        intro={
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="show"
          >
            <motion.p variants={heroItem} className="chip chip-accent mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Ideas • Code • Solutions
            </motion.p>

            <motion.h1
              variants={heroItem}
              className="h-display mx-auto mt-7 max-w-[15ch] text-[2.75rem] sm:text-6xl lg:mx-0 lg:text-[4.5rem] xl:text-[5rem]"
            >
              Software that moves your <span className="text-gradient">business forward</span>
            </motion.h1>

            <motion.p variants={heroItem} className="lead mx-auto mt-7 max-w-xl lg:mx-0">
              MuQore Innovation designs and builds websites, mobile and desktop apps, AI automation and dependable
              backend systems for ambitious teams.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start"
            >
              <Link to="/get-a-quote" className="btn btn-primary btn-lg">
                Start your project
                <ArrowRight className="icon-nudge h-[18px] w-[18px]" aria-hidden="true" />
              </Link>
              <Link to="/services" className="btn btn-secondary btn-lg">
                Explore services
              </Link>
            </motion.div>

            <motion.div variants={heroItem} className="mt-6">
              <button type="button" onClick={() => openChat()} className="link-accent text-sm">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Questions? Ask our AI assistant in English or اردو
              </button>
            </motion.div>
          </motion.div>
        }
      />

      {/* ============================ STATS ============================ */}
      <section aria-label="At a glance" className="border-y border-line bg-bg-elevated">
        <RevealGroup as="ul" className="container-x grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {stats.map((s) => (
            <motion.li key={s.label} variants={revealItem} className="px-2 py-8 text-center sm:py-10 lg:px-6">
              <p className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">{s.value}</p>
              <p className="mt-2 text-sm text-fg-muted">{s.label}</p>
            </motion.li>
          ))}
        </RevealGroup>
      </section>

      {/* ============================ SERVICES ============================ */}
      <section id="services-list" className="section scroll-mt-[4.5rem]">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              align="left"
              eyebrow="What we build"
              title="Eight disciplines, one accountable team"
              description="From your first website to AI-powered platforms, every service is delivered by the same engineering standards."
            />
            <Reveal delay={0.1}>
              <Link to="/services" className="btn btn-secondary shrink-0">
                Compare all services
                <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <RevealGroup as="ul" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {servicesData.map((svc) => (
              <motion.li key={svc.id} variants={revealItem}>
                <Link
                  to={`/services/${svc.slug}`}
                  onPointerMove={onSpot}
                  className="card card-interactive spotlight group flex h-full flex-col overflow-hidden"
                >
                  {SERVICE_IMAGES[svc.slug] && (
                    <div className="relative">
                      <SmartImage
                        {...SERVICE_IMAGES[svc.slug]}
                        sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                        imgClassName="group-hover:scale-[1.05] !duration-[900ms]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" aria-hidden="true" />
                      <span className="icon-tile absolute -bottom-6 left-6 border-line bg-bg-elevated shadow-[var(--shadow-card)]">
                        <ServiceIcon name={svc.iconName} className="h-[22px] w-[22px]" />
                      </span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6 pt-10">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-fg">{svc.title}</h3>
                      <ArrowUpRight
                        className="mt-1 h-5 w-5 shrink-0 text-fg-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-fg-muted">{svc.shortDescription}</p>
                    <span className="mt-auto pt-5 text-xs font-semibold uppercase tracking-wider text-fg-subtle">
                      {svc.badge}
                    </span>
                  </div>
                </Link>
              </motion.li>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ============================ BRAND / WHY US ============================ */}
      <section className="section relative overflow-hidden border-t border-line">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <AnimatedLogoCard isDark={theme === 'dark'} />
          </Reveal>

          <div className="lg:col-span-7">
            <SectionHeader
              align="left"
              eyebrow="Why MuQore"
              title="Engineering precision, built around your goals"
              description="The MQ crest stands for the meeting of ideas, code and solutions. We don't just ship features; we build software you can rely on and grow with."
            />
            <RevealGroup as="ul" className="mt-10 space-y-6">
              {strengths.map(({ icon: Icon, title, text }) => (
                <motion.li key={title} variants={revealItem} className="flex gap-5">
                  <span className="icon-tile shrink-0">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-fg">{title}</h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-fg-muted">{text}</p>
                  </div>
                </motion.li>
              ))}
            </RevealGroup>
            <Reveal className="mt-10" delay={0.1}>
              <Link to="/about" className="link-accent">
                More about our company <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <ProcessSection />

      {/* ============================ WORK ============================ */}
      <section className="section">
        <div className="container-x">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              align="left"
              eyebrow="Selected work"
              title="Demonstration projects"
              description="Representative systems that show how we approach architecture, performance and user experience."
            />
            <Reveal delay={0.1}>
              <Link to="/portfolio" className="btn btn-secondary shrink-0">
                View portfolio
                <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolioData.slice(0, 3).map((item) => (
              <motion.article key={item.id} variants={revealItem} className="card card-interactive group flex flex-col overflow-hidden">
                <div className={`relative h-44 overflow-hidden bg-gradient-to-br ${item.visualColor}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                    <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {item.categoryLabel}
                    </span>
                    {item.isDemonstration && (
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-900">Demo</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-fg">{item.title}</h3>
                  <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-fg-muted">{item.summary}</p>
                  <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
                    {item.results.map((r) => (
                      <div key={r.label} className="flex flex-col-reverse">
                        <dt className="mt-0.5 text-xs leading-snug text-fg-subtle">{r.label}</dt>
                        <dd className="font-display text-lg font-bold text-fg">{r.metric}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </motion.article>
            ))}
          </RevealGroup>
        </div>
      </section>

      <div className="border-t border-line bg-bg-elevated">
        <LeadershipSection />
      </div>

      <div className="border-t border-line">
        <RegionalPricingSection />
      </div>

      <div className="border-t border-line bg-bg-elevated">
        <HomeFaqSection />
      </div>

      {/* Short trust strip before the footer CTA */}
      <section aria-label="Our commitments" className="border-t border-line">
        <RevealGroup as="ul" className="container-x grid gap-4 py-12 sm:grid-cols-3">
          {['Clear scope before code', 'You own the source code', 'Support after launch'].map((t) => (
            <motion.li key={t} variants={revealItem} className="flex items-center justify-center gap-3 text-[0.9375rem] font-medium text-fg-muted sm:justify-start">
              <Check className="h-5 w-5 text-accent" aria-hidden="true" />
              {t}
            </motion.li>
          ))}
        </RevealGroup>
      </section>
    </>
  );
};
