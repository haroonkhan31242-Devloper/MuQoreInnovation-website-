import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { servicesData } from './src/data/servicesData.js';
import { isMailConfigured, isRateLimited, sendSubmissionEmail } from './mailer.js';

dotenv.config();

/**
 * All /api routes. Shared by the local server (server.ts) and the Vercel
 * serverless function (api/index.ts), so both expose identical endpoints.
 * Relative imports use .js specifiers so they also resolve in plain Node ESM.
 */
export const app = express();

// Behind a hosting proxy (e.g. Cloud Run), use the visitor's IP for rate limiting
app.set('trust proxy', 1);

// The forms only send short text fields
app.use(express.json({ limit: '100kb' }));

// ==========================================
// 1. Quote Request Endpoint
// ==========================================
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Shared guard for form endpoints. Returns true if the request was already
 * answered (spam trap, rate limit or missing mail configuration).
 */
function rejectFormRequest(req: Request, res: Response): boolean {
  // Honeypot: real visitors never see or fill the "website" field
  if (str(req.body?.website, 200)) {
    res.json({ success: true, message: 'Received.' });
    return true;
  }
  if (isRateLimited(req.ip || 'unknown')) {
    res.status(429).json({ success: false, message: 'Too many submissions. Please wait a few minutes and try again.' });
    return true;
  }
  if (!isMailConfigured()) {
    console.error('[FORMS] SMTP_USER / SMTP_PASS are not set, so form submissions cannot be emailed. See .env.example.');
    res.status(503).json({ success: false, message: 'Email delivery is not configured on the server.' });
    return true;
  }
  return false;
}

app.post('/api/quote', async (req: Request, res: Response) => {
  const name = str(req.body.name, 120);
  const email = str(req.body.email, 254);
  const company = str(req.body.company, 160);
  const phone = str(req.body.phone, 40);
  const serviceSlug = str(req.body.serviceSlug, 80);
  const budgetRange = str(req.body.budgetRange, 60);
  const timeline = str(req.body.timeline, 60);
  const projectDescription = str(req.body.projectDescription, 5000);
  const featuresNeeded = (Array.isArray(req.body.featuresNeeded) ? req.body.featuresNeeded : [])
    .filter((f: unknown) => typeof f === 'string')
    .slice(0, 20)
    .map((f: string) => f.slice(0, 120));

  if (!name || !EMAIL_RE.test(email) || !projectDescription) {
    return res.status(400).json({ success: false, message: 'Name, a valid email, and project description are required.' });
  }
  if (rejectFormRequest(req, res)) return;

  const clientRef = str(req.body.referenceId, 20);
  const referenceId = /^MQ-\d{6}$/.test(clientRef) ? clientRef : `MQ-${Math.floor(100000 + Math.random() * 900000)}`;
  const serviceTitle = servicesData.find((s) => s.slug === serviceSlug)?.title || serviceSlug;

  try {
    await sendSubmissionEmail({
      subject: `Quote request ${referenceId}: ${serviceTitle} from ${name}`,
      heading: `New quote request (${referenceId})`,
      replyTo: { name, email },
      fields: [
        { label: 'Name', value: name },
        { label: 'Email', value: email },
        { label: 'Phone', value: phone },
        { label: 'Company', value: company },
        { label: 'Service', value: serviceTitle },
        { label: 'Budget', value: budgetRange },
        { label: 'Timeline', value: timeline },
        { label: 'Features', value: featuresNeeded.join(', ') },
      ],
      message: { label: 'Project description', value: projectDescription },
    });
    console.log(`[QUOTE EMAILED] ${referenceId} | ${name} <${email}> | ${serviceTitle}`);
    return res.json({ success: true, referenceId, message: 'Quote request received.' });
  } catch (err: any) {
    console.error('[QUOTE EMAIL FAILED]', err?.message || err);
    return res.status(502).json({ success: false, message: 'Your request could not be sent. Please try again or email us directly.' });
  }
});

// ==========================================
// 2. Contact Form Endpoint
// ==========================================
app.post('/api/contact', async (req: Request, res: Response) => {
  const name = str(req.body.name, 120);
  const email = str(req.body.email, 254);
  const phone = str(req.body.phone, 40);
  const subject = str(req.body.subject, 120) || 'General Inquiry';
  const message = str(req.body.message, 5000);

  if (!name || !EMAIL_RE.test(email) || !message) {
    return res.status(400).json({ success: false, message: 'Name, a valid email, and message are required.' });
  }
  if (rejectFormRequest(req, res)) return;

  try {
    await sendSubmissionEmail({
      subject: `Website inquiry: ${subject} from ${name}`,
      heading: 'New message from the contact form',
      replyTo: { name, email },
      fields: [
        { label: 'Name', value: name },
        { label: 'Email', value: email },
        { label: 'Phone', value: phone },
        { label: 'Topic', value: subject },
      ],
      message: { label: 'Message', value: message },
    });
    console.log(`[CONTACT EMAILED] ${name} <${email}> | ${subject}`);
    return res.json({ success: true, message: 'Inquiry received.' });
  } catch (err: any) {
    console.error('[CONTACT EMAIL FAILED]', err?.message || err);
    return res.status(502).json({ success: false, message: 'Your message could not be sent. Please try again or email us directly.' });
  }
});
