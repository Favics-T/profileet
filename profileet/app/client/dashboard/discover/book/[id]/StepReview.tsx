'use client'

import { AlertCircle, Info } from 'lucide-react'
import Badge from '@/component/ui/Badge'
import Button from '@/component/ui/Button'
import type { BookingFormState } from './types'

interface StepReviewProps {
  form: BookingFormState
  onBack: () => void
  onEditDetails: () => void
  onEditDescription: () => void
  onSubmit: () => void
  isSubmitting: boolean
  error: string | null
}

export default function StepReview({
  form,
  onBack,
  onEditDetails,
  onEditDescription,
  onSubmit,
  isSubmitting,
  error,
}: StepReviewProps) {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand-dark">Review Your Request</h1>
      <p className="mt-1 text-sm text-brand-dark/60">Step 3 of 3 &mdash; Make sure everything looks right before submitting.</p>

      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-border-light p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-dark/40">Service Details</p>
            <button onClick={onEditDetails} className="text-xs font-semibold text-accent-terracotta hover:underline">
              Edit
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-brand-dark/50">Service Type</span>
              <span className="text-right font-medium text-brand-dark">{form.serviceType || '—'}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-brand-dark/50">Preferred Date</span>
              <span className="text-right font-medium text-brand-dark">
                {form.preferredDate
                  ? new Date(form.preferredDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </span>
            </div>
            {form.quantity > 1 && (
              <div className="flex justify-between gap-3">
                <span className="text-brand-dark/50">Quantity / Units</span>
                <span className="text-right font-medium text-brand-dark">{form.quantity}</span>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <span className="text-brand-dark/50">Phone Number</span>
              <span className="text-right font-medium text-brand-dark">{form.phone || '—'}</span>
            </div>
            {form.urgent && (
              <div className="flex justify-end pt-1">
                <Badge variant="terracotta">Urgent</Badge>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border-light p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-dark/40">Job Description</p>
            <button onClick={onEditDescription} className="text-xs font-semibold text-accent-terracotta hover:underline">
              Edit
            </button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-dark/70">
            {form.description || 'No description provided.'}
          </p>
          {form.photos.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {form.photos.map((photo, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl border border-border-light">
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
          {form.wantsConsultation && (
            <div className="mt-3">
              <Badge variant="neutral">Consultation call requested</Badge>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-brand-light px-4 py-3 text-xs text-brand-dark/60">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-dark/40" />
          Artisan will set pricing after reviewing your request and attachments.
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button variant="primary" loading={isSubmitting} onClick={onSubmit}>
          Submit Request &rarr;
        </Button>
      </div>
    </div>
  )
}
