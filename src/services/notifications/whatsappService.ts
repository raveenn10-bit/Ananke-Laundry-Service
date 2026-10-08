import { OrderRecord, OrderStatus } from '@/types/order';
import { normalizeSriLankanPhone } from '@/lib/auth/phoneAuth';
import { findZohoInvoiceByNumber, getZohoCustomer, isZohoConfigured } from '@/services/zoho';

export interface WhatsAppUpdateInfo {
  url: string;
  phone: string;
  messageText: string;
}

export interface VerifiedCustomerWhatsAppResult {
  verified: boolean;
  error?: string;
  customerName?: string;
  invoiceNumber?: string;
  myBillLink?: string;
  messageText?: string;
  whatsappUrl?: string;
  phone?: string;
}

/**
 * Sanitizes plain text for WhatsApp messages:
 * - Strips all HTML entities (e.g. &#x20;, &nbsp;, <br>, etc.)
 * - Strips any HTML tags
 * - Preserves standard characters, numbers, and emojis
 */
export function cleanWhatsAppPlainText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#x20;/gi, ' ')
    .replace(/&#32;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .trim();
}

/**
 * Generates the secure My Bill URL for a verified invoice.
 */
export function getMyBillUrl(invoiceNumber: string, baseUrl?: string): string {
  const domain =
    baseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://www.anankelaundry.lk');
  const cleanDomain = domain.replace(/\/+$/, '');
  const cleanInvoice = encodeURIComponent(cleanWhatsAppPlainText(invoiceNumber));
  return `${cleanDomain}/my-bill?invoice=${cleanInvoice}`;
}

/**
 * Formats the final WhatsApp customer message.
 * Strict rules:
 * - Never display template placeholders to the customer.
 * - Never send mock customer names or invoice numbers.
 * - Do not include HTML entities.
 * - Send clean WhatsApp plain text.
 * - Preserve line breaks exactly.
 */
export function formatFinalCustomerWhatsAppMessage(params: {
  customerName: string;
  invoiceNumber: string;
  myBillLink: string;
}): string {
  const customerName = cleanWhatsAppPlainText(params.customerName);
  const invoiceNumber = cleanWhatsAppPlainText(params.invoiceNumber);
  const myBillLink = cleanWhatsAppPlainText(params.myBillLink);

  // Validate that no template placeholders remain
  if (
    !customerName ||
    !invoiceNumber ||
    !myBillLink ||
    customerName.includes('{{') ||
    invoiceNumber.includes('{{') ||
    myBillLink.includes('{{')
  ) {
    throw new Error('Invalid message parameters: placeholders or missing fields detected.');
  }

  // Strictly forbid mock customer names or mock invoice numbers
  if (
    customerName.toLowerCase().includes('mock') ||
    customerName.toLowerCase().includes('valued customer') ||
    invoiceNumber.toLowerCase().includes('mock')
  ) {
    throw new Error('Mock customer names or mock invoice numbers cannot be sent.');
  }

  // Exact plain text layout with preserved line breaks
  return `🧺 Ananke Laundry

Hi ${customerName} 👋,

Your laundry order has been received successfully.

🧾 Invoice: ${invoiceNumber}

🔗 View your bill & track your order:
${myBillLink}

Thank you for choosing Ananke Laundry 💚`;
}

/**
 * Verifies customer phone and invoice ownership against Zoho Books.
 * Only builds the message AFTER phone + invoice ownership verification succeeds.
 * Never exposes Zoho IDs, API tokens, phone verification data, or internal secrets.
 */
export async function verifyCustomerInvoiceOwnership(
  rawPhone: string,
  rawInvoiceNumber: string,
  baseUrl?: string
): Promise<VerifiedCustomerWhatsAppResult> {
  const cleanPhone = cleanWhatsAppPlainText(rawPhone);
  const cleanInvNum = cleanWhatsAppPlainText(rawInvoiceNumber);

  if (!cleanPhone || !cleanInvNum) {
    return {
      verified: false,
      error: 'Both WhatsApp phone number and Invoice number are required for verification.',
    };
  }

  // 1. Validate phone number format
  const normalized = normalizeSriLankanPhone(cleanPhone);
  if (!normalized.isValid) {
    return {
      verified: false,
      error: normalized.error || 'Invalid phone number. Please enter a valid Sri Lankan WhatsApp number.',
    };
  }

  // 2. Strict Zoho Books connection requirement (prevents mock data usage)
  if (!isZohoConfigured()) {
    return {
      verified: false,
      error: 'Zoho Books connection is required for live ownership verification. Mock data is disallowed.',
    };
  }

  // 3. Find invoice in Zoho Books
  const invoice = await findZohoInvoiceByNumber(cleanInvNum);
  if (!invoice || !invoice.invoice_number || invoice.invoice_id?.startsWith('mock-')) {
    return {
      verified: false,
      error: `Invoice '${cleanInvNum}' not found in Zoho Books.`,
    };
  }

  // 4. Retrieve real customer details from Zoho Books
  if (!invoice.customer_id || invoice.customer_id.startsWith('mock-')) {
    return {
      verified: false,
      error: 'Valid customer identity could not be retrieved from Zoho Books.',
    };
  }

  const contact = await getZohoCustomer(invoice.customer_id).catch(() => null);
  if (!contact) {
    return {
      verified: false,
      error: 'Customer details could not be retrieved from Zoho Books.',
    };
  }

  // 5. Verify Phone Ownership against Zoho Contact Records
  const candidatePhones: string[] = [
    contact.phone,
    contact.mobile,
    ...(contact.contact_persons || []).map((cp: any) => cp.phone),
    ...(contact.contact_persons || []).map((cp: any) => cp.mobile),
    (invoice as any).phone,
    (invoice as any).customer_phone,
  ].filter(Boolean) as string[];

  const inputDigits = normalized.digits; // 9-digit local phone without leading zero, e.g. 771234567
  const inputSuffix7 = inputDigits.slice(-7);

  const phoneMatches = candidatePhones.some((cand) => {
    const candDigits = cand.replace(/[^0-9]/g, '');
    if (!candDigits) return false;
    return (
      candDigits === inputDigits ||
      candDigits === `94${inputDigits}` ||
      candDigits === `0${inputDigits}` ||
      candDigits.endsWith(inputDigits) ||
      inputDigits.endsWith(candDigits.slice(-9)) ||
      (candDigits.length >= 7 && (candDigits.endsWith(inputSuffix7) || inputDigits.endsWith(candDigits.slice(-7))))
    );
  });

  if (!phoneMatches) {
    return {
      verified: false,
      error: 'Phone number does not match the customer record for this invoice in Zoho Books.',
    };
  }

  // 6. Retrieve real customer name & real invoice number (strictly non-mock, non-placeholder)
  const realCustomerName = (
    contact.contact_name ||
    contact.company_name ||
    invoice.customer_name ||
    ''
  ).trim();

  const realInvoiceNumber = invoice.invoice_number.trim();

  if (
    !realCustomerName ||
    realCustomerName === 'Valued Customer' ||
    realCustomerName.toLowerCase().includes('mock') ||
    realCustomerName.includes('{{') ||
    !realInvoiceNumber ||
    realInvoiceNumber.toLowerCase().includes('mock') ||
    realInvoiceNumber.includes('{{')
  ) {
    return {
      verified: false,
      error: 'Real customer name or invoice number is not available in Zoho Books.',
    };
  }

  // 7. Generate clean My Bill Link
  const myBillLink = getMyBillUrl(realInvoiceNumber, baseUrl);

  // 8. Generate clean plain text WhatsApp message
  const messageText = formatFinalCustomerWhatsAppMessage({
    customerName: realCustomerName,
    invoiceNumber: realInvoiceNumber,
    myBillLink,
  });

  // 9. Generate WhatsApp wa.me direct URL
  const phoneWithCountryCode = `94${inputDigits}`;
  const whatsappUrl = `https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(messageText)}`;

  // 10. Return clean payload without internal Zoho tokens or IDs
  return {
    verified: true,
    customerName: realCustomerName,
    invoiceNumber: realInvoiceNumber,
    myBillLink,
    messageText,
    whatsappUrl,
    phone: phoneWithCountryCode,
  };
}

/**
 * Builds an official, branded WhatsApp status update message and direct wa.me link.
 */
export function buildWhatsAppUpdate(order: OrderRecord, status?: OrderStatus, baseUrl?: string): WhatsAppUpdateInfo {
  const currentStatus = status || order.currentStatus;
  const norm = normalizeSriLankanPhone(order.customerPhone);
  const phoneDigits = norm.isValid ? `94${norm.digits}` : order.customerPhone.replace(/\D/g, '');

  // For orders with a verified Zoho invoice and Received status, use the final customer message requirement
  if (
    order.zohoInvoiceNumber &&
    (currentStatus === 'Received' || !status) &&
    !order.customerName.toLowerCase().includes('mock') &&
    !order.zohoInvoiceNumber.toLowerCase().includes('mock')
  ) {
    try {
      const myBillLink = getMyBillUrl(order.zohoInvoiceNumber, baseUrl);
      const messageText = formatFinalCustomerWhatsAppMessage({
        customerName: order.customerName,
        invoiceNumber: order.zohoInvoiceNumber,
        myBillLink,
      });
      return {
        url: `https://wa.me/${phoneDigits}?text=${encodeURIComponent(messageText)}`,
        phone: phoneDigits,
        messageText,
      };
    } catch {
      // Fallback to standard status update if format check fails
    }
  }

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
🌐 *Website:* www.anankelaundry.lk

Thank you for choosing Ananke Laundry!`;

  const encoded = encodeURIComponent(messageText);
  const url = `https://wa.me/${phoneDigits}?text=${encoded}`;

  return {
    url,
    phone: phoneDigits,
    messageText,
  };
}
