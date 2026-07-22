export type ExerciseCategory = 'strength' | 'aerobic' | 'stretching'

export type ExerciseLog = {
  id: string
  user_id: string
  category: ExerciseCategory
  activity: string
  duration_minutes: number | null
  calories_burned: number | null
  notes: string | null
  logged_at: string
  created_at: string
}
