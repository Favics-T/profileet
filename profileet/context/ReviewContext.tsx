'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authHeader } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface Review {
  id: string
  client: string
  initials: string
  color: string
  service: string
  rating: number
  date: string
  text: string
  helpful: number
  replied: boolean
  reply?: string | null
  bookingId?: string | null
  createdAt: string
  updatedAt: string
}

interface ReviewContextValue {
  reviews: Review[]
  isLoading: boolean
  error: string | null
  submitReply: (id: string, text: string) => Promise<void>
  markHelpful: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const ReviewContext = createContext<ReviewContextValue | null>(null)

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [helpfulSet, setHelpfulSet] = useState<Set<string>>(new Set())// this workss only in browser

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/reviews`, {
        headers: { ...authHeader() },
      })
      if (!res.ok) throw new Error(`Failed to fetch reviews: ${res.status}`)
      const json: { data: Review[] } = await res.json()
      setReviews(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function run() {
      await fetchReviews()
    }
    run()
  }, [fetchReviews])

  
  const submitReply = useCallback(async (id: string, text: string) => {
    if (!text.trim()) return
        setReviews(prev =>
      prev.map(r => r.id !== id ? r : { ...r, replied: true, reply: text.trim() })
    )
    try {
      const res = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ reply: text.trim() }),
      })
      if (!res.ok) throw new Error('Failed to save reply')
      const updated: Review = await res.json()
      setReviews(prev => prev.map(r => r.id !== id ? r : updated))
    } catch (err) {
     
      await fetchReviews()
      setError(err instanceof Error ? err.message : 'Failed to save reply')
    }
  }, [fetchReviews])

  
  const markHelpful = useCallback(async (id: string) => {
    if (helpfulSet.has(id)) return
    setHelpfulSet(prev => new Set([...prev, id]))
    
    setReviews(prev =>
      prev.map(r => r.id !== id ? r : { ...r, helpful: r.helpful + 1 })
    )
    try {
      const res = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ incrementHelpful: true }),
      })
      if (!res.ok) throw new Error('Failed to mark helpful')
      const updated: Review = await res.json()
      setReviews(prev => prev.map(r => r.id !== id ? r : updated))
    } catch (err) {
      
      setHelpfulSet(prev => { const n = new Set(prev); n.delete(id); return n })
      setReviews(prev =>
        prev.map(r => r.id !== id ? r : { ...r, helpful: r.helpful - 1 })
      )
      setError(err instanceof Error ? err.message : 'Failed to mark helpful')
    }
  }, [helpfulSet])

  return (
    <ReviewContext.Provider value={{
      reviews,
      isLoading,
      error,
      submitReply,
      markHelpful,
      refetch: fetchReviews,
    }}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReview() {
  const ctx = useContext(ReviewContext)
  if (!ctx) throw new Error('useReview must be used inside ReviewProvider')
  return ctx
}
