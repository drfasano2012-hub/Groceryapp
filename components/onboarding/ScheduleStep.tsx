'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { OnboardingData } from './OnboardingFlow'

interface Props {
  data: OnboardingData
  onChange: (d: Partial<OnboardingData>) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}

export function ScheduleStep({ data, onChange, onSubmit, onBack, submitting }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your daily schedule</h1>
        <p className="text-white/50 mt-2">We&apos;ll time your meals perfectly around your day.</p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Wake Time" type="time" value={data.wake_time} onChange={(e) => onChange({ wake_time: e.target.value })} />
          <Input label="Bed Time" type="time" value={data.bed_time} onChange={(e) => onChange({ bed_time: e.target.value })} />
        </div>

        <div>
          <label className="text-sm font-medium text-white/70 block mb-3">Meals per day</label>
          <div className="grid grid-cols-4 gap-2">
            {[3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => onChange({ meals_per_day: n })}
                className={`py-3 rounded-2xl border font-bold text-lg transition-all ${
                  data.meals_per_day === n
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white/5 border-white/15 text-white/70 hover:bg-white/10'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Input label="Workout Time (optional)" type="time" value={data.workout_time} onChange={(e) => onChange({ workout_time: e.target.value })} />
      </div>

      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
        <p className="text-xs text-green-400 font-semibold mb-2 uppercase tracking-wider">Your schedule</p>
        <div className="space-y-1 text-sm text-white/70">
          <div className="flex justify-between"><span>Wake up</span><span className="text-white font-medium">{data.wake_time}</span></div>
          <div className="flex justify-between"><span>Meals per day</span><span className="text-white font-medium">{data.meals_per_day}</span></div>
          <div className="flex justify-between"><span>Bedtime</span><span className="text-white font-medium">{data.bed_time}</span></div>
          {data.workout_time && <div className="flex justify-between"><span>Workout</span><span className="text-white font-medium">{data.workout_time}</span></div>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={onBack} className="flex-1">← Back</Button>
        <Button size="lg" onClick={onSubmit} loading={submitting} className="flex-2">
          {submitting ? 'Building your plan...' : 'Build My Plan 🚀'}
        </Button>
      </div>
    </div>
  )
}
