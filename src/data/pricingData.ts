export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag: string;
  exchangeRateFromPKR: number; // 1 unit of foreign currency = X PKR
  locale: string;
  isBaseline: boolean;
}

export const supportedCurrencies: Record<string, CurrencyOption> = {
  PKR: {
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: 'PKR',
    country: 'Pakistan',
    flag: '🇵🇰',
    exchangeRateFromPKR: 1, // Base currency
    locale: 'ur-PK',
    isBaseline: true,
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    country: 'United States',
    flag: '🇺🇸',
    exchangeRateFromPKR: 278, // 1 USD ~ 278 PKR
    locale: 'en-US',
    isBaseline: false,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    country: 'United Kingdom',
    flag: '🇬🇧',
    exchangeRateFromPKR: 355, // 1 GBP ~ 355 PKR
    locale: 'en-GB',
    isBaseline: false,
  },
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    country: 'India',
    flag: '🇮🇳',
    exchangeRateFromPKR: 3.32, // 1 INR ~ 3.32 PKR
    locale: 'en-IN',
    isBaseline: false,
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    country: 'China',
    flag: '🇨🇳',
    exchangeRateFromPKR: 38.5, // 1 CNY ~ 38.5 PKR
    locale: 'zh-CN',
    isBaseline: false,
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    country: 'Japan',
    flag: '🇯🇵',
    exchangeRateFromPKR: 1.82, // 1 JPY ~ 1.82 PKR
    locale: 'ja-JP',
    isBaseline: false,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    country: 'European Union',
    flag: '🇪🇺',
    exchangeRateFromPKR: 302, // 1 EUR ~ 302 PKR
    locale: 'de-DE',
    isBaseline: false,
  },
};

export interface PricingPlan {
  id: string;
  name: string;
  badge: string;
  shortDescription: string;
  minPKR: number;
  maxPKR: number;
  isCustomQuote?: boolean;
  idealFor: string;
  features: string[];
  ctaLabel: string;
  ctaLink: string;
  popular?: boolean;
}

/**
 * Official reference plans:
 * Supplied Pakistan indicative website development prices:
 * - Basic Website: PKR 40,000–50,000
 * - Advanced Website: PKR 100,000–200,000
 */
export const websitePricingPlans: PricingPlan[] = [
  {
    id: 'basic-website',
    name: 'Basic Website',
    badge: 'Starter Corporate',
    shortDescription: 'Ideal for small businesses, startups, and consulting portfolios requiring a clean, mobile-first web presence.',
    minPKR: 40000,
    maxPKR: 50000,
    idealFor: 'Informational sites, landing pages, corporate portfolios',
    features: [
      'Responsive, mobile-optimized responsive architecture',
      'Up to 5 custom-designed content sections',
      'Lead capture and validated contact inquiry form',
      'Fast loading speeds & modern typography system',
      'Foundational on-page technical SEO & metadata',
      'SSL security and standard deployment guidance',
    ],
    ctaLabel: 'Request Basic Website',
    ctaLink: '/get-a-quote?service=website-development&tier=basic',
    popular: false,
  },
  {
    id: 'advanced-website',
    name: 'Advanced Website',
    badge: 'Most Popular',
    shortDescription: 'Feature-rich web applications with interactive visual components, custom styling, CMS, and high conversion mechanics.',
    minPKR: 100000,
    maxPKR: 200000,
    idealFor: 'Growing enterprises, scale-ups, and interactive brand platforms',
    features: [
      'Custom React / Next.js high-performance architecture',
      'Dynamic content management / headless CMS integration',
      'Interactive 3D / WebGL canvas visual elements',
      'Sub-second Core Web Vitals optimization (95+ score)',
      'Multi-step inquiry forms or custom client calculators',
      'Automated CI/CD deployment pipelines on modern cloud',
      'Dedicated post-launch technical warranty & support',
    ],
    ctaLabel: 'Request Advanced Website',
    ctaLink: '/get-a-quote?service=website-development&tier=advanced',
    popular: true,
  },
  {
    id: 'enterprise-custom',
    name: 'Enterprise & Full-Stack Solutions',
    badge: 'Custom Architecture',
    shortDescription: 'Tailored end-to-end digital solutions spanning mobile apps (Android/iOS), desktop software, AI automation, and distributed backends.',
    minPKR: 0,
    maxPKR: 0,
    isCustomQuote: true,
    idealFor: 'Custom platforms, AI automations, native apps, API ecosystems',
    features: [
      'Bespoke software architecture tailored to your business model',
      'Multi-platform delivery (Web, iOS, Android, Windows, macOS)',
      'Autonomous AI workflow automation & multimodal agents',
      'High-throughput distributed backend & REST/GraphQL APIs',
      'Existing legacy software audit, redesign, and refactoring',
      'Strict SLA guarantee (99.98% uptime) & zero-debt delivery',
    ],
    ctaLabel: 'Discuss Custom Scope',
    ctaLink: '/get-a-quote',
    popular: false,
  },
];

/**
 * Format currency amounts according to target currency and locale
 */
export function formatCurrencyAmount(pkrAmount: number, currency: CurrencyOption): string {
  if (pkrAmount === 0) return 'Custom';

  const converted = pkrAmount / currency.exchangeRateFromPKR;

  // Round intelligently based on magnitude
  let rounded: number;
  if (converted >= 1000) {
    rounded = Math.round(converted / 50) * 50; // Round to nearest 50
  } else if (converted >= 100) {
    rounded = Math.round(converted / 5) * 5;
  } else {
    rounded = Math.round(converted);
  }

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(rounded);
  } catch {
    return `${currency.symbol} ${rounded.toLocaleString()}`;
  }
}
