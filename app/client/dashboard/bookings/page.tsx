'use client'

import { useState } from 'react'
import { CalendarCheck, Clock, CheckCircle, XCircle, ChevronRight, Search } from 'lucide-react'

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

type Booking = {
  id: string
  designer: string
  initials: string
  color: string
  service: string
  date: string
  time: string
  price: number
  status: BookingStatus
  note: string
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK-001',
    designer: 'Adaeze Nwosu',
    initials: 'AN',
    color: '#FF6500',
    service: 'Bridal Gown',
    date: '2026-06-28',
    time: '10:00 AM',
    price: 95000,
    status: 'confirmed',
    note: 'Full bridal package with 2 fittings',
  },
  {
    id: 'BK-002',
    designer: 'Emeka Fashola',
    initials: 'EF',
    color: '#1a1a2e',
    service: 'Casual Wear (3 pieces)',
    date: '2026-07-05',
    time: '2:00 PM',
    price: 42000,
    status: 'pending',
    note: 'Reference images sent via message',
  },
  {
    id: 'BK-003',
    designer: 'Ngozi Eze',
    initials: 'NE',
    color: '#be185d',
    service: 'Evening Dress',
    date: '2026-05-15',
    time: '11:00 AM',
    price: 68000,
    status: 'completed',
    note: 'Delivered and approved',
  },
  {
    id: 'BK-004',
    designer: 'Fatima Aliyu',
    initials: 'FA',
    color: '#7c3aed',
    service: 'Kaftan Set',
    date: '2026-05-02',
    time: '9:00 AM',
    price: 35000,
    status: 'cancelled',
    note: 'Cancelled — schedule conflict',
  },
]

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; color: string; icon: React.FC<{ className?: string }> }> = {
  pending:   { label: 'Pending',   bg: '#fffbeb', color: '#d97706', icon: Clock },
  confirmed: { label: 'Confirmed', bg: '#f0fdf4', color: '#16a34a', icon: CheckCircle },
  completed: { label: 'Completed', bg: '#eff6ff', color: '#2563eb', icon: CalendarCheck },
  cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#dc2626', icon: XCircle },
}

const TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_BOOKINGS.filter((b) => {
    const matchTab = activeTab === 'all' || b.status === activeTab
    const matchSearch =
      b.designer.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const counts = MOCK_BOOKINGS.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {} as Record<BookingStatus, number>)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">My Bookings</h2>
        <p className="text-sm text-gray-500">Track all your booking requests and appointments</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 lg:grid-cols-4  sm:grid-cols-4 gap-3 mb-6">
        {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map((status) => {
          const { label, bg, color, icon: Icon } = STATUS_CONFIG[status]
          return (
            <div
              key={status}
              className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setActiveTab(status)}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4"  />
                <span className="text-xs font-medium text-gray-500">{label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{counts[status] ?? 0}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none bg-white transition-all"
          onFocus={e => {
            e.target.style.borderColor = '#FF6500'
            e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)'
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e5e7eb'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className="flex-1 min-w-fit px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
            style={
              activeTab === tab.value
                ? { background: '#fff', color: '#1a1a2e', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { background: 'transparent', color: '#9ca3af' }
            }
          >
            {tab.label}
            {tab.value !== 'all' && counts[tab.value as BookingStatus]
              ? ` (${counts[tab.value as BookingStatus]})`
              : ''}
          </button>
        ))}
      </div>

      {/* Booking list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarCheck className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No bookings found</p>
          <p className="text-xs mt-1">Try a different filter or search term</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => {
            const { label, bg, color, icon: Icon } = STATUS_CONFIG[booking.status]
            return (
              <div
                key={booking.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: booking.color }}
                  >
                    {booking.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{booking.designer}</p>
                        <p className="text-xs text-gray-500">{booking.service}</p>
                      </div>
                      {/* Status badge */}
                      <span
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: bg, color }}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </span>
                    </div>

                    {/* Date + time */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2 mb-2">
                      <span>{new Date(booking.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>·</span>
                      <span>{booking.time}</span>
                      <span>·</span>
                      <span className="font-semibold text-gray-700">₦{booking.price.toLocaleString()}</span>
                    </div>

                    {/* Note */}
                    <p className="text-xs text-gray-400 italic">{booking.note}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400 font-mono">{booking.id}</span>
                      <div className="ml-auto flex items-center gap-2">
                        {booking.status === 'pending' && (
                          <button className="text-xs font-medium text-red-400 hover:text-red-600">
                            Cancel
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <button
                            className="text-xs font-medium"
                            style={{ color: '#FF6500' }}
                          >
                            Leave a review
                          </button>
                        )}
                        <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                          View details <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}