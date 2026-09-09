import { EnquiryRecord } from '@/types/quote';
import { enquiryRepository } from '@/lib/storage/enquiryRepository';
import { isZohoConfigured } from './auth';
import { findZohoCustomer, createZohoCustomer, updateZohoCustomer } from './contacts';

export interface SyncResult {
  success: boolean;
  zohoCustomerId?: string;
  isExistingCustomer?: boolean;
  status: 'synced' | 'pending_configuration' | 'failed';
  message: string;
}

export async function syncEnquiryToZoho(enquiry: EnquiryRecord): Promise<SyncResult> {
  if (!isZohoConfigured()) {
    await enquiryRepository.updateEnquiryZohoMapping(enquiry.id, {
      syncStatus: 'pending_configuration',
      syncError: 'Awaiting Zoho Books API credentials in environment variables (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORGANIZATION_ID).',
    });

    await enquiryRepository.addSyncLog({
      enquiryId: enquiry.id,
      action: 'customer_lookup',
      status: 'skipped',
      message: 'Zoho credentials not configured. Staged safely in pending_configuration queue.',
    });

    return {
      success: false,
      status: 'pending_configuration',
      message: 'Enquiry staged safely. Live Zoho sync will execute once API credentials are configured.',
    };
  }

  try {
    const existingCustomer = await findZohoCustomer(enquiry.email, enquiry.phone);

    let zohoCustomerId: string;
    let isExisting = false;

    if (existingCustomer?.contact_id) {
      isExisting = true;
      zohoCustomerId = existingCustomer.contact_id;

      try {
        await updateZohoCustomer(zohoCustomerId, {
          name: enquiry.customerName,
          businessName: enquiry.businessName,
          phone: enquiry.phone,
          email: enquiry.email,
          propertyType: enquiry.propertyType,
          serviceRequired: enquiry.serviceRequired,
          laundryType: enquiry.laundryType,
          laundryVolume: enquiry.laundryVolume,
          frequency: enquiry.frequency,
          address: enquiry.address,
          message: enquiry.message,
        });
      } catch (updateErr) {
        console.warn('[Zoho Sync] Non-blocking notice: Could not update existing customer contact fields:', updateErr);
      }

      await enquiryRepository.addSyncLog({
        enquiryId: enquiry.id,
        action: 'customer_lookup',
        status: 'success',
        message: `Matched existing Zoho Books customer ID: ${zohoCustomerId}`,
      });
    } else {
      const newCustomer = await createZohoCustomer({
        name: enquiry.customerName,
        businessName: enquiry.businessName,
        phone: enquiry.phone,
        email: enquiry.email,
        propertyType: enquiry.propertyType,
        serviceRequired: enquiry.serviceRequired,
        laundryType: enquiry.laundryType,
        laundryVolume: enquiry.laundryVolume,
        frequency: enquiry.frequency,
        address: enquiry.address,
        message: enquiry.message,
      });

      if (!newCustomer?.contact_id) {
        throw new Error('Zoho Books did not return a valid contact_id');
      }

      zohoCustomerId = newCustomer.contact_id;

      await enquiryRepository.addSyncLog({
        enquiryId: enquiry.id,
        action: 'customer_create',
        status: 'success',
        message: `Created new Zoho Books customer ID: ${zohoCustomerId}`,
      });
    }

    await enquiryRepository.updateEnquiryZohoMapping(enquiry.id, {
      zohoCustomerId,
      syncStatus: 'synced',
      syncError: undefined,
    });

    return {
      success: true,
      status: 'synced',
      zohoCustomerId,
      isExistingCustomer: isExisting,
      message: isExisting
        ? `Successfully matched with existing Zoho customer (${zohoCustomerId})`
        : `Successfully created customer in Zoho Books (${zohoCustomerId})`,
    };
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown Zoho synchronization error';
    console.error('[Zoho Sync Failure]', { enquiryId: enquiry.id, error: errorMsg });

    await enquiryRepository.updateEnquiryZohoMapping(enquiry.id, {
      syncStatus: 'failed',
      syncError: errorMsg,
    });

    await enquiryRepository.addSyncLog({
      enquiryId: enquiry.id,
      action: 'customer_create',
      status: 'failed',
      message: `Sync failed: ${errorMsg}`,
    });

    return {
      success: false,
      status: 'failed',
      message: errorMsg,
    };
  }
}

export async function retrySyncEnquiry(enquiryId: string): Promise<SyncResult> {
  const enquiry = await enquiryRepository.getEnquiryById(enquiryId);
  if (!enquiry) {
    return {
      success: false,
      status: 'failed',
      message: `Enquiry with ID ${enquiryId} not found`,
    };
  }

  await enquiryRepository.addSyncLog({
    enquiryId,
    action: 'manual_retry',
    status: 'success',
    message: 'Manual retry initiated by administrator',
  });

  return syncEnquiryToZoho(enquiry);
}
