'use client'

import { Button } from '@/components/ui/Button'
import type { OnboardingData } from './OnboardingFlow'
import type { ActivityLevel } from '@/types'

interface Props {
  data: OnboardingData
  onChange: (d: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const LEVELS: { value: ActivityLevel; emoji: string; title: string; desc: string }[] = [
  { value: 'sedentary', emoji: '🪑', title: 'Sedentary', desc: 'Desk job, little or no exercise' },
  { value: 'lightly_active', emoji: '🚶', title: 'Lightly Active', desc: 'Light exercise 1-3 days per week' },
  { value: 'moderately_active', emoji: '🏃', title: 'Moderately Active', desc: 'Moderate exercise 3-5 days per week' },
  { value: 'very_active', emoji: '⚡', title: 'Very Active', desc: 'Hard exercise 6-7 days per week' },
]

export function ActivityStep({ data, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">How active are you?</h1>
        <p className="text-white/50 mt-2">Be honest — this affects how many calories you need.</p>
      </div>

      <div className="space-y-3">
        {LEVELS.map(({ value, emoji, title, desc }) => (
          <button
            key={value}
            onClick={() => onChange({ activity_level: value })}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              data.activity_level === value
                ? 'bg-green-500/15 border-green-500/50 ring-1 ring-green-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/8'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{emoji}</span>
              <div>
                <div className="font-semibold text-white">{title}</div>
                <div className="text-sm text-white/50">{desc}</div>
              </div>
              {data.activity_level === value && (
                <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={onBack} className="flex-1">← Back</Button>
        <Button size="lg" onClick={onNext} className="flex-2">Continue →</Button>
      </div>
    </div>
  )
}
