import { OrderRecord, OrderStatus } from '@/types/order';
import { normalizeSriLankanPhone } from '@/lib/auth/phoneAuth';

export interface WhatsAppUpdateInfo {
  url: string;
  phone: string;
  messageText: string;
}

/**
 * Builds an official, branded WhatsApp status update message and direct wa.me link.
 */
export function buildWhatsAppUpdate(order: OrderRecord, status?: OrderStatus): WhatsAppUpdateInfo {
  const currentStatus = status || order.currentStatus;
  const norm = normalizeSriLankanPhone(order.customerPhone);
  // wa.me requires digits with country code, e.g. 94771234567
  const phoneDigits = norm.isValid ? `94${norm.digits}` : order.customerPhone.replace(/\D/g, '');

  let statusEmoji = '🧺';
  if (currentStatus === 'Ready') statusEmoji = '✨';
  if (currentStatus === 'Processing' || currentStatus === 'In Progress') statusEmoji = '🧼';
  if (currentStatus === 'Delivered' || currentStatus === 'Collected') statusEmoji = '📦';
  if (currentStatus === 'Cancelled') statusEmoji = '⚠️';

  const messageText = `🧺 *ANANKE LAUNDRY (PVT) LTD — ORDER UPDATE*
----------------------------------------
Hello *${order.customerName}*,

Good news! Your order *#${order.orderId}* is now *${currentStatus.toUpperCase()}* ${statusEmoji}

📋 *Service / Item:* ${order.itemName}
🔢 *Quantity:* ${order.quantity} units
📌 *Status:* ${currentStatus}
💳 *Payment Status:* ${order.paymentStatus}
${order.zohoInvoiceNumber ? `🧾 *Invoice Ref:* #${order.zohoInvoiceNumber}\n` : ''}
📍 *Facility Pickup Address:*
No. 195/2, Matara Road, Unawatuna, Galle
📞 *Hotline:* 091 225 0777
🌐 *Website:* anankelaundry.com

Thank you for choosing Ananke Laundry!`;

  const encoded = encodeURIComponent(messageText);
  const url = `https://wa.me/${phoneDigits}?text=${encoded}`;

  return {
    url,
    phone: phoneDigits,
    messageText,
  };
}
