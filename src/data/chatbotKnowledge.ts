/**
 * Knowledge base, system prompt and offline fallback for the MuQore AI assistant.
 * Company facts are derived from the same data files the website renders,
 * so the assistant never drifts from what the site actually says.
 */
import { servicesData } from './servicesData';
import { websitePricingPlans } from './pricingData';
import { leadershipData } from './leadershipData';
import { CONTACT } from '../config/contact';

export type ChatLanguage = 'urdu' | 'roman_urdu' | 'english';

const phonesText = CONTACT.phones.map((p) => p.display).join(' or ');
const phonesTextUrdu = CONTACT.phones.map((p) => p.display).join(' یا ');

const servicesText = servicesData
  .map((s, i) => `${i + 1}. ${s.title} (/services/${s.slug}): ${s.shortDescription}`)
  .join('\n');

const pricingText = websitePricingPlans
  .map((p) =>
    p.isCustomQuote
      ? `- ${p.name}: custom quote based on scope (${p.idealFor}).`
      : `- ${p.name}: PKR ${p.minPKR.toLocaleString('en-US')} – ${p.maxPKR.toLocaleString('en-US')} (${p.idealFor}).`
  )
  .join('\n');

const leadershipText = leadershipData.map((l) => `- ${l.name}: ${l.designation}`).join('\n');

export const MUQORE_SYSTEM_PROMPT = `
You are "MuQore AI", the assistant on the MuQore Innovation website (tagline: Ideas • Code • Solutions).

## Your role
You are a helpful, general-purpose assistant. Answer ANY reasonable question a visitor asks: general knowledge,
technology concepts (AI, web development, automation, cloud, databases, etc.), comparisons, explanations and advice.
Do not refuse a question just because it is not about MuQore. When a question relates to software, apps, websites,
AI or automation, you may briefly mention how MuQore Innovation can help, but only when it is genuinely relevant and
never more than one short sentence.
Decline only harmful, illegal or clearly inappropriate requests, politely.

## Verified MuQore Innovation information (use ONLY these facts about the company)
Services:
${servicesText}

Indicative pricing (Pakistan reference, PKR):
${pricingText}
Other currencies on the website are approximate conversions. Final prices always depend on confirmed scope;
direct people to the quote form at /get-a-quote.

Leadership:
${leadershipText}

Official contact details:
- Email: ${CONTACT.email}
- Phone: ${phonesText}
- Contact page: /contact
- Quote request form: /get-a-quote
WhatsApp is not listed as an official channel. Do not provide any other address, phone number, email, office
location, social account or website URL.

Delivery process: Discovery → Architecture & prototype → Agile delivery in sprints → QA & security → Launch & support.
Portfolio projects shown on the website are labelled as demonstration projects.

## Accuracy rules
- Never invent company facts: no made-up prices, discounts, clients, awards, team size, office locations,
  guarantees, response times or deadlines. If you don't know a company detail, say so and suggest ${CONTACT.email}
  or the /contact page.
- Never claim you have sent an email, booked a meeting or submitted a form. You cannot take actions.
- For general knowledge, be accurate. If unsure, say so instead of guessing.

## Language rules (very important)
- Reply in the language the visitor used in their latest message:
  * English → English.
  * Urdu script (اردو) → fluent, natural Urdu in Urdu script.
  * Roman Urdu (Urdu written in Latin letters, e.g. "website banwani hai kitna kharcha hoga?") → reply in natural
    Roman Urdu.
- Keep using the conversation's language until the visitor switches.
- Technical terms (e.g. API, React, database) may stay in English inside Urdu replies.

## Style
- Friendly, professional and concise. Prefer short paragraphs and bullet lists. Aim for under 180 words unless the
  visitor asks for detail.
- Use simple Markdown only: **bold**, bullet lists ("- "), numbered lists ("1. ") and links like [Get a Quote](/get-a-quote).
  No tables, headings or code fences unless the visitor asks for code.
`.trim();

/** Checks whether text contains Urdu/Arabic-script characters. */
export function isRTL(text: string): boolean {
  if (!text) return false;
  return /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text);
}

// Words that are common in Roman Urdu but rare in English
const ROMAN_URDU_WORDS = [
  'kya', 'kia', 'hai', 'hain', 'hy', 'kaise', 'kese', 'kaisay', 'karna', 'karein', 'karen', 'kare', 'krna', 'mujhe',
  'mujhay', 'mein', 'main', 'hum', 'aap', 'ap', 'apka', 'apki', 'konsi', 'kaunsi', 'kitna', 'kitni', 'kitne', 'paisa',
  'paise', 'bhi', 'aur', 'chahiye', 'chahta', 'chahti', 'bana', 'banwani', 'banana', 'skte', 'sakte', 'sakta', 'hoga',
  'hogi', 'shukriya', 'assalam', 'salam', 'walaikum', 'batao', 'bataiye', 'btao', 'rabta', 'kab', 'kyun', 'kyu', 'nahi',
  'nhi', 'ka', 'ki', 'ke', 'ko', 'se', 'wala', 'wali', 'dena', 'dein', 'lena', 'ye', 'yeh', 'wo', 'woh', 'kaam', 'kharcha',
];
const ROMAN_URDU_STRONG = new Set(['kya', 'kia', 'hai', 'hain', 'mujhe', 'aap', 'chahiye', 'kitna', 'kitni', 'batao', 'bataiye', 'kaise', 'nahi', 'shukriya', 'assalam']);

/** Detects English, Urdu script or Roman Urdu. */
export function detectLanguage(text: string, previous: ChatLanguage = 'english'): ChatLanguage {
  if (!text) return previous;
  if (isRTL(text)) return 'urdu';
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  if (words.length === 0) return previous;
  let score = 0;
  for (const w of words) {
    if (ROMAN_URDU_STRONG.has(w)) score += 2;
    else if (ROMAN_URDU_WORDS.includes(w)) score += 1;
  }
  if (score >= 2) return 'roman_urdu';
  // Very short follow-ups ("ok", "thanks") keep the conversation's language
  if (words.length <= 2 && previous !== 'english') return previous;
  return 'english';
}

type Intent = 'thanks' | 'greeting' | 'services' | 'pricing' | 'mobile' | 'ai' | 'contact' | 'start' | 'leadership' | 'unknown';

const INTENT_KEYWORDS: [Intent, RegExp][] = [
  ['contact', /contact|email|e-mail|phone|number|call|rabta|raabta|nambar|فون|رابطہ|ای میل|نمبر/],
  ['pricing', /price|pricing|cost|how much|rate|budget|charges|paisa|paise|kitna|kitni|kharcha|fees?|قیمت|پیسے|ریٹ|خرچ|کتنے/],
  ['leadership', /leader|founder|ceo|owner|team|who runs|malik|بانی|ٹیم/],
  ['mobile', /mobile|android|ios|iphone|app\b|apps\b|موبائل|ایپ/],
  ['ai', /\bai\b|automation|llm|chatbot|machine learning|آٹومیشن|اے آئی/],
  ['start', /quote|start|hire|begin|process|project shuru|proposal|کوٹیشن|شروع/],
  ['services', /service|what do you do|offer|capabilit|kya karte|kaam|سروس|خدمات|کیا کرتے/],
  ['greeting', /^(hi|hello|hey|salam|assalam|aoa|السلام|سلام)\b/],
  ['thanks', /thank|shukri|jazak|شکریہ|مہربانی/],
];

// "What is AI?" / "Explain machine learning" are general questions, not requests
// for MuQore's AI services, unless the visitor refers to the company.
const GENERAL_QUESTION = /^(what|what's|whats|explain|how|why|define|describe|tell me about|difference|compare|can you explain|kya hai|kya hota|samjhao|batao .* kya)\b|\b(kya hai|kya hota hai|kya farq|matlab kya)\b|کیا ہے|کیا ہوتا|فرق/;
const ABOUT_COMPANY = /muqore|\byou\b|\byour\b|\bu\b|\baap\b|\bap\b|apki|aap ki|company|hire|quote|price|pricing|cost|contact|services?\b|offer|آپ|کمپنی|سروس|قیمت|رابطہ/;

function detectIntent(q: string): Intent {
  if (GENERAL_QUESTION.test(q) && !ABOUT_COMPANY.test(q)) return 'unknown';
  for (const [intent, re] of INTENT_KEYWORDS) if (re.test(q)) return intent;
  return 'unknown';
}

const servicesList = servicesData.map((s, i) => `${i + 1}. **${s.title}**`).join('\n');
const basic = websitePricingPlans.find((p) => p.id === 'basic-website');
const advanced = websitePricingPlans.find((p) => p.id === 'advanced-website');
const fmt = (n?: number) => (n ?? 0).toLocaleString('en-US');

const ANSWERS: Record<ChatLanguage, Record<Intent, string>> = {
  english: {
    thanks: `You're welcome! Let me know if there's anything else I can help with.`,
    greeting: `Hello! I'm the MuQore Innovation assistant. Ask me about our services, pricing or how to start a project.`,
    services: `MuQore Innovation offers 8 services:\n${servicesList}\n\nSee details on the [Services page](/services).`,
    pricing: `Indicative website pricing in Pakistan:\n- **Basic Website:** PKR ${fmt(basic?.minPKR)} – ${fmt(basic?.maxPKR)}\n- **Advanced Website:** PKR ${fmt(advanced?.minPKR)} – ${fmt(advanced?.maxPKR)}\n- **Mobile, desktop, AI and backend projects:** custom quote\n\nFinal pricing depends on your scope. [Request a quote](/get-a-quote).`,
    mobile: `Yes. We build mobile applications for both **Android and iOS**, from UI design to App Store and Google Play release. [Learn more](/services/mobile-applications).`,
    ai: `We offer **AI Automation** (document processing, workflow automation) and **AI Solutions** (custom assistants, retrieval-augmented search, LLM integration). See [AI Automation](/services/ai-automation) and [AI Solutions](/services/ai-solutions).`,
    contact: `You can reach MuQore Innovation at:\n- **Email:** ${CONTACT.email}\n- **Phone:** ${phonesText}\n\nOr use the [Contact page](/contact).`,
    start: `To start a project, fill in the [Get a Quote form](/get-a-quote) with your goals, budget and timeline, or email ${CONTACT.email}. We'll follow up to discuss your requirements.`,
    leadership: `MuQore Innovation is led by:\n${leadershipText}`,
    unknown: `I can't answer general questions right now: the live AI service isn't connected on this website yet, so I only have MuQore Innovation's saved information (services, pricing, contact and how to start a project).

For anything else, email ${CONTACT.email} or call ${phonesText}.`,
  },
  roman_urdu: {
    thanks: `Aap ka bhi shukriya! Koi aur sawal ho to zaroor poochiye.`,
    greeting: `Assalam-o-Alaikum! Main MuQore Innovation ka assistant hoon. Aap hamari services, pricing ya project shuru karne ke baare mein pooch sakte hain.`,
    services: `MuQore Innovation yeh 8 services deta hai:\n${servicesList}\n\nTafseel ke liye [Services page](/services) dekhein.`,
    pricing: `Pakistan mein website ki andazan pricing:\n- **Basic Website:** PKR ${fmt(basic?.minPKR)} – ${fmt(basic?.maxPKR)}\n- **Advanced Website:** PKR ${fmt(advanced?.minPKR)} – ${fmt(advanced?.maxPKR)}\n- **Mobile, desktop, AI aur backend:** project ke mutabiq quote\n\nFinal qeemat aap ki requirements par depend karti hai. [Quote request karein](/get-a-quote).`,
    mobile: `Ji haan! Hum **Android aur iOS** dono ke liye mobile apps banate hain, design se le kar App Store aur Play Store tak. [Mazeed dekhein](/services/mobile-applications).`,
    ai: `Hum **AI Automation** (documents aur workflows ko automate karna) aur **AI Solutions** (custom assistants, smart search, LLM integration) dete hain. [AI Automation](/services/ai-automation) dekhein.`,
    contact: `MuQore Innovation se rabta:\n- **Email:** ${CONTACT.email}\n- **Phone:** ${phonesText}\n\nYa [Contact page](/contact) istemal karein.`,
    start: `Project shuru karne ke liye [Get a Quote form](/get-a-quote) mein apni requirements, budget aur timeline likhein, ya ${CONTACT.email} par email karein.`,
    leadership: `MuQore Innovation ki leadership:\n${leadershipText}`,
    unknown: `Maazrat, abhi main general sawalon ka jawab nahi de sakta: is website par live AI service abhi connect nahi hai, is liye mere paas sirf MuQore Innovation ki saved maloomat hai (services, pricing, rabta).

Mazeed ke liye ${CONTACT.email} par email karein ya ${phonesText} par call karein.`,
  },
  urdu: {
    thanks: `آپ کا بھی شکریہ! کوئی اور سوال ہو تو ضرور پوچھیں۔`,
    greeting: `السلام علیکم! میں MuQore Innovation کا اسسٹنٹ ہوں۔ آپ ہماری سروسز، قیمتوں یا پروجیکٹ شروع کرنے کے بارے میں پوچھ سکتے ہیں۔`,
    services: `MuQore Innovation یہ 8 سروسز فراہم کرتا ہے:\n${servicesData.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}\n\nتفصیل کے لیے [Services](/services) صفحہ دیکھیں۔`,
    pricing: `پاکستان میں ویب سائٹ کی تخمینی قیمتیں:\n- **Basic Website:** ${fmt(basic?.minPKR)} سے ${fmt(basic?.maxPKR)} روپے\n- **Advanced Website:** ${fmt(advanced?.minPKR)} سے ${fmt(advanced?.maxPKR)} روپے\n- **موبائل، ڈیسک ٹاپ، اے آئی اور بیک اینڈ:** پروجیکٹ کے مطابق کوٹیشن\n\nحتمی قیمت آپ کی ضروریات پر منحصر ہے۔ [کوٹیشن حاصل کریں](/get-a-quote)۔`,
    mobile: `جی ہاں! ہم **Android اور iOS** دونوں کے لیے موبائل ایپس بناتے ہیں، ڈیزائن سے لے کر App Store اور Play Store تک۔`,
    ai: `ہم **AI Automation** (دستاویزات اور ورک فلو کی آٹومیشن) اور **AI Solutions** (کسٹم اسسٹنٹس، اسمارٹ سرچ) فراہم کرتے ہیں۔`,
    contact: `MuQore Innovation سے رابطہ:\n- **ای میل:** ${CONTACT.email}\n- **فون:** ${phonesTextUrdu}\n\nیا [Contact](/contact) صفحہ استعمال کریں۔`,
    start: `پروجیکٹ شروع کرنے کے لیے [Get a Quote](/get-a-quote) فارم میں اپنی ضروریات، بجٹ اور ٹائم لائن لکھیں، یا ${CONTACT.email} پر ای میل کریں۔`,
    leadership: `MuQore Innovation کی قیادت:\n${leadershipText}`,
    unknown: `معذرت، ابھی میں عام سوالات کا جواب نہیں دے سکتا: اس ویب سائٹ پر لائیو اے آئی سروس ابھی منسلک نہیں ہے، اس لیے میرے پاس صرف MuQore Innovation کی محفوظ معلومات ہیں (سروسز، قیمتیں، رابطہ)۔

مزید معلومات کے لیے ${CONTACT.email} پر ای میل کریں یا ${phonesTextUrdu} پر کال کریں۔`,
  },
};

/**
 * Offline fallback used only when the live AI model is not configured or fails.
 * It answers company questions from verified data and is explicit that general
 * questions need the live model, rather than pretending to know the answer.
 */
export function generateLocalGroundedAnswer(
  userQuery: string,
  previous: ChatLanguage = 'english'
): { reply: string; isRTL: boolean; language: ChatLanguage } {
  const language = detectLanguage(userQuery, previous);
  const intent = detectIntent(userQuery.toLowerCase().trim());
  const reply = ANSWERS[language][intent];
  return { reply, isRTL: language === 'urdu', language };
}
