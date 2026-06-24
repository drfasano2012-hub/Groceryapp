'use client'

import { Button } from '@/components/ui/Button'
import type { OnboardingData } from './OnboardingFlow'
import type { Goal } from '@/types'

interface Props {
  data: OnboardingData
  onChange: (d: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const GOALS: { value: Goal; emoji: string; title: string; desc: string }[] = [
  { value: 'lose_fat', emoji: '🔥', title: 'Lose Fat', desc: 'Reduce body fat while preserving muscle with a calorie deficit' },
  { value: 'build_muscle', emoji: '💪', title: 'Build Muscle', desc: 'Maximize muscle growth with a calorie surplus and high protein' },
  { value: 'maintain', emoji: '⚖️', title: 'Maintain Weight', desc: 'Stay at your current weight while optimizing your nutrition' },
]

export function GoalStep({ data, onChange, onNext, onBack }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">What&apos;s your goal?</h1>
        <p className="text-white/50 mt-2">This determines your calorie targets and macro ratios.</p>
      </div>

      <div className="space-y-3">
        {GOALS.map(({ value, emoji, title, desc }) => (
          <button
            key={value}
            onClick={() => onChange({ goal: value })}
            className={`w-full text-left p-5 rounded-2xl border transition-all ${
              data.goal === value
                ? 'bg-green-500/15 border-green-500/50 ring-1 ring-green-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/8'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{emoji}</span>
              <div>
                <div className="font-semibold text-white">{title}</div>
                <div className="text-sm text-white/50 mt-0.5">{desc}</div>
              </div>
              {data.goal === value && (
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
