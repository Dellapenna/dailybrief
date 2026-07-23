import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * Reads the single primary user's profile + preferences.
 * Reference implementation for the "no client-side Supabase key, service
 * role + PRIMARY_USER_ID" pattern every future data function follows.
 * Not auth-gated by Supabase (there's no session) — this whole site sits
 * behind Netlify Password Protection instead.
 */
export default async (_req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const [{ data: profile, error: profileError }, { data: preferences, error: prefsError }] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
      ])

    if (profileError || prefsError) {
      return errorResponse(profileError ?? prefsError, 500)
    }

    return json({ profile, preferences })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/profile',
}
