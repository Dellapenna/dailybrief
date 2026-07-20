import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/sports-preferences        GET (list), POST (add a team)
 * /api/sports-preferences/:id    DELETE (remove a team)
 *
 * Team names are matched against TheSportsDB's searchteams.php, so they
 * need to be reasonably close to the team's real name (e.g. "Philadelphia
 * Eagles", not "Eagles") — sports.ts silently skips any team it can't
 * resolve rather than erroring the whole request.
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
      const { data, error } = await supabase
        .from('sports_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) return errorResponse(error, 500)
      return json({ teams: data })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.teamName || typeof body.teamName !== 'string') {
        return json({ error: 'teamName is required' }, 400)
      }

      const { data, error } = await supabase
        .from('sports_preferences')
        .insert({ user_id: userId, team_name: body.teamName.trim() })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') return json({ error: 'That team is already in your list' }, 409)
        return errorResponse(error, 500)
      }
      return json({ team: data }, 201)
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('sports_preferences').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/sports-preferences', '/api/sports-preferences/:id'],
}
