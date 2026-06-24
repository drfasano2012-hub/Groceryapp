'use client'

import { useEffect, useState, useCallback } from 'react'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'
import { BottomNav } from '@/components/ui/BottomNav'
import { Card } from '@/components/ui/Card'
import type { UserProfile, DailyLog } from '@/types'
import { TrendingUp, Award, Flame, Target } from 'lucide-react'

interface DayStats {
  date: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  mealCount: number
  adherence: number
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [weekStats, setWeekStats] = useState<DayStats[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (profileId: string) => {
    const [profileRes, logsRes] = await Promise.all([
      fetch(`/api/profile?id=${profileId}`),
      fetch(`/api/logs?profileId=${profileId}&range=7days`),
    ])
    const [pd, ld] = await Promise.all([profileRes.json(), logsRes.json()])
    setProfile(pd.profile)

    const logs: DailyLog[] = ld.logs || []
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })

    const stats = days.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dayLogs = logs.filter((l) => l.date === dateStr)
      const calories = dayLogs.reduce((a, l) => a + l.calories, 0)
      const protein_g = dayLogs.reduce((a, l) => a + l.protein_g, 0)
      const carbs_g = dayLogs.reduce((a, l) => a + l.carbs_g, 0)
      const fat_g = dayLogs.reduce((a, l) => a + l.fat_g, 0)
      const target = pd.profile?.daily_calories || 2000
      const adherence = target > 0 ? Math.min(100, Math.round((calories / target) * 100)) : 0

      return { date: dateStr, calories, protein_g, carbs_g, fat_g, mealCount: dayLogs.length, adherence }
    })

    setWeekStats(stats)
    setLoading(false)
  }, [])

  useEffect(() => {
    const profileId = localStorage.getItem('profileId')
    if (profileId) fetchData(profileId)
  }, [fetchData])

  const today = weekStats[weekStats.length - 1]
  const weeklyAdherence = weekStats.length > 0
    ? Math.round(weekStats.reduce((a, d) => a + d.adherence, 0) / weekStats.length)
    : 0

  const streak = (() => {
    let s = 0
    for (let i = weekStats.length - 1; i >= 0; i--) {
      if (weekStats[i].mealCount > 0) s++
      else break
    }
    return s
  })()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] page-bottom">
      <div className="max-w-md mx-auto px-4 pt-12 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress</h1>
          <p className="text-white/40 text-sm mt-1">Keep execution simple.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-400" />
              <span className="text-xs text-white/50 font-medium">Today</span>
            </div>
            <div className="text-2xl font-bold text-white">{today?.calories || 0}</div>
            <div className="text-xs text-white/40">/ {profile?.daily_calories || 0} cal</div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, ((today?.calories || 0) / (profile?.daily_calories || 1)) * 100)}%` }}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-xs text-white/50 font-medium">Weekly</span>
            </div>
            <div className="text-2xl font-bold text-white">{weeklyAdherence}%</div>
            <div className="text-xs text-white/40">adherence</div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full"
                style={{ width: `${weeklyAdherence}%` }}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={16} className="text-yellow-400" />
              <span className="text-xs text-white/50 font-medium">Streak</span>
            </div>
            <div className="text-2xl font-bold text-white">{streak}</div>
            <div className="text-xs text-white/40">days logged</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-blue-400" />
              <span className="text-xs text-white/50 font-medium">Protein today</span>
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(today?.protein_g || 0)}g</div>
            <div className="text-xs text-white/40">/ {profile?.protein_g || 0}g</div>
            <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, ((today?.protein_g || 0) / (profile?.protein_g || 1)) * 100)}%` }}
              />
            </div>
          </Card>
        </div>

        {/* 7-day calorie chart */}
        <Card className="p-5">
          <p className="text-sm font-semibold text-white mb-4">7-Day Calories</p>
          <div className="flex items-end justify-between gap-1.5 h-24">
            {weekStats.map((day) => {
              const pct = profile ? Math.min(1, day.calories / profile.daily_calories) : 0
              const isToday = day.date === format(new Date(), 'yyyy-MM-dd')
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative flex items-end justify-center" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isToday ? 'bg-green-500' : 'bg-white/20'}`}
                      style={{ height: `${Math.max(4, pct * 80)}px` }}
                    />
                  </div>
                  <span className="text-[9px] text-white/30">
                    {format(new Date(day.date + 'T12:00:00'), 'EEE')}
                  </span>
                </div>
              )
            })}
          </div>
          {profile && (
            <div className="flex justify-between text-xs text-white/30 mt-2">
              <span>0</span>
              <span className="text-green-400/60">Target: {profile.daily_calories}</span>
            </div>
          )}
        </Card>

        {/* Macro breakdown this week */}
        <Card className="p-5">
          <p className="text-sm font-semibold text-white mb-4">Weekly Macro Average</p>
          {profile && weekStats.length > 0 && (() => {
            const activeDays = weekStats.filter((d) => d.mealCount > 0)
            if (activeDays.length === 0) return <p className="text-white/40 text-sm">No data yet</p>
            const avg = {
              protein: Math.round(activeDays.reduce((a, d) => a + d.protein_g, 0) / activeDays.length),
              carbs: Math.round(activeDays.reduce((a, d) => a + d.carbs_g, 0) / activeDays.length),
              fat: Math.round(activeDays.reduce((a, d) => a + d.fat_g, 0) / activeDays.length),
            }
            return (
              <div className="space-y-3">
                {[
                  { label: 'Protein', avg: avg.protein, target: profile.protein_g, color: 'bg-blue-500' },
                  { label: 'Carbs', avg: avg.carbs, target: profile.carbs_g, color: 'bg-amber-500' },
                  { label: 'Fat', avg: avg.fat, target: profile.fat_g, color: 'bg-red-500' },
                ].map(({ label, avg, target, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-white/60 mb-1">
                      <span>{label}</span>
                      <span className="text-white">{avg}g <span className="text-white/30">/ {target}g</span></span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all`}
                        style={{ width: `${Math.min(100, (avg / target) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </Card>

        {/* Daily macro targets */}
        {profile && (
          <Card className="p-5">
            <p className="text-sm font-semibold text-white mb-3">Your Daily Targets</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: '🔥 Calories', value: `${profile.daily_calories} kcal` },
                { label: '💪 Protein', value: `${profile.protein_g}g` },
                { label: '🌾 Carbs', value: `${profile.carbs_g}g` },
                { label: '🥑 Fat', value: `${profile.fat_g}g` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl px-3 py-2 flex justify-between">
                  <span className="text-white/60">{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/30 mt-3 text-center">
              Goal: {profile.goal.replace('_', ' ')} · {profile.activity_level.replace('_', ' ')}
            </p>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
