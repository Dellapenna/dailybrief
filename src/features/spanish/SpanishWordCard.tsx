import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { api } from '@/lib/api'

type SpanishWord = { es: string; en: string; example?: string; exampleEn?: string }

export default function SpanishWordCard() {
  const [word, setWord] = useState<SpanishWord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ word: SpanishWord }>('/spanish-word')
      .then((res) => setWord(res.word))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        Spanish Word of the Day
      </p>
      {loading && <Skeleton lines={2} className="mt-2" />}
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}
      {word && (
        <div className="mt-2">
          <p className="font-display text-lg font-semibold text-rdp-amber">{word.es}</p>
          <p className="text-sm text-rdp-text-dim">{word.en}</p>
          {word.example && (
            <p className="mt-2 text-sm italic text-rdp-text">
              {word.example}
              <br />
              <span className="text-rdp-text-faint">{word.exampleEn}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
