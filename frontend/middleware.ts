import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const APP_ROUTES = ['/documents', '/sessions', '/analysis', '/similarity']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  const isAppRoute = APP_ROUTES.some((r) => pathname.startsWith(r))

  if (isAppRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/documents/:path*',
    '/sessions/:path*',
    '/analysis/:path*',
    '/similarity/:path*',
  ],
}
