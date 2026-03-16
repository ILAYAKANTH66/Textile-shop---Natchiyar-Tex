import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin page guard ────────────────────────────────────────────────────────
  // Redirect browser navigations to the login page if there's no admin cookie.
  // API routes are verified inside the handler (JWT signature check).
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login')
  ) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run on /admin pages — API endpoint auth is handled inside the route handlers.
  matcher: ['/admin/:path*'],
};

