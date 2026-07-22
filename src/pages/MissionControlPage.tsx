import PillarHero from '@/components/PillarHero'
import Disclosure from '@/components/Disclosure'
import Skeleton from '@/components/Skeleton'
import TabbedCard from '@/components/TabbedCard'
import { Sunrise, ListTodo, Target, Sparkles, Repeat } from 'lucide-react'
import { Link } from 'react-router-dom'
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
          <Skeleton lines={3} />
        ) : goals.length === 0 ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">No goals yet — add one above.</p>
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
 * Mission Control — "Plan. Execute. Win. You are the captain." The only
 * home for Goals (no separate /goals page). Habit Ideas moved to
 * Habits & Logbook so suggesting a habit and adding it happen in the
 * same place — see that page. Daily Dashboard is the reading/
 * informational counterpart.
 */
export default function MissionControlPage() {
  return (
    <div>
      <PillarHero slug="mission-control" alt="Mission Control" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Mission Control</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Plan. Execute. Win. You are the captain.</p>

      <Link
        to="/habits"
        className="mt-3 flex items-center gap-2 rounded-xl border border-rdp-line bg-rdp-panel px-4 py-3 text-sm text-rdp-signal hover:bg-rdp-void"
      >
        <Repeat className="h-4 w-4" />
        Habits & Logbook live here — tap to open
      </Link>

      <div className="mt-3 space-y-3">
        <Disclosure title="Morning Check-in" icon={Sunrise} defaultOpen>
          <CheckInForm />
        </Disclosure>

        <Disclosure title="Plan" subtitle="Today's tasks, all pillars" icon={ListTodo} defaultOpen>
          <TaskList view="today" quickAddPlaceholder="Add a task…" />
        </Disclosure>

        <Disclosure title="Goals" subtitle="All pillars" icon={Target} defaultOpen>
          <AllGoals />
        </Disclosure>

        <Disclosure title="Insights" subtitle="Executive Summary, Progress" icon={Sparkles}>
          <TabbedCard
            tabs={[
              { label: 'Executive Summary', content: <ExecutiveSummaryCard /> },
              {
                label: 'Progress',
                content: (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MissionProgress />
                    <PillarTaskSummary />
                  </div>
                ),
              },
            ]}
          />
        </Disclosure>
      </div>
    </div>
  )
}
