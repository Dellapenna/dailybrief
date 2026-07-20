import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * POST /api/calendar/sync/google
 *
 * Pulls events from every calendar in the connected Google account for a
 * rolling window (yesterday through +30 days), same window as
 * calendar-sync-icloud.ts. Requires the OAuth connection flow
 * (calendar-oauth-google-start.ts) to have been completed first — this
 * function refreshes the access token if it's expired, but can't create
 * the initial connection itself.
 */

type GoogleEvent = {
  id: string
  summary?: string
  location?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
}

async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: string }> {
  const clientId = requireEnv('GOOGLE_CLIENT_ID')
  const clientSecret = requireEnv('GOOGLE_CLIENT_SECRET')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Failed to refresh Google access token (${res.status})`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  }
}

export default async (_req: Request, _context: Context) => {
  const supabase = getSupabaseAdmin()
  const userId = getPrimaryUserId()

  let connectionId: string | null = null

  try {
    const { data: connection, error: connError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .maybeSingle()
    if (connError) throw connError
    if (!connection || !connection.refresh_token) {
      return json(
        { error: 'Google Calendar is not connected yet — connect it in Settings first.' },
        400,
      )
    }
    connectionId = connection.id
    const connId: string = connection.id

    let accessToken = connection.access_token as string
    const expired = !connection.token_expires_at || new Date(connection.token_expires_at) <= new Date()

    if (expired) {
      const refreshed = await refreshAccessToken(connection.refresh_token)
      accessToken = refreshed.accessToken
      await supabase
        .from('calendar_connections')
        .update({ access_token: refreshed.accessToken, token_expires_at: refreshed.expiresAt })
        .eq('id', connectionId)
    }

    const rangeStart = new Date()
    rangeStart.setDate(rangeStart.getDate() - 1)
    const rangeEnd = new Date()
    rangeEnd.setDate(rangeEnd.getDate() + 30)

    const calListRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!calListRes.ok) throw new Error(`Failed to list Google calendars (${calListRes.status})`)
    const calListData = await calListRes.json()
    const calendarIds: string[] = (calListData.items ?? []).map((c: { id: string }) => c.id)

    type NormalizedEvent = {
      user_id: string
      connection_id: string
      provider: 'google'
      provider_event_id: string
      title: string
      location: string | null
      starts_at: string
      ends_at: string | null
      all_day: boolean
      synced_at: string
    }

    const normalized: NormalizedEvent[] = []

    for (const calendarId of calendarIds) {
      const params = new URLSearchParams({
        timeMin: rangeStart.toISOString(),
        timeMax: rangeEnd.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '250',
      })
      const eventsRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      if (!eventsRes.ok) continue // one bad calendar shouldn't fail the whole sync
      const eventsData = await eventsRes.json()
      const events: GoogleEvent[] = eventsData.items ?? []

      for (const event of events) {
        const startsAt = event.start?.dateTime ?? event.start?.date
        if (!startsAt) continue
        const allDay = !event.start?.dateTime
        normalized.push({
          user_id: userId,
          connection_id: connId,
          provider: 'google',
          provider_event_id: event.id,
          title: event.summary ?? '(untitled event)',
          location: event.location ?? null,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: event.end?.dateTime ? new Date(event.end.dateTime).toISOString() : null,
          all_day: allDay,
          synced_at: new Date().toISOString(),
        })
      }
    }

    if (normalized.length > 0) {
      const { error: upsertError } = await supabase
        .from('calendar_events')
        .upsert(normalized, { onConflict: 'user_id,provider,provider_event_id' })
      if (upsertError) throw upsertError
    }

    await supabase
      .from('calendar_connections')
      .update({ status: 'connected', last_synced_at: new Date().toISOString(), last_error: null })
      .eq('id', connectionId)

    return json({ synced: normalized.length, calendars: calendarIds.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (connectionId) {
      await supabase.from('calendar_connections').update({ status: 'error', last_error: message }).eq('id', connectionId)
    }
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/calendar/sync/google',
}
