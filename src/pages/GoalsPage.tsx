import QuickAddBar from '@/features/tasks/QuickAddBar'
import GoalRow from '@/features/goals/GoalRow'
import { useGoals } from '@/features/goals/useGoals'

export default function GoalsPage() {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals()

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Goals</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">90-day missions. Tap one to expand.</p>

      <div className="mt-4">
        <QuickAddBar onAdd={createGoal} placeholder="Add a goal…" />
      </div>

      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 space-y-2">
        {loading ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : goals.length === 0 ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">No goals yet. Add one above.</p>
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
