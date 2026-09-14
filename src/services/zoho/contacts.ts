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
      const digitsOnly = cleanPhone.replace(/[^0-9]/g, '').slice(-9);

      // 1. Exact phone field match
      const phoneRes = await zohoRequest<ZohoCustomerSearchResponse>('/contacts', {
        params: { phone: cleanPhone },
      }).catch(() => null);

      if (phoneRes?.contacts && phoneRes.contacts.length > 0) {
        return phoneRes.contacts[0];
      }

      // 2. Exact mobile field match
      const mobileRes = await zohoRequest<ZohoCustomerSearchResponse>('/contacts', {
        params: { mobile: cleanPhone },
      }).catch(() => null);

      if (mobileRes?.contacts && mobileRes.contacts.length > 0) {
        return mobileRes.contacts[0];
      }

      // 3. Search text match (matches formatted numbers like '077 123 4567')
      const searchRes = await zohoRequest<ZohoCustomerSearchResponse>('/contacts', {
        params: { search_text: digitsOnly || cleanPhone },
      }).catch(() => null);

      if (searchRes?.contacts && searchRes.contacts.length > 0) {
        // Look for contact whose phone or mobile contains the 9 digits
        for (const c of searchRes.contacts) {
          const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
          const cMobile = (c.mobile || '').replace(/[^0-9]/g, '');
          if (
            (cPhone && (cPhone.includes(digitsOnly) || digitsOnly.includes(cPhone))) ||
            (cMobile && (cMobile.includes(digitsOnly) || digitsOnly.includes(cMobile)))
          ) {
            return c;
          }
        }
        return searchRes.contacts[0];
      }
    }

    return null;
  } catch (err) {
    console.error('[Zoho Contacts] Error searching customer:', err);
    return null;
  }
}

export async function findZohoCustomerByPhoneVariants(phones: string[]): Promise<ZohoContact | null> {
  for (const p of phones) {
    if (!p) continue;
    const found = await findZohoCustomer(undefined, p);
    if (found) return found;
  }
  return null;
}

/**
 * Unified search for Zoho Books customers by Invoice Number, Customer Name, or Phone Number.
 * Eliminates manual customer data retyping by the admin.
 */
export async function lookupZohoCustomerUnified(query: string): Promise<import('@/types/order').ZohoCustomerLookupResult[]> {
  const clean = (query || '').trim();
  if (!clean) return [];

  // 1. Live Zoho Books API Query if configured
  if (require('./auth').isZohoConfigured()) {
    try {
      const results: import('@/types/order').ZohoCustomerLookupResult[] = [];
      const isInvoicePattern = clean.toUpperCase().includes('ANK') || clean.toUpperCase().startsWith('INV') || /^\d{3,6}$/.test(clean);

      // Search by invoice number first if applicable
      if (isInvoicePattern) {
        try {
          const invRes = await zohoRequest<{ code: number; invoices: any[] }>('/invoices', {
            params: { search_text: clean },
          });

          if (invRes?.invoices && invRes.invoices.length > 0) {
            for (const inv of invRes.invoices.slice(0, 3)) {
              if (inv.customer_id && !results.some((r) => r.customerId === inv.customer_id)) {
                const contact = await getZohoCustomer(inv.customer_id);
                if (contact) {
                  results.push({
                    customerId: contact.contact_id || inv.customer_id,
                    customerName: contact.contact_name || inv.customer_name,
                    companyName: contact.company_name,
                    email: contact.email || '',
                    phone: contact.phone || contact.mobile || '',
                    mobile: contact.mobile,
                    address: contact.billing_address?.address,
                    invoices: [
                      {
                        invoiceId: inv.invoice_id,
                        invoiceNumber: inv.invoice_number,
                        date: inv.date,
                        total: Number(inv.total) || 0,
                        balance: Number(inv.balance) || 0,
                        status: inv.status,
                      },
                    ],
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn('[Zoho Lookup] Invoice search warning:', e);
        }
      }

      // Search contacts by search_text (matches name, phone, email)
      const contactRes = await zohoRequest<ZohoCustomerSearchResponse>('/contacts', {
        params: { search_text: clean },
      });

      if (contactRes?.contacts && contactRes.contacts.length > 0) {
        for (const c of contactRes.contacts.slice(0, 5)) {
          if (!c.contact_id || results.some((r) => r.customerId === c.contact_id)) continue;

          // Fetch recent invoices for this contact
          let invoices: any[] = [];
          try {
            const invList = await zohoRequest<{ code: number; invoices: any[] }>('/invoices', {
              params: { customer_id: c.contact_id, per_page: 5 },
            });
            invoices = (invList?.invoices || []).map((i) => ({
              invoiceId: i.invoice_id,
              invoiceNumber: i.invoice_number,
              date: i.date,
              total: Number(i.total) || 0,
              balance: Number(i.balance) || 0,
              status: i.status,
            }));
          } catch {
            // invoices fetch optional
          }

          results.push({
            customerId: c.contact_id,
            customerName: c.contact_name,
            companyName: c.company_name,
            email: c.email || '',
            phone: c.phone || c.mobile || '',
            mobile: c.mobile,
            address: c.billing_address?.address,
            invoices,
          });
        }
      }

      if (results.length > 0) {
        return results;
      }
    } catch (err) {
      console.error('[Zoho Lookup] Search failed:', err);
    }
  }

  // 2. Demo/Staging fallback records
  const mockDatabase: import('@/types/order').ZohoCustomerLookupResult[] = [
    {
      customerId: 'mock-cust-1',
      customerName: 'Araliya Beach Resort & Spa',
      companyName: 'Araliya Hotels Galle (Pvt) Ltd',
      contactPerson: 'Mr. Sunil Perera',
      email: 'frontdesk@araliyagalle.com',
      phone: '0771234567',
      mobile: '+94771234567',
      address: 'Lighthouse Street, Galle Fort / Unawatuna',
      invoices: [
        {
          invoiceId: 'mock-inv-1042',
          invoiceNumber: 'ANK-1042',
          date: '2026-09-12',
          total: 4500,
          balance: 0,
          status: 'Paid',
        },
      ],
    },
    {
      customerId: 'mock-cust-2',
      customerName: 'Serenity Villa Unawatuna',
      companyName: 'Serenity Hospitality Group',
      contactPerson: 'Ms. Dilani Silva',
      email: 'manager@serenityvillaunawatuna.com',
      phone: '0719876543',
      mobile: '+94719876543',
      address: 'Yaddehimulla Road, Unawatuna',
      invoices: [
        {
          invoiceId: 'mock-inv-1038',
          invoiceNumber: 'ANK-1038',
          date: '2026-09-08',
          total: 7200,
          balance: 3200,
          status: 'Partially Paid',
        },
      ],
    },
    {
      customerId: 'mock-cust-3',
      customerName: 'Kushan Jayawardena',
      contactPerson: 'Kushan Jayawardena',
      email: 'kushan.j@gmail.com',
      phone: '0772223344',
      mobile: '+94772223344',
      address: 'Matara Road, Unawatuna',
      invoices: [
        {
          invoiceId: 'mock-inv-1025',
          invoiceNumber: 'ANK-1025',
          date: '2026-09-02',
          total: 2800,
          balance: 2800,
          status: 'Unpaid',
        },
      ],
    },
  ];

  const q = clean.toLowerCase();
  return mockDatabase.filter(
    (c) =>
      c.customerName.toLowerCase().includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      c.phone.includes(q) ||
      (c.mobile && c.mobile.includes(q)) ||
      c.email.toLowerCase().includes(q) ||
      c.invoices.some((i) => i.invoiceNumber.toLowerCase().includes(q))
  );
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
