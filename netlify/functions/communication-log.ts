import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/communication-log       GET (list, most recent first), POST (create)
 * /api/communication-log/:id   DELETE
 *
 * Log a real interaction (a hard conversation, a presentation, giving
 * feedback) and reflect: what went well, what to improve. This is where
 * actual skill-building happens, as opposed to communication-tip.ts's
 * passive daily tip.
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
        .from('communication_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(Number.isFinite(limit) ? limit : 20)
      if (error) return errorResponse(error, 500)
      return json({ logs: data })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.situation || typeof body.situation !== 'string') {
        return json({ error: 'situation is required' }, 400)
      }

      const { data, error } = await supabase
        .from('communication_logs')
        .insert({
          user_id: userId,
          situation: body.situation,
          went_well: body.wentWell ?? null,
          improve: body.improve ?? null,
          logged_at: body.loggedAt ?? new Date().toISOString(),
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ log: data }, 201)
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('communication_logs').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/communication-log', '/api/communication-log/:id'],
}
