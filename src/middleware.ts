import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const LOCALE_COOKIE = 'rafiki_locale';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Old bookmarks: /en/... or /sw/... -> same path without prefix, locale saved in cookie
  const seg = pathname.split('/')[1];
  if (seg === 'en' || seg === 'sw') {
    const stripped =
      pathname.replace(new RegExp(`^/${seg}(?=/|$)`), '') || '/';
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    const res = NextResponse.redirect(url);
    res.cookies.set(LOCALE_COOKIE, seg, { path: '/', sameSite: 'lax' });
    return res;
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublicBusinessDetails = /^\/businesses\/[^/]+$/.test(pathname);
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/search') ||
    isPublicBusinessDetails ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/error-404');

  // Deny by default: if route is not explicitly public, login is required.
  if (!isPublicRoute && !token) {
    const url = new URL('/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  if (token && token.role === 'BUSINESS_OWNER') {
    const isAlreadyOnBusinessRoute =
      pathname.startsWith('/business-dashboard') ||
      pathname.startsWith('/business-instructions') ||
      pathname.startsWith('/business-create') ||
      pathname.startsWith('/business-my-businesses') ||
      pathname.startsWith('/businessowner-dashboard');

    if (
      pathname === '/' ||
      (!isAlreadyOnBusinessRoute && !pathname.startsWith('/api/'))
    ) {
      return NextResponse.redirect(
        new URL('/business-dashboard', request.url)
      );
    }
  }

  const isAdminRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/users') ||
    pathname === '/businesses' ||
    pathname.startsWith('/bundles') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/regions') ||
    pathname.startsWith('/districts') ||
    pathname.startsWith('/wards') ||
    pathname.startsWith('/streets') ||
    pathname === '/profile';

  const isBusinessOwnerRoute =
    pathname.startsWith('/business-dashboard') ||
    pathname.startsWith('/business-instructions') ||
    pathname.startsWith('/business-create') ||
    pathname.startsWith('/business-my-businesses');

  if (isAdminRoute) {
    if (!token || token.role !== 'ADMIN') {
      const url = new URL('/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  if (isBusinessOwnerRoute) {
    if (!token || token.role !== 'BUSINESS_OWNER') {
      const url = new URL('/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/' && token && token.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

