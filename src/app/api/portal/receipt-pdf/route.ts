import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSessionFromRequest } from '@/lib/auth/phoneAuth';
import {
  getAuthorizedCustomerPayment,
  downloadReceiptPdf,
  isZohoConfigured,
  findZohoCustomerByPhoneVariants,
} from '@/services/zoho';
import { ZohoPayment } from '@/types/zoho';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export async function GET(req: NextRequest) {
  // 1. IP Rate Limiting (Resource exhaustion protection for PDF generation)
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60 * 1000,
    maxRequests: 30,
    prefix: 'portal_receipt_pdf_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many receipt download requests. Please wait a moment.' },
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

  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get('id')?.trim();

  if (!paymentId) {
    return NextResponse.json(
      { success: false, message: 'Payment ID is required.' },
      { status: 400 }
    );
  }

  try {
    let payment: ZohoPayment | null = null;
    let expectedCustomerId = session.customerId;

    if (isZohoConfigured()) {
      if (!expectedCustomerId) {
        const contact = await findZohoCustomerByPhoneVariants([
          session.phone,
          session.localPhone,
        ]);
        if (contact?.contact_id) {
          expectedCustomerId = contact.contact_id;
        }
      }

      // In production with Zoho active, mock payment receipts are strictly disallowed
      if (paymentId.startsWith('mock-')) {
        return NextResponse.json(
          { success: false, message: 'Payment receipt not found or access denied.' },
          { status: 404 }
        );
      }

      if (!expectedCustomerId) {
        return NextResponse.json(
          { success: false, message: 'No registered customer account found for your verified phone.' },
          { status: 403 }
        );
      }

      // Multi-Tenant Authorization Check for live Zoho records
      payment = await getAuthorizedCustomerPayment(paymentId, expectedCustomerId);
    } else {
      // Demo mode ONLY when Zoho Books is not configured
      expectedCustomerId = expectedCustomerId || 'mock-cust-1';

      if (paymentId.startsWith('mock-')) {
        payment = {
          payment_id: paymentId,
          payment_number: paymentId.includes('1042') ? 'REC-2026-089' : 'REC-2026-081',
          customer_id: expectedCustomerId,
          customer_name: session.customerName || 'Valued Customer',
          date: paymentId.includes('1042') ? '2026-09-12' : '2026-09-09',
          payment_mode: paymentId.includes('1042') ? 'Cash on Collection' : 'Bank Transfer',
          amount: paymentId.includes('1042') ? 4500 : 4000,
          reference_number: paymentId.includes('1042') ? 'CASH-COLLECT-089' : 'BOC-TXN-98214',
          invoice_numbers: paymentId.includes('1042') ? 'ANK-1042' : 'ANK-1038',
        };
      }
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment receipt not found or access denied.' },
        { status: 404 }
      );
    }

    // 3. Download / Stream Receipt PDF
    const { buffer, filename, contentType } = await downloadReceiptPdf(payment);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[API /api/portal/receipt-pdf] Error:', error.message);
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You do not have permission to access this receipt.' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to generate receipt PDF. Please contact 091 225 0777.' },
      { status: 500 }
    );
  }
}
