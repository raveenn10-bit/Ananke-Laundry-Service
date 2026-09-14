import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number; // ms
}

// In-memory IP tracking store (sliding window)
const ipStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipStore.entries()) {
    if (now > record.resetTime) {
      ipStore.delete(key);
    }
  }
}, 60 * 1000);

export function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return '127.0.0.1';
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  prefix?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  keyIdentifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = `${options.prefix || 'rl'}:${keyIdentifier}`;
  const record = ipStore.get(key);

  if (!record || now > record.resetTime) {
    ipStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (record.count >= options.maxRequests) {
    const resetSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetSeconds: Math.ceil((record.resetTime - now) / 1000),
  };
}
