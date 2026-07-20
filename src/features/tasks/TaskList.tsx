import QuickAddBar from './QuickAddBar'
import TaskRow from './TaskRow'
import { useTasks, type TaskView } from './useTasks'
import type { Task } from '@/types/task'
import type { PillarId } from '@/types/pillar'

export default function TaskList({
  view,
  pillar,
  quickAddPlaceholder,
}: {
  view: TaskView
  pillar?: PillarId
  quickAddPlaceholder?: string
}) {
  const { tasks, loading, error, createTask, updateTask, deleteTask, moveTask } = useTasks(view, pillar)

  function toggleComplete(task: Task) {
    updateTask(task.id, { status: task.status === 'completed' ? 'inbox' : 'completed' })
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
              onUpdate={(updates) => updateTask(task.id, updates)}
              onDelete={(t) => deleteTask(t.id)}
              onMoveUp={(t) => moveTask(t.id, 'up')}
              onMoveDown={(t) => moveTask(t.id, 'down')}
            />
          ))
        )}
      </div>
    </div>
  )
}
