import { ZohoEstimate, ZohoEstimateLineItem } from '@/types/zoho';
import { EnquiryRecord } from '@/types/quote';
import { zohoRequest } from './client';

export interface CreateEstimateOptions {
  customerId: string;
  referenceNumber?: string;
  enquiry?: EnquiryRecord;
  lineItems?: ZohoEstimateLineItem[];
  notes?: string;
}

export async function createZohoEstimate(options: CreateEstimateOptions): Promise<ZohoEstimate> {
  const lineItems: ZohoEstimateLineItem[] = options.lineItems || [
    {
      name: options.enquiry?.serviceRequired || 'Commercial Laundry Service',
      description: [
        options.enquiry?.propertyType ? `Property: ${options.enquiry.propertyType}` : null,
        options.enquiry?.laundryType ? `Linen Type: ${options.enquiry.laundryType}` : null,
        options.enquiry?.laundryVolume ? `Volume: ${options.enquiry.laundryVolume}` : null,
        options.enquiry?.frequency ? `Frequency: ${options.enquiry.frequency}` : null,
        options.enquiry?.message ? `Notes: ${options.enquiry.message}` : null,
      ]
        .filter(Boolean)
        .join(' | ') || 'Professional textile care and laundry processing',
      rate: 0,
      quantity: 1,
      unit: 'Service',
    },
  ];

  const payload: Record<string, unknown> = {
    customer_id: options.customerId,
    reference_number: options.referenceNumber || options.enquiry?.id,
    date: new Date().toISOString().split('T')[0],
    line_items: lineItems,
    notes: options.notes || 'Quotation prepared for Ananke Laundry clients. Rates subject to final textile inspection.',
    terms: 'Payment terms: As per commercial hospitality agreement.',
  };

  const response = await zohoRequest<{ code: number; estimate: ZohoEstimate }>('/estimates', {
    method: 'POST',
    body: payload,
  });

  return response.estimate;
}

export async function getZohoEstimate(estimateId: string): Promise<ZohoEstimate> {
  const response = await zohoRequest<{ code: number; estimate: ZohoEstimate }>(`/estimates/${estimateId}`);
  return response.estimate;
}

export async function listCustomerEstimates(customerId: string): Promise<ZohoEstimate[]> {
  const response = await zohoRequest<{ code: number; estimates: ZohoEstimate[] }>('/estimates', {
    params: { customer_id: customerId },
  });
  return response.estimates || [];
}
