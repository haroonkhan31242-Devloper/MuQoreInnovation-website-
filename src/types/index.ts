export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  badge: string;
  keyCapabilities: string[];
  deliverables: string[];
  techStack: { name: string; category: string }[];
  caseStudy: {
    clientType: string;
    challenge: string;
    solution: string;
    results: string[];
  };
  architectureHighlights: string[];
  faqs: { question: string; answer: string }[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'web' | 'mobile' | 'desktop' | 'ai' | 'cloud' | 'redesign';
  categoryLabel: string;
  client: string;
  timeline: string;
  summary: string;
  fullDescription: string;
  tags: string[];
  results: { metric: string; label: string }[];
  features: string[];
  demoUrl?: string;
  isDemonstration?: boolean;
  visualColor: string;
}
