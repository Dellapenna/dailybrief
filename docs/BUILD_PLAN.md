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
| 1 | Foundation | Complete (auth pivoted to Netlify Password Protection — see below) |
| 2 | Personal Operating System | Complete (Tasks, Calendar, Weather, Location, Horoscope, Idea Vault, Habits, Goals, Check-in, Evening Review) |
| 3 | Mission Control | Partial — basic dashboard exists, pillar scores/full goal progress not yet added |
| 4 | Morning Intelligence Engine | Not started |
| 5 | External Integrations | Partial — Weather and iCloud Calendar live, Google/Outlook Calendar stubbed, Sports/Markets/News/Gmail not started |
| 6 | Analytics | Not started |
| 7 | Native Readiness | Not started |

**Important caveat that applies to every "Complete" above:** nothing has
been run against a real Supabase project or a live Netlify deploy with
Functions running yet. "Complete" means built, type-checked, and
build-verified — not live-tested. See each phase's "Still needed from
you" list.

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

**Revision note:** originally scoped as goals/tasks/habits/check-ins/
reviews/Idea Vault. On request, scope shifted to prioritize what's needed
for daily iPhone use first: the task system, plus calendar/weather/location
pulled forward from Phase 5. Idea Vault, Habits, Goals, Morning Check-in,
and Evening Review were all built in follow-up passes (see below) — this
phase's original scope is now fully covered.

**Task system — "Quick-capture + Smart Today" (Option C):**
No Areas, tags, or nested projects (that's the faithful-Things-clone
option, not chosen). `tasks` table + `/api/tasks` (GET with `?view=`,
POST, PATCH, DELETE) + `useTasks` hook with optimistic updates +
`QuickAddBar` / `TaskList` / `TaskRow` + a real `TasksPage` with
Today/Inbox/This Week/Someday/Waiting/Completed tabs. "Smart Today" is
computed server-side, not stored: status = today, OR flagged, OR
due_date ≤ today, excluding completed.

**Note on replacing Things:** Things 3 has no public API or export
Cultured Code exposes — there's no ongoing sync possible with it. This is
a genuine replacement to switch to, not something that stays connected to
Things; existing open Things tasks need manual re-entry via quick-add.

**Calendar — three providers, one actually live:**
- `calendar_connections` + `calendar_events` tables (provider-agnostic
  cache — the UI and `/api/calendar/events` only ever read this table,
  never call a provider live).
- **iCloud (CalDAV): fully implemented** — `calendar-sync-icloud.ts` using
  `tsdav` + `ical.js`, Basic auth with an app-specific Apple ID password.
  Pulls all calendars, yesterday through +30 days, upserts into
  `calendar_events`. No scheduled/automatic sync yet — trigger it via the
  "Sync now" button in Settings, or call the endpoint manually. An
  automated Scheduled Function comes later (Phase 4/5 territory).
- **Google Calendar, Outlook: stubbed, not implemented.** Both require an
  OAuth app registration in an external console (Google Cloud / Azure AD)
  that only you can do — see `docs/INTEGRATIONS.md`. The stub functions
  document the exact next steps; the read side (`calendar-events.ts`,
  frontend) needs zero changes once either is implemented, since
  everything already reads from the shared cache table.

**Weather:** `weather.ts` using the free National Weather Service API
(api.weather.gov) — no key, US-only. `WeatherCard` on Mission Control.

**Location:** `useGeolocation` hook (browser Geolocation API) with a
fallback to a stored home location in Settings — this is a web app, so
there's no background/native location access, only "ask while the page
is open."

**Horoscope (added on request, not in the original brief):** AI-generated
via the Anthropic API directly (`netlify/functions/horoscope.ts`), cached
once per calendar day in a `horoscopes` table so it's not regenerated on
every page load. This is a deliberate, narrow exception to the brief's
"evidence over invention" principle — horoscopes are inherently
non-factual entertainment, clearly labeled "for fun" in the UI, never
presented as a real forecast. Zodiac sign is set directly in Settings (no
birthdate collected). Uses `AI_API_KEY`, which was previously reserved for
Phase 4 and is now actually in use.

**Idea Vault:** `ideas` table matching the brief's original field list
(title, description, category, potential value, estimated effort,
strategic fit, status lifecycle, next review date) — though only title +
status are exposed in the v1 UI; the rest exist in the schema for a later
detail view. `/api/ideas` CRUD, quick-add + status tabs
(All/Captured/Reviewing/Prioritized/Building/Paused/Completed), matching
the Tasks page pattern.

**Habits:** `habits` + `habit_entries` tables. Streaks and 30-day success
rate are computed in `netlify/functions/habits.ts` at request time, never
stored (per the brief's explicit instruction — avoids drift). **Assumption:**
v1 treats every habit as daily-frequency; the `frequency` column is stored
but doesn't yet affect the streak math — revisit if a non-daily habit is
needed. Per the brief, streak display is deliberately understated (a small
number next to the name, no "streak broken!" messaging) so missing one day
doesn't read as losing everything.

**Goals:** `goals` + `goal_milestones` tables, matching the brief's full
field list. `/api/goals` CRUD (generic camelCase→snake_case mapping so new
fields don't need new mapping code). v1 UI exposes title, why it matters,
next action, status, target date via a `Disclosure`-based `GoalRow` (tap
to expand); `goal_milestones` and the remaining fields (starting point,
target/current result, weekly target, obstacles, confidence,
`estimated_probability`) exist in the schema and API but have no form yet.
`probability_method` defaults to `'user_entered'` — no scoring engine
exists yet to justify `'rules_based'`, and the brief is explicit that an
AI-estimated probability must never be presented as precise.

**Morning Check-in:** `morning_checkins` table, one per
`(user_id, checkin_date)`, all fields nullable per the brief. Lives on the
existing `/briefing` (Morning Intelligence) page rather than a new route —
it's the part of that experience that's ready before the full AI briefing
(Phase 4). Sliders for the 1-5 scale fields (sleep quality, energy, mood,
stress), plain inputs for everything else, one explicit "Save check-in"
button rather than autosaving each field.

**Evening Review:** `evening_reviews` table, one per
`(user_id, review_date)`. Lives on the existing `/reviews` page (which
already covered "Evening Close + Weekly Presidential Brief" in the route
map) — the Weekly Presidential Brief itself is still Phase 6. The brief's
five suggested prompts, minus "how would you rate the day" folded into a
1-10 slider rather than a sixth text field.

**Still needed from you** (in addition to the Phase 1 list — Supabase
project + migrations + GitHub→Netlify connection, none of which are done
yet, so **nothing above is live-tested end-to-end**, only type-checked
and build-verified):
1. Run `supabase/migrations/0002_tasks_and_calendar.sql` after `0001`.
2. Generate an iCloud app-specific password, set `ICLOUD_APPLE_ID` /
   `ICLOUD_APP_SPECIFIC_PASSWORD` in Netlify env vars.
3. Set `NWS_USER_AGENT` to something identifying with a real contact
   email (NWS asks for this, it's not sensitive).
4. Once deployed via Git (Functions actually running), hit "Sync now" on
   iCloud in Settings and confirm events show up on Mission Control.
5. Run `supabase/migrations/0005_goals_checkins_reviews.sql` after `0004`.

**Home screen icon (added on request):** `public/icons/` has the
apple-touch-icon set (180/152/167px) generated from a user-supplied image,
wired into `index.html` along with `apple-mobile-web-app-capable` so
Safari's "Add to Home Screen" gets a proper icon and opens in standalone
mode (no browser chrome) — the closest a web app gets to feeling native on
iPhone without Capacitor. `public/manifest.webmanifest` covers the same
for any non-Apple context.

**Daily news briefing (added on request):** `netlify/functions/news.ts`
pulls real headlines from two free, no-API-key sources — Hacker News
(Algolia API) for AI/Tech, NPR's public RSS feed for general news — with a
15-minute in-memory cache. Deliberately **not** AI-generated, unlike
Horoscope: news is one of the categories the brief explicitly requires to
be evidence-based, never fabricated. Lives on `/briefing` as `NewsCard`,
above the check-in form.

**Calendar Month View (added on request):** `MonthView` — a real month
grid (not the reference "calendar skin" image itself, which is a UI
mockup, not a decorative photo; treated as a style reference instead) —
shows actual synced events per day from the same `calendar_events` cache
`TodayEvents` reads. `calendar-events.ts` now accepts an explicit
`?start=&end=` range (falls back to the existing `?days=` behavior) to
support arbitrary months. `CalendarSection` wraps Agenda/Month behind
`Tabs` on Mission Control.

**Mission Progress widget (added on request):** echoes the reference
image's progress-bar sidebar, but with only honestly-computable numbers:
habit completion has a real ratio (shown as a bar); active goal count and
today's task count are shown as plain counts rather than invented
percentages, since there's no "out of what" for those yet.

**Navigation restructure + 6 new content categories (added on request):**
Given a reference "pirate map" nav mockup with ~15 tappable category
tiles, restructured the app:
- **`NavMapPage`** is now the content of `/` and `/mission-control` — a
  tappable icon grid (real icons via `lucide-react`, not literal map
  illustration; no tool available to generate bespoke island artwork, so
  same simplification approach as the hero banner). Each tile links to a
  real page.
- **What used to be Mission Control's dashboard widgets moved to
  `/briefing`**, which is now the full "Daily Briefing" dashboard: weather,
  mission progress, horoscope, calendar, news, today's tasks, and the
  morning check-in, all on one page.
- **Calendar, Horoscope, News, Progress** each got their own dedicated
  route (`/calendar`, `/horoscope`, `/news`, `/progress`), wrapping the
  same components already built rather than duplicating them.
- **Four new real-content pages**, all genuinely sourced (never
  AI-invented, consistent with "evidence over invention" for anything
  presented as factual): `/motivation` (ZenQuotes — real quotes, real
  authors), `/word-of-the-day` (a free random-word API + a free public
  dictionary API for the actual definition), `/fun-fact` (a free curated
  facts API), `/dad-joke` (icanhazdadjoke.com's curated database). All
  four use free sources requiring no signup or API key, with a 1-hour
  in-memory cache per Function instance.
- **`/sports`**: real upcoming games via TheSportsDB's publicly
  documented free test API key (`"3"`) — no signup needed, though it's a
  shared/rate-limited demo key; swap in a personal key via
  `SPORTS_DATA_API_KEY` if it gets flaky. **Assumption:** favorite teams
  are hardcoded (Eagles/Phillies/76ers/Flyers) rather than read from
  preferences — the brief calls for configurable teams eventually, not
  built yet.
- **`/stocks`**: stub only, matching the Google/Outlook Calendar
  precedent — financial data needs a real, reliable provider, and there's
  no trustworthy free-no-key option worth shipping instead of waiting for
  a real `MARKET_DATA_API_KEY`.

Old `MissionControlPage.tsx` was deleted (superseded by `NavMapPage`). The
desktop sidebar / mobile bottom nav weren't updated with all these new
routes — they're reachable via the map, not the persistent nav, to avoid
a 20-item sidebar. Worth revisiting if some of these deserve persistent
nav placement too.

## Phase 3 — Mission Control

Mission Control already has a basic version as of the Phase 2 revision
(weather, today's calendar, top-3 Smart Today tasks, hero banner) — this
phase is about the fuller version:

- Dashboard assembling: pillar scorecards (`pillar_scores` — not yet a
  table, would need its own migration), goal progress (data now exists —
  `goals` table is built, just not surfaced on Mission Control yet), a
  briefing *preview* (full Morning Intelligence UI comes in Phase 4).

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

## Pillar-based navigation rebuild (on request, post-v9)

Given a new reference home-screen image with a different taxonomy —
Mission Control / Body / Mind / Spirit / Life / Work / Intelligence,
replacing the earlier flat 15-category map — the app was restructured
around six life pillars plus a dashboard hub, rather than a flat category
list.

**Final pillar mapping:**
- **Mission Control** (`/mission-control`, now the actual dashboard,
  leaner than the old Briefing page): Progress + cross-pillar To-Do
  summary, Calendar, Today's Mission, Morning Check-in
- **Body** (`/body`): Exercise Log (new), Health Trends (new, read-only
  history of Check-in data), Habits/Tasks/Goals filtered to Body
- **Mind** (`/mind`): Motivation Quote, Word of the Day, Spanish Word of
  the Day (new), Habits/Tasks/Goals filtered to Mind (Spanish practice
  lives here as an ordinary habit, not a separate system)
- **Spirit** (`/spirit`): Prayer prompts (new) and Breathing Meditation
  (new) — both seeded as Spirit-pillar habits (migration `0006`) so they
  get real streak tracking for free from the existing habits system
  rather than parallel tracking logic; Tasks/Goals filtered to Spirit
- **Life** (`/life`): Daily Dad Joke, Idea Vault, Evening Review,
  Habits/Tasks/Goals filtered to Life
- **Work** (`/work`): Tasks (primary), Goals, Habits filtered to Work
- **Intelligence** (`/intelligence`): Weather, News, Stock Market, Crypto
  Market (new), Sports, Horoscope, Fun Fact of the Day, World Clock (new)

**New features, all following existing patterns:**
- **Exercise Log** — quick log only (category + activity + duration +
  notes), no sets/reps/weight/pace, per the chosen scope.
- **Health Trends** — read-only; the Check-in *form* stays on Mission
  Control (daily ritual), this just surfaces the resulting data.
- **Spanish Word of the Day** — a bundled, curated word list rather than
  a free translation API (more reliable, zero fabrication risk, no
  external dependency to break).
- **Crypto Market** — CoinGecko's free public API, no key.
- **World Clock** — pure client-side timezone conversion (Spain,
  Guatemala, Austin), no backend at all.
- **Cross-pillar To-Do summary** — `/api/tasks/summary` returns counts
  per pillar; `tasks.ts`/`goals.ts`/`habits.ts` all gained an optional
  `?pillar=` filter (existing `pillar_id` columns from earlier
  migrations already supported this — no schema change needed there).

**What stayed the same:** every existing feature component (WeatherCard,
NewsCard, HoroscopeCard, etc.) was *relocated*, not rebuilt — several
(Motivation, Word of the Day, Fun Fact, Dad Joke, Sports, Stocks, Idea
Vault) were extracted from page-only implementations into reusable
`*Card`/`*Section` components so both their original standalone page and
the new pillar page can use the same component. Old standalone pages
(`/calendar`, `/horoscope`, `/news`, `/sports`, `/stocks`, `/motivation`,
`/word-of-the-day`, `/fun-fact`, `/dad-joke`, `/progress`) still work —
just not linked from the map anymore. `/briefing` redirects to
`/mission-control` for anyone with an old bookmark. Global "all pillars"
views for Tasks/Goals/Habits/Idea Vault/Reviews still exist, demoted to
the More page / desktop sidebar rather than primary nav.

**Migration `0006_pillar_rebuild.sql`:** adds `exercise_logs`; seeds two
Spirit-pillar habits ("Prayer", "Breathing Meditation") found by name in
the frontend (`useSpiritHabit`) rather than a hardcoded ID.

## Working Copy (iOS) deployment note

The user is deploying via **Working Copy** (a Git client for iPhone —
there's no computer in this workflow) rather than a desktop terminal.
Practical implications worth remembering:
- iOS's Files app does **not** reliably preserve nested folder structure
  when multi-selecting items to move between apps — this caused several
  failed deploys (only loose top-level files landing in the repo, no
  `src`/`netlify`/etc). The reliable fix: package a single zip and use
  Working Copy's built-in **"Extract to existing repository"** feature,
  which does a real unzip in place rather than a manual multi-file copy.
- For small code fixes, giving the person full file contents to
  copy/paste directly into Working Copy's built-in editor is faster and
  more reliable than another zip-extract cycle.
- Multiple similarly-named zips across a long conversation caused mix-ups
  (wrong version extracted). Naming matters — be explicit and distinct.

## Consolidation from 6 pillars to 4 zones + Daily Dashboard (on request)

After the 6-pillar rebuild proved hard to keep tap zones aligned (a
stacked-row image layout), and on reflection about whether 6 was more
granularity than needed, consolidated to a cleaner structure per a new
reference image with a 2x2 quadrant layout (Body/Mind top, Soul/Mission
Control bottom) plus Daily Dashboard called out as a genuinely separate
5th destination.

**Final structure:**
- **Body** (`/body`) — unchanged: Exercise Log, Health Trends,
  Body-tagged Habits/Tasks/Goals
- **Mind** (`/mind`) — gained Idea Vault and Breathing Meditation (moved
  from Soul, per the reference image putting "Meditate" under Mind, not
  Soul): Motivation Quote, Word of the Day, Spanish Word of the Day,
  Breathing Meditation, Idea Vault, Mind-tagged Habits/Tasks/Goals
- **Soul** (`/soul`, renamed from Spirit) — Prayer (Faith), Gratitude
  (new), Service (new), Evening Review (moved here as "Reflection"),
  Soul-tagged Habits/Tasks/Goals
- **Mission Control** (`/mission-control`) — re-scoped to
  goals/planning/execution per the reference image's own tagline ("Plan.
  Execute. Win. You are the captain."): Executive Summary (new),
  Progress/cross-pillar summary ("Analyze"), all-pillars Tasks ("Plan"),
  all-pillars Goals
- **Daily Dashboard** (`/daily-dashboard`, new route) — what Mission
  Control used to contain: Weather, Calendar, Morning Check-in, News,
  Stock Market, Crypto Market, Sports, Horoscope, Fun Fact, Daily Dad
  Joke, World Clock

**Data model simplified from 6 pillars to 3 real tags** (`body | mind |
soul`) — Mission Control and Daily Dashboard aren't things a task/goal/
habit gets tagged *as*, they're hub pages. Migration `0008` renames
spirit→soul, untags anything that was tagged life/work/intelligence (no
clean 1:1 replacement existed for those under the new model — this is a
design consolidation, not a bug, so untagging rather than guessing wrong
felt like the right call), and seeds Gratitude/Service as new Soul-pillar
habits alongside the existing Prayer.

**Executive Summary** (new, in Mission Control): real rules-based stats
(active/completed/paused goal counts, tasks completed this week, tasks
overdue, 7-day habit completion rate) plus a short AI-written assessment
that comments on those real numbers — explicitly prompted to be direct
and not automatically encouraging, matching the app's "honest coaching"
principle. The AI never invents its own numbers; if the assessment call
fails, the stats still render on their own.

**Pages removed:** `WorkPage`, `IntelligencePage`, `LifePage` (renamed to
`SoulPage`) — content fully redistributed above, no clean single
replacement existed for any of the three individually, so no redirect
was added for their old routes (they 404 via `NotFoundPage` now).
`/briefing` now redirects to `/daily-dashboard` instead of
`/mission-control`, since Daily Dashboard is the closer semantic match to
what that page used to be.
