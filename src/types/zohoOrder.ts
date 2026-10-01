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
}

export interface ZohoOrderStats {
  totalOrders: number;
  newOrders: number;
  paidOrders: number;
  unpaidOrders: number;
  partiallyPaidOrders: number;
  overdueOrders: number;
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
}
