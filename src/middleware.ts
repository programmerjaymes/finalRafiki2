import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { BUSINESS_CREATE_PATH } from './lib/registerBusiness';

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
  const roles = Array.isArray(token?.roles) ? token.roles as string[] : token?.role ? [token.role as string] : [];
  const hasRole = (role: string) => roles.includes(role);

  const isPublicBusinessDetails =
    /^\/businesses\/[^/]+$/.test(pathname) &&
    pathname !== '/businesses/pending';
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/nearby') ||
    isPublicBusinessDetails ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/error-404') ||
    pathname.startsWith('/account/privacy');

  // Deny by default: if route is not explicitly public, login is required.
  if (!isPublicRoute && !token) {
    if (pathname.startsWith('/business-create')) {
      const url = new URL('/signup', request.url);
      url.searchParams.set('callbackUrl', BUSINESS_CREATE_PATH);
      return NextResponse.redirect(url);
    }

    const url = new URL('/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  if (token && hasRole('BUSINESS_OWNER') && !hasRole('AGENT') && !hasRole('ADMIN')) {
    const isAlreadyOnBusinessRoute =
      pathname.startsWith('/business-dashboard') ||
      pathname.startsWith('/business-instructions') ||
      pathname.startsWith('/business-create') ||
      pathname.startsWith('/business-my-businesses') ||
      pathname.startsWith('/businessowner-dashboard') ||
      pathname.startsWith('/account');

    const isPublicConsumerRoute =
      pathname.startsWith('/search') ||
      pathname.startsWith('/nearby') ||
      pathname.startsWith('/terms') ||
      pathname.startsWith('/privacy') ||
      isPublicBusinessDetails;

    if (
      pathname === '/' ||
      (!isAlreadyOnBusinessRoute && !isPublicConsumerRoute && !pathname.startsWith('/api/'))
    ) {
      return NextResponse.redirect(
        new URL('/business-dashboard', request.url)
      );
    }
  }

  const isAdminRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/agents') ||
    pathname === '/businesses' ||
    pathname === '/businesses/pending' ||
    pathname === '/businesses/approval-logs' ||
    pathname.startsWith('/bundles') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/app-expenses') ||
    pathname.startsWith('/sms') ||
    pathname.startsWith('/system-logs') ||
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

  if (pathname.startsWith('/agent-dashboard') && !hasRole('AGENT')) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (isAdminRoute) {
    if (!token || !hasRole('ADMIN')) {
      const url = new URL('/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  if (isBusinessOwnerRoute) {
    if (!token || !hasRole('BUSINESS_OWNER')) {
      if (!token && pathname.startsWith('/business-create')) {
        const url = new URL('/signup', request.url);
        url.searchParams.set('callbackUrl', BUSINESS_CREATE_PATH);
        return NextResponse.redirect(url);
      }
      const url = new URL('/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  if (pathname === '/' && token && hasRole('ADMIN')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
