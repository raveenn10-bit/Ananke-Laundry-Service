import { NextRequest, NextResponse } from 'next/server';
import {
  isAuthorizedAdmin,
  validateAdminPasscode,
  createAdminSessionToken,
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
} from '@/lib/auth/adminAuth';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authorized = isAuthorizedAdmin(req);
  return NextResponse.json(
    { authenticated: authorized },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Strict brute-force protection: max 5 login attempts in production, 100 in development
  const maxAttempts = process.env.NODE_ENV === 'production' ? 5 : 100;
  const rateLimit = checkRateLimit(ip, {
    windowMs: 15 * 60 * 1000,
    maxRequests: maxAttempts,
    prefix: 'admin_login_strict',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many attempts. Locked out for 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const username = (body.username || '').trim();
    const password = (body.password || body.key || '').trim();

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // If username is provided, enforce username === 'admin'
    if (username && username.toLowerCase() !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const isValid = validateAdminPasscode(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password.' },
        { status: 401 }
      );
    }

    const sessionToken = createAdminSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.',
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/admin/auth] POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json(
    {
      success: true,
      message: 'Admin session terminated.',
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
      },
    }
  );

  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
