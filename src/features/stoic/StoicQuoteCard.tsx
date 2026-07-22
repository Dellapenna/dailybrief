import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { api } from '@/lib/api'

type StoicQuote = { text: string; author: string; source: string }

export default function StoicQuoteCard() {
  const [quote, setQuote] = useState<StoicQuote | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ quote: StoicQuote }>('/stoic-quote')
      .then((res) => setQuote(res.quote))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <Skeleton lines={2} />}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {quote && (
        <blockquote>
          <p className="font-display text-base text-rdp-text">"{quote.text}"</p>
          <footer className="mt-2 text-sm text-rdp-amber">
            — {quote.author}, <span className="italic text-rdp-text-faint">{quote.source}</span>
          </footer>
        </blockquote>
      )}
    </div>
  )
}
