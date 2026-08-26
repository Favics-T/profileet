'use client'

import { Check } from 'lucide-react'

const STEPS = ['Details', 'Job Description', 'Review']

interface StepperProps {
  current: 1 | 2 | 3
}

export default function Stepper({ current }: StepperProps) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {STEPS.map((label, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < current
        const isCurrent = stepNum === current

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isCompleted || isCurrent
                    ? 'bg-brand-dark text-brand-light'
                    : 'border border-border-light bg-white text-brand-dark/40'
                } ${isCurrent ? 'ring-2 ring-accent-gold ring-offset-2 ring-offset-brand-light' : ''}`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span className={`whitespace-nowrap text-xs font-medium ${isCurrent ? 'text-brand-dark' : 'text-brand-dark/40'}`}>
                {label}
              </span>
            </div>
            {stepNum < STEPS.length && (
              <div className={`mx-2 h-0.5 w-10 shrink-0 sm:w-16 ${isCompleted ? 'bg-brand-dark' : 'bg-border-light'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
