import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check, Info } from 'lucide-react';
import { supportedCurrencies, websitePricingPlans, formatCurrencyAmount } from '../../data/pricingData';
import { SectionHeader } from '../ui/SectionHeader';
import { Reveal, RevealGroup, revealItem } from '../ui/Reveal';

interface RegionalPricingSectionProps {
  className?: string;
  showHeading?: boolean;
}

const STORAGE_KEY = 'muqore_preferred_currency';

function suggestCurrency(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && supportedCurrencies[saved]) return saved;
  } catch {
    // Storage may be unavailable
  }
  try {
    const lang = navigator.language.toLowerCase();
    if (lang.includes('pk') || lang.startsWith('ur')) return 'PKR';
    if (lang.includes('gb')) return 'GBP';
    if (lang.endsWith('-in') || lang.startsWith('hi')) return 'INR';
    if (lang.startsWith('zh')) return 'CNY';
    if (lang.startsWith('ja')) return 'JPY';
    if (lang === 'en-us') return 'USD';
    if (/^(de|fr|es|it|nl)/.test(lang)) return 'EUR';
  } catch {
    // Fall through to baseline
  }
  return 'PKR';
}

export const RegionalPricingSection: React.FC<RegionalPricingSectionProps> = ({ className = '', showHeading = true }) => {
  const [code, setCode] = useState('PKR');

  useEffect(() => setCode(suggestCurrency()), []);

  const select = (next: string) => {
    setCode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore
    }
  };

  const currency = supportedCurrencies[code] || supportedCurrencies.PKR;

  return (
    <section className={`section relative ${className}`} id="pricing">
      <div className="container-x">
        {showHeading && (
          <SectionHeader
            eyebrow="Pricing"
            title="Transparent starting points"
            description="Indicative website ranges to help you plan. Every formal quote is based on your actual scope."
          />
        )}

        {/* Currency selector */}
        <Reveal className="mt-12 flex flex-col items-center gap-3">
          <div
            role="radiogroup"
            aria-label="Display currency"
            className="inline-flex max-w-full flex-wrap justify-center gap-1 rounded-2xl border border-line bg-surface p-1.5 shadow-[var(--shadow-card)]"
          >
            {Object.values(supportedCurrencies).map((c) => {
              const active = c.code === currency.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={c.name}
                  onClick={() => select(c.code)}
                  className={`relative min-h-10 rounded-xl px-3.5 text-sm font-semibold tabular-nums transition-colors ${
                    active ? 'text-on-accent' : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="currency-pill"
                      className="absolute inset-0 rounded-xl bg-accent"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">{c.code}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-fg-subtle" aria-live="polite">
            {currency.isBaseline
              ? 'Showing official reference prices in Pakistani Rupees.'
              : `Showing estimated ${currency.name} conversions from our PKR reference prices.`}
          </p>
        </Reveal>

        {/* Plans */}
        <RevealGroup className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {websitePricingPlans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={revealItem}
              className={`card flex flex-col p-7 sm:p-8 ${
                plan.popular ? 'border-accent/60 shadow-[0_0_0_1px_var(--accent),var(--shadow-lift)] lg:-my-3 lg:py-11' : ''
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-bold text-on-accent">
                  Most popular
                </span>
              )}
              <p className="text-sm font-semibold text-accent-ink">{plan.badge}</p>
              <h3 className="mt-2 text-2xl font-semibold text-fg">{plan.name}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">{plan.shortDescription}</p>

              <div className="my-7 border-y border-line py-6">
                {plan.isCustomQuote ? (
                  <>
                    <p className="font-display text-3xl font-bold tracking-tight text-fg">Custom quote</p>
                    <p className="mt-1.5 text-sm text-fg-subtle">Priced on your architecture and scope</p>
                  </>
                ) : (
                  <>
                    <motion.p
                      key={currency.code}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="font-display text-[1.75rem] font-bold tabular-nums tracking-tight text-fg sm:text-3xl"
                    >
                      {formatCurrencyAmount(plan.minPKR, currency)}
                      <span className="text-fg-subtle"> – </span>
                      {formatCurrencyAmount(plan.maxPKR, currency)}
                    </motion.p>
                    <p className="mt-1.5 text-sm text-fg-subtle">
                      {currency.isBaseline
                        ? 'Indicative reference range'
                        : `Approx. from PKR ${plan.minPKR.toLocaleString()} – ${plan.maxPKR.toLocaleString()}`}
                    </p>
                  </>
                )}
              </div>

              <p className="text-sm text-fg-muted">
                <span className="font-semibold text-fg">Best for: </span>
                {plan.idealFor}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[0.9375rem] text-fg-muted">
                    <Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent-ink" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.ctaLink}
                className={`btn mt-8 w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {plan.ctaLabel}
                <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>
          ))}
        </RevealGroup>

        <Reveal className="mt-10 flex gap-3 rounded-2xl border border-line bg-surface-2/60 p-5 text-sm leading-relaxed text-fg-muted">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
          <p>
            Prices shown for Pakistan (PKR 40,000–50,000 for Basic Websites and PKR 100,000–200,000 for Advanced
            Websites) are indicative reference ranges. Other currencies are approximate conversions from these figures.
            Final fees depend on confirmed requirements, design, integrations and timeline.
          </p>
        </Reveal>
      </div>
    </section>
  );
};
