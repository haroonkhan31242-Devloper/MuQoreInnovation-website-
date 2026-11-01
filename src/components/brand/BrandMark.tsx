import React from 'react';

export const LOGO_DARK = '/assets/brand/logo-dark.jpeg';
export const LOGO_LIGHT = '/assets/brand/logo-light.jpeg';

/**
 * The MuQore crest redrawn as a vector so it stays sharp at any size and
 * follows the theme: the Q ring, with an MH monogram inlaid inside it.
 * M and H share a stem, and the H's right leg sweeps out through the ring
 * as the Q's tail, as in the original artwork.
 *
 * Colors come from the theme tokens: ring = --accent-ink (navy on light,
 * orange on dark), letters = --fg, H leg and tail = --accent (orange).
 */
const RING = 'M42.8 51.3A23 23 0 1 1 52.3 41.8';
const M = 'M18 41V21l6.5 10L31 21v20';
const H_BAR = 'M31 31h12';
const TAIL =
  'M42 21h4v12c.6 7 4.2 13 9.2 17 2 1.6 4 2.4 6.5 2.6-3.5 3-9 2.6-12.9-.6-4-3.4-6.8-9.6-6.8-17z';

export const BrandMark: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => (
  <span
    aria-hidden="true"
    className={`block shrink-0 overflow-hidden rounded-xl bg-surface ring-1 ring-line ${className}`}
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" className="block">
      {/* Q ring, with a soft highlight on its upper-left edge */}
      <path d={RING} stroke="var(--accent-ink)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M13.5 22.5A21 21 0 0 1 28 9.4" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2" strokeLinecap="round" />

      {/* Recessed face the monogram is inlaid into */}
      <circle cx="32" cy="31" r="19.2" fill="var(--accent-ink)" fillOpacity="0.07" />
      <circle cx="32" cy="31" r="19.2" stroke="var(--accent-ink)" strokeOpacity="0.18" strokeWidth="0.8" />

      {/* MH monogram */}
      <g stroke="var(--fg)" strokeWidth="4" strokeLinejoin="bevel">
        <path d={M} />
        <path d={H_BAR} />
      </g>
      <path d={TAIL} fill="var(--accent)" />
    </svg>
  </span>
);
