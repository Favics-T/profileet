import { AdminRole, User } from '@/type/index'

const EXPIRES_IN = 86400 // 24 hours (matches backend)

// ─── Cookie names ──────────────────────────────────────────────────────────
export const TOKEN_COOKIE       = 'auth-token'        // designer
export const CLIENT_AUTH_TOKEN  = 'client-auth-token' // client
export const ADMIN_TOKEN_COOKIE = 'admin-auth-token'  // admin

// ─── Designer / Client JWT helpers ────────────────────────────────────────
// Note: tokens are signed by the backend. These helpers only READ / STORE them.

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

// Writes the correct cookie based on role
export function setAuthCookie(token: string, role: 'designer' | 'client'): void {
  const cookieName = role === 'client' ? CLIENT_AUTH_TOKEN : TOKEN_COOKIE
  document.cookie = `${cookieName}=${token}; path=/; max-age=${EXPIRES_IN}; SameSite=Strict`
}

// Clears both designer and client cookies on logout
export function removeAuthCookie(): void {
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0`
  document.cookie = `${CLIENT_AUTH_TOKEN}=; path=/; max-age=0`
}

// Reads a cookie by name
export function getTokenFromCookie(cookieName: string = TOKEN_COOKIE): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Returns Authorization header for any active session (designer or client)
export function authHeader(): { Authorization: string } | Record<string, never> {
  const token =
    getTokenFromCookie(TOKEN_COOKIE) ??
    getTokenFromCookie(CLIENT_AUTH_TOKEN)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Admin JWT helpers ────────────────────────────────────────────────────
// Admin tokens are signed by the backend. These helpers only READ / STORE them.

export function decodeAdminJWT(
  token: string
): { email: string; role: AdminRole; name: string; exp: number } | null {
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