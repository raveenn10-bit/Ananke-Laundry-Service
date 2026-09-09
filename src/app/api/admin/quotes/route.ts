import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { enquiryRepository } from '@/lib/storage/enquiryRepository';
import { SyncStatus } from '@/types/quote';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized access.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get('status') as SyncStatus | null;
  const limitParam = searchParams.get('limit');

  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  const enquiries = await enquiryRepository.listEnquiries({
    syncStatus: statusParam || undefined,
    limit,
  });

  const stats = await enquiryRepository.getSyncStats();

  return NextResponse.json({
    success: true,
    enquiries,
    stats,
  });
}
