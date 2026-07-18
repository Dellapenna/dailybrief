import type { Config, Context } from '@netlify/functions'
import { getSupabaseAdmin } from './shared/supabaseAdmin'
import { getPrimaryUserId } from './shared/primaryUser'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/horoscope
 *
 * Playful entertainment content, not a factual data feed — this is a
 * deliberate, narrow exception to this app's "evidence over invention"
 * principle (see docs/PRODUCT_BRIEF.md), which applies to things
 * presented as real (weather, markets, sports, calendar). A horoscope is
 * inherently understood as non-factual, so AI-generating one is fine as
 * long as it's clearly labeled as such — which the frontend does
 * (HoroscopeCard shows "for fun" copy, never "today's forecast").
 *
 * Generated once per calendar day and cached in `horoscopes` — repeat
 * requests the same day return the cached row instead of calling the AI
 * API again.
 */

const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
] as const

export default async (_req: Request, _context: Context) => {
  try {
    const supabase = getSupabaseAdmin()
    const userId = getPrimaryUserId()

    const { data: prefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('zodiac_sign')
      .eq('user_id', userId)
      .single()
    if (prefsError) return errorResponse(prefsError, 500)

    const sign = prefs?.zodiac_sign
    if (!sign || !SIGNS.includes(sign)) {
      return json({ error: 'No zodiac sign set — add one in Settings.' }, 400)
    }

    const today = new Date().toISOString().slice(0, 10)

    const { data: cached, error: cacheError } = await supabase
      .from('horoscopes')
      .select('*')
      .eq('user_id', userId)
      .eq('horoscope_date', today)
      .maybeSingle()
    if (cacheError) return errorResponse(cacheError, 500)

    if (cached) {
      return json({ sign: cached.sign, date: cached.horoscope_date, content: cached.content, cached: true })
    }

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
          'You write short, upbeat, playful daily horoscopes for a personal app. ' +
          'This is entertainment only — never give real advice on health, money, or ' +
          'relationships, and never claim any real predictive accuracy. Keep it to ' +
          '2-3 sentences, warm and a little fun, not vague filler.',
        messages: [
          {
            role: 'user',
            content: `Write today's (${today}) horoscope for ${sign}.`,
          },
        ],
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => '')
      return json({ error: `AI request failed (${aiRes.status}): ${errText.slice(0, 200)}` }, 502)
    }

    const aiData = await aiRes.json()
    const content: string =
      aiData?.content?.find((block: { type: string }) => block.type === 'text')?.text ?? ''

    if (!content) {
      return json({ error: 'AI response contained no text' }, 502)
    }

    const { data: saved, error: saveError } = await supabase
      .from('horoscopes')
      .upsert(
        { user_id: userId, horoscope_date: today, sign, content },
        { onConflict: 'user_id,horoscope_date' },
      )
      .select()
      .single()
    if (saveError) return errorResponse(saveError, 500)

    return json({ sign: saved.sign, date: saved.horoscope_date, content: saved.content, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/horoscope',
}
