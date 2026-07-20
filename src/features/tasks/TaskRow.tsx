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
  onToggleFlag,
  onDelete,
  onRecurrenceChange,
}: {
  task: Task
  onToggleComplete: (task: Task) => void
  onToggleFlag: (task: Task) => void
  onDelete: (task: Task) => void
  onRecurrenceChange: (task: Task, recurrence: TaskRecurrence) => void
}) {
  const isOverdue =
    task.due_date && task.status !== 'completed' && new Date(task.due_date) < new Date(new Date().toDateString())

  return (
    <div className="group flex items-center gap-3 border-b border-rdp-line px-1 py-3 last:border-b-0">
      <button
        onClick={() => onToggleComplete(task)}
        aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
        className={`h-5 w-5 shrink-0 rounded-full border-2 transition-colors ${
          task.status === 'completed'
            ? 'border-rdp-good bg-rdp-good'
            : 'border-rdp-text-faint hover:border-rdp-signal'
        }`}
      />
      <div className="min-w-0 flex-1">
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
      </div>
      <select
        value={task.recurrence}
        onChange={(e) => onRecurrenceChange(task, e.target.value as TaskRecurrence)}
        aria-label="Recurrence"
        className={`shrink-0 rounded border-none bg-transparent text-xs ${
          task.recurrence !== 'none' ? 'text-rdp-signal' : 'text-rdp-text-faint'
        }`}
      >
        <option value="none">↻ One-time</option>
        <option value="daily">↻ Daily</option>
        <option value="weekly">↻ Weekly</option>
        <option value="monthly">↻ Monthly</option>
      </select>
      <button
        onClick={() => onToggleFlag(task)}
        aria-label={task.flagged ? 'Remove flag' : 'Flag task'}
        className={`shrink-0 text-sm ${task.flagged ? 'text-rdp-amber' : 'text-rdp-line'}`}
      >
        ★
      </button>
      <button
        onClick={() => {
          if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) onDelete(task)
        }}
        aria-label="Delete task"
        className="shrink-0 text-xs text-rdp-text-faint hover:text-rdp-risk"
      >
        Delete
      </button>
    </div>
  )
}
