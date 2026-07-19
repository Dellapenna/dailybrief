import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Coin = { id: string; label: string; priceUsd: number; change24h: number | null }

export default function CryptoCard() {
  const [coins, setCoins] = useState<Coin[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ coins: Coin[] }>('/crypto')
      .then((res) => setCoins(res.coins))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        Crypto Market
      </p>
      {loading && <p className="mt-2 text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}
      {coins && (
        <div className="mt-2 space-y-2">
          {coins.map((c) => {
            const up = (c.change24h ?? 0) >= 0
            return (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-sm text-rdp-text">{c.label}</span>
                <div className="text-right">
                  <p className="font-mono text-sm tabular-nums text-rdp-text">
                    ${c.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  {c.change24h != null && (
                    <p className={`font-mono text-xs tabular-nums ${up ? 'text-rdp-good' : 'text-rdp-risk'}`}>
                      {up ? '+' : ''}
                      {c.change24h.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
