import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('daily_logs')
    .insert({
      profile_id: body.profileId,
      date: format(new Date(), 'yyyy-MM-dd'),
      meal_id: body.mealId || null,
      meal_name: body.mealName,
      meal_type: body.mealType,
      calories: body.calories,
      protein_g: body.protein_g,
      carbs_g: body.carbs_g,
      fat_g: body.fat_g,
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ log: data })
}

export async function DELETE(req: NextRequest) {
  const { logId } = await req.json()
  const supabase = await createClient()
  await supabase.from('daily_logs').delete().eq('id', logId)
  return NextResponse.json({ success: true })
}
