import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      age: body.age,
      sex: body.sex,
      height_cm: body.height_cm,
      weight_kg: body.weight_kg,
      goal_weight_kg: body.goal_weight_kg,
      goal: body.goal,
      activity_level: body.activity_level,
      dietary_preferences: body.dietary_preferences,
      allergies: body.allergies,
      foods_to_avoid: body.foods_to_avoid,
      budget_level: body.budget_level,
      wake_time: body.wake_time,
      bed_time: body.bed_time,
      meals_per_day: body.meals_per_day,
      workout_time: body.workout_time || null,
      daily_calories: body.daily_calories,
      protein_g: body.protein_g,
      carbs_g: body.carbs_g,
      fat_g: body.fat_g,
      onboarding_complete: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Profile insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ profileId: data.id })
}
