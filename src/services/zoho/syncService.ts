import { zohoRequest } from './client';
import { isZohoConfigured } from './auth';
import {
  upsertZohoOrders,
  getZohoSyncMetadata,
  setZohoSyncMetadata,
} from '@/lib/storage/zohoOrderStore';
import {
  extractCategoryFromZohoRecord,
  normalizePhoneForOrder,
  calculateFinancialStatus,
} from './ordersService';
import { ZohoOrderRecord } from '@/types/zohoOrder';

export interface SyncResult {
  success: boolean;
  message: string;
  totalSynced: number;
  newRecords: number;
  updatedRecords: number;
  pagesProcessed: number;
  rateLimited?: boolean;
  inProgress?: boolean;
}

// In-memory mutex for request deduplication
let activeSyncPromise: Promise<SyncResult> | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a controlled, sequential, deduplicated synchronization with Zoho Books.
 * Never floods the API. Respects pagination and rate limits.
 * All records are upserted into persistent SQLite storage.
 */
export async function syncZohoOrders(options: { forceFull?: boolean } = {}): Promise<SyncResult> {
  // 1. Check if sync is already running (Request Deduplication)
  if (activeSyncPromise) {
    console.log('[Zoho Sync] Sync already in progress, returning existing job promise.');
    return activeSyncPromise;
  }

  activeSyncPromise = (async (): Promise<SyncResult> => {
    if (!isZohoConfigured()) {
      return {
        success: false,
        message: 'Zoho Books credentials not configured. Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN.',
        totalSynced: 0,
        newRecords: 0,
        updatedRecords: 0,
        pagesProcessed: 0,
      };
    }

    setZohoSyncMetadata('is_syncing', 'true');
    setZohoSyncMetadata('last_sync_status', 'in_progress');
    setZohoSyncMetadata('last_sync_message', 'Synchronizing with Zoho Books...');

    console.log('[Zoho Sync] Starting controlled Zoho Books order synchronization...');

    const meta = getZohoSyncMetadata();
    const isIncremental = !options.forceFull && Boolean(meta.lastSuccessfulSync);

    let totalNew = 0;
    let totalUpdated = 0;
    let pagesProcessed = 0;
    let latestModifiedTime = meta.lastModifiedTime;
    let rateLimited = false;

    try {
      // 1. Batch fetch contacts to resolve phones & company names in ONE single call (Contact Deduplication)
      console.log('[Zoho Sync] Fetching batch contacts (1 request)...');
      let contactsList: any[] = [];
      try {
        const contactsRes = await zohoRequest<{ code: number; contacts: any[] }>('/contacts', {
          params: { per_page: 200 },
        });
        contactsList = contactsRes.contacts || [];
      } catch (err: any) {
        console.warn('[Zoho Sync] Contacts batch warning (non-fatal):', err.message || err);
      }

      const contactMap = new Map<string, any>();
      for (const c of contactsList) {
        if (c.contact_id) {
          contactMap.set(c.contact_id, c);
        }
      }

      // 2. Sequential pagination loop (Controlled Concurrency - 1 page at a time)
      let page = 1;
      let hasMore = true;
      const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
      const MAX_PAGES = isIncremental ? 2 : 10; // Incremental checks newest 2 pages; full sync up to 10 pages

      while (hasMore && page <= MAX_PAGES) {
        console.log(`[Zoho Sync] Processing page ${page}...`);

        const queryParams: Record<string, any> = {
          sort_column: 'date',
          sort_order: 'D',
          page,
          per_page: 100,
        };

        let invRes: { code: number; invoices: any[]; page_context?: { has_more_page: boolean } };
        try {
          invRes = await zohoRequest('/invoices', { params: queryParams });
        } catch (err: any) {
          const errMsg = err.message || String(err);
          if (errMsg.includes('429') || errMsg.includes('rate limit') || errMsg.includes('10,000')) {
            console.warn('[Zoho Sync] ⚠️ Rate limit 429 detected during invoice fetch. Halting sync cleanly.');
            rateLimited = true;
            break;
          }
          throw err;
        }

        const rawInvoices = invRes?.invoices || [];
        if (rawInvoices.length === 0) {
          console.log(`[Zoho Sync] Page ${page} returned 0 records. Ending pagination.`);
          break;
        }

        pagesProcessed++;
        const mappedOrders: ZohoOrderRecord[] = [];

        for (const inv of rawInvoices) {
          const total = Number(inv.total) || 0;
          const balance = Number(inv.balance) ?? total;
          const amountPaid = Math.max(0, total - balance);
          const contact = contactMap.get(inv.customer_id);

          // Resolve phone strictly from existing fields or cached contacts (Zero N+1 calls)
          const rawPhone =
            inv.phone ||
            inv.mobile ||
            contact?.mobile ||
            contact?.phone ||
            contact?.billing_address?.phone;

          const phoneInfo = normalizePhoneForOrder(rawPhone);
          const createdMs = inv.created_time ? new Date(inv.created_time).getTime() : 0;
          const isNew = createdMs > twoDaysAgo;

          const financialStatus = calculateFinancialStatus(
            inv.status,
            total,
            balance,
            inv.due_date
          );

          // Local in-memory categorization (Zero extra API calls)
          const category = extractCategoryFromZohoRecord(inv, contact);

          mappedOrders.push({
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
            category,
          });

          // Track latest modified time
          if (inv.last_modified_time) {
            if (!latestModifiedTime || new Date(inv.last_modified_time) > new Date(latestModifiedTime)) {
              latestModifiedTime = inv.last_modified_time;
            }
          }
        }

        // Upsert page records immediately into SQLite
        const { inserted, updated } = upsertZohoOrders(mappedOrders);
        totalNew += inserted;
        totalUpdated += updated;

        console.log(
          `[Zoho Sync] Page ${page} complete: ${inserted} new, ${updated} updated in SQLite cache.`
        );

        hasMore = Boolean(invRes?.page_context?.has_more_page);
        page++;

        // Gentle pause between pages to stay safely below rate limits
        if (hasMore && page <= MAX_PAGES) {
          await sleep(500);
        }
      }

      // 3. Finalize metadata
      const now = new Date().toISOString();
      setZohoSyncMetadata('is_syncing', 'false');

      if (rateLimited) {
        setZohoSyncMetadata('last_sync_status', 'rate_limited');
        setZohoSyncMetadata(
          'last_sync_message',
          'Zoho Books rate limit reached (10,000 calls/day). Existing cached orders preserved.'
        );
        return {
          success: false,
          rateLimited: true,
          message: 'Zoho Books rate limit reached. All previously synchronized orders remain safely available.',
          totalSynced: totalNew + totalUpdated,
          newRecords: totalNew,
          updatedRecords: totalUpdated,
          pagesProcessed,
        };
      }

      setZohoSyncMetadata('last_successful_sync', now);
      setZohoSyncMetadata('last_sync_status', 'success');
      setZohoSyncMetadata(
        'last_sync_message',
        `Sync completed successfully (${totalNew} new, ${totalUpdated} updated).`
      );
      if (latestModifiedTime) {
        setZohoSyncMetadata('last_modified_time', latestModifiedTime);
      }

      console.log(
        `[Zoho Sync] Completed! Pages: ${pagesProcessed}, New: ${totalNew}, Updated: ${totalUpdated}.`
      );

      return {
        success: true,
        message: `Successfully synchronized ${totalNew + totalUpdated} orders from Zoho Books.`,
        totalSynced: totalNew + totalUpdated,
        newRecords: totalNew,
        updatedRecords: totalUpdated,
        pagesProcessed,
      };
    } catch (err: any) {
      console.error('[Zoho Sync] Unexpected error during sync:', err.message || err);
      setZohoSyncMetadata('is_syncing', 'false');
      const is429 = err.message?.includes('429') || err.message?.includes('rate limit');
      setZohoSyncMetadata('last_sync_status', is429 ? 'rate_limited' : 'error');
      setZohoSyncMetadata('last_sync_message', err.message || 'Sync failed');

      return {
        success: false,
        rateLimited: is429,
        message: err.message || 'Synchronization failed. Existing cached orders preserved.',
        totalSynced: totalNew + totalUpdated,
        newRecords: totalNew,
        updatedRecords: totalUpdated,
        pagesProcessed,
      };
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
}
