'use client'

import { Minus, Plus } from 'lucide-react'
import Input from '@/component/ui/Input'
import Button from '@/component/ui/Button'
import AvailabilityCalendar from './AvailabilityCalendar'
import type { ArtisanLite, BookingFormState } from './types'

interface StepDetailsProps {
  artisan: ArtisanLite
  form: BookingFormState
  onChange: (patch: Partial<BookingFormState>) => void
  onNext: () => void
}

export default function StepDetails({ artisan, form, onChange, onNext }: StepDetailsProps) {
  const serviceOptions = artisan.styles.length > 0 ? artisan.styles : [artisan.specialty].filter(Boolean)
  const canContinue = Boolean(form.serviceType && form.preferredDate && form.phone)

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-dark">Request Service</h1>
      <p className="mt-1 text-sm text-brand-dark/60">Step 1 of 3 &mdash; Tell us what you need and when.</p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-dark">Service Type</label>
          <select
            value={form.serviceType}
            onChange={e => onChange({ serviceType: e.target.value })}
            className="w-full rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm text-brand-dark outline-none transition-colors focus:border-accent-gold"
          >
            <option value="" disabled>Select a service</option>
            {serviceOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <AvailabilityCalendar
          artisanId={artisan.artisanId}
          value={form.preferredDate}
          onChange={date => onChange({ preferredDate: date })}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-dark">
            Quantity / Units <span className="font-normal text-brand-dark/40">(optional)</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange({ quantity: Math.max(1, form.quantity - 1) })}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light text-brand-dark transition-colors hover:border-accent-gold"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-brand-dark">{form.quantity}</span>
            <button
              type="button"
              onClick={() => onChange({ quantity: form.quantity + 1 })}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-light text-brand-dark transition-colors hover:border-accent-gold"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Input
          label="Phone Number"
          type="tel"
          placeholder="e.g. 08012345678"
          value={form.phone}
          onChange={e => onChange({ phone: e.target.value })}
        />

        <div className="flex items-start justify-between gap-4 rounded-xl border border-border-light bg-brand-light/50 px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-brand-dark">Urgent Request</p>
            <p className="mt-0.5 text-xs text-brand-dark/50">Marking this urgent may incur an additional rush fee.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.urgent}
            onClick={() => onChange({ urgent: !form.urgent })}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.urgent ? 'bg-accent-gold' : 'bg-border-light'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.urgent ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="primary" disabled={!canContinue} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}
