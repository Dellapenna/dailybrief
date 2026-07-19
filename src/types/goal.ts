export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned'

export type Goal = {
  id: string
  user_id: string
  title: string
  description: string | null
  pillar_id: string | null
  why_it_matters: string | null
  start_date: string
  target_date: string | null
  starting_point: string | null
  target_result: string | null
  current_result: string | null
  status: GoalStatus
  weekly_target: string | null
  next_action: string | null
  obstacles: string | null
  confidence_level: number | null
  estimated_probability: number | null
  probability_method: 'user_entered' | 'rules_based'
  created_at: string
  updated_at: string
}
