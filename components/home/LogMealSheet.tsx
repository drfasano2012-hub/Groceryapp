'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X, Search } from 'lucide-react'
import type { UserProfile, MealType } from '@/types'

interface LogData {
  mealName: string
  mealType: MealType
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  notes?: string
}

interface Props {
  profile: UserProfile
  onClose: () => void
  onLog: (data: LogData) => void
}

export function LogMealSheet({ onClose, onLog }: Props) {
  const [description, setDescription] = useState('')
  const [estimating, setEstimating] = useState(false)
  const [estimated, setEstimated] = useState<Omit<LogData, 'mealType'> | null>(null)
  const [mealType, setMealType] = useState<MealType>('lunch')

  const estimate = async () => {
    if (!description.trim()) return
    setEstimating(true)
    const res = await fetch('/api/estimate-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    })
    const data = await res.json()
    setEstimated({ mealName: data.name || description, calories: data.calories || 0, protein_g: data.protein_g || 0, carbs_g: data.carbs_g || 0, fat_g: data.fat_g || 0 })
    setEstimating(false)
  }

  const MEAL_TYPES: { value: MealType; label: string }[] = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-950 border-t border-white/10 rounded-t-3xl p-5 pb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Log a Meal</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><X size={18} className="text-white" /></button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            {MEAL_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setMealType(value)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                  mealType === value ? 'bg-green-500 border-green-500 text-white' : 'bg-white/5 border-white/15 text-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="e.g. Chipotle chicken burrito bowl..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); setEstimated(null) }}
              onKeyDown={(e) => e.key === 'Enter' && estimate()}
              className="flex-1"
            />
            <Button variant="secondary" size="md" onClick={estimate} loading={estimating}><Search size={16} /></Button>
          </div>

          {estimated && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{estimated.mealName}</p>
                <p className="text-lg font-bold text-green-400">{estimated.calories} cal</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-blue-500/10 rounded-xl p-2 text-center"><div className="font-bold text-blue-400">{estimated.protein_g}g</div><div className="text-xs text-white/40">Protein</div></div>
                <div className="bg-amber-500/10 rounded-xl p-2 text-center"><div className="font-bold text-amber-400">{estimated.carbs_g}g</div><div className="text-xs text-white/40">Carbs</div></div>
                <div className="bg-red-500/10 rounded-xl p-2 text-center"><div className="font-bold text-red-400">{estimated.fat_g}g</div><div className="text-xs text-white/40">Fat</div></div>
              </div>
              <Button size="lg" onClick={() => onLog({ ...estimated, mealType })} className="w-full">✓ Log This Meal</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
