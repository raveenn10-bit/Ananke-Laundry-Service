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

  // 1. Check local SQLite cache first (0 Zoho API calls!)
  try {
    const { getAllCachedZohoOrders } = await import('@/lib/storage/zohoOrderStore');
    const allCached = getAllCachedZohoOrders();
    const custCached = allCached.filter((o) => o.customerId === customerId);
    if (custCached.length > 0) {
      const mapped: ZohoInvoice[] = custCached.map((inv) => ({
        invoice_id: inv.invoiceId || inv.id,
        invoice_number: inv.invoiceNumber,
        customer_id: inv.customerId,
        customer_name: inv.customerName,
        status: inv.status,
        payment_status: normalizePaymentStatus(inv.status, inv.total, inv.balance),
        date: inv.date,
        due_date: inv.dueDate || inv.date,
        total: inv.total,
        balance: inv.balance,
        amount_paid: inv.amountPaid,
        currency_code: inv.currencyCode,
        currency_symbol: inv.currencySymbol,
        created_time: inv.createdTime || inv.date,
        description: inv.referenceNumber || 'Commercial Laundry & Linen Care Services',
        payment_date: inv.amountPaid > 0 ? inv.date : undefined,
      }));
      return mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (err) {
    console.warn('[Zoho Invoices] Cache lookup warning:', err);
  }

  // 2. Fetch from Zoho Books only if missing from local cache
  try {
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

    return mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err: any) {
    console.warn('[Zoho Invoices] getCustomerInvoices error:', err.message || err);
    return [];
  }
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
 * Supports exact match on invoice_number, 6-digit variations (e.g. 002018 <-> INV-002018), and fallback search.
 */
export async function findZohoInvoiceByNumber(invoiceNumber: string): Promise<ZohoInvoice | null> {
  const cleanNum = invoiceNumber.trim().toUpperCase();
  if (!cleanNum) return null;

  // Build candidate invoice numbers for multi-format searching (6-digit, prefixes, etc.)
  const candidates = new Set<string>();
  candidates.add(cleanNum);

  const digitsOnly = cleanNum.replace(/[^0-9]/g, '');
  if (digitsOnly) {
    candidates.add(digitsOnly);
    if (digitsOnly.length <= 6) {
      const padded6 = digitsOnly.padStart(6, '0');
      candidates.add(padded6);
      candidates.add(`INV-${padded6}`);
      candidates.add(`ANK-${padded6}`);
      candidates.add(`INV-${digitsOnly}`);
      candidates.add(`ANK-${digitsOnly}`);
    } else {
      candidates.add(`INV-${digitsOnly}`);
      candidates.add(`ANK-${digitsOnly}`);
    }
  }

  if (cleanNum.startsWith('INV-') || cleanNum.startsWith('ANK-')) {
    const rawDigits = cleanNum.slice(4);
    if (rawDigits) candidates.add(rawDigits);
  }

  // 1. Check local SQLite cache first (0 Zoho API calls!)
  try {
    const { getCachedOrderById } = await import('@/lib/storage/zohoOrderStore');
    for (const candidate of Array.from(candidates)) {
      const cached = getCachedOrderById(candidate);
      if (cached) {
        return {
          invoice_id: cached.invoiceId || cached.id,
          invoice_number: cached.invoiceNumber,
          customer_id: cached.customerId,
          customer_name: cached.customerName,
          status: cached.status,
          payment_status: normalizePaymentStatus(cached.status, cached.total, cached.balance),
          date: cached.date,
          due_date: cached.dueDate || cached.date,
          total: cached.total,
          balance: cached.balance,
          amount_paid: cached.amountPaid,
          currency_code: cached.currencyCode,
          currency_symbol: cached.currencySymbol,
          created_time: cached.createdTime || cached.date,
          description: cached.referenceNumber || 'Commercial Laundry & Linen Care Services',
          line_items: cached.lineItems
            ? cached.lineItems.map((li) => ({
                item_id: li.itemId || '',
                name: li.name,
                description: li.description,
                rate: Number(li.rate) || 0,
                quantity: Number(li.quantity) || 1,
                item_total: Number(li.itemTotal) || 0,
              }))
            : undefined,
        };
      }
    }
  } catch (err) {
    console.warn('[Zoho Invoices] Cache lookup warning:', err);
  }

  const { isZohoConfigured } = await import('./auth');

  if (isZohoConfigured()) {
    try {
      // 2. Targeted search on Zoho Books (search_text handles prefix and number in 1 call)
      const searchRes = await zohoRequest<{ code: number; invoices: any[] }>('/invoices', {
        params: { search_text: cleanNum, per_page: 5 },
      }).catch(() => null);

      if (searchRes?.invoices && searchRes.invoices.length > 0) {
        const exactMatch =
          searchRes.invoices.find((i) =>
            Array.from(candidates).some(
              (c) => (i.invoice_number || '').trim().toUpperCase() === c
            )
          ) || searchRes.invoices[0];

        const full = await zohoRequest<{ code: number; invoice: any }>(
          `/invoices/${exactMatch.invoice_id}`
        ).catch(() => null);

        if (full?.invoice) {
          const detail = mapZohoInvoiceDetail(full.invoice);

          // Save discovered invoice into SQLite cache for future lookups
          try {
            const { upsertZohoOrders } = await import('@/lib/storage/zohoOrderStore');
            upsertZohoOrders([
              {
                id: detail.invoice_id,
                recordType: 'invoice',
                invoiceId: detail.invoice_id,
                invoiceNumber: detail.invoice_number,
                customerId: detail.customer_id,
                customerName: detail.customer_name,
                date: detail.date,
                dueDate: detail.due_date,
                total: detail.total,
                balance: detail.balance,
                amountPaid: detail.amount_paid,
                currencyCode: detail.currency_code,
                currencySymbol: detail.currency_symbol,
                status: detail.status,
                financialStatus: detail.payment_status as any,
                hasUsablePhone: false,
                lineItems: detail.line_items?.map((li) => ({
                  itemId: li.item_id,
                  name: li.name,
                  description: li.description,
                  rate: Number(li.rate) || 0,
                  quantity: Number(li.quantity) || 1,
                  itemTotal: Number(li.item_total) || 0,
                })),
              },
            ]);
          } catch (cacheErr) {
            console.warn('[Zoho Invoices] Error caching discovered invoice to SQLite:', cacheErr);
          }

          return detail;
        }
      }
    } catch (err: any) {
      console.warn('[Zoho Invoices] Error searching invoice by number:', err.message || err);
    }
  }

  // Demo fallback mode when Zoho is not configured or for mock demo numbers
  const mockInvoices = getMockCustomerInvoices('0771234567', 'Valued Customer');
  const candidateList = Array.from(candidates);

  const found = mockInvoices.find((i) => {
    const invNum = i.invoice_number.toUpperCase();
    const invId = i.invoice_id.toUpperCase();
    return candidateList.some(
      (c) => invNum === c || invId === c || invNum.includes(c) || c.includes(invNum)
    );
  });

  return found || null;
}

/**
 * Generates realistic demonstration invoices for test phone numbers
 * when Zoho Books credentials are not yet configured.
 */
export function getMockCustomerInvoices(phone: string, name = 'Valued Customer'): ZohoInvoice[] {
  return [
    {
      invoice_id: 'mock-inv-002018',
      invoice_number: '002018',
      customer_id: 'mock-cust-1',
      customer_name: name,
      status: 'paid',
      payment_status: 'Paid',
      date: '2026-09-20',
      due_date: '2026-09-27',
      total: 4800,
      balance: 0,
      amount_paid: 4800,
      currency_code: 'LKR',
      currency_symbol: 'Rs.',
      created_time: '2026-09-20T10:00:00Z',
      description: 'Professional Laundry & Express Garment Care',
      payment_date: '2026-09-20',
      payment_id: 'mock-pay-002018',
      line_items: [
        { name: 'Hotel Linen Batch Care & Pressing', quantity: 12, rate: 300, item_total: 3600 },
        { name: 'Express Dry Cleaning & Sanitization', quantity: 1, rate: 1200, item_total: 1200 },
      ],
    },
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
