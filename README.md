# MuQore Innovation website

Marketing site for MuQore Innovation: React + Vite frontend. The Contact,
Get a Quote and project inquiry forms are emailed through EmailJS
(`src/services/emailService.ts`).

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in the three `VITE_EMAILJS_*`
   values from the EmailJS dashboard.
3. Start the dev server: `npm run dev`

## Project layout

- `src/` — the React app (pages, components, data, styles)
- `src/index.css` — design tokens for the brand palette and light/dark themes
- `src/services/emailService.ts` — EmailJS sending, template variables, cooldown
- `app.ts` + `mailer.ts` — optional SMTP email API (`/api/quote`, `/api/contact`);
  the forms no longer call it
- `server.ts` — local server (Vite in development, `dist/` in production)
- `api/index.ts` + `vercel.json` — Vercel deployment entry point

## Deploy

Vercel builds with `npm run build` and serves `dist/`. Set
`VITE_EMAILJS_PUBLIC_KEY`, `VITE_EMAILJS_SERVICE_ID` and
`VITE_EMAILJS_TEMPLATE_ID` in the Vercel project's environment variables,
then redeploy: Vite bakes them into the build.
