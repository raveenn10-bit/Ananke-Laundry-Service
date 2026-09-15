import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeSriLankanPhone,
  createCustomerSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from '@/lib/auth/phoneAuth';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';
import { findZohoInvoiceByNumber, getZohoCustomer, isZohoConfigured } from '@/services/zoho';

const GENERIC_ERROR_MESSAGE =
  "We couldn't find a matching bill with those details. Please double-check your Invoice Number (e.g., INV-000123) and Phone Number, or contact our support team on WhatsApp.";

export async function POST(req: NextRequest) {
  // 1. Sliding Window IP Rate Limiting (10 attempts / min to prevent enumeration/brute-force)
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60 * 1000,
    maxRequests: 10,
    prefix: 'portal_lookup_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: 'Too many lookup attempts. Please wait a few moments before trying again.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetSeconds || 60),
        },
      }
    );
  }

  // 2. Parse & Validate Payload
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON request.' }, { status: 400 });
  }

  const invoiceNumber = (body.invoiceNumber || '').trim();
  const rawPhone = (body.phone || '').trim();

  if (!invoiceNumber) {
    return NextResponse.json(
      { success: false, message: 'Please enter your Invoice Number (e.g. INV-000123).' },
      { status: 400 }
    );
  }

  if (!rawPhone) {
    return NextResponse.json(
      { success: false, message: 'Please enter your Phone or WhatsApp number.' },
      { status: 400 }
    );
  }

  // 3. Strict Phone Normalization (+947XXXXXXXX and local 07XXXXXXXX)
  const normPhone = normalizeSriLankanPhone(rawPhone);
  if (!normPhone.isValid) {
    return NextResponse.json(
      {
        success: false,
        message: normPhone.error || 'Please enter a valid Sri Lankan phone number (e.g. 077 123 4567).',
      },
      { status: 400 }
    );
  }

  try {
    // 4. Look up Invoice in Zoho Books
    const invoice = await findZohoInvoiceByNumber(invoiceNumber);
    if (!invoice) {
      return NextResponse.json({ success: false, message: GENERIC_ERROR_MESSAGE }, { status: 404 });
    }

    // 5. Verify Customer Phone Match
    let phoneMatched = false;
    let customerName = invoice.customer_name || 'Valued Customer';
    let customerId = invoice.customer_id;

    if (isZohoConfigured() && customerId && !customerId.startsWith('mock-')) {
      const contact = await getZohoCustomer(customerId);
      if (contact) {
        customerName = contact.contact_name || contact.company_name || customerName;
        const candidatePhones = [
          contact.phone,
          contact.mobile,
          ...(contact.contact_persons || []).map((cp: any) => cp.phone || cp.mobile),
        ]
          .filter(Boolean)
          .map((p) => String(p).replace(/[^0-9]/g, ''));

        // Check if any contact phone has matching 9-digit suffix
        const inputDigits = normPhone.digits; // e.g. 771234567
        phoneMatched = candidatePhones.some(
          (cp) => cp.endsWith(inputDigits) || cp.includes(inputDigits) || inputDigits.endsWith(cp.slice(-9))
        );
      }
    } else {
      // Demo / Mock Mode matching: match if mock invoice exists
      // Mock invoices: ANK-1042, ANK-1038, ANK-1025
      phoneMatched = true;
    }

    if (!phoneMatched) {
      console.warn(
        `[Portal Security Alert] Phone number mismatch for invoice ${invoice.invoice_number}. Target ID: ${customerId}`
      );
      return NextResponse.json({ success: false, message: GENERIC_ERROR_MESSAGE }, { status: 404 });
    }

    // 6. Issue Short-Lived Signed HMAC Session Token
    const sessionToken = createCustomerSessionToken({
      phone: normPhone.international,
      localPhone: normPhone.local,
      customerId,
      customerName,
      authorizedInvoiceId: invoice.invoice_id,
      authorizedInvoiceNumber: invoice.invoice_number,
    });

    // 7. Build Response with Signed Session Cookie & JSON Payload
    const response = NextResponse.json({
      success: true,
      token: sessionToken,
      customer: {
        name: customerName,
        phone: normPhone.international,
        localPhone: normPhone.local,
        customerId,
      },
      invoice,
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    });

    return response;
  } catch (err: any) {
    console.error('[API /api/portal/lookup] Unexpected failure:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Service is temporarily unavailable. Please try again or call 091 225 0777.',
      },
      { status: 500 }
    );
  }
}
