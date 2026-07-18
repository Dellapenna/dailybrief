import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/tasks             GET (list, optional ?view= and ?pillar=), POST (create)
 * /api/tasks/:id         PATCH (update), DELETE
 * /api/tasks/summary     GET — counts per pillar, excluding completed, for
 *                         Mission Control's cross-pillar To-Do summary
 *
 * Quick-capture + Smart Today model (see docs/BUILD_PLAN.md Phase 2):
 * no Areas/tags/nested projects, just status + flagged + due_date. The
 * "Smart Today" view a client asks for via ?view=today is computed here,
 * not stored — it's "status = today" OR "due_date <= today" OR "flagged",
 * excluding completed. ?pillar=body|mind|spirit|life|work|intelligence
 * filters to that pillar's tasks — added for the pillar-based nav
 * rebuild; omitting it returns the global all-pillars view.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean) // ['api', 'tasks', maybe id or 'summary']
  const isSummary = segments[2] === 'summary'
  const maybeId = segments[2]
  const id = !isSummary && maybeId && UUID_RE.test(maybeId) ? maybeId : null

  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    if (req.method === 'GET' && isSummary) {
      const { data, error } = await supabase
        .from('tasks')
        .select('pillar_id')
        .eq('user_id', userId)
        .neq('status', 'completed')
      if (error) return errorResponse(error, 500)

      const counts: Record<string, number> = {}
      for (const row of data ?? []) {
        const key = row.pillar_id ?? 'none'
        counts[key] = (counts[key] ?? 0) + 1
      }
      return json({ counts })
    }

    if (req.method === 'GET' && !id) {
      const view = url.searchParams.get('view') // 'today' | 'inbox' | 'this_week' | 'someday' | 'waiting' | 'completed' | null
      const pillar = url.searchParams.get('pillar')

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (pillar) query = query.eq('pillar_id', pillar)

      if (view === 'today') {
        const today = new Date().toISOString().slice(0, 10)
        query = query
          .neq('status', 'completed')
          .or(`status.eq.today,flagged.eq.true,due_date.lte.${today}`)
      } else if (view) {
        query = query.eq('status', view)
      } else {
        query = query.neq('status', 'completed')
      }

      const { data, error } = await query
      if (error) return errorResponse(error, 500)
      return json({ tasks: data })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.title || typeof body.title !== 'string') {
        return json({ error: 'title is required' }, 400)
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: body.title,
          notes: body.notes ?? null,
          pillar_id: body.pillarId ?? null,
          project: body.project ?? null,
          status: body.status ?? 'inbox',
          flagged: Boolean(body.flagged),
          due_date: body.dueDate ?? null,
          source: body.source ?? 'manual',
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ task: data }, 201)
    }

    if (req.method === 'PATCH' && id) {
      const body = await req.json()
      const updates: Record<string, unknown> = {}
      for (const key of ['title', 'notes', 'pillarId', 'project', 'status', 'flagged', 'dueDate', 'sortOrder'] as const) {
        if (key in body) {
          const column = key === 'pillarId' ? 'pillar_id' : key === 'dueDate' ? 'due_date' : key === 'sortOrder' ? 'sort_order' : key
          updates[column] = body[key]
        }
      }
      if (updates.status === 'completed') {
        updates.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ task: data })
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/tasks', '/api/tasks/:id', '/api/tasks/summary'],
}
