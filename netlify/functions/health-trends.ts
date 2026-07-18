import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/health-trends?days=14
 *
 * Read-only history of morning_checkins for Body's trend view — the
 * check-in *form* itself still lives on Mission Control (it's the daily
 * ritual), this just surfaces the resulting health data over time.
 */
export default async (req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()
    const url = new URL(req.url)
    const days = Number(url.searchParams.get('days') ?? '14')

    const since = new Date()
    since.setDate(since.getDate() - (Number.isFinite(days) ? days : 14))

    const { data, error } = await supabase
      .from('morning_checkins')
      .select('checkin_date, sleep_duration, sleep_quality, energy, mood, stress, glucose, weight')
      .eq('user_id', userId)
      .gte('checkin_date', since.toISOString().slice(0, 10))
      .order('checkin_date', { ascending: true })

    if (error) return errorResponse(error, 500)
    return json({ checkins: data })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/health-trends',
}
