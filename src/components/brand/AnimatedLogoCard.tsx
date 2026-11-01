import React, { useRef } from "react";
import { LOGO_DARK, LOGO_LIGHT } from "./BrandMark";

interface AnimatedLogoCardProps {
  isDark?: boolean;
  className?: string;
}

/**
 * Official crest artwork with a restrained pointer tilt. The tilt writes CSS
 * variables directly (no React state), is mouse-only, and is skipped for
 * users who prefer reduced motion.
 */
export const AnimatedLogoCard: React.FC<AnimatedLogoCardProps> = ({
  isDark = true,
  className = "",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || reduced || !cardRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    cardRef.current.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
    cardRef.current.style.setProperty("--ry", `${(px * 6).toFixed(2)}deg`);
    cardRef.current.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    cardRef.current.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  };

  const onLeave = () => {
    cardRef.current?.style.setProperty("--rx", "0deg");
    cardRef.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div
      className={`group relative [perspective:1200px] ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(252,163,17,0.2),transparent)] blur-2xl"
        aria-hidden="true"
      />
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-3xl border border-line bg-surface p-3 shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[var(--ease-out-expo)] [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
      >
        {/* Light sheen that follows the pointer */}
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(500px circle at var(--gx,50%) var(--gy,50%), rgba(255,255,255,0.10), transparent 40%)",
          }}
          aria-hidden="true"
        />
        <img
          src={isDark ? LOGO_DARK : LOGO_LIGHT}
          alt="MuQore Innovation crest: Ideas, Code, Solutions"
          width={isDark ? 1600 : 1451}
          height={isDark ? 1067 : 1084}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full rounded-2xl"
        />
      </div>
    </div>
  );
};
