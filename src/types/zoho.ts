/**
 * Zoho Books API Types & Interfaces
 * Used for secure server-side communication with Zoho Books.
 */

export interface ZohoAuthConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  organizationId: string;
  dc: 'com' | 'in' | 'eu' | 'com.au';
}

export interface ZohoTokenResponse {
  access_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

export interface ZohoAddress {
  address?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

export interface ZohoContactPerson {
  contact_person_id?: string;
  salutation?: string;
  first_name: string;
  last_name?: string;
  email: string;
  phone?: string;
  mobile?: string;
  is_primary_contact?: boolean;
}

export interface ZohoContact {
  contact_id?: string;
  contact_name: string; // e.g. Customer Name or Business Name
  company_name?: string;
  customer_sub_type?: 'individual' | 'business';
  email?: string;
  phone?: string;
  mobile?: string;
  billing_address?: ZohoAddress;
  shipping_address?: ZohoAddress;
  notes?: string;
  contact_persons?: ZohoContactPerson[];
  created_time?: string;
  last_modified_time?: string;
  outstanding_receivable_amount?: number;
}

export interface ZohoCustomerSearchResponse {
  code: number;
  message: string;
  contacts: ZohoContact[];
  page_context?: {
    page: number;
    per_page: number;
    has_more_page: boolean;
  };
}

export interface ZohoEstimateLineItem {
  item_id?: string;
  name: string;
  description?: string;
  rate?: number;
  quantity?: number;
  unit?: string;
  item_total?: number;
}

export interface ZohoEstimate {
  estimate_id?: string;
  estimate_number?: string;
  customer_id: string;
  customer_name?: string;
  date?: string;
  expiry_date?: string;
  status?: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'invoiced' | 'void';
  line_items: ZohoEstimateLineItem[];
  sub_total?: number;
  total?: number;
  reference_number?: string;
  notes?: string;
  terms?: string;
}

export type ZohoPaymentStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Partially Paid'
  | 'Paid'
  | 'Overdue'
  | 'Void'
  | 'Unknown';

export interface ZohoInvoice {
  invoice_id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  status: string; // Zoho raw status
  payment_status: ZohoPaymentStatus;
  date: string;
  due_date: string;
  total: number;
  balance: number;
  currency_code: string;
  currency_symbol: string;
  created_time: string;
}

export interface ZohoApiResponse<T = unknown> {
  code: number;
  message: string;
  [key: string]: unknown;
}

export interface ZohoApiError {
  code: number;
  message: string;
  details?: Record<string, unknown>;
}
