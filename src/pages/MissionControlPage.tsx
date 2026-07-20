import FrameShell from '@/components/FrameShell'
import Disclosure from '@/components/Disclosure'
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
 * reference image. Now using the full FrameShell treatment (parchment
 * scroll frame, content scrolls in a window over the blank area) rather
 * than a small hero banner — this frame has a much more generous,
 * cleanly centered blank area than the earlier Life frame attempt, so
 * worth trying again here specifically. Window coordinates estimated by
 * eye, not pixel-verified — expect to adjust once seen live.
 */
export default function MissionControlPage() {
  return (
    <FrameShell
      frameSrc="/images/frames/mission-control.jpg"
      frameAlt="Mission Control — Plan. Execute. Win. You are the captain."
      window={{ top: 19, left: 8, width: 84, height: 64 }}
    >
      <h1 className="sr-only">Mission Control</h1>
      <div className="space-y-3">
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
    </FrameShell>
  )
}
