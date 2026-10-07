import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes protection
    if (path.startsWith('/admin') && token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Dashboard routes protection (any authenticated user)
    if (path.startsWith('/account') && !token) {
      const callbackUrl = encodeURIComponent(path)
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Allow public routes
        if (
          path === '/' ||
          path.startsWith('/category') ||
          path.startsWith('/product') ||
          path.startsWith('/api/') ||
          path.startsWith('/login') ||
          path.startsWith('/register') ||
          path.startsWith('/_next') ||
          path.startsWith('/images') ||
          path.startsWith('/favicon')
        ) {
          return true
        }

        // Protected routes require authentication
        if (path.startsWith('/account') || path.startsWith('/checkout') || path.startsWith('/admin')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/api/orders/:path*',
    '/api/cart/:path*',
  ],
}