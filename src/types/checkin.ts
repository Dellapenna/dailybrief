export type MorningCheckin = {
  id: string
  user_id: string
  checkin_date: string
  sleep_duration: number | null
  sleep_quality: number | null
  energy: number | null
  mood: number | null
  stress: number | null
  glucose: number | null
  weight: number | null
  symptoms: string | null
  planned_exercise: string | null
  biggest_concern: string | null
  most_important_outcome: string | null
} | null
