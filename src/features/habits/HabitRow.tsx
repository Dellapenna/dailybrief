import type { Habit } from '@/types/habit'

/**
 * Streak shown, not emphasized — a single small number next to the name,
 * not a giant counter. Per the brief: missing one day shouldn't feel like
 * losing everything, so this deliberately doesn't do "streak broken!"
 * messaging or fire emoji or anything gamified.
 */
export default function HabitRow({
  habit,
  onToggle,
  onDelete,
}: {
  habit: Habit
  onToggle: (habit: Habit) => void
  onDelete: (habit: Habit) => void
}) {
  return (
    <div className="group flex items-center gap-3 border-b border-rdp-line px-1 py-3 last:border-b-0">
      <button
        onClick={() => onToggle(habit)}
        aria-label={habit.completedToday ? 'Mark not done today' : 'Mark done today'}
        className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
          habit.completedToday ? 'border-rdp-good bg-rdp-good' : 'border-rdp-text-faint hover:border-rdp-signal'
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-rdp-text">{habit.name}</p>
        <p className="mt-0.5 font-mono text-xs tabular-nums text-rdp-text-faint">
          streak {habit.currentStreak}d · best {habit.longestStreak}d · {habit.successRate30d}% / 30d
        </p>
      </div>
      <button
        onClick={() => {
          if (window.confirm(`Delete "${habit.name}"? This deletes its whole history and can't be undone.`))
            onDelete(habit)
        }}
        aria-label="Delete habit"
        className="pointer-events-none shrink-0 text-xs text-rdp-text-faint opacity-0 hover:text-rdp-risk group-hover:pointer-events-auto group-hover:opacity-100"
      >
        Delete
      </button>
    </div>
  )
}
