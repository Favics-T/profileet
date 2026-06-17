'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import {
  createJWT,
  decodeJWT,
  isTokenValid,
  setAuthCookie,
  removeAuthCookie,
  getTokenFromCookie,
  TOKEN_COOKIE,
  CLIENT_AUTH_TOKEN,
} from '@/lib/auth'

interface AuthUser {
  email: string
  role: 'designer' | 'client'
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, role: 'designer' | 'client') => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // On mount — restore session from whichever cookie exists
  useEffect(() => {
    const designerToken = getTokenFromCookie(TOKEN_COOKIE)
    const clientToken   = getTokenFromCookie(CLIENT_AUTH_TOKEN)

    if (designerToken && isTokenValid(designerToken)) {
      const payload = decodeJWT(designerToken)
      if (payload) setUser({ email: payload.email, role: 'designer' })
    } else if (clientToken && isTokenValid(clientToken)) {
      const payload = decodeJWT(clientToken)
      if (payload) setUser({ email: payload.email, role: 'client' })
    }

    setIsLoading(false)
  }, [])

  function login(email: string, role: 'designer' | 'client') {
    const jwt = createJWT(email, role)
    setAuthCookie(jwt, role)         // writes to correct cookie per role
    setUser({ email, role })

    if (role === 'client') {
      router.push('/client/dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  function logout() {
    removeAuthCookie()   // clears both auth-token and client-auth-token
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}