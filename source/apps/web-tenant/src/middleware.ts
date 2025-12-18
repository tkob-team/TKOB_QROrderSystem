import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password'];

// Routes accessible only when not authenticated
const authOnlyRoutes = ['/auth/login', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('[middleware] Request to:', pathname);
  
  // Get auth token from cookie or header (adjust based on your auth implementation)
  const authToken = request.cookies.get('authToken')?.value;
  const isAuthenticated = !!authToken;
  
  console.log('[middleware] isAuthenticated:', isAuthenticated);

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // If authenticated user tries to access login/signup, redirect to dashboard
    if (isAuthenticated && authOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
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

  // TODO: Add role-based access control
  // For now, we'll handle role checks in the AuthContext and components
  // Future: Parse JWT token here and check role permissions

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
