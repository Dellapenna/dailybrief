import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/calendar/events?days=7
 * /api/calendar/events?start=2026-08-01&end=2026-09-01   (used by MonthView)
 *
 * Reads the calendar_events cache table only — never calls a calendar
 * provider directly. This keeps the page fast and means one slow/broken
 * provider (see calendar-sync-icloud.ts) never blocks rendering; it just
 * means that provider's events go stale until the next successful sync.
 */
export default async (req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()
    const url = new URL(req.url)

    const startParam = url.searchParams.get('start')
    const endParam = url.searchParams.get('end')

    let start: Date
    let end: Date

    if (startParam && endParam) {
      start = new Date(startParam)
      end = new Date(endParam)
    } else {
      const days = Number(url.searchParams.get('days') ?? '7')
      start = new Date()
      start.setHours(0, 0, 0, 0)
      end = new Date(start)
      end.setDate(end.getDate() + (Number.isFinite(days) ? days : 7))
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('starts_at', start.toISOString())
      .lt('starts_at', end.toISOString())
      .order('starts_at', { ascending: true })

    if (error) return errorResponse(error, 500)

    const { data: connections, error: connError } = await supabase
      .from('calendar_connections')
      .select('provider, status, last_synced_at, last_error')
      .eq('user_id', userId)

    if (connError) return errorResponse(connError, 500)

    return json({ events: data, connections })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/calendar/events',
}
