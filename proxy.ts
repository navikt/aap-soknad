import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { isMock } from 'utils/environments';

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ['/api/internal/', '/oauth2/'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip basePath prefix if present (middleware runs on raw paths)
  const strippedPath = pathname.startsWith('/aap/soknad')
    ? pathname.slice('/aap/soknad'.length) || '/'
    : pathname;

  if (!isPublicPath(strippedPath) && !isApiPath(strippedPath) && !isMock()) {
    const bearerToken = request.headers.get('authorization');
    if (!bearerToken) {
      const loginUrl = new URL('/oauth2/login', request.url);
      loginUrl.searchParams.set('redirect', '/aap/soknad');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Let next-intl handle locale routing for non-API paths
  if (!isApiPath(strippedPath)) {
    return intlMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(nb|nn)/:path*'],
};
