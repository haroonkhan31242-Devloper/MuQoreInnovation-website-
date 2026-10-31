/**
 * Verifies the live services the website depends on, without printing secrets.
 *   npm run check-setup
 *
 * 1. Gemini AI (chatbot): sends one tiny test prompt with GEMINI_API_KEY.
 * 2. Email (contact + quote forms): logs in to the SMTP server; no email is sent.
 */
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import nodemailer from 'nodemailer';

dotenv.config();

const ok = (msg: string) => console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
const fail = (msg: string, fix: string) => {
  console.log(`  \x1b[31m✘\x1b[0m ${msg}`);
  console.log(`    \x1b[33m→ ${fix}\x1b[0m`);
};

async function checkGemini(): Promise<boolean> {
  console.log('\nAI chatbot (Gemini)');
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (/paste|your|MY_GEMINI/i.test(key)) {
    fail('GEMINI_API_KEY still contains the example text, not a real key', 'Replace it with the key copied from https://aistudio.google.com/apikey (it usually starts with "AIza")');
    return false;
  }
  if (!key) {
    fail('GEMINI_API_KEY is empty in .env', 'Create a free key at https://aistudio.google.com/apikey and paste it between the quotes: GEMINI_API_KEY="..."');
    return false;
  }
  ok(`GEMINI_API_KEY found (${key.length} characters)`);

  const model = process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash';
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const res = await ai.models.generateContent({
      model,
      contents: 'Reply with exactly: OK',
      config: { maxOutputTokens: 20, ...(model.includes('2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
    });
    if (res.text?.trim()) {
      ok(`Gemini replied using model "${model}". The chatbot can answer general questions.`);
      return true;
    }
    fail(`Gemini returned an empty reply (model "${model}")`, 'Try again in a minute; if it persists, set GEMINI_CHAT_MODEL="gemini-flash-latest" in .env');
  } catch (err: any) {
    const status = err?.status;
    const msg = String(err?.message || err);
    if (/API key not valid|API_KEY_INVALID/i.test(msg)) fail('Google rejected the API key', 'Copy the key again from https://aistudio.google.com/apikey (no spaces), or create a new one');
    else if (status === 429 || /quota|RESOURCE_EXHAUSTED/i.test(msg)) fail('The key works but its usage limit is reached', 'Wait a minute and run this check again, or review limits in Google AI Studio');
    else if (status === 404) fail(`Model "${model}" is not available for this key`, 'Set GEMINI_CHAT_MODEL="gemini-flash-latest" in .env');
    else fail(`Could not reach Gemini (${status || 'network error'})`, 'Check the internet connection and try again');
  }
  return false;
}

async function checkEmail(): Promise<boolean> {
  console.log('\nEmail for contact and quote forms (SMTP)');
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  if (/your-|paste|example/i.test(user) || /paste|your-/i.test(pass)) {
    fail('SMTP_USER / SMTP_PASS still contain the example text', 'Use your real Gmail address and the 16-letter App Password from https://myaccount.google.com/apppasswords');
    return false;
  }
  if (!user || !pass) {
    fail('SMTP_USER / SMTP_PASS are not set in .env', 'Add the sending Gmail address and a 16-character App Password from https://myaccount.google.com/apppasswords');
    return false;
  }
  ok(`SMTP_USER is ${user}; SMTP_PASS found (${pass.length} characters)`);

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  try {
    await transporter.verify();
    ok(`Logged in to the mail server. Form submissions will be sent to ${process.env.MAIL_TO || 'muqoreinnovationsinfo@gmail.com'}.`);
    return true;
  } catch (err: any) {
    const msg = String(err?.message || err);
    if (/535|Username and Password not accepted|BadCredentials/i.test(msg))
      fail('Gmail rejected the login', 'Use an App Password (not your normal password), with 2-Step Verification turned on for that Gmail account');
    else fail(`Could not connect to the mail server: ${msg.slice(0, 120)}`, 'Check the internet connection, SMTP_HOST and SMTP_PORT');
    return false;
  }
}

const ai = await checkGemini();
const mail = await checkEmail();
console.log(`\n${ai && mail ? '\x1b[32mAll set.' : '\x1b[33mSome settings still need attention.'}\x1b[0m Restart the server (npm run dev) after changing .env.\n`);
process.exit(ai && mail ? 0 : 1);
