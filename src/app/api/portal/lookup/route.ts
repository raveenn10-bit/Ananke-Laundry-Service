import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeSriLankanPhone,
  createCustomerSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
} from '@/lib/auth/phoneAuth';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';
import { findZohoInvoiceByNumber, getZohoCustomer, isZohoConfigured } from '@/services/zoho';

function isNameMatching(inputName: string, candidateNames: (string | undefined | null)[]): boolean {
  const cleanInput = inputName.trim().toLowerCase();
  if (!cleanInput) return true;

  const inputWords = cleanInput.split(/\s+/).filter((w) => w.length >= 2);

  for (const rawCandidate of candidateNames) {
    if (!rawCandidate) continue;
    const cleanCand = String(rawCandidate).trim().toLowerCase();
    if (!cleanCand) continue;

    // Exact or substring match
    if (cleanCand.includes(cleanInput) || cleanInput.includes(cleanCand)) {
      return true;
    }

    // Word-by-word overlap match
    const candWords = cleanCand.split(/\s+/).filter((w) => w.length >= 2);
    const hasWordOverlap = inputWords.some((iw) =>
      candWords.some((cw) => cw.includes(iw) || iw.includes(cw))
    );
    if (hasWordOverlap) {
      return true;
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  // 1. Sliding Window IP Rate Limiting (15 attempts / min)
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60 * 1000,
    maxRequests: 15,
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

  if (!invoiceNumber) {
    return NextResponse.json(
      { success: false, message: 'Please enter your Invoice Number (e.g. 002018 or INV-002018).' },
      { status: 400 }
    );
  }

  try {
    // 3. Look up Invoice in Zoho Books (supports 6-digit numeric, INV-*, ANK-* formats)
    const invoice = await findZohoInvoiceByNumber(invoiceNumber);
    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          message: `We couldn't find an invoice matching '${invoiceNumber}'. Please double-check your invoice number (e.g., 002018 or INV-002018).`,
        },
        { status: 404 }
      );
    }

    const verifiedCustomerName = invoice.customer_name || 'Valued Customer';
    const customerId = invoice.customer_id;

    // 4. Issue Short-Lived Signed HMAC Session Token
    const sessionToken = createCustomerSessionToken({
      phone: 'N/A',
      localPhone: 'N/A',
      customerId,
      customerName: verifiedCustomerName,
      authorizedInvoiceId: invoice.invoice_id,
      authorizedInvoiceNumber: invoice.invoice_number,
    });

    // 5. Build Response with Signed Session Cookie & JSON Payload
    const response = NextResponse.json({
      success: true,
      token: sessionToken,
      customer: {
        name: verifiedCustomerName,
        phone: 'N/A',
        localPhone: 'N/A',
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

