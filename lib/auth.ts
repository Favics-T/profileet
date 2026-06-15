const TOKEN_COOKIE = 'auth-token'
const EXPIRES_IN = 86400 // expires in 24 hours time
import { AdminRole } from '@/type/index'


export function createJWT(email: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + EXPIRES_IN,
    })
  )
  const signature = btoa('styledkraft-frontend-secret')
  return `${header}.${payload}.${signature}`
}

export function decodeJWT(token: string): { email: string; exp: number } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return JSON.parse(atob(parts[1]))
  } catch {
    return null 
  }};

export function isTokenValid(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload) return false
  return payload.exp > Math.floor(Date.now() / 1000)
};

export function setAuthCookie(token: string): void {
  document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${EXPIRES_IN}; SameSite=Strict`
}

export function removeAuthCookie(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`
}

export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Admin credentials — hardcoded for learning stage
export const ADMIN_CREDENTIALS: {
  email: string
  password: string
  role: AdminRole
  name: string
}[] = [
  { email: 'super@styledkraft.com', password: 'super123', role: 'super_admin', name: 'Super Admin' },
  { email: 'manager@styledkraft.com', password: 'manager123', role: 'profile_manager', name: 'Profile Manager' },
  { email: 'support@styledkraft.com', password: 'support123', role: 'support_agent', name: 'Support Agent' },
  { email: 'auditor@styledkraft.com', password: 'auditor123', role: 'auditor', name: 'Auditor' },
]

export function createAdminJWT(email: string, role: AdminRole): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
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

export const ADMIN_TOKEN_COOKIE = 'admin-auth-token'

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
