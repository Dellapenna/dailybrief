# RDP 2.0

> Build the man. Lead the life.

A personal intelligence and life-management platform — daily briefing, life
operating system, goal/habit system, and decision-support tool, organized
around six life pillars: Body, Mind, Family, Career, Builder, Life.

This is a **single-user, private instance** gated by Netlify Password
Protection — there's no in-app login. See "Access control" below.

Full product vision: [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md).
Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
Database design: [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md).
Build sequence: [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md).
External integrations: [`docs/INTEGRATIONS.md`](docs/INTEGRATIONS.md).

## Status

**Phase 1 — Foundation.** Routing, folder structure, build/deploy config,
design tokens, real nav chrome, and the database schema are in place. No
Supabase project is connected yet. See `docs/BUILD_PLAN.md` for what's next.

## Stack

React + TypeScript + Vite, Tailwind CSS v4, React Router, Supabase
(Postgres only — no Supabase Auth), Netlify (hosting + Functions +
Password Protection).

## Access control

No sign-up/sign-in flow. The whole site sits behind Netlify's site-wide
password (Netlify dashboard → Site configuration → Visitor access — a paid
plan feature). See `docs/INTEGRATIONS.md` for setup steps.

The browser never holds a Supabase key. All data reads/writes go through
`/api/*` Netlify Functions using the service-role key, scoped to one fixed
`PRIMARY_USER_ID`. See `docs/ARCHITECTURE.md` → "Access control model".

## Local development

```bash
npm install
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY once a Supabase
# project exists (Phase 1) and run the migration in
# supabase/migrations/0001_init_profiles_and_pillars.sql against it.
npm run dev
```

`npm run dev` runs the Vite dev server only. Once Functions have real
logic worth testing locally, switch to the Netlify CLI's `netlify dev`
instead — it proxies Vite and runs Functions on the same port so `/api/*`
behaves like production.

## Build

```bash
npm run build   # tsc -b && vite build, output in dist/
```

## Environment variables

See `.env.example` for the full list. Everything in it is server-side only
(no `VITE_`-prefixed vars are needed — the browser talks only to this
app's own `/api/*` Functions, never directly to Supabase). Set the same
values in Netlify's dashboard (Site configuration → Environment variables)
so the deployed build has them; `.env` is local-only and gitignored.

## Deployment

Netlify, git-based. Build command `npm run build`, publish directory
`dist`, functions directory `netlify/functions` — all configured in
`netlify.toml`. SPA routing fallback is handled by both `netlify.toml`
redirects and `public/_redirects` (belt-and-suspenders). Enable Netlify
Password Protection on the site before or right after your first deploy.
