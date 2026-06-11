const TOKEN_COOKIE = 'auth-token'
const EXPIRES_IN = 400 // 24 hours in seconds

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
