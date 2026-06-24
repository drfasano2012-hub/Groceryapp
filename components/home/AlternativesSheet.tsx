'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import type { Meal, UserProfile } from '@/types'

interface Alternative {
  name: string
  description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  source: string
}

interface Props {
  meal: Meal
  profile: UserProfile
  onClose: () => void
  onSelect: (alt: Alternative) => void
}

export function AlternativesSheet({ meal, profile, onClose, onSelect }: Props) {
  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/alternatives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: profile.id,
        mealName: meal.name,
        targetCalories: meal.calories,
        targetProtein: meal.protein_g,
        targetCarbs: meal.carbs_g,
        targetFat: meal.fat_g,
        mealType: meal.meal_type,
      }),
    })
      .then((r) => r.json())
      .then((d) => { setAlternatives(d.alternatives || []); setLoading(false) })
  }, [meal, profile.id])

  const builtIn = (meal.alternatives || []).map((a) => ({
    name: a.name, description: '', calories: a.calories,
    protein_g: a.protein_g, carbs_g: a.carbs_g, fat_g: a.fat_g, source: 'home',
  }))

  const all = [...builtIn, ...alternatives].slice(0, 6)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-950 border-t border-white/10 rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Alternatives</h2>
            <p className="text-sm text-white/50">Instead of {meal.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <X size={18} className="text-white" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
            <p className="text-white/40 text-sm">Finding alternatives...</p>
          </div>
        ) : all.length === 0 ? (
          <p className="text-center text-white/40 py-10">No alternatives found</p>
        ) : (
          <div className="space-y-3">
            {all.map((alt, i) => (
              <button
                key={i}
                onClick={() => onSelect(alt)}
                className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{alt.name}</div>
                    {alt.source && alt.source !== 'home' && <div className="text-xs text-green-400 mt-0.5">{alt.source}</div>}
                    {alt.description && <div className="text-xs text-white/40 mt-0.5 line-clamp-1">{alt.description}</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-white">{alt.calories} cal</div>
                    <div className="text-xs text-white/40">{alt.protein_g}g protein</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  {[{ label: 'P', value: alt.protein_g, color: 'text-blue-400' }, { label: 'C', value: alt.carbs_g, color: 'text-amber-400' }, { label: 'F', value: alt.fat_g, color: 'text-red-400' }].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/5 rounded-lg py-1 text-center">
                      <span className={`font-medium ${color}`}>{value}g</span>
                      <span className="text-white/30 ml-1">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-center text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">Tap to log this →</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
