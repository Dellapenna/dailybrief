import type { Config, Context } from '@netlify/functions'
import { requireEnv } from './shared/env'
import { json, errorResponse } from './shared/http'

/**
 * POST /api/food-photo-estimate
 * Body: { imageBase64: string, mediaType: string }
 *
 * Uses Claude's vision capability to estimate a meal's calories/macros
 * from a photo. This is genuinely different from food-search.ts (USDA
 * FDC) and food-barcode.ts (Open Food Facts) — those return real,
 * verified nutritional data; this is an AI visually guessing portion
 * size and ingredients, which has real, unavoidable margin for error
 * (hidden oil/butter/sauce, portion size from a 2D photo, etc.). Never
 * presented as equivalent precision to the database-backed sources —
 * the response includes an explicit confidence caveat, and the frontend
 * must label this as an estimate, not fact.
 */
export default async (req: Request, _context: Context) => {
  try {
    const body = await req.json()
    if (!body?.imageBase64 || typeof body.imageBase64 !== 'string') {
      return json({ error: 'imageBase64 is required' }, 400)
    }
    const mediaType = body.mediaType || 'image/jpeg'

    const apiKey = requireEnv('AI_API_KEY')

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 500,
        system:
          'You estimate calories and macros from a photo of a meal. Be realistic about portion ' +
          'sizes and account for likely hidden ingredients (cooking oil, butter, dressing, sauce) ' +
          'rather than only what is visibly on the plate. Be honest that this is an estimate, not a ' +
          'precise measurement — note anything that adds real uncertainty (fried vs. grilled, ' +
          'creamy sauces, unclear portion size). Respond with ONLY a JSON object, no markdown ' +
          'fences, no preamble, matching this exact shape: ' +
          '{"description": string, "calories": number, "proteinG": number, "carbsG": number, ' +
          '"fatG": number, "sugarG": number, "confidenceNote": string}. If the image does not show food, set ' +
          'calories to 0 and explain in confidenceNote.',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: body.imageBase64 } },
              { type: 'text', text: 'Estimate the calories and macros for this meal.' },
            ],
          },
        ],
      }),
    })

    if (!aiRes.ok) {
      return json({ error: `AI request failed (${aiRes.status})` }, 502)
    }

    const aiData = await aiRes.json()
    const text = aiData?.content?.find((block: { type: string }) => block.type === 'text')?.text ?? '{}'

    // Same defensive parsing as habit-recommendations.ts — strip
    // markdown fences and extract the {...} span rather than trusting
    // the model produced byte-perfect JSON.
    let cleaned = text.trim()
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '')
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      cleaned = cleaned.slice(start, end + 1)
    }

    let estimate
    try {
      estimate = JSON.parse(cleaned)
    } catch {
      return json({ error: 'Could not parse AI response — try again.' }, 502)
    }

    return json({ estimate })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/food-photo-estimate',
}
