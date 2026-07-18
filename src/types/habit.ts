export type Habit = {
  id: string
  user_id: string
  name: string
  pillar_id: string | null
  frequency: string
  target: number
  reminder_time: string | null
  archived: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // Computed server-side, not stored:
  currentStreak: number
  longestStreak: number
  successRate30d: number
  completedToday: boolean
}
