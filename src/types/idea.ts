export type IdeaStatus = 'captured' | 'reviewing' | 'prioritized' | 'building' | 'paused' | 'rejected' | 'completed'

export type Idea = {
  id: string
  user_id: string
  title: string
  description: string | null
  notes: string | null
  category: string | null
  potential_value: string | null
  estimated_effort: string | null
  strategic_fit: string | null
  status: IdeaStatus
  date_captured: string
  next_review_date: string | null
  created_at: string
  updated_at: string
}
