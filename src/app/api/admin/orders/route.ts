import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { orderRepository } from '@/lib/storage/orderRepository';
import { OrderStatus } from '@/types/order';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Admin key required.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') as OrderStatus) || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const orders = await orderRepository.listOrders({ status, search });
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error('[API /api/admin/orders] GET Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve orders.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Admin key required.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      zohoCustomerId,
      zohoInvoiceId,
      zohoInvoiceNumber,
      customerName,
      customerPhone,
      customerEmail,
      itemName,
      quantity,
      orderDate,
      expectedCompletionDate,
      currentStatus,
      paymentStatus,
      notes,
      createdBy,
    } = body;

    if (!customerName || !customerPhone || !itemName) {
      return NextResponse.json(
        { success: false, message: 'Customer Name, Phone, and Item/Service Name are required.' },
        { status: 400 }
      );
    }

    const newOrder = await orderRepository.createOrder(
      {
        zohoCustomerId: zohoCustomerId || 'manual-entry',
        zohoInvoiceId,
        zohoInvoiceNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: (customerEmail || '').trim().toLowerCase(),
        itemName: itemName.trim(),
        quantity: Number(quantity) || 1,
        orderDate: orderDate || new Date().toISOString().split('T')[0],
        expectedCompletionDate:
          expectedCompletionDate ||
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currentStatus: currentStatus || 'Received',
        paymentStatus: paymentStatus || 'Unpaid',
        notes: notes?.trim() || undefined,
      },
      createdBy || 'Admin'
    );

    return NextResponse.json({
      success: true,
      message: `Order #${newOrder.orderId} created successfully.`,
      order: newOrder,
    });
  } catch (error: any) {
    console.error('[API /api/admin/orders] POST Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order.' },
      { status: 500 }
    );
  }
}
