/**
 * Feature switches shared by the frontend and the API (app.ts).
 *
 * aiAssistant: the multilingual AI chatbot, its "Ask AI" entry points and
 * the Gemini-backed /api/chat, /api/generate-image and /api/generate-video
 * routes. Temporarily off; set to true to bring the whole module back.
 */
export const FEATURES = {
  aiAssistant: false,
} as const;
