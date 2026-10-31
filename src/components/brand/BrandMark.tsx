import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const LOGO_DARK = '/assets/aistudio/WhatsApp_Image_2026-10-28_at_11.23.39_AM__1__32561e21.jpeg';
export const LOGO_LIGHT = '/assets/aistudio/WhatsApp_Image_2026-10-28_at_11.23.39_AM_58cbf8fc.jpeg';

/**
 * Crops the official MQ crest out of the supplied logo artwork so the
 * header/footer show the mark itself instead of a squashed full lockup.
 * Values are the crest's bounding box in source pixels.
 */
const CROPS = {
  dark: { src: LOGO_DARK, w: 1600, h: 1067, cx: 810, cy: 362, size: 560, bg: '#050a18' },
  light: { src: LOGO_LIGHT, w: 1451, h: 1084, cx: 752, cy: 492, size: 860, bg: '#ffffff' },
};

export const BrandMark: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => {
  const { theme } = useTheme();
  const c = CROPS[theme];
  const inner = size * 0.92;
  const scale = inner / c.size;
  const bgW = c.w * scale;
  const bgH = c.h * scale;
  const x = size / 2 - c.cx * scale;
  const y = size / 2 - c.cy * scale;

  return (
    <span
      aria-hidden="true"
      className={`block shrink-0 overflow-hidden rounded-xl ring-1 ring-line ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: c.bg,
        backgroundImage: `url("${c.src}")`,
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
};
