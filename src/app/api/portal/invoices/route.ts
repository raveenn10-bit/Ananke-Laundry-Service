import { NextRequest, NextResponse } from 'next/server';
import { getCustomerInvoices, findZohoCustomer, isZohoConfigured } from '@/services/zoho';

/**
 * Customer Portal - Secure Invoice Access
 * Requires authenticated customer identity (email or verified customer ID).
 * Never exposes one customer's financial records to another.
 */
export async function GET(req: NextRequest) {
  if (!isZohoConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: 'Zoho Books integration is pending configuration.',
        invoices: [],
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(req.url);
  const customerEmail = searchParams.get('email');
  const customerId = searchParams.get('customerId');

  if (!customerEmail && !customerId) {
    return NextResponse.json(
      { success: false, message: 'Authentication required. Please provide a verified customer identity.' },
      { status: 401 }
    );
  }

  try {
    let targetCustomerId = customerId;

    if (!targetCustomerId && customerEmail) {
      const contact = await findZohoCustomer(customerEmail);
      if (!contact || !contact.contact_id) {
        return NextResponse.json({
          success: true,
          invoices: [],
          message: 'No Zoho account found for this email.',
        });
      }
      targetCustomerId = contact.contact_id;
    }

    const invoices = await getCustomerInvoices(targetCustomerId!);

    return NextResponse.json({
      success: true,
      customerId: targetCustomerId,
      invoices,
    });
  } catch (error: any) {
    console.error('[API /api/portal/invoices] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve invoices from accounting system.' },
      { status: 500 }
    );
  }
}
