'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Inquiry, InquiryStatus } from '@/type/index'

interface InquiryContextType {
  inquiries: Inquiry[]
  filtered: Inquiry[]
  filterStatus: InquiryStatus | 'All'
  setFilterStatus: (status: InquiryStatus | 'All') => void
  updateStatus: (id: string, status: InquiryStatus) => void
  isLoading: boolean
  error: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const InquiryContext = createContext<InquiryContextType | null>(null)

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | 'All'>('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInquiries() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${API_URL}/inquiries`)
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        const data: Inquiry[] = await res.json()
        setInquiries(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inquiries')
      } finally {
        setIsLoading(false)
      }
    }
    fetchInquiries()
  }, [])

  const filtered = filterStatus === 'All'
    ? inquiries
    : inquiries.filter((i) => i.status === filterStatus)

  
  async function updateStatus(id: string, status: InquiryStatus) {
    const previous = inquiries
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))

    try {
      const res = await fetch(`${API_URL}/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(`Update failed (${res.status})`)
    } catch (err) {
      
      setInquiries(previous)
      setError(err instanceof Error ? err.message : 'Failed to update status')
    }
  }

  return (
    <InquiryContext.Provider
      value={{ inquiries, filtered, filterStatus, setFilterStatus, updateStatus, isLoading, error }}
    >
      {children}
    </InquiryContext.Provider>
  )
}

export function useInquiry() {
  const ctx = useContext(InquiryContext)
  if (!ctx) throw new Error('useInquiry must be used within InquiryProvider')
  return ctx
}