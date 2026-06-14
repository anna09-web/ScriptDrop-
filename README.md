# ScriptDrop

A UGC video script generator for TikTok, Instagram Reels, and YouTube Shorts.
Paste a product, pick a hook, get 3 ready-to-film scripts in seconds. Monetized
with one-time credit packs (no subscriptions).

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Express (Node) — a thin, secure proxy to Anthropic, Supabase, and Stripe
- **Auth + DB:** Supabase (Postgres)
- **AI:** Anthropic Claude (`claude-sonnet-4-6`)
- **Payments:** Stripe Checkout (one-time)

## Architecture

```
Browser (React, anon key)
   │  Supabase JWT in Authorization header
   ▼
Express API  ──►  Anthropic   (ANTHROPIC_API_KEY lives ONLY here)
   │         ──►  Supabase     (service role key lives ONLY here)
   └─────────►  Stripe        (secret key lives ONLY here)
```

The Anthropic API key, Supabase service role key, and Stripe secret key never
reach the browser. The frontend only ever holds the Supabase anon key and the
Stripe publishable key.

## Repository layout

```
backend/    Express API (generate, checkout, webhook, me)
frontend/   React app (landing, auth, generator, pricing, history, settings, legal)
supabase/   schema.sql — tables, RLS policies, RPCs, signup trigger
```

## Setup

### 1. Supabase

1. Create a Supabase project.
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). This
   creates the `profiles`, `generations`, and `orders` tables, enables RLS,
   adds the `deduct_credit`, `add_credits`, and `fulfill_order` RPCs, and adds a
   trigger that creates a profile (with 2 free credits) on signup.
3. (Optional) Enable the Google OAuth provider under Authentication → Providers.

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in the values
npm install
npm run dev            # http://localhost:3001
```

Backend environment variables (`backend/.env`):

| Variable | Description |
| --- | --- |
| `ANTHROPIC_API_KEY` | Anthropic API key. Server-only. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key. Server-only. |
| `STRIPE_SECRET_KEY` | Stripe secret key. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret. |
| `FRONTEND_URL` | Allowed CORS origin / redirect base (e.g. `http://localhost:5173`). |
| `PORT` | API port (default `3001`). |

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # fill in the values
npm install
npm run dev            # http://localhost:5173
```

Frontend environment variables (`frontend/.env`):

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key. |
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:3001`). |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key. |

### 4. Stripe webhook (local)

Forward webhook events to the backend and copy the signing secret into
`STRIPE_WEBHOOK_SECRET`:

```bash
stripe listen --forward-to localhost:3001/api/webhook
```

## API

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/me` | JWT | Profile (email, credits, total generations). |
| `POST` | `/api/generate` | JWT | Deduct 1 credit, generate 3 scripts, save them. Rate limited to 10/min/user. |
| `POST` | `/api/checkout` | JWT | Create a Stripe Checkout session for a credit pack. |
| `POST` | `/api/webhook` | Stripe signature | Grant credits on `checkout.session.completed` (atomic, idempotent). |

## Security notes

- All generation/checkout endpoints verify the Supabase JWT server-side before
  doing anything.
- `/api/generate` is rate limited to 10 requests per user per minute.
- User input is sanitized and validated server-side before reaching the prompt.
- The Stripe webhook verifies the signature against the **raw** body
  (`express.raw`) mounted before the JSON parser.
- Credit deduction and order fulfillment are atomic Postgres RPCs; fulfillment
  is idempotent on the unique Stripe session id, so retried webhooks can't
  double-grant credits.
- CORS is locked to `FRONTEND_URL`; `helmet` sets security headers.
- RLS is enabled on every table; users can only read their own rows.

## Pricing

| Pack | Credits | Price |
| --- | --- | --- |
| Starter | 5 | $15 |
| Creator | 15 | $29 |
| Pro | 40 | $59 |

One credit = one generation = three scripts. New users get 2 free credits.
Credits never expire. Pack amounts are defined server-side in
`backend/src/lib/packs.ts` (the source of truth for charges); the frontend
display prices in `frontend/src/lib/packs.ts` must be kept in sync.

## Free creator toolkit (no API key, no credits)

Alongside the metered AI script generator, the `/app` page includes four
fully client-side tools that cost nothing to serve and never touch the
Anthropic API:

- **Hook Analyzer** — heuristic 0–100 score for a hook with actionable fixes.
- **Hashtag Generator** — broad / niche / long-tail tag mix per platform.
- **Idea Spinner** — ten content angles for any product from template banks.
- **Best Time to Post** — general engagement windows by day and platform.

All four live in `frontend/src/lib/toolkit.ts` (pure functions) and
`frontend/src/components/tools/`.

## Deployment

- **Frontend** → Vercel (static build: `npm run build`, output `dist/`).
- **Backend** → Railway or Render (`npm run build` then `npm start`).
- Set the environment variables above in each platform.
- Point your Stripe webhook at `https://<backend-domain>/api/webhook`.
- Set `FRONTEND_URL` to your deployed frontend origin so CORS and redirects work.
```
