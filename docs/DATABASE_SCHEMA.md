# RDP 2.0 — Database Schema (MVP Design)

No Supabase project is connected yet, so nothing here has been executed —
this is the design that Phase 1 migrations implement in
`supabase/migrations/`. Written to match the brief's suggested table list
and the MVP scope in `PRODUCT_BRIEF.md`.

**Single-user model:** this instance has no Supabase Auth and no
`auth.users` rows — access control is Netlify Password Protection at the
site level instead (see `ARCHITECTURE.md` → "Access control model"). Every
table below scopes to `public.profiles.id`, a single fixed UUID seeded by
migration `0001`, not to `auth.uid()`.

## Conventions

- Every user-owned table: `id uuid primary key default gen_random_uuid()`,
  `user_id uuid not null references public.profiles(id) on delete cascade`,
  `created_at timestamptz not null default now()`,
  `updated_at timestamptz not null default now()`.
- `updated_at` maintained via a shared trigger, not application code.
- Enums implemented as Postgres `check` constraints on `text` columns
  initially (simpler migrations, still constrained) rather than native
  `enum` types, so adding a new status later doesn't require a type
  migration — can revisit if this becomes a real pain point.
- Every user-owned table has RLS **enabled with no policies** (default-deny
  for `anon`/`authenticated` roles). Access happens exclusively through
  Netlify Functions using the service-role key, which bypasses RLS by
  design — RLS here is defense-in-depth, not the active access-control
  mechanism. See "Row-level security" below.

## Core tables (MVP)

### `profiles`
Extends `auth.users`. `id` (= `auth.users.id`), `display_name`,
`timezone` (IANA string, e.g. `America/New_York`), `onboarded_at`.

### `user_preferences`
One row per user. Briefing delivery times (`morning_delivery_time`,
`evening_delivery_time`), `weather_units`, `preferred_brief_length`,
location fields, and per-category settings as `jsonb` (`brief_category_settings`)
covering enabled/order/detail-level/importance/notifications per the Brief
Builder spec — kept as `jsonb` rather than one column per category since
the category list will grow across Phase 5 integrations.

### `life_pillars`
Seed/reference table: `body`, `mind`, `family`, `career`, `builder`, `life`.
Not user-owned — global lookup table, RLS: readable by all authenticated
users, no writes from the client.

### `goals` — **implemented** in `0005_goals_checkins_reviews.sql`
90-day missions. `title`, `description`, `pillar_id`, `why_it_matters`,
`start_date`, `target_date`, `starting_point`, `target_result`,
`current_result`, `status`, `weekly_target`, `next_action`, `obstacles`,
`confidence_level`, `estimated_probability` (int, nullable),
`probability_method` (`'user_entered' | 'rules_based'` — never
`'ai_precise'`; the brief explicitly forbids presenting an AI estimate as
scientifically precise). v1 UI (`GoalRow`, a `Disclosure`) only exposes
title, why it matters, next action, status, target date — the rest exist
in schema/API for a later, fuller goal-detail view.

### `goal_milestones` — **implemented** in `0005_goals_checkins_reviews.sql`
`goal_id` (fk), `title`, `target_date`, `completed_at` (nullable). Not
exposed in the v1 UI yet.

### `tasks` — **implemented** in `0002_tasks_and_calendar.sql`
Built as "Quick-capture + Smart Today" (Option C — see `BUILD_PLAN.md`
Phase 2), simpler than originally suggested here: no `project_id` FK, no
`priority`/`estimated_effort`/`recurrence` columns. Actual columns:
`title`, `notes`, `pillar_id` (nullable fk), `project` (free-text label,
not a separate table), `status`
(`inbox | today | this_week | someday | waiting | completed`), `flagged`,
`due_date`, `completed_at`, `source`
(`manual | ai_recommended | calendar | goal | weekly_review |
morning_briefing`), `sort_order`. "Smart Today" (status=today OR flagged
OR due_date≤today, excluding completed) is computed in
`netlify/functions/tasks.ts`, not a stored view.

### `calendar_connections` — **implemented** in `0002_tasks_and_calendar.sql`
Not in the original suggested table list — added for Phase 2's calendar
sync. `provider` (`icloud | google | outlook`), `display_name`, `status`
(`disconnected | connected | error`), `last_synced_at`, `last_error`.
Tracks connection *state* only — actual credentials (CalDAV app-specific
password, OAuth tokens) live in Netlify env vars, never this table.

### `calendar_events` — **implemented** in `0002_tasks_and_calendar.sql`
Also new vs. the original list. Provider-agnostic normalized cache:
`provider`, `provider_event_id` (source calendar's UID), `title`,
`location`, `starts_at`, `ends_at`, `all_day`, `synced_at`. Unique on
`(user_id, provider, provider_event_id)` so re-syncing upserts rather than
duplicating. The frontend and `/api/calendar/events` only ever read this
table — no live provider calls on page load.

### `horoscopes` — **implemented** in `0003_horoscope.sql`
Not in the original suggested table list — added on request. AI-generated
daily horoscope, cached once per `(user_id, horoscope_date)` so repeat
page loads don't re-call the AI API. `sign`, `content`, `created_at`.
`user_preferences.zodiac_sign` (added by the same migration) is set
directly in Settings, no birthdate collected.

### `habits` — **implemented** in `0004_ideas_and_habits.sql`
`name`, `pillar_id`, `frequency` (stored, not yet used in streak math —
v1 assumes daily), `target`, `reminder_time`, `archived`, `sort_order`.

### `habit_entries` — **implemented** in `0004_ideas_and_habits.sql`
`habit_id` (fk), `entry_date`, `completed` (bool). Streaks and success rate
are **computed**, not stored — derived from `habit_entries` at read time in
`netlify/functions/habits.ts` (not a materialized view — table is small
enough per-user that this is fine) so they can't drift out of sync.

### `morning_checkins` — **implemented** in `0005_goals_checkins_reviews.sql`
One per `(user_id, checkin_date)`. `sleep_duration`, `sleep_quality`,
`energy`, `mood`, `stress`, `glucose`, `weight`, `symptoms` (text,
nullable), `planned_exercise`, `biggest_concern`, `most_important_outcome`.
All fields nullable except the date — per the brief, nothing here is
mandatory. UI lives on `/briefing` (`CheckInForm`), not a separate route.

### `evening_reviews` — **implemented** in `0005_goals_checkins_reviews.sql`
One per `(user_id, review_date)`. `went_well`, `went_poorly`, `lesson`,
`tomorrow_focus`, `day_rating` (1–10). UI lives on `/reviews`
(`EveningReviewForm`).

### `ideas` — **implemented** in `0004_ideas_and_habits.sql`
Idea Vault. `title`, `description`, `category`, `date_captured`,
`potential_value`, `estimated_effort`, `strategic_fit`, `status`
(`captured | reviewing | prioritized | building | paused | rejected |
completed`), `next_review_date`. v1 UI only exposes `title` (quick-add) and
`status` (tabs + per-row dropdown) — the rest of the fields exist in the
schema and API (`/api/ideas` PATCH accepts them) but have no form yet.

### `decisions`
Decision Journal. `title`, `decision_date`, `context`, `options` (jsonb
array), `chosen_option`, `reasoning`, `assumptions`, `expected_result`,
`confidence`, `review_date`, `actual_result` (nullable),
`lesson_learned` (nullable).

### `projects`
Builder pillar projects (Athlete Intelligence, The Caddie, etc.). `name`,
`description`, `status`, `pillar_id` (defaults to `builder`).

### `project_updates`
`project_id` (fk), `update_date`, `summary`, `blockers` (nullable).

### `daily_briefs`
One per `(user_id, brief_date)`. `status`
(`pending | complete | partial | failed`), `generated_at`.
Unique constraint on `(user_id, brief_date)` — enforces the brief's "no
duplicate briefings" requirement at the database level, not just in
application logic.

### `brief_sections`
`brief_id` (fk), `section_key` (e.g. `markets`, `sports`, `career`),
`content` (jsonb), `status` (`ok | failed | skipped`), `display_order`.

### `brief_sources`
`brief_section_id` (fk), `source_name`, `source_timestamp`, `fetched_at`.

### `weekly_reviews`
Weekly Presidential Brief. One per `(user_id, week_start_date)`.
`executive_summary`, `wins` (jsonb), `scorecard` (jsonb, per-pillar),
`risks` (jsonb), `decisions_needed` (jsonb), `next_week_priorities` (jsonb,
max 5 enforced in application logic), `ai_assessment`.

### `pillar_scores`
`user_id`, `pillar_id`, `score_date`, `score` (int), `factors` (jsonb —
must explain what fed the score, per the brief's transparency requirement).

### Preference tables
`sports_preferences`, `market_preferences`, `news_preferences`,
`retailer_preferences` — each user-owned, simple `(user_id, item, enabled)`
shape feeding the Brief Builder. Kept as separate small tables rather than
one big jsonb blob because these map directly to Phase 5 integration
queries (e.g. "which tickers does this user watch").

### `integrations`
Tracks per-user connection state for external integrations added in Phase
5+ (e.g. Google Calendar connected, token expiry — actual OAuth tokens
stored server-side only, never in a client-readable column without RLS
locked to the owning user).

## Row-level security — default-deny, not per-user policies

Since there's no Supabase Auth session, `auth.uid()` is never populated for
any request this app makes — so a policy like `auth.uid() = user_id` would
simply deny everyone, including the server. Instead, every user-owned table
just gets RLS **enabled with no policies at all**:

```sql
alter table public.tasks enable row level security;
-- No policies. anon/authenticated roles get zero access by default.
```

The service-role key (used exclusively inside `netlify/functions/`, never
in the browser) bypasses RLS entirely, so this is what actually reads and
writes the data — scoped in application code to `PRIMARY_USER_ID`, not by
a database policy. RLS here exists purely as a second layer of defense: if
a client-side Supabase key were ever accidentally introduced later, it
would see nothing, rather than everything.

`life_pillars` follows the same pattern (RLS on, no policies) even though
it's reference data, not user-owned — nothing reads it directly from the
browser either.

If this ever becomes multi-user, this whole section reverts to the
brief's original design: real Supabase Auth, real per-user policies
(`auth.uid() = user_id`), and every FK pointing at `auth.users` again.

## Indexes (MVP baseline)

- `user_id` btree index on every user-owned table (every server-side query
  filters on this).
- `(user_id, checkin_date)` unique on `morning_checkins`.
- `(user_id, review_date)` unique on `evening_reviews`.
- `(user_id, brief_date)` unique on `daily_briefs`.
- `(user_id, status)` on `tasks` (Inbox/Today/etc. views filter on this).
- `(habit_id, entry_date)` unique on `habit_entries`.


## Migrations

One numbered SQL file per logical change under `supabase/migrations/`,
never hand-edited outside a migration, per the brief's "no undocumented
manual database changes" rule. So far:
`0001_init_profiles_and_pillars.sql` (Phase 1),
`0002_tasks_and_calendar.sql` (Phase 2),
`0003_horoscope.sql` (Phase 2, added on request),
`0004_ideas_and_habits.sql` (Phase 2 follow-up),
`0005_goals_checkins_reviews.sql` (Phase 2 follow-up — completes the
original Phase 2 scope),
`0006_pillar_rebuild.sql` (adds `exercise_logs`, seeds Spirit-pillar
habits). All six have now been run against a real, connected Supabase
project (GitHub → Netlify Functions → Supabase all confirmed live).

### `exercise_logs` — **implemented** in `0006_pillar_rebuild.sql`
Body pillar's exercise tracking. `category`
(`strength | aerobic | stretching`), `activity` (free text), `duration_minutes`,
`notes`, `logged_at`. Deliberately a quick log, not detailed tracking — no
sets/reps/weight/pace fields, per the chosen scope.
