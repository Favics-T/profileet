'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { authHeader } from '@/lib/auth'
import Card from '@/component/ui/Card'
import Avatar from '@/component/ui/Avatar'
import Stepper from './Stepper'
import StepDetails from './StepDetails'
import StepDescription from './StepDescription'
import StepReview from './StepReview'
import { EMPTY_BOOKING_FORM, type ArtisanLite, type BookingFormState } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface ClientProfile {
  firstName: string
  lastName: string
  phone: string
}

export default function BookingRequestPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [artisan, setArtisan] = useState<ArtisanLite | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<BookingFormState>(EMPTY_BOOKING_FORM)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchArtisan() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = await fetch(`${API_URL}/artisans/${id}`)
        if (!res.ok) throw new Error(res.status === 404 ? 'Artisan not found' : `Failed to load artisan (${res.status})`)
        const data: ArtisanLite = await res.json()
        if (cancelled) return
        setArtisan(data)
        setForm(f => ({ ...f, serviceType: f.serviceType || data.styles[0] || data.specialty || '' }))
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load artisan')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchArtisan()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    fetch(`${API_URL}/client/profile`, { headers: { ...authHeader() } })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) return
        setClientProfile({ firstName: data.firstName ?? '', lastName: data.lastName ?? '', phone: data.phone ?? '' })
        setForm(f => (f.phone ? f : { ...f, phone: data.phone ?? '' }))
      })
      .catch(() => {})
  }, [])

  const update = (patch: Partial<BookingFormState>) => setForm(f => ({ ...f, ...patch }))

  const submit = async () => {
    if (!artisan) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const clientName = clientProfile ? `${clientProfile.firstName} ${clientProfile.lastName}`.trim() : ''

      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          artisanId: artisan.artisanId,
          client: clientName || 'Client',
          clientPhone: form.phone,
          service: form.serviceType,
          occasion: form.serviceType,
          deliveryDate: form.preferredDate,
          quantity: form.quantity,
          urgent: form.urgent,
          designNotes: form.description,
          inspirationRef: form.photos.length > 0 ? JSON.stringify(form.photos) : '',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit request')
      router.push(`/client/dashboard/bookings/${data.id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit request')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-brand-dark/50">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>
    )
  }

  if (loadError || !artisan) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-error" />
        <p className="mt-3 text-sm text-error">{loadError || 'Artisan not found'}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/client/dashboard/discover/${artisan.id}`}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-brand-dark/50 hover:text-brand-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Back to profile
      </Link>

      <Stepper current={step} />

      <Card variant="light" className="mb-5 flex items-center gap-3 !p-4">
        <Avatar src={artisan.avatar} name={artisan.fullName || 'Artisan'} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-brand-dark">{artisan.fullName || 'Unnamed artisan'}</p>
          <p className="truncate text-xs text-brand-dark/60">
            {artisan.specialty || 'Artisan'} &middot; {artisan.location}
          </p>
        </div>
      </Card>

      <Card variant="light">
        {step === 1 && <StepDetails artisan={artisan} form={form} onChange={update} onNext={() => setStep(2)} />}
        {step === 2 && (
          <StepDescription form={form} onChange={update} onBack={() => setStep(1)} onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <StepReview
            form={form}
            onBack={() => setStep(2)}
            onEditDetails={() => setStep(1)}
            onEditDescription={() => setStep(2)}
            onSubmit={submit}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        )}
      </Card>
    </div>
  )
}
