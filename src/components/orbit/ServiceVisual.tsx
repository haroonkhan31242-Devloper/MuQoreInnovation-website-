import React from 'react';
import type { ServiceVisualKind } from '../../data/orbitServices';

/**
 * Lightweight animated SVG metaphor for each service. Pure CSS keyframes
 * (transform/opacity/stroke-dashoffset only), coloured from theme tokens.
 * Illustrative interfaces only: no client names, logos or real products.
 */

const frame = 'fill-[var(--surface-2)] stroke-[var(--line-strong)]';
const block = 'fill-[var(--line-strong)]';
const soft = 'fill-[var(--line)]';
const accent = 'fill-[var(--accent)]';
const accentStroke = 'stroke-[var(--accent)]';

const Web = () => (
  <>
    <rect x="20" y="14" width="240" height="152" rx="10" className={frame} strokeWidth="1.5" />
    <circle cx="34" cy="28" r="3" className={block} />
    <circle cx="44" cy="28" r="3" className={block} />
    <circle cx="54" cy="28" r="3" className={block} />
    <rect x="72" y="22" width="150" height="12" rx="6" className={soft} />
    <g className="ov-build" style={{ animationDelay: '0s' }}>
      <rect x="34" y="48" width="120" height="10" rx="5" className={accent} />
      <rect x="34" y="64" width="90" height="7" rx="3.5" className={block} />
    </g>
    <rect x="34" y="80" width="54" height="16" rx="8" className={`${accent} ov-build`} style={{ animationDelay: '0.35s' }} />
    <rect x="176" y="46" width="70" height="52" rx="8" className={`${soft} ov-build`} style={{ animationDelay: '0.2s' }} />
    {[0, 1, 2].map((i) => (
      <g key={i} className="ov-build" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
        <rect x={34 + i * 74} y="110" width="64" height="44" rx="7" className={soft} />
        <rect x={42 + i * 74} y="120" width="30" height="5" rx="2.5" className={block} />
        <rect x={42 + i * 74} y="130" width="44" height="4" rx="2" className={block} opacity="0.6" />
      </g>
    ))}
  </>
);

const Desktop = () => (
  <>
    <rect x="16" y="12" width="248" height="156" rx="10" className={frame} strokeWidth="1.5" />
    <rect x="16" y="12" width="248" height="20" rx="10" className={soft} />
    <rect x="16" y="32" width="56" height="136" className={soft} opacity="0.7" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x="26" y={44 + i * 18} width={i === 1 ? 38 : 30} height="7" rx="3.5" className={i === 1 ? accent : block} />
    ))}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={84 + i * 58} y="44" width="50" height="34" rx="6" className={soft} />
        <rect x={92 + i * 58} y="52" width="22" height="5" rx="2.5" className={block} />
        <rect x={92 + i * 58} y="62" width="32" height="8" rx="3" className={i === 0 ? accent : block} />
      </g>
    ))}
    <rect x="84" y="88" width="166" height="70" rx="7" className={soft} />
    {[28, 44, 34, 52, 40, 58, 48].map((h, i) => (
      <rect
        key={i}
        x={96 + i * 21}
        y={150 - h}
        width="12"
        height={h}
        rx="3"
        className={`${i === 5 ? accent : block} ov-grow`}
        style={{ animationDelay: `${i * 0.12}s` }}
      />
    ))}
  </>
);

const Mobile = () => (
  <>
    <rect x="98" y="6" width="84" height="168" rx="16" className={frame} strokeWidth="2" />
    <rect x="124" y="12" width="32" height="7" rx="3.5" className={block} />
    <clipPath id="ov-phone-screen">
      <rect x="104" y="24" width="72" height="144" rx="8" />
    </clipPath>
    <g clipPath="url(#ov-phone-screen)">
      <g className="ov-scroll">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <rect x="108" y={28 + i * 46} width="64" height="40" rx="7" className={i % 3 === 0 ? accent : soft} opacity={i % 3 === 0 ? 0.85 : 1} />
            <rect x="114" y={52 + i * 46} width="34" height="5" rx="2.5" className={block} />
          </g>
        ))}
      </g>
    </g>
    <g className="ov-float">
      <rect x="196" y="40" width="64" height="30" rx="8" className={soft} />
      <circle cx="210" cy="55" r="6" className={accent} />
      <rect x="222" y="50" width="30" height="5" rx="2.5" className={block} />
      <rect x="222" y="58" width="20" height="4" rx="2" className={block} opacity="0.6" />
    </g>
    <g className="ov-float" style={{ animationDelay: '1.2s' }}>
      <rect x="22" y="100" width="62" height="30" rx="8" className={soft} />
      <rect x="32" y="110" width="22" height="10" rx="5" className={accent} />
      <rect x="60" y="112" width="16" height="5" rx="2.5" className={block} />
    </g>
  </>
);

const Automation = () => {
  const nodes = [
    { x: 40, y: 90 },
    { x: 110, y: 46 },
    { x: 110, y: 134 },
    { x: 180, y: 90 },
    { x: 244, y: 90 },
  ];
  const links: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
  ];
  return (
    <>
      {links.map(([a, b], i) => (
        <path
          key={i}
          d={`M${nodes[a].x} ${nodes[a].y} C ${(nodes[a].x + nodes[b].x) / 2} ${nodes[a].y}, ${(nodes[a].x + nodes[b].x) / 2} ${nodes[b].y}, ${nodes[b].x} ${nodes[b].y}`}
          fill="none"
          className={`${accentStroke} ov-dash`}
          strokeWidth="2"
          strokeDasharray="5 7"
          opacity="0.75"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <rect x={n.x - 18} y={n.y - 18} width="36" height="36" rx="10" className={frame} strokeWidth="1.5" />
          <rect
            x={n.x - 18}
            y={n.y - 18}
            width="36"
            height="36"
            rx="10"
            className={`${accent} ov-step`}
            style={{ animationDelay: `${i * 0.45}s` }}
          />
          <path d={`M${n.x - 7} ${n.y} l5 5 l9 -10`} fill="none" stroke="currentColor" className="text-[var(--bg)] ov-step" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${i * 0.45}s` }} />
        </g>
      ))}
    </>
  );
};

const Ai = () => {
  const layers = [
    [50, 90, 130],
    [36, 72, 108, 144],
    [60, 120],
  ];
  const xs = [56, 140, 224];
  return (
    <>
      {layers.slice(0, -1).map((col, li) =>
        col.map((y1) =>
          layers[li + 1].map((y2) => (
            <line key={`${li}-${y1}-${y2}`} x1={xs[li]} y1={y1} x2={xs[li + 1]} y2={y2} className="stroke-[var(--line-strong)]" strokeWidth="1" />
          )),
        ),
      )}
      <path d="M56 90 L140 72 L224 60" fill="none" className={`${accentStroke} ov-dash`} strokeWidth="2.2" strokeDasharray="6 6" />
      <path d="M56 130 L140 108 L224 120" fill="none" className={`${accentStroke} ov-dash`} strokeWidth="2.2" strokeDasharray="6 6" style={{ animationDelay: '0.6s' }} opacity="0.6" />
      {layers.map((col, li) =>
        col.map((y, i) => (
          <g key={`${li}-${y}`}>
            <circle cx={xs[li]} cy={y} r="11" className={frame} strokeWidth="1.5" />
            <circle cx={xs[li]} cy={y} r="5.5" className={`${accent} ov-pulse`} style={{ animationDelay: `${li * 0.35 + i * 0.12}s` }} />
          </g>
        )),
      )}
    </>
  );
};

const Api = () => (
  <>
    <rect x="16" y="46" width="70" height="88" rx="10" className={frame} strokeWidth="1.5" />
    <rect x="28" y="60" width="46" height="6" rx="3" className={block} />
    <rect x="28" y="72" width="34" height="6" rx="3" className={block} opacity="0.6" />
    <rect x="194" y="30" width="70" height="120" rx="10" className={frame} strokeWidth="1.5" />
    {['GET', 'POST', 'PUT'].map((m, i) => (
      <g key={m}>
        <rect x="204" y={44 + i * 32} width="50" height="22" rx="6" className={soft} />
        <text x="212" y={59 + i * 32} className="fill-[var(--accent)] font-mono" fontSize="10" fontWeight="700">
          {m}
        </text>
      </g>
    ))}
    {[64, 90, 116].map((y, i) => (
      <g key={y}>
        <line x1="86" y1={y} x2="194" y2={y} className="stroke-[var(--line-strong)]" strokeWidth="1.5" strokeDasharray="3 5" />
        <rect x="86" y={y - 4} width="18" height="8" rx="4" className={`${accent} ${i === 1 ? 'ov-packet-back' : 'ov-packet'}`} style={{ animationDelay: `${i * 0.5}s` }} />
      </g>
    ))}
    <text x="102" y="150" className="fill-[var(--fg-subtle)] font-mono" fontSize="10">
      /v1/resources
    </text>
  </>
);

const Backend = () => (
  <>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x="26" y={22 + i * 48} width="132" height="38" rx="8" className={frame} strokeWidth="1.5" />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={40 + k * 14} y={36 + i * 48} width="8" height="10" rx="2" className={block} />
        ))}
        <circle cx="134" cy={41 + i * 48} r="4" className={`${accent} ov-blink`} style={{ animationDelay: `${i * 0.4}s` }} />
        <circle cx="146" cy={41 + i * 48} r="4" className={soft} />
      </g>
    ))}
    <path d="M158 41 H190 V90 H206 M158 89 H206 M158 137 H190 V90" fill="none" className={`${accentStroke} ov-dash`} strokeWidth="2" strokeDasharray="5 6" />
    <g>
      <ellipse cx="236" cy="56" rx="28" ry="10" className={frame} strokeWidth="1.5" />
      <path d="M208 56 V124 A28 10 0 0 0 264 124 V56" className={frame} strokeWidth="1.5" />
      <path d="M208 78 A28 10 0 0 0 264 78 M208 100 A28 10 0 0 0 264 100" fill="none" className="stroke-[var(--line-strong)]" strokeWidth="1.5" />
      <ellipse cx="236" cy="56" rx="28" ry="10" className={`${accent} ov-pulse`} opacity="0.5" />
    </g>
  </>
);

const Redesign = () => (
  <>
    <clipPath id="ov-redesign-after">
      <rect className="ov-reveal" x="140" y="0" width="300" height="180" />
    </clipPath>
    {/* Before: dense, uneven legacy layout */}
    <rect x="20" y="16" width="240" height="148" rx="8" className={frame} strokeWidth="1.5" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect key={i} x={30 + (i % 3) * 6} y={28 + i * 18} width={120 + ((i * 37) % 90)} height="10" rx="1" className={block} opacity="0.55" />
    ))}
    {/* After: clean, structured layout revealed by the sweep */}
    <g clipPath="url(#ov-redesign-after)">
      <rect x="20" y="16" width="240" height="148" rx="8" className="fill-[var(--surface)] stroke-[var(--accent)]" strokeWidth="1.5" />
      <rect x="34" y="30" width="110" height="12" rx="6" className={accent} />
      <rect x="34" y="50" width="80" height="7" rx="3.5" className={block} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={34 + i * 74} y="76" width="64" height="72" rx="10" className={soft} />
          <circle cx={50 + i * 74} cy="94" r="8" className={accent} opacity="0.85" />
          <rect x={42 + i * 74} y="112" width="40" height="5" rx="2.5" className={block} />
          <rect x={42 + i * 74} y="122" width="30" height="5" rx="2.5" className={block} opacity="0.6" />
        </g>
      ))}
    </g>
    <g className="ov-divider">
      <line x1="140" y1="10" x2="140" y2="170" className={accentStroke} strokeWidth="2" />
      <circle cx="140" cy="90" r="9" className={accent} />
      <path d="M136 90 l-3 0 M144 90 l3 0" className="stroke-[var(--bg)]" strokeWidth="2" strokeLinecap="round" />
    </g>
  </>
);

const VISUALS: Record<ServiceVisualKind, React.FC> = {
  web: Web,
  desktop: Desktop,
  mobile: Mobile,
  automation: Automation,
  ai: Ai,
  api: Api,
  backend: Backend,
  redesign: Redesign,
};

export const ServiceVisual: React.FC<{ kind: ServiceVisualKind; className?: string }> = ({ kind, className = '' }) => {
  const Visual = VISUALS[kind];
  return (
    <svg viewBox="0 0 280 180" className={`ov-visual block h-auto w-full ${className}`} aria-hidden="true" focusable="false">
      <Visual />
    </svg>
  );
};
