import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/dad-joke
 * Real jokes from icanhazdadjoke.com's curated database — not AI-invented.
 */
let cache: { at: number; joke: string } | null = null
const CACHE_MS = 60 * 60 * 1000

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ joke: cache.joke, cached: true })
    }

    const res = await fetch('https://icanhazdadjoke.com/', {
      headers: { Accept: 'application/json', 'User-Agent': 'RDP 2.0 personal app' },
    })
    if (!res.ok) return json({ error: `Dad joke fetch failed (${res.status})` }, res.status)
    const data = await res.json()
    if (!data?.joke) return json({ error: 'No joke returned' }, 502)

    cache = { at: Date.now(), joke: data.joke }
    return json({ joke: cache.joke, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/dad-joke',
}
