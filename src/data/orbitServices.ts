import { servicesData } from './servicesData';

export type ServiceVisualKind =
  | 'web'
  | 'desktop'
  | 'mobile'
  | 'automation'
  | 'ai'
  | 'api'
  | 'backend'
  | 'redesign';

export interface OrbitService {
  slug: string;
  /** Category name exactly as used in the brand's service list. */
  name: string;
  iconName: string;
  description: string;
  visual: ServiceVisualKind;
}

const ORBIT_META: Record<string, { name: string; visual: ServiceVisualKind }> = {
  'website-development': { name: 'Website Development', visual: 'web' },
  'desktop-applications': { name: 'Desktop Application Development', visual: 'desktop' },
  'mobile-applications': { name: 'Mobile Application Development', visual: 'mobile' },
  'ai-automation': { name: 'AI Automation', visual: 'automation' },
  'ai-solutions': { name: 'AI Solutions', visual: 'ai' },
  'api-development': { name: 'API Development', visual: 'api' },
  'backend-development': { name: 'Backend Development', visual: 'backend' },
  'software-redesign': { name: 'Existing Software Redesign & Improvement', visual: 'redesign' },
};

/** The eight services in orbit order, linked to their existing detail pages. */
export const orbitServices: OrbitService[] = servicesData
  .filter((s) => ORBIT_META[s.slug])
  .map((s) => ({
    slug: s.slug,
    name: ORBIT_META[s.slug].name,
    iconName: s.iconName,
    description: s.shortDescription,
    visual: ORBIT_META[s.slug].visual,
  }));
