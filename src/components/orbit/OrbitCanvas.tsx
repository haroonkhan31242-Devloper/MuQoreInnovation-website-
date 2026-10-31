import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MotionValue } from 'motion/react';
import { ServiceIcon } from '../ui/ServiceIcon';
import { orbitServices } from '../../data/orbitServices';
import { OrbitScene } from './OrbitScene';

interface OrbitCanvasProps {
  progress: MotionValue<number>;
  isDark: boolean;
  lowPower: boolean;
}

/**
 * Mounts the WebGL orbit and the HTML labels that track each card. Labels
 * are mouse shortcuts only; keyboard and screen-reader users get the same
 * links through the focus panel and the services list below.
 */
const OrbitCanvas: React.FC<OrbitCanvasProps> = ({ progress, isDark, lowPower }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const sceneRef = useRef<OrbitScene | null>(null);
  const isDarkRef = useRef(isDark);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    isDarkRef.current = isDark;
    sceneRef.current?.setTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    const host = hostRef.current;
    const iconHost = iconsRef.current;
    if (!host || !iconHost) return;

    // Lucide icons rendered once in a hidden node, re-coloured white for textures
    const iconSvgs = Array.from(iconHost.querySelectorAll('svg')).map((svg) => {
      const clone = svg.cloneNode(true) as SVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', '256');
      clone.setAttribute('height', '256');
      clone.setAttribute('stroke', '#ffffff');
      return clone.outerHTML;
    });

    let scene: OrbitScene;
    try {
      scene = new OrbitScene({
        container: host,
        labels: labelRefs.current.filter((el): el is HTMLAnchorElement => !!el),
        iconSvgs,
        isDark: isDarkRef.current,
        lowPower,
        onSelect: (i) => navigateRef.current(`/services/${orbitServices[i].slug}`),
      });
    } catch {
      // WebGL context creation failed: the static backdrop stays visible
      return;
    }
    sceneRef.current = scene;
    scene.setProgress(progress.get());
    const unsub = progress.on('change', (p) => scene.setProgress(p));

    return () => {
      unsub();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [progress, lowPower]);

  return (
    <>
      <div ref={hostRef} className="absolute inset-0" aria-hidden="true" />
      <div ref={iconsRef} hidden>
        {orbitServices.map((s) => (
          <ServiceIcon key={s.slug} name={s.iconName} strokeWidth={1.6} />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {orbitServices.map((s, i) => (
          <a
            key={s.slug}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            href={`/services/${s.slug}`}
            tabIndex={-1}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/services/${s.slug}`);
            }}
            className="orbit-label pointer-events-auto absolute left-0 top-0 whitespace-nowrap rounded-full border border-line bg-surface/90 px-3 py-1 text-xs font-semibold text-fg-muted shadow-[var(--shadow-card)] transition-[color,border-color] duration-300 hover:border-accent hover:text-fg"
            style={{ opacity: 0, visibility: 'hidden' }}
          >
            {s.name}
          </a>
        ))}
      </div>
    </>
  );
};

export default OrbitCanvas;
