import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'

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
      return new Response(
        JSON.stringify({ error: (profileError ?? prefsError)?.message ?? 'Unknown error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    return new Response(JSON.stringify({ profile, preferences }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

export const config: Config = {
  path: '/api/profile',
}
