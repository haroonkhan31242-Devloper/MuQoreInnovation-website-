import React from 'react';
import { motion } from 'motion/react';
import { leadershipData } from '../../data/leadershipData';
import { SectionHeader } from '../ui/SectionHeader';
import { RevealGroup, revealItem } from '../ui/Reveal';

interface LeadershipSectionProps {
  className?: string;
  showHeading?: boolean;
}

export const LeadershipSection: React.FC<LeadershipSectionProps> = ({ className = '', showHeading = true }) => (
  <section className={`section relative ${className}`}>
    <div className="container-x">
      {showHeading && (
        <SectionHeader
          eyebrow="Leadership"
          title="The people behind MuQore"
          description="MuQore Innovation is led by engineers who stay close to the work and accountable to every client."
        />
      )}

      <RevealGroup className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2 lg:gap-8">
        {leadershipData.map((leader) => (
          <motion.article key={leader.id} variants={revealItem} className="group card overflow-hidden">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
              <img
                src={leader.image}
                alt={leader.imageAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
                aria-hidden="true"
              />
            </div>
            <div className="p-6 sm:p-7">
              <h3 className="text-xl font-semibold text-fg sm:text-2xl">{leader.name}</h3>
              <p className="mt-1 text-sm font-semibold text-accent-ink">{leader.designation}</p>
              {leader.summaryNote && (
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-fg-muted">{leader.summaryNote}</p>
              )}
            </div>
          </motion.article>
        ))}
      </RevealGroup>
    </div>
  </section>
);
