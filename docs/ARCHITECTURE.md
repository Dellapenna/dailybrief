# RDP 2.0 — Architecture

## Status

This is a **greenfield project**. There was no pre-existing repository to
audit — this document defines the initial architecture rather than
reconciling it against legacy code. (See `BUILD_PLAN.md` for the assumption
this is based on.)

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, via Vite |
| Routing | React Router (client-side SPA) |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme`, no `tailwind.config.js`) |
| Auth + DB | Supabase (Postgres, Auth, Row-Level Security) |
| Hosting | Netlify (static hosting + Functions) |
| Server logic | Netlify Functions (TypeScript) |
| Native path | Capacitor-compatible (not implemented yet, Phase 7) |

Next.js is intentionally not used, per the brief — no requirement currently
justifies the migration cost.

### Note on Tailwind v4

Tailwind v4 replaces `tailwind.config.js` + PostCSS with a Vite plugin
(`@tailwindcss/vite`) and an `@theme` block directly in CSS
(`src/index.css`). This is functionally equivalent to the v3 config file
approach the brief describes, just via Tailwind's current recommended
setup. Design tokens (colors, fonts) live in that `@theme` block.

### Design system — "Flight Deck" v2 (updated on request, post-Phase 2)

Replaced Phase 1's placeholder navy/gold light theme with a dark
instrument-panel identity, since the ask was for something more modern
and technical: near-black surfaces (`--color-rdp-void`, `--color-rdp-panel`),
a dual accent system (signal-blue `--color-rdp-signal` for actions,
instrument-amber `--color-rdp-amber` for flags/highlights — deliberately
two accents, not the generic single-neon-on-black look), Space Grotesk for
headers, Inter for body copy, JetBrains Mono for data/timestamps/labels.
The signature element is `StatusStrip` — a persistent live-clock/status
readout at the top of every page, styled after real telemetry displays.
All in `src/index.css` (`@theme` block) + fonts loaded in `index.html` via
Google Fonts. `Disclosure` (`src/components/Disclosure.tsx`) and `Tabs`
(`src/components/Tabs.tsx`) are the two reusable primitives used to keep
individual pages compact (dropdown sections, grouped tabs) rather than
long scrolling stacks — used first in Settings and Tasks.

### Design system — v3 "Chart Your Course" (palette shift, on request)

Given a reference mood image (navy/gold/teal-glow, expedition/treasure-map
aesthetic — pirate ship, compass, glowing hologram, "Chart your course.
Dominate your world."), the call was to bring in the palette and tone
without reskinning the whole app into pirate motifs (the full brief still
calls for a calm, executive command center, and skull-and-crossbones nav
icons would fight that on a daily health/family tracker). Compromise:
- **Same token names as v2, recolored:** `--color-rdp-void`/`--color-rdp-panel`
  shifted from neutral near-black to deep navy; `--color-rdp-signal` moved
  from operational blue to a compass-teal (`#2dd4bf`); `--color-rdp-amber`
  deepened toward treasure-gold (`#d4a72c`). No component code changed —
  only hex values in `src/index.css`.
- **`HeroBanner`** (`src/components/HeroBanner.tsx`): the reference image
  itself (`public/images/hero-mission-control.jpg`, compressed from a 3.1MB
  PNG to a 388KB JPEG), used as a hero banner on Mission Control only —
  the one place it gets real estate, not repeated site-wide. Copy echoes
  the reference image's own voice ("Data is the map. AI is the compass.")
  layered under RDP's existing tagline.
- Everywhere else — Settings, Tasks, Habits, Idea Vault — keeps the same
  structural Flight Deck approach (dropdowns, tabs, mono data labels),
  just in the new colors.

## Why this stack

- **Vite + React + TS**: fast local dev, small production bundle, no
  server-rendering complexity the product doesn't need (this is an
  authenticated single-user-per-account app, not a public content site —
  SSR/SEO benefits of Next.js don't apply).
- **Supabase**: Postgres + Auth + RLS in one managed service, matches the
  brief's requirement exactly, and is what the user's other projects
  (Athlete Intelligence, The Caddie) already use — proven, familiar stack.
- **Netlify**: same hosting provider as the user's existing apps; Functions
  + Scheduled Functions cover both on-demand server logic (AI calls,
  authenticated refresh) and the future automated Morning Intelligence
  generation job.

## Frontend architecture

Single-page application. All routing happens client-side via React Router;
Netlify serves `index.html` for any unmatched path (see `_redirects` /
`netlify.toml`) so direct loads and refreshes of deep routes work correctly.

### Route map (Phase 0)

| Route | Page | Notes |
|---|---|---|
| `/` , `/mission-control` | Mission Control | Primary dashboard |
| `/briefing` | Morning Intelligence | Daily briefing view |
| `/goals` | Goals | 90-day missions |
| `/habits` | Habits | Habit tracking |
| `/tasks` | Tasks | Inbox / Today / This Week / Someday / Waiting |
| `/ideas` | Idea Vault | Captured ideas |
| `/reviews` | Reviews | Evening Close + Weekly Presidential Brief |
| `/settings` | Settings | Preferences, Brief Builder |
| `*` | Not Found | Redirects to Mission Control |

No route-level auth-gating: every route above is reachable once past
Netlify Password Protection at the site level — see "Access control model"
below.

### Folder structure

```text
rdp-2/
├── docs/                      Architecture & planning docs (this set)
├── netlify/
│   └── functions/
│       ├── health.ts          Phase 0 smoke-test function
│       └── shared/            env validation, admin Supabase client
├── src/
│   ├── components/            Shared, reusable UI components
│   ├── features/               One folder per domain: briefing,
│   │                           dashboard, goals, habits, tasks, checkins,
│   │                           ideas, settings — business logic + feature-
│   │                           local components live here, not in pages/
│   ├── layouts/                AppLayout (nav chrome)
│   ├── pages/                  Route-level components, kept thin — compose
│   │                           feature components, no business logic
│   ├── hooks/                  Shared React hooks (e.g. useAuth, useUser)
│   ├── lib/                    supabase.ts client, other framework glue
│   ├── types/                  database.ts (generated Supabase types) +
│   │                           shared domain types
│   ├── App.tsx                 Route table
│   └── main.tsx                Entry point, providers
├── supabase/
│   └── migrations/             Numbered SQL migrations (source of truth
│                                for schema — see DATABASE_SCHEMA.md)
├── public/
│   └── _redirects              SPA fallback (belt-and-suspenders with
│                                netlify.toml redirects)
├── netlify.toml
├── vite.config.ts
├── package.json
└── .env.example
```

`pages/` vs `features/`: pages are route entry points only — thin wrappers
that assemble components from the relevant `features/*` folder. This keeps
business logic reusable and testable independent of routing, and keeps any
single file from becoming a monolith as the app grows.

## Access control model

This is a single-user instance. Access control is **Netlify Password
Protection** at the site level (configured in the Netlify dashboard, not
code) — anyone who knows the site password gets the whole app. There is no
in-app login, no Supabase Auth, no session, and no per-user data
partitioning: everything belongs to one fixed profile row seeded by
`supabase/migrations/0001_init_profiles_and_pillars.sql`
(`PRIMARY_USER_ID`).

This was a deliberate simplification, not the brief's original assumption
(the brief describes Supabase Auth with RLS enforcing `auth.uid() =
user_id`). If this ever needs to support more than one person, that's a
real migration — reintroducing Supabase Auth, adding real `user_id`
foreign keys back to `auth.users`, and rewriting RLS policies to check
`auth.uid()` again — not a config flip.

## Data flow / security boundary

```text
Browser (React app)
  │
  │  fetch('/api/...')  →  proxied by netlify.toml to
  │                         /.netlify/functions/*
  │  (the browser holds no Supabase key at all — see below)
  ▼
Netlify Function (server-side, TypeScript)
  │
  │  Reads secrets from Netlify environment variables only:
  │  AI_API_KEY, MARKET_DATA_API_KEY, SPORTS_DATA_API_KEY,
  │  NEWS_API_KEY, WEATHER_API_KEY, SUPABASE_SERVICE_ROLE_KEY,
  │  GOOGLE_CLIENT_SECRET, PRIMARY_USER_ID
  ▼
External APIs / Supabase (admin client, service-role key bypasses RLS)
```

**Hard rule, enforced by convention in `netlify/functions/shared/`:** the
service-role key and every third-party secret key are read only inside
`netlify/functions/`, via `requireEnv()`. Nothing in `src/` imports
`supabaseAdmin.ts`, and nothing in `src/` imports `@supabase/supabase-js`
at all — there's no browser-side Supabase client in this instance
(confirm via `npm run build`: it's absent from the bundle).

Every Function scopes its Supabase queries to `getPrimaryUserId()`
(`netlify/functions/shared/primaryUser.ts`) instead of verifying an auth
token, since there's no session to verify — `profile.ts` is the reference
implementation of this pattern. RLS is still enabled on every table as
defense-in-depth (default-deny for `anon`/`authenticated` roles), even
though the service-role key bypasses it; see `DATABASE_SCHEMA.md`.

## Netlify Functions architecture (planned)

| Function | Trigger | Purpose |
|---|---|---|
| `health.ts` | HTTP | Phase 0 deploy smoke test |
| `profile.ts` | HTTP | Reference implementation: read the primary user's profile + preferences |
| `generate-daily-brief.ts` | Netlify Scheduled Function | Generate the day's briefing for the one primary user |
| `refresh-brief.ts` | HTTP | On-demand regenerate today's briefing |
| `ai-chat.ts` (name TBD) | HTTP | Proxies AI requests, keeps `AI_API_KEY` server-side |
| Integration-specific functions | HTTP | Added one at a time in Phase 5 (weather, sports, markets, news, Calendar, Gmail) |

Every function: validates input, returns clear error responses (not raw
stack traces), logs safely (no secrets, no full personal payloads), handles
timeouts, and caches or rate-limits calls to paid/external APIs where
relevant. None require auth verification (there's no session) — the
Netlify site password is the access gate, applied before any of this code
ever runs.

## Morning Intelligence generation (future workflow, designed now)

A Netlify **Scheduled Function** (`generate-daily-brief.ts`) will:

1. Identify eligible users (has completed onboarding, briefing enabled).
2. Load each user's `user_preferences` / Brief Builder config.
3. Read personal data from Supabase (goals, tasks, habits, check-ins).
4. Read enabled external data (Phase 5+; skipped entirely pre-Phase 5).
5. Normalize all sources into a common shape.
6. Generate the briefing content (AI summary pipeline, Phase 4).
7. Write one `daily_briefs` row + N `brief_sections` rows.
8. Write `brief_sources` rows recording source name + timestamp per section.
9. Record any partial failures per-section rather than failing the whole run.
10. Enforce one briefing per `(user_id, date)` — checked before insert.

Time zone handling uses each user's stored IANA time zone
(`user_preferences.timezone`), not a fixed UTC offset — this determines both
"what day is it for this user" and the scheduled delivery window.

A separate HTTP function (`refresh-brief.ts`) lets the site's one user manually regenerate *today's* briefing on demand, reusing the same
generation logic as a shared module under `netlify/functions/shared/`.

The UI (`/briefing`) surfaces: generation status, last-updated time,
per-section source timestamps, which sections (if any) failed, a refresh
button, and an overall complete/partial status — so a partial AI or
integration failure is visible and never silently presented as a full,
successful briefing.

## What Phase 0 actually built

To validate this architecture end-to-end rather than leaving it as a paper
plan, Phase 0 includes a working (empty) app: Vite + React + TS + Tailwind
v4 boots, all eight routes render placeholder pages, refreshing any deep
route works (redirects verified), the production build succeeds, and one
Netlify Function (`health.ts`) type-checks and follows the shared
env/secret pattern. No feature logic, no Supabase project is connected yet
(no real project credentials exist to connect to).
