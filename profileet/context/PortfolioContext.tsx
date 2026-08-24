'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authHeader } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface PortfolioItem {
  id: string
  title: string
  tag: string
  description: string
  imageUrl: string
  createdAt: string
  updatedAt: string
}

interface PortfolioContextValue {
  items: PortfolioItem[]
  isLoading: boolean
  error: string | null
  publishItems: (newItems: { title: string; tag: string; description: string; imageUrl: string }[]) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/portfolio`, {
        headers: { ...authHeader() },
      })
      if (!res.ok) throw new Error(`Failed to fetch portfolio: ${res.status}`)
      const data: PortfolioItem[] = await res.json()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  
  const publishItems = useCallback(async (
    newItems: { title: string; tag: string; description: string; imageUrl: string }[]
  ) => {
    setError(null)
    try {
      const res = await fetch(`${API_URL}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(newItems),
      })
      if (!res.ok) throw new Error('Failed to save portfolio items')
     
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save portfolio')
      throw err 
    }
  }, [fetchItems])

 
  const deleteItem = useCallback(async (id: string) => {
 
    setItems(prev => prev.filter(item => item.id !== id))
    try {
      const res = await fetch(`${API_URL}/portfolio/${id}`, {
        method: 'DELETE',
        headers: { ...authHeader() },
      })
      if (!res.ok) throw new Error('Failed to delete portfolio item')
    } catch (err) {
    
      await fetchItems()
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }, [fetchItems])

  return (
    <PortfolioContext.Provider value={{
      items,
      isLoading,
      error,
      publishItems,
      deleteItem,
      refetch: fetchItems,
    }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used inside PortfolioProvider')
  return ctx
}
