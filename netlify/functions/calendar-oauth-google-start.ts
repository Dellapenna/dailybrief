import type { Config, Context } from '@netlify/functions'
import { requireEnv } from './shared/env'
import { json } from './shared/http'

/**
 * GET /api/calendar/oauth/google/start
 *
 * Kicks off Google's OAuth flow — the person taps "Connect Google
 * Calendar" in Settings, which links here, which redirects to Google's
 * consent screen. Requires a Google Cloud OAuth app registered first
 * (manual setup outside this codebase — see docs/INTEGRATIONS.md):
 *   1. console.cloud.google.com → new/existing project → enable the
 *      "Google Calendar API"
 *   2. Configure the OAuth consent screen (External, add yourself as a
 *      test user if it stays in Testing mode)
 *   3. Create an OAuth 2.0 Client ID (Web application), with this exact
 *      redirect URI: <your-site>/api/calendar/oauth/google/callback
 *   4. Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in Netlify env vars
 *
 * access_type=offline + prompt=consent ensures a refresh token is
 * issued (not just a short-lived access token) so sync can keep working
 * without the person re-authenticating every hour.
 */
export default async (req: Request, _context: Context) => {
  try {
    const clientId = requireEnv('GOOGLE_CLIENT_ID')
    const origin = new URL(req.url).origin
    const redirectUri = `${origin}/api/calendar/oauth/google/callback`

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      access_type: 'offline',
      prompt: 'consent',
    })

    return new Response(null, {
      status: 302,
      headers: { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` },
    })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
}

export const config: Config = {
  path: '/api/calendar/oauth/google/start',
}
