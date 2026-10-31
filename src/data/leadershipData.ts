export interface LeaderProfile {
  id: string;
  name: string;
  designation: string;
  company: string;
  image: string;
  imageAlt: string;
  summaryNote?: string;
}

/**
 * Leadership data for MuQore Innovation.
 * Official Profiles:
 * - Person 1: Engineer Muhammad Uwaim Qureshi — Founder & CEO, MuQore Innovation
 * - Person 2: Engineer Haroon Khan — Co-Founder, MuQore Innovation
 */
export const leadershipData: LeaderProfile[] = [
  {
    id: 'muhammad-owen-qureshi',
    name: 'Engineer Muhammad Uwaim Qureshi',
    designation: 'Founder & CEO, MuQore Innovation',
    company: 'MuQore Innovation',
    image: '/assets/leadership/co-founder-ceo.jpg',
    imageAlt: 'Engineer Muhammad Uwaim Qureshi - Founder & CEO, MuQore Innovation',
    summaryNote: 'Directing strategic vision, engineering excellence, and enterprise digital solutions across global markets.',
  },
  {
    id: 'haroon-khan',
    name: 'Engineer Haroon Khan',
    designation: 'Co-Founder, MuQore Innovation',
    company: 'MuQore Innovation',
    image: '/assets/leadership/haroon-khan.jpg',
    imageAlt: 'Engineer Haroon Khan - Co-Founder, MuQore Innovation',
    summaryNote: 'Key leader driving high-impact technology initiatives and client-centered digital innovation at MuQore Innovation.',
  },
];
