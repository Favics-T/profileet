'use client'

import { useState } from 'react'
import {
  Calendar, Clock, CheckCircle, XCircle,
  Ruler, Palette, Video, User, Search,
  MessageSquare, ArrowLeft, Package, Bell, Star,
  Eye, Sparkles, AlertCircle, Menu, Printer,
  PhoneCall, CreditCard, ChevronRight, Plus, Trash2, Loader2,
} from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import {  BookingStatus, BookingRequest } from '@/type/booking'
import { useBooking, NewBookingPayload } from '@/context/BookingContext'

type IconFC = React.FC<{ className?: string; style?: React.CSSProperties }>

const STATUS_CFG: Record<BookingStatus, { label: string; bg: string; color: string; icon: IconFC }> = {
  pending:     { label: 'Pending',     bg: '#fffbeb', color: '#d97706', icon: Clock },
  accepted:    { label: 'Accepted',    bg: '#f0fdf4', color: '#16a34a', icon: CheckCircle },
  in_progress: { label: 'In Progress', bg: '#eff6ff', color: '#2563eb', icon: Package },
  completed:   { label: 'Completed',   bg: '#f5f3ff', color: '#7c3aed', icon: Star },
  cancelled:   { label: 'Cancelled',   bg: '#fef2f2', color: '#dc2626', icon: XCircle },
}

const PROGRESS_STEPS: { status: BookingStatus; label: string }[] = [
  { status: 'pending',     label: 'Request Received' },
  { status: 'accepted',    label: 'Accepted' },
  { status: 'in_progress', label: 'In Production' },
  { status: 'completed',   label: 'Delivered' },
]

const TABS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Pending',     value: 'pending' },
  { label: 'Accepted',    value: 'accepted' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
  { label: 'Cancelled',   value: 'cancelled' },
]


export default function DesignerBookingsPage() {
  const { toggle } = useSidebar()
  const {
    bookings, filtered,
    activeTab, setActiveTab,
    search, setSearch,
    selected, setSelected,
    confirmAction, setConfirmAction,
    paymentModal, setPaymentModal,
    applyAction, confirmConsult, markDepositPaid,
    addBooking, deleteBooking,
    counts, pendingCount,
    isLoading, error,
  } = useBooking()

  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)  // booking id to delete
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteBooking(id)
    setIsDeleting(false)
    setDeleteConfirm(null)
  }

  if (selected) {
    return (
      <DetailPanel
        booking={selected}
        onBack={() => setSelected(null)}
        onAccept={() => applyAction(selected.id, 'accept')}
        onCancel={() => applyAction(selected.id, 'cancel')}
        onComplete={() => applyAction(selected.id, 'complete')}
        onConfirmConsult={() => confirmConsult(selected.id)}
        onRequestPayment={() => setPaymentModal(selected)}
        onDelete={() => setDeleteConfirm(selected.id)}
        toggle={toggle}
      />
    )
  }

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Bookings</h1>
            <p className="text-xs text-gray-400 hidden sm:block">{bookings.length} total orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
              <Bell className="w-3.5 h-3.5" />
              {pendingCount} pending
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FF6500] text-white hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Booking
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-5">

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#FF6500]" />
            <p className="text-sm font-medium">Loading bookings…</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" placeholder="Search by client, service, or booking ID…"
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none bg-white focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className="flex-1 min-w-fit px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
                  style={activeTab === tab.value
                    ? { background: '#fff', color: '#1a1a2e', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                    : { background: 'transparent', color: '#9ca3af' }}
                >
                  {tab.label}
                  {tab.value !== 'all' && counts[tab.value as BookingStatus]
                    ? ` (${counts[tab.value as BookingStatus]})` : ''}
                </button>
              ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium">No bookings found</p>
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
                              <p className="text-xs text-gray-400">{booking.service}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {booking.urgent && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">
                                   Urgent
                                </span>
                              )}
                              {!booking.depositPaid && booking.status !== 'cancelled' && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                                  No Deposit
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
                              {new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span>{booking.occasion}</span>
                            <span className="font-semibold text-gray-700">₦{booking.price.toLocaleString()}</span>
                            {booking.consultation.requested && (
                              <span className="flex items-center gap-1 text-[#FF6500] font-medium">
                                <Video className="w-3 h-3" /> Consultation
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                            <span className="text-xs text-gray-400 font-mono">{booking.id}</span>
                            <div className="flex items-center gap-2">
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
                                    className="text-xs font-semibold px-3 py-1 rounded-lg text-white bg-[#FF6500] hover:opacity-90 transition-all"
                                  >
                                    Accept
                                  </button>
                                </>
                              )}
                              {/* Delete button on cancelled bookings */}
                              {booking.status === 'cancelled' && (
                                <button
                                  onClick={e => { e.stopPropagation(); setDeleteConfirm(booking.id) }}
                                  className="text-xs font-medium px-3 py-1 rounded-lg border border-gray-200 text-red-400 hover:border-red-300 hover:bg-red-50 transition-all flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
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
          </>
        )}
      </div>

      {/* Confirm accept/cancel modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              {confirmAction.action === 'accept' ? 'Accept Booking?' : 'Decline Booking?'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {confirmAction.action === 'accept'
                ? "The client will be notified that you've accepted their request."
                : 'This will notify the client that you are unable to fulfil this booking.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => applyAction(confirmAction.id, confirmAction.action)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
                style={{ background: confirmAction.action === 'accept' ? '#FF6500' : '#dc2626' }}
              >
                {confirmAction.action === 'accept' ? 'Yes, Accept' : 'Yes, Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2 text-center">Delete Booking?</h3>
            <p className="text-sm text-gray-500 mb-5 text-center">
              This will permanently remove the booking from your records. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal */}
      {paymentModal && (
        <PaymentModal
          booking={paymentModal}
          onClose={() => setPaymentModal(null)}
          onConfirm={() => markDepositPaid(paymentModal.id)}
        />
      )}

      {/* Add Booking modal */}
      {showAddModal && (
        <AddBookingModal
          onClose={() => setShowAddModal(false)}
          onSave={addBooking}
        />
      )}
    </>
  )
}


function AddBookingModal({ onClose, onSave }: {
  onClose: () => void
  onSave: (data: NewBookingPayload) => Promise<void>
}) {
  const [form, setForm] = useState({
    client: '',
    clientPhone: '',
    service: '',
    occasion: '',
    deliveryDate: '',
    quantity: '1',
    urgent: false,
    price: '',
    depositAmount: '',
    designNotes: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const update = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!form.client.trim() || !form.service.trim() || !form.occasion.trim() || !form.deliveryDate || !form.price || !form.depositAmount) {
      setFormError('Please fill in all required fields.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        client: form.client.trim(),
        clientPhone: form.clientPhone.trim() || undefined,
        service: form.service.trim(),
        occasion: form.occasion.trim(),
        deliveryDate: form.deliveryDate,
        quantity: parseInt(form.quantity) || 1,
        urgent: form.urgent,
        price: parseFloat(form.price),
        depositAmount: parseFloat(form.depositAmount),
        designNotes: form.designNotes.trim() || undefined,
      })
      onClose()
    } catch {
      setFormError('Failed to create booking. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-bold text-gray-800">New Booking</h2>
            <p className="text-xs text-gray-400">Fill in the client order details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
              {formError}
            </div>
          )}

          {/* Client Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.client}
              onChange={e => update('client', e.target.value)}
              placeholder="e.g. Amara Obiechina"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
            />
          </div>

          {/* Client Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
            <input
              type="tel"
              value={form.clientPhone}
              onChange={e => update('clientPhone', e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
            />
          </div>

          {/* Service */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Service / Garment <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.service}
              onChange={e => update('service', e.target.value)}
              placeholder="e.g. Bridal Gown, Agbada Set"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
            />
          </div>

          {/* Occasion */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Occasion <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.occasion}
              onChange={e => update('occasion', e.target.value)}
              placeholder="e.g. Wedding, Birthday, Corporate"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
            />
          </div>

          {/* Delivery Date + Quantity (side by side) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Delivery Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.deliveryDate}
                onChange={e => update('deliveryDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={e => update('quantity', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
              />
            </div>
          </div>

          {/* Price + Deposit (side by side) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Total Price (₦) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={e => update('price', e.target.value)}
                placeholder="120000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Deposit (₦) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={form.depositAmount}
                onChange={e => update('depositAmount', e.target.value)}
                placeholder="60000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
              />
            </div>
          </div>

          {/* Design Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Design Notes</label>
            <textarea
              rows={3}
              value={form.designNotes}
              onChange={e => update('designNotes', e.target.value)}
              placeholder="Describe the outfit style, colour preferences, fabric, etc."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all resize-none"
            />
          </div>

          {/* Urgent toggle */}
          <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-orange-700">⚡ Mark as Urgent</p>
              <p className="text-xs text-orange-500">Highlights this booking for priority attention</p>
            </div>
            <button
              type="button"
              onClick={() => update('urgent', !form.urgent)}
              className={`w-11 h-6 rounded-full transition-all relative ${form.urgent ? 'bg-[#FF6500]' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${form.urgent ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FF6500] hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Creating…' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


function DetailPanel({
  booking, onBack, onAccept, onCancel, onComplete, onConfirmConsult, onRequestPayment, onDelete, toggle,
}: {
  booking: BookingRequest
  onBack: () => void
  onAccept: () => void
  onCancel: () => void
  onComplete: () => void
  onConfirmConsult: () => void
  onRequestPayment: () => void
  onDelete: () => void
  toggle: () => void
}) {
  const [activeSection, setActiveSection] = useState<'design' | 'measurements' | 'consultation'>('design')
  const { label, bg, color, icon: StatusIcon } = STATUS_CFG[booking.status]

  const measurementFields: { key: keyof typeof booking.measurements; label: string }[] = [
    { key: 'chest', label: 'Chest / Bust' }, { key: 'waist', label: 'Waist' },
    { key: 'hips', label: 'Hips' }, { key: 'shoulder', label: 'Shoulder Width' },
    { key: 'sleeveLength', label: 'Sleeve Length' }, { key: 'dressLength', label: 'Dress / Outfit Length' },
    { key: 'height', label: 'Height' }, { key: 'weight', label: 'Weight' },
  ]

  const hasMeasurements = Object.values(booking.measurements).some(v => v)

  const handlePrintInvoice = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Invoice ${booking.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; }
        h1 { color: #FF6500; } table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; }
        th { background: #f9fafb; font-weight: 600; }
        .total { font-size: 18px; font-weight: bold; color: #FF6500; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        @media print { button { display: none; } }
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><h1>StyledKraft</h1><p style="color:#6b7280;font-size:13px">Invoice</p></div>
        <div style="text-align:right">
          <p style="font-size:13px;color:#6b7280">Booking ID</p>
          <p style="font-weight:700">${booking.id}</p>
          <p style="font-size:12px;color:#6b7280;margin-top:4px">${new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      <hr style="margin:20px 0;border:1px solid #e5e7eb"/>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
        <div><p style="font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:600">Bill To</p>
          <p style="font-weight:700;font-size:15px">${booking.client}</p>
          ${booking.clientPhone ? `<p style="font-size:13px;color:#6b7280">${booking.clientPhone}</p>` : ''}
        </div>
        <div><p style="font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:600">Service Details</p>
          <p style="font-weight:600">${booking.service}</p>
          <p style="font-size:13px;color:#6b7280">${booking.occasion}</p>
          <p style="font-size:13px;color:#6b7280">Delivery: ${new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>${booking.service}</td><td>${booking.quantity}</td>
            <td>₦${(booking.price / booking.quantity).toLocaleString()}</td>
            <td>₦${booking.price.toLocaleString()}</td></tr>
        </tbody>
        <tfoot>
          <tr><td colspan="3" style="text-align:right;font-weight:600">Deposit Paid</td>
            <td style="color:#16a34a">₦${booking.depositPaid ? booking.depositAmount.toLocaleString() : '0'}</td></tr>
          <tr><td colspan="3" style="text-align:right;font-weight:700">Balance Due</td>
            <td class="total">₦${(booking.price - (booking.depositPaid ? booking.depositAmount : 0)).toLocaleString()}</td></tr>
        </tfoot>
      </table>
      <div style="margin-top:40px;padding:16px;background:#fff7ed;border-radius:8px;font-size:13px;color:#92400e">
        Thank you for choosing StyledKraft. Payment is due before delivery.
      </div>
      <button onclick="window.print()" style="margin-top:20px;padding:10px 24px;background:#FF6500;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600">Print / Save as PDF</button>
      </body></html>
    `)
    win.document.close()
  }

  const whatsappLink = booking.clientPhone
    ? `https://wa.me/234${booking.clientPhone.replace(/^0/, '')}?text=${encodeURIComponent(
        `Hello ${booking.client.split(' ')[0]}! This is regarding your booking *${booking.id}* for *${booking.service}*. `
      )}`
    : null

  const progressIdx = booking.status === 'cancelled'
    ? -1
    : PROGRESS_STEPS.findIndex(s => s.status === booking.status)

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Bookings</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px] sm:max-w-none">{booking.client}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintInvoice}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Invoice
          </button>
          {/* Delete button on detail panel */}
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: bg, color }}>
            <StatusIcon className="w-3.5 h-3.5" />
            {label}
          </span>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full space-y-4">

        {/* Order progress tracker */}
        {booking.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Order Progress</p>
            <div className="flex items-center">
              {PROGRESS_STEPS.map((step, i) => {
                const done = i <= progressIdx
                const active = i === progressIdx
                return (
                  <div key={step.status} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done ? 'bg-[#FF6500] text-white' : 'bg-gray-100 text-gray-400'
                      } ${active ? 'ring-4 ring-[#FF6500]/20' : ''}`}>
                        {done && !active ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </div>
                      <p className={`text-xs mt-1.5 text-center leading-tight font-medium ${done ? 'text-[#FF6500]' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < PROGRESS_STEPS.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all ${i < progressIdx ? 'bg-[#FF6500]' : 'bg-gray-100'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Client header card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
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
                  <p className="text-sm text-gray-400">{booking.service} · {booking.occasion}</p>
                </div>
                {booking.urgent && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-600 shrink-0">⚡ Urgent</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <InfoChip icon={Calendar} label="Delivery" value={new Date(booking.deliveryDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })} />
                <InfoChip icon={Package} label="Quantity" value={`${booking.quantity} piece${booking.quantity > 1 ? 's' : ''}`} />
                <InfoChip icon={User} label="Booking ID" value={booking.id} mono />
                <InfoChip icon={Star} label="Amount" value={`₦${booking.price.toLocaleString()}`} accent />
              </div>

              {/* Deposit status */}
              <div className="mt-3 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  booking.depositPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}>
                  <CreditCard className="w-3.5 h-3.5" />
                  {booking.depositPaid
                    ? `Deposit paid · ₦${booking.depositAmount.toLocaleString()}`
                    : `No deposit · ₦${booking.depositAmount.toLocaleString()} due`}
                </div>
                {!booking.depositPaid && booking.status !== 'cancelled' && (
                  <button
                    onClick={onRequestPayment}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FF6500] text-white hover:opacity-90 transition-all"
                  >
                    Request Deposit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick contact */}
        {booking.clientPhone && (
          <div className="flex gap-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp {booking.client.split(' ')[0]}
              </a>
            )}
            <a
              href={`tel:${booking.clientPhone}`}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              <PhoneCall className="w-4 h-4" /> Call
            </a>
          </div>
        )}

        {/* Action banners */}
        {booking.status === 'pending' && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-700">New Booking Request</p>
              <p className="text-xs text-amber-600">Review the details and accept or decline.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={onCancel} className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-500 transition-all">Decline</button>
              <button onClick={onAccept} className="text-xs font-semibold px-4 py-2 rounded-xl text-white bg-[#FF6500] hover:opacity-90 transition-all">Accept</button>
            </div>
          </div>
        )}

        {booking.status === 'accepted' && (
          <div className="flex justify-end">
            <button onClick={onComplete} className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white bg-purple-600 hover:opacity-90 transition-all">
              <CheckCircle className="w-4 h-4" /> Mark as Completed
            </button>
          </div>
        )}

        {/* Section tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {([
            { key: 'design', label: 'Design Brief', icon: Palette },
            { key: 'measurements', label: 'Measurements', icon: Ruler },
            { key: 'consultation', label: 'Consultation', icon: Video },
          ] as { key: typeof activeSection; label: string; icon: IconFC }[]).map(tab => {
            const TabIcon = tab.icon
            const isActive = activeSection === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all"
                style={isActive
                  ? { background: '#fff', color: '#FF6500', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { background: 'transparent', color: '#9ca3af' }}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Design Brief */}
        {activeSection === 'design' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-5">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Design Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{booking.designNotes || 'No description provided.'}</p>
            </div>
            {booking.fabrics.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Preferred Fabric(s)</p>
                <div className="flex flex-wrap gap-2">
                  {booking.fabrics.map(f => (
                    <span key={f} className="px-3 py-1 rounded-full text-xs font-medium bg-[#1a1a2e] text-white">{f}</span>
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
                      <span className="text-xs text-gray-400 font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {booking.inspirationRef && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Inspiration Reference</p>
                <a href={booking.inspirationRef} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-[#FF6500] hover:underline break-all">
                  {booking.inspirationRef}
                </a>
              </div>
            )}
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-600">You can send the client a message to request more reference images or clarifications.</p>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
              <MessageSquare className="w-4 h-4" /> Message {booking.client.split(' ')[0]}
            </button>
          </div>
        )}

        {/* Measurements */}
        {activeSection === 'measurements' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
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
                <button className="mt-4 flex items-center gap-2 mx-auto text-xs font-semibold px-4 py-2 rounded-xl text-white bg-[#FF6500] hover:opacity-90">
                  <MessageSquare className="w-3.5 h-3.5" /> Request Measurements
                </button>
              </div>
            )}
          </div>
        )}

        {/* Consultation */}
        {activeSection === 'consultation' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            {booking.consultation.requested ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Consultation Requested</p>
                    <p className="text-xs text-gray-400 mt-0.5">Client wants a video/chat call before work starts</p>
                  </div>
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
                      {booking.consultation.date ? new Date(booking.consultation.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
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
                    <p className="text-sm text-gray-600 italic">"{booking.consultation.note}"</p>
                  </div>
                )}
                {booking.consultation.status === 'pending' && (
                  <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Decline Call</button>
                    <button onClick={onConfirmConsult} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#FF6500] hover:opacity-90 flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" /> Confirm Call
                    </button>
                  </div>
                )}
                {booking.consultation.status === 'confirmed' && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <p className="text-sm text-green-700 font-medium">Consultation confirmed — join at the scheduled time.</p>
                  </div>
                )}
                {booking.consultation.status === 'done' && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                    <p className="text-sm text-blue-700 font-medium">Consultation completed.</p>
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
    </>
  )
}

/* ─── PAYMENT MODAL ───────────────────────────────────────────────────────────*/
function PaymentModal({ booking, onClose, onConfirm }: {
  booking: BookingRequest; onClose: () => void; onConfirm: () => void
}) {
  const [step, setStep] = useState<'request' | 'success'>('request')

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Deposit Recorded!</h3>
          <p className="text-sm text-gray-500 mb-6">
            ₦{booking.depositAmount.toLocaleString()} deposit has been marked as paid for {booking.client}.
          </p>
          <button onClick={onConfirm} className="w-full py-3 rounded-xl bg-[#FF6500] text-white font-semibold hover:opacity-90">Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#FF6500]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Request Deposit</h3>
            <p className="text-xs text-gray-400">Booking {booking.id}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Client</span>
            <span className="font-semibold text-gray-800">{booking.client}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-semibold text-gray-800">₦{booking.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
            <span className="text-gray-500">Deposit (50%)</span>
            <span className="font-bold text-[#FF6500]">₦{booking.depositAmount.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-5 text-center">
          Share your payment details with the client via WhatsApp, then mark as paid once received.
        </p>

        <div className="space-y-2">
          {booking.clientPhone && (
            <a
              href={`https://wa.me/234${booking.clientPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                `Hello ${booking.client.split(' ')[0]}! To confirm your booking *${booking.id}* for *${booking.service}*, please pay the deposit of *₦${booking.depositAmount.toLocaleString()}* to proceed. Thank you!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-all"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              Send via WhatsApp
            </a>
          )}
          <button
            onClick={() => setStep('success')}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Mark Deposit as Received
          </button>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Helper ─────────────────────────────────────────────────────────────────*/
function InfoChip({ icon: Icon, label, value, mono = false, accent = false }: {
  icon: React.FC<{ className?: string }>; label: string; value: string; mono?: boolean; accent?: boolean
}) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className={`text-xs font-bold ${mono ? 'font-mono' : ''} ${accent ? 'text-[#FF6500]' : 'text-gray-800'}`}>
        {value}
      </p>
    </div>
  )
}
