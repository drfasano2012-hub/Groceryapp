import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId')
  const date = req.nextUrl.searchParams.get('date')
  const range = req.nextUrl.searchParams.get('range')
  if (!profileId) return NextResponse.json({ error: 'Missing profileId' }, { status: 400 })

  const supabase = await createClient()

  if (range === '7days') {
    const since = format(subDays(new Date(), 7), 'yyyy-MM-dd')
    const { data: logs } = await supabase
      .from('daily_logs').select('*').eq('profile_id', profileId).gte('date', since).order('logged_at', { ascending: false })
    return NextResponse.json({ logs })
  }

  const targetDate = date || format(new Date(), 'yyyy-MM-dd')
  const { data: logs, error } = await supabase
    .from('daily_logs').select('*').eq('profile_id', profileId).eq('date', targetDate).order('logged_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs })
}
