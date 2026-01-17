import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/shared/utils/logger';

// Public routes that don't require authentication
const publicRoutes = [
  '/auth/login', 
  '/auth/signup', 
  '/auth/forgot-password', 
  '/auth/reset-password',
  // Marketing/Landing pages - accessible to everyone
  '/home',
  '/about',
  '/help',
  '/unauthorized',
];

// Routes accessible only when not authenticated (will redirect to dashboard if logged in)
const authOnlyRoutes = ['/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  logger.log('[middleware] Request to:', pathname);
  
  // Get auth token from cookie or header (adjust based on your auth implementation)
  const authToken = request.cookies.get('authToken')?.value;
  const isAuthenticated = !!authToken;
  
  logger.log('[middleware] isAuthenticated:', isAuthenticated);

  // Allow public/marketing routes for everyone
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If authenticated user tries to access login/signup, redirect to dashboard
    if (isAuthenticated && authOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Root path "/" - redirect based on auth state and role
  if (pathname === '/') {
    if (isAuthenticated && authToken) {
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          const userRole = payload.role as string;
          
          // Redirect based on role
          if (userRole === 'OWNER') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          } else if (userRole === 'STAFF') {
            return NextResponse.redirect(new URL('/waiter', request.url));
          } else if (userRole === 'KITCHEN') {
            return NextResponse.redirect(new URL('/kds', request.url));
          }
        }
      } catch (error) {
        logger.log('[middleware] Failed to parse JWT for root redirect:', error);
      }
      // Fallback to home if role parsing fails
      return NextResponse.redirect(new URL('/home', request.url));
    } else {
      // Redirect to landing page for non-authenticated users
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // Protected routes require authentication
  if (!isAuthenticated && (
    pathname.startsWith('/admin') || 
    pathname.startsWith('/kds') ||
    pathname.startsWith('/waiter')
  )) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (isAuthenticated && authToken) {
    try {
      // Parse JWT token to get user role (token format: header.payload.signature)
      const tokenParts = authToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        const userRole = payload.role as string;
        
        // Role-based route restrictions
        // Note: /admin/kds and /admin/service-board are accessible by OWNER (for monitoring)
        //       /kds standalone is only for KITCHEN staff
        //       /waiter standalone is only for WAITER staff
        
        // /admin routes - Only OWNER can access
        if (pathname.startsWith('/admin')) {
          if (!['OWNER'].includes(userRole)) {
            logger.log('[middleware] Access denied to admin routes for role:', userRole);
            const unauthorizedUrl = new URL('/unauthorized', request.url);
            unauthorizedUrl.searchParams.set('role', userRole);
            return NextResponse.redirect(unauthorizedUrl);
          }
        }
        
        // /kds - Only KITCHEN and OWNER can access
        if (pathname === '/kds' || pathname.startsWith('/kds/')) {
          if (!['KITCHEN', 'OWNER'].includes(userRole)) {
            logger.log('[middleware] Access denied to KDS for role:', userRole);
            const unauthorizedUrl = new URL('/unauthorized', request.url);
            unauthorizedUrl.searchParams.set('role', userRole);
            return NextResponse.redirect(unauthorizedUrl);
          }
        }
        
        // /staff - Only STAFF and OWNER can access  
        if (pathname === '/staff' || pathname.startsWith('/staff/')) {
          if (!['STAFF', 'OWNER'].includes(userRole)) {
            logger.log('[middleware] Access denied to Staff for role:', userRole);
            const unauthorizedUrl = new URL('/unauthorized', request.url);
            unauthorizedUrl.searchParams.set('role', userRole);
            return NextResponse.redirect(unauthorizedUrl);
          }
        }
        
        // /waiter - Only STAFF and OWNER can access
        if (pathname === '/waiter' || pathname.startsWith('/waiter/')) {
          if (!['STAFF', 'OWNER'].includes(userRole)) {
            logger.log('[middleware] Access denied to Waiter for role:', userRole);
            const unauthorizedUrl = new URL('/unauthorized', request.url);
            unauthorizedUrl.searchParams.set('role', userRole);
            return NextResponse.redirect(unauthorizedUrl);
          }
        }
      }
    } catch (error) {
      logger.log('[middleware] Failed to parse JWT token:', error);
      // If token parsing fails, allow request to proceed (will be caught by AuthContext)
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
