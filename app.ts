import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  MUQORE_SYSTEM_PROMPT,
  isRTL,
  detectLanguage,
  generateLocalGroundedAnswer,
  type ChatLanguage,
} from './src/data/chatbotKnowledge.js';
import { servicesData } from './src/data/servicesData.js';
import { isMailConfigured, isRateLimited, sendSubmissionEmail } from './mailer.js';
import { FEATURES } from './src/config/features.js';

dotenv.config();

/**
 * All /api routes. Shared by the local server (server.ts) and the Vercel
 * serverless function (api/index.ts), so both expose identical endpoints.
 * Relative imports use .js specifiers so they also resolve in plain Node ESM.
 */
export const app = express();

// Behind a hosting proxy (e.g. Cloud Run), use the visitor's IP for rate limiting
app.set('trust proxy', 1);

// Middleware for parsing JSON with generous payload limit for image uploads
app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = FEATURES.aiAssistant && apiKey ? new GoogleGenAI({ apiKey }) : null;
export const isAiConfigured = () => Boolean(ai);

// While the AI module is switched off its routes answer 404, as if absent
const AI_ROUTES = ['/api/chat', '/api/generate-image', '/api/generate-video'];
app.use((req: Request, res: Response, next) => {
  if (!FEATURES.aiAssistant && AI_ROUTES.some((r) => req.path === r || req.path.startsWith(`${r}/`))) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  next();
});

// ==========================================
// 1. Image Generation & Editing API Endpoint
// Uses gemini-nano-banana-2.1
// ==========================================
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', base64Image } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required.' });
    }

    if (!ai) {
      // Return a sleek placeholder if API key is not yet set in environment
      return res.json({
        success: true,
        imageUrl: '/assets/aistudio/WhatsApp_Image_2026-10-28_at_11.23.39_AM__1__32561e21.jpeg',
        message: 'Visual simulated using official MuQore 3D asset (Add GEMINI_API_KEY in Secrets for live generation).',
      });
    }

    let inputPayload: any = prompt;

    // Handle image editing if base64Image is provided
    if (base64Image) {
      const match = base64Image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      const mimeType = match ? match[1] : 'image/png';
      const cleanData = match ? match[2] : base64Image;

      inputPayload = [
        {
          type: 'image',
          mime_type: mimeType,
          data: cleanData,
        },
        {
          type: 'text',
          text: prompt,
        },
      ];
    }

    // Call Interactions API with gemini-nano-banana-2.1
    let interaction;
    try {
      interaction = await ai.interactions.create({
        model: 'gemini-nano-banana-2.1',
        input: inputPayload,
        response_modalities: ['image', 'text'],
        generation_config: {
          image_config: {
            aspect_ratio: aspectRatio as any,
            image_size: '1K',
          },
        },
      });
    } catch (modelError: any) {
      // Fallback to gemini-3.1-flash-lite-image if nano banana is unavailable
      console.warn('Fallback to gemini-3.1-flash-lite-image due to:', modelError.message);
      interaction = await ai.interactions.create({
        model: 'gemini-3.1-flash-lite-image',
        input: inputPayload,
        response_modalities: ['image', 'text'],
      });
    }

    let outputImageUrl = null;
    if (interaction && interaction.steps) {
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const imgContent: any = step.content?.find((c: any) => c.type === 'image');
          if (imgContent && imgContent.data) {
            const mime = imgContent.mime_type || 'image/png';
            outputImageUrl = `data:${mime};base64,${imgContent.data}`;
            break;
          }
        }
      }
    }

    if (!outputImageUrl && interaction?.output_image?.data) {
      const mime = interaction.output_image.mime_type || 'image/png';
      outputImageUrl = `data:${mime};base64,${interaction.output_image.data}`;
    }

    if (outputImageUrl) {
      return res.json({ success: true, imageUrl: outputImageUrl });
    }

    throw new Error('No image was returned by the model.');
  } catch (error: any) {
    console.error('Image Generation Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Image synthesis failed.',
    });
  }
});

// ==========================================
// 2. Video Animation API Endpoint
// Uses gemini-omni-1.1-flash via Interactions API
// ==========================================
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '16:9', base64Image } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Motion prompt is required.' });
    }

    if (!ai) {
      return res.status(400).json({
        success: false,
        message: 'GEMINI_API_KEY is required for video animation. Configure it in Secrets.',
      });
    }

    const inputParts: any[] = [];

    if (base64Image) {
      const match = base64Image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      const mimeType = match ? match[1] : 'image/png';
      const cleanData = match ? match[2] : base64Image;

      inputParts.push({
        type: 'image',
        mime_type: mimeType,
        data: cleanData,
      });
    }

    inputParts.push({
      type: 'text',
      text: prompt,
    });

    // Call gemini-omni-1.1-flash via Interactions API
    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.1-flash',
        input: inputParts,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      const mime = videoPart.mime_type || 'video/mp4';
      const videoUrl = `data:${mime};base64,${videoPart.data}`;
      return res.json({ success: true, videoUrl });
    }

    if (videoPart && (videoPart as any).uri) {
      return res.json({ success: true, videoUrl: (videoPart as any).uri });
    }

    throw new Error('Video generation finished but no video stream data was returned.');
  } catch (error: any) {
    console.error('Video Generation Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Video animation failed.',
    });
  }
});

// ==========================================
// 3. Quote Request Endpoint
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
// 4. Contact Form Endpoint
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

// ==========================================
// 5. Bilingual AI Chatbot Endpoint
// General-purpose assistant (Gemini) grounded on verified MuQore facts.
// Falls back to the local knowledge base when no API key is configured.
// ==========================================
const CHAT_MODELS = [process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash', 'gemini-flash-latest'];

type ChatFailureCode = 'invalid_key' | 'quota' | 'model_unavailable' | 'blocked' | 'empty' | 'unavailable';
interface ChatFailure {
  code: ChatFailureCode;
  status: number;
}

/** Shown to visitors; the precise provider error is logged on the server. */
const CHAT_FAILURE_MESSAGES: Record<ChatFailureCode, string> = {
  invalid_key: 'The AI service rejected this website’s API key, so it can’t answer right now. Please contact us directly.',
  quota: 'The AI service has reached its usage limit for now. Please try again in a minute.',
  model_unavailable: 'The configured AI model is not available. Please contact us directly.',
  blocked: 'The AI service declined to answer that message. Please try rephrasing it.',
  empty: 'The AI service returned an empty answer. Please try again.',
  unavailable: 'The AI service is temporarily unreachable. Please try again shortly.',
};

function classifyGeminiError(err: any): ChatFailure {
  const status = Number(err?.status) || 0;
  const msg = String(err?.message || '');
  if (status === 400 && /api[_ ]?key|API_KEY_INVALID/i.test(msg)) return { code: 'invalid_key', status: 503 };
  if (status === 401 || status === 403) return { code: 'invalid_key', status: 503 };
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(msg)) return { code: 'quota', status: 429 };
  if (status === 404 || /not found|not supported/i.test(msg)) return { code: 'model_unavailable', status: 503 };
  return { code: 'unavailable', status: 503 };
}

app.get('/api/chat/status', (_req: Request, res: Response) => {
  res.json({ live: Boolean(ai) });
});

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], language } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A message string is required.',
      });
    }

    const cleanMessage = message.trim().slice(0, 2000);
    const previousLanguage: ChatLanguage = ['urdu', 'roman_urdu', 'english'].includes(language) ? language : 'english';

    // Only well-formed turns are forwarded to the model
    const safeHistory = (Array.isArray(history) ? history : [])
      .filter((h: any) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
      .slice(-12)
      .map((h: any) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: String(h.content).slice(0, 2000) }],
      }));

    // Gemini requires the conversation to start with a user turn
    while (safeHistory.length && safeHistory[0].role !== 'user') safeHistory.shift();

    // No API key: answer company questions from verified data and be explicit
    // that general questions need the live AI connection.
    if (!ai) {
      const fallback = generateLocalGroundedAnswer(cleanMessage, previousLanguage);
      return res.json({
        success: true,
        reply: fallback.reply,
        isRTL: fallback.isRTL,
        language: fallback.language,
        provider: 'muqore-knowledge-base',
        reason: 'not_configured',
      });
    }

    let lastFailure: ChatFailure = { code: 'unavailable', status: 503 };
    for (const model of CHAT_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [...safeHistory, { role: 'user', parts: [{ text: cleanMessage }] }],
          config: {
            systemInstruction: MUQORE_SYSTEM_PROMPT,
            temperature: 0.6,
            // Room for full answers; 2.5 models otherwise spend the budget on hidden "thinking"
            maxOutputTokens: 2048,
            ...(model.includes('2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          },
        });

        const replyText = response?.text?.trim();
        if (replyText) {
          return res.json({
            success: true,
            reply: replyText,
            isRTL: isRTL(replyText),
            language: detectLanguage(cleanMessage, previousLanguage),
            provider: 'gemini-live',
          });
        }
        const blocked = response?.promptFeedback?.blockReason || response?.candidates?.[0]?.finishReason;
        console.warn(`[AI CHAT] Gemini model "${model}" returned no text (${blocked || 'empty'})`);
        lastFailure = { code: blocked === 'SAFETY' || blocked ? 'blocked' : 'empty', status: 502 };
        if (lastFailure.code === 'blocked') break;
      } catch (geminiError: any) {
        lastFailure = classifyGeminiError(geminiError);
        console.warn(`[AI CHAT] Gemini model "${model}" failed (${lastFailure.code}):`, geminiError?.status || '', geminiError?.message || geminiError);
        // Only a missing/unsupported model is worth retrying with the next model
        if (lastFailure.code !== 'model_unavailable') break;
      }
    }

    return res.status(lastFailure.status).json({
      success: false,
      code: lastFailure.code,
      message: CHAT_FAILURE_MESSAGES[lastFailure.code],
    });
  } catch (error: any) {
    console.error('[AI CHAT ERROR]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate chat response. Please try again.',
    });
  }
});
