import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { todayInTimezone } from './shared/userTimezone'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/food-weekly-summary
 *
 * Real rules-based stats from the last 7 days of food_logs (days
 * logged, average daily calories, days over/under goal), plus a short
 * AI-written assessment that comments on those real numbers — same
 * pattern as Mission Control's Executive Summary and Habit Ideas: never
 * invents anything, explicitly told to be direct rather than
 * automatically encouraging. If nothing's been logged this week, says
 * so plainly rather than generating a hollow assessment of nothing.
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('id', userId)
      .single()
    if (profileError) return errorResponse(profileError, 500)
    const today = todayInTimezone(profile?.timezone || 'America/New_York')

    const weekAgo = new Date(today + 'T00:00:00Z')
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 6) // today + 6 days back = 7-day window
    const weekAgoStr = weekAgo.toISOString().slice(0, 10)

    const { data: logs, error: logsError } = await supabase
      .from('food_logs')
      .select('logged_date, meal, calories, protein_g, quantity')
      .eq('user_id', userId)
      .gte('logged_date', weekAgoStr)
      .lte('logged_date', today)
    if (logsError) return errorResponse(logsError, 500)

    const { data: prefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('daily_calorie_goal, daily_protein_goal')
      .eq('user_id', userId)
      .single()
    if (prefsError) return errorResponse(prefsError, 500)
    const goal = prefs?.daily_calorie_goal ?? null
    const proteinGoal = prefs?.daily_protein_goal ?? null

    const byDay = new Map<string, number>()
    const proteinByDay = new Map<string, number>()
    for (const log of logs ?? []) {
      const cal = log.calories * log.quantity
      byDay.set(log.logged_date, (byDay.get(log.logged_date) ?? 0) + cal)
      proteinByDay.set(log.logged_date, (proteinByDay.get(log.logged_date) ?? 0) + (log.protein_g ?? 0) * log.quantity)
    }

    const daysLogged = byDay.size
    const dailyTotals = Array.from(byDay.values())
    const proteinTotals = Array.from(proteinByDay.values())
    const avgDailyCalories = dailyTotals.length > 0 ? Math.round(dailyTotals.reduce((a, b) => a + b, 0) / dailyTotals.length) : 0
    const avgDailyProtein = proteinTotals.length > 0 ? Math.round(proteinTotals.reduce((a, b) => a + b, 0) / proteinTotals.length) : 0
    const daysOverGoal = goal ? dailyTotals.filter((c) => c > goal).length : null
    const daysUnderGoal = goal ? dailyTotals.filter((c) => c <= goal).length : null

    const stats = {
      daysLogged,
      totalDaysInWindow: 7,
      avgDailyCalories,
      dailyCalorieGoal: goal,
      avgDailyProtein,
      dailyProteinGoal: proteinGoal,
      daysOverGoal,
      daysUnderGoal,
    }

    if (daysLogged === 0) {
      const body = { stats, assessment: null, note: 'Nothing logged this week yet — nothing to assess.' }
      cache = { at: Date.now(), body }
      return json({ ...body, cached: false })
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
            'You are an honest nutrition-pattern reviewer looking at real logged data. Be direct and ' +
            'specific, not automatically encouraging — if the data shows inconsistent logging or being ' +
            'over goal most days, say so plainly. Do not invent any numbers beyond what is given, and ' +
            'do not give specific medical or dosage-style advice. 2-4 sentences.',
          messages: [
            {
              role: 'user',
              content: `This week: logged food on ${daysLogged} of 7 days. Average daily calories on logged days: ${avgDailyCalories}. ${goal ? `Daily calorie goal: ${goal}. Days over goal: ${daysOverGoal}, days at/under: ${daysUnderGoal}.` : 'No daily calorie goal is set.'} Average daily protein: ${avgDailyProtein}g${proteinGoal ? ` (goal: ${proteinGoal}g)` : ' (no protein goal set)'}. Give an honest assessment of the pattern.`,
            },
          ],
        }),
      })
      if (aiRes.ok) {
        const aiData = await aiRes.json()
        assessment = aiData?.content?.find((block: { type: string }) => block.type === 'text')?.text ?? null
      }
    } catch {
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
  path: '/api/food-weekly-summary',
}
