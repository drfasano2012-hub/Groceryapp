'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileStep } from './ProfileStep'
import { GoalStep } from './GoalStep'
import { ActivityStep } from './ActivityStep'
import { NutritionStep } from './NutritionStep'
import { ScheduleStep } from './ScheduleStep'
import { calculateMacros } from '@/lib/calculations/macros'
import type { Goal, ActivityLevel, Sex, BudgetLevel } from '@/types'

export interface OnboardingData {
  age: number
  sex: Sex
  height_cm: number
  weight_kg: number
  goal_weight_kg: number
  goal: Goal
  activity_level: ActivityLevel
  dietary_preferences: string[]
  allergies: string[]
  foods_to_avoid: string[]
  budget_level: BudgetLevel
  wake_time: string
  bed_time: string
  meals_per_day: number
  workout_time: string
}

const STEPS = ['Profile', 'Goal', 'Activity', 'Nutrition', 'Schedule']

const EMPTY: OnboardingData = {
  age: 0,
  sex: 'male',
  height_cm: 175,
  weight_kg: 75,
  goal_weight_kg: 70,
  goal: 'lose_fat',
  activity_level: 'moderately_active',
  dietary_preferences: [],
  allergies: [],
  foods_to_avoid: [],
  budget_level: 'moderate',
  wake_time: '07:00',
  bed_time: '22:00',
  meals_per_day: 4,
  workout_time: '',
}

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const update = (partial: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...partial }))

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    setSubmitting(true)
    const macros = calculateMacros(data)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ...macros }),
    })

    if (res.ok) {
      const { profileId } = await res.json()
      localStorage.setItem('profileId', profileId)
      router.push('/generating')
    } else {
      setSubmitting(false)
      alert('Something went wrong. Please try again.')
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-md mx-auto px-5 pt-12 pb-10">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-semibold text-green-400 tracking-widest uppercase">
              Step {step + 1} of {STEPS.length}
            </div>
            <div className="text-xs text-white/40">{STEPS[step]}</div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1">
            <div
              className="bg-green-400 h-1 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="animate-fadeIn">
          {step === 0 && <ProfileStep data={data} onChange={update} onNext={next} />}
          {step === 1 && <GoalStep data={data} onChange={update} onNext={next} onBack={back} />}
          {step === 2 && <ActivityStep data={data} onChange={update} onNext={next} onBack={back} />}
          {step === 3 && <NutritionStep data={data} onChange={update} onNext={next} onBack={back} />}
          {step === 4 && (
            <ScheduleStep
              data={data}
              onChange={update}
              onSubmit={submit}
              onBack={back}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}
