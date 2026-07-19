import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/executive-summary
 *
 * Real, rules-based stats across Body/Mind/Soul (goal counts, task
 * completion/overdue, 7-day habit completion rate), plus a short
 * AI-written assessment that comments on those real numbers — never
 * invents its own. Matches the brief's "AI Assessment: an honest summary
 * of what is helping or hurting progress" — explicitly told to be direct,
 * not automatically praising, consistent with the app's "honest
 * coaching" principle. Cached 1 hour in-memory (cheap to regenerate,
 * no need for a persistent per-day table like horoscope.ts).
 */

let cache: { at: number; body: unknown } | null = null
const CACHE_MS = 60 * 60 * 1000

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ ...(cache.body as object), cached: true })
    }

    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const [{ data: goals }, { data: tasks }, { data: habits }] = await Promise.all([
      supabase.from('goals').select('status, pillar_id').eq('user_id', userId),
      supabase.from('tasks').select('status, due_date, completed_at').eq('user_id', userId),
      supabase.from('habits').select('id, name, pillar_id').eq('user_id', userId).eq('archived', false),
    ])

    const goalCounts = {
      active: (goals ?? []).filter((g) => g.status === 'active').length,
      completed: (goals ?? []).filter((g) => g.status === 'completed').length,
      paused: (goals ?? []).filter((g) => g.status === 'paused').length,
      total: (goals ?? []).length,
    }

    const today = new Date().toISOString().slice(0, 10)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoStr = weekAgo.toISOString().slice(0, 10)

    const completedThisWeek = (tasks ?? []).filter(
      (t) => t.completed_at && t.completed_at.slice(0, 10) >= weekAgoStr,
    ).length
    const overdue = (tasks ?? []).filter(
      (t) => t.status !== 'completed' && t.due_date && t.due_date < today,
    ).length

    let habitCompletionRate = 0
    if (habits && habits.length > 0) {
      const { data: entries } = await supabase
        .from('habit_entries')
        .select('habit_id, entry_date, completed')
        .in('habit_id', habits.map((h) => h.id))
        .gte('entry_date', weekAgoStr)
        .eq('completed', true)
      const possible = habits.length * 7
      habitCompletionRate = possible > 0 ? Math.round(((entries ?? []).length / possible) * 100) : 0
    }

    const stats = {
      goals: goalCounts,
      tasksCompletedThisWeek: completedThisWeek,
      tasksOverdue: overdue,
      habitCount: habits?.length ?? 0,
      habitCompletionRate7d: habitCompletionRate,
    }

    let assessment: string | null = null
    try {
      const apiKey = requireEnv('AI_API_KEY')
      const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system:
            'You are an honest executive coach reviewing real personal productivity stats. ' +
            'Be direct and specific, not automatically encouraging — if something looks weak, ' +
            'say so plainly. Do not invent any numbers beyond what is given. 2-4 sentences.',
          messages: [
            {
              role: 'user',
              content: `Stats: ${goalCounts.active} active goals, ${goalCounts.completed} completed, ${goalCounts.paused} paused. ${completedThisWeek} tasks completed this week, ${overdue} overdue right now. ${habits?.length ?? 0} active habits with a ${habitCompletionRate}% completion rate over the last 7 days. Give an honest assessment.`,
            },
          ],
        }),
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json()
        assessment =
          aiData?.content?.find((block: { type: string }) => block.type === 'text')?.text ?? null
      }
    } catch {
      // AI assessment is a bonus, not required — stats stand alone if this fails.
      assessment = null
    }

    const body = { stats, assessment }
    cache = { at: Date.now(), body }
    return json({ ...body, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/executive-summary',
}
