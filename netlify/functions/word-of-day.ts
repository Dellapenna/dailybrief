import type { Config, Context } from '@netlify/functions'
import { json, errorResponse } from './shared/http'

/**
 * GET /api/word-of-day
 * Real word + real definition: a random word from a free word-list API,
 * looked up against a free public dictionary API. Retries a few times
 * since not every random word has a dictionary entry.
 */
type Definition = { partOfSpeech: string; definition: string; example?: string }

let cache: { at: number; word: string; phonetic: string | null; definitions: Definition[] } | null = null
const CACHE_MS = 60 * 60 * 1000

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

export default async (_req: Request, _context: Context) => {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return json({ ...cache, cached: true })
    }

    let result = null
    for (let i = 0; i < 5 && !result; i++) {
      result = await tryLookup()
    }

    if (!result) return json({ error: 'Could not find a word with a definition after 5 tries' }, 502)

    cache = { at: Date.now(), ...result }
    return json({ ...result, cached: false })
  } catch (err) {
    return errorResponse(err)
  }
}

export const config: Config = {
  path: '/api/word-of-day',
}
