import crypto from 'crypto';

/**
 * Sri Lankan Phone Number Normalization & Validation
 */

export interface NormalizedPhone {
  isValid: boolean;
  raw: string;
  international: string; // e.g. +94771234567
  local: string;         // e.g. 0771234567
  digits: string;        // e.g. 771234567 (9 digits without leading 0 or +94)
  type: 'mobile' | 'fixed' | 'unknown';
  formatted: string;     // e.g. +94 77 123 4567
  error?: string;
}

// Valid Sri Lankan mobile prefixes (after country code/leading zero)
const SL_MOBILE_PREFIXES = ['70', '71', '72', '74', '75', '76', '77', '78'];

// Valid Sri Lankan geographic landline prefixes
const SL_FIXED_PREFIXES = [
  '11', '21', '23', '24', '25', '26', '27',
  '31', '32', '33', '34', '35', '36', '37', '38',
  '41', '45', '47', '51', '52', '54', '55', '57',
  '63', '65', '66', '67', '81', '91',
];

export function normalizeSriLankanPhone(input: string): NormalizedPhone {
  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      raw: '',
      international: '',
      local: '',
      digits: '',
      type: 'unknown',
      formatted: '',
      error: 'Phone number is required.',
    };
  }

  // Remove spaces, hyphens, dots, parentheses
  let cleaned = input.trim().replace(/[\s\-\.\(\)]/g, '');

  // Handle various prefixes
  let digits = cleaned;
  if (digits.startsWith('+94')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('0094')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('94') && digits.length === 11) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1);
  }

  // Digits should now be exactly 9 digits
  if (!/^\d{9}$/.test(digits)) {
    return {
      isValid: false,
      raw: input,
      international: '',
      local: '',
      digits: '',
      type: 'unknown',
      formatted: '',
      error: 'Please enter a valid 10-digit Sri Lankan phone number (e.g. 077 123 4567 or +94 77 123 4567).',
    };
  }

  const prefix2 = digits.slice(0, 2);
  let type: 'mobile' | 'fixed' | 'unknown' = 'unknown';

  if (SL_MOBILE_PREFIXES.includes(prefix2)) {
    type = 'mobile';
  } else if (SL_FIXED_PREFIXES.includes(prefix2)) {
    type = 'fixed';
  } else {
    return {
      isValid: false,
      raw: input,
      international: '',
      local: '',
      digits: '',
      type: 'unknown',
      formatted: '',
      error: `Invalid Sri Lankan area/mobile prefix '0${prefix2}'. Expected mobile (07X) or landline (e.g. 091, 011).`,
    };
  }

  const international = `+94${digits}`;
  const local = `0${digits}`;
  const formatted = `+94 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;

  return {
    isValid: true,
    raw: input,
    international,
    local,
    digits,
    type,
    formatted,
  };
}

/**
 * Session Token Authentication (HMAC-SHA256)
 * Secure, stateless, tamper-proof session tokens for customer portal.
 */

export interface CustomerSession {
  phone: string;            // Normalized international phone (+947XXXXXXXX)
  localPhone: string;       // Normalized local phone (07XXXXXXXX)
  customerId?: string | null;
  customerName?: string | null;
  issuedAt: number;         // ms
  expiresAt: number;        // ms
}

const SESSION_COOKIE_NAME = 'ananke_portal_session';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

let ephemeralInstanceSecret: string | null = null;

function getSigningSecret(): string {
  const configured =
    process.env.SESSION_SECRET?.trim() ||
    process.env.ADMIN_SECRET_KEY?.trim() ||
    process.env.ZOHO_CLIENT_SECRET?.trim();

  if (configured && configured.length >= 16) {
    return configured;
  }

  // In production, generate an ephemeral cryptographically random key if unconfigured
  // to strictly prevent token forgery attacks using public repository source code
  if (process.env.NODE_ENV === 'production') {
    if (!ephemeralInstanceSecret) {
      ephemeralInstanceSecret = crypto.randomBytes(32).toString('hex');
      console.warn(
        '[Security Notice] No dedicated SESSION_SECRET or ADMIN_SECRET_KEY configured in production environment. Generated isolated ephemeral server secret.'
      );
    }
    return ephemeralInstanceSecret;
  }

  return 'ananke-laundry-portal-secret-key-dev-only-unawatuna-2026';
}

/**
 * Creates a signed session token.
 */
export function createCustomerSessionToken(session: Omit<CustomerSession, 'issuedAt' | 'expiresAt'>): string {
  const now = Date.now();
  const payload: CustomerSession = {
    ...session,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies and decodes a customer session token.
 */
export function verifyCustomerSessionToken(token?: string | null): CustomerSession | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  // Verify signature using timing-safe comparison
  const expectedSignature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const session: CustomerSession = JSON.parse(payloadJson);

    // Check expiration
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Extracts session from Next.js request cookies or Authorization header.
 */
export function getCustomerSessionFromRequest(req: Request): CustomerSession | null {
  // 1. Check Authorization header
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const session = verifyCustomerSessionToken(token);
    if (session) return session;
  }

  // 2. Check Cookie header
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );

    const token = cookies[SESSION_COOKIE_NAME];
    if (token) {
      return verifyCustomerSessionToken(token);
    }
  }

  return null;
}

export { SESSION_COOKIE_NAME, SESSION_TTL_MS };
