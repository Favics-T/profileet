'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Search, ChevronRight, AlertCircle, CalendarX, ArrowUpDown } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { authHeader } from '@/lib/auth'
import Badge from '@/component/ui/Badge'
import Avatar from '@/component/ui/Avatar'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

interface Booking {
  id: string
  client: string
  service: string
  occasion: string
  deliveryDate: string
  price: number
  depositPaid: boolean
  status: BookingStatus
  receivedAt: string
}

type SortKey = 'newest' | 'oldest' | 'price_high' | 'price_low'

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

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function BookingRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border-light px-5 py-4 last:border-0 animate-pulse">
      <div className="h-10 w-10 shrink-0 rounded-full bg-border-light" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 rounded bg-border-light" />
        <div className="h-3 w-1/4 rounded bg-border-light" />
      </div>
      <div className="hidden h-3 w-20 rounded bg-border-light sm:block" />
      <div className="h-5 w-20 rounded-full bg-border-light" />
    </div>
  )
}

export default function BookingsPage() {
  const { toggle } = useSidebar()
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [page, setPage] = useState(1)
  const limit = 20

  const [bookings, setBookings] = useState<Booking[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchBookings() {
      setIsLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.set('status', statusFilter)
        params.set('page', String(page))
        params.set('limit', String(limit))
        const res = await fetch(`${API_URL}/bookings?${params.toString()}`, { headers: { ...authHeader() } })
        if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`)
        const json: { data: Booking[]; total: number } = await res.json()
        if (cancelled) return
        setBookings(json.data)
        setTotal(json.total)
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
  }, [statusFilter, page])

  const changeTab = (tab: BookingStatus | 'all') => {
    setStatusFilter(tab)
    setPage(1)
  }

  const filtered = bookings.filter(
    b =>
      b.client.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    if (sort === 'oldest') return new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
    if (sort === 'price_high') return b.price - a.price
    return a.price - b.price
  })

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const activeTabLabel = STATUS_TABS.find(t => t.value === statusFilter)?.label.toLowerCase()

  return (
    <>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border-light bg-brand-light px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="rounded-xl p-2 text-brand-dark hover:bg-brand-dark/5 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-brand-dark">Bookings</h1>
            <p className="text-xs text-brand-dark/50">
              {total} total {total === 1 ? 'booking' : 'bookings'}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-55 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by client, service, or booking ID..."
              className="w-full rounded-xl border border-border-light bg-white py-2.5 pl-10 pr-4 text-sm text-brand-dark outline-none transition-colors focus:border-accent-gold"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-dark/40" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-xl border border-border-light bg-white py-2.5 pl-9 pr-8 text-sm text-brand-dark outline-none transition-colors focus:border-accent-gold"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="price_high">Price: high to low</option>
              <option value="price_low">Price: low to high</option>
            </select>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border-light bg-white p-1">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => changeTab(tab.value)}
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
          </div>
        )}

        {!error && (
          <div className="overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <BookingRowSkeleton key={i} />)
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <CalendarX className="h-8 w-8 text-brand-dark/30" />
                <p className="text-sm font-medium text-brand-dark">
                  {statusFilter === 'all' ? 'No bookings yet.' : `No ${activeTabLabel} bookings.`}
                </p>
              </div>
            ) : (
              sorted.map(booking => {
                const badge = STATUS_BADGE[booking.status]
                return (
                  <Link
                    key={booking.id}
                    href={`/dashboard/bookings/${booking.id}`}
                    className="flex items-center gap-4 border-b border-border-light px-5 py-4 transition-colors last:border-0 hover:bg-brand-dark/[0.03]"
                  >
                    <Avatar name={booking.client} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-dark">{booking.client}</p>
                      <p className="truncate text-xs text-brand-dark/50">
                        {booking.service} &middot; {booking.occasion}
                      </p>
                    </div>
                    <div className="hidden shrink-0 text-xs text-brand-dark/50 sm:block">
                      {new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-sm font-semibold text-brand-dark">&#8358;{booking.price.toLocaleString()}</p>
                      <p className={`text-xs ${booking.depositPaid ? 'text-emerald-600' : 'text-accent-terracotta'}`}>
                        {booking.depositPaid ? 'Deposit paid' : 'No deposit'}
                      </p>
                    </div>
                    <span className="hidden shrink-0 text-xs text-brand-dark/40 md:block">{timeAgo(booking.receivedAt)}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-brand-dark/30" />
                  </Link>
                )
              })
            )}
          </div>
        )}

        {!error && !isLoading && total > limit && (
          <div className="flex items-center justify-between text-sm text-brand-dark/60">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-xl border border-border-light bg-white px-3 py-1.5 font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-xl border border-border-light bg-white px-3 py-1.5 font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
