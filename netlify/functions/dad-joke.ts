import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/dad-joke
 * Real jokes from icanhazdadjoke.com's curated database — not AI-invented.
 *
 * Bug fix: no fallback existed if the live API was down/rate-limited —
 * surfaced a bare fetch error. Falls back to a small bundled list now.
 */
let cache: { at: number; joke: string } | null = null
const CACHE_MS = 60 * 60 * 1000

const FALLBACK_JOKES: string[] = [
  'Why don\u2019t skeletons fight each other? They don\u2019t have the guts.',
  'I used to be a banker, but I lost interest.',
  'What do you call a fish with no eyes? A fsh.',
  'I only know 25 letters of the alphabet. I don\u2019t know y.',
  'Why did the scarecrow win an award? Because he was outstanding in his field.',
  'I\u2019m reading a book about anti-gravity. It\u2019s impossible to put down.',
  'What do you call fake spaghetti? An impasta.',
  'Why don\u2019t eggs tell jokes? They\u2019d crack each other up.',
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ joke: cache.joke, cached: true })
    }

    try {
      const res = await fetch('https://icanhazdadjoke.com/', {
        headers: { Accept: 'application/json', 'User-Agent': 'RDP 2.0 personal app' },
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.joke) {
          cache = { at: Date.now(), joke: data.joke }
          return json({ joke: cache.joke, cached: false })
        }
      }
    } catch {
      // fall through to the bundled fallback below
    }

    const joke = FALLBACK_JOKES[dayOfYear(new Date()) % FALLBACK_JOKES.length]
    cache = { at: Date.now(), joke }
    return json({ joke, cached: false, fromFallback: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/dad-joke',
}
