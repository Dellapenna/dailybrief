import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/trends?days=30
 *
 * Real daily-granularity trend data for charting — weight, calories,
 * water, habit consistency, task completion — plus active goals for the
 * goal-progress visuals, plus a short AI executive summary that
 * comments on those real numbers and gives recommendations tied to the
 * actual active goals. Same "never invent data, be direct not
 * automatically encouraging" pattern as Executive Summary and Habit
 * Ideas — if there's not enough history yet, says so rather than
 * synthesizing a summary out of thin data.
 */

let cache: { at: number; body: unknown } | null = null
const CACHE_MS = 60 * 60 * 1000

function average(nums: number[]): number | null {
  if (nums.length === 0) return null
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

function rateOf(days: { completed: number; total: number }[], totalHabits: number): number | null {
  if (days.length === 0 || totalHabits === 0) return null
  const totalCompleted = days.reduce((s, d) => s + d.completed, 0)
  const totalPossible = days.length * totalHabits
  return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : null
}

export default async (req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ ...(cache.body as object), cached: true })
    }

    const url = new URL(req.url)
    const days = Math.min(90, Math.max(7, Number(url.searchParams.get('days') ?? '30')))

    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .single()
    if (profileError) return errorResponse(profileError, 500)
    const today = todayInTimezone(profile?.timezone || 'America/New_York')

    const since = new Date(today + 'T00:00:00Z')
    since.setUTCDate(since.getUTCDate() - (days - 1))
    const sinceStr = since.toISOString().slice(0, 10)

    // --- Weight (morning_checkins) ---
    const { data: checkins, error: checkinsError } = await supabase
      .from('morning_checkins')
      .select('checkin_date, weight')
      .eq('user_id', userId)
      .gte('checkin_date', sinceStr)
      .order('checkin_date', { ascending: true })
    if (checkinsError) return errorResponse(checkinsError, 500)
    const weightTrend = (checkins ?? [])
      .filter((c) => c.weight != null)
      .map((c) => ({ date: c.checkin_date, weight: c.weight }))

    // --- Calories (food_logs, aggregated per day) ---
    const { data: foodLogs, error: foodError } = await supabase
      .from('food_logs')
      .select('logged_date, calories, quantity')
      .eq('user_id', userId)
      .gte('logged_date', sinceStr)
    if (foodError) return errorResponse(foodError, 500)
    const calByDay = new Map<string, number>()
    for (const l of foodLogs ?? []) {
      calByDay.set(l.logged_date, (calByDay.get(l.logged_date) ?? 0) + l.calories * l.quantity)
    }

    const { data: prefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('daily_calorie_goal')
      .eq('user_id', userId)
      .single()
    if (prefsError) return errorResponse(prefsError, 500)
    const calorieGoal = prefs?.daily_calorie_goal ?? null

    const calorieTrend = Array.from(calByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, consumed]) => ({ date, consumed: Math.round(consumed) }))

    // --- Water (water_logs) ---
    const { data: waterLogs, error: waterError } = await supabase
      .from('water_logs')
      .select('logged_date, glasses_consumed')
      .eq('user_id', userId)
      .gte('logged_date', sinceStr)
      .order('logged_date', { ascending: true })
    if (waterError) return errorResponse(waterError, 500)
    const waterTrend = (waterLogs ?? []).map((w) => ({ date: w.logged_date, glasses: w.glasses_consumed }))

    // --- Habit consistency (habit_entries, completed count per day) ---
    const { data: habits, error: habitsListError } = await supabase.from('habits').select('id').eq('user_id', userId)
    if (habitsListError) return errorResponse(habitsListError, 500)
    const habitIds = (habits ?? []).map((h) => h.id)
    const totalHabits = habitIds.length

    let habitConsistency: { date: string; completed: number; total: number }[] = []
    if (habitIds.length > 0) {
      const { data: entries, error: entriesError } = await supabase
        .from('habit_entries')
        .select('entry_date, completed')
        .in('habit_id', habitIds)
        .eq('completed', true)
        .gte('entry_date', sinceStr)
      if (entriesError) return errorResponse(entriesError, 500)
      const countByDay = new Map<string, number>()
      for (const e of entries ?? []) {
        countByDay.set(e.entry_date, (countByDay.get(e.entry_date) ?? 0) + 1)
      }
      habitConsistency = Array.from(countByDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, completed]) => ({ date, completed, total: totalHabits }))
    }

    // --- Task completion (tasks.completed_at, count per day) ---
    const { data: completedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('completed_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gte('completed_at', `${sinceStr}T00:00:00Z`)
    if (tasksError) return errorResponse(tasksError, 500)
    const tasksByDay = new Map<string, number>()
    for (const t of completedTasks ?? []) {
      const day = (t.completed_at as string).slice(0, 10)
      tasksByDay.set(day, (tasksByDay.get(day) ?? 0) + 1)
    }
    const taskCompletionTrend = Array.from(tasksByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, completed]) => ({ date, completed }))

    // --- Active goals for progress visuals ---
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('id, title, status, pillar_id, confidence_level, estimated_probability, target_date, next_action')
      .eq('user_id', userId)
      .in('status', ['active', 'completed'])
      .order('created_at', { ascending: true })
    if (goalsError) return errorResponse(goalsError, 500)

    const stats = {
      weightDataPoints: weightTrend.length,
      avgCaloriesLast7: average(calorieTrend.slice(-7).map((c) => c.consumed)),
      calorieGoal,
      avgWaterLast7: average(waterTrend.slice(-7).map((w) => w.glasses)),
      habitCompletionRateLast7: rateOf(habitConsistency.slice(-7), totalHabits),
      tasksCompletedLast7: taskCompletionTrend.slice(-7).reduce((s, t) => s + t.completed, 0),
      activeGoalCount: (goals ?? []).filter((g) => g.status === 'active').length,
    }

    const enoughData =
      weightTrend.length > 0 || calorieTrend.length >= 3 || habitConsistency.length >= 3 || taskCompletionTrend.length >= 3

    let summary: string | null = null
    if (enoughData) {
      try {
        const apiKey = requireEnv('AI_API_KEY')
        const goalsList = (goals ?? [])
          .filter((g) => g.status === 'active')
          .map((g) => `"${g.title}"${g.next_action ? ` (next action: ${g.next_action})` : ''}`)
          .join(', ')

        const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 300,
            system:
              "You are an honest analyst reviewing real personal tracking data over the last week. Be direct and " +
              "specific, not automatically encouraging. Point out real patterns (improving, declining, inconsistent). " +
              "Then give 1-3 concrete, specific recommendations tied to the person's actual active goals — not " +
              "generic advice. If a metric has no data, say so rather than guessing. Do not give medical advice. " +
              "3-5 sentences total.",
            messages: [
              {
                role: 'user',
                content:
                  `Last 7 days: avg calories/day ${stats.avgCaloriesLast7 ?? 'no data'}` +
                  `${calorieGoal ? ` (goal ${calorieGoal})` : ''}, avg water glasses/day ${stats.avgWaterLast7 ?? 'no data'}, ` +
                  `habit completion rate ${stats.habitCompletionRateLast7 ?? 'no data'}%, tasks completed ${stats.tasksCompletedLast7}. ` +
                  `Active goals: ${goalsList || 'none set'}.`,
              },
            ],
          }),
        })
        if (aiRes.ok) {
          const aiData = await aiRes.json()
          summary = aiData?.content?.find((b: { type: string }) => b.type === 'text')?.text ?? null
        }
      } catch {
        summary = null
      }
    }

    const body = {
      days,
      weightTrend,
      calorieTrend,
      calorieGoal,
      waterTrend,
      habitConsistency,
      taskCompletionTrend,
      goals: goals ?? [],
      stats,
      summary,
      note: enoughData ? null : 'Not enough tracked history yet to show meaningful trends — keep logging for a few days.',
    }
    cache = { at: Date.now(), body }
    return json({ ...body, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/trends',
}
