-- 0015_task_biweekly_recurrence.sql
-- Adds "biweekly" (every 2 weeks) as a recurrence option, per request.

alter table public.tasks drop constraint tasks_recurrence_check;

alter table public.tasks
  add constraint tasks_recurrence_check
  check (recurrence in ('none', 'daily', 'weekly', 'biweekly', 'monthly'));
