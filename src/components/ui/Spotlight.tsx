import React, { useCallback } from 'react';

/**
 * Returns a pointermove handler that feeds the `.spotlight` CSS glow.
 * Writes CSS variables directly so hovering never re-renders React.
 */
export function useSpotlight() {
  return useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, []);
}
