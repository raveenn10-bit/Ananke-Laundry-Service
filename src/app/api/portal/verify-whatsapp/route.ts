import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';
import { verifyCustomerInvoiceOwnership } from '@/services/notifications/whatsappService';

/**
 * API Route: Verify customer WhatsApp number and Invoice against Zoho Books.
 * Dispatches/returns the exact finalized WhatsApp customer message upon successful verification.
 */
export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (15 attempts / min)
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60 * 1000,
    maxRequests: 15,
    prefix: 'verify_whatsapp_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: 'Too many verification attempts. Please wait a few moments before trying again.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetSeconds || 60),
        },
      }
    );
  }

  // 2. Parse request body
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, verified: false, message: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  const phone = (body.phone || body.whatsapp || '').trim();
  const invoiceNumber = (body.invoiceNumber || body.invoice || '').trim();

  if (!phone || !invoiceNumber) {
    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: 'Both WhatsApp number and Invoice number are required for verification.',
      },
      { status: 400 }
    );
  }

  try {
    // 3. Perform Zoho Books ownership verification
    const host = req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = host ? `${proto}://${host}` : undefined;

    const result = await verifyCustomerInvoiceOwnership(phone, invoiceNumber, baseUrl);

    if (!result.verified) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          message: result.error || 'Verification failed. WhatsApp number does not match this invoice.',
        },
        { status: 403 }
      );
    }

    // 4. Return strictly customer-facing verified payload (Never expose internal Zoho IDs or tokens)
    return NextResponse.json({
      success: true,
      verified: true,
      customerName: result.customerName,
      invoiceNumber: result.invoiceNumber,
      myBillLink: result.myBillLink,
      messageText: result.messageText,
      whatsappUrl: result.whatsappUrl,
      phone: result.phone,
    });
  } catch (error: any) {
    console.error('[API /api/portal/verify-whatsapp] Error:', error);
    return NextResponse.json(
      {
        success: false,
        verified: false,
        message: 'Verification service error. Please try again or contact 091 225 0777.',
      },
      { status: 500 }
    );
  }
}
