import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { api, ApiError } from '@/lib/api'

type Quote = { symbol: string; label: string; price: number; change: number; percentChange: number; previousClose: number }

export default function StocksCard() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null)
  const [failures, setFailures] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ quotes: Quote[]; failures?: string[] }>('/stocks')
      .then((res) => {
        setQuotes(res.quotes)
        setFailures(res.failures ?? [])
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <Skeleton lines={2} />}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {quotes && (
        <div className="space-y-2">
          {quotes.map((q) => {
            const up = q.change >= 0
            return (
              <div key={q.symbol} className="flex items-center justify-between">
                <span className="text-sm text-rdp-text">{q.label}</span>
                <div className="text-right">
                  <p className="font-mono text-sm tabular-nums text-rdp-text">{q.price.toFixed(2)}</p>
                  <p className={`font-mono text-xs tabular-nums ${up ? 'text-rdp-good' : 'text-rdp-risk'}`}>
                    {up ? '+' : ''}
                    {q.change.toFixed(2)} ({up ? '+' : ''}
                    {q.percentChange.toFixed(2)}%)
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {failures.length > 0 && (
        <div className="mt-2 space-y-1">
          {failures.map((f, i) => (
            <p key={i} className="text-xs text-rdp-risk">
              {f}
            </p>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-rdp-text-faint">Informational only, never individualized investment advice.</p>
    </div>
  )
}
