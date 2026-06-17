'use client'

import { useState } from 'react'
import {
  Calendar, Clock, CheckCircle, XCircle, ChevronDown,
  Ruler, Palette, Video, User, Search, SlidersHorizontal,
  MessageSquare, ArrowLeft, Package, Bell, Star,
  Check, X, Eye, Sparkles, MapPin, AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

/* ─────────────────────────────────────
   TYPES
───────────────────────────────────── */
type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

interface Measurement {
  chest?: string; waist?: string; hips?: string; shoulder?: string
  sleeveLength?: string; dressLength?: string; height?: string; weight?: string
}

interface Consultation {
  requested: boolean
  date?: string; time?: string; note?: string
  status: 'pending' | 'confirmed' | 'done' | 'none'
}

interface BookingRequest {
  id: string
  client: string
  initials: string
  clientColor: string
  service: string
  occasion: string
  deliveryDate: string
  quantity: number
  urgent: boolean
  status: BookingStatus
  receivedAt: string
  price: number
  designNotes: string
  fabrics: string[]
  colors: string[]
  inspirationRef?: string
  measurements: Measurement
  consultation: Consultation
}

/* ─────────────────────────────────────
   MOCK DATA
───────────────────────────────────── */
const MOCK_BOOKINGS: BookingRequest[] = [
  {
    id: 'BK-2401',
    client: 'Amara Obiechina',
    initials: 'AO',
    clientColor: '#be185d',
    service: 'Bridal Gown',
    occasion: 'Wedding',
    deliveryDate: '2026-08-15',
    quantity: 1,
    urgent: false,
    status: 'pending',
    receivedAt: '2026-06-17T08:30:00',
    price: 120000,
    designNotes: 'A floor-length A-line bridal gown with off-shoulder neckline, floral lace overlay on the bodice, cinched waist with a satin bow at the back, and a cathedral train. I want it pure ivory white.',
    fabrics: ['Lace', 'Silk'],
    colors: ['#f5f5f0'],
    inspirationRef: 'https://pinterest.com/pin/example',
    measurements: { chest: '88', waist: '70', hips: '96', shoulder: '38', dressLength: '180', height: '168', weight: '62' },
    consultation: { requested: true, date: '2026-06-20', time: '11:00 AM', note: 'Want to discuss the lace pattern and train length in detail.', status: 'pending' },
  },
  {
    id: 'BK-2402',
    client: 'Tunde Balogun',
    initials: 'TB',
    clientColor: '#0ea5e9',
    service: 'Agbada Set',
    occasion: 'Traditional Ceremony',
    deliveryDate: '2026-07-20',
    quantity: 1,
    urgent: true,
    status: 'accepted',
    receivedAt: '2026-06-16T14:00:00',
    price: 85000,
    designNotes: 'Full 3-piece Agbada set — inner sokoto, inner buba, and outer agbada. Deep royal blue with gold embroidery on collar and cuffs. Wide sleeves. No cap needed.',
    fabrics: ['Aso-oke'],
    colors: ['#1e3a8a', '#d97706'],
    measurements: { chest: '102', waist: '88', hips: '105', shoulder: '46', height: '175', weight: '85' },
    consultation: { requested: false, status: 'none' },
  },
  {
    id: 'BK-2403',
    client: 'Funke Adeyemi',
    initials: 'FA',
    clientColor: '#7c3aed',
    service: 'Corporate Blazer Set',
    occasion: 'Corporate Event',
    deliveryDate: '2026-07-05',
    quantity: 2,
    urgent: false,
    status: 'in_progress',
    receivedAt: '2026-06-14T09:00:00',
    price: 55000,
    designNotes: 'Two matching blazer sets — one wine and one charcoal. Both slim-fit with 2 front buttons. Straight-cut trousers. Would love a subtle pinstripe on the charcoal one.',
    fabrics: ['Cotton'],
    colors: ['#7f1d1d', '#374151'],
    measurements: { chest: '94', waist: '76', hips: '98', shoulder: '40', sleeveLength: '60', dressLength: '100', height: '162', weight: '68' },
    consultation: { requested: true, date: '2026-06-15', time: '10:00 AM', note: '', status: 'done' },
  },
  {
    id: 'BK-2404',
    client: 'Chidinma Eze',
    initials: 'CE',
    clientColor: '#16a34a',
    service: 'Evening Gown',
    occasion: 'Birthday',
    deliveryDate: '2026-06-28',
    quantity: 1,
    urgent: true,
    status: 'completed',
    receivedAt: '2026-06-10T11:00:00',
    price: 75000,
    designNotes: 'Elegant floor-length evening gown in emerald green. Mermaid silhouette, open back, embellished neckline. Side slit at the left leg.',
    fabrics: ['Chiffon', 'Velvet'],
    colors: ['#065f46'],
    measurements: { chest: '84', waist: '66', hips: '92', dressLength: '175', height: '170', weight: '58' },
    consultation: { requested: false, status: 'none' },
  },
  {
    id: 'BK-2405',
    client: 'Emeka Nwosu',
    initials: 'EN',
    clientColor: '#d97706',
    service: 'Ankara Shirt (×3)',
    occasion: 'Everyday Wear',
    deliveryDate: '2026-07-10',
    quantity: 3,
    urgent: false,
    status: 'cancelled',
    receivedAt: '2026-06-12T16:00:00',
    price: 36000,
    designNotes: '3 casual Ankara shirts in different prints. Short sleeves, relaxed fit. No specific color preference — designer can pick vibrant prints.',
    fabrics: ['Ankara'],
    colors: [],
    measurements: { chest: '98', waist: '84', shoulder: '44', sleeveLength: '30', height: '180', weight: '80' },
    consultation: { requested: false, status: 'none' },
  },
]

/* ─────────────────────────────────────
   CONFIG
───────────────────────────────────── */
type IconFC = React.FC<{ className?: string; style?: React.CSSProperties }>

const STATUS_CFG: Record<BookingStatus, { label: string; bg: string; color: string; icon: IconFC }> = {
  pending:     { label: 'Pending',     bg: '#fffbeb', color: '#d97706', icon: Clock },
  accepted:    { label: 'Accepted',    bg: '#f0fdf4', color: '#16a34a', icon: CheckCircle },
  in_progress: { label: 'In Progress', bg: '#eff6ff', color: '#2563eb', icon: Package },
  completed:   { label: 'Completed',   bg: '#f5f3ff', color: '#7c3aed', icon: Star },
  cancelled:   { label: 'Cancelled',   bg: '#fef2f2', color: '#dc2626', icon: XCircle },
}

const TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Pending',     value: 'pending' },
  { label: 'Accepted',    value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
  { label: 'Cancelled',   value: 'cancelled' },
]

/* ─────────────────────────────────────
   MAIN PAGE
───────────────────────────────────── */
export default function DesignerBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingRequest[]>(MOCK_BOOKINGS)
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<BookingRequest | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'accept' | 'cancel' | 'complete' } | null>(null)
  const [consultStatus, setConsultStatus] = useState<Record<string, 'pending' | 'confirmed' | 'done' | 'none'>>({})

  /* ── Derived ── */
  const filtered = bookings.filter(b => {
    const matchTab = activeTab === 'all' || b.status === activeTab
    const matchSearch =
      b.client.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {} as Record<BookingStatus, number>)

  const pendingCount = counts['pending'] ?? 0

  /* ── Actions ── */
  const applyAction = (id: string, action: 'accept' | 'cancel' | 'complete') => {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b
      const next: BookingStatus = action === 'accept' ? 'accepted' : action === 'cancel' ? 'cancelled' : 'completed'
      return { ...b, status: next }
    }))
    if (selected?.id === id) {
      setSelected(prev => prev ? {
        ...prev,
        status: action === 'accept' ? 'accepted' : action === 'cancel' ? 'cancelled' : 'completed'
      } : null)
    }
    setConfirmAction(null)
  }

  const confirmConsult = (id: string) => {
    setBookings(prev => prev.map(b =>
      b.id === id ? { ...b, consultation: { ...b.consultation, status: 'confirmed' } } : b
    ))
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, consultation: { ...prev.consultation, status: 'confirmed' } } : null)
    }
  }

  /* ── Detail panel ── */
  if (selected) {
    return (
      <DetailPanel
        booking={selected}
        onBack={() => setSelected(null)}
        onAccept={() => applyAction(selected.id, 'accept')}
        onCancel={() => applyAction(selected.id, 'cancel')}
        onComplete={() => applyAction(selected.id, 'complete')}
        onConfirmConsult={() => confirmConsult(selected.id)}
      />
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#faf8f5' }}>

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-gray-200">/</span>
          <h1 className="text-base font-bold text-gray-800">My Bookings</h1>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Bell className="w-3.5 h-3.5" />
            {pendingCount} new request{pendingCount > 1 ? 's' : ''}
          </span>
        )}
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(STATUS_CFG) as BookingStatus[]).map(status => {
            const { label, bg, color, icon: Icon } = STATUS_CFG[status]
            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-md transition-all"
                style={activeTab === status ? { borderColor: color, boxShadow: `0 0 0 2px ${color}22` } : {}}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{counts[status] ?? 0}</p>
              </button>
            )
          })}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client name, service, or booking ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none bg-white transition-all"
            onFocus={e => { e.target.style.borderColor = '#FF6500'; e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)' }}
            onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {TABS.map(tab => (
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

        {/* ── Booking list ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium">No bookings found</p>
            <p className="text-xs mt-1">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(booking => {
              const { label, bg, color, icon: Icon } = STATUS_CFG[booking.status]
              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelected(booking)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: booking.clientColor }}
                    >
                      {booking.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{booking.client}</p>
                          <p className="text-xs text-gray-500">{booking.service}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {booking.urgent && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fff7ed', color: '#c2410c' }}>
                              ⚡ Urgent
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
                            <Icon className="w-3 h-3" />
                            {label}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Delivery: {new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span>{booking.occasion}</span>
                        <span className="font-semibold text-gray-700">₦{booking.price.toLocaleString()}</span>
                        {booking.consultation.requested && (
                          <span className="flex items-center gap-1 font-medium" style={{ color: '#FF6500' }}>
                            <Video className="w-3 h-3" /> Consultation
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-mono">{booking.id}</span>
                        <div className="flex items-center gap-2">
                          {/* Quick actions on pending */}
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); setConfirmAction({ id: booking.id, action: 'cancel' }) }}
                                className="text-xs font-medium px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all"
                              >
                                Decline
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setConfirmAction({ id: booking.id, action: 'accept' }) }}
                                className="text-xs font-semibold px-3 py-1 rounded-lg text-white transition-all hover:opacity-90"
                                style={{ background: '#FF6500' }}
                              >
                                Accept
                              </button>
                            </>
                          )}
                          {booking.status === 'accepted' && (
                            <button
                              onClick={e => { e.stopPropagation(); applyAction(booking.id, 'complete') }}
                              className="text-xs font-semibold px-3 py-1 rounded-lg text-white transition-all hover:opacity-90"
                              style={{ background: '#7c3aed' }}
                            >
                              Mark Complete
                            </button>
                          )}
                          <button className="flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-gray-700 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
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

      {/* ── Confirm modal ── */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              {confirmAction.action === 'accept' ? 'Accept Booking?' : 'Decline Booking?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {confirmAction.action === 'accept'
                ? "The client will be notified that you've accepted their request. You can start work!"
                : 'This will notify the client that you are unable to fulfil this booking.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => applyAction(confirmAction.id, confirmAction.action)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: confirmAction.action === 'accept' ? '#FF6500' : '#dc2626' }}
              >
                {confirmAction.action === 'accept' ? 'Yes, Accept' : 'Yes, Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────
   DETAIL PANEL
───────────────────────────────────── */
function DetailPanel({
  booking, onBack, onAccept, onCancel, onComplete, onConfirmConsult
}: {
  booking: BookingRequest
  onBack: () => void
  onAccept: () => void
  onCancel: () => void
  onComplete: () => void
  onConfirmConsult: () => void
}) {
  const [activeSection, setActiveSection] = useState<'design' | 'measurements' | 'consultation'>('design')
  const { label, bg, color, icon: Icon } = STATUS_CFG[booking.status]

  const measurementFields: { key: keyof typeof booking.measurements; label: string }[] = [
    { key: 'chest', label: 'Chest / Bust' },
    { key: 'waist', label: 'Waist' },
    { key: 'hips', label: 'Hips' },
    { key: 'shoulder', label: 'Shoulder Width' },
    { key: 'sleeveLength', label: 'Sleeve Length' },
    { key: 'dressLength', label: 'Dress / Outfit Length' },
    { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight' },
  ]

  const hasMeasurements = Object.values(booking.measurements).some(v => v)

  return (
    <div className="min-h-screen" style={{ background: '#faf8f5' }}>

      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </button>
        <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: bg, color }}>
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Client header card ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold text-white shrink-0"
              style={{ background: booking.clientColor }}
            >
              {booking.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-gray-800">{booking.client}</p>
                  <p className="text-sm text-gray-500">{booking.service} · {booking.occasion}</p>
                </div>
                {booking.urgent && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full shrink-0" style={{ background: '#fff7ed', color: '#c2410c' }}>
                    ⚡ Urgent
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <InfoChip icon={Calendar} label="Delivery" value={new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} />
                <InfoChip icon={Package} label="Quantity" value={`${booking.quantity} piece${booking.quantity > 1 ? 's' : ''}`} />
                <InfoChip icon={User} label="Booking ID" value={booking.id} mono />
                <InfoChip icon={Star} label="Amount" value={`₦${booking.price.toLocaleString()}`} accent />
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons for pending ── */}
        {booking.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-700">New Booking Request</p>
              <p className="text-xs text-amber-600">Review the details below and accept or decline.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onCancel}
                className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-500 transition-all"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                style={{ background: '#FF6500' }}
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {booking.status === 'accepted' && (
          <div className="flex justify-end">
            <button
              onClick={onComplete}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: '#7c3aed' }}
            >
              <CheckCircle className="w-4 h-4" /> Mark as Completed
            </button>
          </div>
        )}

        {/* ── Section tabs ── */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {([
            { key: 'design', label: 'Design Brief', icon: Palette },
            { key: 'measurements', label: 'Measurements', icon: Ruler },
            { key: 'consultation', label: 'Consultation', icon: Video },
          ] as { key: typeof activeSection; label: string; icon: React.FC<{className?:string, style?:any}> }[]).map(tab => {
            const TabIcon = tab.icon
            const isActive = activeSection === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                style={
                  isActive
                    ? { background: '#fff', color: '#FF6500', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                    : { background: 'transparent', color: '#9ca3af' }
                }
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── DESIGN BRIEF ── */}
        {activeSection === 'design' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Design Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{booking.designNotes || 'No description provided.'}</p>
            </div>

            {booking.fabrics.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Preferred Fabric(s)</p>
                <div className="flex flex-wrap gap-2">
                  {booking.fabrics.map(f => (
                    <span key={f} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {booking.colors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Preferred Color(s)</p>
                <div className="flex gap-2">
                  {booking.colors.map(c => (
                    <div key={c} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full border-2 border-white shadow-md" style={{ background: c }} />
                      <span className="text-xs text-gray-500 font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {booking.inspirationRef && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Inspiration Reference</p>
                <a
                  href={booking.inspirationRef}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline break-all"
                  style={{ color: '#FF6500' }}
                >
                  {booking.inspirationRef}
                </a>
              </div>
            )}

            <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-600">
                You can send the client a message to request more reference images or clarifications.
              </p>
            </div>

            <button
              onClick={() => {}}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
            >
              <MessageSquare className="w-4 h-4" /> Message {booking.client.split(' ')[0]}
            </button>
          </div>
        )}

        {/* ── MEASUREMENTS ── */}
        {activeSection === 'measurements' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Body Measurements</p>
              <p className="text-xs text-gray-400">All measurements provided by the client (in cm / kg)</p>
            </div>

            {hasMeasurements ? (
              <div className="grid grid-cols-2 gap-3">
                {measurementFields.map(({ key, label }) => {
                  const val = booking.measurements[key]
                  if (!val) return null
                  return (
                    <div key={key} className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-gray-800">
                        {val} <span className="text-xs font-normal text-gray-400">{key === 'weight' ? 'kg' : 'cm'}</span>
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Ruler className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No measurements provided</p>
                <p className="text-xs mt-1">Message the client to request their measurements</p>
                <button
                  className="mt-4 flex items-center gap-2 mx-auto text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                  style={{ background: '#FF6500' }}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Request Measurements
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CONSULTATION ── */}
        {activeSection === 'consultation' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
            {booking.consultation.requested ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Consultation Requested</p>
                    <p className="text-xs text-gray-400 mt-0.5">Client wants a video/chat call before work starts</p>
                  </div>
                  {/* Consultation status badge */}
                  {(() => {
                    const s = booking.consultation.status
                    const cfg = {
                      pending:   { label: 'Awaiting Confirmation', bg: '#fffbeb', color: '#d97706' },
                      confirmed: { label: 'Confirmed',             bg: '#f0fdf4', color: '#16a34a' },
                      done:      { label: 'Done',                  bg: '#eff6ff', color: '#2563eb' },
                      none:      { label: 'N/A',                   bg: '#f3f4f6', color: '#9ca3af' },
                    }[s]
                    return (
                      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    )
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">Date</p>
                    <p className="text-sm font-bold text-gray-800">
                      {booking.consultation.date
                        ? new Date(booking.consultation.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-0.5">Time</p>
                    <p className="text-sm font-bold text-gray-800">{booking.consultation.time || '—'}</p>
                  </div>
                </div>

                {booking.consultation.note && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Client Notes</p>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"{booking.consultation.note}"</p>
                  </div>
                )}

                {booking.consultation.status === 'pending' && (
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={onCancel}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Decline Call
                    </button>
                    <button
                      onClick={onConfirmConsult}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg,#FF6500,#ff8c3a)' }}
                    >
                      <Video className="w-4 h-4" /> Confirm Call
                    </button>
                  </div>
                )}

                {booking.consultation.status === 'confirmed' && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-sm text-green-700 font-medium">
                      Consultation confirmed — join the call at the scheduled time.
                    </p>
                  </div>
                )}

                {booking.consultation.status === 'done' && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                    <p className="text-sm text-blue-700 font-medium">
                      Consultation completed.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Video className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No consultation requested</p>
                <p className="text-xs mt-1">The client chose to skip the consultation</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

/* ── Small helpers ── */
function InfoChip({
  icon: Icon, label, value, mono = false, accent = false
}: { icon: React.FC<{className?:string}>; label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p
        className={`text-xs font-bold ${mono ? 'font-mono' : ''} ${accent ? '' : 'text-gray-800'}`}
        style={accent ? { color: '#FF6500' } : {}}
      >
        {value}
      </p>
    </div>
  )
}
