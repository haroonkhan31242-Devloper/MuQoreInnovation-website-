import { PortfolioItem } from '../types';

export const portfolioData: PortfolioItem[] = [
  {
    id: 'orbit-cloud-platform',
    title: 'OrbitCloud Enterprise Control Plane',
    category: 'web',
    categoryLabel: 'Web Application & Cloud',
    client: 'Orbit Technologies',
    timeline: '4 Months',
    summary: 'A unified multicloud orchestrator providing real-time infrastructure observability, automated cost anomaly detection, and zero-trust access control.',
    fullDescription: 'MuQore Innovation was contracted to design and engineer an enterprise-grade cloud management console. The platform aggregates live metric streams from AWS, GCP, and Kubernetes clusters, providing real-time topological network visualization and automated FinOps budget alerts.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Three.js Data Topology', 'Go Backend', 'PostgreSQL'],
    results: [
      { metric: '<120ms', label: 'Dashboard Latency' },
      { metric: '34%', label: 'Cloud Cost Reduction' },
      { metric: '100k+', label: 'Metrics Ingested/Sec' }
    ],
    features: [
      'Interactive 3D cluster topology explorer with live node health',
      'Automated policy engine with proactive Slack/PagerDuty alerts',
      'Granular Role-Based Access Control (RBAC) with SAML / Okta SSO'
    ],
    demoUrl: 'https://demo.muqore.com/orbitcloud',
    isDemonstration: true,
    visualColor: 'from-brand-navy to-black'
  },
  {
    id: 'aegis-telemetry-desktop',
    title: 'Aegis Sentinel Desktop Diagnostic Suite',
    category: 'desktop',
    categoryLabel: 'Desktop Software',
    client: 'Aegis Engineering Systems',
    timeline: '3 Months',
    summary: 'A mission-critical offline desktop application for aerospace telemetry decoding, hardware bus inspection, and high-frequency wave analysis.',
    fullDescription: 'Built with Tauri, Rust, and modern React, Aegis Sentinel provides field engineers with instant hardware communication over USB and serial interfaces. It functions 100% offline in isolated facility environments with local cryptographic vault encryption.',
    tags: ['Tauri', 'Rust', 'React 19', 'WebAssembly', 'SQLite Encrypted', 'Chart.js'],
    results: [
      { metric: '14MB', label: 'Ultra-lightweight Binary' },
      { metric: '0ms', label: 'Cloud Dependency' },
      { metric: '60 FPS', label: 'Waveform Rendering' }
    ],
    features: [
      'Zero external cloud dependency with encrypted local key vaults',
      'Direct serial port and USB hardware communication protocols',
      'High-throughput packet parser processing up to 250,000 samples/sec'
    ],
    demoUrl: 'https://demo.muqore.com/aegis-sentinel',
    isDemonstration: true,
    visualColor: 'from-brand-navy via-brand-navy to-brand-orange/55'
  },
  {
    id: 'pulse-health-mobile',
    title: 'PulseTrack AI Mobile Health Companion',
    category: 'mobile',
    categoryLabel: 'Mobile Application',
    client: 'Pulse Biosystems',
    timeline: '3.5 Months',
    summary: 'Next-generation biometric telemetry mobile application connecting patients, wearable sensors, and clinical specialists in real time.',
    fullDescription: 'MuQore Innovation developed this HIPAA-ready mobile app for iOS and Android. It integrates with Apple HealthKit and Google Health Connect, analyzes continuous cardiac and glucose telemetry via embedded edge algorithms, and triggers encrypted telemedicine consultations.',
    tags: ['React Native', 'Expo', 'Swift', 'Kotlin', 'WebRTC Video', 'Supabase Realtime'],
    results: [
      { metric: '4.9★', label: 'Store Rating' },
      { metric: '99.98%', label: 'Crash-free Rate' },
      { metric: '<300ms', label: 'Audio/Video Latency' }
    ],
    features: [
      'Biometric authentication (Face ID & Android Fingerprint)',
      'Offline vitals capture with automatic cloud reconciliation',
      'End-to-end encrypted doctor video consultations'
    ],
    demoUrl: 'https://demo.muqore.com/pulsetrack',
    isDemonstration: true,
    visualColor: 'from-black via-brand-navy to-brand-navy'
  },
  {
    id: 'cortex-doc-automation',
    title: 'CortexFlow Autonomous Document Extraction',
    category: 'ai',
    categoryLabel: 'AI Automation & Solutions',
    client: 'Global Logistics Alliance',
    timeline: '2.5 Months',
    summary: 'Intelligent multi-agent workflow system that processes complex international customs declarations, bills of lading, and freight invoices.',
    fullDescription: 'CortexFlow leverages multimodal vision and large language models to ingest unstructured PDFs, multilingual shipping documents, and handwritten receipts. Extracted structured records are validated against custom trade compliance rules and loaded directly into legacy ERP systems.',
    tags: ['Gemini 3.8 Flash', 'Python', 'FastAPI', 'Celery', 'Docker', 'pgvector'],
    results: [
      { metric: '91%', label: 'Labor Hours Saved' },
      { metric: '99.7%', label: 'Field Accuracy' },
      { metric: '8.4 Sec', label: 'Per-Document Speed' }
    ],
    features: [
      'Multimodal OCR extraction across 18 international languages',
      'Human-in-the-loop review queue for confidence scores <95%',
      'Automated REST webhook ingestion and SAP/Oracle connectors'
    ],
    demoUrl: 'https://demo.muqore.com/cortexflow',
    isDemonstration: true,
    visualColor: 'from-brand-orange/80 via-brand-navy to-black'
  },
  {
    id: 'nexus-payment-gateway',
    title: 'NexusCore High-Throughput Payment API',
    category: 'cloud',
    categoryLabel: 'API & Backend Engineering',
    client: 'Nexus Financial Infrastructure',
    timeline: '5 Months',
    summary: 'A bank-grade distributed API gateway facilitating multi-currency settlements, automated reconciliation, and PCI-DSS compliance.',
    fullDescription: 'Architected by MuQore Innovation for high concurrency and zero financial drift. The system leverages distributed idempotency locks, Kafka event streaming, and multi-region read replicas to handle massive seasonal payment surges without dropped transactions.',
    tags: ['Go', 'Node.js', 'Kafka', 'Redis Cluster', 'PostgreSQL', 'Kubernetes'],
    results: [
      { metric: '45,000+', label: 'TPS Processed' },
      { metric: '99.999%', label: 'Engineered Uptime' },
      { metric: '18ms', label: 'Average P99 Response' }
    ],
    features: [
      'Idempotent transaction ledger with double-entry bookkeeping',
      'Automated OpenAPI 3.1 documentation and mock sandbox',
      'Real-time fraud anomaly scoring using streaming evaluation'
    ],
    demoUrl: 'https://demo.muqore.com/nexuscore',
    isDemonstration: true,
    visualColor: 'from-black to-brand-navy'
  },
  {
    id: 'retail-suite-redesign',
    title: 'OmniTrade Portal Modernization & Redesign',
    category: 'redesign',
    categoryLabel: 'Software Redesign & UX',
    client: 'OmniTrade Supply Chain',
    timeline: '3 Months',
    summary: 'Complete architectural rescue and modern UI/UX overhaul of a 10-year-old monolithic B2B supplier management portal.',
    fullDescription: 'OmniTrade suffered from severe interface clunkiness, unmaintained legacy jQuery scripts, and 8-second page loads. MuQore Innovation executed a Strangler Fig incremental refactor, rebuilding the frontend with modern Tailwind design language and sub-second reactive data grids.',
    tags: ['Modern React', 'TypeScript', 'Tailwind CSS', 'Vite', 'GraphQL', 'REST Proxy'],
    results: [
      { metric: '74%', label: 'Page Load Speedup' },
      { metric: '2.8x', label: 'Daily User Activity' },
      { metric: '0 Hr', label: 'Production Downtime' }
    ],
    features: [
      'Zero business interruption through intelligent micro-frontend proxying',
      'Instant responsive search across 450,000 SKU catalogs',
      'Accessible dark & light visual themes with user preference sync'
    ],
    demoUrl: 'https://demo.muqore.com/omnitrade',
    isDemonstration: true,
    visualColor: 'from-brand-navy to-brand-orange/40'
  }
];
