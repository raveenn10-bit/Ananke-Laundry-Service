import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSessionFromRequest } from '@/lib/auth/phoneAuth';
import {
  getCustomerInvoices,
  findZohoCustomerByPhoneVariants,
  isZohoConfigured,
} from '@/services/zoho';
import { ZohoInvoice } from '@/types/zoho';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

/**
 * Customer Portal - Secure Invoices Endpoint
 * Strictly requires authenticated customer session token.
 * Never exposes one customer's records to another.
 */
export async function GET(req: NextRequest) {
  // 1. IP Rate Limiting (Protection against automated scraping / DoS)
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60 * 1000,
    maxRequests: 60,
    prefix: 'portal_invoices_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Please slow down.' },
      { status: 429 }
    );
  }

  // 2. Enforce Server-Side Session Authentication
  const session = getCustomerSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized. Please verify your phone number with OTP to view your invoices.',
      },
      { status: 401 }
    );
  }

  try {
    let invoices: ZohoInvoice[] = [];
    let customerId = session.customerId;
    let customerName = session.customerName || 'Valued Customer';

    // 3. Fetch live records from Zoho Books or scoped authorized invoice
    if (session.authorizedInvoiceNumber) {
      const { findZohoInvoiceByNumber } = await import('@/services/zoho');
      const inv = await findZohoInvoiceByNumber(session.authorizedInvoiceNumber);
      if (inv) {
        invoices = [inv];
        customerName = inv.customer_name || customerName;
        customerId = inv.customer_id || customerId;
      }
    } else if (isZohoConfigured()) {
      if (!customerId) {
        const contact = await findZohoCustomerByPhoneVariants([
          session.phone,
          session.localPhone,
          session.phone.replace(/[^0-9]/g, '').slice(-9),
        ]);
        if (contact && contact.contact_id) {
          customerId = contact.contact_id;
          customerName = contact.contact_name || contact.company_name || customerName;
        }
      }

      if (customerId) {
        invoices = await getCustomerInvoices(customerId);
      }
    }

    // 4. Calculate Financial Summaries directly from live Zoho invoices
    const summary = invoices.reduce(
      (acc, inv) => {
        acc.totalInvoices += 1;
        acc.totalAmount += inv.total;
        acc.totalPaid += inv.amount_paid;
        acc.totalBalance += inv.balance;
        return acc;
      },
      { totalInvoices: 0, totalAmount: 0, totalPaid: 0, totalBalance: 0 }
    );

    return NextResponse.json({
      success: true,
      customer: {
        name: customerName,
        phone: session.phone,
        localPhone: session.localPhone,
        customerId: customerId || undefined,
      },
      invoices,
      summary,
    });
  } catch (error: any) {
    console.error('[API /api/portal/invoices] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve invoices. Please try again in a few moments.' },
      { status: 500 }
    );
  }
}
