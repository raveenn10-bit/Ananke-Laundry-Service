import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/zoho/test',
    '/api/zoho/connect',
  ],
};

const ADMIN_COOKIE_NAME = 'ananke_admin_session';

/**
 * Next.js Edge Security Middleware
 * Completely seals off sensitive backend APIs and Zoho internal endpoints.
 * Unauthenticated requests receive a generic 404 Not Found to prevent endpoint discovery.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow login endpoint to process authentication requests
  if (pathname === '/api/admin/auth') {
    return NextResponse.next();
  }

  // 2. Check for Admin Cookie or Header
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const adminHeader = req.headers.get('x-admin-key')?.trim();
  const authHeader = req.headers.get('authorization')?.trim();

  // Basic presence check at the edge; route handlers perform deep timing-safe HMAC validation
  const hasCredential = Boolean(adminCookie || adminHeader || authHeader);

  if (!hasCredential) {
    // Return 404 Not Found so attackers and scanners cannot detect that the endpoint exists
    return new NextResponse(
      JSON.stringify({ error: 'Not Found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }

  return NextResponse.next();
}
