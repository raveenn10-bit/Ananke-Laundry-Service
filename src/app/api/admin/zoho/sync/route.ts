import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { enquiryRepository } from '@/lib/storage/enquiryRepository';
import { retrySyncEnquiry, syncEnquiryToZoho } from '@/services/zoho';

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { enquiryId, syncAllPending } = body;

    // 1. Sync specific enquiry
    if (enquiryId) {
      const result = await retrySyncEnquiry(enquiryId);
      return NextResponse.json({
        success: result.success,
        result,
      });
    }

    // 2. Batch sync all pending or failed enquiries
    if (syncAllPending) {
      const pendingList = await enquiryRepository.listEnquiries();
      const needsSync = pendingList.filter(
        (e) => e.syncStatus === 'pending' || e.syncStatus === 'pending_configuration' || e.syncStatus === 'failed'
      );

      const results = [];
      for (const enq of needsSync) {
        const res = await syncEnquiryToZoho(enq);
        results.push({ id: enq.id, ...res });
      }

      const updatedStats = await enquiryRepository.getSyncStats();

      return NextResponse.json({
        success: true,
        processedCount: results.length,
        results,
        stats: updatedStats,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Please specify enquiryId or set syncAllPending: true' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[API /api/admin/zoho/sync] Error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Sync operation failed' }, { status: 500 });
  }
}
