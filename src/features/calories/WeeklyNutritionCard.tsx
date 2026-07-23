import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import Skeleton from '@/components/Skeleton'

type Stats = {
  daysLogged: number
  totalDaysInWindow: number
  avgDailyCalories: number
  dailyCalorieGoal: number | null
  avgDailyProtein: number
  dailyProteinGoal: number | null
  daysOverGoal: number | null
  daysUnderGoal: number | null
}

/**
 * Real 7-day stats from food_logs plus a short AI-written assessment
 * that comments on those real numbers — same pattern as Executive
 * Summary and Habit Ideas. Never invents data; if nothing's logged this
 * week, says so plainly instead of generating a hollow assessment.
 */
export default function WeeklyNutritionCard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [assessment, setAssessment] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ stats: Stats; assessment: string | null; note?: string }>('/food-weekly-summary')
      .then((res) => {
        setStats(res.stats)
        setAssessment(res.assessment)
        setNote(res.note ?? null)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      {loading && <Skeleton lines={3} />}
      {error && <p className="text-sm text-rdp-risk">{error}</p>}
      {note && <p className="text-sm text-rdp-text-dim">{note}</p>}

      {stats && !note && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="font-mono text-lg tabular-nums text-rdp-text">
              {stats.daysLogged}/{stats.totalDaysInWindow}
            </p>
            <p className="text-xs text-rdp-text-faint">Days logged</p>
          </div>
          <div>
            <p className="font-mono text-lg tabular-nums text-rdp-text">{stats.avgDailyCalories}</p>
            <p className="text-xs text-rdp-text-faint">Avg cal/day</p>
          </div>
          <div>
            <p className="font-mono text-lg tabular-nums text-rdp-text">{stats.avgDailyProtein}g</p>
            <p className="text-xs text-rdp-text-faint">Avg protein/day</p>
          </div>
          {stats.dailyCalorieGoal && (
            <>
              <div>
                <p className="font-mono text-lg tabular-nums text-rdp-risk">{stats.daysOverGoal}</p>
                <p className="text-xs text-rdp-text-faint">Days over goal</p>
              </div>
              <div>
                <p className="font-mono text-lg tabular-nums text-rdp-good">{stats.daysUnderGoal}</p>
                <p className="text-xs text-rdp-text-faint">Days at/under</p>
              </div>
            </>
          )}
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
