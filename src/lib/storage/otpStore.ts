import crypto from 'crypto';

interface OtpRecord {
  phone: string;               // Normalized international phone
  otpHash: string;            // SHA-256 hash of 6-digit OTP
  plainOtpForDev?: string;    // Only retained in development/testing mode
  createdAt: number;          // ms
  expiresAt: number;          // ms (5 mins from creation)
  attempts: number;           // Failed verification attempts (max 3)
  lastSentAt: number;         // ms of last OTP dispatch
  hourlySendCount: number;    // Sends within the current hour
  windowStartedAt: number;    // Window start ms
}

// In-memory store for active OTPs (thread-safe within Node.js event loop)
const otpStore = new Map<string, OtpRecord>();

// Security configurations
const OTP_TTL_MS = 5 * 60 * 1000;         // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;     // 60 seconds
const MAX_ATTEMPTS = 3;                    // Lockout after 3 wrong attempts
const MAX_HOURLY_SENDS = 5;               // Max 5 OTPs per hour per phone
const HOURLY_WINDOW_MS = 60 * 60 * 1000;  // 1 hour

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export interface GenerateOtpResult {
  success: boolean;
  otp?: string;
  error?: string;
  cooldownSeconds?: number;
  expiresInSeconds?: number;
}

export interface VerifyOtpResult {
  success: boolean;
  error?: string;
  attemptsRemaining?: number;
}

/**
 * Generates and stores a secure 6-digit OTP for the given normalized phone number.
 */
export function generateOtp(phone: string): GenerateOtpResult {
  const now = Date.now();
  const existing = otpStore.get(phone);

  // 1. Check Resend Cooldown
  if (existing) {
    const elapsedSinceLast = now - existing.lastSentAt;
    if (elapsedSinceLast < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsedSinceLast) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSec} second${waitSec === 1 ? '' : 's'} before requesting a new code.`,
        cooldownSeconds: waitSec,
      };
    }

    // Check Hourly Rate Limit
    const windowElapsed = now - existing.windowStartedAt;
    if (windowElapsed < HOURLY_WINDOW_MS) {
      if (existing.hourlySendCount >= MAX_HOURLY_SENDS) {
        const resetMinutes = Math.ceil((HOURLY_WINDOW_MS - windowElapsed) / 60000);
        return {
          success: false,
          error: `Maximum verification attempts reached for this phone number. Please try again in ${resetMinutes} minutes or contact support on 091 225 0777.`,
        };
      }
    }
  }

  // 2. Generate random 6-digit OTP
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const otpHash = hashOtp(rawOtp);

  // Update or create record
  const windowStartedAt = existing && (now - existing.windowStartedAt < HOURLY_WINDOW_MS)
    ? existing.windowStartedAt
    : now;

  const hourlySendCount = existing && (now - existing.windowStartedAt < HOURLY_WINDOW_MS)
    ? existing.hourlySendCount + 1
    : 1;

  const record: OtpRecord = {
    phone,
    otpHash,
    plainOtpForDev: process.env.NODE_ENV !== 'production' ? rawOtp : undefined,
    createdAt: now,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: now,
    hourlySendCount,
    windowStartedAt,
  };

  otpStore.set(phone, record);

  // Masked logging in production, verbose in local development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[OTP Service Dev] Generated OTP for ${phone}: ${rawOtp} (expires in 5 mins)`);
  } else {
    console.log(
      `[OTP Service] Dispatched 6-digit OTP code to ${phone.slice(0, 5)}****${phone.slice(-2)} (expires in 5 mins)`
    );
  }

  return {
    success: true,
    otp: rawOtp,
    cooldownSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
    expiresInSeconds: Math.ceil(OTP_TTL_MS / 1000),
  };
}

/**
 * Verifies an entered OTP against the stored record.
 */
export function verifyOtp(phone: string, inputOtp: string): VerifyOtpResult {
  const now = Date.now();
  const record = otpStore.get(phone);

  if (!record) {
    return {
      success: false,
      error: 'No active verification code found for this phone number. Please request a new code.',
    };
  }

  // Check expiration
  if (now > record.expiresAt) {
    otpStore.delete(phone);
    return {
      success: false,
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  // Check attempt lockout
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return {
      success: false,
      error: 'Too many incorrect attempts. For your security, this code has been cancelled. Please request a new code.',
    };
  }

  // Clean input
  const cleanInput = (inputOtp || '').trim();
  const inputHash = hashOtp(cleanInput);

  // Timing-safe comparison
  const isMatch =
    inputHash.length === record.otpHash.length &&
    crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(record.otpHash));

  // Development-only test fallback (Strictly disallowed in production)
  const isDevTestOtp =
    process.env.NODE_ENV === 'development' &&
    process.env.ALLOW_DEV_TEST_OTP === 'true' &&
    cleanInput === '123456';

  if (isMatch || isDevTestOtp) {
    // Verified successfully: clear active OTP so it cannot be reused
    otpStore.delete(phone);
    return { success: true };
  } else {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;

    if (remaining <= 0) {
      otpStore.delete(phone);
      return {
        success: false,
        error: 'Incorrect code. Maximum attempts reached. Please request a new code.',
        attemptsRemaining: 0,
      };
    }

    return {
      success: false,
      error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      attemptsRemaining: remaining,
    };
  }
}

/**
 * Clears an OTP record manually.
 */
export function clearOtp(phone: string): void {
  otpStore.delete(phone);
}

// Periodic garbage collection to prevent memory leaks in serverless/long-running processes
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [phone, record] of otpStore.entries()) {
      if (now > record.expiresAt && now - record.windowStartedAt > HOURLY_WINDOW_MS) {
        otpStore.delete(phone);
      }
    }
  }, 60 * 1000);
  cleanupTimer.unref?.();
}
