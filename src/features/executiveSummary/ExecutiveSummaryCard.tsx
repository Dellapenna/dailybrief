import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Stats = {
  goals: { active: number; completed: number; paused: number; total: number }
  tasksCompletedThisWeek: number
  tasksOverdue: number
  habitCount: number
  habitCompletionRate7d: number
}

/**
 * Real, rules-based numbers plus a short AI-written assessment that
 * comments on them — never invents its own data. The assessment is
 * explicitly prompted to be honest and direct, not automatically
 * encouraging, per the app's "honest coaching" principle.
 */
export default function ExecutiveSummaryCard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [assessment, setAssessment] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ stats: Stats; assessment: string | null }>('/executive-summary')
      .then((res) => {
        setStats(res.stats)
        setAssessment(res.assessment)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <p className="text-sm text-rdp-text-faint">Loading…</p>}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="font-mono text-lg tabular-nums text-rdp-text">{stats.goals.active}</p>
            <p className="text-xs text-rdp-text-faint">Active goals</p>
          </div>
          <div>
            <p className="font-mono text-lg tabular-nums text-rdp-good">{stats.tasksCompletedThisWeek}</p>
            <p className="text-xs text-rdp-text-faint">Done this week</p>
          </div>
          <div>
            <p className={`font-mono text-lg tabular-nums ${stats.tasksOverdue > 0 ? 'text-rdp-risk' : 'text-rdp-text'}`}>
              {stats.tasksOverdue}
            </p>
            <p className="text-xs text-rdp-text-faint">Overdue</p>
          </div>
          <div>
            <p className="font-mono text-lg tabular-nums text-rdp-amber">{stats.habitCompletionRate7d}%</p>
            <p className="text-xs text-rdp-text-faint">Habits, 7d</p>
          </div>
        </div>
      )}

      {assessment && (
        <div className="mt-4 border-t border-rdp-line pt-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-rdp-text-faint">AI Assessment</p>
          <p className="mt-1 text-sm text-rdp-text">{assessment}</p>
        </div>
      )}
    </div>
  )
}
