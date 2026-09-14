import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeSriLankanPhone,
  createCustomerSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from '@/lib/auth/phoneAuth';
import { verifyOtp } from '@/lib/storage/otpStore';
import { findZohoCustomerByPhoneVariants, isZohoConfigured } from '@/services/zoho';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone: rawPhone, otp } = body;

    if (!rawPhone || typeof rawPhone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Phone number is required.' },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please enter the 6-digit verification code.' },
        { status: 400 }
      );
    }

    const normalized = normalizeSriLankanPhone(rawPhone);
    if (!normalized.isValid) {
      return NextResponse.json(
        { success: false, message: normalized.error || 'Invalid phone number.' },
        { status: 400 }
      );
    }

    // Verify OTP
    const verification = verifyOtp(normalized.international, otp.trim());
    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          message: verification.error || 'Invalid verification code.',
          attemptsRemaining: verification.attemptsRemaining,
        },
        { status: 401 }
      );
    }

    // Find matching Zoho customer if Zoho Books is configured
    let customerId: string | null = null;
    let customerName = 'Valued Customer';

    if (isZohoConfigured()) {
      try {
        const contact = await findZohoCustomerByPhoneVariants([
          normalized.international,
          normalized.local,
          normalized.digits,
        ]);
        if (contact && contact.contact_id) {
          customerId = contact.contact_id;
          customerName = contact.contact_name || contact.company_name || 'Valued Customer';
        }
      } catch (err: any) {
        console.warn('[Zoho Contact Lookup] Search failed, proceeding with phone identity:', err.message);
      }
    }

    // Issue signed session token
    const token = createCustomerSessionToken({
      phone: normalized.international,
      localPhone: normalized.local,
      customerId,
      customerName,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Phone verified successfully.',
      token,
      customer: {
        name: customerName,
        phone: normalized.international,
        localPhone: normalized.local,
        formatted: normalized.formatted,
        customerId,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });

    return response;
  } catch (error: any) {
    console.error('[API /api/otp/verify] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
