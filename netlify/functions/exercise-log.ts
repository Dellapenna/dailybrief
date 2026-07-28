import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { json, errorResponse } from './shared/http'

/**
 * /api/exercise-log       GET (list, most recent first), POST (create)
 * /api/exercise-log/:id   DELETE
 *
 * Quick log, not detailed tracking: category + activity name + duration
 * + notes + optional calories_burned. No sets/reps/weight/pace fields —
 * deliberately simple per the chosen scope; can add structured fields
 * later if wanted. calories_burned is either entered manually or a
 * MET-formula estimate computed client-side (see ExerciseLogCard.tsx) —
 * always editable before it's logged, never silently treated as more
 * precise than a category-level estimate actually is.
 *
 * logged_date stores the user's actual local calendar date (computed
 * here at insert time), not derived later from logged_at's UTC
 * timestamp — food-log.ts's "today's calories burned" query used to do
 * that derivation via a UTC day-boundary approximation, which could
 * miss evening workouts entirely in US timezones. See 0022 migration.
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
      const limit = Number(url.searchParams.get('limit') ?? '20')
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(Number.isFinite(limit) ? limit : 20)
      if (error) return errorResponse(error, 500)
      return json({ logs: data })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.category || !['strength', 'aerobic', 'stretching'].includes(body.category)) {
        return json({ error: 'category must be strength, aerobic, or stretching' }, 400)
      }
      if (!body?.activity || typeof body.activity !== 'string') {
        return json({ error: 'activity is required' }, 400)
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', userId)
        .single()
      if (profileError) return errorResponse(profileError, 500)
      const loggedDate = body.loggedDate ?? todayInTimezone(profile?.timezone || 'America/New_York')

      const { data, error } = await supabase
        .from('exercise_logs')
        .insert({
          user_id: userId,
          category: body.category,
          activity: body.activity,
          duration_minutes: body.durationMinutes ?? null,
          calories_burned: body.caloriesBurned ?? null,
          notes: body.notes ?? null,
          logged_at: body.loggedAt ?? new Date().toISOString(),
          logged_date: loggedDate,
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ log: data }, 201)
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('exercise_logs').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/exercise-log', '/api/exercise-log/:id'],
}
