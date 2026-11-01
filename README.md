# MuQore Innovation website

Marketing site for MuQore Innovation: React + Vite frontend with a small
Express API that emails Contact and Get a Quote form submissions.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in `SMTP_USER` and `SMTP_PASS`
   (a Gmail App Password). Check them with `npm run check-setup`.
3. Start the dev server: `npm run dev`

## Project layout

- `src/` — the React app (pages, components, data, styles)
- `app.ts` — the `/api/quote` and `/api/contact` routes
- `mailer.ts` — SMTP email delivery and rate limiting
- `server.ts` — local server (Vite in development, `dist/` in production)
- `api/index.ts` + `vercel.json` — Vercel deployment entry point

## Deploy

Vercel builds with `npm run build` and serves `dist/`; `/api/*` runs the
same Express routes as a serverless function. Set `SMTP_USER`, `SMTP_PASS`
and optionally `MAIL_TO` in the Vercel project's environment variables.
