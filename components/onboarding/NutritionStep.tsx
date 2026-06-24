'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { OnboardingData } from './OnboardingFlow'
import type { BudgetLevel } from '@/types'

interface Props {
  data: OnboardingData
  onChange: (d: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const DIET_OPTIONS = ['None','Vegetarian','Vegan','Keto','Paleo','Gluten-Free','Dairy-Free','Mediterranean','Low-Carb','High-Protein']
const ALLERGY_OPTIONS = ['Peanuts','Tree Nuts','Dairy','Eggs','Fish','Shellfish','Wheat/Gluten','Soy','Sesame']
const BUDGET_OPTIONS: { value: BudgetLevel; label: string; desc: string; icon: string }[] = [
  { value: 'budget', label: 'Budget', desc: 'Under $50/week', icon: '💵' },
  { value: 'moderate', label: 'Moderate', desc: '$50–$100/week', icon: '💳' },
  { value: 'premium', label: 'Premium', desc: '$100+/week', icon: '💎' },
]

function TagSelector({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
            selected.includes(opt)
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white/5 border-white/15 text-white/60 hover:bg-white/10'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export function NutritionStep({ data, onChange, onNext, onBack }: Props) {
  const [avoidInput, setAvoidInput] = useState('')

  const toggleDiet = (v: string) => {
    if (v === 'None') { onChange({ dietary_preferences: [] }); return }
    const has = data.dietary_preferences.includes(v)
    onChange({ dietary_preferences: has ? data.dietary_preferences.filter((x) => x !== v) : [...data.dietary_preferences, v] })
  }

  const toggleAllergy = (v: string) => {
    const has = data.allergies.includes(v)
    onChange({ allergies: has ? data.allergies.filter((x) => x !== v) : [...data.allergies, v] })
  }

  const addAvoid = () => {
    const val = avoidInput.trim()
    if (val && !data.foods_to_avoid.includes(val)) {
      onChange({ foods_to_avoid: [...data.foods_to_avoid, val] })
      setAvoidInput('')
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nutrition preferences</h1>
        <p className="text-white/50 mt-2">Help us build a plan that actually works for you.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Dietary Preferences</label>
        <TagSelector options={DIET_OPTIONS} selected={data.dietary_preferences} onToggle={toggleDiet} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Allergies</label>
        <TagSelector options={ALLERGY_OPTIONS} selected={data.allergies} onToggle={toggleAllergy} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Foods to Avoid</label>
        <div className="flex gap-2">
          <Input placeholder="e.g. mushrooms, cilantro..." value={avoidInput} onChange={(e) => setAvoidInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addAvoid()} className="flex-1" />
          <Button variant="secondary" size="md" onClick={addAvoid}>Add</Button>
        </div>
        {data.foods_to_avoid.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.foods_to_avoid.map((f) => (
              <span key={f} className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-300">
                {f}
                <button onClick={() => onChange({ foods_to_avoid: data.foods_to_avoid.filter((x) => x !== f) })} className="ml-1 hover:text-red-100">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/70">Budget</label>
        <div className="grid grid-cols-3 gap-2">
          {BUDGET_OPTIONS.map(({ value, label, desc, icon }) => (
            <button
              key={value}
              onClick={() => onChange({ budget_level: value })}
              className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                data.budget_level === value ? 'bg-green-500/15 border-green-500/50' : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
            >
              <div className="text-xl mb-1">{icon}</div>
              <div className="text-sm font-semibold text-white">{label}</div>
              <div className="text-[10px] text-white/40">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={onBack} className="flex-1">← Back</Button>
        <Button size="lg" onClick={onNext} className="flex-2">Continue →</Button>
      </div>
    </div>
  )
}
