import type { Habit } from '@/types/habit'
import { PILLAR_LABELS, type PillarId } from '@/types/pillar'

/**
 * Streak shown, not emphasized — a single small number next to the name,
 * not a giant counter. Per the brief: missing one day shouldn't feel like
 * losing everything, so this deliberately doesn't do "streak broken!"
 * messaging or fire emoji or anything gamified.
 *
 * Pillar selector shown when `showPillarSelector` — used on Mission
 * Control's consolidated all-habits view so a habit's pillar tag can be
 * set/changed without visiting that pillar's own page.
 */
export default function HabitRow({
  habit,
  onToggle,
  onDelete,
  onPillarChange,
  showPillarSelector = false,
}: {
  habit: Habit
  onToggle: (habit: Habit) => void
  onDelete: (habit: Habit) => void
  onPillarChange?: (habit: Habit, pillarId: PillarId | null) => void
  showPillarSelector?: boolean
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
      {showPillarSelector && onPillarChange && (
        <select
          value={habit.pillar_id ?? ''}
          onChange={(e) => onPillarChange(habit, (e.target.value || null) as PillarId | null)}
          aria-label="Pillar"
          className="shrink-0 rounded border-none bg-transparent text-xs text-rdp-text-dim"
        >
          <option value="">No pillar</option>
          {(Object.keys(PILLAR_LABELS) as PillarId[]).map((p) => (
            <option key={p} value={p}>
              {PILLAR_LABELS[p]}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={() => {
          if (window.confirm(`Delete "${habit.name}"? This deletes its whole history and can't be undone.`))
            onDelete(habit)
        }}
        aria-label="Delete habit"
        className="shrink-0 text-xs text-rdp-text-faint hover:text-rdp-risk"
      >
        Delete
      </button>
    </div>
  )
}
