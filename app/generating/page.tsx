'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = [
  'Calculating your calorie targets...',
  'Building your 7-day meal plan...',
  'Finding alternatives for every meal...',
  'Creating your grocery list...',
  'Setting up your nutrition coach...',
  'Almost ready...',
]

export default function GeneratingPage() {
  const router = useRouter()
  const [stepIdx, setStepIdx] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const profileId = localStorage.getItem('profileId')
    if (!profileId) {
      router.replace('/onboarding')
      return
    }

    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < STEPS.length) setStepIdx(i)
    }, 1800)

    fetch('/api/generate-meal-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId }),
    }).then(() => {
      clearInterval(interval)
      setStepIdx(STEPS.length - 1)
      setDone(true)
      setTimeout(() => router.replace('/home'), 1200)
    })

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center p-8 text-white">
      <div className="max-w-sm w-full text-center space-y-10">
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <span className="text-4xl">🥗</span>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-3">Building Your Plan</h1>
          <p className="text-white/50 text-sm">Your personal nutrition autopilot is being configured.</p>
        </div>

        <div className="space-y-3">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 text-sm transition-all duration-500 ${
                i < stepIdx ? 'text-green-400' : i === stepIdx ? 'text-white' : 'text-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  i < stepIdx ? 'bg-green-500' : i === stepIdx ? 'border-2 border-green-500 animate-pulse' : 'border border-white/20'
                }`}
              >
                {i < stepIdx && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {done && <div className="text-green-400 font-semibold animate-fadeIn">✓ Your plan is ready!</div>}
      </div>
    </div>
  )
}
