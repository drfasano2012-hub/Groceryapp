import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfWeek, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  const day = req.nextUrl.searchParams.get('day')
  if (!profileId) return NextResponse.json({ error: 'Missing profileId' }, { status: 400 })

  const supabase = await createClient()
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  let query = supabase
    .from('meals')
    .select('*')
    .eq('profile_id', profileId)
    .eq('week_start_date', weekStart)
    .order('scheduled_time', { ascending: true })

  if (day !== null) query = query.eq('day_of_week', parseInt(day))

  const { data: meals, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ meals })
}
