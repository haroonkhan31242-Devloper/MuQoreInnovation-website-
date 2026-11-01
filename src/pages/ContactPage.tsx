import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Mail, Phone, Send, ShieldCheck } from 'lucide-react';
import { PageHero } from '../components/ui/PageHero';
import { Reveal } from '../components/ui/Reveal';
import { FormField, isValidEmail } from '../components/ui/FormField';
import { EmailDraftReady } from '../components/ui/EmailDraftReady';
import { usePageMeta } from '../components/ui/usePageMeta';
import { CONTACT, emailParts, mailtoHref, telHref } from '../config/contact';
import { EmailDraft, composeDraft, isValidPhone, openEmailDraft } from '../services/mailtoService';

const EMPTY = { name: '', email: '', phone: '', subject: 'General Inquiry', message: '' };
type Errors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>;

const TOPICS = [
  ['General Inquiry', 'General inquiry'],
  ['Website Development', 'Website development'],
  ['Desktop Applications', 'Desktop application development'],
  ['Mobile Applications', 'Mobile app development'],
  ['AI Automation', 'AI automation'],
  ['AI Solutions', 'AI solutions'],
  ['API Development', 'API development'],
  ['Backend Development', 'Backend development'],
  ['Software Redesign', 'Software redesign & improvement'],
];

export const ContactPage: React.FC = () => {
  usePageMeta('Contact', `Contact MuQore Innovation by email at ${CONTACT.email} or phone.`);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  // The draft opened in the visitor's email app; null while editing the form
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof Errors]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const validate = (): Errors => {
    const er: Errors = {};
    if (!form.name.trim()) er.name = 'Please enter your name.';
    if (!form.email.trim()) er.email = 'Please enter your email address.';
    else if (!isValidEmail(form.email)) er.email = 'Please enter a valid email, like name@company.com.';
    if (!isValidPhone(form.phone)) er.phone = 'Please enter a valid phone number, like +92 333 1166607.';
    if (form.message.trim().length < 10) er.message = 'Please tell us a little more (at least 10 characters).';
    return er;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) {
      // Move focus to the first invalid field
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const topic = TOPICS.find(([v]) => v === form.subject)?.[1] ?? form.subject;
    const next = composeDraft({
      formType: 'Contact form',
      subject: `New Inquiry – ${topic}`,
      fields: [
        ['Name', form.name],
        ['Email Address', form.email],
        ['Phone', form.phone],
        ['Topic', topic],
      ],
      messageLabel: 'Message',
      message: form.message,
    });
    // The form keeps its values so nothing is lost if no email app opens
    if (openEmailDraft(next)) setDraft(next);
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let's talk about <span className="text-gradient">your project</span>
          </>
        }
        description="Questions about a new product, an existing system or a collaboration? Reach us directly or send a message below."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="section pt-12 sm:pt-16">
        <div className="container-x grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Channels */}
          <Reveal className="space-y-4 lg:col-span-5">
            <a href={mailtoHref('Inquiry from website')} className="card card-interactive group flex items-start gap-4 p-6">
              <span className="icon-tile shrink-0">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-fg-subtle">Email</span>
                <span className="mt-1 block text-base font-semibold text-fg group-hover:text-accent-ink sm:text-lg">
                  {emailParts()[0]}
                  <wbr />@{emailParts()[1]}
                </span>
              </span>
            </a>

            <div className="card p-6">
              <div className="flex items-start gap-4">
                <span className="icon-tile shrink-0">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-fg-subtle">Phone</p>
                  <ul className="mt-1 space-y-1">
                    {CONTACT.phones.map((p) => (
                      <li key={p.e164}>
                        <a href={telHref(p)} className="text-lg font-semibold tabular-nums text-fg transition-colors hover:text-accent-ink">
                          {p.display}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>


            <div className="flex gap-3 rounded-2xl border border-line bg-surface-2/60 p-5 text-sm leading-relaxed text-fg-muted">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
              <p>Your message stays confidential. We're happy to sign an NDA before discussing project details.</p>
            </div>
          </Reveal>

          {/* Form */}
          <Reveal className="card p-6 sm:p-10 lg:col-span-7" delay={0.08}>
            <AnimatePresence mode="wait" initial={false}>
              {draft ? (
                <EmailDraftReady
                  draft={draft}
                  onEdit={() => setDraft(null)}
                  onReset={() => {
                    setForm(EMPTY);
                    setDraft(null);
                  }}
                />
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
                  <div>
                    <h2 className="text-2xl font-bold text-fg">Send us a message</h2>
                    <p className="mt-2 text-fg-muted">Fields marked * are required.</p>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <FormField label="Full name" required error={errors.name}>
                      {(p) => <input {...p} name="name" autoComplete="name" className="field" value={form.name} onChange={update} />}
                    </FormField>
                    <FormField label="Email" required error={errors.email}>
                      {(p) => (
                        <input {...p} type="email" name="email" autoComplete="email" inputMode="email" className="field" value={form.email} onChange={update} />
                      )}
                    </FormField>
                    <FormField label="Phone" error={errors.phone}>
                      {(p) => (
                        <input {...p} type="tel" name="phone" autoComplete="tel" inputMode="tel" className="field" value={form.phone} onChange={update} />
                      )}
                    </FormField>
                    <FormField label="Topic">
                      {(p) => (
                        <select {...p} name="subject" className="field" value={form.subject} onChange={update}>
                          {TOPICS.map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      )}
                    </FormField>
                  </div>

                  <FormField label="Message" required error={errors.message} hint="Your goals, current setup, timeline or questions.">
                    {(p) => (
                      <textarea {...p} name="message" rows={6} className="field resize-y" value={form.message} onChange={update} />
                    )}
                  </FormField>

                  <div>
                    <button type="submit" className="btn btn-primary btn-lg w-full">
                      Send email
                      <Send className="icon-nudge h-4 w-4" aria-hidden="true" />
                    </button>
                    <p className="mt-3 text-center text-sm text-fg-subtle">
                      Opens your email app with this message filled in. You just press Send.
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </section>
    </>
  );
};
