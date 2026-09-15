import { WhatsAppOrderData } from '@/types/order';

export const OFFICIAL_WHATSAPP_NUMBER = '94742697909'; // +94 74 269 7909

/**
 * Generate unique order reference: ANL-YYYYMMDD-XXXX
 * Example: ANL-20260915-4821
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `ANL-${year}${month}${day}-${randomSuffix}`;
}

/**
 * Format date string from YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return 'Not specified';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Format laundry order data into clean, formatted WhatsApp message with proper emojis
 */
export function formatWhatsAppOrderMessage(data: WhatsAppOrderData): string {
  const totalItems = data.items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);

  const lines: string[] = [
    '🧺 *NEW LAUNDRY ORDER*',
    `🆔 *Order ID:* ${data.orderId}`,
    '',
    '👤 *Customer Details*',
    `• Name: ${data.customerName.trim()}`,
    `• Phone: ${data.customerPhone.trim()}`,
  ];

  if (data.customerEmail && data.customerEmail.trim()) {
    lines.push(`• Email: ${data.customerEmail.trim()}`);
  }

  lines.push('');
  lines.push('🧼 *Services*');
  data.services.forEach((service) => {
    if (service === 'Other' && data.otherServiceDetails) {
      lines.push(`• Other: ${data.otherServiceDetails.trim()}`);
    } else {
      lines.push(`• ${service}`);
    }
  });

  lines.push('');
  lines.push(`👕 *Items (Total: ${totalItems})*`);
  if (data.items.length === 0) {
    lines.push('• (Items to be counted on collection)');
  } else {
    data.items.forEach((item) => {
      lines.push(`• ${item.name} × ${item.quantity}`);
    });
  }

  lines.push('');
  lines.push('🚚 *Collection*');
  lines.push(`• Method: ${data.collectionMethod}`);
  if (data.collectionMethod === 'Pickup Required') {
    if (data.pickupAddress) {
      lines.push(`• Pickup Address: ${data.pickupAddress.trim()}`);
    }
    if (data.pickupDate) {
      lines.push(`• Preferred Date: ${formatDateDisplay(data.pickupDate)}`);
    }
    if (data.pickupTime) {
      lines.push(`• Preferred Time: ${data.pickupTime}`);
    }
  }

  lines.push('');
  lines.push('📦 *Delivery*');
  lines.push(`• Method: ${data.deliveryMethod}`);
  if (data.deliveryMethod === 'Delivery Required') {
    if (data.sameAsPickupAddress) {
      lines.push('• Delivery Address: Same as Pickup Address');
    } else if (data.deliveryAddress) {
      lines.push(`• Delivery Address: ${data.deliveryAddress.trim()}`);
    }
  }

  if (data.specialInstructions && data.specialInstructions.trim()) {
    lines.push('');
    lines.push('📝 *Special Instructions*');
    lines.push(data.specialInstructions.trim());
  }

  if (data.imageAttached) {
    lines.push('');
    lines.push('📷 *Photos:* Garment photo will be attached in this chat');
  }

  lines.push('');
  lines.push('— Sent via Ananke Laundry Website');

  return lines.join('\n');
}

/**
 * Build the WhatsApp click-to-chat URL with proper URL encoding
 */
export function buildWhatsAppChatUrl(
  message: string,
  phoneNumber: string = OFFICIAL_WHATSAPP_NUMBER
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
