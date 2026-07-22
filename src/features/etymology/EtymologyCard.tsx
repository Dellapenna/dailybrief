import { useEffect, useState } from 'react'
import Skeleton from '@/components/Skeleton'
import { api } from '@/lib/api'

type EtymologyEntry = { word: string; origin: string; language: string; note: string }

export default function EtymologyCard() {
  const [entry, setEntry] = useState<EtymologyEntry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ entry: EtymologyEntry }>('/etymology')
      .then((res) => setEntry(res.entry))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        Word Origins
      </p>
      {loading && <Skeleton lines={2} className="mt-2" />}
      {error && <p className="mt-2 text-sm text-rdp-risk">{error}</p>}
      {entry && (
        <div className="mt-2">
          <p className="font-display text-lg font-semibold text-rdp-amber">{entry.word}</p>
          <p className="mt-0.5 text-xs text-rdp-text-faint">
            From <span className="italic">{entry.origin}</span> ({entry.language})
          </p>
          <p className="mt-2 text-sm text-rdp-text">{entry.note}</p>
        </div>
      )}
    </div>
  )
}
