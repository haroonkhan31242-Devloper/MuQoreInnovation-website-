import type { ServiceItem } from '../types/index.js';

export const servicesData: ServiceItem[] = [
  {
    id: 'website-development',
    slug: 'website-development',
    title: 'Website Development',
    shortDescription: 'Modern, responsive business websites and high-performance web applications tailored for enterprise scale.',
    fullDescription: 'At MuQore Innovation, we engineer robust, visually stunning, and lightning-fast websites and web applications. From corporate enterprise platforms to high-traffic SaaS portals, our engineering team adheres to clean code architectures, zero-vulnerability security practices, and responsive design systems that convert visitors into lifelong clients.',
    iconName: 'Globe',
    badge: 'Flagship Core',
    keyCapabilities: [
      'Responsive, mobile-first architectures with pixel-perfect fidelity',
      'Modern Single Page Applications (SPA) and Server-Side Rendered (SSR) portals',
      'Advanced performance engineering (sub-second load times & 95+ Core Web Vitals)',
      'Enterprise CMS integrations, headless architectures, and custom admin consoles',
      'Interactive WebGL & 3D experiential visuals for high-converting landing pages',
      'Full compliance with WCAG 2.1 AA accessibility and international SEO standards'
    ],
    deliverables: [
      'Fully responsive, production-ready web application / website',
      'Modular component library & design system in Tailwind CSS',
      'Production deployment pipeline (CI/CD) and staging environments',
      'Comprehensive technical documentation and editor handbook',
      'Integrated web analytics, tag management, and error monitoring'
    ],
    techStack: [
      { name: 'React / Next.js', category: 'Frontend' },
      { name: 'TypeScript', category: 'Language' },
      { name: 'Tailwind CSS', category: 'Styling' },
      { name: 'Three.js / WebGL', category: 'Interactive 3D' },
      { name: 'Node.js & Express', category: 'Backend' },
      { name: 'Vercel / Cloud Run', category: 'Infrastructure' }
    ],
    caseStudy: {
      clientType: 'Global FinTech Scaleup',
      challenge: 'Legacy marketing site with 4.8s initial load times and poor conversion on mobile devices.',
      solution: 'Architected a cutting-edge SSR platform with modern design language, dynamic product previews, and sub-second asset delivery.',
      results: [
        '310% increase in mobile lead generation',
        'Initial load latency dropped from 4.8s to 0.6s',
        'Core Web Vitals achieved 99/100 performance score'
      ]
    },
    architectureHighlights: [
      'Edge CDN caching with geographic smart routing',
      'Automated code splitting and progressive image loading',
      'End-to-end type safety across client and server boundaries'
    ],
    faqs: [
      {
        question: 'How long does a custom website development project typically take?',
        answer: 'Typical turnarounds range from 3 to 6 weeks for standard corporate portals, and 6 to 12 weeks for complex web applications with authenticated member areas and workflow tools.'
      },
      {
        question: 'Will our team be able to update content without developer intervention?',
        answer: 'Yes. We deliver intuitive CMS setups or headless admin panels with strict permissioning so your marketing team can publish and edit content effortlessly.'
      }
    ]
  },
  {
    id: 'desktop-applications',
    slug: 'desktop-applications',
    title: 'Desktop Application Development',
    shortDescription: 'Professional, cross-platform and native desktop software engineered for offline reliability and native hardware power.',
    fullDescription: 'MuQore Innovation builds high-performance desktop applications that run seamlessly on Windows, macOS, and Linux. We bridge rich graphical interfaces with native operating system capabilities, local hardware acceleration, high-throughput file processing, and robust offline-first synchronization.',
    iconName: 'Monitor',
    badge: 'Native Power',
    keyCapabilities: [
      'Cross-platform desktop engineering using Electron, Tauri, and native frameworks',
      'Direct OS integration: system tray, native notifications, file system hooks, USB/serial hardware',
      'Low memory footprint and optimized native binaries',
      'Offline-first data storage with automatic cloud synchronizers',
      'Automated multi-platform builds, signed installers (MSI, DMG, AppImage), and auto-updaters',
      'Local cryptographic key storage and hardware security module (HSM) bridging'
    ],
    deliverables: [
      'Code-signed installers and executables for Windows, macOS, and Linux',
      'Automated background delta-updating infrastructure',
      'Local database schema with SQLite / RocksDB',
      'Source repository with automated GitHub Actions / GitLab CI workflows',
      'Crash analytics and diagnostic reporting pipeline'
    ],
    techStack: [
      { name: 'Electron / Tauri', category: 'Desktop Framework' },
      { name: 'TypeScript & Rust', category: 'Core Logic' },
      { name: 'SQLite / LevelDB', category: 'Local Storage' },
      { name: 'C++ / Node-API', category: 'Hardware Bridge' },
      { name: 'Tailwind & React', category: 'Interface' }
    ],
    caseStudy: {
      clientType: 'Industrial Logistics Equipment Provider',
      challenge: 'Technicians on remote cargo sites required an offline desktop suite to calibrate diagnostic sensors and sync telemetry on return.',
      solution: 'Engineered a lightweight Tauri desktop app with local sensor stream decoding, real-time charting, and fault detection.',
      results: [
        'Zero data loss across 12,000+ field service hours',
        'Binary size under 18MB with instant launch times',
        'Seamless automatic background telemetry sync'
      ]
    },
    architectureHighlights: [
      'Multi-process sandboxing isolating UI thread from heavy compute operations',
      'Zero-latency IPC (Inter-Process Communication) message protocols',
      'Encrypted local SQLite vault with cryptographic key derivation'
    ],
    faqs: [
      {
        question: 'Should we choose Electron or Tauri for our desktop project?',
        answer: 'We evaluate your exact requirements: Tauri offers microscopic bundle sizes and hyper-efficient memory usage, while Electron provides maximum ecosystem compatibility for deep Chromium audio/video rendering.'
      },
      {
        question: 'How are software updates handled on end-user machines?',
        answer: 'We configure cryptographically signed auto-updaters that run delta patches silently in the background or prompt users with release notes.'
      }
    ]
  },
  {
    id: 'mobile-applications',
    slug: 'mobile-applications',
    title: 'Mobile Application Development for Android and iOS',
    shortDescription: 'Intuitive, fluid iOS and Android mobile applications engineered for engagement, offline resilience, and store approval.',
    fullDescription: 'We build enterprise-grade mobile apps that captivate users through 60fps animations, natural gesture navigation, and rock-solid architectural stability. MuQore Innovation covers every phase from interactive UI prototyping and native device sensor integration to App Store & Google Play submission and post-launch telemetry.',
    iconName: 'Smartphone',
    badge: 'iOS & Android',
    keyCapabilities: [
      'Native-feel cross-platform apps via React Native & Flutter, alongside Swift and Kotlin',
      'Biometric authentication (Face ID, Touch ID, Android Biometrics)',
      'Push notification pipelines with rich media and actionable buttons',
      'Background geolocation, Bluetooth Low Energy (BLE), and device camera pipelines',
      'Offline caching with optimistic UI updates and conflict resolution',
      'App Store Optimization (ASO) and Apple / Google regulatory compliance'
    ],
    deliverables: [
      'Publishable iOS .ipa and Android .aab production builds',
      'Full App Store Connect & Google Play Console setup and compliance pass',
      'Unified mobile UI component system with dark/light mode support',
      'Integrated push notification and crash telemetry pipelines',
      'Automated Fastlane deployment pipeline'
    ],
    techStack: [
      { name: 'React Native / Expo', category: 'Mobile Framework' },
      { name: 'Swift / Kotlin', category: 'Native Modules' },
      { name: 'Redux Toolkit / Zustand', category: 'State Management' },
      { name: 'Firebase / Supabase', category: 'Realtime Backend' },
      { name: 'Fastlane', category: 'CI/CD Automation' }
    ],
    caseStudy: {
      clientType: 'Health & Wellness Telehealth Platform',
      challenge: 'Client needed a reliable mobile app for patient appointments, biometric tracking, and encrypted doctor chat.',
      solution: 'Delivered an iOS & Android app with HIPAA-compliant WebRTC video, biometric authentication, and offline health logs.',
      results: [
        '4.9-star average rating across App Store & Google Play',
        '99.94% crash-free sessions across 80,000 active users',
        'Under 300ms chat latency across multi-region WebSocket servers'
      ]
    },
    architectureHighlights: [
      'Hermes JavaScript engine optimizations for instant startup',
      'Secure keychain / keystore token management',
      'Adaptive network state listener with automatic retry queue'
    ],
    faqs: [
      {
        question: 'Can one codebase target both Apple iOS and Google Android?',
        answer: 'Yes! Using modern React Native or Flutter frameworks, over 90% of business and UI logic is shared, dramatically cutting time-to-market while retaining authentic native speed.'
      },
      {
        question: 'Do you handle the App Store and Google Play submission process?',
        answer: 'Yes, we handle the complete end-to-end submission, privacy disclosures, metadata preparation, and review correspondence.'
      }
    ]
  },
  {
    id: 'ai-automation',
    slug: 'ai-automation',
    title: 'AI Automation',
    shortDescription: 'Intelligent automation systems that streamline repetitive enterprise workflows, document processing, and business operations.',
    fullDescription: 'Transform operational bottlenecks into autonomous, 24/7 business value. MuQore Innovation designs intelligent AI automation pipelines combining computer vision, natural language understanding, optical character recognition (OCR), and deterministic validation loops to eliminate human error and slash operational overhead.',
    iconName: 'Cpu',
    badge: 'Autonomous Scale',
    keyCapabilities: [
      'Automated document extraction (invoices, contracts, identity documents, bank statements)',
      'Intelligent customer support triage and automated resolution pipelines',
      'Multi-agent workflow orchestration with human-in-the-loop checkpoints',
      'Legacy ERP / CRM robotic process automation (RPA) bridging',
      'Proactive anomaly detection in financial records and transactional data',
      'Continuous audit trails and compliance logging'
    ],
    deliverables: [
      'Fully orchestrated automation pipeline and event trigger queue',
      'Admin monitoring dashboard displaying throughput, accuracy, and audit logs',
      'Custom webhook triggers and CRM/ERP connectors',
      'Exception triage portal for human-in-the-loop approvals',
      'Comprehensive performance and cost-per-execution benchmarks'
    ],
    techStack: [
      { name: 'Gemini / Claude / OpenAI', category: 'AI Models' },
      { name: 'Python & LangChain', category: 'Agent Pipelines' },
      { name: 'Celery & Redis', category: 'Distributed Queues' },
      { name: 'PostgreSQL', category: 'Audit Database' },
      { name: 'Docker / Kubernetes', category: 'Containerization' }
    ],
    caseStudy: {
      clientType: 'Commercial Real Estate Brokerage',
      challenge: 'Underwriters spent 22 hours per week manually extracting clauses from 100+ page commercial lease agreements.',
      solution: 'Built an intelligent OCR and extraction agent that digests complex PDF leases, highlights liabilities, and populates financial models.',
      results: [
        '88% reduction in lease processing turnaround time',
        'Over $140,000 saved annually in manual labor costs',
        'Zero missing clause errors over 1,400 audited transactions'
      ]
    },
    architectureHighlights: [
      'Strict schema validation using JSON Schema and Pydantic',
      'Exponential backoff and model failover fallback chains',
      'End-to-end data encryption at rest and in transit'
    ],
    faqs: [
      {
        question: 'What happens when an automated task encounters ambiguous data?',
        answer: 'Our architectures incorporate confidence scoring: if an automated step falls below your custom threshold, it triggers a clean Human-in-the-Loop review queue instead of guessing.'
      },
      {
        question: 'Is proprietary company data kept secure and private?',
        answer: 'Absolutely. We configure zero-data-retention enterprise endpoints and private vector stores, guaranteeing your internal data is never used to train external public models.'
      }
    ]
  },
  {
    id: 'ai-solutions',
    slug: 'ai-solutions',
    title: 'AI Solutions',
    shortDescription: 'Practical, high-impact AI-powered applications, multimodal agents, predictive algorithms, and custom model integrations.',
    fullDescription: 'Moving beyond buzzwords, MuQore Innovation builds practical, production-grade AI solutions that drive measurable business outcomes. We specialize in Retrieval-Augmented Generation (RAG), multimodal analysis (image, video, audio), predictive analytics, and domain-adapted AI agents integrated directly into your existing software stack.',
    iconName: 'Sparkles',
    badge: 'Next-Gen Intelligence',
    keyCapabilities: [
      'Production-grade Retrieval-Augmented Generation (RAG) over private knowledge bases',
      'Multimodal intelligence: image generation/editing, video analysis, and audio transcription',
      'Semantic search and vector database clustering (Pinecone, Qdrant, pgvector)',
      'Fine-tuning and prompt engineering with deterministic output guardrails',
      'Real-time streaming responses with sub-100ms first token latency',
      'Cost-optimized model routing balancing speed, accuracy, and operational expense'
    ],
    deliverables: [
      'Tailored AI engine embedded directly into your web, mobile, or enterprise application',
      'High-throughput vector indexing pipeline with continuous synchronization',
      'Safety guardrail filters preventing hallucinations, prompt injections, and data leaks',
      'Analytics portal tracking token consumption, latency, and user feedback',
      'Comprehensive testing suite with synthetic ground truth evaluation'
    ],
    techStack: [
      { name: 'Gemini Models (Flash, Nano, Omni)', category: 'Foundation Models' },
      { name: 'pgvector / Qdrant', category: 'Vector Databases' },
      { name: 'TypeScript & Python', category: 'Core Stack' },
      { name: 'FastAPI / Express', category: 'Microservices' },
      { name: 'Redis', category: 'Semantic Caching' }
    ],
    caseStudy: {
      clientType: 'Global Legal Intelligence Firm',
      challenge: 'Attorneys struggled to cross-reference 40 years of regulatory precedents across millions of unstructured case transcripts.',
      solution: 'Deployed a hybrid dense-sparse RAG engine with automated citation grounding and hallucination detection.',
      results: [
        'Research time slashed from 6 hours to 8 seconds per brief',
        '100% verified citation accuracy with direct paragraph links',
        'Adopted firm-wide across 350+ practicing attorneys'
      ]
    },
    architectureHighlights: [
      'Hybrid BM25 + dense neural embedding retrieval',
      'Hierarchical document chunking preserving semantic context',
      'Redis semantic caching reducing repeated query costs by 64%'
    ],
    faqs: [
      {
        question: 'How do you prevent AI models from generating incorrect answers (hallucinations)?',
        answer: 'We deploy strict retrieval grounding: models are restricted to your verified knowledge documents, required to provide verifiable citations, and checked by secondary validation guardrails.'
      },
      {
        question: 'Can we try out live AI capabilities directly on your website?',
        answer: 'Yes! You can interact directly with our integrated Multilingual AI Assistant across the website to ask any architectural, technical, or scoping questions in real time.'
      }
    ]
  },
  {
    id: 'api-development',
    slug: 'api-development',
    title: 'API Development',
    shortDescription: 'Reliable, well-documented, and secure API architectures designed for microservices, partners, and mobile clients.',
    fullDescription: 'APIs are the digital arteries of modern enterprise software. MuQore Innovation architects, develops, and documents resilient APIs using RESTful, GraphQL, gRPC, and WebSocket paradigms. We build APIs that developers love to consume: predictable, hyper-fast, secure, and accompanied by automated interactive documentation.',
    iconName: 'Code',
    badge: 'Scalable Integration',
    keyCapabilities: [
      'RESTful, GraphQL, and high-performance gRPC endpoint design',
      'OpenAPI 3.1 / Swagger specification with auto-generated interactive documentation',
      'Robust authentication & authorization (OAuth2, OIDC, JWT, API Key throttling)',
      'Fine-grained rate limiting, IP allowlisting, and DDoS mitigation',
      'Webhook notification systems with cryptographic payload signatures and automatic retries',
      'Comprehensive mock servers and SDK client generators for TypeScript, Python, and Swift'
    ],
    deliverables: [
      'Production-ready API gateway and service endpoints',
      'Interactive OpenAPI / Swagger documentation portal',
      'Complete unit, integration, and load testing suites (k6, Postman, Jest)',
      'Client SDK packages ready for internal or public distribution',
      'Monitoring alarms, rate-limit policies, and SLA tracking dashboards'
    ],
    techStack: [
      { name: 'Node.js / Go / Python', category: 'Languages' },
      { name: 'FastAPI / NestJS', category: 'Frameworks' },
      { name: 'OpenAPI 3.1 / Swagger', category: 'Documentation' },
      { name: 'Redis', category: 'Rate Limiting & Cache' },
      { name: 'Kong / Envoy', category: 'API Gateway' }
    ],
    caseStudy: {
      clientType: 'B2B Supply Chain Marketplace',
      challenge: 'Integration partners complained of unstable endpoints, undocumented edge cases, and frequent timeout errors during peak order volumes.',
      solution: 'Redesigned API gateway with distributed rate limiting, idempotency keys, OpenAPI contracts, and WebSocket order updates.',
      results: [
        '99.995% uptime through Black Friday peak load spikes',
        'Average endpoint response time reduced from 820ms to 42ms',
        'Partner onboarding time shortened from 3 weeks to 2 days'
      ]
    },
    architectureHighlights: [
      'Distributed token bucket rate limiting backed by Redis clusters',
      'Strict idempotency key headers preventing accidental duplicate charges',
      'Zero-downtime blue/green deployment orchestration'
    ],
    faqs: [
      {
        question: 'Do you provide client SDKs for our third-party developers?',
        answer: 'Yes. We generate type-safe SDKs for TypeScript, Python, Go, and Swift directly from the OpenAPI schema, including automated regression tests.'
      },
      {
        question: 'How do you safeguard APIs against abuse and DDoS attacks?',
        answer: 'We configure multi-tiered defense: cloud WAF rules, IP reputation scoring, API key quotas, and algorithmic anomaly throttling.'
      }
    ]
  },
  {
    id: 'backend-development',
    slug: 'backend-development',
    title: 'Backend Development',
    shortDescription: 'Secure, high-concurrency, scalable backend systems and distributed cloud infrastructures engineered for mission-critical uptime.',
    fullDescription: 'The engine room of every successful digital product is a resilient backend. MuQore Innovation designs and implements distributed backend architectures, relational & NoSQL database schemas, asynchronous event streams, and cloud-native serverless or containerized workloads that gracefully scale from day one to millions of concurrent users.',
    iconName: 'Server',
    badge: 'Enterprise Backbone',
    keyCapabilities: [
      'Event-driven architectures using Apache Kafka, RabbitMQ, and AWS SQS/SNS',
      'Database architecture, query optimization, and sharding (PostgreSQL, MySQL, MongoDB)',
      'Horizontal scaling, auto-healing Kubernetes clusters, and serverless compute',
      'Zero-trust security models, data encryption at rest (AES-256), and secret management',
      'Automated database migrations, backup automation, and disaster recovery replication',
      'Comprehensive observability: distributed tracing, Prometheus metrics, and structured logging'
    ],
    deliverables: [
      'Production backend microservices or modular monolith in clean architecture',
      'Optimized database schema, migration scripts, and seed fixtures',
      'Infrastructure as Code (IaC) via Terraform / Pulumi / Docker Compose',
      'Continuous Integration / Continuous Deployment (CI/CD) pipelines',
      'Grafana / Datadog dashboards with proactive paging alerts'
    ],
    techStack: [
      { name: 'Node.js & TypeScript', category: 'Runtime' },
      { name: 'Go / Python', category: 'High-Concurrency Services' },
      { name: 'PostgreSQL & Redis', category: 'Databases & Cache' },
      { name: 'Docker & Kubernetes', category: 'Orchestration' },
      { name: 'AWS / GCP / Cloudflare', category: 'Cloud Infrastructure' }
    ],
    caseStudy: {
      clientType: 'IoT Fleet Telematics Provider',
      challenge: 'Backend was collapsing under 50,000 simultaneous telemetry packets per second, causing database lockups and missing trip logs.',
      solution: 'Re-architected pipeline with Go ingestion workers, Kafka buffering, and TimescaleDB time-series hyper-tables.',
      results: [
        'Handles 180,000+ msgs/second at under 15% CPU utilization',
        'Eliminated all data dropouts with 100% telemetry durability',
        'Cloud hosting costs decreased by 42% through optimized memory pooling'
      ]
    },
    architectureHighlights: [
      'Connection pooling with automatic read-replica load balancing',
      'Dead-letter queues (DLQ) with automated replay policies',
      'Graceful shutdown handling ensuring in-flight transactions finish safely'
    ],
    faqs: [
      {
        question: 'Which cloud provider do you recommend for our infrastructure?',
        answer: 'We are cloud-agnostic: we deploy on Google Cloud Platform, AWS, or Azure depending on your existing licenses, compliance requirements, and budget constraints.'
      },
      {
        question: 'How do you prevent data loss in the event of a catastrophic server failure?',
        answer: 'We configure automated point-in-time recovery (PITR), multi-availability-zone failover, and encrypted geo-replicated snapshots.'
      }
    ]
  },
  {
    id: 'software-redesign',
    slug: 'software-redesign',
    title: 'Existing Software Redesign and Improvement',
    shortDescription: 'Modernize legacy systems, revamp UI/UX, eliminate technical debt, and supercharge functionality, speed, and usability.',
    fullDescription: 'Do not let outdated software hold your organization back. MuQore Innovation rescues and modernizes legacy platforms without disrupting your daily operations. We conduct thorough architectural audits, overhaul cumbersome interfaces into intuitive modern experiences, refactor monolithic bottlenecks, and migrate outdated codebases to modern tech stacks.',
    iconName: 'RefreshCw',
    badge: 'Modernization',
    keyCapabilities: [
      'Comprehensive UI/UX overhaul backed by user research and usability testing',
      'Strangler Fig migration pattern: modernize piece-by-piece with zero business downtime',
      'Performance profiling, memory leak elimination, and database query tuning',
      'Front-to-back accessibility compliance (WCAG) and multi-device responsiveness',
      'Decoupling monolithic legacy code into clean, testable service layers',
      'Security patch remediation and modern authentication upgrade (SSO, MFA)'
    ],
    deliverables: [
      'In-depth Software Health & Architecture Audit report',
      'Modern, intuitive UI design system and component Figma prototypes',
      'Refactored, clean-code production releases with verified automated test coverage',
      'Performance benchmark before-and-after comparison',
      'Transition roadmap and knowledge transfer sessions for your team'
    ],
    techStack: [
      { name: 'Modern React / Next.js', category: 'UI Modernization' },
      { name: 'TypeScript', category: 'Type Safety Migration' },
      { name: 'Tailwind CSS', category: 'Design System' },
      { name: 'Docker', category: 'Containerization' },
      { name: 'Jest / Playwright', category: 'Regression Protection' }
    ],
    caseStudy: {
      clientType: 'Enterprise Inventory Management Firm',
      challenge: 'A 9-year-old internal desktop ERP system suffered from agonizingly slow screen loads, confusing navigation, and employee training friction.',
      solution: 'Re-engineered the platform into a sleek, cloud-accessible web workspace with lightning-fast search, intuitive keyboards shortcuts, and modern UI.',
      results: [
        'User task completion time decreased by 62%',
        'New employee onboarding time reduced from 3 weeks to 2 days',
        'Zero downtime during data migration of 4.2 million stock records'
      ]
    },
    architectureHighlights: [
      'Incremental Strangler Pattern enabling continuous business operation',
      'Regression testing suite preventing legacy feature regressions',
      'Optimized asset pipelines reducing memory footprint by 70%'
    ],
    faqs: [
      {
        question: 'Will our business operations be interrupted during the redesign?',
        answer: 'No. We use the Strangler Fig architectural pattern to modernize your software incrementally behind an intelligent routing proxy, guaranteeing uninterrupted service.'
      },
      {
        question: 'Can you work with our existing development team?',
        answer: 'Yes! We frequently collaborate with in-house engineers, pairing on refactoring standards, introducing modern CI/CD, and upskilling your team.'
      }
    ]
  }
];
