import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { requireEnv } from './shared/env'

/**
 * GET /api/calendar/oauth/google/callback
 *
 * Google redirects here after the person approves access, with a
 * one-time `code`. Exchanges it for an access + refresh token, stores
 * both on the calendar_connections row, then redirects back to
 * /settings so the person sees the result in the app rather than a bare
 * JSON response.
 */
function redirectWithMessage(base: string, message: string, success = false): Response {
  const url = `${base}?calendarMessage=${encodeURIComponent(message)}&calendarSuccess=${success}`
  return new Response(null, { status: 302, headers: { Location: url } })
}

export default async (req: Request, _context: Context) => {
  const origin = new URL(req.url).origin
  const settingsUrl = `${origin}/settings`

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const oauthError = url.searchParams.get('error')

    if (oauthError) {
      return redirectWithMessage(settingsUrl, `Google Calendar: ${oauthError}`)
    }
    if (!code) {
      return redirectWithMessage(settingsUrl, 'Google Calendar: no authorization code returned')
    }

    const clientId = requireEnv('GOOGLE_CLIENT_ID')
    const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET')
    const redirectUri = `${origin}/api/calendar/oauth/google/callback`

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      // eslint-disable-next-line no-console
      console.error('Google OAuth token exchange failed:', errText)
      return redirectWithMessage(settingsUrl, `Google Calendar: token exchange failed (${tokenRes.status})`)
    }

    const tokenData = await tokenRes.json()
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    await supabase.from('calendar_connections').upsert(
      {
        user_id: userId,
        provider: 'google',
        display_name: 'Google Calendar',
        status: 'connected',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token ?? null,
        token_expires_at: expiresAt,
        last_error: null,
      },
      { onConflict: 'user_id,provider' },
    )

    return redirectWithMessage(settingsUrl, 'Google Calendar connected! Tap Sync now to pull events.', true)
  } catch (err) {
    return redirectWithMessage(settingsUrl, `Google Calendar: ${err instanceof Error ? err.message : 'connection failed'}`)
  }
}

export const config: Config = {
  path: '/api/calendar/oauth/google/callback',
}
