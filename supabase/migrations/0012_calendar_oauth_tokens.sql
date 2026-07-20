-- 0012_calendar_oauth_tokens.sql
-- Storage for Google Calendar's OAuth tokens (and reusable for Outlook
-- later, same shape). iCloud doesn't need this — it uses a static
-- app-specific password instead of OAuth.

alter table public.calendar_connections
  add column access_token text,
  add column refresh_token text,
  add column token_expires_at timestamptz;
