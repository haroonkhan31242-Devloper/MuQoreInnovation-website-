import React from 'react';
import { motion, type Variants } from 'motion/react';

export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Vertical travel in px. Kept small so content never "flies in". */
  y?: number;
  as?: 'div' | 'section' | 'li' | 'article' | 'header';
}

/** Fades content up once when it scrolls into view. */
export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, y = 14, as = 'div' }) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </Comp>
  );
};

const groupVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
};

interface RevealGroupProps {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'ul' | 'ol';
}

/** Staggers direct children that use `variants={revealItem}`. */
export const RevealGroup: React.FC<RevealGroupProps> = ({ children, className, as = 'div' }) => {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
    >
      {children}
    </Comp>
  );
};
