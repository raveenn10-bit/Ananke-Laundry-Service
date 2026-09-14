import { NextRequest, NextResponse } from 'next/server';
import { testZohoConnectivity, DEFAULT_ZOHO_ORGANIZATION_ID } from '@/services/zoho/auth';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/zoho/test
 * Safe READ-ONLY test endpoint.
 * Makes a safe read-only Zoho Books API request using organization_id=777888456.
 * Returns only:
 * { "connected": true, "organizationId": "777888456" }
 * Never exposes customer or accounting data.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 5 * 60 * 1000,
    maxRequests: 10,
    prefix: 'zoho_test_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { connected: false, error: 'Rate limit exceeded. Please wait before testing connectivity again.' },
      { status: 429 }
    );
  }

  const result = await testZohoConnectivity(DEFAULT_ZOHO_ORGANIZATION_ID);

  if (result.connected) {
    return NextResponse.json(
      {
        connected: true,
        organizationId: result.organizationId,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  return NextResponse.json(
    {
      connected: false,
      organizationId: result.organizationId,
      error: result.error || 'Failed to connect to Zoho Books API.',
    },
    {
      status: 400,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
