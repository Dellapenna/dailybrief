import { useEffect, useState } from 'react'
import { api, ApiError } from '@/lib/api'

export default function StocksPage() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    api.get('/stocks').catch((err) => {
      setMessage(err instanceof ApiError ? err.message : 'Failed to load')
    })
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Stock Market</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Track markets. Make moves.</p>

      <div className="mt-6 rounded-xl border border-rdp-line bg-rdp-panel p-6">
        <p className="text-sm text-rdp-text-dim">{message ?? 'Loading…'}</p>
        <p className="mt-3 text-xs text-rdp-text-faint">
          This is informational only, never individualized investment advice, once connected.
        </p>
      </div>
    </div>
  )
}
