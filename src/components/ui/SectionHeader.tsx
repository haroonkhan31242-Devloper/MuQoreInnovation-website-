import React from 'react';
import { Reveal } from './Reveal';

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'center' | 'left';
  className?: string;
  /** Use h1 for page-level headers */
  as?: 'h1' | 'h2';
  children?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
  as = 'h2',
  children,
}) => {
  const Heading = as;
  const centered = align === 'center';
  return (
    <Reveal className={`${centered ? 'text-center mx-auto' : ''} max-w-3xl ${className}`}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Heading className={as === 'h1' ? 'h-display text-4xl sm:text-5xl lg:text-6xl' : 'h-section'}>{title}</Heading>
      {description && <p className={`lead mt-5 ${centered ? 'mx-auto' : ''} max-w-2xl`}>{description}</p>}
      {children}
    </Reveal>
  );
};
