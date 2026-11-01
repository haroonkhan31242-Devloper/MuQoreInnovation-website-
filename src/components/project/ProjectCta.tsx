import React, { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { ArrowRight, Check, Copy, FileText, Phone } from 'lucide-react';
import { CONTACT, emailParts, telHref } from '../../config/contact';
import { EASE_OUT } from '../ui/Reveal';
import { ProjectInquiryDialog } from './ProjectInquiryDialog';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const STEPS = ['Share your idea', 'Get a plan & estimate', 'We design and build it'];

/**
 * "Have a project in mind?" section shown above the footer on every page.
 * The primary button opens an inquiry dialog, so it works on any page
 * (including /get-a-quote, where a link to the same page did nothing).
 */
export const ProjectCta: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Stable callback so the dialog's focus-trap effect doesn't re-run on every render
  const close = useCallback(() => setOpen(false), []);
  const { pathname } = useLocation();
  const onQuotePage = pathname.startsWith('/get-a-quote');

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the address stays visible to copy manually
    }
  };

  return (
    <section aria-labelledby="project-cta-title" className="container-x pt-16 sm:pt-20">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#13213c_0%,#000000_100%)] text-white shadow-[0_40px_80px_-40px_rgba(19,33,60,0.6)]"
      >
        {/* Code photo, dimmed and faded to the left so text stays readable */}
        <img
          src="/assets/services/cta-code-1200.webp"
          srcSet="/assets/services/cta-code-640.webp 640w, /assets/services/cta-code-1200.webp 1200w"
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={1200}
          height={800}
          className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover opacity-30 [mask-image:linear-gradient(to_left,#000_20%,transparent_85%)] lg:w-3/4"
        />
        <div className="aurora-a pointer-events-none absolute -left-24 -top-32 -z-10 h-96 w-96 rounded-full bg-brand-orange/15 blur-3xl" aria-hidden="true" />
        <div className="aurora-b pointer-events-none absolute -bottom-40 right-1/4 -z-10 h-96 w-96 rounded-full bg-brand-navy/60 blur-3xl" aria-hidden="true" />

        <div className="grid gap-10 px-6 py-12 sm:px-12 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-7">
            <motion.p variants={item} className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-orange">
              Start your project
            </motion.p>
            <motion.h2 variants={item} id="project-cta-title" className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-[2.75rem] sm:leading-[1.1]">
              Have a project in mind?
            </motion.h2>
            <motion.p variants={item} className="mt-4 max-w-xl text-base leading-relaxed text-brand-gray sm:text-lg">
              Tell us what you want to build. We'll reply with clear next steps, a plan and an estimate.
            </motion.p>
            <motion.ol variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-2.5 text-sm font-medium text-brand-gray">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-orange/40 bg-brand-orange/10 text-xs font-bold text-brand-orange">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </motion.ol>
          </div>

          <motion.div
            variants={item}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md sm:p-6 lg:col-span-5"
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              className="btn btn-primary btn-lg group w-full"
            >
              Start your project
              <ArrowRight className="icon-nudge h-[18px] w-[18px]" aria-hidden="true" />
            </button>

            {onQuotePage ? (
              <Link to="/contact" className="btn btn-lg mt-3 w-full border border-white/15 bg-white/5 text-white hover:border-white/35 hover:bg-white/10">
                Other ways to contact us
              </Link>
            ) : (
              <Link to="/get-a-quote" className="btn btn-lg mt-3 w-full border border-white/15 bg-white/5 text-white hover:border-white/35 hover:bg-white/10">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Detailed quote form
              </Link>
            )}

            <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 text-brand-gray">
                  {emailParts()[0]}
                  <wbr />@{emailParts()[1]}
                </span>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-orange transition-colors hover:bg-white/10"
                  aria-live="polite"
                >
                  {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                  {copied ? 'Copied' : 'Copy email'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-brand-gray">
                <Phone className="h-4 w-4 text-brand-orange" aria-hidden="true" />
                {CONTACT.phones.map((p) => (
                  <a key={p.e164} href={telHref(p)} className="tabular-nums transition-colors hover:text-white">
                    {p.display}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <ProjectInquiryDialog open={open} onClose={close} />
    </section>
  );
};
