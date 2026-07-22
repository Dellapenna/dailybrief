import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { json, errorResponse } from './shared/http'

/**
 * /api/water-log   GET (today's glass count), PATCH (set glass count for today)
 *
 * One row per day, a simple integer count of 8oz glasses — not a log of
 * individual pours. "Today" uses the user's stored timezone, same
 * pattern as habits/checkin/evening-review.
 */

const DAILY_GOAL_GLASSES = 8 // 8 x 8oz = 64oz, the common daily-recommendation

export default async (req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .single()
    if (profileError) return errorResponse(profileError, 500)
    const today = todayInTimezone(profile?.timezone || 'America/New_York')

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('water_logs')
        .select('glasses_consumed')
        .eq('user_id', userId)
        .eq('logged_date', today)
        .maybeSingle()
      if (error) return errorResponse(error, 500)

      return json({ glassesConsumed: data?.glasses_consumed ?? 0, goalGlasses: DAILY_GOAL_GLASSES, date: today })
    }

    if (req.method === 'PATCH') {
      const body = await req.json()
      const glasses = Number(body?.glassesConsumed)
      if (!Number.isFinite(glasses) || glasses < 0) {
        return json({ error: 'glassesConsumed must be a non-negative number' }, 400)
      }

      const { data, error } = await supabase
        .from('water_logs')
        .upsert(
          { user_id: userId, logged_date: today, glasses_consumed: glasses, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,logged_date' },
        )
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ glassesConsumed: data.glasses_consumed, goalGlasses: DAILY_GOAL_GLASSES, date: today })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/water-log',
}
