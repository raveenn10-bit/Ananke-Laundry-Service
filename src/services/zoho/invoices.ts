import { ZohoInvoice, ZohoPaymentStatus } from '@/types/zoho';
import { zohoRequest } from './client';

export function normalizePaymentStatus(rawStatus?: string, total = 0, balance = 0): ZohoPaymentStatus {
  if (total > 0 && balance <= 0) return 'Paid';
  if (total > 0 && balance < total && balance > 0) return 'Partially Paid';

  if (!rawStatus) return balance === 0 ? 'Paid' : 'Unpaid';
  const s = rawStatus.toLowerCase();
  if (s.includes('partially_paid') || s.includes('partially paid')) return 'Partially Paid';
  if (s.includes('paid')) return 'Paid';
  if (s.includes('overdue')) return 'Overdue';
  if (s.includes('sent')) return 'Sent';
  if (s.includes('viewed')) return 'Viewed';
  if (s.includes('draft')) return 'Draft';
  if (s.includes('void')) return 'Void';
  return 'Unpaid';
}

export async function getCustomerInvoices(customerId: string): Promise<ZohoInvoice[]> {
  if (!customerId) return [];

  const response = await zohoRequest<{ code: number; invoices: any[] }>('/invoices', {
    params: { customer_id: customerId, sort_column: 'date', sort_order: 'D' },
  });

  const list = response.invoices || [];

  const mapped: ZohoInvoice[] = list.map((inv) => {
    const total = Number(inv.total) || 0;
    const balance = Number(inv.balance) ?? total;
    const amount_paid = Math.max(0, total - balance);

    return {
      invoice_id: inv.invoice_id,
      invoice_number: inv.invoice_number,
      customer_id: inv.customer_id,
      customer_name: inv.customer_name,
      status: inv.status,
      payment_status: normalizePaymentStatus(inv.status, total, balance),
      date: inv.date,
      due_date: inv.due_date,
      total,
      balance,
      amount_paid,
      currency_code: inv.currency_code || 'LKR',
      currency_symbol: inv.currency_symbol || 'Rs.',
      created_time: inv.created_time || inv.date,
      description: inv.reference_number || 'Commercial Laundry & Linen Care Services',
      payment_date: amount_paid > 0 ? (inv.last_payment_date || inv.date) : undefined,
    };
  });

  // Ensure strict ordering: newest first
  return mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAuthorizedCustomerInvoice(
  invoiceId: string,
  expectedCustomerId: string
): Promise<ZohoInvoice | null> {
  // Handle mock invoices
  if (invoiceId.startsWith('mock-')) {
    const mockInvoices = getMockCustomerInvoices('test', 'Customer');
    const match = mockInvoices.find((i) => i.invoice_id === invoiceId);
    return match || null;
  }

  const response = await zohoRequest<{ code: number; invoice: any }>(`/invoices/${invoiceId}`);
  const inv = response.invoice;
  if (!inv) return null;

  if (inv.customer_id !== expectedCustomerId) {
    console.warn(
      `[Zoho Security Alert] Customer ${expectedCustomerId} attempted unauthorized access to invoice ${invoiceId} owned by ${inv.customer_id}`
    );
    throw new Error('Unauthorized: You do not have access to this invoice.');
  }

  return mapZohoInvoiceDetail(inv);
}

export function mapZohoInvoiceDetail(inv: any): ZohoInvoice {
  const total = Number(inv.total) || 0;
  const balance = Number(inv.balance) ?? total;
  const amount_paid = Math.max(0, total - balance);

  const line_items = (inv.line_items || []).map((item: any) => ({
    item_id: item.item_id,
    name: item.name,
    description: item.description,
    rate: Number(item.rate) || 0,
    quantity: Number(item.quantity) || 1,
    item_total: Number(item.item_total) || 0,
  }));

  return {
    invoice_id: inv.invoice_id,
    invoice_number: inv.invoice_number,
    customer_id: inv.customer_id,
    customer_name: inv.customer_name,
    status: inv.status,
    payment_status: normalizePaymentStatus(inv.status, total, balance),
    date: inv.date,
    due_date: inv.due_date,
    total,
    balance,
    amount_paid,
    currency_code: inv.currency_code || 'LKR',
    currency_symbol: inv.currency_symbol || 'Rs.',
    created_time: inv.created_time || inv.date,
    description: inv.reference_number || (line_items[0]?.name) || 'Commercial Laundry & Linen Care',
    line_items: line_items.length > 0 ? line_items : undefined,
    payment_date: amount_paid > 0 ? (inv.last_payment_date || inv.date) : undefined,
  };
}

/**
 * Searches for a Zoho Invoice by invoice number.
 * Supports exact match on invoice_number and fallback search.
 */
export async function findZohoInvoiceByNumber(invoiceNumber: string): Promise<ZohoInvoice | null> {
  const cleanNum = invoiceNumber.trim();
  if (!cleanNum) return null;

  const { isZohoConfigured } = await import('./auth');

  if (isZohoConfigured()) {
    try {
      // 1. Try exact invoice_number filter
      const res = await zohoRequest<{ code: number; invoices: any[] }>('/invoices', {
        params: { invoice_number: cleanNum },
      }).catch(() => null);

      if (res?.invoices && res.invoices.length > 0) {
        const full = await zohoRequest<{ code: number; invoice: any }>(
          `/invoices/${res.invoices[0].invoice_id}`
        ).catch(() => null);
        if (full?.invoice) {
          return mapZohoInvoiceDetail(full.invoice);
        }
      }

      // 2. Fallback to search_text
      const searchRes = await zohoRequest<{ code: number; invoices: any[] }>('/invoices', {
        params: { search_text: cleanNum },
      }).catch(() => null);

      if (searchRes?.invoices && searchRes.invoices.length > 0) {
        const exactMatch =
          searchRes.invoices.find(
            (i) => (i.invoice_number || '').trim().toLowerCase() === cleanNum.toLowerCase()
          ) || searchRes.invoices[0];

        const full = await zohoRequest<{ code: number; invoice: any }>(
          `/invoices/${exactMatch.invoice_id}`
        ).catch(() => null);
        if (full?.invoice) {
          return mapZohoInvoiceDetail(full.invoice);
        }
      }
    } catch (err: any) {
      console.warn('[Zoho Invoices] Error searching invoice by number:', err.message || err);
    }
  }

  // Demo fallback mode when Zoho is not configured or for mock demo numbers
  const mockInvoices = getMockCustomerInvoices('0771234567', 'Valued Customer');
  const found = mockInvoices.find(
    (i) =>
      i.invoice_number.toLowerCase() === cleanNum.toLowerCase() ||
      i.invoice_id.toLowerCase() === cleanNum.toLowerCase()
  );
  return found || null;
}

/**
 * Generates realistic demonstration invoices for test phone numbers
 * when Zoho Books credentials are not yet configured.
 */
export function getMockCustomerInvoices(phone: string, name = 'Valued Customer'): ZohoInvoice[] {
  return [
    {
      invoice_id: 'mock-inv-1042',
      invoice_number: 'ANK-1042',
      customer_id: 'mock-cust-1',
      customer_name: name,
      status: 'paid',
      payment_status: 'Paid',
      date: '2026-09-12',
      due_date: '2026-09-19',
      total: 4500,
      balance: 0,
      amount_paid: 4500,
      currency_code: 'LKR',
      currency_symbol: 'Rs.',
      created_time: '2026-09-12T09:30:00Z',
      description: 'Commercial Hotel Linen Care & Pressing',
      payment_date: '2026-09-12',
      payment_id: 'mock-pay-1042',
      line_items: [
        { name: 'Hotel Bed Linen Batch Washing & Ironing', quantity: 15, rate: 200, item_total: 3000 },
        { name: 'Plush Bath & Hand Towels Sanitation', quantity: 15, rate: 100, item_total: 1500 },
      ],
    },
    {
      invoice_id: 'mock-inv-1038',
      invoice_number: 'ANK-1038',
      customer_id: 'mock-cust-1',
      customer_name: name,
      status: 'partially_paid',
      payment_status: 'Partially Paid',
      date: '2026-09-08',
      due_date: '2026-09-22',
      total: 7200,
      balance: 3200,
      amount_paid: 4000,
      currency_code: 'LKR',
      currency_symbol: 'Rs.',
      created_time: '2026-09-08T11:15:00Z',
      description: 'Villa Bedding, Duvet Covers & Steam Pressing',
      payment_date: '2026-09-09',
      payment_id: 'mock-pay-1038',
      line_items: [
        { name: 'King Size Duvet Covers & Sheets Care', quantity: 8, rate: 500, item_total: 4000 },
        { name: 'Curtains & Delicate Silk Cushions Gentle Cycle', quantity: 4, rate: 800, item_total: 3200 },
      ],
    },
    {
      invoice_id: 'mock-inv-1025',
      invoice_number: 'ANK-1025',
      customer_id: 'mock-cust-1',
      customer_name: name,
      status: 'sent',
      payment_status: 'Unpaid',
      date: '2026-09-02',
      due_date: '2026-09-16',
      total: 2800,
      balance: 2800,
      amount_paid: 0,
      currency_code: 'LKR',
      currency_symbol: 'Rs.',
      created_time: '2026-09-02T14:20:00Z',
      description: 'Guest Garment Care & Formal Wear Dry Cleaning',
      line_items: [
        { name: 'Formal Linen Shirts Precision Pressing', quantity: 4, rate: 300, item_total: 1200 },
        { name: 'Gentleman Blazer & Trousers Dry Clean', quantity: 1, rate: 1600, item_total: 1600 },
      ],
    },
  ];
}
