import React from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from './Reveal';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';

interface PageHeroProps {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  crumbs?: Crumb[];
  children?: React.ReactNode;
  /** Optional visual shown beside the text on large screens, below it on small ones */
  media?: React.ReactNode;
}

/** Shared header for inner pages so every page opens with the same rhythm. */
export const PageHero: React.FC<PageHeroProps> = ({ eyebrow, title, description, crumbs, children, media }) => (
  <header className="relative overflow-hidden border-b border-line">
    <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden="true" />
    <div
      className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[760px] max-w-[140vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.16),transparent)] blur-2xl"
      aria-hidden="true"
    />
    <div className="container-x relative pb-14 pt-10 sm:pb-20 sm:pt-14">
      {crumbs && <Breadcrumbs items={crumbs} className="mb-8" />}
      <div className={media ? 'grid items-center gap-10 lg:grid-cols-12 lg:gap-14' : ''}>
        <motion.div
          className={media ? 'lg:col-span-7' : 'max-w-3xl'}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
        >
          <p className="eyebrow mb-5">{eyebrow}</p>
          <h1 className="h-display text-4xl sm:text-5xl lg:text-[3.75rem]">{title}</h1>
          {description && <p className="lead mt-6 max-w-2xl">{description}</p>}
          {children}
        </motion.div>
        {media && (
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.15 }}
          >
            {media}
          </motion.div>
        )}
      </div>
    </div>
  </header>
);
