export type EveningReview = {
  id: string
  user_id: string
  review_date: string
  went_well: string | null
  went_poorly: string | null
  lesson: string | null
  tomorrow_focus: string | null
  day_rating: number | null
} | null
