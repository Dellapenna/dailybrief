import { useState } from 'react'
import TaskList from '@/features/tasks/TaskList'
import Tabs from '@/components/Tabs'
import type { TaskView } from '@/features/tasks/useTasks'

const tabs: { value: TaskView; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'this_week', label: 'This Week' },
  { value: 'someday', label: 'Someday' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'completed', label: 'Completed' },
]

export default function TasksPage() {
  const [active, setActive] = useState<TaskView>('today')

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-rdp-text">Tasks</h1>

      <div className="mt-4">
        <Tabs items={tabs} active={active} onChange={setActive} />
      </div>

      <div className="mt-4">
        <TaskList
          view={active}
          quickAddPlaceholder={
            active === 'today' ? 'Add a task for today…' : `Add a task to ${tabs.find((t) => t.value === active)?.label}…`
          }
        />
      </div>
    </div>
  )
}
