import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/fun-fact
 * Real curated facts from a free public facts API — not AI-invented.
 */
let cache: { at: number; fact: string; source: string | null } | null = null
const CACHE_MS = 60 * 60 * 1000

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ fact: cache.fact, source: cache.source, cached: true })
    }

    const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random')
    if (!res.ok) return json({ error: `Facts fetch failed (${res.status})` }, res.status)
    const data = await res.json()
    if (!data?.text) return json({ error: 'No fact returned' }, 502)

    cache = { at: Date.now(), fact: data.text, source: data.source_url ?? null }
    return json({ fact: cache.fact, source: cache.source, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/fun-fact',
}
