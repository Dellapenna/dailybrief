export type TaskStatus = 'inbox' | 'today' | 'this_week' | 'someday' | 'waiting' | 'completed'
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly'

export type Task = {
  id: string
  user_id: string
  title: string
  notes: string | null
  pillar_id: string | null
  project: string | null
  status: TaskStatus
  flagged: boolean
  due_date: string | null
  completed_at: string | null
  source: string
  sort_order: number
  recurrence: TaskRecurrence
  created_at: string
  updated_at: string
}
