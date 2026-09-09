import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { enquiryRepository } from '@/lib/storage/enquiryRepository';
import { isZohoConfigured, testZohoConnectivity, getZohoConfig } from '@/services/zoho';

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized access.' }, { status: 401 });
  }

  const configured = isZohoConfigured();
  const config = getZohoConfig();
  const stats = await enquiryRepository.getSyncStats();

  let connectivity = {
    tested: false,
    success: false,
    message: 'Configuration pending. Add credentials to activate live test.',
  };

  if (configured) {
    const testResult = await testZohoConnectivity();
    connectivity = {
      tested: true,
      success: testResult.success,
      message: testResult.message,
    };
  }

  return NextResponse.json({
    success: true,
    zoho: {
      isConfigured: configured,
      dataCenter: config?.dc || process.env.ZOHO_DC || 'com',
      organizationIdConfigured: Boolean(config?.organizationId),
      maskedOrgId: config?.organizationId ? `****${config.organizationId.slice(-4)}` : null,
      connectivity,
    },
    stats,
  });
}
