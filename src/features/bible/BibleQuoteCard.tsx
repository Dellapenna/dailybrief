import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { api } from '@/lib/api'

type Verse = { text: string; reference: string }

export default function BibleQuoteCard() {
  const [verse, setVerse] = useState<Verse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ verse: Verse }>('/bible-quote')
      .then((res) => setVerse(res.verse))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <Skeleton lines={2} />}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {verse && (
        <blockquote>
          <p className="font-display text-base text-rdp-text">"{verse.text}"</p>
          <footer className="mt-2 text-sm text-rdp-amber">— {verse.reference}</footer>
        </blockquote>
      )}
    </div>
  )
}
