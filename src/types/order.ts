export type LaundryOperationalStatus =
  | 'ORDER RECEIVED'
  | 'WASHING'
  | 'DRYING'
  | 'READY FOR PICKUP'
  | 'DELIVERED';

export type OrderStatus =
  | LaundryOperationalStatus
  | 'Received'
  | 'Processing'
  | 'In Progress'
  | 'Ready'
  | 'Completed'
  | 'Collected'
  | 'Delivered'
  | 'Cancelled';

export type OrderPaymentStatus = 'Paid' | 'Unpaid' | 'Partially Paid';

export interface StatusHistoryEntry {
  id: string;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  date: string;       // e.g. '14 Sep 2026'
  time: string;       // e.g. '03:45 PM'
  timestamp: string;  // ISO string
  changedBy: string;  // e.g. 'Admin (Unawatuna Facility)'
  notes?: string;
  emailSent?: boolean;
  emailRecipient?: string;
  whatsAppPrepared?: boolean;
}

export interface TrackingStageDetail {
  key: LaundryOperationalStatus;
  label: string;
  shortLabel: string;
  description: string;
  order: number;
}

export const LAUNDRY_OPERATIONAL_STAGES: TrackingStageDetail[] = [
  {
    key: 'ORDER RECEIVED',
    label: 'Order Received',
    shortLabel: 'Received',
    description: 'Garments received, inspected & tagged at facility',
    order: 1,
  },
  {
    key: 'WASHING',
    label: 'Washing',
    shortLabel: 'Washing',
    description: 'Eco-friendly deep wash & specialized stain treatment',
    order: 2,
  },
  {
    key: 'DRYING',
    label: 'Drying',
    shortLabel: 'Drying',
    description: 'Controlled temperature drying & moisture extraction',
    order: 3,
  },
  {
    key: 'READY FOR PICKUP',
    label: 'Ready for Pickup',
    shortLabel: 'Ready',
    description: 'Steam pressed, packaged & ready for collection',
    order: 4,
  },
  {
    key: 'DELIVERED',
    label: 'Delivered',
    shortLabel: 'Delivered',
    description: 'Completed and collected or delivered successfully',
    order: 5,
  },
];

export interface OrderTrackingSummary {
  orderId: string;
  invoiceNumber: string;
  currentStatus: LaundryOperationalStatus;
  currentStageIndex: number;
  stages: Array<{
    key: LaundryOperationalStatus;
    label: string;
    shortLabel: string;
    description: string;
    isCompleted: boolean;
    isCurrent: boolean;
    timestamp?: string;
    formattedDate?: string;
    formattedTime?: string;
  }>;
  statusHistory: StatusHistoryEntry[];
  updatedAt: string;
}

export interface OrderRecord {
  orderId: string;                  // e.g. 'ORD-2026-101'
  zohoCustomerId: string;           // Zoho Contact ID
  zohoInvoiceId?: string;           // Zoho Invoice ID if linked
  zohoInvoiceNumber?: string;       // e.g. 'ANK-1042'
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  itemName: string;                 // e.g. 'Commercial Hotel Linen Care & Pressing'
  quantity: number;
  orderDate: string;                // e.g. '2026-09-14'
  expectedCompletionDate: string;   // e.g. '2026-09-16'
  currentStatus: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ZohoCustomerLookupResult {
  customerId: string;
  customerName: string;
  companyName?: string;
  contactPerson?: string;
  email: string;
  phone: string;
  mobile?: string;
  address?: string;
  invoices: Array<{
    invoiceId: string;
    invoiceNumber: string;
    date: string;
    total: number;
    balance: number;
    status: string;
  }>;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
}

export type LaundryServiceType =
  | 'Wash & Fold'
  | 'Wash & Iron'
  | 'Ironing Only'
  | 'Dry Cleaning'
  | 'Other';

export interface WhatsAppOrderData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  services: string[];
  otherServiceDetails?: string;
  items: OrderItem[];
  collectionMethod: 'Pickup Required' | 'I will drop off the clothes';
  pickupAddress?: string;
  pickupDate?: string;
  pickupTime?: string;
  deliveryMethod: 'Delivery Required' | 'I will collect the clothes';
  deliveryAddress?: string;
  sameAsPickupAddress?: boolean;
  specialInstructions?: string;
  imageAttached?: boolean;
  imageFileName?: string;
  createdAt: string;
}
