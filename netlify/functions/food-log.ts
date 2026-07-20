import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { json, errorResponse } from './shared/http'

/**
 * /api/food-log       GET (today's entries + total, or ?date=YYYY-MM-DD
 *                      for another day), POST (create)
 * /api/food-log/:id    DELETE
 *
 * "Today" uses the user's stored timezone, same fix as habits/checkin/
 * evening-review/horoscope — see shared/userTimezone.ts.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const maybeId = segments[2]
  const id = maybeId && UUID_RE.test(maybeId) ? maybeId : null

  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    if (req.method === 'GET' && !id) {
      const dateParam = url.searchParams.get('date')
      let logDate = dateParam

      if (!logDate) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('id', userId)
          .single()
        if (profileError) return errorResponse(profileError, 500)
        logDate = todayInTimezone(profile?.timezone || 'America/New_York')
      }

      const { data: logs, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('logged_date', logDate)
        .order('created_at', { ascending: true })
      if (error) return errorResponse(error, 500)

      const totalCalories = (logs ?? []).reduce((sum, l) => sum + l.calories * l.quantity, 0)

      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('daily_calorie_goal')
        .eq('user_id', userId)
        .single()
      if (prefsError) return errorResponse(prefsError, 500)

      return json({ logs, totalCalories, dailyCalorieGoal: prefs?.daily_calorie_goal ?? null, date: logDate })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.foodName || typeof body.foodName !== 'string') {
        return json({ error: 'foodName is required' }, 400)
      }
      if (typeof body.calories !== 'number') {
        return json({ error: 'calories is required' }, 400)
      }

      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: userId,
          food_name: body.foodName,
          meal: body.meal ?? 'snack',
          calories: body.calories,
          protein_g: body.proteinG ?? null,
          carbs_g: body.carbsG ?? null,
          fat_g: body.fatG ?? null,
          quantity: body.quantity ?? 1,
          fdc_id: body.fdcId ?? null,
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ log: data }, 201)
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('food_logs').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/food-log', '/api/food-log/:id'],
}
