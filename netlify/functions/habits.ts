import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { json, errorResponse } from './shared/http'

/**
 * /api/habits                GET (list, with computed streaks), POST (create)
 * /api/habits/:id            PATCH (update), DELETE
 * /api/habits/:id/toggle     POST (toggle today's completion)
 *
 * Streaks and success rate are computed here from habit_entries, never
 * stored — see docs/DATABASE_SCHEMA.md. v1 assumption: every habit is
 * treated as daily-frequency regardless of its `frequency` column; that
 * column is stored for future use but doesn't affect this math yet.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

function computeStreaks(entryDates: Set<string>) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Current streak: walk backward from today (or yesterday, so missing
  // today doesn't zero out an otherwise-intact streak) until a gap.
  let current = 0
  const cursor = new Date(today)
  if (!entryDates.has(toDateStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1) // today not logged yet — check from yesterday
  }
  while (entryDates.has(toDateStr(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  // Longest streak: scan all logged dates sorted ascending for the
  // longest consecutive-day run.
  const sorted = Array.from(entryDates).sort()
  let longest = 0
  let run = 0
  let prev: Date | null = null
  for (const dateStr of sorted) {
    const d = new Date(dateStr + 'T00:00:00')
    if (prev) {
      const diffDays = Math.round((d.getTime() - prev.getTime()) / 86400000)
      run = diffDays === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
    prev = d
  }

  // Success rate over the last 30 days.
  let completedIn30 = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (entryDates.has(toDateStr(d))) completedIn30 += 1
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    successRate30d: Math.round((completedIn30 / 30) * 100),
    completedToday: entryDates.has(toDateStr(today)),
  }
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean) // ['api','habits', maybe id, maybe 'toggle']
  const maybeId = segments[2]
  const id = maybeId && UUID_RE.test(maybeId) ? maybeId : null
  const isToggle = segments[3] === 'toggle'

  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    if (req.method === 'GET' && !id) {
      const { data: habits, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('archived', false)
        .order('sort_order', { ascending: true })
      if (error) return errorResponse(error, 500)

      const results = await Promise.all(
        (habits ?? []).map(async (habit) => {
          const { data: entries, error: entriesError } = await supabase
            .from('habit_entries')
            .select('entry_date, completed')
            .eq('habit_id', habit.id)
            .eq('completed', true)
          if (entriesError) throw entriesError
          const dates = new Set((entries ?? []).map((e) => e.entry_date as string))
          return { ...habit, ...computeStreaks(dates) }
        }),
      )

      return json({ habits: results })
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json()
      if (!body?.name || typeof body.name !== 'string') {
        return json({ error: 'name is required' }, 400)
      }

      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: body.name,
          pillar_id: body.pillarId ?? null,
          frequency: body.frequency ?? 'daily',
          target: body.target ?? 1,
        })
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ habit: data }, 201)
    }

    if (req.method === 'POST' && id && isToggle) {
      const today = toDateStr(new Date())

      const { data: existing, error: existingError } = await supabase
        .from('habit_entries')
        .select('id')
        .eq('habit_id', id)
        .eq('entry_date', today)
        .maybeSingle()
      if (existingError) return errorResponse(existingError, 500)

      if (existing) {
        const { error } = await supabase.from('habit_entries').delete().eq('id', existing.id)
        if (error) return errorResponse(error, 500)
        return json({ completedToday: false })
      } else {
        const { error } = await supabase
          .from('habit_entries')
          .insert({ habit_id: id, entry_date: today, completed: true })
        if (error) return errorResponse(error, 500)
        return json({ completedToday: true })
      }
    }

    if (req.method === 'PATCH' && id && !isToggle) {
      const body = await req.json()
      const updates: Record<string, unknown> = {}
      for (const key of ['name', 'pillarId', 'frequency', 'target', 'reminderTime', 'archived', 'sortOrder'] as const) {
        if (key in body) {
          const column =
            key === 'pillarId' ? 'pillar_id'
            : key === 'reminderTime' ? 'reminder_time'
            : key === 'sortOrder' ? 'sort_order'
            : key
          updates[column] = body[key]
        }
      }

      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return errorResponse(error, 500)
      return json({ habit: data })
    }

    if (req.method === 'DELETE' && id) {
      const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', userId)
      if (error) return errorResponse(error, 500)
      return json({ deleted: true })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: ['/api/habits', '/api/habits/:id', '/api/habits/:id/toggle'],
}
