import Disclosure from '@/components/Disclosure'
import PillarHero from '@/components/PillarHero'
import ExecutiveSummaryCard from '@/features/executiveSummary/ExecutiveSummaryCard'
import MissionProgress from '@/features/dashboard/MissionProgress'
import PillarTaskSummary from '@/features/pillarSummary/PillarTaskSummary'
import TaskList from '@/features/tasks/TaskList'
import QuickAddBar from '@/features/tasks/QuickAddBar'
import GoalRow from '@/features/goals/GoalRow'
import { useGoals } from '@/features/goals/useGoals'

function AllGoals() {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals()
  return (
    <div>
      <QuickAddBar onAdd={createGoal} placeholder="Add a goal…" />
      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}
      <div className="mt-3 space-y-2">
        {loading ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : goals.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No goals yet.</p>
        ) : (
          goals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              onUpdate={(updates) => updateGoal(goal.id, updates)}
              onDelete={() => deleteGoal(goal.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/**
 * Mission Control — "Plan. Execute. Win. You are the captain." per the
 * reference image: goals, planning, execution, analysis, and the
 * Executive Summary. Today's info (weather/news/calendar/check-in) lives
 * on Daily Dashboard instead — a real split from the earlier version of
 * this page, per the 4-then-5-zone consolidation.
 */
export default function MissionControlPage() {
  return (
    <div>
      <PillarHero slug="mission-control" alt="Mission Control" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Mission Control</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Plan. Execute. Win. You are the captain.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Executive Summary" defaultOpen>
          <ExecutiveSummaryCard />
        </Disclosure>

        <Disclosure title="Analyze" subtitle="Progress across pillars" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <MissionProgress />
            <PillarTaskSummary />
          </div>
        </Disclosure>

        <Disclosure title="Plan" subtitle="Today's tasks, all pillars" defaultOpen>
          <TaskList view="today" quickAddPlaceholder="Add a task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="All pillars">
          <AllGoals />
        </Disclosure>
      </div>
    </div>
  )
}
