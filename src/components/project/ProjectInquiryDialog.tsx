import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Send } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { FormField, isValidEmail } from '../ui/FormField';
import { EmailDraftReady } from '../ui/EmailDraftReady';
import { servicesData } from '../../data/servicesData';
import { EmailDraft, composeDraft, isValidPhone, openEmailDraft } from '../../services/mailtoService';

const EMPTY = { name: '', email: '', phone: '', serviceSlug: 'website-development', message: '' };
type Errors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>;

/**
 * Short project inquiry that works from any page. Like the other forms it
 * opens a pre-filled email in the visitor's own email app (mailto:).
 */
export const ProjectInquiryDialog: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  // The draft opened in the visitor's email app; null while editing the form
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [referenceId, setReferenceId] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // Reopening shows the form again, with everything entered still there
  useEffect(() => {
    if (!open) setDraft(null);
  }, [open]);

  const set = (key: keyof typeof EMPTY, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Errors = {};
    if (!form.name.trim()) er.name = 'Please enter your name.';
    if (!form.email.trim()) er.email = 'Please enter your email address.';
    else if (!isValidEmail(form.email)) er.email = 'Please enter a valid email, like name@company.com.';
    if (!isValidPhone(form.phone)) er.phone = 'Please enter a valid phone number, like +92 333 1166607.';
    if (form.message.trim().length < 15) er.message = 'Please describe your idea in a sentence or two.';
    setErrors(er);
    if (Object.keys(er).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    // One reference per inquiry: editing and reopening keeps the same one
    const ref = referenceId || `MQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const serviceTitle = servicesData.find((sv) => sv.slug === form.serviceSlug)?.title ?? form.serviceSlug;
    const next = composeDraft({
      formType: 'Project inquiry',
      subject: `New Project Request – ${serviceTitle} (${ref})`,
      fields: [
        ['Name', form.name],
        ['Email Address', form.email],
        ['Phone', form.phone],
        ['Project Type', serviceTitle],
        ['Reference', ref],
      ],
      messageLabel: 'Message',
      message: form.message,
    });
    // The form keeps its values so nothing is lost if no email app opens
    if (!openEmailDraft(next)) return;
    setReferenceId(ref);
    setDraft(next);
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="inquiry-title">
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          {draft ? (
            <EmailDraftReady
              draft={draft}
              reference={referenceId}
              headingId="inquiry-title"
              onEdit={() => setDraft(null)}
              resetLabel="Start a new inquiry"
              onReset={() => {
                setForm(EMPTY);
                setReferenceId('');
                setDraft(null);
              }}
            />
          ) : (
            <motion.form key="form" ref={formRef} onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="pr-12">
                <p className="eyebrow">Start your project</p>
                <h2 id="inquiry-title" className="mt-3 text-2xl font-bold text-fg sm:text-[1.75rem]">
                  Tell us about your idea
                </h2>
                <p className="mt-2 text-fg-muted">
                  A few details are enough. Your email app opens with this filled in, so you just press Send.
                </p>
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
                <FormField label="Phone" error={errors.phone}>
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
                <button type="submit" className="btn btn-primary">
                  Send email
                  <Send className="icon-nudge h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};
