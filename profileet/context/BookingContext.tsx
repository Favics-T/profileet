'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BookingStatus, Measurement, Consultation, BookingRequest } from '@/type/booking'
import { authHeader } from '@/lib/auth'


export interface NewBookingPayload {
  client: string
  clientPhone?: string
  service: string
  occasion: string
  deliveryDate: string
  quantity?: number
  urgent?: boolean
  price: number
  depositAmount: number
  designNotes?: string
  fabrics?: string[]
  colors?: string[]
  inspirationRef?: string
  measurements?: Measurement
  consultation?: Consultation
}

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
    addBooking: (data: NewBookingPayload) => Promise<void>
  
  deleteBooking: (id: string) => Promise<void>
  counts: Record<BookingStatus, number>
  pendingCount: number
  isLoading: boolean
  error: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
        const res = await fetch(`${API_URL}/bookings`, {
          headers: { ...authHeader() },
        })
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

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1
    return acc
  }, {} as Record<BookingStatus, number>)

  const pendingCount = counts['pending'] ?? 0

  
  const applyAction = async (id: string, action: 'accept' | 'cancel' | 'complete') => {
    const next: BookingStatus = action === 'accept' ? 'accepted' : action === 'cancel' ? 'cancelled' : 'completed'

    
    const previous = bookings
    setBookings(prev => prev.map(b => (b.id !== id ? b : { ...b, status: next })))
    if (selected?.id === id) setSelected(prev => (prev ? { ...prev, status: next } : null))
    setConfirmAction(null)

    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error(`Update failed (${res.status})`)
    } catch (err) {
     
      setBookings(previous)
      if (selected?.id === id) setSelected(previous.find(b => b.id === id) ?? null)
      setError(err instanceof Error ? err.message : 'Failed to update booking')
    }
  }

  
  const confirmConsult = async (id: string) => {
    
    const previous = bookings
    const updatedConsult = { status: 'confirmed' as const }
    setBookings(prev => prev.map(b =>
      b.id === id ? { ...b, consultation: { ...b.consultation, status: 'confirmed' } } : b
    ))
    if (selected?.id === id)
      setSelected(prev => (prev ? { ...prev, consultation: { ...prev.consultation, status: 'confirmed' } } : null))

    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ consultation: updatedConsult }),
      })
      if (!res.ok) throw new Error(`Update failed (${res.status})`)
    } catch (err) {
      setBookings(previous)
      if (selected?.id === id) setSelected(previous.find(b => b.id === id) ?? null)
      setError(err instanceof Error ? err.message : 'Failed to confirm consultation')
    }
  }

 
  const markDepositPaid = async (id: string) => {
    
    const previous = bookings
    setBookings(prev => prev.map(b => (b.id !== id ? b : { ...b, depositPaid: true })))
    if (selected?.id === id) setSelected(prev => (prev ? { ...prev, depositPaid: true } : null))
    setPaymentModal(null)

    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ depositPaid: true }),
      })
      if (!res.ok) throw new Error(`Update failed (${res.status})`)
    } catch (err) {
      setBookings(previous)
      if (selected?.id === id) setSelected(previous.find(b => b.id === id) ?? null)
      setError(err instanceof Error ? err.message : 'Failed to mark deposit as paid')
    }
  }

  
  const addBooking = async (data: NewBookingPayload) => {
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`Create failed (${res.status})`)
      const created: BookingRequest = await res.json()
      setBookings(prev => [created, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
      throw err 
    }
  }


  const deleteBooking = async (id: string) => {
    
    const previous = bookings
    setBookings(prev => prev.filter(b => b.id !== id))
    if (selected?.id === id) setSelected(null)

    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader() },
      })
      if (!res.ok) throw new Error(`Delete failed (${res.status})`)
    } catch (err) {
      setBookings(previous)
      setError(err instanceof Error ? err.message : 'Failed to delete booking')
    }
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
      addBooking, deleteBooking,
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