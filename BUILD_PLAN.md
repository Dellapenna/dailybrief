# RDP 2.0 — Build Plan

## Key assumption this plan is based on

**There is no pre-existing RDP 2.0 codebase.** The brief's Phase 0
instructions assume auditing an existing repository; when asked directly,
the answer was that this is a from-scratch build. Everything below reflects
a greenfield start, not a migration from legacy code. If an existing
repo/zip surfaces later, treat it as reference material to selectively pull
from — don't retrofit this plan around it after the fact without a fresh
review.

## Phase status

| Phase | Name | Status |
|---|---|---|
| 0 | Architecture | Complete |
| 1 | Foundation | **In progress — see below** |
| 2 | Personal Operating System | Not started |
| 3 | Mission Control | Not started |
| 4 | Morning Intelligence Engine | Not started |
| 5 | External Integrations | Not started |
| 6 | Analytics | Not started |
| 7 | Native Readiness | Not started |

## Phase 0 — Architecture (this phase)

Delivered:
- Vite + React + TypeScript + Tailwind v4 project scaffold
- Full recommended folder structure
- React Router route map for all 8 required routes + 404 handling
- `netlify.toml` + `public/_redirects` SPA fallback
- `.env.example` (names only, no real values)
- Server-secret / browser-key boundary established
  (`src/lib/supabase.ts` vs `netlify/functions/shared/supabaseAdmin.ts`)
- One working Netlify Function (`health.ts`) proving the Functions pipeline
- `docs/PRODUCT_BRIEF.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md` (this
  file), `INTEGRATIONS.md`, `README.md`
- Verified: `tsc --noEmit` clean, `npm run build` succeeds, dev server
  serves all routes with 200s

Not done in Phase 0 (by design): no Supabase project connected, no
migrations run, no real auth, no UI design system, no third-party
integrations, no AI calls.

## Phase 1 — Foundation

**Revision note:** Phase 1 initially built full Supabase Auth (sign-up,
sign-in, session, password reset). That was replaced with Netlify Password
Protection as the sole access gate, since this is explicitly a single-user
instance — see `ARCHITECTURE.md` → "Access control model" for the
reasoning and what reintroducing multi-user support would require later.
`src/features/auth/` and the browser-side Supabase client were deleted;
data access moved fully server-side.

Delivered in code (no live Supabase project connected yet — see "Still
needed from you" below):

- `supabase/migrations/0001_init_profiles_and_pillars.sql`: `life_pillars`
  (seeded), `profiles` and `user_preferences` seeded with one fixed
  `PRIMARY_USER_ID` row (no `auth.users` dependency), RLS enabled on all
  three with no policies (default-deny — see `DATABASE_SCHEMA.md`), plus
  an `updated_at` trigger.
- `src/lib/api.ts` — the browser's only path to data, a thin fetch wrapper
  around this app's own `/api/*` Netlify Functions. No Supabase key of any
  kind reaches the browser.
- `netlify/functions/shared/primaryUser.ts` + `netlify/functions/profile.ts`
  — the reference pattern every future data Function follows: service-role
  key + `PRIMARY_USER_ID`, no auth-token verification (there's no session).
- Real design tokens in `src/index.css` (`@theme`): navy/charcoal/gold
  palette per "premium, calm, executive" direction, reduced-motion support.
  Still a first pass — expect refinement once real screens are built.
- Real nav chrome in `AppLayout.tsx`: desktop sidebar (all 8 routes) and
  mobile bottom nav (Mission Control / Briefing / Plan / Progress / More),
  with a `/more` page holding the links that don't fit the mobile 5-slot
  nav. "Today" / "Projects" / "Analytics" from the brief's suggested
  desktop nav are intentionally left out of the sidebar until those routes
  exist (Phase 3 / Phase 6) — see the note in `AppLayout.tsx`.

**Still needed from you:**
1. Enable Netlify Password Protection on the site (`docs/INTEGRATIONS.md`).
2. Create a Supabase project.
3. Copy the Project URL and **service-role key** into `.env`
   (`cp .env.example .env` first) — and into Netlify's dashboard env vars
   for the deployed site. `PRIMARY_USER_ID` in `.env.example` already
   matches the UUID the migration seeds; leave it as-is unless you edit
   the migration too.
4. Run `supabase/migrations/0001_init_profiles_and_pillars.sql` against
   the project (Supabase Studio SQL editor, or the Supabase CLI once
   linked).

Once those four steps are done, `GET /api/profile` returns real data with
no further code changes.

## Phase 2 — Personal Operating System

- Migrations + RLS for `goals`, `goal_milestones`, `tasks`, `habits`,
  `habit_entries`, `morning_checkins`, `evening_reviews`, `ideas`.
- CRUD UI for goals, tasks (Inbox/Today/This Week/Someday/Waiting/Completed
  views), habits (with streaks computed, not overemphasized per the brief),
  morning check-in form (buttons/sliders, nothing mandatory), evening
  review, Idea Vault.

## Phase 3 — Mission Control

- Dashboard assembling: daily top 3 priorities, pillar scorecards (rules-
  based `pillar_scores`), goal progress, a briefing *preview* (full
  Morning Intelligence UI comes in Phase 4), manual "today" view.

## Phase 4 — Morning Intelligence Engine

- `daily_briefs` / `brief_sections` / `brief_sources` migrations.
- Manual (button-triggered, authenticated) briefing generation using only
  internal Supabase data — no external APIs yet, per MVP scope.
- AI summary pipeline (Netlify Function proxying the AI provider, key never
  reaches the browser).
- "Why It Matters" explanation pattern, Brief Builder settings UI,
  historical briefing view.

## Phase 5 — External Integrations (one at a time, in this order)

1. Weather
2. Sports (start with the Philadelphia teams + configurable watchlist)
3. Financial markets (indexes/watchlist, "Why It Matters to You" framing,
   explicit info-only / worth-monitoring / action-required labeling, no
   individualized investment advice)
4. News
5. Google Calendar
6. Gmail

Each integration ships with: docs, error handling, rate-limit handling,
caching, source timestamps, source attribution in `brief_sources`,
fallback behavior (a failed integration degrades that section only — see
`ARCHITECTURE.md`'s partial-failure design), and user controls (Brief
Builder enable/disable, importance level).

## Phase 6 — Analytics

- Weekly Presidential Brief generation (mirrors the daily pipeline).
- Trend views, pillar analysis, goal probability estimates (clearly labeled
  rules-based/user-entered, never presented as precise), correlation
  insights using hedged, non-causal language per the brief
  ("this pattern may suggest...").

## Phase 7 — Native Readiness

- Capacitor integration, iOS/Android build config, push notifications,
  secure native storage. Not started until the web product is solid — the
  brief frames this as preparation, not an MVP deliverable.

## Deferred beyond the phases above

**RDP Council** (multi-perspective AI panel — CEO / Coach / Dad / Builder /
Realist / Future RDP) is explicitly excluded from MVP per the brief and has
no phase assignment yet. Revisit only when directly requested.

## Cross-phase risks to track

- **Scope creep in Morning Intelligence.** The section list (Markets,
  Sports, Beverage/Retail, AI/Tech, Career, Family, Health, Builder) is
  large; Phase 4 should ship with most sections empty/disabled rather than
  rushing shallow versions of all of them at once.
- **AI cost/latency in the daily generation job.** Scheduled Function needs
  a timeout and per-section failure isolation from day one (designed in
  `ARCHITECTURE.md`), not retrofitted after it breaks in production.
- **Score/probability framing.** Every score and probability surface needs
  a visible "how this is calculated" explanation before it ships — this is
  a stated product requirement, not a nice-to-have, and is easy to skip
  under time pressure.
- **Single-user-first schema decisions.** Some early modeling choices
  (e.g. one `profiles` row implicitly assumed as "the" user in early UI
  copy) need to stay data-driven (`user_id`-scoped, RLS-enforced) even
  though only one person uses the app initially, so multi-user support
  later is additive, not a rewrite.

## Assumptions log

- No existing repository — confirmed by the user; this is a from-scratch
  build (see top of this document).
- Single primary user for now; schema is multi-user-ready from day one per
  the brief's explicit instruction, even though there's no invite/multi-
  account UI in the MVP.
- Tailwind v4's CSS-first config is used in place of the `tailwind.config.js`
  + PostCSS setup implied by the brief — functionally equivalent, noted in
  `ARCHITECTURE.md`.
- Placeholder design tokens and Phase 0 nav chrome are throwaway — Phase 1
  is where real visual design work happens, not before.
