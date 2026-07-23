import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/fun-fact
 * Real curated facts from a free public facts API — not AI-invented.
 *
 * Bug fix: no fallback existed if the live API was down/rate-limited —
 * surfaced a bare fetch error. Falls back to a small bundled list of
 * real, verifiable facts now.
 */
let cache: { at: number; fact: string; source: string | null } | null = null
const CACHE_MS = 60 * 60 * 1000

const FALLBACK_FACTS: string[] = [
  'Honey never spoils — edible honey has been found in ancient Egyptian tombs over 3,000 years old.',
  'Octopuses have three hearts, and two of them stop beating when the octopus swims.',
  'A day on Venus is longer than a year on Venus — it rotates slower than it orbits the sun.',
  'Bananas are botanically classified as berries, but strawberries are not.',
  'The Eiffel Tower can grow about 6 inches taller in summer due to thermal expansion of the metal.',
  'Wombat droppings are cube-shaped, which keeps them from rolling away and marks their territory.',
  'A group of flamingos is called a "flamboyance."',
  'The shortest war in recorded history was between Britain and Zanzibar in 1896 — it lasted about 38 minutes.',
]

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ fact: cache.fact, source: cache.source, cached: true })
    }

    try {
      const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random')
      if (res.ok) {
        const data = await res.json()
        if (data?.text) {
          cache = { at: Date.now(), fact: data.text, source: data.source_url ?? null }
          return json({ fact: cache.fact, source: cache.source, cached: false })
        }
      }
    } catch {
      // fall through to the bundled fallback below
    }

    const fact = FALLBACK_FACTS[dayOfYear(new Date()) % FALLBACK_FACTS.length]
    cache = { at: Date.now(), fact, source: null }
    return json({ fact, source: null, cached: false, fromFallback: true })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/fun-fact',
}
