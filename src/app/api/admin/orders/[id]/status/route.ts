import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { orderRepository } from '@/lib/storage/orderRepository';
import { OrderStatus } from '@/types/order';
import { sendOrderStatusEmail, shouldSendEmailForStatus } from '@/services/notifications/emailService';
import { buildWhatsAppUpdate } from '@/services/notifications/whatsappService';

const VALID_STATUSES: OrderStatus[] = [
  'Received',
  'Processing',
  'In Progress',
  'Ready',
  'Completed',
  'Collected',
  'Delivered',
  'Cancelled',
];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Admin key required.' },
      { status: 401 }
    );
  }

  const { id: orderId } = await params;

  try {
    const existingOrder = await orderRepository.getOrderById(orderId);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, message: `Order #${orderId} not found.` },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { newStatus, changedBy, notes, sendEmail = true } = body;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status '${newStatus}'. Allowed statuses: ${VALID_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 1. Check if email should be sent
    let emailSent = false;
    let emailError: string | undefined;

    if (sendEmail && shouldSendEmailForStatus(newStatus) && existingOrder.customerEmail) {
      const emailResult = await sendOrderStatusEmail(existingOrder, newStatus);
      emailSent = emailResult.success;
      if (!emailResult.success) {
        emailError = emailResult.error;
      }
    }

    // 2. Update order status and append timeline history
    const updatedOrder = await orderRepository.updateOrderStatus(
      orderId,
      newStatus,
      changedBy || 'Admin',
      notes,
      emailSent,
      existingOrder.customerEmail,
      false
    );

    // 3. Prepare WhatsApp update
    const whatsApp = updatedOrder ? buildWhatsAppUpdate(updatedOrder) : null;

    return NextResponse.json({
      success: true,
      message: `Status of #${orderId} updated to '${newStatus}'.${
        emailSent ? ' Automatic email notification dispatched to customer.' : ''
      }`,
      order: updatedOrder,
      emailSent,
      emailError,
      whatsApp,
    });
  } catch (error: any) {
    console.error('[API /api/admin/orders/[id]/status] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status.' },
      { status: 500 }
    );
  }
}
