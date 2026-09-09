/**
 * Quote & Commercial Laundry Domain Types
 */

export type PropertyType =
  | 'Hotel'
  | 'Resort'
  | 'Villa'
  | 'Guest House'
  | 'Restaurant'
  | 'Spa'
  | 'Airbnb / Holiday Rental'
  | 'Individual / Residential'
  | 'Other';

export type ServiceFrequency =
  | 'One-time'
  | 'Daily'
  | 'Weekly'
  | 'Multiple times per week'
  | 'Monthly'
  | 'Custom';

export type SyncStatus =
  | 'synced'                 // Successfully matched or created in Zoho Books
  | 'pending'                // Staged locally, waiting for sync execution
  | 'pending_configuration'  // Saved safely locally, awaiting Zoho Books API keys in .env
  | 'failed';                // Attempted sync but Zoho API responded with an error

export interface QuoteSubmission {
  name: string;
  businessName?: string;
  phone: string;
  email: string;
  propertyType?: PropertyType;
  serviceRequired: string;
  laundryType?: string;
  laundryVolume?: string;
  frequency?: ServiceFrequency;
  address?: string;
  message: string;
  botField?: string; // Honeypot anti-spam
}

export interface EnquiryRecord {
  id: string;                      // local_enquiry_id (UUID / CUID / timestamp-based)
  createdAt: string;               // ISO 8601 string
  updatedAt: string;
  customerName: string;
  businessName?: string;
  phone: string;
  email: string;
  propertyType?: PropertyType;
  serviceRequired: string;
  laundryType?: string;
  laundryVolume?: string;
  frequency?: ServiceFrequency;
  address?: string;
  message: string;

  // Zoho Books Integration Mapping
  zohoCustomerId?: string;         // zoho_customer_id from Zoho Books Contacts
  zohoEstimateId?: string;         // zoho_estimate_id from Zoho Books Estimates
  syncStatus: SyncStatus;
  syncAttempts: number;
  lastSyncAttempt?: string;
  syncError?: string;
}

export interface SyncLogEntry {
  id: string;
  enquiryId: string;
  action: 'customer_lookup' | 'customer_create' | 'customer_update' | 'estimate_create' | 'manual_retry';
  status: 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: string;
}

export interface SyncStats {
  totalEnquiries: number;
  syncedCount: number;
  pendingCount: number;
  failedCount: number;
  lastSyncTime?: string;
}
