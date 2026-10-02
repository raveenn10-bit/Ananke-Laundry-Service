import path from 'path';
import fs from 'fs';
import { ZohoOrderRecord, ZohoOrderStats, ZohoOrderFinancialStatus } from '@/types/zohoOrder';

export interface ZohoSyncMetadata {
  lastSuccessfulSync: string | null;
  lastSyncStatus: 'idle' | 'in_progress' | 'success' | 'rate_limited' | 'error';
  lastSyncMessage: string;
  lastModifiedTime: string | null;
  totalSynced: number;
  isSyncing: boolean;
}

let dbInstance: any = null;
let fallbackStore: {
  orders: Map<string, ZohoOrderRecord>;
  contacts: Map<string, any>;
  meta: Map<string, string>;
} | null = null;
let isUsingFallback = false;

function resolveDataDirectory(): string {
  const isVercel = Boolean(process.env.VERCEL);
  const baseDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
  if (!fs.existsSync(baseDir)) {
    try {
      fs.mkdirSync(baseDir, { recursive: true });
    } catch {
      // In read-only fallback to /tmp
      return '/tmp';
    }
  }
  return baseDir;
}

function getDatabase(): any {
  if (dbInstance || fallbackStore) return dbInstance || fallbackStore;

  const dataDir = resolveDataDirectory();
  const dbPath = path.join(dataDir, 'ananke.db');

  try {
    // Attempt to load better-sqlite3
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    // Create tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS zoho_orders (
        id TEXT PRIMARY KEY,
        zoho_invoice_id TEXT UNIQUE NOT NULL,
        invoice_number TEXT NOT NULL,
        sales_order_number TEXT,
        customer_id TEXT,
        customer_name TEXT NOT NULL,
        company_name TEXT,
        phone TEXT,
        mobile TEXT,
        whatsapp_phone TEXT,
        has_usable_phone INTEGER DEFAULT 0,
        email TEXT,
        invoice_date TEXT NOT NULL,
        due_date TEXT,
        status TEXT NOT NULL,
        financial_status TEXT NOT NULL,
        total REAL NOT NULL,
        balance REAL NOT NULL,
        amount_paid REAL NOT NULL,
        currency TEXT DEFAULT 'LKR',
        currency_symbol TEXT DEFAULT 'Rs.',
        category TEXT NOT NULL,
        last_modified_time TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        raw_data TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_zoho_orders_inv_num ON zoho_orders(invoice_number);
      CREATE INDEX IF NOT EXISTS idx_zoho_orders_cust_id ON zoho_orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_zoho_orders_date ON zoho_orders(invoice_date);
      CREATE INDEX IF NOT EXISTS idx_zoho_orders_cat ON zoho_orders(category);
      CREATE INDEX IF NOT EXISTS idx_zoho_orders_status ON zoho_orders(financial_status);

      CREATE TABLE IF NOT EXISTS zoho_contacts (
        contact_id TEXT PRIMARY KEY,
        contact_name TEXT NOT NULL,
        company_name TEXT,
        phone TEXT,
        mobile TEXT,
        whatsapp_phone TEXT,
        email TEXT,
        raw_data TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_zoho_contacts_name ON zoho_contacts(contact_name);
      CREATE INDEX IF NOT EXISTS idx_zoho_contacts_company ON zoho_contacts(company_name);

      CREATE TABLE IF NOT EXISTS zoho_sync_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    dbInstance = db;
    isUsingFallback = false;
    return dbInstance;
  } catch (err) {
    console.warn('[ZohoOrderStore] Native SQLite unavailable, activating resilient local JSON store:', err);
    isUsingFallback = true;
    fallbackStore = initFallbackStore(dataDir);
    return fallbackStore;
  }
}

const FALLBACK_FILE_NAME = 'zoho_orders_cache.json';

function initFallbackStore(dataDir: string) {
  const filePath = path.join(dataDir, FALLBACK_FILE_NAME);
  const orders = new Map<string, ZohoOrderRecord>();
  const contacts = new Map<string, any>();
  const meta = new Map<string, string>();

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data.orders)) {
        for (const o of data.orders) {
          orders.set(o.invoiceId || o.id, o);
        }
      }
      if (Array.isArray(data.contacts)) {
        for (const c of data.contacts) {
          if (c.contact_id) {
            contacts.set(c.contact_id, c);
          }
        }
      }
      if (data.meta && typeof data.meta === 'object') {
        for (const [k, v] of Object.entries(data.meta)) {
          meta.set(k, String(v));
        }
      }
    } catch (e) {
      console.warn('[ZohoOrderStore] Error reading fallback file, initialized empty:', e);
    }
  }

  return { orders, contacts, meta };
}

function persistFallbackStore() {
  if (!fallbackStore) return;
  const dataDir = resolveDataDirectory();
  const filePath = path.join(dataDir, FALLBACK_FILE_NAME);
  try {
    const serialized = {
      orders: Array.from(fallbackStore.orders.values()),
      contacts: Array.from(fallbackStore.contacts?.values() || []),
      meta: Object.fromEntries(fallbackStore.meta.entries()),
      savedAt: new Date().toISOString(),
    };
    const tmp = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmp, JSON.stringify(serialized, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  } catch (e) {
    console.warn('[ZohoOrderStore] Could not write fallback cache to disk:', e);
  }
}

/**
 * Upsert orders into persistent storage.
 * New orders are inserted; existing orders are updated.
 */
export function upsertZohoOrders(orders: ZohoOrderRecord[]): {
  inserted: number;
  updated: number;
} {
  if (!orders || orders.length === 0) return { inserted: 0, updated: 0 };
  const db = getDatabase();
  const now = new Date().toISOString();

  if (isUsingFallback) {
    let inserted = 0;
    let updated = 0;
    for (const ord of orders) {
      const key = ord.invoiceId || ord.id;
      if (fallbackStore!.orders.has(key)) {
        updated++;
      } else {
        inserted++;
      }
      fallbackStore!.orders.set(key, ord);
    }
    persistFallbackStore();
    return { inserted, updated };
  }

  const checkStmt = db.prepare(`SELECT zoho_invoice_id, updated_at FROM zoho_orders WHERE zoho_invoice_id = ?`);
  const insertStmt = db.prepare(`
    INSERT INTO zoho_orders (
      id,
      zoho_invoice_id,
      invoice_number,
      sales_order_number,
      customer_id,
      customer_name,
      company_name,
      phone,
      mobile,
      whatsapp_phone,
      has_usable_phone,
      email,
      invoice_date,
      due_date,
      status,
      financial_status,
      total,
      balance,
      amount_paid,
      currency,
      currency_symbol,
      category,
      last_modified_time,
      created_at,
      updated_at,
      raw_data
    ) VALUES (
      @id,
      @zoho_invoice_id,
      @invoice_number,
      @sales_order_number,
      @customer_id,
      @customer_name,
      @company_name,
      @phone,
      @mobile,
      @whatsapp_phone,
      @has_usable_phone,
      @email,
      @invoice_date,
      @due_date,
      @status,
      @financial_status,
      @total,
      @balance,
      @amount_paid,
      @currency,
      @currency_symbol,
      @category,
      @last_modified_time,
      @created_at,
      @updated_at,
      @raw_data
    )
  `);

  const updateStmt = db.prepare(`
    UPDATE zoho_orders SET
      invoice_number = @invoice_number,
      sales_order_number = @sales_order_number,
      customer_id = @customer_id,
      customer_name = @customer_name,
      company_name = @company_name,
      phone = @phone,
      mobile = @mobile,
      whatsapp_phone = @whatsapp_phone,
      has_usable_phone = @has_usable_phone,
      email = @email,
      invoice_date = @invoice_date,
      due_date = @due_date,
      status = @status,
      financial_status = @financial_status,
      total = @total,
      balance = @balance,
      amount_paid = @amount_paid,
      currency = @currency,
      currency_symbol = @currency_symbol,
      category = @category,
      last_modified_time = @last_modified_time,
      updated_at = @updated_at,
      raw_data = @raw_data
    WHERE zoho_invoice_id = @zoho_invoice_id
  `);

  let inserted = 0;
  let updated = 0;

  const runUpsertTransaction = db.transaction((records: ZohoOrderRecord[]) => {
    for (const ord of records) {
      const invoiceId = ord.invoiceId || ord.id;
      const existing = checkStmt.get(invoiceId);

      const params = {
        id: invoiceId,
        zoho_invoice_id: invoiceId,
        invoice_number: ord.invoiceNumber,
        sales_order_number: ord.salesOrderNumber || null,
        customer_id: ord.customerId || null,
        customer_name: ord.customerName || 'Valued Customer',
        company_name: ord.companyName || null,
        phone: ord.phone || null,
        mobile: null,
        whatsapp_phone: ord.whatsappPhone || null,
        has_usable_phone: ord.hasUsablePhone ? 1 : 0,
        email: ord.email || null,
        invoice_date: ord.date || now.split('T')[0],
        due_date: ord.dueDate || null,
        status: ord.status || 'Sent',
        financial_status: ord.financialStatus || 'Unpaid',
        total: Number(ord.total) || 0,
        balance: Number(ord.balance) || 0,
        amount_paid: Number(ord.amountPaid) || 0,
        currency: ord.currencyCode || 'LKR',
        currency_symbol: ord.currencySymbol || 'Rs.',
        category: ord.category || 'Retail',
        last_modified_time: ord.updatedTime || null,
        created_at: ord.createdTime || now,
        updated_at: now,
        raw_data: JSON.stringify(ord),
      };

      if (existing) {
        updateStmt.run(params);
        updated++;
      } else {
        insertStmt.run(params);
        inserted++;
      }
    }
  });

  runUpsertTransaction(orders);
  return { inserted, updated };
}

/**
 * Upsert contacts into local persistent storage.
 */
export function upsertZohoContacts(contacts: any[]): number {
  if (!contacts || contacts.length === 0) return 0;
  const db = getDatabase();
  const now = new Date().toISOString();

  if (isUsingFallback) {
    if (!fallbackStore!.contacts) {
      fallbackStore!.contacts = new Map();
    }
    for (const c of contacts) {
      const cId = c.contact_id || c.customer_id;
      if (cId) {
        fallbackStore!.contacts.set(cId, c);
      }
    }
    persistFallbackStore();
    return contacts.length;
  }

  const checkStmt = db.prepare(`SELECT contact_id FROM zoho_contacts WHERE contact_id = ?`);
  const insertStmt = db.prepare(`
    INSERT INTO zoho_contacts (
      contact_id, contact_name, company_name, phone, mobile, whatsapp_phone, email, raw_data, updated_at
    ) VALUES (
      @contact_id, @contact_name, @company_name, @phone, @mobile, @whatsapp_phone, @email, @raw_data, @updated_at
    )
  `);
  const updateStmt = db.prepare(`
    UPDATE zoho_contacts SET
      contact_name = @contact_name,
      company_name = @company_name,
      phone = @phone,
      mobile = @mobile,
      whatsapp_phone = @whatsapp_phone,
      email = @email,
      raw_data = @raw_data,
      updated_at = @updated_at
    WHERE contact_id = @contact_id
  `);

  let count = 0;
  const tx = db.transaction((list: any[]) => {
    for (const c of list) {
      const cId = c.contact_id || c.customer_id;
      if (!cId) continue;
      const existing = checkStmt.get(cId);
      const params = {
        contact_id: cId,
        contact_name: c.contact_name || c.customer_name || c.name || 'Customer',
        company_name: c.company_name || null,
        phone: c.phone || null,
        mobile: c.mobile || null,
        whatsapp_phone: c.whatsapp_number || c.mobile || null,
        email: c.email || null,
        raw_data: JSON.stringify(c),
        updated_at: now,
      };
      if (existing) {
        updateStmt.run(params);
      } else {
        insertStmt.run(params);
      }
      count++;
    }
  });

  tx(contacts);
  return count;
}

export function getCachedContactById(contactId: string): any | null {
  if (!contactId) return null;
  const db = getDatabase();
  if (isUsingFallback) {
    return fallbackStore?.contacts?.get(contactId) || null;
  }
  try {
    const row = db.prepare(`SELECT * FROM zoho_contacts WHERE contact_id = ? LIMIT 1`).get(contactId);
    if (!row) return null;
    return row.raw_data ? JSON.parse(row.raw_data) : row;
  } catch {
    return null;
  }
}

export function getCachedContactByName(name: string): any | null {
  if (!name) return null;
  const db = getDatabase();
  const clean = name.trim().toLowerCase();
  if (isUsingFallback) {
    for (const c of fallbackStore?.contacts?.values() || []) {
      if (
        (c.contact_name && c.contact_name.toLowerCase().trim() === clean) ||
        (c.company_name && c.company_name.toLowerCase().trim() === clean)
      ) {
        return c;
      }
    }
    return null;
  }
  try {
    const row = db
      .prepare(
        `SELECT * FROM zoho_contacts WHERE LOWER(contact_name) = ? OR LOWER(company_name) = ? LIMIT 1`
      )
      .get(clean, clean);
    if (!row) return null;
    return row.raw_data ? JSON.parse(row.raw_data) : row;
  } catch {
    return null;
  }
}

function extractPhoneFromRawObject(obj: any): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  // 1. Direct fields
  const direct = [
    'phone', 'mobile', 'whatsapp', 'whatsapp_number', 'cf_whatsapp_number',
    'cf_whatsapp', 'phone_number', 'mobile_number', 'contact_phone', 'customer_phone'
  ];
  for (const k of direct) {
    if (obj[k]) {
      const s = String(obj[k]).trim();
      const digits = s.replace(/\D/g, '');
      if (digits.length >= 7) return s;
    }
  }

  // 2. Custom fields
  const cfList = Array.isArray(obj.custom_fields)
    ? obj.custom_fields
    : Array.isArray(obj.customfields)
    ? obj.customfields
    : [];
  for (const cf of cfList) {
    if (!cf || typeof cf !== 'object') continue;
    const label = String(cf.label || cf.placeholder || cf.api_name || '').toLowerCase();
    if (label.includes('phone') || label.includes('mobile') || label.includes('whatsapp') || label.includes('contact') || label.includes('tel')) {
      const v = cf.value ?? cf.value_formatted ?? cf.unformatted_value;
      if (v) {
        const s = String(v).trim();
        const digits = s.replace(/\D/g, '');
        if (digits.length >= 7) return s;
      }
    }
  }

  // 3. Custom field hash
  if (obj.custom_field_hash && typeof obj.custom_field_hash === 'object') {
    for (const [k, v] of Object.entries(obj.custom_field_hash)) {
      const key = k.toLowerCase();
      if (key.includes('phone') || key.includes('mobile') || key.includes('whatsapp') || key.includes('tel')) {
        const s = String(v).trim();
        const digits = s.replace(/\D/g, '');
        if (digits.length >= 7) return s;
      }
    }
  }

  // 4. Reference, notes, or attention
  const refText = `${obj.reference_number || ''} ${obj.reference || ''} ${obj.notes || ''} ${obj.customer_notes || ''} ${obj.attention || ''}`;
  const slMatch = refText.replace(/[\s\-\.\(\)]/g, '').match(/(?:0|94)?(7[01245678]\d{7})/);
  if (slMatch && slMatch[1]) {
    return slMatch[1];
  }

  // Sri Lanka Landline in reference or notes (e.g. 0912250777 or 0112345678)
  const landlineMatch = refText.replace(/[\s\-\.\(\)]/g, '').match(/(?:0|94)?((?:11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91)\d{7})/);
  if (landlineMatch && landlineMatch[1]) {
    return `0${landlineMatch[1]}`;
  }

  return undefined;
}

function normalizeDigitsToPhone(raw: string): { displayPhone: string; whatsappPhone?: string; hasUsablePhone: boolean } {
  const digits = raw.replace(/\D/g, '');
  if (!digits || digits.length < 7) {
    return { displayPhone: 'No phone number', hasUsablePhone: false };
  }

  // Sri Lanka 9-digit mobile starting with 7
  let sl9: string | null = null;
  if (digits.length === 9 && /^7[01245678]\d{7}$/.test(digits)) {
    sl9 = digits;
  } else if (digits.length === 10 && /^07[01245678]\d{7}$/.test(digits)) {
    sl9 = digits.slice(1);
  } else if (digits.length === 11 && /^947[01245678]\d{7}$/.test(digits)) {
    sl9 = digits.slice(2);
  } else if (digits.length === 12 && /^00947[01245678]\d{7}$/.test(digits)) {
    sl9 = digits.slice(4);
  } else {
    const m = digits.match(/(?:0|94)?(7[01245678]\d{7})/);
    if (m && m[1]) sl9 = m[1];
  }

  if (sl9) {
    return {
      whatsappPhone: `94${sl9}`,
      displayPhone: `+94 ${sl9.slice(0, 2)} ${sl9.slice(2, 5)} ${sl9.slice(5)}`,
      hasUsablePhone: true,
    };
  }

  // Sri Lanka 10-digit landline starting with 0
  if (digits.length === 10 && digits.startsWith('0')) {
    const withoutZero = digits.slice(1);
    return {
      whatsappPhone: `94${withoutZero}`,
      displayPhone: `+94 ${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`,
      hasUsablePhone: true,
    };
  }

  // Standard international number
  if (digits.length >= 9 && digits.length <= 15) {
    return {
      whatsappPhone: digits.startsWith('0') ? digits.slice(1) : digits,
      displayPhone: `+${digits}`,
      hasUsablePhone: true,
    };
  }

  return { displayPhone: raw, hasUsablePhone: false };
}

/**
 * Retrieve all cached orders from SQLite database.
 * No Zoho API calls are made here.
 */
export function getAllCachedZohoOrders(options: {
  category?: string;
  search?: string;
  status?: string;
  limit?: number;
} = {}): ZohoOrderRecord[] {
  const db = getDatabase();

  if (isUsingFallback) {
    let list = Array.from(fallbackStore!.orders.values());
    if (options.category) {
      const cat = options.category.toLowerCase();
      list = list.filter((o) => (o.category || '').toLowerCase().includes(cat));
    }
    if (options.status) {
      list = list.filter((o) => o.financialStatus === options.status);
    }
    if (options.search?.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.invoiceNumber.toLowerCase().includes(q) ||
          (o.phone && o.phone.toLowerCase().includes(q)) ||
          (o.companyName && o.companyName.toLowerCase().includes(q))
      );
    }
    list = list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (options.limit && options.limit > 0) {
      list = list.slice(0, options.limit);
    }
    return list;
  }

  let sql = `SELECT * FROM zoho_orders WHERE 1=1`;
  const params: any[] = [];

  if (options.category) {
    sql += ` AND category = ?`;
    params.push(options.category);
  }

  if (options.status) {
    sql += ` AND financial_status = ?`;
    params.push(options.status);
  }

  if (options.search?.trim()) {
    sql += ` AND (invoice_number LIKE ? OR customer_name LIKE ? OR company_name LIKE ? OR phone LIKE ?)`;
    const wildcard = `%${options.search.trim()}%`;
    params.push(wildcard, wildcard, wildcard, wildcard);
  }

  sql += ` ORDER BY invoice_date DESC, created_at DESC`;

  if (options.limit && options.limit > 0) {
    sql += ` LIMIT ?`;
    params.push(options.limit);
  }

  const rows = db.prepare(sql).all(...params);

  return rows.map(mapDbRowToZohoOrderRecord);
}

function mapDbRowToZohoOrderRecord(row: any): ZohoOrderRecord {
  // If full raw_data exists, merge to restore nested structures like lineItems or addresses
  let raw: Partial<ZohoOrderRecord> = {};
  if (row.raw_data) {
    try {
      raw = JSON.parse(row.raw_data);
    } catch {
      raw = {};
    }
  }

  const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
  const createdMs = row.created_at ? new Date(row.created_at).getTime() : 0;

  let phone = row.phone || raw.phone || undefined;
  let whatsappPhone = row.whatsapp_phone || raw.whatsappPhone || undefined;
  let hasUsablePhone = Boolean(row.has_usable_phone);

  // Self-heal missing phones from raw_data or cached contacts
  if (!phone || phone === 'No phone number' || !hasUsablePhone) {
    const rawInv: any = raw;
    const extracted =
      rawInv.phone ||
      rawInv.mobile ||
      (typeof rawInv === 'object' ? extractPhoneFromRawObject(rawInv) : undefined);

    if (extracted) {
      const norm = normalizeDigitsToPhone(extracted);
      if (norm.hasUsablePhone) {
        phone = norm.displayPhone;
        whatsappPhone = norm.whatsappPhone;
        hasUsablePhone = true;
      }
    } else if (row.customer_id) {
      const cachedContact = getCachedContactById(row.customer_id);
      if (cachedContact) {
        const cPhone =
          cachedContact.mobile ||
          cachedContact.phone ||
          (typeof cachedContact === 'object' ? extractPhoneFromRawObject(cachedContact) : undefined);
        if (cPhone) {
          const norm = normalizeDigitsToPhone(cPhone);
          if (norm.hasUsablePhone) {
            phone = norm.displayPhone;
            whatsappPhone = norm.whatsappPhone;
            hasUsablePhone = true;
          }
        }
      } else if (row.customer_name) {
        const cachedByName = getCachedContactByName(row.customer_name);
        if (cachedByName) {
          const cPhone =
            cachedByName.mobile ||
            cachedByName.phone ||
            (typeof cachedByName === 'object' ? extractPhoneFromRawObject(cachedByName) : undefined);
          if (cPhone) {
            const norm = normalizeDigitsToPhone(cPhone);
            if (norm.hasUsablePhone) {
              phone = norm.displayPhone;
              whatsappPhone = norm.whatsappPhone;
              hasUsablePhone = true;
            }
          }
        }
      }
    }
  }

  return {
    ...raw,
    id: row.id || row.zoho_invoice_id,
    recordType: 'invoice',
    invoiceId: row.zoho_invoice_id,
    invoiceNumber: row.invoice_number,
    salesOrderNumber: row.sales_order_number || raw.salesOrderNumber,
    customerId: row.customer_id,
    customerName: row.customer_name,
    companyName: row.company_name || undefined,
    phone,
    whatsappPhone,
    hasUsablePhone,
    email: row.email || undefined,
    date: row.invoice_date,
    dueDate: row.due_date || undefined,
    total: Number(row.total) || 0,
    balance: Number(row.balance) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    currencyCode: row.currency || 'LKR',
    currencySymbol: row.currency_symbol || 'Rs.',
    status: row.status,
    financialStatus: (row.financial_status || 'Unpaid') as ZohoOrderFinancialStatus,
    category: row.category || 'Retail',
    createdTime: row.created_at,
    updatedTime: row.updated_at,
    isNew: createdMs > twoDaysAgo,
  };
}

/**
 * Retrieve single order by ID or Invoice number from SQLite.
 */
export function getCachedOrderById(idOrInvoiceNumber: string): ZohoOrderRecord | null {
  const db = getDatabase();
  const clean = idOrInvoiceNumber.trim();

  if (isUsingFallback) {
    const list = Array.from(fallbackStore!.orders.values());
    const match = list.find((o) => o.id === clean || o.invoiceId === clean || o.invoiceNumber === clean);
    return match || null;
  }

  const row = db
    .prepare(
      `SELECT * FROM zoho_orders WHERE id = ? OR zoho_invoice_id = ? OR invoice_number = ? LIMIT 1`
    )
    .get(clean, clean, clean);

  return row ? mapDbRowToZohoOrderRecord(row) : null;
}

/**
 * Compute statistics directly from cached orders.
 * Defaults to the latest 100 orders.
 */
export function getCachedOrderStats(options: { limit?: number } = { limit: 100 }): ZohoOrderStats {
  const orders = getAllCachedZohoOrders({ limit: options.limit });

  return {
    totalOrders: orders.length,
    newOrders: orders.filter((o) => o.isNew).length,
    paidOrders: orders.filter((o) => o.financialStatus === 'Paid').length,
    unpaidOrders: orders.filter((o) => o.financialStatus === 'Unpaid').length,
    partiallyPaidOrders: orders.filter((o) => o.financialStatus === 'Partially Paid').length,
    overdueOrders: orders.filter((o) => o.financialStatus === 'Overdue').length,
    retailOrders: orders.filter((o) => (o.category || '').toLowerCase().includes('retail')).length,
    outsideHotelOrders: orders.filter(
      (o) => (o.category || '').toLowerCase().includes('outside') || (o.category || '').toLowerCase().includes('hotel')
    ).length,
  };
}

/**
 * Read sync metadata from database.
 */
export function getZohoSyncMetadata(): ZohoSyncMetadata {
  const db = getDatabase();

  const getVal = (k: string): string | null => {
    if (isUsingFallback) {
      return fallbackStore!.meta.get(k) || null;
    }
    const r = db.prepare(`SELECT value FROM zoho_sync_meta WHERE key = ?`).get(k);
    return r ? r.value : null;
  };

  const countOrders = (): number => {
    if (isUsingFallback) return fallbackStore!.orders.size;
    const r = db.prepare(`SELECT COUNT(*) as cnt FROM zoho_orders`).get();
    return r ? Number(r.cnt) : 0;
  };

  const lastSuccessfulSync = getVal('last_successful_sync');
  const lastSyncStatus = (getVal('last_sync_status') || 'idle') as any;
  const lastSyncMessage = getVal('last_sync_message') || 'System ready';
  const lastModifiedTime = getVal('last_modified_time');
  const totalSynced = countOrders();
  const isSyncing = getVal('is_syncing') === 'true';

  return {
    lastSuccessfulSync,
    lastSyncStatus,
    lastSyncMessage,
    lastModifiedTime,
    totalSynced,
    isSyncing,
  };
}

/**
 * Set single sync metadata key-value in database.
 */
export function setZohoSyncMetadata(key: string, value: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  if (isUsingFallback) {
    fallbackStore!.meta.set(key, value);
    persistFallbackStore();
    return;
  }

  db.prepare(`
    INSERT INTO zoho_sync_meta (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value, now);
}
