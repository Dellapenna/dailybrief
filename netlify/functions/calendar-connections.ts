import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/** /api/calendar/connections  GET — status only, for the Settings page. */
export default async (_req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const { data, error } = await supabase
      .from('calendar_connections')
      .select('provider, display_name, status, last_synced_at, last_error')
      .eq('user_id', userId)

    if (error) return errorResponse(error, 500)
    return json({ connections: data })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/calendar/connections',
}
