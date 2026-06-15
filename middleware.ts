import { NextRequest, NextResponse } from 'next/server'

const TOKEN_COOKIE = 'auth-token'

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1])) as { exp: number }
    return payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
};


export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value
  const { pathname } = request.nextUrl;
  const isAuthenticated = !!token && isTokenValid(token)
  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if ((pathname === '/login' || pathname === '/signup') && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()}

  
function middlewares(request: NextRequest){
    const token = request.cookies.get(TOKEN_COOKIE)?.value;
    const { pathname } = request.nextUrl;
    const isAuthenticated = !!token && isTokenValid(token);
    if(pathname.startsWith('/dashboard') && !isAuthenticated)
    return NextResponse.redirect(new URL('/login', request.url))
  }


export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup','/profile'],
}
