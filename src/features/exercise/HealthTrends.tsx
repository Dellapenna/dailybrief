import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type CheckinTrend = {
  checkin_date: string
  sleep_duration: number | null
  sleep_quality: number | null
  energy: number | null
  mood: number | null
  stress: number | null
  glucose: number | null
  weight: number | null
}

/**
 * Read-only history — the actual Check-in form lives on Mission Control
 * (it's the daily ritual), this just surfaces the resulting data over
 * time for Body.
 */
export default function HealthTrends() {
  const [checkins, setCheckins] = useState<CheckinTrend[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ checkins: CheckinTrend[] }>('/health-trends?days=14')
      .then((res) => setCheckins(res.checkins))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-rdp-text-faint">Loading…</p>
  if (error) return <p className="text-sm text-rdp-risk">{error}</p>
  if (checkins.length === 0) {
    return <p className="text-sm text-rdp-text-dim">No check-in data yet — fill out Morning Check-in on Mission Control.</p>
  }

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel px-3">
      {checkins
        .slice()
        .reverse()
        .map((c) => (
          <div key={c.checkin_date} className="flex items-center justify-between border-b border-rdp-line py-2 last:border-b-0">
            <span className="font-mono text-xs text-rdp-text-faint">
              {new Date(c.checkin_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            <span className="font-mono text-xs tabular-nums text-rdp-text">
              {c.sleep_duration != null ? `sleep ${c.sleep_duration}h` : ''}
              {c.energy != null ? ` · energy ${c.energy}/5` : ''}
              {c.weight != null ? ` · ${c.weight}lb` : ''}
              {c.glucose != null ? ` · glucose ${c.glucose}` : ''}
            </span>
          </div>
        ))}
    </div>
  )
}
