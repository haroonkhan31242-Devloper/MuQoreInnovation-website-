import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { FormField, isValidEmail } from '../ui/FormField';
import { servicesData } from '../../data/servicesData';
import { CONTACT, mailtoHref } from '../../config/contact';

const EMPTY = { name: '', email: '', phone: '', serviceSlug: 'website-development', message: '', website: '' };
type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

/**
 * Short project inquiry that works from any page. It posts to the same
 * /api/quote endpoint as the full quote form, so it is emailed to the team.
 */
export const ProjectInquiryDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverMessage, setServerMessage] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Start fresh each time after a completed submission
  useEffect(() => {
    if (open && status === 'success') {
      setForm(EMPTY);
      setStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (key: keyof typeof EMPTY, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (!form.name.trim()) er.name = 'Please enter your name.';
    if (!form.email.trim()) er.email = 'Please enter your email address.';
    else if (!isValidEmail(form.email)) er.email = 'Please enter a valid email, like name@company.com.';
    if (form.message.trim().length < 15) er.message = 'Please describe your idea in a sentence or two.';
    setErrors(er);
    if (Object.keys(er).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    setStatus('submitting');
    const generatedRef = `MQ-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          serviceSlug: form.serviceSlug,
          budgetRange: 'Not specified',
          timeline: 'Not specified',
          projectDescription: form.message,
          featuresNeeded: [],
          referenceId: generatedRef,
          website: form.website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setServerMessage(res.status === 429 ? data.message : '');
        throw new Error(data.message);
      }
      setReferenceId(data.referenceId || generatedRef);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="inquiry-title">
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {status === 'success' ? (
            <motion.div key="ok" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 id="inquiry-title" className="mt-5 text-2xl font-bold text-fg">
                Thanks, {form.name.split(' ')[0]}. We've got it.
              </h2>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-fg-muted">
                Your project inquiry was sent to our team. Your reference is{' '}
                <strong className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-accent">{referenceId}</strong>. We'll
                reply to {form.email}.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={onClose} className="btn btn-primary">
                  Done
                </button>
                <Link to="/get-a-quote" onClick={onClose} className="btn btn-secondary">
                  Add budget & timeline
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" ref={formRef} onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="pr-12">
                <p className="eyebrow">Start your project</p>
                <h2 id="inquiry-title" className="mt-3 text-2xl font-bold text-fg sm:text-[1.75rem]">
                  Tell us about your idea
                </h2>
                <p className="mt-2 text-fg-muted">A few details are enough. We'll follow up with questions, a plan and an estimate.</p>
              </div>

              {status === 'error' && (
                <div role="alert" className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p>
                    {serverMessage || "We couldn't send your inquiry."} You can also email{' '}
                    <a href={mailtoHref('Project inquiry')} className="font-semibold underline">
                      {CONTACT.email}
                    </a>{' '}
                    or call {CONTACT.phones[0].display}.
                  </p>
                </div>
              )}

              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Name" required error={errors.name}>
                  {(p) => <input {...p} autoComplete="name" className="field" value={form.name} onChange={(e) => set('name', e.target.value)} />}
                </FormField>
                <FormField label="Email" required error={errors.email}>
                  {(p) => (
                    <input {...p} type="email" inputMode="email" autoComplete="email" className="field" value={form.email} onChange={(e) => set('email', e.target.value)} />
                  )}
                </FormField>
                <FormField label="Phone">
                  {(p) => <input {...p} type="tel" inputMode="tel" autoComplete="tel" className="field" value={form.phone} onChange={(e) => set('phone', e.target.value)} />}
                </FormField>
                <FormField label="Service">
                  {(p) => (
                    <select {...p} className="field" value={form.serviceSlug} onChange={(e) => set('serviceSlug', e.target.value)}>
                      {servicesData.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>
              </div>
              <FormField label="What would you like to build?" required error={errors.message}>
                {(p) => <textarea {...p} rows={4} className="field resize-y" value={form.message} onChange={(e) => set('message', e.target.value)} />}
              </FormField>

              <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <Link to="/get-a-quote" onClick={onClose} className="link-accent justify-center text-sm">
                  Prefer the detailed form? <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button type="submit" disabled={status === 'submitting'} className="btn btn-primary">
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send inquiry
                      <Send className="icon-nudge h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
