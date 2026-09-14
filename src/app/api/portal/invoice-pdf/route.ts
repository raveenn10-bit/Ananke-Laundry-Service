import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSessionFromRequest } from '@/lib/auth/phoneAuth';
import { getAuthorizedCustomerInvoice, downloadInvoicePdf } from '@/services/zoho';

export async function GET(req: NextRequest) {
  // 1. Session Verification
  const session = getCustomerSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please verify your phone number first.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get('id');

  if (!invoiceId) {
    return NextResponse.json(
      { success: false, message: 'Invoice ID is required.' },
      { status: 400 }
    );
  }

  try {
    // 2. Multi-Tenant Authorization Check
    const expectedCustomerId = session.customerId || 'mock-cust-1';
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
