import { useState } from 'react'
import PillarHero from '@/components/PillarHero'
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
      <PillarHero slug="tasks" alt="Tasks" />
      <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-rdp-text">Tasks</h1>
      <p className="mt-1 text-sm text-rdp-text-dim">Plan it. Prioritize it. Crush it.</p>

      <div className="mt-4">
        <Tabs items={tabs} active={active} onChange={setActive} />
      </div>

      <div className="mt-4">
        <TaskList
          view={active}
          quickAddPlaceholder={
            active === 'today' ? 'Add a task for today…' : `Add a task to ${tabs.find((t) => t.value === active)?.label}…`
          }
          groupByProject
        />
      </div>
    </div>
  )
}
