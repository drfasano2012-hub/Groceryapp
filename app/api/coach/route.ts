import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  const { profileId, message, history } = await req.json()
  const supabase = await createClient()

  const today = format(new Date(), 'yyyy-MM-dd')
  const [{ data: profile }, { data: logs }, { data: todayMeals }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', profileId).single(),
    supabase.from('daily_logs').select('*').eq('profile_id', profileId).eq('date', today),
    supabase.from('meals').select('*').eq('profile_id', profileId).eq('day_of_week', new Date().getDay() === 0 ? 6 : new Date().getDay() - 1),
  ])

  const consumed = (logs || []).reduce(
    (acc: { calories: number; protein_g: number; carbs_g: number; fat_g: number }, l: { calories: number; protein_g: number; carbs_g: number; fat_g: number }) => ({
      calories: acc.calories + l.calories,
      protein_g: acc.protein_g + l.protein_g,
      carbs_g: acc.carbs_g + l.carbs_g,
      fat_g: acc.fat_g + l.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  const remaining = {
    calories: (profile?.daily_calories || 0) - consumed.calories,
    protein_g: (profile?.protein_g || 0) - consumed.protein_g,
    carbs_g: (profile?.carbs_g || 0) - consumed.carbs_g,
    fat_g: (profile?.fat_g || 0) - consumed.fat_g,
  }

  const systemPrompt = `You are an expert AI nutrition coach named Alex. You are direct, practical, and give specific actionable recommendations — never generic advice.

User Profile:
- Goal: ${profile?.goal}
- Daily Targets: ${profile?.daily_calories} cal | ${profile?.protein_g}g protein | ${profile?.carbs_g}g carbs | ${profile?.fat_g}g fat
- Dietary Preferences: ${profile?.dietary_preferences?.join(', ') || 'None'}
- Allergies: ${profile?.allergies?.join(', ') || 'None'}
- Budget: ${profile?.budget_level}

Today's Progress (${today}):
- Consumed: ${consumed.calories} cal | ${consumed.protein_g}g protein | ${consumed.carbs_g}g carbs | ${consumed.fat_g}g fat
- Remaining: ${remaining.calories} cal | ${remaining.protein_g}g protein | ${remaining.carbs_g}g carbs | ${remaining.fat_g}g fat
- Meals completed: ${logs?.length || 0}

Today's planned meals:
${(todayMeals || []).map((m: { meal_type: string; name: string; calories: number; protein_g: number }) => `- ${m.meal_type}: ${m.name} (${m.calories} cal, ${m.protein_g}g protein)`).join('\n')}

Rules:
1. Always give specific food names, not generic categories
2. When asked about restaurants, give exact menu items with macros
3. Keep responses concise — bullet points preferred
4. Never say "it depends" without a direct recommendation`

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...(history || []).slice(-10).map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: message },
  ]

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })
    const reply = completion.choices[0].message.content || 'I had trouble responding. Please try again.'
    await supabase.from('coach_messages').insert([
      { profile_id: profileId, role: 'user', content: message },
      { profile_id: profileId, role: 'assistant', content: reply },
    ])
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json({ reply: "I'm having trouble connecting right now. Please try again in a moment." })
  }
}
