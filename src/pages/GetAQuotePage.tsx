import React, { useEffect, useId, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowRight, Check, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { servicesData } from '../data/servicesData';
import { PageHero } from '../components/ui/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { ServiceIcon } from '../components/ui/ServiceIcon';
import { FormField, isValidEmail } from '../components/ui/FormField';
import { usePageMeta } from '../components/ui/usePageMeta';
import { CONTACT, mailtoHref } from '../config/contact';
import { EmailSendError, SUCCESS_MESSAGE, sendSubmission } from '../services/emailService';

const BUDGETS = ['$5k - $15k', '$15k - $35k', '$35k - $75k', '$75k+ Enterprise'];
const TIMELINES = ['< 4 Weeks', '1 - 3 Months', '3 - 6 Months', 'Flexible Roadmap'];
const FEATURES = [
  'Interactive 3D / WebGL Graphics',
  'Custom AI / LLM Agent Integration',
  'Offline-First Desktop Hardware Access',
  'iOS & Android App Store Publishing',
  'High-Throughput Microservice APIs',
  'Automated Document OCR / Extraction',
  'Enterprise SSO / SAML & RBAC',
  'Legacy Database / Code Refactoring',
];

const initialForm = (service: string) => ({
  name: '',
  email: '',
  company: '',
  serviceSlug: service,
  budgetRange: '$15k - $35k',
  timeline: '1 - 3 Months',
  projectDescription: '',
  featuresNeeded: [] as string[],
  agreeTerms: true,
  website: '',
});

type Errors = Partial<Record<'name' | 'email' | 'projectDescription', string>>;

export const GetAQuotePage: React.FC = () => {
  usePageMeta('Get a Quote', 'Request a project proposal and estimate from MuQore Innovation.');
  const [searchParams] = useSearchParams();
  const paramService = searchParams.get('service');
  const startService = paramService && servicesData.some((s) => s.slug === paramService) ? paramService : 'website-development';

  const [form, setForm] = useState(() => initialForm(startService));
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [referenceId, setReferenceId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // What was sent, shown on the success screen after the form is cleared
  const [summary, setSummary] = useState<[string, string][]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (paramService && servicesData.some((s) => s.slug === paramService)) {
      setForm((f) => ({ ...f, serviceSlug: paramService }));
    }
  }, [paramService]);

  const set = <K extends keyof ReturnType<typeof initialForm>>(key: K, value: ReturnType<typeof initialForm>[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleFeature = (feat: string) =>
    set('featuresNeeded', form.featuresNeeded.includes(feat) ? form.featuresNeeded.filter((f) => f !== feat) : [...form.featuresNeeded, feat]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    const er: Errors = {};
    if (!form.name.trim()) er.name = 'Please enter your name.';
    if (!form.email.trim()) er.email = 'Please enter your email address.';
    else if (!isValidEmail(form.email)) er.email = 'Please enter a valid email, like name@company.com.';
    if (form.projectDescription.trim().length < 20) er.projectDescription = 'Please describe your project in a few sentences (at least 20 characters).';
    setErrors(er);
    if (Object.keys(er).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    setStatus('submitting');
    const generatedRef = `MQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const serviceTitle = servicesData.find((s) => s.slug === form.serviceSlug)?.title ?? form.serviceSlug;
    try {
      await sendSubmission({
        formType: 'Quote request',
        name: form.name,
        email: form.email,
        company: form.company,
        subject: `Quote request ${generatedRef}: ${serviceTitle}`,
        service: serviceTitle,
        budget: form.budgetRange,
        timeline: form.timeline,
        features: form.featuresNeeded,
        projectDescription: form.projectDescription,
        referenceId: generatedRef,
        website: form.website,
      });
      setSummary([
        ['Service', serviceTitle],
        ['Budget', form.budgetRange],
        ['Timeline', form.timeline],
      ]);
      setReferenceId(generatedRef);
      // Clear only once EmailJS has confirmed delivery
      setForm(initialForm(form.serviceSlug));
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErrorMessage(err instanceof EmailSendError ? err.message : "We couldn't submit your request.");
      setStatus('error');
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Get a quote"
        title={
          <>
            Tell us what you <span className="text-gradient">want to build</span>
          </>
        }
        description="Share your goals, timeline and budget. We'll come back with a structured scope and estimate."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Get a Quote' }]}
      />

      <section className="section pt-12 sm:pt-16">
        <div className="container-x max-w-5xl">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'success' ? (
              <motion.div
                key="success"
                role="status"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 text-center sm:p-14"
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                </span>
                <h2 className="mt-6 text-3xl font-bold text-fg">Request sent</h2>
                <p className="mx-auto mt-3 max-w-lg leading-relaxed text-fg-muted">{SUCCESS_MESSAGE}</p>
                <p className="mx-auto mt-3 max-w-lg leading-relaxed text-fg-muted">
                  Your reference is{' '}
                  <strong className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-accent-ink">{referenceId}</strong>.
                  Please mention it if you contact us at {CONTACT.email}.
                </p>
                <dl className="mx-auto mt-8 max-w-md divide-y divide-line rounded-2xl border border-line text-left text-sm">
                  {summary.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 px-5 py-3">
                      <dt className="text-fg-subtle">{k}</dt>
                      <dd className="font-semibold text-fg">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link to="/" className="btn btn-primary">
                    Back to home
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setStatus('idle')}
                  >
                    Request another quote
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                onSubmit={submit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {status === 'error' && (
                  <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                    <p>
                      {errorMessage} Your details are still in the form. You can also email them to{' '}
                      <a href={mailtoHref('Quote request')} className="font-semibold underline">
                        {CONTACT.email}
                      </a>
                      .
                    </p>
                  </div>
                )}

                {/* Spam trap: hidden from people, often filled in by bots */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={(e) => set('website', e.target.value)} />
                  </label>
                </div>
                <Step n={1} title="Your details">
                  <div className="grid gap-6 sm:grid-cols-3">
                    <FormField label="Name" required error={errors.name}>
                      {(p) => <input {...p} autoComplete="name" className="field" value={form.name} onChange={(e) => set('name', e.target.value)} />}
                    </FormField>
                    <FormField label="Email" required error={errors.email}>
                      {(p) => (
                        <input {...p} type="email" inputMode="email" autoComplete="email" className="field" value={form.email} onChange={(e) => set('email', e.target.value)} />
                      )}
                    </FormField>
                    <FormField label="Company">
                      {(p) => (
                        <input {...p} autoComplete="organization" className="field" value={form.company} onChange={(e) => set('company', e.target.value)} />
                      )}
                    </FormField>
                  </div>
                </Step>

                <Step n={2} title="Which service do you need?">
                  <div role="radiogroup" aria-label="Service" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {servicesData.map((svc) => {
                      const on = form.serviceSlug === svc.slug;
                      return (
                        <button
                          key={svc.slug}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => set('serviceSlug', svc.slug)}
                          className="option-card flex flex-col gap-3 p-4 text-left"
                        >
                          <span className="flex items-center justify-between">
                            <ServiceIcon name={svc.iconName} className={`h-5 w-5 ${on ? 'text-accent-ink' : 'text-fg-subtle'}`} />
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                                on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong'
                              }`}
                              aria-hidden="true"
                            >
                              {on && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                          </span>
                          <span className="text-sm font-semibold text-fg">{svc.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </Step>

                <Step n={3} title="Budget and timeline">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <ChoiceGroup label="Estimated budget" options={BUDGETS} value={form.budgetRange} onChange={(v) => set('budgetRange', v)} />
                    <ChoiceGroup label="Target timeline" options={TIMELINES} value={form.timeline} onChange={(v) => set('timeline', v)} />
                  </div>
                </Step>

                <Step n={4} title="Features you're interested in" optional>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {FEATURES.map((f) => {
                      const on = form.featuresNeeded.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => toggleFeature(f)}
                          className="option-card flex items-center gap-3 px-4 py-3 text-left text-[0.9375rem] text-fg"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                              on ? 'border-accent bg-accent text-on-accent' : 'border-line-strong'
                            }`}
                            aria-hidden="true"
                          >
                            {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </span>
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </Step>

                <Step n={5} title="About your project">
                  <FormField
                    label="Project description"
                    required
                    error={errors.projectDescription}
                    hint="What should it do, who is it for, and do you have an existing system?"
                  >
                    {(p) => (
                      <textarea
                        {...p}
                        rows={6}
                        className="field resize-y"
                        value={form.projectDescription}
                        onChange={(e) => set('projectDescription', e.target.value)}
                      />
                    )}
                  </FormField>
                </Step>

                <div className="flex flex-col-reverse items-stretch justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                  <p className="flex items-center gap-2 text-sm text-fg-subtle">
                    <ShieldCheck className="h-4 w-4 text-accent-ink" aria-hidden="true" />
                    Your information is kept confidential.
                  </p>
                  <button type="submit" disabled={status === 'submitting'} className="btn btn-primary btn-lg">
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Submit request
                        <ArrowRight className="icon-nudge h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

const Step: React.FC<{ n: number; title: string; optional?: boolean; children: React.ReactNode }> = ({ n, title, optional, children }) => (
  <Reveal as="section" className="card p-6 sm:p-8">
    <fieldset>
      <legend className="mb-6 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-ink">{n}</span>
        <span className="font-display text-lg font-semibold text-fg sm:text-xl">{title}</span>
        {optional && <span className="text-sm text-fg-subtle">(optional)</span>}
      </legend>
      {children}
    </fieldset>
  </Reveal>
);

const ChoiceGroup: React.FC<{ label: string; options: string[]; value: string; onChange: (v: string) => void }> = ({
  label,
  options,
  value,
  onChange,
}) => {
  const id = useId();
  return (
  <div>
    <p className="field-label" id={id}>
      {label}
    </p>
    <div role="radiogroup" aria-labelledby={id} className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className="option-card min-h-11 px-3 text-sm font-medium text-fg"
        >
          {o}
        </button>
      ))}
    </div>
  </div>
  );
};
