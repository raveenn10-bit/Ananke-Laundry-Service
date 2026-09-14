import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSessionFromRequest } from '@/lib/auth/phoneAuth';
import {
  getAuthorizedCustomerInvoice,
  downloadInvoicePdf,
  isZohoConfigured,
  findZohoCustomerByPhoneVariants,
} from '@/services/zoho';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export async function GET(req: NextRequest) {
  // 1. IP Rate Limiting (Resource exhaustion protection for PDF generation)
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60 * 1000,
    maxRequests: 30,
    prefix: 'portal_invoice_pdf_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: 'Too many PDF download requests. Please wait a moment.' },
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
  const invoiceId = searchParams.get('id')?.trim();

  if (!invoiceId) {
    return NextResponse.json(
      { success: false, message: 'Invoice ID is required.' },
      { status: 400 }
    );
  }

  try {
    // 3. Multi-Tenant Authorization Check
    let expectedCustomerId = session.customerId;

    if (isZohoConfigured()) {
      if (!expectedCustomerId) {
        const contact = await findZohoCustomerByPhoneVariants([
          session.phone,
          session.localPhone,
          session.phone.replace(/[^0-9]/g, '').slice(-9),
        ]);
        if (contact?.contact_id) {
          expectedCustomerId = contact.contact_id;
        }
      }

      // In production with Zoho active, mock invoices are strictly disallowed
      if (invoiceId.startsWith('mock-')) {
        return NextResponse.json(
          { success: false, message: 'Invoice not found or access denied.' },
          { status: 404 }
        );
      }

      if (!expectedCustomerId) {
        return NextResponse.json(
          { success: false, message: 'No registered customer account found for your verified phone.' },
          { status: 403 }
        );
      }
    } else {
      // Demo mode when Zoho Books credentials are not configured yet
      expectedCustomerId = expectedCustomerId || 'mock-cust-1';
    }

    const invoice = await getAuthorizedCustomerInvoice(invoiceId, expectedCustomerId);

    if (!invoice) {
      return NextResponse.json(
        { success: false, message: 'Invoice not found or access denied.' },
        { status: 404 }
      );
    }

    // 3. Download / Generate PDF
    const { buffer, filename, contentType } = await downloadInvoicePdf(invoice);

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
    console.error('[API /api/portal/invoice-pdf] Error:', error.message);
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: You do not have permission to access this invoice.' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Failed to generate invoice PDF. Please contact 091 225 0777.' },
      { status: 500 }
    );
  }
}
