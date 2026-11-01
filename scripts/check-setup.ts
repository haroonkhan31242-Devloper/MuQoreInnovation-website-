/**
 * Verifies the email setup for the contact and quote forms, without printing
 * secrets. Logs in to the SMTP server; no email is sent.
 *   npm run check-setup
 */
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const ok = (msg: string) => console.log(`  \x1b[32m✔\x1b[0m ${msg}`);
const fail = (msg: string, fix: string) => {
  console.log(`  \x1b[31m✘\x1b[0m ${msg}`);
  console.log(`    \x1b[33m→ ${fix}\x1b[0m`);
};

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

const mail = await checkEmail();
console.log(`\n${mail ? '\x1b[32mAll set.' : '\x1b[33mSome settings still need attention.'}\x1b[0m Restart the server (npm run dev) after changing .env.\n`);
process.exit(mail ? 0 : 1);
