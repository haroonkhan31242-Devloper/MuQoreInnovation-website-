import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, CircleCheck, PackageCheck } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Accordion } from '../components/ui/Accordion';
import { Reveal, RevealGroup, revealItem } from '../components/ui/Reveal';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { SmartImage, SERVICE_IMAGES } from '../components/ui/SmartImage';
import { usePageMeta } from '../components/ui/usePageMeta';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const index = servicesData.findIndex((s) => s.slug === slug);
  const service = servicesData[index];
  usePageMeta(service?.title ?? 'Services', service?.shortDescription);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const prev = servicesData[(index - 1 + servicesData.length) % servicesData.length];
  const next = servicesData[(index + 1) % servicesData.length];

  return (
    <>
      <PageHero
        eyebrow={service.badge}
        title={service.title}
        description={service.fullDescription}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: service.title },
        ]}
        media={
          SERVICE_IMAGES[service.slug] && (
            <div className="relative">
              <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(252,163,17,0.18),transparent)] blur-2xl" aria-hidden="true" />
              <SmartImage
                key={service.slug}
                {...SERVICE_IMAGES[service.slug]}
                priority
                sizes="(min-width: 1024px) 520px, 100vw"
                className="relative rounded-3xl border border-line shadow-[var(--shadow-lift)]"
              />
            </div>
          )
        }
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to={`/get-a-quote?service=${service.slug}`} className="btn btn-primary btn-lg">
            Request a quote
            <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/portfolio" className="btn btn-secondary btn-lg">
            See related work
          </Link>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-6 lg:grid-cols-12">
          {/* Capabilities */}
          <Reveal className="card p-7 sm:p-9 lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="icon-tile">
                <ServiceIcon name={service.iconName} className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold text-fg sm:text-2xl">What's included</h2>
            </div>
            <ul className="mt-7 space-y-4">
              {service.keyCapabilities.map((cap) => (
                <li key={cap} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg-muted sm:text-base">
                  <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                  <span>{cap}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Architecture + stack */}
          <Reveal className="card p-7 sm:p-9 lg:col-span-5" delay={0.08}>
            <h2 className="text-xl font-bold text-fg sm:text-2xl">Architecture standards</h2>
            <ul className="mt-7 space-y-3.5">
              {service.architectureHighlights.map((h) => (
                <li key={h} className="flex gap-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-fg-subtle font-sans">Technology stack</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {service.techStack.map((t) => (
                <li key={t.name} className="chip font-mono text-[0.75rem]" title={t.category}>
                  {t.name}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Deliverables */}
          <Reveal className="card p-7 sm:p-9 lg:col-span-12">
            <div className="flex items-center gap-3">
              <span className="icon-tile">
                <PackageCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-bold text-fg sm:text-2xl">What you receive</h2>
            </div>
            <RevealGroup as="ul" className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {service.deliverables.map((d) => (
                <motion.li
                  key={d}
                  variants={revealItem}
                  className="rounded-xl border border-line bg-surface-2/60 p-4 text-[0.9375rem] leading-relaxed text-fg-muted"
                >
                  {d}
                </motion.li>
              ))}
            </RevealGroup>
          </Reveal>
        </div>
      </section>

      {/* Case study */}
      <section className="pb-20 lg:pb-28">
        <div className="container-x">
          <Reveal className="relative overflow-hidden rounded-3xl border border-line bg-[linear-gradient(135deg,#13213c_0%,#0b1323_55%,#000000_100%)] p-7 text-white sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-orange/15 blur-3xl" aria-hidden="true" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">Representative case</p>
            <h2 className="relative mt-3 max-w-3xl font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {service.caseStudy.clientType}
            </h2>
            <div className="relative mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-brand-orange font-sans tracking-normal">The challenge</h3>
                <p className="mt-2 leading-relaxed text-brand-gray">{service.caseStudy.challenge}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-brand-orange font-sans tracking-normal">Our solution</h3>
                <p className="mt-2 leading-relaxed text-brand-gray">{service.caseStudy.solution}</p>
              </div>
            </div>
            <ul className="relative mt-8 grid gap-3 border-t border-white/10 pt-8 sm:grid-cols-3">
              {service.caseStudy.results.map((r) => (
                <li key={r} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-medium text-white">
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section border-t border-line bg-bg-elevated">
        <div className="container-x max-w-4xl">
          <SectionHeader eyebrow="FAQ" title={`Questions about ${service.title}`} />
          <Reveal className="mt-12" delay={0.05}>
            <Accordion items={service.faqs} />
          </Reveal>
        </div>
      </section>

      {/* Prev / next */}
      <nav aria-label="More services" className="border-t border-line">
        <div className="container-x grid gap-4 py-10 sm:grid-cols-2">
          <Link to={`/services/${prev.slug}`} className="card card-interactive group flex items-center gap-4 p-5">
            <ArrowLeft className="h-5 w-5 shrink-0 text-fg-subtle transition-transform group-hover:-translate-x-1 group-hover:text-accent-ink" aria-hidden="true" />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-fg-subtle">Previous</span>
              <span className="mt-1 block font-semibold text-fg">{prev.title}</span>
            </span>
          </Link>
          <Link to={`/services/${next.slug}`} className="card card-interactive group flex items-center justify-end gap-4 p-5 text-right">
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-fg-subtle">Next</span>
              <span className="mt-1 block font-semibold text-fg">{next.title}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent-ink" aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </>
  );
};
