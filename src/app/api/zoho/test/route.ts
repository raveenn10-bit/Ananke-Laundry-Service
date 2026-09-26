import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedAdmin } from '@/lib/auth/adminAuth';
import { testZohoConnectivity, DEFAULT_ZOHO_ORGANIZATION_ID } from '@/services/zoho/auth';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

/**
 * GET /api/zoho/test
 * Strictly protected internal test endpoint.
 * Requires authorized admin session.
 * Never leaks organization details to the public.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Strict Admin Authorization Check - Deny public probing completely
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 5 * 60 * 1000,
    maxRequests: 10,
    prefix: 'zoho_test_ip',
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { connected: false, error: 'Rate limit exceeded. Please wait.' },
      { status: 429 }
    );
  }

  try {
    const result = await testZohoConnectivity(DEFAULT_ZOHO_ORGANIZATION_ID);

    const maskedOrgId = result.organizationId
      ? `****${result.organizationId.slice(-4)}`
      : null;

    if (result.connected) {
      return NextResponse.json(
        {
          connected: true,
          status: 'Operational',
          organization: maskedOrgId,
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
        status: 'Configuration Required',
      },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { connected: false, error: 'Connectivity check failed.' },
      { status: 500 }
    );
  }
}
