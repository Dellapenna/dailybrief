import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/motivation
 * Real quotes from real authors via ZenQuotes' free "today" endpoint (one
 * quote, rotates daily on their end) — not AI-generated, and never
 * attributes anything to a real person that they didn't actually say.
 *
 * Bug fix: this had no fallback at all — if ZenQuotes' free API was
 * down, rate-limited, or just slow, the card surfaced a bare fetch
 * error. Now falls back to a small bundled list of real, verified
 * quotes (same pattern as stoic-quote.ts) rather than showing a broken
 * card just because a free third-party API hiccuped.
 */
let cache: { at: number; quote: string; author: string } | null = null
const CACHE_MS = 60 * 60 * 1000 // 1 hour

const FALLBACK_QUOTES: { q: string; a: string }[] = [
  { q: 'The way to get started is to quit talking and begin doing.', a: 'Walt Disney' },
  { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
  { q: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', a: 'Winston Churchill' },
  { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
  { q: 'Believe you can and you\u2019re halfway there.', a: 'Theodore Roosevelt' },
  { q: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.', a: 'Ralph Waldo Emerson' },
  { q: 'The future belongs to those who believe in the beauty of their dreams.', a: 'Eleanor Roosevelt' },
  { q: 'It is never too late to be what you might have been.', a: 'George Eliot' },
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ quote: cache.quote, author: cache.author, cached: true })
    }

    try {
      const res = await fetch('https://zenquotes.io/api/today')
      if (res.ok) {
        const data = await res.json()
        const entry = data?.[0]
        if (entry?.q) {
          cache = { at: Date.now(), quote: entry.q, author: entry.a ?? 'Unknown' }
          return json({ quote: cache.quote, author: cache.author, cached: false })
        }
      }
    } catch {
      // fall through to the bundled fallback below
    }

    const fallback = FALLBACK_QUOTES[dayOfYear(new Date()) % FALLBACK_QUOTES.length]
    cache = { at: Date.now(), quote: fallback.q, author: fallback.a }
    return json({ quote: fallback.q, author: fallback.a, cached: false, fromFallback: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/motivation',
}
