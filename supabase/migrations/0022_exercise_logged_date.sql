-- 0022_exercise_logged_date.sql
-- Real bug fix: food-log.ts was matching today's exercise by a UTC day
-- boundary around logged_at (a timestamptz), rather than the user's
-- actual local date — exercise logged in the evening in a US timezone
-- can land on the *next* UTC calendar day, making it invisible to
-- "today's" burned-calories query entirely (shows as +0 burned despite
-- being logged). food_logs and water_logs already avoid this by
-- storing a plain local date directly; exercise_logs now does too.

alter table public.exercise_logs
  add column logged_date date;

-- Backfill existing rows as best effort — approximates local date from
-- the stored timestamp using the profile's timezone. Going forward,
-- every new row gets an exact local date computed at insert time (see
-- exercise-log.ts), so this approximation only affects historical rows.
update public.exercise_logs e
set logged_date = (e.logged_at at time zone coalesce(p.timezone, 'America/New_York'))::date
from public.profiles p
where p.id = e.user_id and e.logged_date is null;
