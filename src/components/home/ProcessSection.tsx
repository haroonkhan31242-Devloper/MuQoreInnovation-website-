import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Code2, Compass, Layers, Rocket, ShieldCheck } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { RevealGroup, revealItem } from '../ui/Reveal';

const steps = [
  {
    title: 'Discovery',
    description:
      'We map your business goals, users, constraints and data flows into a clear, agreed project roadmap.',
    icon: Compass,
    output: 'Requirements brief, user journeys, architecture outline',
  },
  {
    title: 'Architecture & prototype',
    description:
      'Database schema, API contracts and clickable UI prototypes are designed before production code begins.',
    icon: Layers,
    output: 'Interactive prototype, data models, infrastructure plan',
  },
  {
    title: 'Agile delivery',
    description:
      'Two-week sprints with type-safe code, continuous integration and a working demo at every milestone.',
    icon: Code2,
    output: 'Staging access, clean repository, sprint reviews',
  },
  {
    title: 'QA & security',
    description:
      'Automated regression tests, cross-browser checks, security scans and performance profiling.',
    icon: ShieldCheck,
    output: 'QA report, performance audit, security sign-off',
  },
  {
    title: 'Launch & support',
    description:
      'Production deployment, documentation, handover and ongoing maintenance after launch.',
    icon: Rocket,
    output: 'Live release, CI/CD pipeline, full code ownership',
  },
];

export const ProcessSection: React.FC = () => (
  <section className="section relative border-t border-line bg-bg-elevated">
    <div className="container-x">
      <SectionHeader
        eyebrow="How we work"
        title="A delivery process built to remove surprises"
        description="Five clear stages take your idea from first conversation to a reliable product in production."
      />

      <RevealGroup as="ol" className="relative mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-5">
        {/* Connecting line on desktop */}
        <li
          className="pointer-events-none absolute left-0 right-0 top-[2.375rem] hidden h-px bg-gradient-to-r from-transparent via-line-strong to-transparent xl:block"
          aria-hidden="true"
          role="presentation"
        />
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.li key={step.title} variants={revealItem} className="relative">
              <div className="card card-interactive flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="icon-tile relative z-10 bg-bg-elevated">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-sm font-semibold tabular-nums text-fg-subtle">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-fg">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{step.description}</p>
                <p className="mt-auto border-t border-line pt-4 text-sm text-fg-subtle">
                  <span className="sr-only">Output: </span>
                  {step.output}
                </p>
              </div>
            </motion.li>
          );
        })}
      </RevealGroup>

      <div className="mt-12 text-center">
        <Link to="/get-a-quote" className="link-accent">
          Start with a free discovery conversation <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
);
