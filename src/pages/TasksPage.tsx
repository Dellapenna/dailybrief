import { useState } from 'react'
import FrameShell from '@/components/FrameShell'
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
    <FrameShell
      frameSrc="/images/frames/tasks.jpg"
      frameAlt="Tasks — Plan it. Prioritize it. Crush it."
      window={{ top: 19, left: 8, width: 84, height: 64 }}
    >
      <h1 className="sr-only">Tasks</h1>

      <Tabs items={tabs} active={active} onChange={setActive} />

      <div className="mt-4">
        <TaskList
          view={active}
          quickAddPlaceholder={
            active === 'today' ? 'Add a task for today…' : `Add a task to ${tabs.find((t) => t.value === active)?.label}…`
          }
        />
      </div>
    </FrameShell>
  )
}
