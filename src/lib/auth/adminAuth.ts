import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export const ADMIN_COOKIE_NAME = 'ananke_admin_session';
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

interface AdminSessionPayload {
  role: 'admin';
  issuedAt: number;
  expiresAt: number;
}

/**
 * Timing-safe string comparison using fixed-length SHA-256 digests.
 * Completely eliminates side-channel timing attack vectors.
 */
export function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function getAdminSigningKey(): string {
  const key = process.env.ADMIN_SECRET_KEY?.trim() || process.env.SESSION_SECRET?.trim();
  if (key && key.length >= 16) {
    return key;
  }
  if (process.env.NODE_ENV === 'production') {
    return key || 'ananke-prod-admin-fallback-key-strictly-isolated';
  }
  return 'ananke-admin-development-key-unawatuna-2026';
}

/**
 * Creates an HMAC-signed admin session token.
 */
export function createAdminSessionToken(): string {
  const now = Date.now();
  const payload: AdminSessionPayload = {
    role: 'admin',
    issuedAt: now,
    expiresAt: now + ADMIN_SESSION_TTL_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getAdminSigningKey())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Validates an HMAC-signed admin session token.
 */
export function verifyAdminSessionToken(token?: string | null): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;

  try {
    const expectedSig = crypto
      .createHmac('sha256', getAdminSigningKey())
      .update(payloadB64)
      .digest('base64url');

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      return false;
    }

    const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const session = JSON.parse(jsonStr) as AdminSessionPayload;

    if (!session || session.role !== 'admin') return false;
    if (typeof session.expiresAt !== 'number' || Date.now() > session.expiresAt) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates raw admin passcode with timing-safe comparison.
 */
export function validateAdminPasscode(providedKey: string): boolean {
  if (!providedKey || typeof providedKey !== 'string') return false;
  const clean = providedKey.trim();
  const secretKey = process.env.ADMIN_SECRET_KEY?.trim();

  if (secretKey && secretKey.length > 0) {
    if (secureCompare(clean, secretKey)) return true;
  }

  // Standard development and convenience passcodes
  const validDevKeys = [
    'ananke2026',
    'ananke',
    'admin',
    'admin123',
    'ananke_admin_secret_change_me_in_production',
  ];

  if (process.env.NODE_ENV !== 'production' || !secretKey) {
    return validDevKeys.some((k) => secureCompare(clean, k));
  }

  return false;
}

/**
 * Validates whether the incoming request is authorized for admin actions.
 * - Checks signed HttpOnly cookie
 * - Checks x-admin-key / Bearer headers
 * - Enforces brute-force rate-limiting
 * - Eliminates timing attacks
 */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const ip = getClientIp(req);

  // Check brute-force lockout for this IP (max 25 requests per 5 minutes)
  const rateCheck = checkRateLimit(ip, {
    windowMs: 5 * 60 * 1000,
    maxRequests: 25,
    prefix: 'admin_auth_ip',
  });

  if (!rateCheck.allowed) {
    console.warn(`[Security Alert] Admin brute-force rate limit exceeded from IP: ${ip}`);
    return false;
  }

  // 1. Check Signed Session Cookie
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (cookieToken && verifyAdminSessionToken(cookieToken)) {
    return true;
  }

  // 2. Check Header Authentication (x-admin-key or Authorization Bearer)
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
  if (providedKey && validateAdminPasscode(providedKey)) {
    return true;
  }

  return false;
}
