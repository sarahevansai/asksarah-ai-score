'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const LOADING_STEPS = [
  { label: 'Fetching page content...', icon: '🌐', duration: 1500 },
  { label: 'Analyzing structured data...', icon: '🏗️', duration: 1000 },
  { label: 'Checking E-E-A-T signals...', icon: '✅', duration: 1000 },
  { label: 'Scoring AI visibility...', icon: '🤖', duration: 1000 },
  { label: 'Generating recommendations...', icon: '💡', duration: 500 },
]

interface LoadingAnimationProps {
  url: string
}

export default function LoadingAnimation({ url }: LoadingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    let stepIndex = 0
    let totalDelay = 0

    const timers: ReturnType<typeof setTimeout>[] = []

    LOADING_STEPS.forEach((step, i) => {
      const timer = setTimeout(() => {
        setCurrentStep(i)
        if (i > 0) {
          setCompletedSteps((prev) => [...prev, i - 1])
        }
      }, totalDelay)
      timers.push(timer)
      totalDelay += step.duration
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  // Display URL short form
  const displayUrl = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('?')[0]
    .slice(0, 40)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto py-8"
      role="status"
      aria-live="polite"
      aria-label="Analyzing website"
    >
      {/* Main spinner */}
      <div className="flex justify-center mb-8">
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-brand-accent/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-t-brand-accent border-r-brand-accent border-b-transparent border-l-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3 h-3 rounded-full bg-brand-accent"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full blur-md bg-brand-accent/10" />
        </div>
      </div>

      {/* URL being analyzed */}
      <div className="text-center mb-6">
        <p className="text-brand-subtext text-sm mb-1">Analyzing</p>
        <p className="text-brand-text font-mono text-sm truncate px-4" aria-label={`Analyzing ${url}`}>
          {displayUrl}
        </p>
      </div>

      {/* Step progress */}
      <div className="space-y-3 px-4">
        {LOADING_STEPS.map((step, i) => {
          const isCompleted = completedSteps.includes(i)
          const isCurrent = currentStep === i
          const isFuture = i > currentStep

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isFuture ? 0.3 : 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              {/* Step indicator */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-brand-excellent/20 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-brand-excellent" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                ) : isCurrent ? (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-brand-accent"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-brand-muted" />
                )}
              </div>

              {/* Step label */}
              <span
                className={`text-sm transition-colors ${
                  isCurrent
                    ? 'text-brand-accent font-medium'
                    : isCompleted
                    ? 'text-brand-subtext line-through'
                    : 'text-brand-subtext'
                }`}
              >
                {step.icon} {step.label}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6 mx-4">
        <div className="h-1 bg-brand-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-accent to-brand-accent-dim rounded-full"
            initial={{ width: '0%' }}
            animate={{
              width: `${Math.min(95, ((currentStep + 1) / LOADING_STEPS.length) * 100)}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      <p className="text-center text-xs text-brand-subtext mt-4">
        This takes about 3–5 seconds
      </p>
    </motion.div>
  )
}
