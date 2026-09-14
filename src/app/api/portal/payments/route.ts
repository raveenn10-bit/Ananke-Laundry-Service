import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSessionFromRequest } from '@/lib/auth/phoneAuth';
import { getCustomerPayments, isZohoConfigured, findZohoCustomerByPhoneVariants } from '@/services/zoho';
import { ZohoPayment } from '@/types/zoho';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export async function GET(req: NextRequest) {
  // 1. IP Rate Limiting
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60 * 1000,
    maxRequests: 60,
    prefix: 'portal_payments_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please slow down.' },
      { status: 429 }
    );
  }

  // 2. Session Verification
  const session = getCustomerSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please verify your phone number first.' },
      { status: 401 }
    );
  }

  try {
    let payments: ZohoPayment[] = [];
    let customerId = session.customerId;

    if (isZohoConfigured()) {
      if (!customerId) {
        const contact = await findZohoCustomerByPhoneVariants([
          session.phone,
          session.localPhone,
          session.phone.replace(/[^0-9]/g, '').slice(-9),
        ]);
        if (contact?.contact_id) {
          customerId = contact.contact_id;
        }
      }

      if (customerId) {
        payments = await getCustomerPayments(customerId);
      }
    }

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error: any) {
    console.error('[API /api/portal/payments] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve payment receipts.' },
      { status: 500 }
    );
  }
}
