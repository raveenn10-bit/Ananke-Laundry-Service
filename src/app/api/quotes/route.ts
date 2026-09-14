import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { enquiryRepository } from '@/lib/storage/enquiryRepository';
import { syncEnquiryToZoho } from '@/services/zoho';
import { QuoteSubmission } from '@/types/quote';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

/**
 * Strips dangerous HTML / script tags from input strings
 */
function sanitizeString(input?: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[<>]/g, '')       // Strip stray angle brackets
    .trim();
}

const quoteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  businessName: z.string().max(100).optional(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').max(30),
  email: z.string().email('Please enter a valid email address').max(100),
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
  serviceRequired: z.string().min(1, 'Please select a required service').max(100),
  laundryType: z.string().max(100).optional(),
  laundryVolume: z.string().max(100).optional(),
  frequency: z
    .enum(['One-time', 'Daily', 'Weekly', 'Multiple times per week', 'Monthly', 'Custom'])
    .optional(),
  address: z.string().max(250).optional(),
  message: z.string().min(5, 'Message must be at least 5 characters').max(2000),
  botField: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (Spam and lead exhaustion protection)
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,           // Max 10 quote inquiries
    prefix: 'quotes_submit_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many submissions. Please wait ${rateLimit.resetSeconds} seconds or call us directly at 091 225 0777.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    // 2. Honeypot check - reject bots silently
    if (body.botField && String(body.botField).trim().length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Thank you. Your laundry requirements have been received. Our team will review your request and contact you regarding a quotation.',
      });
    }

    // 3. Sanitize inputs before schema validation
    const sanitizedBody = {
      ...body,
      name: sanitizeString(body.name),
      businessName: body.businessName ? sanitizeString(body.businessName) : undefined,
      phone: typeof body.phone === 'string' ? body.phone.trim() : body.phone,
      email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : body.email,
      address: body.address ? sanitizeString(body.address) : undefined,
      message: sanitizeString(body.message),
    };

    // 4. Validate submission data
    const parseResult = quoteSchema.safeParse(sanitizedBody);
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
