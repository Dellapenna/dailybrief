import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { Volume2 } from 'lucide-react'
import { api } from '@/lib/api'
import { speak, speechSupported } from '@/lib/speech'

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
      {loading && <Skeleton lines={2} />}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {data && (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-xl font-semibold text-rdp-amber">{data.word}</p>
            {speechSupported() && (
              <button
                onClick={() => speak(data.word, 'en-US')}
                aria-label="Hear pronunciation"
                className="rounded-full border border-rdp-line p-1.5 text-rdp-signal hover:bg-rdp-void"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
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
