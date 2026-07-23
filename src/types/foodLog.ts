export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type FoodLogEntry = {
  id: string
  user_id: string
  food_name: string
  meal: Meal
  calories: number
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  sugar_g: number | null
  quantity: number
  fdc_id: string | null
  logged_date: string
  created_at: string
}

export type FoodSearchResult = {
  fdcId: string
  description: string
  calories: number
  proteinG: number | null
  carbsG: number | null
  fatG: number | null
  sugarG: number | null
}
