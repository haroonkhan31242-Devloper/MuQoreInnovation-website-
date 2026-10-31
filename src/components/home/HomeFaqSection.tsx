import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { Accordion } from '../ui/Accordion';
import { Reveal } from '../ui/Reveal';

const faqs = [
  {
    question: 'What technologies does MuQore Innovation build with?',
    answer:
      'Our main stack includes React, Next.js, TypeScript and Tailwind CSS for the web; Tauri, Rust and Electron for desktop; native and cross-platform tooling for iOS and Android; Node.js, Go and Python FastAPI for backends; PostgreSQL, SQLite and Redis for data; and Google Gemini and other LLMs for AI automation.',
  },
  {
    question: 'How do you handle regional pricing and currencies?',
    answer:
      'Our reference pricing is set in Pakistani Rupees (for example PKR 40,000–50,000 for a Basic Website and PKR 100,000–200,000 for an Advanced Website). The currency selector shows estimated conversions in USD, GBP, INR, CNY, JPY and EUR. A formal quotation always reflects your specific requirements, architecture and timeline.',
  },
  {
    question: 'Can you redesign or modernize an existing application?',
    answer:
      'Yes. Our Software Redesign and Improvement service covers code audits, UI/UX overhauls, database optimization and step-by-step refactoring that keeps your live system running throughout.',
  },
  {
    question: 'Who owns the source code when the project is finished?',
    answer:
      'You do. Once the project is complete and milestones are settled, the custom source code, design assets and documentation are handed over to your organization.',
  },
  {
    question: 'What happens after launch?',
    answer:
      'Every project includes a post-launch warranty period for bug fixes and performance checks. Ongoing maintenance for security updates, monitoring and new features is also available.',
  },
  {
    question: 'How do we start a project?',
    answer:
      'Send your requirements through the Get a Quote form, or contact us by email or phone. Our team reviews your inquiry and arranges a discovery conversation.',
  },
];

export const HomeFaqSection: React.FC = () => (
  <section className="section">
    <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <SectionHeader
          align="left"
          eyebrow="FAQ"
          title="Questions, answered"
          description="Everything you need to know about working with MuQore Innovation."
        >
          <Link to="/contact" className="link-accent mt-8">
            Ask us something else <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </SectionHeader>
      </div>
      <Reveal className="lg:col-span-8" delay={0.1}>
        <Accordion items={faqs} defaultOpen={0} />
      </Reveal>
    </div>
  </section>
);
