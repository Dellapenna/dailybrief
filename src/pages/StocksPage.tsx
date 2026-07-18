import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'

type Quote = {
  symbol: string
  label: string
  price: number
  change: number
  percentChange: number
  previousClose: number
}

export default function StocksPage() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ quotes: Quote[] }>('/stocks')
      .then((res) => setQuotes(res.quotes))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Stock Market</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Track markets. Make moves.</p>

      {loading && <p className="mt-4 text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="mt-4 text-sm text-rdp-risk">{error}</p>}

      {quotes && (
        <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
          {quotes.map((q) => {
            const up = q.change >= 0
            return (
              <div
                key={q.symbol}
                className="flex items-center justify-between border-b border-rdp-line py-3 last:border-b-0"
              >
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

      <p className="mt-4 text-xs text-rdp-text-faint">
        Informational only, never individualized investment advice. Indexes tracked via their most common ETF
        proxies (DIA/SPY/QQQ/IWM), not raw index values.
      </p>
    </div>
  )
}
