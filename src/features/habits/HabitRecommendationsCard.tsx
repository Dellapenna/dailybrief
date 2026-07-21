import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { PILLAR_LABELS, type PillarId } from '@/types/pillar'
import Skeleton from '@/components/Skeleton'

type Recommendation = { goalTitle: string; habitName: string; pillar: PillarId | null; reason: string }

/**
 * AI-suggested habits grounded in the person's real active goals — never
 * generic filler, only suggestions tied to a specific goal they actually
 * have. Same "AI comments on real data, never invents its own" pattern
 * as Mission Control's Executive Summary.
 */
export default function HabitRecommendationsCard() {
  const [recs, setRecs] = useState<Recommendation[] | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState<Set<number>>(new Set())

  useEffect(() => {
    api
      .get<{ recommendations: Recommendation[]; note?: string }>('/habit-recommendations')
      .then((res) => {
        setRecs(res.recommendations)
        setNote(res.note ?? null)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  async function addRecommendation(rec: Recommendation, index: number) {
    try {
      await api.post('/habits', { name: rec.habitName, pillarId: rec.pillar ?? null })
      setAdded((prev) => new Set(prev).add(index))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add habit')
    }
  }

  return (
    <div>
      {loading && <Skeleton lines={3} />}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {note && <p className="text-sm text-rdp-text-dim">{note}</p>}

      {recs && recs.length > 0 && (
        <div className="space-y-2">
          {recs.map((rec, i) => (
            <div key={i} className="rounded-lg border border-rdp-line bg-rdp-void p-3">
              <p className="text-xs text-rdp-text-faint">For: {rec.goalTitle}</p>
              <p className="mt-1 text-sm font-medium text-rdp-text">{rec.habitName}</p>
              <p className="mt-0.5 text-xs text-rdp-text-dim">{rec.reason}</p>
              <div className="mt-2 flex items-center justify-between">
                {rec.pillar && (
                  <span className="font-mono text-xs text-rdp-signal">{PILLAR_LABELS[rec.pillar]}</span>
                )}
                <button
                  onClick={() => addRecommendation(rec, i)}
                  disabled={added.has(i)}
                  className="ml-auto rounded-lg border border-rdp-line px-3 py-1 text-xs font-medium text-rdp-text hover:bg-rdp-panel disabled:opacity-50"
                >
                  {added.has(i) ? 'Added ✓' : 'Add this habit'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
