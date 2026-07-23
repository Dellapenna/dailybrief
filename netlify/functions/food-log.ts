import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { json, errorResponse } from './shared/http'

/**
 * /api/food-log       GET (today's entries + total, or ?date=YYYY-MM-DD
 *                      for another day), POST (create)
 * /api/food-log/:id    PATCH (update), DELETE
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
      const totalProtein = (logs ?? []).reduce((sum, l) => sum + (l.protein_g ?? 0) * l.quantity, 0)
      const totalSugar = (logs ?? []).reduce((sum, l) => sum + (l.sugar_g ?? 0) * l.quantity, 0)

      const { data: prefs, error: prefsError } = await supabase
        .from('user_preferences')
        .select('daily_calorie_goal, daily_protein_goal, daily_sugar_limit')
        .eq('user_id', userId)
        .single()
      if (prefsError) return errorResponse(prefsError, 500)

      // Exercise "earns back" calories — exercise_logs only has a
      // timestamptz (not a plain date column like food_logs), so this
      // uses the UTC day boundary of logDate as an approximation rather
      // than an exact local-timezone match; close enough for a rough
      // daily total, same tradeoff as anywhere a plain date comparison
      // isn't available.
      const { data: exerciseLogs, error: exerciseError } = await supabase
        .from('exercise_logs')
        .select('calories_burned')
        .eq('user_id', userId)
        .gte('logged_at', `${logDate}T00:00:00Z`)
        .lt('logged_at', `${logDate}T23:59:59.999Z`)
      if (exerciseError) return errorResponse(exerciseError, 500)
      const caloriesBurnedToday = (exerciseLogs ?? []).reduce((sum, l) => sum + (l.calories_burned ?? 0), 0)

      return json({
        logs,
        totalCalories,
        dailyCalorieGoal: prefs?.daily_calorie_goal ?? null,
        totalProtein: Math.round(totalProtein),
        dailyProteinGoal: prefs?.daily_protein_goal ?? null,
        totalSugar: Math.round(totalSugar),
        dailySugarLimit: prefs?.daily_sugar_limit ?? null,
        caloriesBurnedToday,
        date: logDate,
      })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.foodName || typeof body.foodName !== 'string') {
        return json({ error: 'foodName is required' }, 400)
      }
      if (typeof body.calories !== 'number') {
        return json({ error: 'calories is required' }, 400)
      }

      let loggedDate = body.loggedDate
      if (!loggedDate) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('timezone')
          .eq('id', userId)
          .single()
        if (profileError) return errorResponse(profileError, 500)
        loggedDate = todayInTimezone(profile?.timezone || 'America/New_York')
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
          sugar_g: body.sugarG ?? null,
          quantity: body.quantity ?? 1,
          fdc_id: body.fdcId ?? null,
          logged_date: loggedDate,
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ log: data }, 201)
    }

    if (req.method === 'PATCH' && id) {
      const body = await req.json()
      const updates: Record<string, unknown> = {}
      for (const key of ['foodName', 'meal', 'calories', 'proteinG', 'carbsG', 'fatG', 'sugarG', 'quantity', 'loggedDate'] as const) {
        if (key in body) {
          const column =
            key === 'foodName' ? 'food_name'
            : key === 'proteinG' ? 'protein_g'
            : key === 'carbsG' ? 'carbs_g'
            : key === 'fatG' ? 'fat_g'
            : key === 'sugarG' ? 'sugar_g'
            : key === 'loggedDate' ? 'logged_date'
            : key
          updates[column] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('food_logs')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ log: data })
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
