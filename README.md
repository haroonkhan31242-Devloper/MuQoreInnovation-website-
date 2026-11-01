# MuQore Innovation website

Marketing site for MuQore Innovation: React + Vite frontend. The Contact,
Get a Quote and project inquiry forms open a pre-filled email to
muqoreinnovationsinfo@gmail.com in the visitor's own email app (`mailto:`,
see `src/services/mailtoService.ts`). The visitor reviews it and presses Send;
no email service, API key or backend is involved.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`

## Project layout

- `src/` — the React app (pages, components, data, styles)
- `src/index.css` — design tokens for the brand palette and light/dark themes
- `src/config/contact.ts` — company email and phone numbers (single source)
- `src/services/mailtoService.ts` — builds and opens the pre-filled email
- `public/assets/brand/logo-mark.jpg` — company logo (header, footer, favicon)
- `app.ts` + `mailer.ts` — optional SMTP email API (`/api/quote`, `/api/contact`);
  the forms do not call it
- `server.ts` — local server (Vite in development, `dist/` in production)
- `api/index.ts` + `vercel.json` — Vercel deployment entry point

## Deploy

Vercel builds with `npm run build` and serves `dist/`. The forms need no
environment variables. If `VITE_EMAILJS_*` variables were added to the Vercel
project earlier, they can be deleted.
