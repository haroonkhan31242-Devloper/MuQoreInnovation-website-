/**
 * Official MuQore Innovation contact details.
 * Single source of truth for every page, the footer and the email templates.
 *
 * WhatsApp is intentionally not configured: neither number has been
 * verified as WhatsApp-enabled. Add a `whatsapp` entry here (international
 * format, digits only, e.g. "923331166607") once it is confirmed.
 */
export interface PhoneContact {
  /** Number as written locally in Pakistan */
  display: string;
  /** E.164 form used for tel: links */
  e164: string;
}

export const CONTACT = {
  email: 'muqoreinnovationsinfo@gmail.com',
  phones: [
    { display: '0333 1166607', e164: '+923331166607' },
    { display: '0327 9519595', e164: '+923279519595' },
  ] as PhoneContact[],
};

export const mailtoHref = (subject?: string) =>
  `mailto:${CONTACT.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** Email split at '@' so it can wrap there instead of mid-word */
export const emailParts = () => CONTACT.email.split('@') as [string, string];

export const telHref = (phone: PhoneContact) => `tel:${phone.e164}`;
