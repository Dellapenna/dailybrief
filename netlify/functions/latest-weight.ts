import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/latest-weight
 *
 * Most recent weight from morning_checkins (optional field there) —
 * used as the basis for the MET-formula calorie-burn estimate on
 * Exercise Log. Returns null if no weight has ever been logged, so the
 * frontend can fall back to a clearly-labeled default rather than
 * silently guessing.
 */
export default async (_req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const { data, error } = await supabase
      .from('morning_checkins')
      .select('weight, checkin_date')
      .eq('user_id', userId)
      .not('weight', 'is', null)
      .order('checkin_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return errorResponse(error, 500)
    return json({ weightLbs: data?.weight ?? null, asOf: data?.checkin_date ?? null })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/latest-weight',
}
