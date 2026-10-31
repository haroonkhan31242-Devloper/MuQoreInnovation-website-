import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { CREST } from './crest';
import { ServiceIcon } from '../ui/ServiceIcon';
import { orbitServices } from '../../data/orbitServices';

/** The crest crop as a CSS background, sized to fill the tile exactly. */
const CrestTile: React.FC<{ size: number; className?: string }> = ({ size, className = '' }) => {
  const { theme } = useTheme();
  const c = CREST[theme];
  const scale = size / c.size;
  return (
    <div
      role="img"
      aria-label="MuQore Innovation crest"
      className={`shrink-0 overflow-hidden ring-1 ring-line ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: c.bg,
        backgroundImage: `url("${c.src}")`,
        backgroundSize: `${c.w * scale}px ${c.h * scale}px`,
        backgroundPosition: `${-(c.cx - c.size / 2) * scale}px ${-(c.cy - c.size / 2) * scale}px`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
};

/**
 * Motion-free version of the orbit for reduced-motion preferences and
 * devices without WebGL: the crest at the centre with the eight services
 * arranged around it (a ring on wider screens, a grid on phones).
 */
export const OrbitStatic: React.FC = () => (
  <div className="relative mx-auto w-full max-w-[540px]">
    {/* Ring layout (sm and up) */}
    <div className="relative hidden aspect-square sm:block">
      <div
        className="pointer-events-none absolute inset-[18%] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.25),transparent)] blur-2xl"
        aria-hidden="true"
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="37" fill="none" className="stroke-[var(--line-strong)]" strokeWidth="0.3" />
        {orbitServices.map((_, i) => {
          const a = (i / orbitServices.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + Math.cos(a) * 37}
              y2={50 + Math.sin(a) * 37}
              className="stroke-[var(--accent)]"
              strokeWidth="0.25"
              opacity="0.45"
            />
          );
        })}
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <CrestTile size={172} className="rounded-[2rem] shadow-[var(--shadow-lift)]" />
      </div>
      <ul>
        {orbitServices.map((s, i) => {
          const a = (i / orbitServices.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <li
              key={s.slug}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${50 + Math.cos(a) * 37}%`, top: `${50 + Math.sin(a) * 37}%` }}
            >
              <Link
                to={`/services/${s.slug}`}
                className="group flex w-[7.5rem] flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface p-2.5 text-center shadow-[var(--shadow-card)] transition-colors hover:border-accent"
              >
                <span className="icon-tile h-9 w-9 rounded-xl">
                  <ServiceIcon name={s.iconName} className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[0.75rem] font-semibold leading-tight text-fg group-hover:text-accent">{s.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>

    {/* Grid layout (phones) */}
    <div className="sm:hidden">
      <div className="mx-auto w-fit">
        <CrestTile size={128} className="rounded-3xl shadow-[var(--shadow-lift)]" />
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-3">
        {orbitServices.map((s) => (
          <li key={s.slug}>
            <Link
              to={`/services/${s.slug}`}
              className="flex h-full min-h-[3.25rem] items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 text-[0.8125rem] font-semibold leading-tight text-fg"
            >
              <ServiceIcon name={s.iconName} className="h-4 w-4 shrink-0 text-accent" />
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
