import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { enquiryRepository } from '@/lib/storage/enquiryRepository';
import { createZohoEstimate, isZohoConfigured } from '@/services/zoho';

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized access.' }, { status: 401 });
  }

  if (!isZohoConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message: 'Zoho Books credentials not configured. Please configure environment variables.',
      },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { enquiryId, notes } = body;

    if (!enquiryId) {
      return NextResponse.json({ success: false, message: 'enquiryId is required' }, { status: 400 });
    }

    const enquiry = await enquiryRepository.getEnquiryById(enquiryId);
    if (!enquiry) {
      return NextResponse.json({ success: false, message: 'Enquiry not found' }, { status: 404 });
    }

    if (!enquiry.zohoCustomerId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Enquiry has not been synced to a Zoho Customer yet. Please sync customer first.',
        },
        { status: 400 }
      );
    }

    const estimate = await createZohoEstimate({
      customerId: enquiry.zohoCustomerId,
      enquiry,
      notes,
    });

    if (estimate?.estimate_id) {
      await enquiryRepository.updateEnquiryZohoMapping(enquiry.id, {
        zohoEstimateId: estimate.estimate_id,
        syncStatus: 'synced',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Estimate ${estimate.estimate_number || estimate.estimate_id} created successfully in Zoho Books`,
      estimate,
    });
  } catch (error: any) {
    console.error('[API /api/admin/zoho/create-estimate] Error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create Zoho Estimate' },
      { status: 500 }
    );
  }
}
