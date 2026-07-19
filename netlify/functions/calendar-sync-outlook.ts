import type { Config, Context } from '@netlify/functions'
import { json } from './shared/http'

/**
 * POST /api/calendar/sync/outlook — NOT YET IMPLEMENTED.
 *
 * Outlook/Microsoft 365 requires an Azure AD app registration (Microsoft
 * Entra admin center) before any code here can run — a manual setup step
 * outside this codebase. Once you've done that:
 *   1. Add the Azure app's client ID/secret + tenant ID, plus a stored
 *      refresh token, as Netlify env vars.
 *   2. This function swaps to calling Microsoft Graph's
 *      /me/calendarView endpoint and normalizes results the same way
 *      calendar-sync-icloud.ts does (see that file for the target shape).
 *   3. calendar-events.ts and the frontend need zero changes — same
 *      provider-agnostic calendar_events cache table.
 */
export default async (_req: Request, _context: Context) => {
  return json(
    {
      error:
        'Outlook Calendar sync is not implemented yet — it requires an Azure AD app registration first. See the comment in this file / docs/INTEGRATIONS.md.',
    },
    501,
  )
}

export const config: Config = {
  path: '/api/calendar/sync/outlook',
}
