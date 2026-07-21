import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import ExecutiveSummaryCard from '@/features/executiveSummary/ExecutiveSummaryCard'
import MissionProgress from '@/features/dashboard/MissionProgress'
import PillarTaskSummary from '@/features/pillarSummary/PillarTaskSummary'
import CheckInForm from '@/features/checkin/CheckInForm'
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
 * Mission Control — "Plan. Execute. Win. You are the captain." Leans
 * toward inputs (things you create/enter) per the organization pass:
 * Check-in, Plan (tasks), Goals, plus Executive Summary/Analyze which
 * review those inputs. Daily Dashboard is the reading/informational
 * counterpart — see that page.
 */
export default function MissionControlPage() {
  return (
    <div>
      <PillarHero slug="mission-control" alt="Mission Control" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Mission Control</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Plan. Execute. Win. You are the captain.</p>

      <div className="mt-5 space-y-3">
        <Disclosure title="Morning Check-in" defaultOpen>
          <CheckInForm />
        </Disclosure>

        <Disclosure title="Plan" subtitle="Today's tasks, all pillars" defaultOpen>
          <TaskList view="today" quickAddPlaceholder="Add a task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="All pillars" defaultOpen>
          <AllGoals />
        </Disclosure>

        <Disclosure title="Executive Summary">
          <ExecutiveSummaryCard />
        </Disclosure>

        <Disclosure title="Analyze" subtitle="Progress across pillars">
          <div className="grid gap-4 sm:grid-cols-2">
            <MissionProgress />
            <PillarTaskSummary />
          </div>
        </Disclosure>
      </div>
    </div>
  )
}
