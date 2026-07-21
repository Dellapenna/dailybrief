import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { Volume2 } from 'lucide-react'
import { api } from '@/lib/api'
import { speak, speechSupported } from '@/lib/speech'

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
          <div className="flex items-center gap-2">
            <p className="font-display text-lg font-semibold text-rdp-amber">{word.es}</p>
            {speechSupported() && (
              <button
                onClick={() => speak(word.es, 'es-ES')}
                aria-label="Hear pronunciation"
                className="rounded-full border border-rdp-line p-1.5 text-rdp-signal hover:bg-rdp-void"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="text-sm text-rdp-text-dim">{word.en}</p>
          {word.example && (
            <div className="mt-2 flex items-start gap-2">
              <p className="text-sm italic text-rdp-text">
                {word.example}
                <br />
                <span className="text-rdp-text-faint">{word.exampleEn}</span>
              </p>
              {speechSupported() && (
                <button
                  onClick={() => speak(word.example!, 'es-ES')}
                  aria-label="Hear example sentence"
                  className="mt-0.5 shrink-0 rounded-full border border-rdp-line p-1.5 text-rdp-signal hover:bg-rdp-void"
                >
                  <Volume2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
