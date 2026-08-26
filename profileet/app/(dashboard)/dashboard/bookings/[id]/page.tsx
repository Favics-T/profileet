'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MessageSquare, AlertCircle, Loader2, Calendar, Package,
  CreditCard, Video, Ruler, Palette, Link as LinkIcon, Phone,
} from 'lucide-react'
import { authHeader } from '@/lib/auth'
import Card from '@/component/ui/Card'
import Badge from '@/component/ui/Badge'
import Avatar from '@/component/ui/Avatar'
import Button from '@/component/ui/Button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

interface Measurement {
  chest?: string; waist?: string; hips?: string; shoulder?: string
  sleeveLength?: string; dressLength?: string; height?: string; weight?: string
}

interface Consultation {
  requested: boolean
  status: 'pending' | 'confirmed' | 'done' | 'none'
  date?: string; time?: string; note?: string
}

interface Booking {
  id: string
  client: string
  clientPhone?: string
  service: string
  occasion: string
  deliveryDate: string
  quantity: number
  urgent: boolean
  status: BookingStatus
  receivedAt: string
  price: number
  depositPaid: boolean
  depositAmount: number
  designNotes: string
  fabrics: string[]
  colors: string[]
  inspirationRef?: string
  measurements: Measurement
  consultation: Consultation
}

const STATUS_BADGE: Record<BookingStatus, { variant: 'gold' | 'terracotta' | 'success' | 'neutral'; label: string }> = {
  pending: { variant: 'gold', label: 'Pending' },
  accepted: { variant: 'success', label: 'Accepted' },
  in_progress: { variant: 'terracotta', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
}


const NEXT_ACTION: Partial<Record<BookingStatus, { label: string; next: BookingStatus }>> = {
  pending: { label: 'Accept Booking', next: 'accepted' },
  accepted: { label: 'Start Work', next: 'in_progress' },
  in_progress: { label: 'Mark as Completed', next: 'completed' },
}

const CANCELLABLE_STATUSES: BookingStatus[] = ['pending', 'accepted', 'in_progress']

const MEASUREMENT_FIELDS: { key: keyof Measurement; label: string; unit: string }[] = [
  { key: 'chest', label: 'Chest / Bust', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'hips', label: 'Hips', unit: 'cm' },
  { key: 'shoulder', label: 'Shoulder Width', unit: 'cm' },
  { key: 'sleeveLength', label: 'Sleeve Length', unit: 'cm' },
  { key: 'dressLength', label: 'Length', unit: 'cm' },
  { key: 'height', label: 'Height', unit: 'cm' },
  { key: 'weight', label: 'Weight', unit: 'kg' },
]

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchBooking() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/bookings/${id}`, { headers: { ...authHeader() } })
        if (!res.ok) throw new Error(res.status === 404 ? 'Booking not found' : `Failed to load booking (${res.status})`)
        const data: Booking = await res.json()
        if (!cancelled) setBooking(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load booking')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchBooking()
    return () => {
      cancelled = true
    }
  }, [id])

  const changeStatus = async (status: BookingStatus) => {
    setActionError(null)
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update booking')
      setBooking(data)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update booking')
    } finally {
      setIsSaving(false)
    }
  }

  const cancelBooking = async () => {
    setActionError(null)
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader() },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking')
      setBooking(data.booking)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-brand-dark/50">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading booking...</p>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-error" />
        <p className="mt-3 text-sm text-error">{error || 'Booking not found'}</p>
        <Button variant="outline" className="mt-5" onClick={() => router.push('/dashboard/bookings')}>
          Back to Bookings
        </Button>
      </div>
    )
  }

  const badge = STATUS_BADGE[booking.status]
  const nextAction = NEXT_ACTION[booking.status]
  const canCancel = CANCELLABLE_STATUSES.includes(booking.status)
  const hasFabricsOrColors = booking.fabrics.length > 0 || booking.colors.length > 0
  const hasMeasurements = Object.values(booking.measurements ?? {}).some(v => v)

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/bookings')}
            className="rounded-xl p-2 text-brand-dark/60 hover:bg-brand-dark/5 hover:text-brand-dark"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-brand-dark">Booking Details</h1>
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {booking.urgent && <Badge variant="terracotta">Urgent</Badge>}
            </div>
            <p className="text-xs text-brand-dark/50">{booking.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/messages">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4" /> Message Client
            </Button>
          </Link>
          {nextAction && (
            <Button variant="primary" loading={isSaving} onClick={() => changeStatus(nextAction.next)}>
              {nextAction.label}
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">{actionError}</div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          <Card variant="light">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark/40">Project Summary</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoChip icon={Package} label="Service" value={booking.service} />
              <InfoChip icon={Calendar} label="Occasion" value={booking.occasion} />
              <InfoChip
                icon={Calendar}
                label="Delivery Date"
                value={new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              />
            </div>
            {booking.designNotes && (
              <p className="mt-4 text-sm leading-relaxed text-brand-dark/70">{booking.designNotes}</p>
            )}
          </Card>

          {hasFabricsOrColors && (
            <Card variant="light">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark/40">Fabrics &amp; Colors</p>
              <div className="space-y-3">
                {booking.fabrics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {booking.fabrics.map(f => (
                      <Badge key={f} variant="neutral">{f}</Badge>
                    ))}
                  </div>
                )}
                {booking.colors.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {booking.colors.map(c => (
                      <div key={c} className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full border border-border-light" style={{ background: c }} />
                        <span className="font-mono text-xs text-brand-dark/50">{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {hasMeasurements && (
            <Card variant="light">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-dark/40">
                <Ruler className="h-3.5 w-3.5" /> Measurements
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {MEASUREMENT_FIELDS.filter(({ key }) => booking.measurements[key]).map(({ key, label, unit }) => (
                  <div key={key} className="rounded-xl bg-brand-light px-3 py-2.5">
                    <p className="text-xs text-brand-dark/50">{label}</p>
                    <p className="text-sm font-bold text-brand-dark">
                      {booking.measurements[key]} <span className="text-xs font-normal text-brand-dark/40">{unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {booking.inspirationRef && (
            <Card variant="light">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark/40">Reference</p>
              <a
                href={booking.inspirationRef}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent-terracotta hover:underline"
              >
                <LinkIcon className="h-4 w-4" /> View reference
              </a>
            </Card>
          )}

          {booking.consultation?.requested && (
            <Card variant="light">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-dark/40">
                <Video className="h-3.5 w-3.5" /> Consultation
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <InfoChip icon={Calendar} label="Date" value={booking.consultation.date || '—'} />
                <InfoChip icon={Video} label="Time" value={booking.consultation.time || '—'} />
                <InfoChip icon={Package} label="Status" value={booking.consultation.status} />
              </div>
              {booking.consultation.note && (
                <p className="mt-3 text-sm italic text-brand-dark/60">&quot;{booking.consultation.note}&quot;</p>
              )}
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card variant="light">
            <div className="flex items-center gap-3">
              <Avatar name={booking.client} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-bold text-brand-dark">{booking.client}</p>
                {booking.clientPhone && (
                  <a href={`tel:${booking.clientPhone}`} className="flex items-center gap-1 text-xs text-brand-dark/50 hover:text-brand-dark">
                    <Phone className="h-3 w-3" /> {booking.clientPhone}
                  </a>
                )}
              </div>
            </div>
            <Link href="/dashboard/messages" className="mt-4 block">
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4" /> Message Client
              </Button>
            </Link>
          </Card>

          <Card variant="light">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-dark/40">
              <CreditCard className="h-3.5 w-3.5" /> Payment Info
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-dark/50">Total Price</span>
                <span className="font-semibold text-brand-dark">&#8358;{booking.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-dark/50">Deposit</span>
                <span className="font-semibold text-brand-dark">&#8358;{booking.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border-light pt-2">
                <span className="text-brand-dark/50">Deposit Status</span>
                <Badge variant={booking.depositPaid ? 'success' : 'terracotta'}>
                  {booking.depositPaid ? 'Paid' : 'Unpaid'}
                </Badge>
              </div>
            </div>
          </Card>

          {canCancel && (
            <Button
              variant="outline"
              loading={isSaving}
              onClick={cancelBooking}
              className="w-full border-error/40 text-error hover:bg-error/10"
            >
              Cancel Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoChip({ icon: Icon, label, value }: { icon: React.FC<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-brand-light px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1">
        <Icon className="h-3 w-3 text-brand-dark/40" />
        <span className="text-xs text-brand-dark/40">{label}</span>
      </div>
      <p className="text-xs font-bold text-brand-dark">{value}</p>
    </div>
  )
}
