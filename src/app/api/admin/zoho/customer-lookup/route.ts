import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { lookupZohoCustomerUnified } from '@/services/zoho';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Admin key required.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';

  if (!query.trim()) {
    return NextResponse.json({ success: true, customers: [] });
  }

  try {
    const customers = await lookupZohoCustomerUnified(query);
    return NextResponse.json({
      success: true,
      query,
      count: customers.length,
      customers,
    });
  } catch (error: any) {
    console.error('[API /api/admin/zoho/customer-lookup] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to query Zoho Books customers.' },
      { status: 500 }
    );
  }
}
