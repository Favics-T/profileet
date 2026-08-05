'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AdminUser } from '@/type/index'
import {
  decodeAdminJWT,
  isTokenValid,
  setAdminCookie,
  removeAdminCookie,
  getAdminTokenFromCookie,
} from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface AdminAuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Restore session from cookie on mount
  useEffect(() => {
    const token = getAdminTokenFromCookie()
    if (token && isTokenValid(token)) {
      const payload = decodeAdminJWT(token)
      if (payload) {
        setAdmin({ email: payload.email, role: payload.role, name: payload.name ?? '' })
      }
    }
    setIsLoading(false)
  }, [])

  async function login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const json = await res.json()

      if (!res.ok) {
        return { success: false, error: json.error ?? 'Login failed.' }
      }

      setAdminCookie(json.token)
      setAdmin({ email: json.admin.email, role: json.admin.role, name: json.admin.name })
      router.push('/admin/dashboard')
      return { success: true }
    } catch {
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  function logout() {
    removeAdminCookie()
    setAdmin(null)
    router.push('/admin/login')
  }

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}