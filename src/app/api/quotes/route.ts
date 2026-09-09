import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enquiryRepository } from '@/lib/storage/enquiryRepository';
import { syncEnquiryToZoho } from '@/services/zoho';
import { QuoteSubmission } from '@/types/quote';

const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().optional(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits'),
  email: z.string().email('Please enter a valid email address'),
  propertyType: z
    .enum([
      'Hotel',
      'Resort',
      'Villa',
      'Guest House',
      'Restaurant',
      'Spa',
      'Airbnb / Holiday Rental',
      'Individual / Residential',
      'Other',
    ])
    .optional(),
  serviceRequired: z.string().min(1, 'Please select a required service'),
  laundryType: z.string().optional(),
  laundryVolume: z.string().optional(),
  frequency: z
    .enum(['One-time', 'Daily', 'Weekly', 'Multiple times per week', 'Monthly', 'Custom'])
    .optional(),
  address: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  botField: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Honeypot check - reject bots silently
    if (body.botField && String(body.botField).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Thank you. Your laundry requirements have been received. Our team will review your request and contact you regarding a quotation.',
      });
    }

    // 2. Validate submission data
    const parseResult = quoteSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parseResult.error.flatten().fieldErrors,
          message: 'Please correct the indicated fields and resubmit.',
        },
        { status: 400 }
      );
    }

    const data: QuoteSubmission = parseResult.data;

    // 3. Persist enquiry into local repository first (Zero Lead Loss guarantee)
    const savedEnquiry = await enquiryRepository.saveEnquiry(data, 'pending');

    // 4. Trigger Zoho Books synchronization
    try {
      await syncEnquiryToZoho(savedEnquiry);
    } catch (syncErr) {
      // Non-blocking catch: Lead is safely saved locally even if Zoho is temporarily unreachable
      console.error('[API /api/quotes] Background Zoho sync failure:', syncErr);
    }

    // 5. Return professional customer confirmation message
    return NextResponse.json(
      {
        success: true,
        message:
          'Thank you. Your laundry requirements have been received. Our team will review your request and contact you regarding a quotation.',
        enquiryId: savedEnquiry.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API /api/quotes] Unexpected handler error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'We were unable to process your quote request at this moment. Please call us directly at 091 225 0777.',
      },
      { status: 500 }
    );
  }
}
