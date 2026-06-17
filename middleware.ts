import { NextRequest, NextResponse } from 'next/server'

const TOKEN_COOKIE = 'auth-token'
const ADMIN_TOKEN_COOKIE = 'admin-auth-token'
const CLIENT_TOKEN_COOKIE = 'client-auth-token'

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1])) as { exp: number }
    return payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}



export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Designer auth ---
  const designerToken = request.cookies.get(TOKEN_COOKIE)?.value
  const isDesignerAuth = !!designerToken && isTokenValid(designerToken)

  if (pathname.startsWith('/dashboard') && !isDesignerAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if ((pathname === '/login' || pathname === '/signup') && isDesignerAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // --- Client auth ---
  const clientToken = request.cookies.get(CLIENT_TOKEN_COOKIE)?.value
  const isClientAuth = !!clientToken && isTokenValid(clientToken)

  if (pathname.startsWith('/client/dashboard') && !isClientAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if ((pathname === '/login' || pathname === '/signup') && isClientAuth) {
    return NextResponse.redirect(new URL('/client/dashboard', request.url))
  }

  // --- Admin auth ---
  const adminToken = request.cookies.get(ADMIN_TOKEN_COOKIE)?.value
  const isAdminAuth = !!adminToken && isTokenValid(adminToken)

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !isAdminAuth) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (pathname === '/admin/login' && isAdminAuth) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/client/dashboard/:path*',
    '/login',
    '/signup',
    '/admin/:path*',
  ],
}