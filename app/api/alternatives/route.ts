import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { profileId, mealName, targetCalories, targetProtein, targetCarbs, targetFat, mealType } = await req.json()

  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', profileId).single()

  const prompt = `You are a nutrition coach. A user needs alternatives to "${mealName}".
Their targets for this meal:
- Calories: ~${targetCalories} kcal
- Protein: ~${targetProtein}g
- Carbs: ~${targetCarbs}g
- Fat: ~${targetFat}g
- Meal type: ${mealType}
- Dietary preferences: ${profile?.dietary_preferences?.join(', ') || 'None'}
- Allergies: ${profile?.allergies?.join(', ') || 'None'}
- Budget: ${profile?.budget_level || 'moderate'}

Generate 5 meal alternatives. Include both home-cooked meals and popular restaurant options (Chipotle, Sweetgreen, Whole Foods, etc.).

Return JSON:
{
  "alternatives": [
    {
      "name": "Meal Name",
      "description": "Brief description",
      "calories": 400,
      "protein_g": 35,
      "carbs_g": 40,
      "fat_g": 12,
      "source": "home" or "restaurant name",
      "ingredients": ["item 1", "item 2"]
    }
  ]
}`

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    })
    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return NextResponse.json(result)
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json({ alternatives: [] }, { status: 500 })
  }
}
