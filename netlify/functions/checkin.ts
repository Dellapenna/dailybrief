import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/checkin   GET (today's check-in, or nulls if none yet), PATCH (upsert today's)
 * All fields nullable — per the brief, nothing here is mandatory.
 */

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default async (req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()
    const today = todayStr()

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('morning_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('checkin_date', today)
        .maybeSingle()
      if (error) return errorResponse(error, 500)
      return json({ checkin: data })
    }

    if (req.method === 'PATCH') {
      const body = await req.json()
      const updates: Record<string, unknown> = { user_id: userId, checkin_date: today }
      for (const key of [
        'sleepDuration', 'sleepQuality', 'energy', 'mood', 'stress', 'glucose', 'weight',
        'symptoms', 'plannedExercise', 'biggestConcern', 'mostImportantOutcome',
      ] as const) {
        if (key in body) {
          const column = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          updates[column] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('morning_checkins')
        .upsert(updates, { onConflict: 'user_id,checkin_date' })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ checkin: data })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/checkin',
}
