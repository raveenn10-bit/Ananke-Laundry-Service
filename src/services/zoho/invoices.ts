import { ZohoInvoice, ZohoPaymentStatus } from '@/types/zoho';
import { zohoRequest } from './client';

export function normalizePaymentStatus(rawStatus?: string): ZohoPaymentStatus {
  if (!rawStatus) return 'Unknown';
  const s = rawStatus.toLowerCase();
  if (s.includes('partially_paid') || s.includes('partially paid')) return 'Partially Paid';
  if (s.includes('paid')) return 'Paid';
  if (s.includes('overdue')) return 'Overdue';
  if (s.includes('sent')) return 'Sent';
  if (s.includes('viewed')) return 'Viewed';
  if (s.includes('draft')) return 'Draft';
  if (s.includes('void')) return 'Void';
  return 'Unknown';
}

export async function getCustomerInvoices(customerId: string): Promise<ZohoInvoice[]> {
  if (!customerId) return [];

  const response = await zohoRequest<{ code: number; invoices: any[] }>('/invoices', {
    params: { customer_id: customerId },
  });

  return (response.invoices || []).map((inv) => ({
    invoice_id: inv.invoice_id,
    invoice_number: inv.invoice_number,
    customer_id: inv.customer_id,
    customer_name: inv.customer_name,
    status: inv.status,
    payment_status: normalizePaymentStatus(inv.status),
    date: inv.date,
    due_date: inv.due_date,
    total: inv.total,
    balance: inv.balance,
    currency_code: inv.currency_code || 'LKR',
    currency_symbol: inv.currency_symbol || 'Rs.',
    created_time: inv.created_time,
  }));
}

export async function getAuthorizedCustomerInvoice(
  invoiceId: string,
  expectedCustomerId: string
): Promise<ZohoInvoice | null> {
  const response = await zohoRequest<{ code: number; invoice: any }>(`/invoices/${invoiceId}`);
  const inv = response.invoice;
  if (!inv) return null;

  if (inv.customer_id !== expectedCustomerId) {
    console.warn(`[Zoho Security Alert] Customer ${expectedCustomerId} attempted unauthorized access to invoice ${invoiceId} owned by ${inv.customer_id}`);
    throw new Error('Unauthorized: You do not have access to this invoice.');
  }

  return {
    invoice_id: inv.invoice_id,
    invoice_number: inv.invoice_number,
    customer_id: inv.customer_id,
    customer_name: inv.customer_name,
    status: inv.status,
    payment_status: normalizePaymentStatus(inv.status),
    date: inv.date,
    due_date: inv.due_date,
    total: inv.total,
    balance: inv.balance,
    currency_code: inv.currency_code || 'LKR',
    currency_symbol: inv.currency_symbol || 'Rs.',
    created_time: inv.created_time,
  };
}

export async function getInvoicePaymentStatus(invoiceId: string): Promise<{
  invoiceNumber: string;
  paymentStatus: ZohoPaymentStatus;
  total: number;
  balance: number;
  dueDate: string;
}> {
  const response = await zohoRequest<{ code: number; invoice: any }>(`/invoices/${invoiceId}`);
  const inv = response.invoice;

  return {
    invoiceNumber: inv.invoice_number,
    paymentStatus: normalizePaymentStatus(inv.status),
    total: inv.total,
    balance: inv.balance,
    dueDate: inv.due_date,
  };
}
