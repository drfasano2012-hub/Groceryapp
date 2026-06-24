import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'
import { startOfWeek, format } from 'date-fns'

function getMealTimes(wakeTime: string, bedTime: string, mealsPerDay: number): string[] {
  const [wakeH] = wakeTime.split(':').map(Number)
  const [bedH] = bedTime.split(':').map(Number)
  const wakeable = bedH > wakeH ? bedH - wakeH : 24 - wakeH + bedH

  if (mealsPerDay === 3) {
    return [
      `${String(wakeH + 1).padStart(2, '0')}:00`,
      `${String(wakeH + Math.floor(wakeable * 0.45)).padStart(2, '0')}:00`,
      `${String(wakeH + Math.floor(wakeable * 0.8)).padStart(2, '0')}:00`,
    ]
  }
  if (mealsPerDay === 4) {
    return [
      `${String(wakeH + 1).padStart(2, '0')}:00`,
      `${String(wakeH + Math.floor(wakeable * 0.35)).padStart(2, '0')}:00`,
      `${String(wakeH + Math.floor(wakeable * 0.6)).padStart(2, '0')}:00`,
      `${String(wakeH + Math.floor(wakeable * 0.82)).padStart(2, '0')}:00`,
    ]
  }
  return [
    `${String(wakeH + 1).padStart(2, '0')}:00`,
    `${String(wakeH + Math.floor(wakeable * 0.25)).padStart(2, '0')}:00`,
    `${String(wakeH + Math.floor(wakeable * 0.45)).padStart(2, '0')}:00`,
    `${String(wakeH + Math.floor(wakeable * 0.65)).padStart(2, '0')}:00`,
    `${String(wakeH + Math.floor(wakeable * 0.85)).padStart(2, '0')}:00`,
  ]
}

export async function POST(req: NextRequest) {
  const { profileId } = await req.json()
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('*').eq('id', profileId).single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekStartDate = format(weekStart, 'yyyy-MM-dd')

  await supabase.from('meals').delete().eq('profile_id', profileId).eq('week_start_date', weekStartDate)

  const mealTypes = profile.meals_per_day <= 3
    ? ['breakfast', 'lunch', 'dinner']
    : profile.meals_per_day === 4
    ? ['breakfast', 'lunch', 'snack', 'dinner']
    : ['breakfast', 'snack', 'lunch', 'snack', 'dinner']

  const times = getMealTimes(profile.wake_time, profile.bed_time, profile.meals_per_day)

  const prompt = `You are a professional nutritionist. Generate a complete 7-day meal plan for this client:

Profile:
- Goal: ${profile.goal}
- Daily Calories: ${profile.daily_calories} kcal
- Protein Target: ${profile.protein_g}g
- Carbs Target: ${profile.carbs_g}g
- Fat Target: ${profile.fat_g}g
- Dietary Preferences: ${profile.dietary_preferences.join(', ') || 'None'}
- Allergies: ${profile.allergies.join(', ') || 'None'}
- Foods to Avoid: ${profile.foods_to_avoid.join(', ') || 'None'}
- Budget: ${profile.budget_level}
- Meals per day: ${profile.meals_per_day}

Return a JSON object:
{
  "days": [
    {
      "day": 0,
      "meals": [
        {
          "meal_type": "breakfast",
          "name": "Meal Name",
          "ingredients": ["ingredient 1"],
          "calories": 400,
          "protein_g": 30,
          "carbs_g": 45,
          "fat_g": 12,
          "alternatives": [
            {"name": "Alt 1", "calories": 380, "protein_g": 28, "carbs_g": 42, "fat_g": 11, "ingredients": []},
            {"name": "Alt 2", "calories": 420, "protein_g": 32, "carbs_g": 48, "fat_g": 13, "ingredients": []},
            {"name": "Alt 3", "calories": 410, "protein_g": 31, "carbs_g": 46, "fat_g": 12, "ingredients": []}
          ]
        }
      ]
    }
  ]
}

Day 0 = Monday through Day 6 = Sunday.
Each day should have ${profile.meals_per_day} meals with types: ${mealTypes.join(', ')}.
Vary meals across the week. Include restaurant options as alternatives (Chipotle, Sweetgreen, etc.).
Ensure daily totals are within 50 calories of ${profile.daily_calories} and protein within 5g of ${profile.protein_g}g.`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })
    parsed = JSON.parse(completion.choices[0].message.content || '{}')
  } catch (err) {
    console.error('OpenAI error:', err)
    return generateFromTemplates(supabase, profile, profileId, weekStartDate, mealTypes, times)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mealsToInsert: any[] = []
  for (const day of parsed.days || []) {
    let timeIdx = 0
    for (const meal of day.meals || []) {
      mealsToInsert.push({
        profile_id: profileId,
        day_of_week: day.day,
        meal_type: meal.meal_type,
        name: meal.name,
        ingredients: meal.ingredients,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        scheduled_time: times[timeIdx] || '12:00',
        alternatives: meal.alternatives || [],
        week_start_date: weekStartDate,
      })
      timeIdx++
    }
  }

  await supabase.from('meals').insert(mealsToInsert)
  await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', profileId)
  await generateGroceryList(supabase, profileId, mealsToInsert, weekStartDate)

  return NextResponse.json({ success: true, mealCount: mealsToInsert.length })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateFromTemplates(supabase: any, profile: any, profileId: string, weekStartDate: string, mealTypes: string[], times: string[]) {
  const { data: templates } = await supabase.from('meal_templates').select('*').in('goal', [profile.goal, 'all'])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mealsToInsert: any[] = []
  for (let day = 0; day < 7; day++) {
    let timeIdx = 0
    for (const mealType of mealTypes) {
      const typeTemplates = (templates || []).filter((t: { meal_type: string }) => t.meal_type === mealType)
      if (typeTemplates.length === 0) continue
      const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)]
      mealsToInsert.push({
        profile_id: profileId, day_of_week: day, meal_type: mealType,
        name: template.name, ingredients: template.ingredients,
        calories: template.calories, protein_g: template.protein_g,
        carbs_g: template.carbs_g, fat_g: template.fat_g,
        scheduled_time: times[timeIdx] || '12:00',
        alternatives: [], week_start_date: weekStartDate,
      })
      timeIdx++
    }
  }

  await supabase.from('meals').insert(mealsToInsert)
  await supabase.from('profiles').update({ onboarding_complete: true }).eq('id', profileId)
  await generateGroceryList(supabase, profileId, mealsToInsert, weekStartDate)
  return NextResponse.json({ success: true, mealCount: mealsToInsert.length })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateGroceryList(supabase: any, profileId: string, meals: any[], weekStartDate: string) {
  const allIngredients: string[] = meals.flatMap((m) => m.ingredients || [])
  const unique = [...new Set(allIngredients)]

  const categorize = (ingredient: string): string => {
    const lower = ingredient.toLowerCase()
    if (/chicken|beef|turkey|salmon|tuna|shrimp|steak|pork|fish|egg/.test(lower)) return 'protein'
    if (/milk|cheese|yogurt|cream|butter/.test(lower)) return 'dairy'
    if (/frozen|ice/.test(lower)) return 'frozen'
    if (/rice|oat|pasta|bread|flour|sugar|oil|sauce|spice|salt|pepper|soy|honey|vinegar/.test(lower)) return 'pantry'
    return 'produce'
  }

  const items = unique.map((ingredient) => ({
    profile_id: profileId, name: ingredient,
    category: categorize(ingredient), checked: false, week_start_date: weekStartDate,
  }))

  await supabase.from('grocery_items').delete().eq('profile_id', profileId).eq('week_start_date', weekStartDate)
  if (items.length > 0) await supabase.from('grocery_items').insert(items)
}
