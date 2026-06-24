'use client'

import { useEffect, useState, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { BottomNav } from '@/components/ui/BottomNav'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MacroRing } from '@/components/ui/MacroRing'
import { AlternativesSheet } from '@/components/home/AlternativesSheet'
import { LogMealSheet } from '@/components/home/LogMealSheet'
import type { Meal, DailyLog, UserProfile } from '@/types'
import Link from 'next/link'

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [todayMeals, setTodayMeals] = useState<Meal[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [now, setNow] = useState(new Date())
  const [showAlternatives, setShowAlternatives] = useState(false)
  const [showLogSheet, setShowLogSheet] = useState(false)
  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async (profileId: string) => {
    const dayOfWeek = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
    const today = format(new Date(), 'yyyy-MM-dd')

    const [profileRes, mealsRes, logsRes] = await Promise.all([
      fetch(`/api/profile?id=${profileId}`),
      fetch(`/api/meals?profileId=${profileId}&day=${dayOfWeek}`),
      fetch(`/api/logs?profileId=${profileId}&date=${today}`),
    ])

    const [profileData, mealsData, logsData] = await Promise.all([
      profileRes.json(),
      mealsRes.json(),
      logsRes.json(),
    ])

    setProfile(profileData.profile)
    setTodayMeals(mealsData.meals || [])
    setLogs(logsData.logs || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    const profileId = localStorage.getItem('profileId')
    if (!profileId) return
    fetchData(profileId)

    const tick = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(tick)
  }, [fetchData])

  const consumed = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      protein_g: acc.protein_g + l.protein_g,
      carbs_g: acc.carbs_g + l.carbs_g,
      fat_g: acc.fat_g + l.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  const loggedMealIds = new Set(logs.map((l) => l.meal_id).filter(Boolean))

  const nextMeal = todayMeals.find((m) => {
    if (loggedMealIds.has(m.id)) return false
    const [h, min] = m.scheduled_time.split(':').map(Number)
    const mealTime = new Date()
    mealTime.setHours(h, min, 0, 0)
    return mealTime >= now || m.scheduled_time >= format(now, 'HH:mm')
  }) || todayMeals.find((m) => !loggedMealIds.has(m.id))

  const getTimeUntil = (scheduledTime: string) => {
    const [h, min] = scheduledTime.split(':').map(Number)
    const target = new Date()
    target.setHours(h, min, 0, 0)
    const diff = target.getTime() - now.getTime()
    if (diff < 0) return 'Now'
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `in ${mins}m`
    return `in ${Math.floor(mins / 60)}h ${mins % 60}m`
  }

  const handleAteThis = async () => {
    if (!nextMeal || !profile) return
    const profileId = localStorage.getItem('profileId')!
    await fetch('/api/log-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        mealId: nextMeal.id,
        mealName: nextMeal.name,
        mealType: nextMeal.meal_type,
        calories: nextMeal.calories,
        protein_g: nextMeal.protein_g,
        carbs_g: nextMeal.carbs_g,
        fat_g: nextMeal.fat_g,
      }),
    })
    fetchData(profileId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 text-center">
        <div>
          <p className="text-white/60 mb-4">No profile found</p>
          <Link href="/onboarding" className="text-green-400 underline">Start onboarding</Link>
        </div>
      </div>
    )
  }

  const mealsLeft = todayMeals.filter((m) => !loggedMealIds.has(m.id)).length
  const allDone = mealsLeft === 0 && todayMeals.length > 0

  return (
    <div className="min-h-screen bg-[#050505] page-bottom">
      <div className="max-w-md mx-auto px-4 pt-12 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-sm">{format(now, 'EEEE, MMMM d')}</p>
            <h1 className="text-2xl font-bold text-white">{format(now, 'h:mm a')}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Daily target</p>
            <p className="text-white font-bold">{profile.daily_calories} cal</p>
          </div>
        </div>

        {/* Main next meal card */}
        {allDone ? (
          <Card glow className="p-6 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-white mb-1">All meals complete!</h2>
            <p className="text-white/50 text-sm">You&apos;ve hit your targets for today.</p>
          </Card>
        ) : nextMeal ? (
          <Card glow className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">
                  Next Meal · {getTimeUntil(nextMeal.scheduled_time)}
                </p>
                <h2 className="text-2xl font-bold text-white leading-tight">{nextMeal.name}</h2>
                <p className="text-white/40 text-sm capitalize mt-1">{nextMeal.meal_type} · {nextMeal.scheduled_time}</p>
              </div>
            </div>

            {/* Meal macros */}
            <div className="grid grid-cols-4 gap-3 mb-5 p-3 bg-white/5 rounded-2xl">
              {[
                { label: 'Cal', value: nextMeal.calories, unit: '' },
                { label: 'Protein', value: Math.round(nextMeal.protein_g), unit: 'g' },
                { label: 'Carbs', value: Math.round(nextMeal.carbs_g), unit: 'g' },
                { label: 'Fat', value: Math.round(nextMeal.fat_g), unit: 'g' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="text-center">
                  <div className="text-lg font-bold text-white">{value}{unit}</div>
                  <div className="text-[10px] text-white/40">{label}</div>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <Button size="xl" onClick={handleAteThis} className="mb-3">
              ✓ I Ate This
            </Button>

            {/* Secondary CTAs */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => { setCurrentMeal(nextMeal); setShowAlternatives(true) }}
              >
                🔄 Alternative
              </Button>
              <Link href="/coach" className="w-full">
                <Button variant="secondary" size="md" className="w-full">
                  💬 Ask Coach
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-white/60">No meals planned for today.</p>
          </Card>
        )}

        {/* Macro progress */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-white">Today&apos;s Progress</p>
            <span className="text-xs text-white/40">{logs.length}/{todayMeals.length} meals</span>
          </div>
          <div className="flex justify-around">
            <MacroRing
              value={consumed.calories}
              total={profile.daily_calories}
              label="Calories"
              color="#22c55e"
              size={72}
            />
            <MacroRing
              value={Math.round(consumed.protein_g)}
              total={profile.protein_g}
              label="Protein"
              color="#3b82f6"
              size={72}
            />
            <MacroRing
              value={Math.round(consumed.carbs_g)}
              total={profile.carbs_g}
              label="Carbs"
              color="#f59e0b"
              size={72}
            />
            <MacroRing
              value={Math.round(consumed.fat_g)}
              total={profile.fat_g}
              label="Fat"
              color="#ef4444"
              size={72}
            />
          </div>
        </Card>

        {/* Remaining macros insight */}
        {!allDone && (
          <Card className="p-4">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Remaining today</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: '🔥 Calories', value: `${Math.max(0, profile.daily_calories - consumed.calories)} cal` },
                { label: '💪 Protein', value: `${Math.max(0, profile.protein_g - Math.round(consumed.protein_g))}g` },
                { label: '🌾 Carbs', value: `${Math.max(0, profile.carbs_g - Math.round(consumed.carbs_g))}g` },
                { label: '🥑 Fat', value: `${Math.max(0, profile.fat_g - Math.round(consumed.fat_g))}g` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center bg-white/5 rounded-xl px-3 py-2">
                  <span className="text-white/60">{label}</span>
                  <span className="font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick log custom meal */}
        <button
          onClick={() => setShowLogSheet(true)}
          className="w-full py-3 text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          + Log something different
        </button>
      </div>

      <BottomNav />

      {showAlternatives && currentMeal && profile && (
        <AlternativesSheet
          meal={currentMeal}
          profile={profile}
          onClose={() => setShowAlternatives(false)}
          onSelect={async (alt) => {
            const profileId = localStorage.getItem('profileId')!
            await fetch('/api/log-meal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profileId,
                mealId: currentMeal.id,
                mealName: alt.name,
                mealType: currentMeal.meal_type,
                calories: alt.calories,
                protein_g: alt.protein_g,
                carbs_g: alt.carbs_g,
                fat_g: alt.fat_g,
              }),
            })
            setShowAlternatives(false)
            fetchData(profileId)
          }}
        />
      )}

      {showLogSheet && profile && (
        <LogMealSheet
          profile={profile}
          onClose={() => setShowLogSheet(false)}
          onLog={(data) => {
            const profileId = localStorage.getItem('profileId')!
            fetch('/api/log-meal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profileId, ...data }),
            }).then(() => {
              setShowLogSheet(false)
              fetchData(profileId)
            })
          }}
        />
      )}
    </div>
  )
}
