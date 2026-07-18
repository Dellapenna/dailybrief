import type { Config, Context } from '@netlify/functions'
import { createDAVClient, fetchCalendarObjects } from 'tsdav'
import ICAL from 'ical.js'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * POST /api/calendar/sync/icloud
 *
 * Pulls events from every calendar in the connected iCloud account for a
 * rolling window (yesterday through +30 days) and upserts them into
 * calendar_events. Meant to be called from a Netlify Scheduled Function
 * (not built yet — Phase 4/5 territory) or manually via a "Sync now"
 * button in Settings.
 *
 * Auth: iCloud CalDAV uses Basic auth with an **app-specific password**
 * (not your real Apple ID password) — generate one at
 * https://appleid.apple.com → Sign-In and Security → App-Specific
 * Passwords. Store it as ICLOUD_APP_SPECIFIC_PASSWORD; your Apple ID
 * email goes in ICLOUD_APPLE_ID. See docs/INTEGRATIONS.md.
 */
export default async (_req: Request, _context: Context) => {
  const supabase = getSupabaseAdmin()
  const userId = getPrimaryUserId()

  let connectionId: string | null = null

  try {
    const appleId = requireEnv('ICLOUD_APPLE_ID')
    const appSpecificPassword = requireEnv('ICLOUD_APP_SPECIFIC_PASSWORD')

    // Ensure a calendar_connections row exists for this provider so the UI
    // has something to show even before the first successful sync.
    const { data: connection, error: upsertConnError } = await supabase
      .from('calendar_connections')
      .upsert(
        { user_id: userId, provider: 'icloud', display_name: 'iCloud Calendar' },
        { onConflict: 'user_id,provider' },
      )
      .select()
      .single()
    if (upsertConnError) throw upsertConnError
    connectionId = connection.id
    const connId: string = connection.id

    const client = await createDAVClient({
      serverUrl: 'https://caldav.icloud.com',
      credentials: { username: appleId, password: appSpecificPassword },
      authMethod: 'Basic',
      defaultAccountType: 'caldav',
    })

    const calendars = await client.fetchCalendars()

    const rangeStart = new Date()
    rangeStart.setDate(rangeStart.getDate() - 1)
    const rangeEnd = new Date()
    rangeEnd.setDate(rangeEnd.getDate() + 30)

    type NormalizedEvent = {
      user_id: string
      connection_id: string
      provider: 'icloud'
      provider_event_id: string
      title: string
      location: string | null
      starts_at: string
      ends_at: string | null
      all_day: boolean
      synced_at: string
    }

    const normalized: NormalizedEvent[] = []

    for (const calendar of calendars) {
      const objects = await fetchCalendarObjects({
        calendar,
        timeRange: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },
      })

      for (const obj of objects) {
        if (!obj.data) continue
        try {
          const jcalData = ICAL.parse(obj.data)
          const comp = new ICAL.Component(jcalData)
          const vevents = comp.getAllSubcomponents('vevent')

          for (const vevent of vevents) {
            const event = new ICAL.Event(vevent)
            normalized.push({
              user_id: userId,
              connection_id: connId,
              provider: 'icloud',
              provider_event_id: event.uid ?? `${calendar.url}-${obj.url}`,
              title: event.summary ?? '(untitled event)',
              location: event.location ?? null,
              starts_at: event.startDate.toJSDate().toISOString(),
              ends_at: event.endDate ? event.endDate.toJSDate().toISOString() : null,
              all_day: event.startDate.isDate,
              synced_at: new Date().toISOString(),
            })
          }
        } catch {
          // One malformed event shouldn't take down the whole sync.
          continue
        }
      }
    }

    if (normalized.length > 0) {
      const { error: upsertEventsError } = await supabase
        .from('calendar_events')
        .upsert(normalized, { onConflict: 'user_id,provider,provider_event_id' })
      if (upsertEventsError) throw upsertEventsError
    }

    await supabase
      .from('calendar_connections')
      .update({ status: 'connected', last_synced_at: new Date().toISOString(), last_error: null })
      .eq('id', connectionId)

    return json({ synced: normalized.length, calendars: calendars.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (connectionId) {
      await supabase
        .from('calendar_connections')
        .update({ status: 'error', last_error: message })
        .eq('id', connectionId)
    }
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/calendar/sync/icloud',
}
