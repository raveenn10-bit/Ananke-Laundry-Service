import { NextRequest, NextResponse } from 'next/server';
import { normalizeSriLankanPhone } from '@/lib/auth/phoneAuth';
import { generateOtp } from '@/lib/storage/otpStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawPhone = body?.phone;

    if (!rawPhone || typeof rawPhone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please enter your phone number.' },
        { status: 400 }
      );
    }

    const normalized = normalizeSriLankanPhone(rawPhone);
    if (!normalized.isValid) {
      return NextResponse.json(
        { success: false, message: normalized.error || 'Invalid phone number format.' },
        { status: 400 }
      );
    }

    const otpResult = generateOtp(normalized.international);
    if (!otpResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: otpResult.error || 'Failed to send verification code.',
          cooldownSeconds: otpResult.cooldownSeconds,
        },
        { status: 429 }
      );
    }

    // Mask phone for privacy in UI feedback (e.g. 077 *** *567)
    const digits = normalized.digits;
    const masked = `0${digits.slice(0, 2)} *** *${digits.slice(6)}`;

    // In production without SMS gateway, or in staging/dev, provide devHint for seamless testing
    const devHint = otpResult.otp;

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${masked}`,
      phone: normalized.international,
      localPhone: normalized.local,
      formatted: normalized.formatted,
      cooldownSeconds: otpResult.cooldownSeconds,
      expiresInSeconds: otpResult.expiresInSeconds,
      devHint: process.env.NODE_ENV !== 'production' || !process.env.SMS_GATEWAY_API_KEY ? devHint : undefined,
    });
  } catch (error: any) {
    console.error('[API /api/otp/send] Error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
