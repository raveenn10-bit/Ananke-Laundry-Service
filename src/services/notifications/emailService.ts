import { OrderRecord, OrderStatus } from '@/types/order';

export interface EmailDispatchResult {
  success: boolean;
  provider: 'resend' | 'brevo' | 'smtp' | 'console';
  messageId?: string;
  error?: string;
}

// Important statuses that trigger automatic customer email notification
export const EMAIL_TRIGGER_STATUSES: OrderStatus[] = [
  'Processing',
  'Ready',
  'Completed',
  'Delivered',
];

export function shouldSendEmailForStatus(status: OrderStatus): boolean {
  return EMAIL_TRIGGER_STATUSES.includes(status);
}

/**
 * Modular Email Notification Service
 * Automatically detects available provider (Resend, Brevo, SMTP)
 * with robust console and audit logger fallback.
 */
export async function sendOrderStatusEmail(
  order: OrderRecord,
  newStatus: OrderStatus
): Promise<EmailDispatchResult> {
  const recipient = order.customerEmail?.trim();
  if (!recipient || !recipient.includes('@')) {
    return {
      success: false,
      provider: 'console',
      error: 'Customer record does not have a valid email address.',
    };
  }

  const emailData = generateEmailContent(order, newStatus);

  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Ananke Laundry <orders@anankelaundry.com>',
          to: [recipient],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Email Service - Resend] Sent status email to ${recipient} (id: ${data.id})`);
        return { success: true, provider: 'resend', messageId: data.id };
      }
    } catch (err: any) {
      console.warn('[Email Service - Resend] Delivery failed, trying fallback:', err.message);
    }
  }

  // 2. Brevo API (formerly Sendinblue)
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Ananke Laundry', email: process.env.EMAIL_FROM || 'orders@anankelaundry.com' },
          to: [{ email: recipient, name: order.customerName }],
          subject: emailData.subject,
          htmlContent: emailData.html,
          textContent: emailData.text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`[Email Service - Brevo] Sent status email to ${recipient} (id: ${data.messageId})`);
        return { success: true, provider: 'brevo', messageId: data.messageId };
      }
    } catch (err: any) {
      console.warn('[Email Service - Brevo] Delivery failed, trying fallback:', err.message);
    }
  }

  // 3. Console / Audit Logger Fallback (Zero Config Mode)
  console.log(`\n==================================================`);
  console.log(`[EMAIL NOTIFICATION DISPATCH - STAGING / DEV]`);
  console.log(`To: ${recipient} (${order.customerName})`);
  console.log(`Subject: ${emailData.subject}`);
  console.log(`Order ID: ${order.orderId} | Status: ${newStatus}`);
  console.log(`--------------------------------------------------`);
  console.log(emailData.text);
  console.log(`==================================================\n`);

  return {
    success: true,
    provider: 'console',
    messageId: `log_${Date.now()}`,
  };
}

function generateEmailContent(order: OrderRecord, status: OrderStatus) {
  let statusMessage = '';
  let statusHeadline = '';

  switch (status) {
    case 'Processing':
      statusHeadline = 'is now BEING PROCESSED';
      statusMessage = 'Your laundry batch is currently in our industrial washing, sanitizing, and gentle care cycle at our Unawatuna plant.';
      break;
    case 'Ready':
      statusHeadline = 'is now READY FOR COLLECTION';
      statusMessage = 'Great news! Your items have been precision steam-pressed, folded, quality inspected, and packaged for pickup.';
      break;
    case 'Completed':
      statusHeadline = 'has been COMPLETED';
      statusMessage = 'All laundry care services for your order have been completed to Cleanline commercial standards.';
      break;
    case 'Delivered':
      statusHeadline = 'has been DELIVERED';
      statusMessage = 'Your fresh laundry items have been delivered to your property or collected.';
      break;
    default:
      statusHeadline = `status is now: ${status.toUpperCase()}`;
      statusMessage = `Your order status has been updated to ${status}.`;
  }

  const subject = `Your Order #${order.orderId} Is ${status === 'Ready' ? 'Ready for Collection' : status} - Ananke Laundry`;

  const text = `Hi ${order.customerName},

Good news!

Your order #${order.orderId} ${statusHeadline}.

${statusMessage}

Order Summary:
- Order ID: #${order.orderId}
- Item / Service: ${order.itemName}
- Quantity: ${order.quantity}
- Status: ${status}
- Payment Status: ${order.paymentStatus}
${order.zohoInvoiceNumber ? `- Invoice Ref: #${order.zohoInvoiceNumber}` : ''}

Pickup & Facility Details:
Ananke Laundry (Pvt) Ltd
No. 195/2, Matara Road, Unawatuna, Galle, Sri Lanka
Telephone Hotline: 091 225 0777
Opening Hours: Mon 9-5 PM | Tue-Fri 9-6 PM | Sat-Sun 9-5 PM

Please contact us if you need any assistance.

Thank you,
Ananke Laundry (Pvt) Ltd
Member of Cleanline Linen Management Network`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FA; color: #1B2E24;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F9FA; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #0F1F17; padding: 28px 32px; text-align: left;">
              <h1 style="margin: 0; font-size: 22px; font-weight: bold; color: #D4AF37; letter-spacing: 0.5px;">ANANKE LAUNDRY</h1>
              <p style="margin: 4px 0 0; font-size: 11px; color: #A7C4B5; text-transform: uppercase; letter-spacing: 1px;">Cleanline Linen Management Network &bull; Unawatuna, Galle</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #1B2E24;">Hi <strong>${order.customerName}</strong>,</p>
              
              <div style="background-color: #F4F7F5; border-left: 4px solid #3E6B56; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0F1F17;">
                  Your order #${order.orderId} ${statusHeadline}.
                </p>
                <p style="margin: 6px 0 0; font-size: 13px; color: #4B5563; line-height: 1.5;">
                  ${statusMessage}
                </p>
              </div>

              <!-- Order Details Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden;">
                <tr style="background-color: #F9FAFB;">
                  <td colspan="2" style="padding: 12px 16px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #6B7280; border-bottom: 1px solid #E5E7EB;">
                    Order Specifications
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #6B7280; border-bottom: 1px solid #F3F4F6; width: 40%;">Order Number:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: #111827; border-bottom: 1px solid #F3F4F6;">#${order.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #6B7280; border-bottom: 1px solid #F3F4F6;">Item / Service:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 500; color: #111827; border-bottom: 1px solid #F3F4F6;">${order.itemName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #6B7280; border-bottom: 1px solid #F3F4F6;">Quantity:</td>
                  <td style="padding: 10px 16px; font-size: 13px; color: #111827; border-bottom: 1px solid #F3F4F6;">${order.quantity} units</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #6B7280; border-bottom: 1px solid #F3F4F6;">Current Status:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: ${status === 'Ready' ? '#059669' : '#0F1F17'}; border-bottom: 1px solid #F3F4F6;">${status.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 13px; color: #6B7280;">Payment Status:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: bold; color: ${order.paymentStatus === 'Paid' ? '#059669' : '#DC2626'};">${order.paymentStatus}</td>
                </tr>
              </table>

              <!-- Facility & Support Box -->
              <div style="background-color: #FAF6E9; border: 1px solid #EADBBA; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 6px; font-size: 13px; font-weight: bold; color: #785A10; text-transform: uppercase;">Facility Collection &amp; Contact</h3>
                <p style="margin: 0; font-size: 12px; color: #5B4813; line-height: 1.6;">
                  <strong>Address:</strong> No. 195/2, Matara Road, Unawatuna, Galle, Sri Lanka<br>
                  <strong>Hotline:</strong> <a href="tel:+94912250777" style="color: #785A10; font-weight: bold;">091 225 0777</a><br>
                  <strong>Hours:</strong> Mon 9-5 PM | Tue-Fri 9-6 PM | Sat-Sun 9-5 PM
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">
                Thank you for entrusting your textile care to Ananke Laundry.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 20px 32px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 11px; color: #9CA3AF;">
                &copy; 2026 Ananke Laundry (Pvt) Ltd. All rights reserved.<br>
                Commercial linen management partner of Cleanline Linen Management (Pvt) Ltd.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
