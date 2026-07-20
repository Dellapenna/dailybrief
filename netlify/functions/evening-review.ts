import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { json, errorResponse } from './shared/http'

/**
 * /api/evening-review   GET (today's review, or nulls), PATCH (upsert today's)
 * "Today" is computed in the user's stored timezone, not server UTC.
 */

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
        .from('evening_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('review_date', today)
        .maybeSingle()
      if (error) return errorResponse(error, 500)
      return json({ review: data })
    }

    if (req.method === 'PATCH') {
      const body = await req.json()
      const updates: Record<string, unknown> = { user_id: userId, review_date: today }
      for (const key of ['wentWell', 'wentPoorly', 'lesson', 'tomorrowFocus', 'dayRating'] as const) {
        if (key in body) {
          const column = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          updates[column] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('evening_reviews')
        .upsert(updates, { onConflict: 'user_id,review_date' })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ review: data })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/evening-review',
}
