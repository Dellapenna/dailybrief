import { useEffect, useState } from 'react'
import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import Skeleton from '@/components/Skeleton'
import { TrendingUp, Sparkles, Target, Activity } from 'lucide-react'
import { api } from '@/lib/api'
import {
  WeightTrendChart,
  CalorieTrendChart,
  WaterTrendChart,
  HabitConsistencyChart,
  TaskCompletionChart,
} from '@/features/trends/TrendCharts'
import GoalProgressCard from '@/features/trends/GoalProgressCard'
import HealthTrends from '@/features/exercise/HealthTrends'

type TrendsData = {
  weightTrend: { date: string; weight: number }[]
  calorieTrend: { date: string; consumed: number }[]
  calorieGoal: number | null
  waterTrend: { date: string; glasses: number }[]
  habitConsistency: { date: string; completed: number; total: number }[]
  taskCompletionTrend: { date: string; completed: number }[]
  goals: {
    id: string
    title: string
    status: string
    pillar_id: string | null
    confidence_level: number | null
    estimated_probability: number | null
    target_date: string | null
    next_action: string | null
  }[]
  stats: {
    weightDataPoints: number
    avgCaloriesLast7: number | null
    calorieGoal: number | null
    avgWaterLast7: number | null
    habitCompletionRateLast7: number | null
    tasksCompletedLast7: number
    activeGoalCount: number
  }
  summary: string | null
  note: string | null
}

/**
 * Trends & Progress — real charts over tracked data (weight, calories,
 * water, habit consistency, task completion), goal progress visuals,
 * and an honest AI executive summary with recommendations tied to
 * actual active goals. Everything charted is real logged data; the
 * summary explicitly says when there's not enough history yet rather
 * than synthesizing insight from thin data.
 */
export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<TrendsData & { cached: boolean }>('/trends?days=30')
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PillarHero slug="trends" alt="Trends & Progress" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Trends & Progress</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Track the signal. Measure the movement. See the trends. Drive the progress.</p>

      {loading && <Skeleton lines={4} className="mt-5" />}
      {error && <p className="mt-5 text-sm text-rdp-risk">{error}</p>}

      {data && (
        <div className="mt-5 space-y-3">
          {data.note && (
            <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
              <p className="text-sm text-rdp-text-dim">{data.note}</p>
            </div>
          )}

          {data.summary && (
            <Disclosure title="Executive Summary" subtitle="Honest read on the last 7 days + recommendations" icon={Sparkles} defaultOpen>
              <p className="text-sm text-rdp-text">{data.summary}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-rdp-line pt-3 sm:grid-cols-4">
                <div>
                  <p className="font-mono text-lg tabular-nums text-rdp-text">
                    {data.stats.avgCaloriesLast7 ?? '—'}
                  </p>
                  <p className="text-xs text-rdp-text-faint">Avg cal/day</p>
                </div>
                <div>
                  <p className="font-mono text-lg tabular-nums text-rdp-text">{data.stats.avgWaterLast7 ?? '—'}</p>
                  <p className="text-xs text-rdp-text-faint">Avg glasses/day</p>
                </div>
                <div>
                  <p className="font-mono text-lg tabular-nums text-rdp-text">
                    {data.stats.habitCompletionRateLast7 !== null ? `${data.stats.habitCompletionRateLast7}%` : '—'}
                  </p>
                  <p className="text-xs text-rdp-text-faint">Habit rate</p>
                </div>
                <div>
                  <p className="font-mono text-lg tabular-nums text-rdp-text">{data.stats.tasksCompletedLast7}</p>
                  <p className="text-xs text-rdp-text-faint">Tasks done</p>
                </div>
              </div>
            </Disclosure>
          )}

          <Disclosure title="Goals" subtitle={`${data.stats.activeGoalCount} active`} icon={Target} defaultOpen>
            {data.goals.length === 0 ? (
              <p className="text-sm text-rdp-text-faint">No goals yet — add some on Mission Control.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.goals.map((g) => (
                  <GoalProgressCard key={g.id} goal={g} />
                ))}
              </div>
            )}
          </Disclosure>

          <Disclosure title="Weight" icon={TrendingUp} defaultOpen>
            <WeightTrendChart data={data.weightTrend} />
          </Disclosure>

          <Disclosure title="Calories" subtitle="Daily total vs. goal (dashed line)" icon={TrendingUp} defaultOpen>
            <CalorieTrendChart data={data.calorieTrend} goal={data.calorieGoal} />
          </Disclosure>

          <Disclosure title="Water" subtitle="Glasses/day vs. 8-glass goal (dashed line)" icon={TrendingUp}>
            <WaterTrendChart data={data.waterTrend} />
          </Disclosure>

          <Disclosure title="Habit Consistency" subtitle="Habits completed per day" icon={TrendingUp}>
            <HabitConsistencyChart data={data.habitConsistency} />
          </Disclosure>

          <Disclosure title="Task Completion" subtitle="Tasks completed per day" icon={TrendingUp}>
            <TaskCompletionChart data={data.taskCompletionTrend} />
          </Disclosure>

          <Disclosure title="Detailed Health Log" subtitle="Sleep, energy, glucose from Check-in" icon={Activity}>
            <HealthTrends />
          </Disclosure>
        </div>
      )}
    </div>
  )
}
