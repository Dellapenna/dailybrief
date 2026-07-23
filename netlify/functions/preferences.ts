import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/** /api/preferences  GET, PATCH */
export default async (req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error) return errorResponse(error, 500)
      return json({ preferences: data })
    }

    if (req.method === 'PATCH') {
      const body = await req.json()
      const updates: Record<string, unknown> = {}
      for (const key of [
        'locationLabel', 'locationLat', 'locationLng', 'weatherUnits', 'zodiacSign', 'dailyCalorieGoal', 'dailyProteinGoal',
      ] as const) {
        if (key in body) {
          const column =
            key === 'locationLabel'
              ? 'location_label'
              : key === 'locationLat'
                ? 'location_lat'
                : key === 'locationLng'
                  ? 'location_lng'
                  : key === 'zodiacSign'
                    ? 'zodiac_sign'
                    : key === 'dailyCalorieGoal'
                      ? 'daily_calorie_goal'
                      : key === 'dailyProteinGoal'
                        ? 'daily_protein_goal'
                        : 'weather_units'
          updates[column] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()
      if (error) return errorResponse(error, 500)
      return json({ preferences: data })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/preferences',
}
