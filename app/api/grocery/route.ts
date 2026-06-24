import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfWeek, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  if (!profileId) return NextResponse.json({ error: 'Missing profileId' }, { status: 400 })

  const supabase = await createClient()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  const { data: items, error } = await supabase
    .from('grocery_items')
    .select('*')
    .eq('profile_id', profileId)
    .eq('week_start_date', weekStart)
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items })
}

export async function PATCH(req: NextRequest) {
  const { id, checked } = await req.json()
  const supabase = await createClient()
  await supabase.from('grocery_items').update({ checked }).eq('id', id)
  return NextResponse.json({ success: true })
}
