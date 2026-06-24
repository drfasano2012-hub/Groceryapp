'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { OnboardingData } from './OnboardingFlow'
import type { Sex } from '@/types'
import { kgFromLbs, heightFromFeetInches } from '@/lib/calculations/macros'

interface Props {
  data: OnboardingData
  onChange: (d: Partial<OnboardingData>) => void
  onNext: () => void
}

export function ProfileStep({ data, onChange, onNext }: Props) {
  const [feet, setFeet] = useState(5)
  const [inches, setInches] = useState(9)
  const [weightLbs, setWeightLbs] = useState(165)
  const [goalLbs, setGoalLbs] = useState(155)

  const handleNext = () => {
    onChange({
      height_cm: heightFromFeetInches(feet, inches),
      weight_kg: kgFromLbs(weightLbs),
      goal_weight_kg: kgFromLbs(goalLbs),
    })
    onNext()
  }

  const sexOptions: { value: Sex; label: string; emoji: string }[] = [
    { value: 'male', label: 'Male', emoji: '♂' },
    { value: 'female', label: 'Female', emoji: '♀' },
    { value: 'other', label: 'Other', emoji: '⚧' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tell us about yourself</h1>
        <p className="text-white/50 mt-2">We use this to calculate your personalized targets.</p>
      </div>

      <div className="space-y-5">
        <Input
          label="Age"
          type="number"
          placeholder="28"
          value={data.age || ''}
          onChange={(e) => onChange({ age: parseInt(e.target.value) || 0 })}
          min={16}
          max={100}
        />

        <div>
          <label className="text-sm font-medium text-white/70 block mb-2">Sex</label>
          <div className="grid grid-cols-3 gap-2">
            {sexOptions.map(({ value, label, emoji }) => (
              <button
                key={value}
                onClick={() => onChange({ sex: value })}
                className={`py-3 rounded-2xl border text-sm font-semibold transition-all ${
                  data.sex === value
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="block text-lg">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white/70 block mb-2">Height</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input type="number" placeholder="5" value={feet} onChange={(e) => setFeet(parseInt(e.target.value) || 0)} min={4} max={7} />
              <span className="text-xs text-white/40 mt-1 block text-center">feet</span>
            </div>
            <div className="flex-1">
              <Input type="number" placeholder="9" value={inches} onChange={(e) => setInches(parseInt(e.target.value) || 0)} min={0} max={11} />
              <span className="text-xs text-white/40 mt-1 block text-center">inches</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Current Weight (lbs)" type="number" placeholder="165" value={weightLbs} onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)} min={80} max={500} />
          <Input label="Goal Weight (lbs)" type="number" placeholder="155" value={goalLbs} onChange={(e) => setGoalLbs(parseFloat(e.target.value) || 0)} min={80} max={500} />
        </div>
      </div>

      <Button size="xl" onClick={handleNext} disabled={!data.age || data.age < 16}>
        Continue →
      </Button>
    </div>
  )
}
