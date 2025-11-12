import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isAuthenticated,
  isPublicRoute,
  isProtectedRoute,
  isApiRoute,
  isSharedRoute,
  isValidShareLink,
} from '@/lib/middleware-utils';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get authentication token from cookies or headers
  const token = request.cookies.get('auth-token')?.value;
  const sessionId = request.cookies.get('session-id')?.value;
  
  // Handle API routes
  if (isApiRoute(pathname)) {
    // Add CORS headers for API routes
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    // Protect API routes that require authentication
    const protectedApiRoutes = ['/api/trees', '/api/persons', '/api/user'];
    const isProtectedApiRoute = protectedApiRoutes.some(route => 
      pathname.startsWith(route)
    );
    
    if (isProtectedApiRoute && !token && !sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return response;
  }
  
  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    // Check if user is authenticated
    const authenticated = await isAuthenticated(request);
    
    if (!authenticated) {
      // Redirect to onboarding if not authenticated
      const redirectUrl = new URL('/onboarding', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Handle shared tree routes
  if (isSharedRoute(pathname)) {
    // Extract shareId from pathname (e.g., /shared/abc123)
    const shareId = pathname.split('/shared/')[1]?.split('/')[0];
    
    if (shareId) {
      // Validate share link
      const isValid = await isValidShareLink(shareId);
      if (!isValid) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
    
    return NextResponse.next();
  }
  
  // Handle family slug routes (e.g., /family-slug)
  if (pathname.match(/^\/[^\/]+$/) && !isPublicRoute(pathname) && !isProtectedRoute(pathname)) {
    // This matches routes like /family-slug
    // Allow access but you can add verification here
    // You could check if the slug exists in the database
    return NextResponse.next();
  }
  
  // Handle root route
  if (pathname === '/') {
    // Check if user has completed onboarding
    const hasOnboarded = request.cookies.get('onboarded')?.value === 'true';
    
    if (hasOnboarded) {
      // Redirect to dashboard if already onboarded
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Allow access to home page
      return NextResponse.next();
    }
  }
  
  // Add custom headers to all responses
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add request metadata for logging
  response.headers.set('X-Request-Path', pathname);
  response.headers.set('X-Request-Method', request.method);
  
  return response;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

