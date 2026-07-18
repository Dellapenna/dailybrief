import QuickAddBar from './QuickAddBar'
import TaskRow from './TaskRow'
import { useTasks, type TaskView } from './useTasks'
import type { Task } from '@/types/task'

export default function TaskList({ view, quickAddPlaceholder }: { view: TaskView; quickAddPlaceholder?: string }) {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks(view)

  function toggleComplete(task: Task) {
    updateTask(task.id, { status: task.status === 'completed' ? 'inbox' : 'completed' })
  }

  function toggleFlag(task: Task) {
    updateTask(task.id, { flagged: !task.flagged })
  }

  return (
    <div>
      <QuickAddBar onAdd={(title) => createTask(title)} placeholder={quickAddPlaceholder} />

      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4 rounded-xl border border-rdp-line bg-rdp-panel px-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Loading…</p>
        ) : tasks.length === 0 ? (
          <p className="py-6 text-center text-sm text-rdp-text-faint">Nothing here. Enjoy it.</p>
        ) : (
          tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggleComplete={toggleComplete}
              onToggleFlag={toggleFlag}
              onDelete={(t) => deleteTask(t.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
