import {
  ZohoOrderRecord,
  ZohoOrderStats,
  ZohoOrdersResponse,
  ZohoOrderFinancialStatus,
  ZohoOrderLineItem,
} from '@/types/zohoOrder';
import { isZohoConfigured } from './auth';
import { zohoRequest } from './client';
import { normalizeSriLankanPhone } from '@/lib/auth/phoneAuth';

function cleanWhatsAppText(text: string): string {
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
    .replace(/<[^>]*>/g, '')
    .trim();
}

const SECURE_MY_BILL_URL = 'https://ananke-laundry-service.vercel.app/my-bill';

// In-memory cache for resolved invoice & contact phones to minimize Zoho API round-trips
const invoicePhoneCache = new Map<string, string>();
const contactPhoneCache = new Map<string, string>();
const invoiceCategoryCache = new Map<string, string>();

/**
 * Extracts a phone or WhatsApp number from any Zoho Books entity:
 * - Custom Fields array (e.g. label: "WhatsApp Number", "whatsapp number", "WhatsApp", etc.)
 * - Custom field hash (e.g. cf_whatsapp_number)
 * - Direct object properties (whatsapp_number, mobile, phone, etc.)
 * - Contact persons and addresses
 * - Notes or terms fallback
 */
export function extractPhoneFromZohoRecord(record: any): string | undefined {
  if (!record || typeof record !== 'object') return undefined;

  const checkValue = (val: any): string | undefined => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === 'object') {
      for (const subKey of ['phone_number', 'mobile', 'value', 'number', 'phone', 'text', 'formatted']) {
        if (val[subKey]) {
          const res = checkValue(val[subKey]);
          if (res) return res;
        }
      }
      return undefined;
    }
    const str = String(val).trim();
    if (!str) return undefined;
    const digits = str.replace(/\D/g, '');
    if (digits.length >= 7) {
      return str;
    }
    return undefined;
  };

  // 1. Check custom_fields array (or customfields)
  const cfList: any[] = Array.isArray(record.custom_fields)
    ? record.custom_fields
    : Array.isArray(record.customfields)
    ? record.customfields
    : record.custom_fields && typeof record.custom_fields === 'object'
    ? Object.values(record.custom_fields)
    : [];

  if (cfList.length > 0) {
    // Priority 1: Label specifically contains "whatsapp" or "whats app" or "wa"
    for (const cf of cfList) {
      if (!cf || typeof cf !== 'object') continue;
      const label = String(
        cf.label ||
        cf.placeholder ||
        cf.api_name ||
        cf.field_name ||
        cf.data_name ||
        cf.name ||
        cf.column_name ||
        ''
      ).toLowerCase();
      if (label.includes('whatsapp') || label.includes('whats app') || label.includes('wa')) {
        const p =
          checkValue(cf.value) ||
          checkValue(cf.value_formatted) ||
          checkValue(cf.unformatted_value) ||
          checkValue(cf.field_value);
        if (p) return p;
      }
    }

    // Priority 2: Label contains "phone", "mobile", "contact", or "tel"
    for (const cf of cfList) {
      if (!cf || typeof cf !== 'object') continue;
      const label = String(
        cf.label ||
        cf.placeholder ||
        cf.api_name ||
        cf.field_name ||
        cf.data_name ||
        cf.name ||
        cf.column_name ||
        ''
      ).toLowerCase();
      if (
        label.includes('phone') ||
        label.includes('mobile') ||
        label.includes('contact') ||
        label.includes('tel') ||
        label.includes('number')
      ) {
        const p =
          checkValue(cf.value) ||
          checkValue(cf.value_formatted) ||
          checkValue(cf.unformatted_value) ||
          checkValue(cf.field_value);
        if (p) return p;
      }
    }
  }

  // 2. Check custom_field_hash (e.g. cf_whatsapp_number)
  if (record.custom_field_hash && typeof record.custom_field_hash === 'object') {
    for (const [key, val] of Object.entries(record.custom_field_hash)) {
      const k = key.toLowerCase();
      if (k.includes('whatsapp') || k.includes('whats_app') || k.includes('wa')) {
        const p = checkValue(val);
        if (p) return p;
      }
    }
    for (const [key, val] of Object.entries(record.custom_field_hash)) {
      const k = key.toLowerCase();
      if (k.includes('phone') || k.includes('mobile') || k.includes('contact') || k.includes('tel')) {
        const p = checkValue(val);
        if (p) return p;
      }
    }
  }

  // 3. Direct properties on the record
  const directKeys = [
    'whatsapp_number',
    'whatsapp',
    'cf_whatsapp_number',
    'cf_whatsapp',
    'cf_whatsapp_no',
    'whatsapp number',
    'WhatsApp Number',
    'Whatsapp Number',
    'WhatsApp number',
    'whatsapp_no',
    'WhatsApp No',
    'WhatsApp',
    'mobile',
    'phone',
    'customer_phone',
    'contact_phone',
    'phone_number',
    'mobile_number',
    'telephone',
  ];

  for (const k of directKeys) {
    if (k in record) {
      const p = checkValue(record[k]);
      if (p) return p;
    }
  }

  // 4. Any top-level object key containing whatsapp, phone, or mobile
  for (const [key, val] of Object.entries(record)) {
    const k = key.toLowerCase();
    if (k.includes('whatsapp') || k.includes('phone') || k.includes('mobile')) {
      const p = checkValue(val);
      if (p) return p;
    }
  }

  // 5. Contact persons array
  if (Array.isArray(record.contact_persons)) {
    for (const cp of record.contact_persons) {
      const p = extractPhoneFromZohoRecord(cp);
      if (p) return p;
    }
  }

  // 6. Billing / shipping address phone
  if (record.billing_address) {
    const p = checkValue(record.billing_address.phone) || checkValue(record.billing_address.mobile);
    if (p) return p;
  }
  if (record.shipping_address) {
    const p = checkValue(record.shipping_address.phone) || checkValue(record.shipping_address.mobile);
    if (p) return p;
  }

  // 7. Check notes or customer_notes for embedded phone numbers (e.g. "WhatsApp: 077 123 4567")
  if (record.notes || record.customer_notes) {
    const text = `${record.notes || ''} ${record.customer_notes || ''}`;
    const slSubMatch = text.replace(/[\s\-\.\(\)]/g, '').match(/(?:0|94)?(7[01245678]\d{7})/);
    if (slSubMatch && slSubMatch[1]) {
      return slSubMatch[1];
    }
  }

  return undefined;
}

/**
 * Extracts an order category from any Zoho Books entity.
 * Checks (in priority order):
 *  1. custom_fields array — labels containing: category, order type, service type, type, segment, channel
 *  2. custom_field_hash — keys containing those same words
 *  3. tags array — joined as a comma-separated string
 * Returns undefined if nothing found.
 */
export function extractCategoryFromZohoRecord(
  record: any,
  fallbackCustomer?: any
): 'Retail' | 'Outside Hotel' {
  if (!record || typeof record !== 'object') {
    return 'Retail';
  }

  const normalizeToCategory = (val: any): 'Retail' | 'Outside Hotel' | undefined => {
    if (!val) return undefined;
    const s = String(val).toLowerCase().trim();
    if (!s) return undefined;
    if (
      s.includes('outside') ||
      s.includes('out side') ||
      s.includes('hotel') ||
      s.includes('osh') ||
      s.includes('resort') ||
      s.includes('villa')
    ) {
      return 'Outside Hotel';
    }
    if (
      s.includes('retail') ||
      s.includes('individual') ||
      s.includes('walk-in') ||
      s.includes('walkin') ||
      s.includes('direct') ||
      s.includes('customer')
    ) {
      return 'Retail';
    }
    return undefined;
  };

  const CATEGORY_KEYWORDS = [
    'category',
    'order type',
    'service type',
    'customer type',
    'laundry type',
    'order category',
    'type',
    'segment',
    'channel',
    'sector',
  ];

  const labelMatches = (label: string): boolean => {
    const l = label.toLowerCase();
    return CATEGORY_KEYWORDS.some((kw) => l.includes(kw));
  };

  // 1. Check custom_fields array on the record
  const cfList: any[] = Array.isArray(record.custom_fields)
    ? record.custom_fields
    : Array.isArray(record.customfields)
    ? record.customfields
    : record.custom_fields && typeof record.custom_fields === 'object'
    ? Object.values(record.custom_fields)
    : [];

  // 1.1 Match specific category field labels
  for (const cf of cfList) {
    if (!cf || typeof cf !== 'object') continue;
    const label = String(
      cf.label ||
      cf.placeholder ||
      cf.api_name ||
      cf.field_name ||
      cf.data_name ||
      cf.name ||
      cf.column_name ||
      ''
    );
    if (labelMatches(label)) {
      const val = cf.value ?? cf.value_formatted ?? cf.unformatted_value ?? cf.field_value;
      const cat = normalizeToCategory(val);
      if (cat) return cat;
    }
  }

  // 1.2 Check ANY custom field value containing 'retail' or 'outside' or 'hotel'
  for (const cf of cfList) {
    if (!cf || typeof cf !== 'object') continue;
    const val = cf.value ?? cf.value_formatted ?? cf.unformatted_value ?? cf.field_value;
    const cat = normalizeToCategory(val);
    if (cat) return cat;
  }

  // 2. Check custom_field_hash on the record
  if (record.custom_field_hash && typeof record.custom_field_hash === 'object') {
    for (const [key, val] of Object.entries(record.custom_field_hash)) {
      if (labelMatches(key)) {
        const cat = normalizeToCategory(val);
        if (cat) return cat;
      }
    }
    for (const val of Object.values(record.custom_field_hash)) {
      const cat = normalizeToCategory(val);
      if (cat) return cat;
    }
  }

  // 3. Check direct properties on the record
  const directProps = [
    record.category,
    record.cf_category,
    record.order_type,
    record.cf_order_type,
    record.service_type,
    record.segment,
  ];
  for (const p of directProps) {
    const cat = normalizeToCategory(p);
    if (cat) return cat;
  }

  // 4. Check tags array
  if (Array.isArray(record.tags) && record.tags.length > 0) {
    for (const t of record.tags) {
      const tName = typeof t === 'string' ? t : t?.name ?? t?.tag_name ?? '';
      const cat = normalizeToCategory(tName);
      if (cat) return cat;
    }
  }

  // 5. Check customer / contact object if provided
  const cust = fallbackCustomer || record.contact || record.customer;
  if (cust && typeof cust === 'object') {
    const custCfList: any[] = Array.isArray(cust.custom_fields)
      ? cust.custom_fields
      : Array.isArray(cust.customfields)
      ? cust.customfields
      : [];
    for (const cf of custCfList) {
      if (!cf) continue;
      const cat = normalizeToCategory(cf.value ?? cf.value_formatted);
      if (cat) return cat;
    }
    const custCat = normalizeToCategory(cust.category || cust.contact_type || cust.customer_type);
    if (custCat) return custCat;
  }

  // 6. Check Reference Number and Notes
  const textBlob = `${record.reference_number || ''} ${record.notes || ''} ${record.customer_notes || ''}`;
  const textCat = normalizeToCategory(textBlob);
  if (textCat) return textCat;

  // 7. Check Line Items
  if (Array.isArray(record.line_items)) {
    for (const item of record.line_items) {
      const itemText = `${item.name || ''} ${item.description || ''}`;
      const itemCat = normalizeToCategory(itemText);
      if (itemCat) return itemCat;
    }
  }

  // 8. Heuristic detection from customer name or company name
  const nameToCheck = `${record.company_name || ''} ${record.customer_name || ''} ${cust?.company_name || ''} ${cust?.contact_name || ''}`.toLowerCase();
  
  const hotelKeywords = [
    'hotel',
    'resort',
    'villa',
    'villas',
    'suites',
    'inn',
    'sand',
    'sands',
    'beach',
    'retreat',
    'guest house',
    'guesthouse',
    'lodge',
    'residence',
    'apartments',
    'bungalow',
    'cottage',
    'palace',
  ];

  if (hotelKeywords.some((kw) => nameToCheck.includes(kw))) {
    return 'Outside Hotel';
  }

  // Default to Retail for individual/walk-in customer orders
  return 'Retail';
}

/**
 * Normalizes any raw phone number into:
 * 1. WhatsApp click-to-chat compatible international digits (e.g. '94771234567' - no +, spaces, -)
 * 2. Professional human-readable display string (e.g. '+94 77 123 4567')
 */
export function normalizePhoneForOrder(rawPhone?: string): {
  whatsappPhone?: string;
  displayPhone: string;
  hasUsablePhone: boolean;
} {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { displayPhone: 'No phone number', hasUsablePhone: false };
  }

  const cleaned = rawPhone.trim();
  if (!cleaned) {
    return { displayPhone: 'No phone number', hasUsablePhone: false };
  }

  // Extract all numeric digits
  const allDigits = cleaned.replace(/\D/g, '');

  // Sri Lankan Mobile pattern:
  // 9 digits: 7XXXXXXXX
  // 10 digits: 07XXXXXXXX
  // 11 digits: 947XXXXXXXX
  // 12 digits: 00947XXXXXXXX
  let sl9: string | null = null;

  if (allDigits.length === 9 && /^7[01245678]\d{7}$/.test(allDigits)) {
    sl9 = allDigits;
  } else if (allDigits.length === 10 && /^07[01245678]\d{7}$/.test(allDigits)) {
    sl9 = allDigits.slice(1);
  } else if (allDigits.length === 11 && /^947[01245678]\d{7}$/.test(allDigits)) {
    sl9 = allDigits.slice(2);
  } else if (allDigits.length === 12 && /^00947[01245678]\d{7}$/.test(allDigits)) {
    sl9 = allDigits.slice(4);
  } else {
    // Check if a Sri Lankan 9-digit mobile is contained within larger text or digits
    const slSubMatch = allDigits.match(/(?:0|94)?(7[01245678]\d{7})/);
    if (slSubMatch && slSubMatch[1]) {
      sl9 = slSubMatch[1];
    }
  }

  if (sl9) {
    return {
      whatsappPhone: `94${sl9}`,
      displayPhone: `+94 ${sl9.slice(0, 2)} ${sl9.slice(2, 5)} ${sl9.slice(5)}`,
      hasUsablePhone: true,
    };
  }

  // Also try normalizeSriLankanPhone from phoneAuth
  const slNorm = normalizeSriLankanPhone(cleaned);
  if (slNorm.isValid && slNorm.digits) {
    return {
      whatsappPhone: `94${slNorm.digits}`,
      displayPhone: slNorm.formatted || `+94 ${slNorm.digits}`,
      hasUsablePhone: true,
    };
  }

  // International phone fallback (e.g. UK, UAE, US tourists)
  if (allDigits.length >= 9 && allDigits.length <= 15) {
    return {
      whatsappPhone: allDigits,
      displayPhone: cleaned.startsWith('+') ? cleaned : `+${allDigits}`,
      hasUsablePhone: true,
    };
  }

  return {
    displayPhone: 'No phone number',
    hasUsablePhone: false,
  };
}

/**
 * Calculates financial status from raw Zoho status, total, and balance.
 */
export function calculateFinancialStatus(
  rawStatus?: string,
  total = 0,
  balance = 0,
  dueDate?: string
): ZohoOrderFinancialStatus {
  if (total > 0 && balance <= 0) return 'Paid';
  if (total > 0 && balance < total && balance > 0) return 'Partially Paid';

  const s = (rawStatus || '').toLowerCase();
  if (s.includes('partially_paid') || s.includes('partially paid')) return 'Partially Paid';
  if (s.includes('paid')) return 'Paid';
  if (s.includes('overdue')) return 'Overdue';
  if (s.includes('draft')) return 'Draft';
  if (s.includes('void')) return 'Void';

  // Check if past due date with remaining balance
  if (dueDate && balance > 0) {
    const dueTime = new Date(dueDate).getTime();
    const now = Date.now();
    if (!isNaN(dueTime) && dueTime < now - 24 * 60 * 60 * 1000) {
      return 'Overdue';
    }
  }

  return 'Unpaid';
}

/**
 * Formats the exact, strictly validated customer WhatsApp order message:
 *
 * 🧺 Ananke Laundry
 *
 * Hi {{Customer Name}} 👋,
 *
 * Your laundry order has been received successfully.
 *
 * 🧾 Invoice: {{Invoice Number}}
 *
 * 🔗 View your bill & track your order:
 * https://ananke-laundry-service.vercel.app/my-bill
 *
 * Thank you for choosing Ananke Laundry 💚
 */
export function generateCustomerWhatsAppMessage(
  customerName: string,
  invoiceNumber: string
): string {
  const cleanName = cleanWhatsAppText(customerName) || 'Customer';
  const cleanInv = cleanWhatsAppText(invoiceNumber);

  return `🧺 Ananke Laundry\n\nHi ${cleanName} 👋,\n\nYour laundry order has been received successfully.\n\n🧾 Invoice: ${cleanInv}\n\n🔗 View your bill & track your order:\n${SECURE_MY_BILL_URL}\n\nThank you for choosing Ananke Laundry 💚`;
}

interface LiveOrdersCache {
  orders: ZohoOrderRecord[];
  stats: ZohoOrderStats;
  timestamp: number;
}
let lastLiveOrdersCache: LiveOrdersCache | null = null;
const ORDERS_CACHE_TTL_MS = 60 * 1000; // 60 seconds memory cache to prevent exceeding Zoho API rate limits

/**
 * Fetches all orders & invoices from Zoho Books with pagination support,
 * customer phone resolution, and sales-order linking.
 * CONNECTED TO LIVE ZOHO BOOKS API ONLY - NEVER USES DEMO DATA.
 */
export async function getZohoOrderCenterData(options: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  forceRefresh?: boolean;
} = {}): Promise<ZohoOrdersResponse> {
  const page = options.page || 1;
  const perPage = options.perPage || 100;

  if (!isZohoConfigured()) {
    return {
      success: false,
      orders: [],
      stats: {
        totalOrders: 0,
        newOrders: 0,
        paidOrders: 0,
        unpaidOrders: 0,
        partiallyPaidOrders: 0,
        overdueOrders: 0,
        retailOrders: 0,
        outsideHotelOrders: 0,
      },
      isLiveZoho: false,
      page: 1,
      perPage: 100,
      hasMorePage: false,
      message: 'Zoho Books credentials not configured in environment variables.',
    };
  }

  // Return server-side cache if recent and not forced to refresh (protects 10,000 call limit)
  if (!options.forceRefresh && lastLiveOrdersCache && (Date.now() - lastLiveOrdersCache.timestamp < ORDERS_CACHE_TTL_MS)) {
    return {
      success: true,
      orders: lastLiveOrdersCache.orders,
      stats: lastLiveOrdersCache.stats,
      isLiveZoho: true,
      page,
      perPage,
      hasMorePage: false,
    };
  }

  try {
    // 1. Fetch Invoices from Zoho Books (1 efficient single call)
    const invoicesPromise = zohoRequest<{
      code: number;
      invoices: any[];
      page_context?: { has_more_page: boolean };
    }>('/invoices', {
      params: {
        sort_column: 'date',
        sort_order: 'D',
        page,
        per_page: perPage,
      },
    });

    // 2. Fetch Contacts Batch to resolve phones and company names (1 efficient single call)
    const contactsPromise = zohoRequest<{
      code: number;
      contacts: any[];
    }>('/contacts', {
      params: {
        per_page: 200,
      },
    }).catch((err) => {
      console.warn('[Zoho Order Center] Contacts batch fetch warning:', err.message || err);
      return { code: 0, contacts: [] };
    });

    const [invRes, contactsRes] = await Promise.all([
      invoicesPromise,
      contactsPromise,
    ]);

    const invoicesList = Array.isArray(invRes?.invoices) ? invRes.invoices : [];

    // Build customer contacts map (contact_id -> { phone, mobile, contact_name, company_name })
    const contactMap = new Map<string, any>();
    for (const c of contactsRes.contacts || []) {
      if (c.contact_id) {
        contactMap.set(c.contact_id, c);
      }
    }

    const ordersList: ZohoOrderRecord[] = [];
    const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;

    // Map Invoices directly (no individual detail requests to protect rate limit)
    for (const inv of invoicesList) {
      const total = Number(inv.total) || 0;
      const balance = Number(inv.balance) ?? total;
      const amountPaid = Math.max(0, total - balance);
      const contact = contactMap.get(inv.customer_id);

      const rawPhone =
        invoicePhoneCache.get(inv.invoice_id) ||
        extractPhoneFromZohoRecord(inv) ||
        contactPhoneCache.get(inv.customer_id) ||
        extractPhoneFromZohoRecord(contact);

      const phoneInfo = normalizePhoneForOrder(rawPhone);

      const createdMs = inv.created_time ? new Date(inv.created_time).getTime() : 0;
      const isNew = createdMs > twoDaysAgo;

      const financialStatus = calculateFinancialStatus(
        inv.status,
        total,
        balance,
        inv.due_date
      );

      ordersList.push({
        id: inv.invoice_id,
        recordType: 'invoice',
        invoiceId: inv.invoice_id,
        invoiceNumber: inv.invoice_number,
        salesOrderId: inv.salesorder_id,
        salesOrderNumber: inv.salesorder_number,
        customerId: inv.customer_id,
        customerName: inv.customer_name || contact?.contact_name || 'Valued Customer',
        companyName: contact?.company_name,
        email: inv.email || contact?.email,
        phone: phoneInfo.displayPhone,
        whatsappPhone: phoneInfo.whatsappPhone,
        hasUsablePhone: phoneInfo.hasUsablePhone,
        date: inv.date,
        dueDate: inv.due_date,
        total,
        amountPaid,
        balance,
        currencyCode: inv.currency_code || 'LKR',
        currencySymbol: inv.currency_symbol || 'Rs.',
        status: inv.status || 'Sent',
        financialStatus,
        createdTime: inv.created_time,
        updatedTime: inv.last_modified_time,
        isNew,
        referenceNumber: inv.reference_number,
        billingAddress: contact?.billing_address
          ? {
              address: contact.billing_address.address,
              city: contact.billing_address.city,
              state: contact.billing_address.state,
              country: contact.billing_address.country,
              phone: contact.billing_address.phone,
            }
          : undefined,
        category: invoiceCategoryCache.get(inv.invoice_id) || extractCategoryFromZohoRecord(inv, contact),
      });
    }

    // Sort newest first
    ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Compute statistics
    const stats: ZohoOrderStats = {
      totalOrders: ordersList.length,
      newOrders: ordersList.filter((o) => o.isNew).length,
      paidOrders: ordersList.filter((o) => o.financialStatus === 'Paid').length,
      unpaidOrders: ordersList.filter((o) => o.financialStatus === 'Unpaid').length,
      partiallyPaidOrders: ordersList.filter((o) => o.financialStatus === 'Partially Paid').length,
      overdueOrders: ordersList.filter((o) => o.financialStatus === 'Overdue').length,
      retailOrders: ordersList.filter((o) => o.category === 'Retail').length,
      outsideHotelOrders: ordersList.filter((o) => o.category === 'Outside Hotel').length,
    };

    // Update server live cache
    lastLiveOrdersCache = {
      orders: ordersList,
      stats,
      timestamp: Date.now(),
    };

    return {
      success: true,
      orders: ordersList,
      stats,
      isLiveZoho: true,
      page,
      perPage,
      hasMorePage: invRes?.page_context?.has_more_page || false,
    };
  } catch (err: any) {
    console.error('[Zoho Order Center] Live Zoho fetch error:', err.message || err);

    // If we have cached live orders from a previous successful call, return them!
    if (lastLiveOrdersCache && lastLiveOrdersCache.orders.length > 0) {
      return {
        success: true,
        orders: lastLiveOrdersCache.orders,
        stats: lastLiveOrdersCache.stats,
        isLiveZoho: true,
        page,
        perPage,
        hasMorePage: false,
        message: `Notice: Zoho Books limit reached. Displaying latest live cached orders. (${err.message || '429 Rate Limit'})`,
      };
    }

    // NEVER return demo data! Return actual status
    return {
      success: false,
      orders: [],
      stats: {
        totalOrders: 0,
        newOrders: 0,
        paidOrders: 0,
        unpaidOrders: 0,
        partiallyPaidOrders: 0,
        overdueOrders: 0,
        retailOrders: 0,
        outsideHotelOrders: 0,
      },
      isLiveZoho: true,
      page,
      perPage,
      hasMorePage: false,
      message: err.message || 'Failed to fetch live orders from Zoho Books.',
    };
  }
}

/**
 * Fetches full details including line items for a specific invoice.
 */
export async function getZohoInvoiceFullDetails(invoiceId: string): Promise<ZohoOrderRecord | null> {
  if (isZohoConfigured() && !invoiceId.startsWith('mock-')) {
    try {
      const res = await zohoRequest<{ code: number; invoice: any }>(`/invoices/${invoiceId}`);
      if (res?.invoice) {
        const inv = res.invoice;
        const total = Number(inv.total) || 0;
        const balance = Number(inv.balance) ?? total;
        const amountPaid = Math.max(0, total - balance);
        let rawPhone =
          invoicePhoneCache.get(inv.invoice_id) ||
          extractPhoneFromZohoRecord(inv);

        if (!rawPhone && inv.customer_id) {
          rawPhone =
            contactPhoneCache.get(inv.customer_id) ||
            extractPhoneFromZohoRecord(inv.contact) ||
            extractPhoneFromZohoRecord(inv.customer);
          if (!rawPhone) {
            try {
              const cFull = await zohoRequest<{ code: number; contact: any }>(
                `/contacts/${inv.customer_id}`
              );
              if (cFull?.contact) {
                const cPhone = extractPhoneFromZohoRecord(cFull.contact);
                if (cPhone) {
                  contactPhoneCache.set(inv.customer_id, cPhone);
                  rawPhone = cPhone;
                }
              }
            } catch {
              // Ignore contact detail error
            }
          }
        }

        if (rawPhone) {
          invoicePhoneCache.set(inv.invoice_id, rawPhone);
        }

        const phoneInfo = normalizePhoneForOrder(rawPhone);

        const lineItems: ZohoOrderLineItem[] = (inv.line_items || []).map((li: any) => ({
          itemId: li.item_id,
          name: li.name,
          description: li.description,
          rate: Number(li.rate) || 0,
          quantity: Number(li.quantity) || 1,
          itemTotal: Number(li.item_total) || 0,
        }));

        return {
          id: inv.invoice_id,
          recordType: 'invoice',
          invoiceId: inv.invoice_id,
          invoiceNumber: inv.invoice_number,
          salesOrderId: inv.salesorder_id,
          salesOrderNumber: inv.salesorder_number,
          customerId: inv.customer_id,
          customerName: inv.customer_name,
          phone: phoneInfo.displayPhone,
          whatsappPhone: phoneInfo.whatsappPhone,
          hasUsablePhone: phoneInfo.hasUsablePhone,
          date: inv.date,
          dueDate: inv.due_date,
          total,
          amountPaid,
          balance,
          currencyCode: inv.currency_code || 'LKR',
          currencySymbol: inv.currency_symbol || 'Rs.',
          status: inv.status,
          financialStatus: calculateFinancialStatus(inv.status, total, balance, inv.due_date),
          createdTime: inv.created_time,
          updatedTime: inv.last_modified_time,
          referenceNumber: inv.reference_number,
          notes: inv.notes,
          lineItems,
          billingAddress: inv.billing_address,
          category: invoiceCategoryCache.get(inv.invoice_id) || extractCategoryFromZohoRecord(inv, inv.contact || inv.customer),
        };
      }
    } catch (err: any) {
      console.warn('[Zoho Order Center] Full details fetch failed:', err.message || err);
    }
  }

  // Fallback to cached live orders if available
  if (lastLiveOrdersCache) {
    const cached = lastLiveOrdersCache.orders.find((o) => o.id === invoiceId || o.invoiceNumber === invoiceId);
    if (cached) return cached;
  }
  return null;
}

/**
 * Realistic demonstration orders for local testing and zero-risk fallback.
 * Includes test cases for:
 * - Kasun Perera (INV-00125 - exact prompt specification)
 * - Araliya Beach Resort (ANK-1042 - Paid)
 * - Serenity Villa (ANK-1038 - Partially Paid)
 * - Kushan Jayawardena (ANK-1025 - Unpaid)
 * - An invoice without a phone number to test disabled state
 */
export function getDemoZohoOrders(): ZohoOrderRecord[] {
  const today = new Date().toISOString().split('T')[0];

  return [
    {
      id: 'demo-inv-00125',
      recordType: 'invoice',
      invoiceId: 'demo-inv-00125',
      invoiceNumber: 'INV-00125',
      salesOrderNumber: 'SO-00089',
      customerId: 'demo-cust-kasun',
      customerName: 'Kasun Perera',
      companyName: 'Private Client',
      phone: '+94 77 123 4567',
      whatsappPhone: '94771234567',
      hasUsablePhone: true,
      date: today,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total: 3500,
      amountPaid: 2000,
      balance: 1500,
      currencyCode: 'LKR',
      currencySymbol: 'Rs.',
      status: 'partially_paid',
      financialStatus: 'Partially Paid',
      category: 'Retail',
      createdTime: new Date().toISOString(),
      isNew: true,
      referenceNumber: 'REF-KP-2026',
      billingAddress: {
        address: 'No. 45, Beach Road',
        city: 'Unawatuna',
        state: 'Southern Province',
        country: 'Sri Lanka',
      },
      lineItems: [
        {
          itemId: 'item-1',
          name: 'Executive Cotton Shirts Washing & Steam Pressing',
          description: 'Gentle wash with organic detergent & crisp collar pressing',
          rate: 350,
          quantity: 6,
          itemTotal: 2100,
        },
        {
          itemId: 'item-2',
          name: 'Casual Chinos & Trousers Dry Clean',
          description: 'Special stain removal & crease alignment',
          rate: 700,
          quantity: 2,
          itemTotal: 1400,
        },
      ],
    },
    {
      id: 'demo-inv-002018',
      recordType: 'invoice',
      invoiceId: 'demo-inv-002018',
      invoiceNumber: '002018',
      salesOrderNumber: 'SO-00084',
      customerId: 'demo-cust-araliya',
      customerName: 'Araliya Beach Resort & Spa',
      companyName: 'Araliya Hotels Galle (Pvt) Ltd',
      phone: '+94 77 123 4567',
      whatsappPhone: '94771234567',
      hasUsablePhone: true,
      date: '2026-09-28',
      dueDate: '2026-10-05',
      total: 4800,
      amountPaid: 4800,
      balance: 0,
      currencyCode: 'LKR',
      currencySymbol: 'Rs.',
      status: 'paid',
      financialStatus: 'Paid',
      category: 'Outside Hotel',
      createdTime: '2026-09-28T09:15:00Z',
      isNew: false,
      referenceNumber: 'HOSP-OCT-BATCH',
      billingAddress: {
        address: 'Lighthouse Street, Galle Fort',
        city: 'Galle',
        state: 'Southern Province',
        country: 'Sri Lanka',
      },
      lineItems: [
        {
          itemId: 'item-3',
          name: 'Hotel Linen Batch Care & Pressing',
          description: 'Commercial hospitality wash & sanitization',
          rate: 300,
          quantity: 12,
          itemTotal: 3600,
        },
        {
          itemId: 'item-4',
          name: 'Express Dry Cleaning & Sanitization',
          description: 'Same-day turnaround for guest suites',
          rate: 1200,
          quantity: 1,
          itemTotal: 1200,
        },
      ],
    },
    {
      id: 'demo-inv-1042',
      recordType: 'invoice',
      invoiceId: 'demo-inv-1042',
      invoiceNumber: 'ANK-1042',
      customerId: 'demo-cust-araliya',
      customerName: 'Araliya Beach Resort',
      companyName: 'Araliya Hotels Galle',
      phone: '+94 77 123 4567',
      whatsappPhone: '94771234567',
      hasUsablePhone: true,
      date: '2026-09-25',
      dueDate: '2026-10-02',
      total: 4500,
      amountPaid: 4500,
      balance: 0,
      currencyCode: 'LKR',
      currencySymbol: 'Rs.',
      status: 'paid',
      financialStatus: 'Paid',
      category: 'Outside Hotel',
      createdTime: '2026-09-25T14:30:00Z',
      isNew: false,
      lineItems: [
        {
          itemId: 'item-5',
          name: 'Hotel Bed Linen Batch Washing & Ironing',
          rate: 200,
          quantity: 15,
          itemTotal: 3000,
        },
        {
          itemId: 'item-6',
          name: 'Plush Bath & Hand Towels Sanitation',
          rate: 100,
          quantity: 15,
          itemTotal: 1500,
        },
      ],
    },
    {
      id: 'demo-inv-1038',
      recordType: 'invoice',
      invoiceId: 'demo-inv-1038',
      invoiceNumber: 'ANK-1038',
      customerId: 'demo-cust-serenity',
      customerName: 'Serenity Villa Unawatuna',
      companyName: 'Serenity Hospitality Group',
      phone: '+94 71 987 6543',
      whatsappPhone: '94719876543',
      hasUsablePhone: true,
      date: '2026-09-20',
      dueDate: '2026-09-27',
      total: 7200,
      amountPaid: 4000,
      balance: 3200,
      currencyCode: 'LKR',
      currencySymbol: 'Rs.',
      status: 'partially_paid',
      financialStatus: 'Partially Paid',
      category: 'Outside Hotel',
      createdTime: '2026-09-20T11:00:00Z',
      isNew: false,
      lineItems: [
        {
          itemId: 'item-7',
          name: 'King Size Duvet Covers & Bed Sheets Care',
          rate: 500,
          quantity: 8,
          itemTotal: 4000,
        },
        {
          itemId: 'item-8',
          name: 'Curtains & Delicate Silk Cushions Gentle Cycle',
          rate: 800,
          quantity: 4,
          itemTotal: 3200,
        },
      ],
    },
    {
      id: 'demo-inv-1025',
      recordType: 'invoice',
      invoiceId: 'demo-inv-1025',
      invoiceNumber: 'ANK-1025',
      customerId: 'demo-cust-kushan',
      customerName: 'Kushan Jayawardena',
      phone: '+94 77 222 3344',
      whatsappPhone: '94772223344',
      hasUsablePhone: true,
      date: '2026-09-15',
      dueDate: '2026-09-22',
      total: 2800,
      amountPaid: 0,
      balance: 2800,
      currencyCode: 'LKR',
      currencySymbol: 'Rs.',
      status: 'overdue',
      financialStatus: 'Overdue',
      category: 'Retail',
      createdTime: '2026-09-15T08:20:00Z',
      isNew: false,
      lineItems: [
        {
          itemId: 'item-9',
          name: 'Formal Linen Shirts Precision Pressing',
          rate: 300,
          quantity: 4,
          itemTotal: 1200,
        },
        {
          itemId: 'item-10',
          name: 'Gentleman Blazer & Trousers Dry Clean',
          rate: 1600,
          quantity: 1,
          itemTotal: 1600,
        },
      ],
    },
    {
      id: 'demo-inv-1011',
      recordType: 'invoice',
      invoiceId: 'demo-inv-1011',
      invoiceNumber: 'ANK-1011',
      customerId: 'demo-cust-nophone',
      customerName: 'Walk-in Boutique Client',
      phone: 'No phone number',
      hasUsablePhone: false,
      date: '2026-09-10',
      dueDate: '2026-09-17',
      total: 1800,
      amountPaid: 0,
      balance: 1800,
      currencyCode: 'LKR',
      currencySymbol: 'Rs.',
      status: 'sent',
      financialStatus: 'Unpaid',
      category: 'Retail',
      createdTime: '2026-09-10T16:00:00Z',
      isNew: false,
      lineItems: [
        {
          itemId: 'item-11',
          name: 'Silk Evening Dress Gentle Care',
          rate: 1800,
          quantity: 1,
          itemTotal: 1800,
        },
      ],
    },
  ];
}
