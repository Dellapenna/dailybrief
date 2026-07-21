import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/habit-recommendations
 *
 * Suggests specific habits that could help achieve the person's real
 * active goals — grounded in their actual goal titles/descriptions, not
 * invented. Uses the same Anthropic API already wired up for Horoscope
 * and Executive Summary's AI Assessment. If there are no active goals,
 * returns an empty list rather than generating generic filler
 * suggestions unconnected to anything real.
 *
 * Cached 1 hour in-memory — cheap to regenerate, and goals don't change
 * often enough to need fresher suggestions than that.
 */

type Recommendation = { goalTitle: string; habitName: string; pillar: string | null; reason: string }

let cache: { at: number; recommendations: Recommendation[] } | null = null
const CACHE_MS = 60 * 60 * 1000

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ recommendations: cache.recommendations, cached: true })
    }

    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('title, description, why_it_matters, pillar_id')
      .eq('user_id', userId)
      .eq('status', 'active')
    if (goalsError) return errorResponse(goalsError, 500)

    if (!goals || goals.length === 0) {
      return json({ recommendations: [], note: 'No active goals yet — add some on Mission Control.' })
    }

    const apiKey = requireEnv('AI_API_KEY')

    const goalsList = goals
      .map((g, i) => `${i + 1}. "${g.title}"${g.description ? ` — ${g.description}` : ''}${g.why_it_matters ? ` (why: ${g.why_it_matters})` : ''} [pillar: ${g.pillar_id ?? 'none'}]`)
      .join('\n')

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system:
          'You suggest concrete, specific daily or weekly habits that would genuinely help someone ' +
          'achieve their stated goals. Only suggest habits directly connected to a goal listed — ' +
          'never generic filler like "stay positive." Respond with ONLY a JSON array, no markdown ' +
          'fences, no preamble, matching this exact shape: ' +
          '[{"goalTitle": string, "habitName": string, "pillar": "body"|"mind"|"soul"|null, "reason": string}]. ' +
          'habitName should be short and action-oriented (e.g. "10-minute morning stretch", not ' +
          '"exercise more"). reason should be one short sentence. Suggest 1-2 habits per goal, skip ' +
          'goals that already sound like habits themselves.',
        messages: [{ role: 'user', content: `Active goals:\n${goalsList}` }],
      }),
    })

    if (!aiRes.ok) {
      return json({ error: `AI request failed (${aiRes.status})` }, 502)
    }

    const aiData = await aiRes.json()
    const text = aiData?.content?.find((block: { type: string }) => block.type === 'text')?.text ?? '[]'

    // Bug fix: Claude sometimes wraps JSON in ```json fences or adds a
    // stray sentence before/after despite being told not to — a common
    // LLM quirk, not something to just trust blindly. Strip fences and
    // extract the [...] span before parsing, rather than requiring the
    // model to produce byte-perfect JSON every time.
    let cleaned = text.trim()
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
    const start = cleaned.indexOf('[')
    const end = cleaned.lastIndexOf(']')
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.slice(start, end + 1)
    }

    let recommendations: Recommendation[]
    try {
      recommendations = JSON.parse(cleaned)
    } catch {
      return json({ error: 'Could not parse AI response — try again in a moment.' }, 502)
    }

    cache = { at: Date.now(), recommendations }
    return json({ recommendations, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/habit-recommendations',
}
