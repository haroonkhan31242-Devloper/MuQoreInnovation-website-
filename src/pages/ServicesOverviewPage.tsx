import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import { RegionalPricingSection } from '../components/pricing/RegionalPricingSection';
import { ProcessSection } from '../components/home/ProcessSection';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Accordion } from '../components/ui/Accordion';
import { Reveal, RevealGroup, revealItem } from '../components/ui/Reveal';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { SmartImage, SERVICE_IMAGES } from '../components/ui/SmartImage';
import { useSpotlight } from '../components/ui/Spotlight';
import { usePageMeta } from '../components/ui/usePageMeta';

const generalFaqs = [
  {
    question: 'How does a project start?',
    answer:
      'With a discovery phase. We look at your goals, users, technical constraints and security needs, then agree on a written plan before any production code is written.',
  },
  {
    question: 'Can we combine several services in one engagement?',
    answer:
      'Yes. Many projects combine web or mobile front ends with backend development, API design and AI automation, delivered by one team.',
  },
  {
    question: 'Who owns the code and designs?',
    answer:
      'Once the project is complete and milestones are settled, the custom source code, design assets and documentation belong to your company.',
  },
  {
    question: 'How will we see progress during development?',
    answer:
      'You get regular demo releases on a staging environment, a shared task board and direct communication with the engineers working on your product.',
  },
];

export const ServicesOverviewPage: React.FC = () => {
  const onSpot = useSpotlight();
  usePageMeta('Services', 'Website, desktop and mobile development, AI automation and solutions, APIs, backends and software redesign.');

  return (
    <>
      <PageHero
        eyebrow="Services"
        title={
          <>
            Engineering for every <span className="text-gradient">stage of your product</span>
          </>
        }
        description="From responsive websites to native desktop software, AI automation and scalable backends: explore our eight core disciplines."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      >
        {/* Quick jump links */}
        <nav aria-label="Jump to a service" className="mt-10 flex flex-wrap gap-2">
          {servicesData.map((s) => (
            <a key={s.id} href={`#${s.slug}`} className="chip transition-colors hover:border-accent hover:text-fg">
              {s.title}
            </a>
          ))}
        </nav>
      </PageHero>

      <section className="section">
        <div className="container-x space-y-6">
          {servicesData.map((svc, index) => (
            <Reveal key={svc.id} as="article">
              <div
                id={svc.slug}
                onPointerMove={onSpot}
                className="card spotlight scroll-mt-28 overflow-hidden p-6 sm:p-10"
              >
                <div className="grid gap-10 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    {SERVICE_IMAGES[svc.slug] && (
                      <SmartImage
                        {...SERVICE_IMAGES[svc.slug]}
                        sizes="(min-width: 1024px) 480px, 100vw"
                        className="mb-8 rounded-2xl border border-line"
                        imgClassName="hover:scale-[1.03] !duration-[900ms]"
                      />
                    )}
                    <div className="flex items-center gap-4">
                      <span className="icon-tile h-14 w-14 rounded-2xl">
                        <ServiceIcon name={svc.iconName} className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
                          {String(index + 1).padStart(2, '0')} · {svc.badge}
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-fg sm:text-[1.75rem]">{svc.title}</h2>
                      </div>
                    </div>
                    <p className="mt-6 text-[0.9375rem] leading-relaxed text-fg-muted sm:text-base">{svc.fullDescription}</p>
                    <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
                      {svc.techStack.map((t) => (
                        <li key={t.name} className="chip font-mono text-[0.75rem]">
                          {t.name}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link to={`/services/${svc.slug}`} className="btn btn-primary">
                        View details
                        <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link to={`/get-a-quote?service=${svc.slug}`} className="btn btn-secondary">
                        Request a quote
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-line bg-surface-2/60 p-6 sm:p-8 lg:col-span-7">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-fg-subtle font-sans">Key capabilities</h3>
                    <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                      {svc.keyCapabilities.slice(0, 4).map((cap) => (
                        <li key={cap} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8 rounded-xl border border-line bg-surface p-5">
                      <p className="text-sm font-semibold text-accent-ink">{svc.caseStudy.clientType}</p>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{svc.caseStudy.challenge}</p>
                      <ul className="mt-4 flex flex-wrap gap-2">
                        {svc.caseStudy.results.map((r) => (
                          <li key={r} className="chip chip-accent">
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <ProcessSection />

      <div className="border-t border-line">
        <RegionalPricingSection />
      </div>

      <section className="section border-t border-line bg-bg-elevated">
        <div className="container-x max-w-4xl">
          <SectionHeader eyebrow="FAQ" title="Common questions about our services" />
          <RevealGroup className="mt-12">
            <motion.div variants={revealItem}>
              <Accordion items={generalFaqs} />
            </motion.div>
          </RevealGroup>
        </div>
      </section>
    </>
  );
};
