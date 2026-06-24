import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai/client'

export async function POST(req: NextRequest) {
  const { description } = await req.json()

  const prompt = `Estimate the nutritional content of this meal: "${description}"

Return JSON only:
{
  "name": "Clean meal name",
  "calories": 500,
  "protein_g": 35,
  "carbs_g": 45,
  "fat_g": 15,
  "confidence": "high"
}

Be specific and accurate. If it's a restaurant meal, use actual menu data.`

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })
    const result = JSON.parse(completion.choices[0].message.content || '{}')
    return NextResponse.json(result)
  } catch (err) {
    console.error('OpenAI error:', err)
    return NextResponse.json(
      { name: description, calories: 400, protein_g: 25, carbs_g: 40, fat_g: 15, confidence: 'low' }
    )
  }
}
