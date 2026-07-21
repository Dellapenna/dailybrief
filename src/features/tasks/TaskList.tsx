import { useMemo, useState, type ReactNode } from 'react'
import QuickAddBar from './QuickAddBar'
import TaskRow from './TaskRow'
import { useTasks, type TaskView } from './useTasks'
import type { Task } from '@/types/task'
import type { PillarId } from '@/types/pillar'

function TaskRows({
  tasks,
  toggleComplete,
  updateTask,
  deleteTask,
  moveTask,
}: {
  tasks: Task[]
  toggleComplete: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, direction: 'up' | 'down') => void
}) {
  return (
    <>
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onToggleComplete={toggleComplete}
          onUpdate={(updates) => updateTask(task.id, updates)}
          onDelete={(t) => deleteTask(t.id)}
          onMoveUp={(t) => moveTask(t.id, 'up')}
          onMoveDown={(t) => moveTask(t.id, 'down')}
        />
      ))}
    </>
  )
}

function GroupSection({
  name,
  children,
}: {
  name: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-rdp-line bg-rdp-panel">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5"
      >
        <span className="font-medium text-rdp-text">{name}</span>
        <span className={`text-xs text-rdp-text-faint transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && <div className="border-t border-rdp-line px-3">{children}</div>}
    </div>
  )
}

export default function TaskList({
  view,
  pillar,
  quickAddPlaceholder,
  groupByProject = false,
}: {
  view: TaskView
  pillar?: PillarId
  quickAddPlaceholder?: string
  /** Groups the list into named sections by the task's `project` field —
   *  matching a "Lists" style organizer (Daily Routines, Work, etc.)
   *  rather than one flat list. Tasks without a project land in "Other." */
  groupByProject?: boolean
}) {
  const { tasks, loading, error, createTask, updateTask, deleteTask, moveTask } = useTasks(view, pillar)

  function toggleComplete(task: Task) {
    updateTask(task.id, { status: task.status === 'completed' ? 'inbox' : 'completed' })
  }

  const groups = useMemo(() => {
    if (!groupByProject) return null
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      const key = task.project?.trim() || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(task)
    }
    // "Other" last, named groups alphabetical
    return Array.from(map.entries()).sort(([a], [b]) => {
      if (a === 'Other') return 1
      if (b === 'Other') return -1
      return a.localeCompare(b)
    })
  }, [tasks, groupByProject])

  return (
    <div>
      <QuickAddBar onAdd={(title) => createTask(title)} placeholder={quickAddPlaceholder} />

      {error && <p className="mt-3 text-sm text-rdp-risk">{error}</p>}

      <div className="mt-4">
        {loading ? (
          <p className="rounded-xl border border-rdp-line bg-rdp-panel py-6 text-center text-sm text-rdp-text-faint">
            Loading…
          </p>
        ) : tasks.length === 0 ? (
          <p className="rounded-xl border border-rdp-line bg-rdp-panel py-6 text-center text-sm text-rdp-text-faint">
            Nothing here. Enjoy it.
          </p>
        ) : groups ? (
          groups.map(([name, groupTasks]) => (
            <GroupSection key={name} name={name}>
              <TaskRows
                tasks={groupTasks}
                toggleComplete={toggleComplete}
                updateTask={updateTask}
                deleteTask={deleteTask}
                moveTask={moveTask}
              />
            </GroupSection>
          ))
        ) : (
          <div className="rounded-xl border border-rdp-line bg-rdp-panel px-3">
            <TaskRows
              tasks={tasks}
              toggleComplete={toggleComplete}
              updateTask={updateTask}
              deleteTask={deleteTask}
              moveTask={moveTask}
            />
          </div>
        )}
      </div>
    </div>
  )
}
