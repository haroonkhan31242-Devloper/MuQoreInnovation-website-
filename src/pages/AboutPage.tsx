import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Compass, Target } from 'lucide-react';
import { AnimatedLogoCard } from '../components/brand/AnimatedLogoCard';
import { LeadershipSection } from '../components/leadership/LeadershipSection';
import { PageHero } from '../components/ui/PageHero';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Reveal, RevealGroup, revealItem } from '../components/ui/Reveal';
import { usePageMeta } from '../components/ui/usePageMeta';
import { useTheme } from '../context/ThemeContext';

const principles = [
  {
    title: 'Clean architecture',
    desc: 'Clear module boundaries, type safety and separation of concerns at every layer.',
  },
  {
    title: 'Security by design',
    desc: 'Least-privilege access, encryption in transit and at rest, and regular vulnerability checks.',
  },
  {
    title: 'Pragmatic AI',
    desc: 'We apply AI where it delivers measurable value, not as a buzzword.',
  },
  {
    title: 'Client ownership',
    desc: 'Transparent communication, clean handovers and source code that belongs to you.',
  },
];

const stacks = [
  { area: 'Frontend & experience', items: ['React 19', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Three.js / WebGL', 'Motion'] },
  { area: 'Backend & infrastructure', items: ['Node.js', 'Go', 'Python / FastAPI', 'PostgreSQL', 'Redis', 'Kafka', 'Docker / K8s'] },
  { area: 'Native & AI', items: ['Tauri / Rust', 'Electron', 'React Native', 'Gemini models', 'pgvector', 'LangChain'] },
];

export const AboutPage: React.FC = () => {
  const { theme } = useTheme();
  usePageMeta('About', 'MuQore Innovation is a software engineering studio building resilient software, scalable systems and practical AI solutions.');

  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            We turn complex requirements into <span className="text-gradient">elegant software</span>
          </>
        }
        description="MuQore Innovation is a software engineering studio focused on resilient products, scalable systems and practical AI."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      <section className="section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <AnimatedLogoCard isDark={theme === 'dark'} />
          </Reveal>
          <div className="lg:col-span-7">
            <SectionHeader align="left" eyebrow="Who we are" title="Ideas • Code • Solutions" />
            <Reveal className="mt-6 space-y-5 text-base leading-relaxed text-fg-muted sm:text-[1.0625rem]" delay={0.05}>
              <p>
                We work to a simple standard: every line of code should move our clients' goals forward. We take
                complex technical requirements and turn them into clear, maintainable and fast digital products.
              </p>
              <p>
                Our engineering culture values architectural discipline, automated testing and open collaboration.
                We connect ambitious product design with dependable backend engineering.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section border-t border-line bg-bg-elevated">
        <RevealGroup className="container-x grid gap-6 md:grid-cols-2">
          {[
            {
              icon: Target,
              label: 'Mission',
              text: 'To help organizations grow by designing and delivering robust, scalable and intelligent software that removes friction and improves the experience of their users.',
            },
            {
              icon: Compass,
              label: 'Vision',
              text: 'To be recognized for outstanding product engineering, where practical AI, immersive web experiences and reliable cloud infrastructure come together.',
            },
          ].map(({ icon: Icon, label, text }) => (
            <motion.div key={label} variants={revealItem} className="card p-8 sm:p-10">
              <span className="icon-tile">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-2xl font-bold text-fg">Our {label.toLowerCase()}</h2>
              <p className="mt-4 text-base leading-relaxed text-fg-muted">{text}</p>
            </motion.div>
          ))}
        </RevealGroup>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeader eyebrow="Principles" title="What guides our engineering" />
          <RevealGroup as="ol" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <motion.li key={p.title} variants={revealItem} className="card card-interactive p-6">
                <span className="font-display text-sm font-semibold tabular-nums text-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-fg">{p.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-fg-muted">{p.desc}</p>
              </motion.li>
            ))}
          </RevealGroup>
        </div>
      </section>

      <div className="border-t border-line bg-bg-elevated">
        <LeadershipSection />
      </div>

      <section className="section border-t border-line">
        <div className="container-x">
          <SectionHeader align="left" eyebrow="Technology" title="Tools we use in production" />
          <RevealGroup className="mt-12 grid gap-4 md:grid-cols-3">
            {stacks.map((s) => (
              <motion.div key={s.area} variants={revealItem} className="card p-6">
                <h3 className="text-base font-semibold text-fg">{s.area}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.items.map((t) => (
                    <li key={t} className="chip font-mono text-[0.75rem]">
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </RevealGroup>
          <Reveal className="mt-12">
            <Link to="/contact" className="link-accent">
              Talk to our team <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
};
