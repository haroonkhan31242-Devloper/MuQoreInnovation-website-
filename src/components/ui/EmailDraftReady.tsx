import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, ExternalLink, MailCheck, PenLine, RotateCcw } from 'lucide-react';
import { CONTACT } from '../../config/contact';
import { EmailDraft, draftToText, openEmailDraft } from '../../services/mailtoService';

interface EmailDraftReadyProps {
  draft: EmailDraft;
  /** Back to the form with every entered value kept */
  onEdit: () => void;
  /** Clear the form and start over */
  onReset: () => void;
  resetLabel?: string;
  headingId?: string;
  reference?: string;
}

/**
 * Shown after the visitor's email app was asked to open the draft.
 * It never claims the email was sent: the visitor still has to press Send,
 * and a copy fallback covers devices with no email app set up.
 */
export const EmailDraftReady: React.FC<EmailDraftReadyProps> = ({
  draft,
  onEdit,
  onReset,
  resetLabel = 'Start a new message',
  headingId,
  reference,
}) => {
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The panel is shorter than the form it replaces, so bring its top into view
  useEffect(() => {
    const h = headingRef.current;
    if (!h) return;
    h.focus({ preventScroll: true });
    const r = h.getBoundingClientRect();
    if (r.top < 88 || r.bottom > window.innerHeight) h.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draftToText(draft));
      setCopied('done');
    } catch {
      setCopied('failed');
    }
  };

  return (
    <motion.div
      key="draft"
      role="status"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="text-center"
    >
      <span className="icon-tile mx-auto h-14 w-14 rounded-2xl">
        <MailCheck className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 id={headingId} ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-bold text-fg outline-none">
        Your email is ready to send
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-relaxed text-fg-muted">
        We opened your email app with everything you entered. Review the message and press{' '}
        <strong className="font-semibold text-fg">Send</strong> to deliver it. It has not been sent yet.
      </p>

      <dl className="mx-auto mt-7 max-w-md divide-y divide-line rounded-2xl border border-line text-left text-sm">
        <div className="flex gap-4 px-5 py-3">
          <dt className="w-16 shrink-0 text-fg-subtle">To</dt>
          <dd className="min-w-0 font-semibold text-fg [overflow-wrap:anywhere]">{CONTACT.email}</dd>
        </div>
        <div className="flex gap-4 px-5 py-3">
          <dt className="w-16 shrink-0 text-fg-subtle">Subject</dt>
          <dd className="min-w-0 font-semibold text-fg [overflow-wrap:anywhere]">{draft.subject}</dd>
        </div>
        {reference && (
          <div className="flex gap-4 px-5 py-3">
            <dt className="w-16 shrink-0 text-fg-subtle">Reference</dt>
            <dd className="font-mono font-semibold text-accent-ink">{reference}</dd>
          </div>
        )}
      </dl>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
        <button type="button" className="btn btn-primary" onClick={() => openEmailDraft(draft)}>
          Open email app again
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </button>
        <button type="button" className="btn btn-secondary" onClick={onEdit}>
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Edit details
        </button>
      </div>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-line bg-surface-2/60 p-4 text-sm leading-relaxed text-fg-muted">
        <p>
          No email app opened? Copy the message and send it to{' '}
          <span className="font-semibold text-fg [overflow-wrap:anywhere]">{CONTACT.email}</span> from any email
          account.
        </p>
        <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={copy}>
          {copied === 'done' ? (
            <Check className="h-4 w-4 text-accent-ink" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied === 'done' ? 'Message copied' : 'Copy message'}
        </button>
        <p aria-live="polite" className="mt-2 text-xs text-fg-subtle empty:hidden">
          {copied === 'failed' ? 'Copying is blocked in this browser. Please select the text in the form instead.' : ''}
        </p>
      </div>

      <button type="button" className="link-accent mt-6 text-sm" onClick={onReset}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        {resetLabel}
      </button>
    </motion.div>
  );
};
