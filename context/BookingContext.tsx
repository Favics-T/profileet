'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BookingStatus, Measurement, Consultation, BookingRequest } from '@/type/booking'

interface BookingContextType {
  bookings: BookingRequest[]
  filtered: BookingRequest[]
  activeTab: BookingStatus | 'all'
  setActiveTab: (tab: BookingStatus | 'all') => void
  search: string
  setSearch: (value: string) => void
  selected: BookingRequest | null
  setSelected: (booking: BookingRequest | null) => void
  confirmAction: { id: string; action: 'accept' | 'cancel' | 'complete' } | null
  setConfirmAction: (action: { id: string; action: 'accept' | 'cancel' | 'complete' } | null) => void
  paymentModal: BookingRequest | null
  setPaymentModal: (booking: BookingRequest | null) => void
  applyAction: (id: string, action: 'accept' | 'cancel' | 'complete') => void
  confirmConsult: (id: string) => void
  markDepositPaid: (id: string) => void
  counts: Record<BookingStatus, number>
  pendingCount: number
  isLoading: boolean
  error: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const BookingContext = createContext<BookingContextType | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<BookingRequest | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'accept' | 'cancel' | 'complete' } | null>(null)
  const [paymentModal, setPaymentModal] = useState<BookingRequest | null>(null)

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${API_URL}/bookings`)
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        const data: BookingRequest[] = await res.json()
        setBookings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookings')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBookings()
  }, [])

  const filtered = bookings.filter(b => {
    const matchTab = activeTab === 'all' || b.status === activeTab
    const matchSearch =
      b.client.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const applyAction = (id: string, action: 'accept' | 'cancel' | 'complete') => {
    const next: BookingStatus = action === 'accept' ? 'accepted' : action === 'cancel' ? 'cancelled' : 'completed'
    setBookings(prev => prev.map(b => (b.id !== id ? b : { ...b, status: next })))
    if (selected?.id === id) setSelected(prev => (prev ? { ...prev, status: next } : null))
    setConfirmAction(null)
  }

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {} as Record<BookingStatus, number>)

  const pendingCount = counts['pending'] ?? 0

  const confirmConsult = (id: string) => {
    setBookings(prev => prev.map(b =>
      b.id === id ? { ...b, consultation: { ...b.consultation, status: 'confirmed' } } : b
    ))
    if (selected?.id === id)
      setSelected(prev => (prev ? { ...prev, consultation: { ...prev.consultation, status: 'confirmed' } } : null))
  }

  const markDepositPaid = (id: string) => {
    setBookings(prev => prev.map(b => (b.id !== id ? b : { ...b, depositPaid: true })))
    if (selected?.id === id) setSelected(prev => (prev ? { ...prev, depositPaid: true } : null))
    setPaymentModal(null)
  }

  return (
    <BookingContext.Provider value={{
      bookings, filtered,
      activeTab, setActiveTab,
      search, setSearch,
      selected, setSelected,
      confirmAction, setConfirmAction,
      paymentModal, setPaymentModal,
      applyAction, confirmConsult, markDepositPaid,
      counts, pendingCount,
      isLoading, error,
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}