import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import {
  getZohoOrderCenterData,
  getZohoInvoiceFullDetails,
} from '@/services/zoho/ordersService';
import { syncZohoOrders } from '@/services/zoho/syncService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Verify Admin Authentication
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Admin credentials required.' },
      {
        status: 401,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const detailsId = searchParams.get('detailsId');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = parseInt(searchParams.get('perPage') || '100', 10);
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') || undefined;
  const category = searchParams.get('category') || undefined;
  const refresh = searchParams.get('refresh') === 'true';

  try {
    // If request is asking for full detail of a specific invoice
    if (detailsId) {
      const detail = await getZohoInvoiceFullDetails(detailsId);
      if (!detail) {
        return NextResponse.json(
          { success: false, message: `Invoice #${detailsId} not found.` },
          {
            status: 404,
            headers: {
              'Cache-Control': 'private, no-cache, no-store, must-revalidate',
            },
          }
        );
      }
      return NextResponse.json(
        { success: true, order: detail },
        {
          headers: {
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // If explicit refresh requested via GET query parameter, run controlled sync
    if (refresh) {
      try {
        await syncZohoOrders();
      } catch (syncErr: any) {
        console.warn('[API /api/admin/zoho/orders] GET sync warning:', syncErr.message || syncErr);
      }
    }

    // Load orders cache-first directly from local SQLite persistent storage (0 Zoho API requests)
    const data = await getZohoOrderCenterData({
      page,
      perPage,
      search,
      status,
      category,
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/zoho/orders GET] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to fetch Zoho Books order center records.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}

export async function POST(req: NextRequest) {
  // 1. Verify Admin Authentication
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Admin credentials required.' },
      {
        status: 401,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is accepted
    }

    const forceFull = Boolean(body.forceFull);

    // Run controlled, deduplicated Zoho synchronization
    const syncResult = await syncZohoOrders({ forceFull });

    // Retrieve fresh cached orders and stats
    const orderData = await getZohoOrderCenterData();

    return NextResponse.json(
      {
        ...orderData,
        success: syncResult.success,
        message: syncResult.message,
        rateLimited: Boolean(syncResult.rateLimited),
        syncResult,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('[API /api/admin/zoho/orders POST] Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Synchronization failed.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  }
}
