import { DayStatus } from '@/type/index'
import { useCallback, useEffect, useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// ─── Day status display config ────────────────────────────────────────────────
export const DAY_STATUS: Record<DayStatus, { label: string; bg: string; text: string; border: string }> = {
  open: { label: 'Available',    bg: 'bg-green-100',  text: 'text-green-700', border: 'border-green-300' },
  busy: { label: 'Fully Booked', bg: 'bg-red-100',    text: 'text-red-600',   border: 'border-red-300' },
  off:  { label: 'Day Off',      bg: 'bg-gray-100',   text: 'text-gray-500',  border: 'border-gray-300' },
}

// ─── useAvailability hook ─────────────────────────────────────────────────────
export const useAvailability = () => {
  const [days, setDays] = useState<string[]>([])
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch weekday labels (Sun–Sat) ─────────────────────────────────────────
  const getWeekdays = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/availability/weekdays`)
      if (!res.ok) throw new Error(`Error fetching weekdays: ${res.status}`)
      const data = await res.json()
      setDays(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weekdays')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch all persisted day statuses ──────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/availability`)
      if (!res.ok) throw new Error(`Error fetching availability: ${res.status}`)
      const data: Record<string, DayStatus> = await res.json()
      setDayStatuses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Save a single day's status to the backend ─────────────────────────────
  const saveDay = useCallback(async (date: string, status: DayStatus) => {
    // Optimistic update
    setDayStatuses(prev => ({ ...prev, [date]: status }))
    setError(null)
    try {
      const res = await fetch(`${API_URL}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, status }),
      })
      if (!res.ok) throw new Error(`Error saving availability: ${res.status}`)
    } catch (err) {
      // Roll back on error
      setDayStatuses(prev => {
        const next = { ...prev }
        delete next[date]
        return next
      })
      setError(err instanceof Error ? err.message : 'Failed to save availability')
    }
  }, [])

  // ── Clear a single day's status from the backend ──────────────────────────
  const clearDay = useCallback(async (date: string) => {
    // Optimistic update
    const previous = dayStatuses
    setDayStatuses(prev => {
      const next = { ...prev }
      delete next[date]
      return next
    })
    setError(null)
    try {
      const res = await fetch(`${API_URL}/availability/${date}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Error clearing availability: ${res.status}`)
    } catch (err) {
      setDayStatuses(previous)
      setError(err instanceof Error ? err.message : 'Failed to clear availability')
    }
  }, [dayStatuses])

  // ── Load on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    getWeekdays()
    fetchAll()
  }, [getWeekdays, fetchAll])

  return {
    days,
    dayStatuses,
    loading,
    error,
    saveDay,
    clearDay,
    refetch: fetchAll,
  }
}

// Keep old export name for backward compatibility
export const useAvailabilty = useAvailability
