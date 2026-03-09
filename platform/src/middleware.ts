import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/admin']

const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => path.startsWith(route))
}

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('payload-token')
  const path = request.nextUrl.pathname
  const isLoginPage = path === '/login'

  // Allow access to public routes without authentication
  if (isPublicRoute(path)) {
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL(process.env.NEXT_PUBLIC_DEFAULT_REDIRECT || '/tasks', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 