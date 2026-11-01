/**
 * Turns a website form into a ready-to-send email in the visitor's own email
 * app (mailto:). Nothing is sent from the website: the visitor reviews the
 * pre-filled draft and presses Send themselves. No keys or third-party APIs.
 */
import { CONTACT } from '../config/contact';

export interface EmailDraft {
  subject: string;
  body: string;
}

/** One "Label: value" line; blank optional values are written as "Not provided". */
export type DraftField = [label: string, value: string | string[] | undefined];

interface DraftInput {
  formType: 'Contact form' | 'Quote request' | 'Project inquiry';
  subject: string;
  fields: DraftField[];
  messageLabel: string;
  message: string;
}

// RFC 6068: line breaks in a mailto body are CRLF
const NL = '\r\n';

const formatValue = (v: DraftField[1]) => {
  if (Array.isArray(v)) return v.length ? v.join(', ') : 'None selected';
  return v?.trim() || 'Not provided';
};

export function composeDraft({ formType, subject, fields, messageLabel, message }: DraftInput): EmailDraft {
  const lines = fields.map(([label, value]) => `${label}: ${formatValue(value)}`);
  const body = [
    ...lines,
    '',
    `${messageLabel}:`,
    message.trim().replace(/\r?\n/g, NL),
    '',
    '--',
    `Sent from the MuQore Innovation website (${formType})`,
  ].join(NL);
  return { subject: subject.trim(), body };
}

export const draftToMailto = ({ subject, body }: EmailDraft) =>
  `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Ignores repeat clicks while the email app is still opening. */
const REOPEN_GUARD_MS = 1500;
let lastOpened = 0;

/** Opens the draft in the default email app. Returns false for a duplicate click. */
export function openEmailDraft(draft: EmailDraft): boolean {
  const now = Date.now();
  if (now - lastOpened < REOPEN_GUARD_MS) return false;
  lastOpened = now;
  window.location.href = draftToMailto(draft);
  return true;
}

/** Plain-text copy of the draft for visitors whose email app did not open. */
export const draftToText = ({ subject, body }: EmailDraft) =>
  `To: ${CONTACT.email}${NL}Subject: ${subject}${NL}${NL}${body}`;

const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

/** Optional phone check shared by the forms: blank is fine, otherwise 7–15 digits. */
export function isValidPhone(value: string) {
  const v = value.trim();
  if (!v) return true;
  const digits = v.replace(/\D/g, '').length;
  return PHONE_RE.test(v) && digits >= 7 && digits <= 15;
}
