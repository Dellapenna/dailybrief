import PillarHero from '@/components/PillarHero'
import QuickAddBar from '@/features/tasks/QuickAddBar'
import HabitRow from '@/features/habits/HabitRow'
import { useHabits } from '@/features/habits/useHabits'

export default function HabitsPage() {
  const { habits, loading, error, createHabit, toggleToday, deleteHabit } = useHabits()

  return (
    <div>
      <PillarHero slug="habits" alt="Habits" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Habits</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Small actions. Big transformation.</p>

      <div className="mt-4">
        <QuickAddBar onAdd={createHabit} placeholder="Add a daily habit…" />
      </div>

      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : habits.length === 0 ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">No habits yet. Add one above.</p>
        ) : (
          habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} onToggle={toggleToday} onDelete={(h) => deleteHabit(h.id)} />
          ))
        )}
      </div>
    </div>
  )
}
