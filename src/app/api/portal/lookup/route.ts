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
  const customerNameInput = (body.customerName || body.name || '').trim();
  const rawPhone = (body.phone || '').trim();

  if (!invoiceNumber) {
    return NextResponse.json(
      { success: false, message: 'Please enter your Invoice Number (e.g. 002018 or INV-002018).' },
      { status: 400 }
    );
  }

  if (!customerNameInput && !rawPhone) {
    return NextResponse.json(
      { success: false, message: 'Please enter your Customer Name as registered on your invoice.' },
      { status: 400 }
    );
  }

  // Optional Phone Normalization if phone is provided
  let normPhone = rawPhone ? normalizeSriLankanPhone(rawPhone) : null;

  try {
    // 3. Look up Invoice in Zoho Books
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

    // 4. Verify Customer Name & Contact Match
    let verifiedCustomerName = invoice.customer_name || customerNameInput || 'Valued Customer';
    let customerId = invoice.customer_id;
    let nameMatched = false;
    let phoneMatched = false;

    const candidateNames: (string | undefined | null)[] = [
      invoice.customer_name,
      customerNameInput,
    ];

    if (isZohoConfigured() && customerId && !customerId.startsWith('mock-')) {
      const contact = await getZohoCustomer(customerId);
      if (contact) {
        verifiedCustomerName = contact.contact_name || contact.company_name || verifiedCustomerName;
        candidateNames.push(contact.contact_name, contact.company_name);
        if (contact.contact_persons) {
          contact.contact_persons.forEach((cp: any) => {
            if (cp.first_name || cp.last_name) {
              candidateNames.push(`${cp.first_name || ''} ${cp.last_name || ''}`);
            }
          });
        }

        // Phone matching check if phone provided
        if (normPhone && normPhone.isValid) {
          const candidatePhones = [
            contact.phone,
            contact.mobile,
            ...(contact.contact_persons || []).map((cp: any) => cp.phone || cp.mobile),
          ]
            .filter(Boolean)
            .map((p) => String(p).replace(/[^0-9]/g, ''));

          const inputDigits = normPhone.digits;
          const inputSuffix7 = inputDigits.slice(-7);

          phoneMatched = candidatePhones.some((cp) => {
            if (!cp) return false;
            return (
              cp.endsWith(inputDigits) ||
              cp.includes(inputDigits) ||
              inputDigits.endsWith(cp.slice(-9)) ||
              (cp.length >= 7 && (cp.endsWith(inputSuffix7) || inputDigits.endsWith(cp.slice(-7))))
            );
          });
        }
      }
    }

    if (customerNameInput) {
      nameMatched = isNameMatching(customerNameInput, candidateNames);
    } else {
      nameMatched = true;
    }

    // Pass if either Customer Name matches OR Phone matches (or in mock demo mode)
    const isAuthorized = nameMatched || phoneMatched || !isZohoConfigured() || (customerId && customerId.startsWith('mock-'));

    if (!isAuthorized) {
      console.warn(
        `[Portal Security Alert] Customer name mismatch for invoice ${invoice.invoice_number}. Input: '${customerNameInput}', Invoice Name: '${invoice.customer_name}'`
      );
      return NextResponse.json(
        {
          success: false,
          message: `The customer name '${customerNameInput}' doesn't match our records for invoice #${invoice.invoice_number}. Please check the name on your receipt or contact support.`,
        },
        { status: 404 }
      );
    }

    // 5. Issue Short-Lived Signed HMAC Session Token
    const sessionToken = createCustomerSessionToken({
      phone: normPhone?.international || 'N/A',
      localPhone: normPhone?.local || 'N/A',
      customerId,
      customerName: verifiedCustomerName,
      authorizedInvoiceId: invoice.invoice_id,
      authorizedInvoiceNumber: invoice.invoice_number,
    });

    // 6. Build Response with Signed Session Cookie & JSON Payload
    const response = NextResponse.json({
      success: true,
      token: sessionToken,
      customer: {
        name: verifiedCustomerName,
        phone: normPhone?.international || 'N/A',
        localPhone: normPhone?.local || 'N/A',
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

