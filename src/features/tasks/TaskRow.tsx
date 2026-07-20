import type { Task } from '@/types/task'

export default function TaskRow({
  task,
  onToggleComplete,
  onToggleFlag,
  onDelete,
}: {
  task: Task
  onToggleComplete: (task: Task) => void
  onToggleFlag: (task: Task) => void
  onDelete: (task: Task) => void
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
        {(task.project || task.due_date) && (
          <p className="mt-0.5 truncate text-xs text-rdp-text-faint">
            {task.project}
            {task.project && task.due_date && ' · '}
            {task.due_date && (
              <span className={isOverdue ? 'font-medium text-rdp-risk' : ''}>
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            )}
          </p>
        )}
      </div>
      <button
        onClick={() => onToggleFlag(task)}
        aria-label={task.flagged ? 'Remove flag' : 'Flag task'}
        className={`shrink-0 text-sm ${
          task.flagged
            ? 'text-rdp-amber'
            : 'pointer-events-none text-rdp-line opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
        }`}
      >
        ★
      </button>
      <button
        onClick={() => {
          if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) onDelete(task)
        }}
        aria-label="Delete task"
        className="pointer-events-none shrink-0 text-xs text-rdp-text-faint opacity-0 hover:text-rdp-risk group-hover:pointer-events-auto group-hover:opacity-100"
      >
        Delete
      </button>
    </div>
  )
}
