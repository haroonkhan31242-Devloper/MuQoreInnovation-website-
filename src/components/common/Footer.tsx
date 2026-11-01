import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, Phone } from 'lucide-react';
import { servicesData } from '../../data/servicesData';
import { CONTACT, emailParts, mailtoHref, telHref } from '../../config/contact';
import { BrandMark } from '../brand/BrandMark';
import { ProjectCta } from '../project/ProjectCta';

export const Footer: React.FC = () => {
  const year = "2022";

  return (
    <footer className="relative mt-auto border-t border-line bg-bg-elevated">
      <ProjectCta />

      <div className="container-x pb-10 pt-16 sm:pb-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-3 rounded-xl" aria-label="MuQore Innovation, home">
              <BrandMark size={44} />
              <span className="font-display text-2xl font-bold tracking-tight text-fg">
                MuQore<span className="text-accent-ink">.</span>
              </span>
            </Link>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-fg-subtle">Ideas • Code • Solutions</p>
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-fg-muted">
              A software engineering studio building websites, mobile and desktop applications, AI automation and
              dependable backend systems.
            </p>
          </div>

          <FooterColumn title="Services" className="lg:col-span-3">
            {servicesData.slice(0, 4).map((s) => (
              <FooterLink key={s.id} to={`/services/${s.slug}`}>
                {s.title}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Engineering" className="lg:col-span-2">
            {servicesData.slice(4).map((s) => (
              <FooterLink key={s.id} to={`/services/${s.slug}`}>
                {s.title}
              </FooterLink>
            ))}
          </FooterColumn>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-fg font-sans tracking-normal">Contact</h3>
            <ul className="mt-5 space-y-4 text-[0.9375rem]">
              <li>
                <a href={mailtoHref()} className="group flex items-start gap-3 text-fg-muted transition-colors hover:text-fg">
                  <Mail className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent-ink" aria-hidden="true" />
                  <span>
                    {emailParts()[0]}
                    <wbr />@{emailParts()[1]}
                  </span>
                </a>
              </li>
              {CONTACT.phones.map((p) => (
                <li key={p.e164}>
                  <a href={telHref(p)} className="flex items-start gap-3 text-fg-muted transition-colors hover:text-fg">
                    <Phone className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent-ink" aria-hidden="true" />
                    <span className="tabular-nums">{p.display}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider-glow mt-14" />

        <div className="mt-8 flex flex-col-reverse items-start justify-between gap-6 text-sm text-fg-subtle sm:flex-row sm:items-center">
          <p>© {year} MuQore Innovation. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link to="/about" className="transition-colors hover:text-fg">About</Link>
            <Link to="/portfolio" className="transition-colors hover:text-fg">Portfolio</Link>
            <Link to="/contact" className="transition-colors hover:text-fg">Contact</Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
            >
              Back to top <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterColumn: React.FC<{ title: string; className?: string; children: React.ReactNode }> = ({
  title,
  className = '',
  children,
}) => (
  <div className={className}>
    <h3 className="text-sm font-semibold text-fg font-sans tracking-normal">{title}</h3>
    <ul className="mt-5 space-y-3">{children}</ul>
  </div>
);

const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <li>
    <Link to={to} className="text-[0.9375rem] text-fg-muted transition-colors hover:text-fg">
      {children}
    </Link>
  </li>
);
