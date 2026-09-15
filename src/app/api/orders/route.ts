import { NextRequest, NextResponse } from 'next/server';
import { orderRepository } from '@/lib/storage/orderRepository';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimiter';
import { WhatsAppOrderData } from '@/types/order';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 60 * 1000,
    maxRequests: 10,
    prefix: 'order-submit',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: 'Too many order requests. Please try again shortly or chat on WhatsApp.',
      },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as WhatsAppOrderData;

    if (!body || !body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { success: false, message: 'Missing required customer name or phone number.' },
        { status: 400 }
      );
    }

    const totalQty = (body.items || []).reduce(
      (acc, item) => acc + (Number(item.quantity) || 0),
      0
    );

    const itemsSummary = (body.items || [])
      .map((i) => `${i.name} × ${i.quantity}`)
      .join(', ');

    const servicesSummary = (body.services || []).join(', ');

    const notesSummary = [
      servicesSummary ? `Services: ${servicesSummary}` : '',
      itemsSummary ? `Items: ${itemsSummary}` : '',
      body.collectionMethod ? `Collection: ${body.collectionMethod}` : '',
      body.pickupAddress ? `Pickup Address: ${body.pickupAddress}` : '',
      body.pickupDate ? `Pickup Date: ${body.pickupDate} (${body.pickupTime || ''})` : '',
      body.deliveryMethod ? `Delivery: ${body.deliveryMethod}` : '',
      body.deliveryAddress ? `Delivery Address: ${body.deliveryAddress}` : '',
      body.specialInstructions ? `Special Instructions: ${body.specialInstructions}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    // Store in backend order repository for admin & Zoho sync preparation
    await orderRepository.createOrder(
      {
        zohoCustomerId: 'web-customer',
        customerName: body.customerName.trim(),
        customerPhone: body.customerPhone.trim(),
        customerEmail: body.customerEmail ? body.customerEmail.trim() : '',
        itemName: servicesSummary || 'General Laundry Order',
        quantity: totalQty || 1,
        orderDate: new Date().toISOString().split('T')[0],
        expectedCompletionDate: body.pickupDate || new Date().toISOString().split('T')[0],
        currentStatus: 'Received',
        paymentStatus: 'Unpaid',
        notes: notesSummary,
      },
      'Website WhatsApp Order'
    );

    return NextResponse.json({
      success: true,
      orderId: body.orderId,
      message: 'Order logged successfully',
    });
  } catch (error: any) {
    console.error('[API /api/orders] Error saving order:', error);
    // Return success: true anyway so customer WhatsApp flow is never blocked
    return NextResponse.json({
      success: true,
      message: 'Order received',
    });
  }
}
