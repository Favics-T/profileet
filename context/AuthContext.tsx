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
} from '@/lib/auth'

interface AuthUser {
  email: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  // login:(token: string) => void
  login: (email: string) => void // only needs email, mints its own JWT
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getTokenFromCookie()
    if (token && isTokenValid(token)) {
      const payload = decodeJWT(token)
      if (payload) setUser({ 
        email: payload.email
               })
    }
    setIsLoading(false)
  }, [])

  function login(email:string 
    // token: string
  )
   {
    // setAuthCookie(token)
    // const payload= decodeJWT(token);
    // if(payload) setUser({email: payload.email})
    //   router.push('/dashboard')
    const jwt = createJWT(email) 
    setAuthCookie(jwt) 
    setUser({ email }) 
    router.push('/dashboard') 

    // create a jwt, write it to cookie, update user state , route to dashboard
  }

  function logout() {
    removeAuthCookie()
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
