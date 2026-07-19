import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/motivation
 * Real quotes from real authors via ZenQuotes' free "today" endpoint (one
 * quote, rotates daily on their end) — not AI-generated, and never
 * attributes anything to a real person that they didn't actually say.
 */
let cache: { at: number; quote: string; author: string } | null = null
const CACHE_MS = 60 * 60 * 1000 // 1 hour

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ quote: cache.quote, author: cache.author, cached: true })
    }

    const res = await fetch('https://zenquotes.io/api/today')
    if (!res.ok) return json({ error: `ZenQuotes fetch failed (${res.status})` }, res.status)
    const data = await res.json()
    const entry = data?.[0]
    if (!entry?.q) return json({ error: 'No quote returned' }, 502)

    cache = { at: Date.now(), quote: entry.q, author: entry.a ?? 'Unknown' }
    return json({ quote: cache.quote, author: cache.author, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/motivation',
}
