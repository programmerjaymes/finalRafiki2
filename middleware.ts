import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// TEMPORARY: Middleware is disabled to fix CSS loading issues
// Once CSS loading is fixed, remove the comments and restore this functionality

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Get the token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Debug: Log pathname and token information
  console.log(`Middleware executing for path: ${pathname}`);
  console.log(`Token present: ${!!token}`);
  if (token) {
    console.log(`Token role: ${token.role}`);
    console.log(`Token user: ${JSON.stringify(token.user || {})}`);
  }

  // If the user is logged in as a business owner, always redirect to business dashboard
  // unless they're already on a business owner route
  if (token && token.role === 'BUSINESS_OWNER') {
    const isAlreadyOnBusinessRoute = pathname.startsWith('/business-dashboard') || 
                                     pathname.startsWith('/business-instructions') || 
                                     pathname.startsWith('/business-create') ||
                                     pathname.startsWith('/business-my-businesses');
                                     
    if (pathname === '/' || (!isAlreadyOnBusinessRoute && !pathname.startsWith('/api/'))) {
      console.log('Redirecting business owner to dashboard');
      return NextResponse.redirect(new URL('/business-dashboard', request.url));
    }
  }
  
  // Check if the route is an admin route that should be protected
  const isAdminRoute = pathname.startsWith('/dashboard') || 
                      pathname.startsWith('/users') || 
                      pathname.startsWith('/businesses') || 
                      pathname.startsWith('/bundles') || 
                      pathname.startsWith('/categories') || 
                      pathname.startsWith('/payments') || 
                      pathname === '/profile';
  
  // Check if the route is a business owner route that should be protected
  const isBusinessOwnerRoute = pathname.startsWith('/business-dashboard') || 
                             pathname.startsWith('/business-instructions') || 
                             pathname.startsWith('/business-create') ||
                             pathname.startsWith('/business-my-businesses');
  
  // If it's an admin route, check if the user is an admin
  if (isAdminRoute) {
    // If not logged in or not an admin, redirect to login
    if (!token || token.role !== 'ADMIN') {
      // Redirect to login page with a return URL
      const url = new URL('/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  // If it's a business owner route, check if the user is a business owner
  if (isBusinessOwnerRoute) {
    // If not logged in or not a business owner, redirect to login
    if (!token || token.role !== 'BUSINESS_OWNER') {
      // Redirect to login page with a return URL
      const url = new URL('/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  // If the user is an admin on the home page, redirect to dashboard
  if (pathname === '/' && token && token.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Otherwise, continue with the request
  return NextResponse.next();
}

// Configure middleware to only run on specific page routes, excluding all static assets
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 