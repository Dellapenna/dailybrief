import { useState } from 'react'
import Disclosure from '@/components/Disclosure'
import type { Goal, GoalStatus } from '@/types/goal'

const statusOptions: { value: GoalStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' },
]

const statusColor: Record<GoalStatus, string> = {
  active: 'text-rdp-signal',
  paused: 'text-rdp-amber',
  completed: 'text-rdp-good',
  abandoned: 'text-rdp-text-faint',
}

export default function GoalRow({
  goal,
  onUpdate,
  onDelete,
}: {
  goal: Goal
  onUpdate: (updates: Partial<Goal>) => void
  onDelete: () => void
}) {
  const [whyItMatters, setWhyItMatters] = useState(goal.why_it_matters ?? '')
  const [nextAction, setNextAction] = useState(goal.next_action ?? '')

  const daysLeft = goal.target_date
    ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000)
    : null

  return (
    <Disclosure
      title={goal.title}
      subtitle={
        [
          statusOptions.find((s) => s.value === goal.status)?.label,
          daysLeft != null ? `${daysLeft >= 0 ? `${daysLeft}d left` : 'past due'}` : null,
        ]
          .filter(Boolean)
          .join(' · ')
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-xs text-rdp-text-faint">Why it matters</label>
          <textarea
            value={whyItMatters}
            onChange={(e) => setWhyItMatters(e.target.value)}
            onBlur={() => onUpdate({ why_it_matters: whyItMatters || null })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
          />
        </div>

        <div>
          <label className="text-xs text-rdp-text-faint">Next action</label>
          <input
            type="text"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            onBlur={() => onUpdate({ next_action: nextAction || null })}
            className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs text-rdp-text-faint">Status</label>
            <select
              value={goal.status}
              onChange={(e) => onUpdate({ status: e.target.value as GoalStatus })}
              className={`mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm focus:border-rdp-signal focus:outline-none ${statusColor[goal.status]}`}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-rdp-text-faint">Target date</label>
            <input
              type="date"
              value={goal.target_date ?? ''}
              onChange={(e) => onUpdate({ target_date: e.target.value || null })}
              className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm(`Delete "${goal.title}"? This can't be undone.`)) onDelete()
          }}
          className="text-xs text-rdp-text-faint hover:text-rdp-risk"
        >
          Delete goal
        </button>
      </div>
    </Disclosure>
  )
}
