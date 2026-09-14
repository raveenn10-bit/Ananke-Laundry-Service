import { ZohoPayment } from '@/types/zoho';
import { zohoRequest } from './client';

export async function getCustomerPayments(customerId: string): Promise<ZohoPayment[]> {
  if (!customerId) return [];

  try {
    const response = await zohoRequest<{ code: number; customerpayments: any[] }>('/customerpayments', {
      params: { customer_id: customerId },
    });

    const list = response.customerpayments || [];
    return list.map((p) => ({
      payment_id: p.payment_id,
      payment_number: p.payment_number,
      customer_id: p.customer_id,
      customer_name: p.customer_name,
      date: p.date,
      payment_mode: p.payment_mode || 'Cash',
      amount: Number(p.amount) || 0,
      reference_number: p.reference_number || undefined,
      invoice_numbers: p.invoice_numbers || (p.invoices && p.invoices.map((i: any) => i.invoice_number).join(', ')) || undefined,
      description: p.description || `Payment receipt for laundry services`,
    }));
  } catch (err: any) {
    console.error('[Zoho Payments] Failed to retrieve customer payments:', err.message);
    return [];
  }
}

export async function getAuthorizedCustomerPayment(
  paymentId: string,
  expectedCustomerId: string
): Promise<ZohoPayment | null> {
  const response = await zohoRequest<{ code: number; payment: any }>(`/customerpayments/${paymentId}`);
  const p = response.payment;
  if (!p) return null;

  if (p.customer_id !== expectedCustomerId) {
    console.warn(
      `[Zoho Security Alert] Customer ${expectedCustomerId} attempted unauthorized access to payment ${paymentId} owned by ${p.customer_id}`
    );
    throw new Error('Unauthorized: You do not have access to this payment receipt.');
  }

  return {
    payment_id: p.payment_id,
    payment_number: p.payment_number,
    customer_id: p.customer_id,
    customer_name: p.customer_name,
    date: p.date,
    payment_mode: p.payment_mode || 'Cash',
    amount: Number(p.amount) || 0,
    reference_number: p.reference_number || undefined,
    invoice_numbers: p.invoice_numbers || (p.invoices && p.invoices.map((i: any) => i.invoice_number).join(', ')) || undefined,
    description: p.description || `Payment receipt for laundry services`,
  };
}
