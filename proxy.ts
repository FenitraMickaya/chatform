import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection for the workspace.
 *
 * The middleware only checks that a session cookie is present — the real
 * verification happens server-side on every API call and in the pages
 * themselves. It exists to send signed-out visitors to the login screen
 * instead of rendering an empty dashboard.
 */
const PROTECTED_PREFIXES = ['/dashboard', '/forms'];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) return NextResponse.next();

  const hasSession = Boolean(request.cookies.get('fp_session')?.value);
  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/dashboard/:path*', '/forms/:path*'],
};
