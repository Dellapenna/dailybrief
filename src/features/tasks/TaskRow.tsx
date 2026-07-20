import { useState } from 'react'
import type { Task, TaskRecurrence } from '@/types/task'

const RECURRENCE_LABELS: Record<TaskRecurrence, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

export default function TaskRow({
  task,
  onToggleComplete,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  task: Task
  onToggleComplete: (task: Task) => void
  onUpdate: (updates: Partial<Task>) => void
  onDelete: (task: Task) => void
  onMoveUp: (task: Task) => void
  onMoveDown: (task: Task) => void
}) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(task.notes ?? '')
  const [project, setProject] = useState(task.project ?? '')

  const isOverdue =
    task.due_date && task.status !== 'completed' && new Date(task.due_date) < new Date(new Date().toDateString())

  return (
    <div className="border-b border-rdp-line last:border-b-0">
      <div className="flex items-center gap-3 px-1 py-3">
        <button
          onClick={() => onToggleComplete(task)}
          aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
          className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
            task.status === 'completed'
              ? 'border-rdp-good bg-rdp-good'
              : 'border-rdp-text-faint hover:border-rdp-signal'
          }`}
        />

        <button onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left" aria-expanded={open}>
          <p
            className={`truncate text-sm ${
              task.status === 'completed' ? 'text-rdp-text-faint line-through' : 'text-rdp-text'
            }`}
          >
            {task.title}
          </p>
          {(task.project || task.due_date || task.recurrence !== 'none') && (
            <p className="mt-0.5 truncate text-xs text-rdp-text-faint">
              {task.project}
              {task.project && task.due_date && ' · '}
              {task.due_date && (
                <span className={isOverdue ? 'font-medium text-rdp-risk' : ''}>
                  {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
              {task.recurrence !== 'none' && (
                <span className="text-rdp-signal">
                  {(task.project || task.due_date) && ' · '}↻ {RECURRENCE_LABELS[task.recurrence]}
                </span>
              )}
            </p>
          )}
        </button>

        {task.flagged && <span className="shrink-0 text-sm text-rdp-amber">★</span>}

        <div className="flex shrink-0 flex-col">
          <button
            onClick={() => onMoveUp(task)}
            aria-label="Move up"
            className="px-1 text-xs leading-none text-rdp-text-faint hover:text-rdp-signal"
          >
            ▲
          </button>
          <button
            onClick={() => onMoveDown(task)}
            aria-label="Move down"
            className="px-1 text-xs leading-none text-rdp-text-faint hover:text-rdp-signal"
          >
            ▼
          </button>
        </div>

        <span className={`shrink-0 font-mono text-xs text-rdp-text-faint transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </div>

      {open && (
        <div className="space-y-3 px-1 pb-4">
          <div>
            <label className="text-xs text-rdp-text-faint">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => onUpdate({ notes: notes || null })}
              rows={3}
              placeholder="Add notes…"
              className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none focus:ring-2 focus:ring-rdp-signal/20"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-rdp-text-faint">Project</label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                onBlur={() => onUpdate({ project: project || null })}
                placeholder="Optional"
                className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text placeholder:text-rdp-text-faint focus:border-rdp-signal focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-rdp-text-faint">Due date</label>
              <input
                type="date"
                value={task.due_date ?? ''}
                onChange={(e) => onUpdate({ due_date: e.target.value || null })}
                className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-rdp-text-faint">Repeats</label>
              <select
                value={task.recurrence}
                onChange={(e) => onUpdate({ recurrence: e.target.value as TaskRecurrence })}
                className="mt-1 w-full rounded-lg border border-rdp-line bg-rdp-void px-3 py-2 text-sm text-rdp-text focus:border-rdp-signal focus:outline-none"
              >
                <option value="none">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex flex-1 items-end">
              <button
                onClick={() => onUpdate({ flagged: !task.flagged })}
                className={`w-full rounded-lg border px-3 py-2 text-sm font-medium ${
                  task.flagged
                    ? 'border-rdp-amber text-rdp-amber'
                    : 'border-rdp-line text-rdp-text-dim hover:border-rdp-signal'
                }`}
              >
                {task.flagged ? '★ Flagged' : '☆ Flag it'}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) onDelete(task)
            }}
            className="text-xs text-rdp-text-faint hover:text-rdp-risk"
          >
            Delete task
          </button>
        </div>
      )}
    </div>
  )
}
