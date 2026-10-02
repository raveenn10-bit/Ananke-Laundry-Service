export type ZohoOrderFinancialStatus =
  | 'Paid'
  | 'Unpaid'
  | 'Partially Paid'
  | 'Overdue'
  | 'Draft'
  | 'Void';

export interface ZohoOrderLineItem {
  itemId?: string;
  name: string;
  description?: string;
  rate: number;
  quantity: number;
  itemTotal: number;
}

export interface ZohoOrderAddress {
  address?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

export interface ZohoOrderRecord {
  id: string; // Unique identifier (e.g. invoice_id or salesorder_id)
  recordType: 'invoice' | 'salesorder' | 'linked';
  invoiceId?: string;
  invoiceNumber: string;
  salesOrderId?: string;
  salesOrderNumber?: string;
  customerId: string;
  customerName: string;
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string; // Display raw or formatted phone (e.g. +94 77 123 4567)
  whatsappPhone?: string; // WhatsApp click-to-chat compatible number (e.g. 94771234567)
  hasUsablePhone: boolean;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  total: number;
  amountPaid: number;
  balance: number;
  currencyCode: string; // LKR
  currencySymbol: string; // Rs. or LKR
  status: string; // Raw Zoho status (e.g. 'paid', 'sent', 'overdue', 'confirmed')
  financialStatus: ZohoOrderFinancialStatus;
  createdTime?: string;
  updatedTime?: string;
  isNew?: boolean; // Highlighted as NEW
  referenceNumber?: string;
  notes?: string;
  lineItems?: ZohoOrderLineItem[];
  billingAddress?: ZohoOrderAddress;
  category?: 'Retail' | 'Outside Hotel' | string; // 'Retail' or 'Outside Hotel'
}

export interface ZohoOrderStats {
  totalOrders: number;
  newOrders: number;
  paidOrders: number;
  unpaidOrders: number;
  partiallyPaidOrders: number;
  overdueOrders: number;
  retailOrders?: number;
  outsideHotelOrders?: number;
}

export interface ZohoOrdersResponse {
  success: boolean;
  orders: ZohoOrderRecord[];
  stats: ZohoOrderStats;
  isLiveZoho: boolean;
  page: number;
  perPage: number;
  hasMorePage: boolean;
  message?: string;
  syncMeta?: {
    lastSuccessfulSync: string | null;
    lastSyncStatus: string;
    lastSyncMessage: string;
    lastModifiedTime: string | null;
    totalSynced: number;
    isSyncing: boolean;
  };
}

export type WhatsAppOrderStatus = 'received' | 'processing' | 'ready' | 'delivered';
export type WhatsAppTimeSlot = '' | '8-12' | '12-5' | '5-8';
