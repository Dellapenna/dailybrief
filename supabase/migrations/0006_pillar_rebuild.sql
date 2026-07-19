-- 0006_pillar_rebuild.sql
-- Supports the pillar-based navigation rebuild (Mission Control / Body /
-- Mind / Spirit / Life / Work / Intelligence). Tasks, goals, and habits
-- already have pillar_id from earlier migrations — no schema change
-- needed there, just new filtering in the Functions layer. This
-- migration adds what's genuinely new: exercise logging, and seeds the
-- two Spirit practices (Prayer, Breathing Meditation) as habits so they
-- get streak tracking for free via the existing habits/habit_entries
-- system rather than building parallel tracking logic.

-- ─────────────────────────────────────────────────────────────────────────
-- exercise_logs — quick log: category + activity + duration + notes.
-- Deliberately not detailed (no sets/reps/weight/pace) per the chosen
-- scope — can add structured fields later if wanted.
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('strength', 'aerobic', 'stretching')),
  activity text not null,
  duration_minutes int,
  notes text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.exercise_logs enable row level security;
-- No policies — default-deny, service-role key only. See DATABASE_SCHEMA.md.

create index if not exists exercise_logs_user_logged_idx on public.exercise_logs (user_id, logged_at);

-- ─────────────────────────────────────────────────────────────────────────
-- Seed Prayer and Breathing Meditation as Spirit-pillar habits, so
-- Spirit's streak tracking reuses the existing habits/habit_entries
-- system instead of new parallel logic. These two rows are found by name
-- in the Spirit Functions rather than by a hardcoded ID (simpler than
-- threading generated UUIDs through migration + application code).
-- Guarded with a not-exists check (no unique constraint to hang an
-- ON CONFLICT off of) so this migration is safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────
insert into public.habits (user_id, name, pillar_id, frequency, target)
select '11111111-1111-1111-1111-111111111111', 'Prayer', 'spirit', 'daily', 1
where not exists (select 1 from public.habits where name = 'Prayer' and pillar_id = 'spirit');

insert into public.habits (user_id, name, pillar_id, frequency, target)
select '11111111-1111-1111-1111-111111111111', 'Breathing Meditation', 'spirit', 'daily', 1
where not exists (select 1 from public.habits where name = 'Breathing Meditation' and pillar_id = 'spirit');
