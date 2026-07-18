import { useHabits } from '@/features/habits/useHabits'
import { useGoals } from '@/features/goals/useGoals'
import { useTasks } from '@/features/tasks/useTasks'

/**
 * Echoes the reference image's "Mission Progress" sidebar (labeled bars:
 * Growth/Impact/Mastery/Legacy), but with real computed numbers instead
 * of invented ones — habit completion has an honest ratio to show;
 * active goals and today's tasks are shown as plain counts rather than a
 * fabricated percentage, since there's no meaningful "out of what" for
 * those yet (no capacity/target concept exists).
 */
export default function MissionProgress() {
  const { habits, loading: habitsLoading } = useHabits()
  const { goals, loading: goalsLoading } = useGoals()
  const { tasks, loading: tasksLoading } = useTasks('today')

  const habitsDone = habits.filter((h) => h.completedToday).length
  const habitsTotal = habits.length
  const habitsPct = habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0
  const activeGoals = goals.filter((g) => g.status === 'active').length
  const loading = habitsLoading || goalsLoading || tasksLoading

  return (
    <div className="rounded-xl border border-rdp-line bg-rdp-panel p-4">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-rdp-text-faint">
        Mission Progress
      </p>

      {loading ? (
        <p className="mt-2 text-sm text-rdp-text-faint">Loading…</p>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <div className="flex justify-between text-xs">
              <span className="text-rdp-text-dim">Habits today</span>
              <span className="font-mono tabular-nums text-rdp-text">
                {habitsDone}/{habitsTotal}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-rdp-line">
              <div className="h-full rounded-full bg-rdp-signal" style={{ width: `${habitsPct}%` }} />
            </div>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-rdp-text-dim">Active goals</span>
            <span className="font-mono tabular-nums text-rdp-amber">{activeGoals}</span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-rdp-text-dim">Tasks queued today</span>
            <span className="font-mono tabular-nums text-rdp-amber">{tasks.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
