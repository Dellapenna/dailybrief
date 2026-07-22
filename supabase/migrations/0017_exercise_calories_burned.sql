-- 0017_exercise_calories_burned.sql
-- Adds calories_burned to exercise_logs, so a workout can "earn back"
-- calories on the Calorie Counter. Either entered manually or a
-- MET-formula estimate (shown editable before logging, never silently
-- treated as more precise than it is) — see exercise-log.ts and
-- ExerciseLogCard.tsx.

alter table public.exercise_logs
  add column calories_burned integer;
