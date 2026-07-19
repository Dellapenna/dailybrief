import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Definition = { partOfSpeech: string; definition: string; example?: string }
type WordData = { word: string; phonetic: string | null; definitions: Definition[] }

export default function WordOfDayCard() {
  const [data, setData] = useState<WordData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<WordData>('/word-of-day')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <p className="text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {data && (
        <div>
          <p className="font-display text-xl font-semibold text-rdp-amber">{data.word}</p>
          {data.phonetic && <p className="mt-0.5 font-mono text-sm text-rdp-text-faint">{data.phonetic}</p>}
          <ul className="mt-3 space-y-2">
            {data.definitions.map((d, i) => (
              <li key={i}>
                <p className="text-xs uppercase tracking-wide text-rdp-signal">{d.partOfSpeech}</p>
                <p className="mt-0.5 text-sm text-rdp-text">{d.definition}</p>
                {d.example && <p className="mt-0.5 text-sm italic text-rdp-text-faint">"{d.example}"</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
