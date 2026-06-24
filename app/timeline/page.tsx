'use client'

import { useEffect, useState, useCallback } from 'react'
import { format } from 'date-fns'
import { BottomNav } from '@/components/ui/BottomNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlternativesSheet } from '@/components/home/AlternativesSheet'
import type { Meal, DailyLog, UserProfile } from '@/types'
import { Check, RefreshCw, Clock, ChevronRight } from 'lucide-react'

const MEAL_ICONS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🥨',
}

export default function TimelinePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [meals, setMeals] = useState<Meal[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [showAlt, setShowAlt] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(true)

  const today = format(new Date(), 'yyyy-MM-dd')
  const dayOfWeek = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const fetchData = useCallback(async (profileId: string) => {
    const [profileRes, mealsRes, logsRes] = await Promise.all([
      fetch(`/api/profile?id=${profileId}`),
      fetch(`/api/meals?profileId=${profileId}&day=${dayOfWeek}`),
      fetch(`/api/logs?profileId=${profileId}&date=${today}`),
    ])
    const [pd, md, ld] = await Promise.all([profileRes.json(), mealsRes.json(), logsRes.json()])
    setProfile(pd.profile)
    setMeals(md.meals || [])
    setLogs(ld.logs || [])
    setLoading(false)
  }, [dayOfWeek, today])

  useEffect(() => {
    const profileId = localStorage.getItem('profileId')
    if (profileId) fetchData(profileId)
  }, [fetchData])

  const loggedMealIds = new Set(logs.map((l) => l.meal_id).filter(Boolean))

  const logMeal = async (meal: Meal) => {
    const profileId = localStorage.getItem('profileId')!
    await fetch('/api/log-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId,
        mealId: meal.id,
        mealName: meal.name,
        mealType: meal.meal_type,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
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

  return (
    <div className="min-h-screen bg-[#050505] page-bottom">
      <div className="max-w-md mx-auto px-4 pt-12 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Today&apos;s Timeline</h1>
          <p className="text-white/40 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>

        {/* Daily summary */}
        {profile && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Cal', consumed: logs.reduce((a, l) => a + l.calories, 0), target: profile.daily_calories, color: 'text-green-400' },
              { label: 'Pro', consumed: Math.round(logs.reduce((a, l) => a + l.protein_g, 0)), target: profile.protein_g, color: 'text-blue-400' },
              { label: 'Carb', consumed: Math.round(logs.reduce((a, l) => a + l.carbs_g, 0)), target: profile.carbs_g, color: 'text-amber-400' },
              { label: 'Fat', consumed: Math.round(logs.reduce((a, l) => a + l.fat_g, 0)), target: profile.fat_g, color: 'text-red-400' },
            ].map(({ label, consumed, target, color }) => (
              <div key={label} className="bg-white/5 rounded-2xl p-3 text-center">
                <div className={`text-base font-bold ${color}`}>{consumed}</div>
                <div className="text-[10px] text-white/30">/{target}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          {meals.map((meal, i) => {
            const isLogged = loggedMealIds.has(meal.id)
            const now = format(new Date(), 'HH:mm')
            const isPast = meal.scheduled_time < now
            const isNext = !isLogged && meals.filter(m => !loggedMealIds.has(m.id))[0]?.id === meal.id

            return (
              <div key={meal.id} className="relative">
                {/* Timeline connector */}
                {i < meals.length - 1 && (
                  <div className="absolute left-7 top-14 w-0.5 h-6 bg-white/10 z-0" />
                )}

                <Card className={`p-4 transition-all ${isNext ? 'ring-1 ring-green-500/40' : ''} ${isLogged ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${
                      isLogged
                        ? 'bg-green-500'
                        : isNext
                        ? 'bg-green-500/20 ring-2 ring-green-500/50'
                        : 'bg-white/10'
                    }`}>
                      {isLogged ? <Check size={16} className="text-white" /> : MEAL_ICONS[meal.meal_type]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-white/40">
                          <Clock size={11} />
                          <span>{meal.scheduled_time}</span>
                        </div>
                        {isNext && (
                          <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                            NEXT
                          </span>
                        )}
                        {isLogged && (
                          <span className="text-[10px] text-green-400">✓ Done</span>
                        )}
                      </div>
                      <div className="font-semibold text-white mt-0.5 truncate">{meal.name}</div>
                      <div className="text-xs text-white/40 mt-0.5 capitalize">{meal.meal_type} · {meal.calories} cal · {meal.protein_g}g P</div>
                    </div>

                    {!isLogged && (
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => { setSelectedMeal(meal); setShowAlt(true) }}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                          title="Alternatives"
                        >
                          <RefreshCw size={14} className="text-white/60" />
                        </button>
                        <button
                          onClick={() => logMeal(meal)}
                          className="p-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 transition"
                          title="Mark as eaten"
                        >
                          <Check size={14} className="text-green-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expandable ingredients */}
                  {meal.ingredients?.length > 0 && !isLogged && (
                    <details className="mt-3">
                      <summary className="text-xs text-white/40 flex items-center gap-1 cursor-pointer list-none">
                        <ChevronRight size={12} className="transition-transform details-open:rotate-90" />
                        Ingredients
                      </summary>
                      <ul className="mt-2 space-y-0.5">
                        {meal.ingredients.map((ing, j) => (
                          <li key={j} className="text-xs text-white/50 pl-3">• {ing}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </Card>
              </div>
            )
          })}
        </div>

        {meals.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/40">No meals planned for today.</p>
          </div>
        )}
      </div>

      <BottomNav />

      {showAlt && selectedMeal && profile && (
        <AlternativesSheet
          meal={selectedMeal}
          profile={profile}
          onClose={() => setShowAlt(false)}
          onSelect={async (alt) => {
            const profileId = localStorage.getItem('profileId')!
            await fetch('/api/log-meal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profileId,
                mealId: selectedMeal.id,
                mealName: alt.name,
                mealType: selectedMeal.meal_type,
                calories: alt.calories,
                protein_g: alt.protein_g,
                carbs_g: alt.carbs_g,
                fat_g: alt.fat_g,
              }),
            })
            setShowAlt(false)
            fetchData(profileId)
          }}
        />
      )}
    </div>
  )
}
