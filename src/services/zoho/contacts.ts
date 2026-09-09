import { ZohoContact, ZohoCustomerSearchResponse } from '@/types/zoho';
import { QuoteSubmission } from '@/types/quote';
import { zohoRequest } from './client';

export async function findZohoCustomer(email?: string, phone?: string): Promise<ZohoContact | null> {
  if (!email && !phone) return null;

  try {
    if (email) {
      const emailRes = await zohoRequest<ZohoCustomerSearchResponse>('/contacts', {
        params: { email: email.trim().toLowerCase() },
      });

      if (emailRes?.contacts && emailRes.contacts.length > 0) {
        return emailRes.contacts[0];
      }
    }

    if (phone) {
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const phoneRes = await zohoRequest<ZohoCustomerSearchResponse>('/contacts', {
        params: { phone: cleanPhone },
      });

      if (phoneRes?.contacts && phoneRes.contacts.length > 0) {
        return phoneRes.contacts[0];
      }
    }

    return null;
  } catch (err) {
    console.error('[Zoho Contacts] Error searching customer:', err);
    return null;
  }
}

export async function createZohoCustomer(submission: QuoteSubmission): Promise<ZohoContact> {
  const isBusiness = Boolean(submission.businessName && submission.businessName.trim().length > 0);
  
  const contactName = isBusiness
    ? `${submission.businessName!.trim()} (${submission.name.trim()})`
    : submission.name.trim();

  const notes = [
    `Lead Source: Ananke Laundry Website (Unawatuna, Sri Lanka)`,
    submission.propertyType ? `Property Type: ${submission.propertyType}` : null,
    submission.serviceRequired ? `Service Required: ${submission.serviceRequired}` : null,
    submission.laundryType ? `Linen / Laundry Type: ${submission.laundryType}` : null,
    submission.laundryVolume ? `Volume Estimate: ${submission.laundryVolume}` : null,
    submission.frequency ? `Service Frequency: ${submission.frequency}` : null,
    submission.address ? `Address: ${submission.address}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const payload: Record<string, unknown> = {
    contact_name: contactName,
    company_name: submission.businessName?.trim() || undefined,
    customer_sub_type: isBusiness ? 'business' : 'individual',
    email: submission.email.trim().toLowerCase(),
    phone: submission.phone.trim(),
    notes,
    billing_address: submission.address
      ? {
          address: submission.address.trim(),
          city: 'Unawatuna / Galle',
          state: 'Southern Province',
          country: 'Sri Lanka',
          phone: submission.phone.trim(),
        }
      : undefined,
  };

  const response = await zohoRequest<{ code: number; contact: ZohoContact }>('/contacts', {
    method: 'POST',
    body: payload,
  });

  return response.contact;
}

export async function updateZohoCustomer(
  contactId: string,
  submission: QuoteSubmission
): Promise<ZohoContact> {
  const updatePayload: Record<string, unknown> = {
    phone: submission.phone.trim(),
    company_name: submission.businessName?.trim() || undefined,
  };

  if (submission.address) {
    updatePayload.billing_address = {
      address: submission.address.trim(),
      city: 'Unawatuna / Galle',
      state: 'Southern Province',
      country: 'Sri Lanka',
      phone: submission.phone.trim(),
    };
  }

  const response = await zohoRequest<{ code: number; contact: ZohoContact }>(`/contacts/${contactId}`, {
    method: 'PUT',
    body: updatePayload,
  });

  return response.contact;
}

export async function getZohoCustomer(contactId: string): Promise<ZohoContact> {
  const response = await zohoRequest<{ code: number; contact: ZohoContact }>(`/contacts/${contactId}`);
  return response.contact;
}
