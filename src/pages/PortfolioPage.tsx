import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { PortfolioItem } from '../types';
import { PageHero } from '../components/ui/PageHero';
import { Modal } from '../components/ui/Modal';
import { Reveal, EASE_OUT } from '../components/ui/Reveal';
import { usePageMeta } from '../components/ui/usePageMeta';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'ai', label: 'AI & Automation' },
  { id: 'cloud', label: 'Cloud & API' },
  { id: 'redesign', label: 'Redesign' },
];

/** Portfolio categories mapped to the matching quote-form service */
const SERVICE_FOR_CATEGORY: Record<PortfolioItem['category'], string> = {
  web: 'website-development',
  desktop: 'desktop-applications',
  mobile: 'mobile-applications',
  ai: 'ai-automation',
  cloud: 'backend-development',
  redesign: 'software-redesign',
};

export const PortfolioPage: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState<PortfolioItem | null>(null);
  const close = useCallback(() => setActive(null), []);
  usePageMeta('Portfolio', 'Demonstration projects across web, desktop, mobile, AI automation, cloud and software redesign.');

  const available = categories.filter((c) => c.id === 'all' || portfolioData.some((p) => p.category === c.id));
  const projects = filter === 'all' ? portfolioData : portfolioData.filter((p) => p.category === filter);

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title={
          <>
            Work that shows <span className="text-gradient">how we build</span>
          </>
        }
        description="Demonstration systems that illustrate our approach to architecture, performance and user experience across platforms."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Portfolio' }]}
      />

      <section className="section pt-12">
        <div className="container-x">
          {/* Filters */}
          <LayoutGroup>
            <div role="tablist" aria-label="Filter projects" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 sm:flex-wrap">
              {available.map((c) => {
                const selected = filter === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFilter(c.id)}
                    className={`relative min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
                      selected ? 'text-on-accent' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="portfolio-filter"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="relative">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <motion.ul layout className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {projects.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  <article className="card card-interactive group flex h-full flex-col overflow-hidden">
                    <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${p.visualColor}`}>
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                        <span className="rounded-full bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {p.categoryLabel}
                        </span>
                        {p.isDemonstration && (
                          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-navy">Demo</span>
                        )}
                      </div>
                      <p className="absolute bottom-5 left-5 right-5 text-sm text-white/85">Client: {p.client}</p>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="text-lg font-semibold text-fg">{p.title}</h2>
                      <p className="mt-2 line-clamp-3 text-[0.9375rem] leading-relaxed text-fg-muted">{p.summary}</p>
                      <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
                        {p.tags.slice(0, 4).map((t) => (
                          <li key={t} className="chip font-mono text-[0.75rem]">
                            {t}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto pt-6">
                        <button type="button" onClick={() => setActive(p)} className="btn btn-secondary w-full">
                          View case study
                          <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>

          <Reveal className="mt-16 rounded-3xl border border-line bg-surface-2/60 p-8 text-center sm:p-12">
            <h2 className="h-section text-2xl sm:text-3xl">Have a project with specific requirements?</h2>
            <p className="lead mx-auto mt-4 max-w-xl">
              We're happy to sign an NDA before discovery and keep your ideas and code strictly confidential.
            </p>
            <Link to="/get-a-quote" className="btn btn-primary btn-lg mt-8">
              Start a project discussion
              <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Modal open={!!active} onClose={close} labelledBy="project-title">
        {active && (
          <div>
            <div className={`relative h-36 bg-gradient-to-br sm:h-44 ${active.visualColor}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-5 left-6 text-sm font-semibold text-white/90 sm:left-8">
                {active.categoryLabel} · {active.timeline}
              </p>
            </div>
            <div className="space-y-7 p-6 sm:p-8">
              <div>
                <h2 id="project-title" className="text-2xl font-bold text-fg sm:text-3xl">
                  {active.title}
                </h2>
                <p className="mt-1 text-sm text-fg-subtle">Client: {active.client}</p>
              </div>
              <p className="leading-relaxed text-fg-muted">{active.fullDescription}</p>

              <dl className="grid grid-cols-3 gap-3 rounded-2xl border border-line bg-surface-2/60 p-4 text-center sm:p-5">
                {active.results.map((r) => (
                  <div key={r.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs leading-snug text-fg-subtle">{r.label}</dt>
                    <dd className="font-display text-xl font-bold text-fg">{r.metric}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-subtle font-sans">Key features</h3>
                <ul className="mt-4 space-y-3">
                  {active.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="flex flex-wrap gap-2" aria-label="Technologies">
                {active.tags.map((t) => (
                  <li key={t} className="chip font-mono text-[0.75rem]">
                    {t}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
                <p className="text-sm text-fg-subtle">
                  {active.isDemonstration ? 'Demonstration project' : 'Confidential production deployment'}
                </p>
                <Link to={`/get-a-quote?service=${SERVICE_FOR_CATEGORY[active.category]}`} className="btn btn-primary" onClick={close}>
                  Build something similar
                  <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
