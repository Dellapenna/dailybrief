-- 0011_task_recurrence.sql
-- Adds simple recurrence to tasks (none/daily/weekly/monthly) — not a
-- full RRULE system, matching the app's "quick, not exhaustively
-- detailed" philosophy elsewhere (Exercise Log, etc.). When a recurring
-- task is completed, tasks.ts advances its due_date to the next
-- occurrence and keeps it active, rather than marking it permanently
-- completed — see that Function for the actual logic.

alter table public.tasks
  add column recurrence text not null default 'none'
    check (recurrence in ('none', 'daily', 'weekly', 'monthly'));
