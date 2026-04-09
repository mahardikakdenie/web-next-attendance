import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes
  // Most routes in this app are protected except for /login
  const isAuthPage = pathname.startsWith('/login')
  
  // Get token from cookies (we assume the name is 'token' or 'session')
  // Since it's httpOnly, we can only check for existence in middleware
  const hasToken = request.cookies.has('token') || 
                   request.cookies.has('session') || 
                   request.cookies.has('next-auth.session-token')

  // Logic:
  // 1. If trying to access login page while already authenticated -> redirect to dashboard
  if (isAuthPage && hasToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. If trying to access protected page without token -> redirect to login
  if (!isAuthPage && !hasToken) {
    // Exclude public assets and API routes if necessary
    const isPublicAsset = pathname.startsWith('/_next') || 
                          pathname.includes('.') || 
                          pathname.startsWith('/api')
    
    if (!isPublicAsset) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
