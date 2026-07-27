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
      const FIELD_MAP: Record<string, string> = {
        locationLabel: 'location_label',
        locationLat: 'location_lat',
        locationLng: 'location_lng',
        weatherUnits: 'weather_units',
        zodiacSign: 'zodiac_sign',
        dailyCalorieGoal: 'daily_calorie_goal',
        dailyProteinGoal: 'daily_protein_goal',
        dailySugarLimit: 'daily_sugar_limit',
        bankStartingBalance: 'bank_starting_balance',
        extraMonthlyDebtPayment: 'extra_monthly_debt_payment',
      }
      for (const [key, column] of Object.entries(FIELD_MAP)) {
        if (key in body) updates[column] = body[key]
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
