import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, decodeSession } from '@/lib/session';

export function proxy(request: NextRequest) {
  // Only page loads are redirected. Redirecting a POST turns a form submission
  // into a confusing error, so those requests go straight through.
  if (request.method !== 'GET') {
    return NextResponse.next();
  }

  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
