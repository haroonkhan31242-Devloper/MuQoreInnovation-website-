/**
 * Single place that sends website form submissions through EmailJS.
 *
 * Configuration comes from Vite env vars (see .env.example). The public key
 * is meant to be public; the Gmail account itself is connected inside the
 * EmailJS dashboard, and the recipient is set on the EmailJS template.
 */
import type { EmailJSResponseStatus } from '@emailjs/browser';

const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;

export const isEmailConfigured = Boolean(PUBLIC_KEY && SERVICE_ID && TEMPLATE_ID);

export const SUCCESS_MESSAGE =
  'Thank you for contacting MuQore Innovation! Your message has been successfully submitted. Our team will get back to you soon.';

/** Wait after a successful send before the same browser can send again. */
const COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = 'muqore_last_submission';

export type EmailErrorCode = 'not_configured' | 'cooldown' | 'rate_limited' | 'network' | 'rejected';

export class EmailSendError extends Error {
  constructor(public code: EmailErrorCode, message: string) {
    super(message);
  }
}

/** Fields a form can send. Only the fields a form actually has are passed. */
export interface Submission {
  formType: 'Contact form' | 'Quote request' | 'Project inquiry';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  service?: string;
  budget?: string;
  timeline?: string;
  features?: string[];
  projectDescription?: string;
  message?: string;
  referenceId?: string;
  /** Honeypot: people never see this field, bots often fill it in */
  website?: string;
}

const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

/** Optional phone check shared by the forms: blank is fine, otherwise 7–15 digits. */
export function isValidPhone(value: string) {
  const v = value.trim();
  if (!v) return true;
  const digits = v.replace(/\D/g, '').length;
  return PHONE_RE.test(v) && digits >= 7 && digits <= 15;
}

const clean = (v: string | undefined, max: number) => (v ?? '').trim().slice(0, max);

/**
 * EmailJS template variables. Keys are only present for fields the form has;
 * optional fields left blank are sent as "Not provided" so no value is undefined.
 */
function toTemplateParams(s: Submission): Record<string, string> {
  const params: Record<string, string> = {
    form_type: s.formType,
    customer_name: clean(s.name, 120),
    customer_email: clean(s.email, 254),
    reply_to: clean(s.email, 254),
    subject: clean(s.subject, 200),
    submission_date: new Date().toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Karachi',
    }) + ' (PKT)',
  };
  const optional: [string, string | undefined, number][] = [
    ['phone_number', s.phone, 40],
    ['company', s.company, 160],
    ['service', s.service, 120],
    ['project_budget', s.budget, 60],
    ['timeline', s.timeline, 60],
    ['project_description', s.projectDescription, 5000],
    ['message', s.message, 5000],
    ['reference_id', s.referenceId, 20],
  ];
  for (const [key, value, max] of optional) {
    if (value !== undefined) params[key] = clean(value, max) || 'Not provided';
  }
  if (s.features !== undefined) params.features = s.features.length ? s.features.join(', ') : 'None selected';
  return params;
}

function readLastSent() {
  try {
    return Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
  } catch {
    return 0;
  }
}

function markSent() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
  } catch {
    // Storage blocked: the in-flight guard still prevents double sends
  }
}

let inFlight = false;

/**
 * Sends one submission. Resolves only after EmailJS confirms (HTTP 200);
 * every failure rejects with an EmailSendError so forms never show a false success.
 */
export async function sendSubmission(s: Submission): Promise<void> {
  if (s.website?.trim()) return; // Bot filled the hidden field: drop it quietly
  if (!isEmailConfigured) {
    throw new EmailSendError('not_configured', 'Email sending is not set up on this website yet.');
  }
  if (inFlight) throw new EmailSendError('cooldown', 'Your message is already being sent.');
  const wait = COOLDOWN_MS - (Date.now() - readLastSent());
  if (wait > 0) {
    throw new EmailSendError('cooldown', `Please wait ${Math.ceil(wait / 1000)} seconds before sending another message.`);
  }

  inFlight = true;
  try {
    // Loaded on first use so pages without forms don't download the SDK
    const { default: emailjs } = await import('@emailjs/browser');
    await emailjs.send(SERVICE_ID!, TEMPLATE_ID!, toTemplateParams(s), { publicKey: PUBLIC_KEY, blockHeadless: true });
    markSent();
  } catch (err) {
    if (err instanceof EmailSendError) throw err;
    const status = (err as EmailJSResponseStatus | undefined)?.status;
    if (status === 429) throw new EmailSendError('rate_limited', 'Too many messages were sent recently. Please try again in a few minutes.');
    if (!status) throw new EmailSendError('network', 'We could not reach the email service. Please check your connection and try again.');
    throw new EmailSendError('rejected', 'Your message could not be sent right now. Please try again.');
  } finally {
    inFlight = false;
  }
}
