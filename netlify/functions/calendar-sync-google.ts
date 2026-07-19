import type { Config, Context } from '@netlify/functions'
import { json } from './shared/http'

/**
 * POST /api/calendar/sync/google — NOT YET IMPLEMENTED.
 *
 * Google Calendar requires an OAuth app registration in Google Cloud
 * Console (a client ID/secret you create, plus a consent screen) before
 * any code here can run — that's a manual setup step outside this
 * codebase, not something that can be scaffolded away. Once you've done
 * that:
 *   1. Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (already reserved in
 *      .env.example) plus a stored refresh token for your account.
 *   2. This function swaps to calling the Calendar API v3 events.list
 *      endpoint and normalizes results the same way
 *      calendar-sync-icloud.ts does (see that file for the target shape).
 *   3. The calendar-events.ts read endpoint and the frontend need zero
 *      changes — they already read from the provider-agnostic
 *      calendar_events cache table.
 */
export default async (_req: Request, _context: Context) => {
  return json(
    {
      error:
        'Google Calendar sync is not implemented yet — it requires a Google Cloud OAuth app registration first. See the comment in this file / docs/INTEGRATIONS.md.',
    },
    501,
  )
}

export const config: Config = {
  path: '/api/calendar/sync/google',
}
