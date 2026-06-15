'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AdminUser } from '@/type/index'
import {
  createAdminJWT,
  decodeAdminJWT,
  isTokenValid,
  setAdminCookie,
  removeAdminCookie,
  getAdminTokenFromCookie,
  ADMIN_CREDENTIALS,
} from '@/lib/auth'

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

  useEffect(() => {
    const token = getAdminTokenFromCookie()
    if (token && isTokenValid(token)) {
      const payload = decodeAdminJWT(token)
      if (payload) {
        const match = ADMIN_CREDENTIALS.find((c) => c.email === payload.email)
        if (match) setAdmin({ email: match.email, role: payload.role, name: match.name })
      }
    }
    setIsLoading(false)
  }, [])

  async function login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600))

    const match = ADMIN_CREDENTIALS.find(
      (c) => c.email === email && c.password === password
    )

    if (!match) {
      return { success: false, error: 'Invalid email or password.' }
    }

    const token = createAdminJWT(match.email, match.role)
    setAdminCookie(token)
    setAdmin({ email: match.email, role: match.role, name: match.name })
    router.push('/admin/dashboard')
    return { success: true }
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