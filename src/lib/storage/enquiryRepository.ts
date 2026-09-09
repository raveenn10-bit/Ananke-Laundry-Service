import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { EnquiryRecord, QuoteSubmission, SyncLogEntry, SyncStats, SyncStatus } from '@/types/quote';

const DATA_DIR = path.join(process.cwd(), '.data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const LOGS_FILE = path.join(DATA_DIR, 'sync_logs.json');

// Memory cache fallback
let memoryEnquiries: EnquiryRecord[] = [];
let memoryLogs: SyncLogEntry[] = [];
let isInitialized = false;

async function ensureDataFiles(): Promise<void> {
  if (isInitialized) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      const data = await fs.readFile(ENQUIRIES_FILE, 'utf-8');
      memoryEnquiries = JSON.parse(data);
    } catch {
      await fs.writeFile(ENQUIRIES_FILE, JSON.stringify([], null, 2), 'utf-8');
      memoryEnquiries = [];
    }

    try {
      const logData = await fs.readFile(LOGS_FILE, 'utf-8');
      memoryLogs = JSON.parse(logData);
    } catch {
      await fs.writeFile(LOGS_FILE, JSON.stringify([], null, 2), 'utf-8');
      memoryLogs = [];
    }

    isInitialized = true;
  } catch (err) {
    console.warn('[EnquiryRepository] File system warning, utilizing in-memory persistence:', err);
    isInitialized = true;
  }
}

async function persistEnquiries(): Promise<void> {
  try {
    const tempFile = `${ENQUIRIES_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempFile, JSON.stringify(memoryEnquiries, null, 2), 'utf-8');
    await fs.rename(tempFile, ENQUIRIES_FILE);
  } catch (err) {
    console.error('[EnquiryRepository] Failed to write enquiries to disk:', err);
  }
}

async function persistLogs(): Promise<void> {
  try {
    const tempFile = `${LOGS_FILE}.tmp.${Date.now()}`;
    const trimmedLogs = memoryLogs.slice(-500);
    await fs.writeFile(tempFile, JSON.stringify(trimmedLogs, null, 2), 'utf-8');
    await fs.rename(tempFile, LOGS_FILE);
  } catch (err) {
    console.error('[EnquiryRepository] Failed to write logs to disk:', err);
  }
}

export const enquiryRepository = {
  async saveEnquiry(submission: QuoteSubmission, initialStatus: SyncStatus = 'pending'): Promise<EnquiryRecord> {
    await ensureDataFiles();

    const now = new Date().toISOString();
    const id = `enq_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const record: EnquiryRecord = {
      id,
      createdAt: now,
      updatedAt: now,
      customerName: submission.name.trim(),
      businessName: submission.businessName?.trim() || undefined,
      phone: submission.phone.trim(),
      email: submission.email.trim().toLowerCase(),
      propertyType: submission.propertyType,
      serviceRequired: submission.serviceRequired,
      laundryType: submission.laundryType,
      laundryVolume: submission.laundryVolume,
      frequency: submission.frequency,
      address: submission.address?.trim() || undefined,
      message: submission.message.trim(),
      syncStatus: initialStatus,
      syncAttempts: 0,
    };

    memoryEnquiries.unshift(record);
    await persistEnquiries();

    await this.addSyncLog({
      enquiryId: id,
      action: 'customer_lookup',
      status: 'success',
      message: `Enquiry received and staged with status: ${initialStatus}`,
    });

    return record;
  },

  async getEnquiryById(id: string): Promise<EnquiryRecord | null> {
    await ensureDataFiles();
    return memoryEnquiries.find((e) => e.id === id) || null;
  },

  async listEnquiries(filter?: { syncStatus?: SyncStatus; limit?: number }): Promise<EnquiryRecord[]> {
    await ensureDataFiles();
    let result = [...memoryEnquiries];

    if (filter?.syncStatus) {
      result = result.filter((e) => e.syncStatus === filter.syncStatus);
    }

    if (filter?.limit && filter.limit > 0) {
      result = result.slice(0, filter.limit);
    }

    return result;
  },

  async updateEnquiryZohoMapping(
    id: string,
    updates: {
      zohoCustomerId?: string;
      zohoEstimateId?: string;
      syncStatus: SyncStatus;
      syncError?: string;
    }
  ): Promise<EnquiryRecord | null> {
    await ensureDataFiles();
    const index = memoryEnquiries.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const record = memoryEnquiries[index];
    const now = new Date().toISOString();

    record.updatedAt = now;
    record.lastSyncAttempt = now;
    record.syncAttempts += 1;
    record.syncStatus = updates.syncStatus;

    if (updates.zohoCustomerId) {
      record.zohoCustomerId = updates.zohoCustomerId;
    }
    if (updates.zohoEstimateId) {
      record.zohoEstimateId = updates.zohoEstimateId;
    }
    if (updates.syncError !== undefined) {
      record.syncError = updates.syncError;
    }

    memoryEnquiries[index] = record;
    await persistEnquiries();

    return record;
  },

  async getSyncStats(): Promise<SyncStats> {
    await ensureDataFiles();

    const totalEnquiries = memoryEnquiries.length;
    let syncedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    let lastSyncTime: string | undefined;

    for (const record of memoryEnquiries) {
      if (record.syncStatus === 'synced') {
        syncedCount++;
      } else if (record.syncStatus === 'failed') {
        failedCount++;
      } else {
        pendingCount++;
      }

      if (record.lastSyncAttempt) {
        if (!lastSyncTime || new Date(record.lastSyncAttempt) > new Date(lastSyncTime)) {
          lastSyncTime = record.lastSyncAttempt;
        }
      }
    }

    return {
      totalEnquiries,
      syncedCount,
      pendingCount,
      failedCount,
      lastSyncTime,
    };
  },

  async addSyncLog(entry: Omit<SyncLogEntry, 'id' | 'timestamp'>): Promise<void> {
    await ensureDataFiles();

    const log: SyncLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
    };

    memoryLogs.push(log);
    await persistLogs();
  },

  async getSyncLogs(enquiryId?: string): Promise<SyncLogEntry[]> {
    await ensureDataFiles();
    if (enquiryId) {
      return memoryLogs.filter((l) => l.enquiryId === enquiryId);
    }
    return memoryLogs.slice(-100).reverse();
  },
};
