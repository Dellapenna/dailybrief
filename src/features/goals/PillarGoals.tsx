import QuickAddBar from '@/features/tasks/QuickAddBar'
import GoalRow from './GoalRow'
import { useGoals } from './useGoals'
import type { PillarId } from '@/types/pillar'

export default function PillarGoals({ pillar }: { pillar: PillarId }) {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals(pillar)

  return (
    <div>
      <QuickAddBar onAdd={createGoal} placeholder="Add a goal…" />
      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}
      <div className="mt-3 space-y-2">
        {loading ? (
          <p className="py-4 text-center text-sm text-rdp-text-faint">Loading…</p>
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
