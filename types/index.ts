export type Sex = 'male' | 'female' | 'other'
export type Goal = 'lose_fat' | 'build_muscle' | 'maintain'
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active'
export type BudgetLevel = 'budget' | 'moderate' | 'premium'
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type GroceryCategory = 'produce' | 'protein' | 'dairy' | 'frozen' | 'pantry'

export interface UserProfile {
  id: string
  email?: string
  age: number
  sex: Sex
  height_cm: number
  weight_kg: number
  goal_weight_kg: number
  goal: Goal
  activity_level: ActivityLevel
  dietary_preferences: string[]
  allergies: string[]
  foods_to_avoid: string[]
  budget_level: BudgetLevel
  wake_time: string
  bed_time: string
  meals_per_day: number
  workout_time?: string
  daily_calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  created_at: string
  updated_at: string
}

export interface Meal {
  id: string
  profile_id: string
  day_of_week: number
  meal_type: MealType
  name: string
  ingredients: string[]
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  scheduled_time: string
  alternatives: MealAlternative[]
  week_start_date: string
  created_at: string
}

export interface MealAlternative {
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  ingredients: string[]
}

export interface DailyLog {
  id: string
  profile_id: string
  date: string
  meal_id?: string
  meal_name: string
  meal_type: MealType
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  logged_at: string
  notes?: string
}

export interface GroceryItem {
  id: string
  profile_id: string
  name: string
  category: GroceryCategory
  quantity?: string
  checked: boolean
  week_start_date: string
}

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface MacroSummary {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface DailyProgress extends MacroSummary {
  meals_completed: number
  total_meals: number
}
