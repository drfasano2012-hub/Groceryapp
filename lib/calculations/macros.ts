import { ActivityLevel, Goal, Sex } from '@/types'

export function calculateMacros(params: {
  age: number
  sex: Sex
  height_cm: number
  weight_kg: number
  goal_weight_kg: number
  goal: Goal
  activity_level: ActivityLevel
}) {
  const { age, sex, height_cm, weight_kg, goal, activity_level } = params

  let bmr =
    sex === 'male'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
      : 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  }

  const tdee = bmr * activityMultipliers[activity_level]

  let daily_calories: number
  switch (goal) {
    case 'lose_fat':
      daily_calories = Math.round(tdee - 500)
      break
    case 'build_muscle':
      daily_calories = Math.round(tdee + 300)
      break
    default:
      daily_calories = Math.round(tdee)
  }

  daily_calories = Math.max(1200, daily_calories)

  const proteinMultipliers: Record<Goal, number> = {
    build_muscle: 2.2,
    lose_fat: 1.8,
    maintain: 1.6,
  }
  const protein_g = Math.round(weight_kg * proteinMultipliers[goal])
  const fat_g = Math.round((daily_calories * 0.27) / 9)
  const remaining = daily_calories - protein_g * 4 - fat_g * 9
  const carbs_g = Math.round(Math.max(50, remaining / 4))

  return { daily_calories, protein_g, carbs_g, fat_g }
}

export function heightFromFeetInches(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54)
}

export function kgFromLbs(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10
}

export function lbsFromKg(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10
}
