import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/word-of-day
 * Real word + real definition: a random word from a free word-list API,
 * looked up against a free public dictionary API. Retries a few times
 * since not every random word has a dictionary entry.
 *
 * Bug fix: if both free APIs were down/rate-limited/slow (the random-
 * word API is a free Heroku app, not the most reliable), this had no
 * fallback and surfaced a bare error after 5 failed tries. Falls back
 * to a small bundled list of real words with real definitions now.
 */
type Definition = { partOfSpeech: string; definition: string; example?: string }

let cache: { at: number; word: string; phonetic: string | null; definitions: Definition[] } | null = null
const CACHE_MS = 60 * 60 * 1000

const FALLBACK_WORDS: { word: string; phonetic: string; definitions: Definition[] }[] = [
  { word: 'ephemeral', phonetic: '/\u0259\u02c8f\u025bm(\u0259)r(\u0259)l/', definitions: [{ partOfSpeech: 'adjective', definition: 'Lasting for a very short time.' }] },
  { word: 'ubiquitous', phonetic: '/juː\u02c8b\u026akw\u026at\u0259s/', definitions: [{ partOfSpeech: 'adjective', definition: 'Present, appearing, or found everywhere.' }] },
  { word: 'resilient', phonetic: '/r\u026a\u02c8z\u026alj\u0259nt/', definitions: [{ partOfSpeech: 'adjective', definition: 'Able to withstand or recover quickly from difficult conditions.' }] },
  { word: 'meticulous', phonetic: '/m\u0259\u02c8t\u026akjul\u0259s/', definitions: [{ partOfSpeech: 'adjective', definition: 'Showing great attention to detail; very careful and precise.' }] },
  { word: 'candid', phonetic: '/\u02c8kand\u026ad/', definitions: [{ partOfSpeech: 'adjective', definition: 'Truthful and straightforward; frank.' }] },
  { word: 'lucid', phonetic: '/\u02c8lu\u02d0s\u026ad/', definitions: [{ partOfSpeech: 'adjective', definition: 'Expressed clearly; easy to understand.' }] },
  { word: 'diligent', phonetic: '/\u02c8d\u026al\u026ad\u0292\u0259nt/', definitions: [{ partOfSpeech: 'adjective', definition: 'Having or showing care and conscientiousness in one\u2019s work.' }] },
  { word: 'tenacious', phonetic: '/t\u0259\u02c8ne\u026a\u0283\u0259s/', definitions: [{ partOfSpeech: 'adjective', definition: 'Tending to keep a firm hold of something; persistent.' }] },
]

async function tryLookup(): Promise<{ word: string; phonetic: string | null; definitions: Definition[] } | null> {
  const wordRes = await fetch('https://random-word-api.herokuapp.com/word')
  if (!wordRes.ok) return null
  const [word] = await wordRes.json()
  if (!word) return null

  const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
  if (!defRes.ok) return null // word not in dictionary — caller retries with a new word
  const defData = await defRes.json()
  const entry = defData?.[0]
  if (!entry) return null

  const definitions: Definition[] = (entry.meanings ?? []).flatMap(
    (m: { partOfSpeech: string; definitions: { definition: string; example?: string }[] }) =>
      m.definitions.slice(0, 2).map((d) => ({
        partOfSpeech: m.partOfSpeech,
        definition: d.definition,
        example: d.example,
      })),
  )

  return {
    word: entry.word,
    phonetic: entry.phonetic ?? null,
    definitions: definitions.slice(0, 3),
  }
}

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86400000)
}

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ ...cache, cached: true })
    }

    let result = null
    for (let i = 0; i < 5 && !result; i++) {
      try {
        result = await tryLookup()
      } catch {
        // try again
      }
    }

    if (!result) {
      const fallback = FALLBACK_WORDS[dayOfYear(new Date()) % FALLBACK_WORDS.length]
      cache = { at: Date.now(), ...fallback }
      return json({ ...fallback, cached: false, fromFallback: true })
    }

    cache = { at: Date.now(), ...result }
    return json({ ...result, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/word-of-day',
}
