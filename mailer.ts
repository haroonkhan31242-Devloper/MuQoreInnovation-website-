import nodemailer, { type Transporter } from 'nodemailer';
import { CONTACT } from './src/config/contact.js';

/**
 * Sends form submissions to the MuQore inbox over SMTP.
 *
 * Required environment variables (see .env.example):
 *   SMTP_USER  - the Gmail address that sends the mail
 *   SMTP_PASS  - a Gmail *App Password* for that account (not the normal password)
 * Optional:
 *   SMTP_HOST / SMTP_PORT - defaults to Gmail (smtp.gmail.com:465)
 *   MAIL_TO              - inbox that receives submissions (defaults to the official email)
 */

let transporter: Transporter | null = null;

export const isMailConfigured = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

function getTransporter(): Transporter {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      // Gmail displays App Passwords in groups ("abcd efgh ..."); spaces aren't part of it
      auth: { user: process.env.SMTP_USER?.trim(), pass: process.env.SMTP_PASS?.replace(/\s+/g, '') },
    });
  }
  return transporter;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Strips line breaks so user input can't inject extra mail headers. */
const oneLine = (s: string, max = 200) => s.replace(/[\r\n]+/g, ' ').trim().slice(0, max);

export interface MailField {
  label: string;
  value: string;
}

export async function sendSubmissionEmail(opts: {
  subject: string;
  heading: string;
  replyTo: { name: string; email: string };
  fields: MailField[];
  message: { label: string; value: string };
}) {
  const fields = opts.fields.filter((f) => f.value);
  const text = [
    opts.heading,
    '',
    ...fields.map((f) => `${f.label}: ${f.value}`),
    '',
    `${opts.message.label}:`,
    opts.message.value,
  ].join('\n');

  const rows = fields
    .map(
      (f) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748b;white-space:nowrap;vertical-align:top">${escapeHtml(f.label)}</td><td style="padding:6px 0;color:#0f172a">${escapeHtml(f.value)}</td></tr>`
    )
    .join('');

  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a">
    <h2 style="margin:0 0 16px;font-size:20px">${escapeHtml(opts.heading)}</h2>
    <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px">${rows}</table>
    <p style="margin:0 0 6px;font-size:13px;color:#64748b">${escapeHtml(opts.message.label)}</p>
    <div style="white-space:pre-wrap;font-size:15px;line-height:1.6;padding:14px 16px;background:#f1f5f9;border-radius:10px">${escapeHtml(opts.message.value)}</div>
    <p style="margin-top:24px;font-size:12px;color:#94a3b8">Sent from the MuQore Innovation website. Reply to this email to answer ${escapeHtml(opts.replyTo.name)} directly.</p>
  </div>`;

  await getTransporter().sendMail({
    from: { name: 'MuQore Website', address: process.env.SMTP_USER! },
    to: process.env.MAIL_TO || CONTACT.email,
    replyTo: { name: oneLine(opts.replyTo.name, 100), address: oneLine(opts.replyTo.email, 254) },
    subject: oneLine(opts.subject),
    text,
    html,
  });
}

/**
 * Very small in-memory rate limiter: at most `limit` submissions per IP per window.
 * Resets on server restart, which is fine for a single-instance site.
 */
const hits = new Map<string, number[]>();
export function isRateLimited(ip: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > limit;
}
