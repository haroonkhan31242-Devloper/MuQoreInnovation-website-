import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export const Breadcrumbs: React.FC<{ items: Crumb[]; className?: string }> = ({ items, className = '' }) => (
  <nav aria-label="Breadcrumb" className={className}>
    <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-subtle">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <li key={i} className="flex items-center gap-1.5">
            {c.to && !last ? (
              <Link to={c.to} className="rounded transition-colors hover:text-fg">
                {c.label}
              </Link>
            ) : (
              <span aria-current={last ? 'page' : undefined} className={last ? 'font-medium text-fg' : ''}>
                {c.label}
              </span>
            )}
            {!last && <ChevronRight className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  </nav>
);
