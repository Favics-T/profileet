import { AdminRole, User } from '@/type/index'

const EXPIRES_IN = 86400 // 24 hours

export const TOKEN_COOKIE        = 'auth-token'         // designer
export const CLIENT_AUTH_TOKEN   = 'client-auth-token'  
export const ADMIN_TOKEN_COOKIE  = 'admin-auth-token'   



export function createJWT(email: string, role: 'designer' | 'client'): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
    })
  )
  const signature = btoa('styledkraft-frontend-secret')
  return `${header}.${payload}.${signature}`
}

export function decodeJWT(token: string): { email: string; role: User; exp: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}

export function isTokenValid(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload) return false
  return payload.exp > Math.floor(Date.now() / 1000)
}


export function setAuthCookie(token: string, role: 'designer' | 'client'): void {
  const cookieName = role === 'client' ? CLIENT_AUTH_TOKEN : TOKEN_COOKIE
  document.cookie = `${cookieName}=${token}; path=/; max-age=${EXPIRES_IN}; SameSite=Strict`
}


export function removeAuthCookie(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`
  document.cookie = `${CLIENT_AUTH_TOKEN}=; path=/; max-age=0`
}


export function getTokenFromCookie(cookieName: string = TOKEN_COOKIE): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}


export function authHeader(): { Authorization: string } | Record<string, never> {
  const token =
    getTokenFromCookie(TOKEN_COOKIE) ??
    getTokenFromCookie(CLIENT_AUTH_TOKEN)
  return token ? { Authorization: `Bearer ${token}` } : {}
}


export const ADMIN_CREDENTIALS: {
  email: string
  password: string
  role: AdminRole
  name: string
}[] = [
  { email: 'super@styledkraft.com',   password: 'super123',   role: 'super_admin',     name: 'Super Admin' },
  { email: 'manager@styledkraft.com', password: 'manager123', role: 'profile_manager', name: 'Profile Manager' },
  { email: 'support@styledkraft.com', password: 'support123', role: 'support_agent',   name: 'Support Agent' },
  { email: 'auditor@styledkraft.com', password: 'auditor123', role: 'auditor',         name: 'Auditor' },
]

export function createAdminJWT(email: string, role: AdminRole): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
    })
  )
  const signature = btoa('styledkraft-admin-secret')
  return `${header}.${payload}.${signature}`
}

export function decodeAdminJWT(token: string): { email: string; role: AdminRole; exp: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}

export function setAdminCookie(token: string): void {
  document.cookie = `${ADMIN_TOKEN_COOKIE}=${token}; path=/; max-age=${EXPIRES_IN}; SameSite=Strict`
}

export function removeAdminCookie(): void {
  document.cookie = `${ADMIN_TOKEN_COOKIE}=; path=/; max-age=0`
}

export function getAdminTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${ADMIN_TOKEN_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}