'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CalendarX } from 'lucide-react'
import { authHeader } from '@/lib/auth'
import Card from '@/component/ui/Card'
import Badge from '@/component/ui/Badge'
import Avatar from '@/component/ui/Avatar'
import Button from '@/component/ui/Button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

interface Booking {
  id: string
  designerId: string
  service: string
  occasion: string
  deliveryDate: string
  price: number
  depositPaid: boolean
  depositAmount: number
  status: BookingStatus
  receivedAt: string
}

interface ArtisanLookup {
  artisanId: string
  fullName: string
  avatar: string | null
}

const STATUS_TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const STATUS_BADGE: Record<BookingStatus, { variant: 'gold' | 'terracotta' | 'success' | 'neutral'; label: string }> = {
  pending: { variant: 'gold', label: 'Pending' },
  accepted: { variant: 'success', label: 'Accepted' },
  in_progress: { variant: 'terracotta', label: 'In Progress' },
  completed: { variant: 'success', label: 'Completed' },
  cancelled: { variant: 'neutral', label: 'Cancelled' },
}

const ACTIONABLE_STATUSES: BookingStatus[] = ['pending', 'accepted', 'in_progress']

function BookingCardSkeleton() {
  return (
    <Card variant="light" className="animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-border-light" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-1/3 rounded bg-border-light" />
          <div className="h-3 w-1/2 rounded bg-border-light" />
        </div>
        <div className="h-5 w-16 rounded-full bg-border-light" />
      </div>
      <div className="mt-4 h-3 w-1/4 rounded bg-border-light" />
    </Card>
  )
}

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [artisans, setArtisans] = useState<Record<string, ArtisanLookup>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    fetch(`${API_URL}/artisans`)
      .then(res => (res.ok ? res.json() : []))
      .then((data: ArtisanLookup[]) => {
        const map: Record<string, ArtisanLookup> = {}
        data.forEach(a => {
          map[a.artisanId] = a
        })
        setArtisans(map)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchBookings() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.set('status', statusFilter)
        const res = await fetch(`${API_URL}/bookings?${params.toString()}`, { headers: { ...authHeader() } })
        if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`)
        const json: { data: Booking[] } = await res.json()
        if (!cancelled) setBookings(json.data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load bookings')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchBookings()
    return () => {
      cancelled = true
    }
  }, [statusFilter, requestId])

  const activeTabLabel = STATUS_TABS.find(t => t.value === statusFilter)?.label.toLowerCase()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-dark">My Bookings</h1>
          <p className="mt-0.5 text-sm text-brand-dark/50">Track all your service requests and appointments</p>
        </div>
        <Link href="/client/dashboard/discover">
          <Button variant="primary">Book a Service</Button>
        </Link>
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-border-light bg-white p-1">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`min-w-fit flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              statusFilter === tab.value ? 'bg-brand-dark text-brand-light' : 'text-brand-dark/50 hover:text-brand-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-error/30 bg-error/10 px-6 py-10 text-center">
          <AlertCircle className="h-6 w-6 text-error" />
          <p className="text-sm text-error">{error}</p>
          <Button variant="outline" onClick={() => setRequestId(n => n + 1)}>
            Retry
          </Button>
        </div>
      )}

      {!error && isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookingCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!error && !isLoading && bookings.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-light bg-white px-6 py-16 text-center">
          <CalendarX className="h-8 w-8 text-brand-dark/30" />
          <p className="text-sm font-medium text-brand-dark">
            {statusFilter === 'all' ? "You haven't booked a service yet." : `No ${activeTabLabel} bookings.`}
          </p>
          {statusFilter === 'all' && (
            <Link href="/client/dashboard/discover">
              <Button variant="ghost">Browse artisans &rarr;</Button>
            </Link>
          )}
        </div>
      )}

      {!error && !isLoading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map(booking => {
            const badge = STATUS_BADGE[booking.status]
            const artisan = artisans[booking.designerId]
            const isActionable = ACTIONABLE_STATUSES.includes(booking.status)

            return (
              <Card key={booking.id} variant="light">
                <div className="flex items-start gap-3">
                  <Avatar src={artisan?.avatar ?? null} name={artisan?.fullName || 'Artisan'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-brand-dark">{artisan?.fullName || 'Artisan'}</p>
                    <p className="truncate text-xs text-brand-dark/60">
                      {booking.service} &middot; {booking.occasion}
                    </p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border-light pt-3">
                  <div className="text-xs text-brand-dark/50">
                    <span>
                      {new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="mx-1.5">&middot;</span>
                    {booking.price > 0 ? (
                      <>
                        <span className="font-semibold text-brand-dark">&#8358;{booking.price.toLocaleString()}</span>
                        <span className={`ml-1.5 ${booking.depositPaid ? 'text-emerald-600' : 'text-accent-terracotta'}`}>
                          {booking.depositPaid ? 'Deposit paid' : 'No deposit'}
                        </span>
                      </>
                    ) : (
                      <span>Pricing pending</span>
                    )}
                  </div>

                  <Link href={`/client/dashboard/bookings/${booking.id}`}>
                    <Button variant={isActionable ? 'primary' : 'outline'}>View Details</Button>
                  </Link>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
