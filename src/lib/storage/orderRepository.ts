import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { OrderRecord, OrderStatus, StatusHistoryEntry } from '@/types/order';

const DATA_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

let memoryOrders: OrderRecord[] = [];
let isInitialized = false;

function formatDateTime(d = new Date()) {
  const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  return { dateStr, timeStr };
}

async function ensureDataFiles(): Promise<void> {
  if (isInitialized) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      const data = await fs.readFile(ORDERS_FILE, 'utf-8');
      memoryOrders = JSON.parse(data);
    } catch {
      await fs.writeFile(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      memoryOrders = [];
    }

    if (memoryOrders.length === 0) {
      await seedInitialOrdersInternal();
    }

    isInitialized = true;
  } catch (err) {
    console.warn('[OrderRepository] Utilizing in-memory persistence:', err);
    if (memoryOrders.length === 0) {
      seedInitialOrdersInternal();
    }
    isInitialized = true;
  }
}

async function persistOrders(): Promise<void> {
  try {
    const tempFile = `${ORDERS_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(memoryOrders, null, 2), 'utf-8');
    await fs.rename(tempFile, ORDERS_FILE);
  } catch (err) {
    console.error('[OrderRepository] Failed to write orders to disk:', err);
  }
}

async function seedInitialOrdersInternal(): Promise<void> {
  const { dateStr, timeStr } = formatDateTime(new Date('2026-09-12T09:30:00Z'));
  const d2 = formatDateTime(new Date('2026-09-13T11:00:00Z'));

  memoryOrders = [
    {
      orderId: 'ORD-2026-1042',
      zohoCustomerId: 'mock-cust-1',
      zohoInvoiceId: 'mock-inv-1042',
      zohoInvoiceNumber: 'ANK-1042',
      customerName: 'Araliya Beach Resort & Spa',
      customerPhone: '0771234567',
      customerEmail: 'frontdesk@araliyagalle.com',
      itemName: 'Commercial Hotel Linen Care & Pressing',
      quantity: 30,
      orderDate: '2026-09-12',
      expectedCompletionDate: '2026-09-15',
      currentStatus: 'Ready',
      paymentStatus: 'Paid',
      notes: 'Priority guest room bedding and plush towels.',
      statusHistory: [
        {
          id: 'hist-1',
          previousStatus: undefined,
          newStatus: 'Received',
          date: dateStr,
          time: timeStr,
          timestamp: '2026-09-12T09:30:00Z',
          changedBy: 'Admin (Reception)',
          notes: 'Batch received at Unawatuna facility.',
        },
        {
          id: 'hist-2',
          previousStatus: 'Received',
          newStatus: 'Processing',
          date: d2.dateStr,
          time: d2.timeStr,
          timestamp: '2026-09-13T11:00:00Z',
          changedBy: 'Plant Supervisor',
          notes: 'Washing in industrial extractor washers.',
          emailSent: true,
          emailRecipient: 'frontdesk@araliyagalle.com',
        },
        {
          id: 'hist-3',
          previousStatus: 'Processing',
          newStatus: 'Ready',
          date: '14 Sep 2026',
          time: '02:30 PM',
          timestamp: '2026-09-14T14:30:00Z',
          changedBy: 'Quality Inspector',
          notes: 'Steam ironed, folded, and quality checked.',
          emailSent: true,
          emailRecipient: 'frontdesk@araliyagalle.com',
          whatsAppPrepared: true,
        },
      ],
      createdAt: '2026-09-12T09:30:00Z',
      updatedAt: '2026-09-14T14:30:00Z',
    },
    {
      orderId: 'ORD-2026-1038',
      zohoCustomerId: 'mock-cust-2',
      zohoInvoiceId: 'mock-inv-1038',
      zohoInvoiceNumber: 'ANK-1038',
      customerName: 'Serenity Villa Unawatuna',
      customerPhone: '0719876543',
      customerEmail: 'manager@serenityvillaunawatuna.com',
      itemName: 'Villa Bedding, Duvet Covers & Steam Pressing',
      quantity: 12,
      orderDate: '2026-09-13',
      expectedCompletionDate: '2026-09-16',
      currentStatus: 'Processing',
      paymentStatus: 'Partially Paid',
      notes: 'Silk cushion covers require delicate temperature.',
      statusHistory: [
        {
          id: 'hist-4',
          previousStatus: undefined,
          newStatus: 'Received',
          date: '13 Sep 2026',
          time: '10:15 AM',
          timestamp: '2026-09-13T10:15:00Z',
          changedBy: 'Admin (Reception)',
        },
        {
          id: 'hist-5',
          previousStatus: 'Received',
          newStatus: 'Processing',
          date: '14 Sep 2026',
          time: '09:00 AM',
          timestamp: '2026-09-14T09:00:00Z',
          changedBy: 'Washing Team',
          notes: 'Special delicate cycle engaged.',
          emailSent: true,
          emailRecipient: 'manager@serenityvillaunawatuna.com',
        },
      ],
      createdAt: '2026-09-13T10:15:00Z',
      updatedAt: '2026-09-14T09:00:00Z',
    },
    {
      orderId: 'ORD-2026-1025',
      zohoCustomerId: 'mock-cust-3',
      zohoInvoiceId: 'mock-inv-1025',
      zohoInvoiceNumber: 'ANK-1025',
      customerName: 'Kushan Jayawardena',
      customerPhone: '0772223344',
      customerEmail: 'kushan.j@gmail.com',
      itemName: 'Guest Garment Care & Formal Wear Dry Cleaning',
      quantity: 5,
      orderDate: '2026-09-14',
      expectedCompletionDate: '2026-09-17',
      currentStatus: 'Received',
      paymentStatus: 'Unpaid',
      notes: '2 linen shirts, 1 two-piece suit.',
      statusHistory: [
        {
          id: 'hist-6',
          previousStatus: undefined,
          newStatus: 'Received',
          date: '14 Sep 2026',
          time: '01:45 PM',
          timestamp: '2026-09-14T13:45:00Z',
          changedBy: 'Admin (Counter)',
          notes: 'Inspected and tagged.',
        },
      ],
      createdAt: '2026-09-14T13:45:00Z',
      updatedAt: '2026-09-14T13:45:00Z',
    },
  ];

  await persistOrders();
}

export const orderRepository = {
  async createOrder(
    data: Omit<OrderRecord, 'orderId' | 'statusHistory' | 'createdAt' | 'updatedAt'>,
    createdBy = 'Admin'
  ): Promise<OrderRecord> {
    await ensureDataFiles();

    const now = new Date();
    const { dateStr, timeStr } = formatDateTime(now);
    const orderNum = 1000 + memoryOrders.length + 1;
    const orderId = `ORD-2026-${orderNum}`;

    const initialHistory: StatusHistoryEntry = {
      id: `hist_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      previousStatus: undefined,
      newStatus: data.currentStatus || 'Received',
      date: dateStr,
      time: timeStr,
      timestamp: now.toISOString(),
      changedBy: createdBy,
      notes: 'Initial order record created.',
    };

    const newOrder: OrderRecord = {
      ...data,
      orderId,
      statusHistory: [initialHistory],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    memoryOrders.unshift(newOrder);
    await persistOrders();

    return newOrder;
  },

  async getOrderById(orderId: string): Promise<OrderRecord | null> {
    await ensureDataFiles();
    return memoryOrders.find((o) => o.orderId === orderId) || null;
  },

  async listOrders(filters?: {
    status?: OrderStatus;
    search?: string;
    customerId?: string;
  }): Promise<OrderRecord[]> {
    await ensureDataFiles();
    let result = [...memoryOrders];

    if (filters?.status) {
      result = result.filter((o) => o.currentStatus === filters.status);
    }

    if (filters?.customerId) {
      result = result.filter((o) => o.zohoCustomerId === filters.customerId);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          o.customerEmail.toLowerCase().includes(q) ||
          (o.zohoInvoiceNumber && o.zohoInvoiceNumber.toLowerCase().includes(q)) ||
          o.itemName.toLowerCase().includes(q)
      );
    }

    return result;
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    changedBy = 'Admin',
    notes?: string,
    emailSent?: boolean,
    emailRecipient?: string,
    whatsAppPrepared?: boolean
  ): Promise<OrderRecord | null> {
    await ensureDataFiles();
    const idx = memoryOrders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) return null;

    const order = memoryOrders[idx];
    const prevStatus = order.currentStatus;

    if (prevStatus === newStatus && !notes) {
      return order;
    }

    const now = new Date();
    const { dateStr, timeStr } = formatDateTime(now);

    const historyEntry: StatusHistoryEntry = {
      id: `hist_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      previousStatus: prevStatus,
      newStatus,
      date: dateStr,
      time: timeStr,
      timestamp: now.toISOString(),
      changedBy,
      notes: notes || `Status updated to ${newStatus}`,
      emailSent,
      emailRecipient,
      whatsAppPrepared,
    };

    order.currentStatus = newStatus;
    order.updatedAt = now.toISOString();
    order.statusHistory.unshift(historyEntry);

    memoryOrders[idx] = order;
    await persistOrders();

    return order;
  },
};
