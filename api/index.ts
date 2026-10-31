import { app } from '../app.js';

/**
 * Vercel serverless entry point. Vercel serves the Vite build as static
 * files; every /api/* request is rewritten here (see vercel.json) and
 * handled by the same Express routes the local server uses.
 */
export default app;
