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
        ]);
        if (contact?.contact_id) {
          customerId = contact.contact_id;
        }
      }

      if (customerId) {
        payments = await getCustomerPayments(customerId);
      }
    } else {
      // Demo mode ONLY when Zoho Books credentials are not yet configured
      payments = [
        {
          payment_id: 'mock-pay-1042',
          payment_number: 'REC-2026-089',
          customer_id: session.customerId || 'mock-cust-1',
          customer_name: session.customerName || 'Valued Customer',
          date: '2026-09-12',
          payment_mode: 'Cash on Collection',
          amount: 4500,
          reference_number: 'CASH-COLLECT-089',
          invoice_numbers: 'ANK-1042',
          invoice_id: 'mock-inv-1042',
          description: 'Payment for Invoice #ANK-1042 (Commercial Hotel Linen Care)',
        },
        {
          payment_id: 'mock-pay-1038',
          payment_number: 'REC-2026-081',
          customer_id: session.customerId || 'mock-cust-1',
          customer_name: session.customerName || 'Valued Customer',
          date: '2026-09-09',
          payment_mode: 'Bank Transfer (Commercial Account)',
          amount: 4000,
          reference_number: 'BOC-TXN-98214',
          invoice_numbers: 'ANK-1038',
          invoice_id: 'mock-inv-1038',
          description: 'Advance payment for Invoice #ANK-1038 (Villa Bedding)',
        },
      ];
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
