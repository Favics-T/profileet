'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, AlertCircle, Loader2, Calendar, Package, CreditCard, Video, Phone,
} from 'lucide-react'
import { authHeader } from '@/lib/auth'
import Card from '@/component/ui/Card'
import Badge from '@/component/ui/Badge'
import Avatar from '@/component/ui/Avatar'
import Button from '@/component/ui/Button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

interface Consultation {
  requested: boolean
  status: 'pending' | 'confirmed' | 'done' | 'none'
  date?: string
  time?: string
  note?: string
}

interface Booking {
  id: string
  designerId: string
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
  inspirationRef?: string
  consultation: Consultation
}

interface Artisan {
  id: string
  artisanId: string
  fullName: string
  specialty: string
  avatar: string | null
}

const STATUS_BADGE: Record<BookingStatus, { variant: 'gold' | 'terracotta' | 'success' | 'neutral'; label: string }> = {
  pending: { variant: 'gold', label: 'Pending' },
  accepted: { variant: 'success', label: 'Accepted' },
  in_progress: { variant: 'terracotta', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
}

// a client can only cancel while the artisan hasn't started work yet, matching
// TRANSITION_ROLE in bookings.controller.js ('any' for pending/accepted -> cancelled,
// but 'artisan' only once a booking is in_progress)
const CLIENT_CANCELLABLE_STATUSES: BookingStatus[] = ['pending', 'accepted']

function parsePhotos(inspirationRef?: string): string[] {
  if (!inspirationRef) return []
  try {
    const parsed = JSON.parse(inspirationRef)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function ClientBookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchBooking() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/bookings/${id}`, { headers: { ...authHeader() } })
        if (!res.ok) throw new Error(res.status === 404 ? 'Booking not found' : `Failed to load booking (${res.status})`)
        const data: Booking = await res.json()
        if (cancelled) return
        setBooking(data)

        const artisansRes = await fetch(`${API_URL}/artisans`)
        if (artisansRes.ok) {
          const list: Artisan[] = await artisansRes.json()
          const match = list.find(a => a.artisanId === data.designerId)
          if (!cancelled && match) setArtisan(match)
        }
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

  const cancelBooking = async () => {
    setActionError(null)
    setIsCancelling(true)
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE', headers: { ...authHeader() } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel booking')
      setBooking(data.booking)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setIsCancelling(false)
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
        <Button variant="outline" className="mt-5" onClick={() => router.push('/client/dashboard/bookings')}>
          Back to Bookings
        </Button>
      </div>
    )
  }

  const badge = STATUS_BADGE[booking.status]
  const canCancel = CLIENT_CANCELLABLE_STATUSES.includes(booking.status)
  const photos = parsePhotos(booking.inspirationRef)

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => router.push('/client/dashboard/bookings')}
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

      {actionError && (
        <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-sm text-error">{actionError}</div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card variant="light">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark/40">Service Details</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoChip icon={Package} label="Service" value={booking.service} />
              <InfoChip
                icon={Calendar}
                label="Preferred Date"
                value={new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              />
              {booking.quantity > 1 && <InfoChip icon={Package} label="Quantity" value={String(booking.quantity)} />}
            </div>
          </Card>

          {booking.designNotes && (
            <Card variant="light">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-dark/40">Job Description</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-dark/70">{booking.designNotes}</p>
              {photos.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {photos.map((photo, i) => (
                    <div key={i} className="aspect-square overflow-hidden rounded-xl border border-border-light">
                      <img src={photo} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {booking.consultation?.requested && (
            <Card variant="light">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-dark/40">
                <Video className="h-3.5 w-3.5" /> Consultation
              </p>
              <Badge variant="neutral">{booking.consultation.status}</Badge>
              {booking.consultation.note && (
                <p className="mt-3 text-sm italic text-brand-dark/60">&quot;{booking.consultation.note}&quot;</p>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {artisan && (
            <Card variant="light">
              <div className="flex items-center gap-3">
                <Avatar src={artisan.avatar} name={artisan.fullName || 'Artisan'} size="lg" />
                <div className="min-w-0">
                  <p className="truncate font-bold text-brand-dark">{artisan.fullName || 'Artisan'}</p>
                  <p className="truncate text-xs text-brand-dark/50">{artisan.specialty}</p>
                </div>
              </div>
              <Link href={`/client/dashboard/discover/${artisan.id}`} className="mt-4 block">
                <Button variant="outline" className="w-full">View Profile</Button>
              </Link>
            </Card>
          )}

          {booking.clientPhone && (
            <Card variant="light">
              <a href={`tel:${booking.clientPhone}`} className="flex items-center gap-2 text-sm text-brand-dark/60 hover:text-brand-dark">
                <Phone className="h-3.5 w-3.5" /> {booking.clientPhone}
              </a>
            </Card>
          )}

          <Card variant="light">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-dark/40">
              <CreditCard className="h-3.5 w-3.5" /> Payment Info
            </p>
            {booking.price > 0 ? (
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
            ) : (
              <p className="text-sm text-brand-dark/50">The artisan hasn&apos;t set a price yet. You&apos;ll be notified once they review your request.</p>
            )}
          </Card>

          {canCancel && (
            <Button
              variant="outline"
              loading={isCancelling}
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
