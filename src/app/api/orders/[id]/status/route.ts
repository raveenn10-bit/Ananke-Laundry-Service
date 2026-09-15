import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import {
  orderRepository,
  normalizeOperationalStatus,
  buildTrackingSummary,
} from '@/lib/storage/orderRepository';
import { LaundryOperationalStatus } from '@/types/order';

const VALID_OPERATIONAL_STATUSES: LaundryOperationalStatus[] = [
  'ORDER RECEIVED',
  'WASHING',
  'DRYING',
  'READY FOR PICKUP',
  'DELIVERED',
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleStatusUpdate(req, params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleStatusUpdate(req, params);
}

async function handleStatusUpdate(
  req: NextRequest,
  paramsPromise: Promise<{ id: string }>
) {
  // 1. Staff Authorization via ADMIN_SECRET_KEY / x-admin-key header
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized. Valid staff/admin key required (x-admin-key).',
      },
      { status: 401 }
    );
  }

  const { id: identifier } = await paramsPromise;
  if (!identifier) {
    return NextResponse.json(
      { success: false, message: 'Order ID or Invoice Number parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawStatus = (body.status || body.newStatus || '').trim();
    const changedBy = (body.changedBy || 'Staff Admin').trim();
    const notes = (body.notes || '').trim();

    if (!rawStatus) {
      return NextResponse.json(
        {
          success: false,
          message: `Status is required. Valid stages: ${VALID_OPERATIONAL_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const normalizedStatus = normalizeOperationalStatus(rawStatus);

    const updatedOrder = await orderRepository.updateOperationalStatusByIdentifier(
      identifier,
      normalizedStatus,
      changedBy,
      notes || `Operational status updated to ${normalizedStatus}`
    );

    if (!updatedOrder) {
      return NextResponse.json(
        {
          success: false,
          message: `No active order or tracking record found for '${identifier}'.`,
        },
        { status: 404 }
      );
    }

    const trackingSummary = buildTrackingSummary(updatedOrder);

    return NextResponse.json({
      success: true,
      message: `Order ${updatedOrder.orderId} status updated to ${normalizedStatus}.`,
      order: updatedOrder,
      tracking: trackingSummary,
    });
  } catch (err: any) {
    console.error('[API /api/orders/[id]/status] Error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status.' },
      { status: 500 }
    );
  }
}
