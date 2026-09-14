import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

/**
 * Timing-safe string comparison using fixed-length SHA-256 digests.
 * Completely eliminates side-channel timing attack vectors.
 */
function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Validates whether the incoming request is authorized for admin actions.
 * - Enforces header-only authentication in production (no secrets in query params)
 * - Uses timing-safe hash comparison
 * - Applies brute-force rate-limiting on failed attempts
 */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const ip = getClientIp(req);

  // Check brute-force lockout for this IP (max 20 failed admin requests per 5 minutes)
  const rateCheck = checkRateLimit(ip, {
    windowMs: 5 * 60 * 1000,
    maxRequests: 25,
    prefix: 'admin_failed',
  });

  if (!rateCheck.allowed) {
    console.warn(`[Security Alert] Admin brute-force rate limit exceeded from IP: ${ip}`);
    return false;
  }

  const secretKey = process.env.ADMIN_SECRET_KEY?.trim();

  // Extract from headers (preferred & secure)
  const headerKey = req.headers.get('x-admin-key')?.trim();
  const authHeader = req.headers.get('authorization')?.trim();
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  // Extract from query string ONLY during local development (never in production)
  let queryKey: string | null = null;
  if (process.env.NODE_ENV !== 'production') {
    try {
      const url = new URL(req.url);
      queryKey = url.searchParams.get('admin_key')?.trim() || null;
    } catch {
      queryKey = null;
    }
  }

  const providedKey = headerKey || bearerKey || queryKey;

  if (secretKey && secretKey.length > 0) {
    if (!providedKey) return false;
    const isAuthorized = secureCompare(providedKey, secretKey);
    return isAuthorized;
  }

  // Fail-closed: In production, lack of ADMIN_SECRET_KEY strictly denies all admin access
  if (process.env.NODE_ENV === 'production') {
    console.error('[Security Critical] ADMIN_SECRET_KEY is not configured in production environment variables.');
    return false;
  }

  // Fallback ONLY for local development when ADMIN_SECRET_KEY is omitted
  return process.env.NODE_ENV === 'development';
}
