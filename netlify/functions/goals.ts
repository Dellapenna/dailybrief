import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/goals       GET (list, optional ?status=), POST (create)
 * /api/goals/:id   PATCH (update), DELETE
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function camelToSnake(key: string) {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase()
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const maybeId = segments[2]
  const id = maybeId && UUID_RE.test(maybeId) ? maybeId : null

  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    if (req.method === 'GET' && !id) {
      const status = url.searchParams.get('status')
      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) return errorResponse(error, 500)
      return json({ goals: data })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.title || typeof body.title !== 'string') {
        return json({ error: 'title is required' }, 400)
      }

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: body.title,
          pillar_id: body.pillarId ?? null,
          target_date: body.targetDate ?? null,
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ goal: data }, 201)
    }

    if (req.method === 'PATCH' && id) {
      const body = await req.json()
      const updates: Record<string, unknown> = {}
      for (const key of [
        'title', 'description', 'pillarId', 'whyItMatters', 'startDate', 'targetDate',
        'startingPoint', 'targetResult', 'currentResult', 'status', 'weeklyTarget',
        'nextAction', 'obstacles', 'confidenceLevel', 'estimatedProbability',
      ] as const) {
        if (key in body) {
          updates[camelToSnake(key)] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ goal: data })
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/goals', '/api/goals/:id'],
}
