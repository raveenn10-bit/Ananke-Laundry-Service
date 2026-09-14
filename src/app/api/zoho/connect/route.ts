import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { buildZohoAuthUrl, getZohoRedirectUri } from '@/services/zoho/auth';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

export const ZOHO_OAUTH_STATE_COOKIE = 'zoho_oauth_state';
const STATE_TTL_SECONDS = 900; // 15 minutes

export function generateOAuthState(): string {
  const nonce = crypto.randomBytes(20).toString('hex');
  const timestamp = Date.now().toString();
  const payload = `${nonce}.${timestamp}`;
  const signingKey = process.env.ADMIN_SECRET_KEY || process.env.ZOHO_CLIENT_SECRET || 'ananke_oauth_csrf_secret';
  const sig = crypto.createHmac('sha256', signingKey).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyOAuthState(stateString?: string | null): boolean {
  if (!stateString || typeof stateString !== 'string') return false;
  const parts = stateString.split('.');
  if (parts.length !== 3) return false;

  const [nonce, timestampStr, signature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp) || Date.now() - timestamp > STATE_TTL_SECONDS * 1000) {
    return false; // Expired
  }

  const payload = `${nonce}.${timestampStr}`;
  const signingKey = process.env.ADMIN_SECRET_KEY || process.env.ZOHO_CLIENT_SECRET || 'ananke_oauth_csrf_secret';
  const expectedSig = crypto.createHmac('sha256', signingKey).update(payload).digest('base64url');

  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    return false;
  }

  return true;
}

/**
 * GET /api/zoho/connect
 * Initiates the Zoho OAuth authorization flow with CSRF state token protection.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 5 * 60 * 1000,
    maxRequests: 15,
    prefix: 'zoho_connect_ip',
  });

  if (!rateLimit.allowed) {
    return new NextResponse('Too many authorization attempts. Please wait a few moments.', { status: 429 });
  }

  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  if (!clientId) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Zoho Connection - Missing Configuration</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1120; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; max-width: 540px; width: 100%; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    h1 { color: #f59e0b; margin-top: 0; font-size: 24px; font-weight: 700; }
    p { color: #cbd5e1; line-height: 1.6; font-size: 15px; }
    .code-box { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 13px; color: #38bdf8; word-break: break-all; margin: 16px 0; }
    .step { margin: 12px 0; padding-left: 12px; border-left: 3px solid #3b82f6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚠️ ZOHO_CLIENT_ID Missing</h1>
    <p>The Zoho OAuth flow cannot be initiated because <code>ZOHO_CLIENT_ID</code> is not yet configured in your environment variables.</p>
    <div class="step">
      <strong>Step 1:</strong> In your Zoho API Console, find your <strong>Client ID</strong>.
    </div>
    <div class="step">
      <strong>Step 2:</strong> Add it to <strong>Vercel Environment Variables</strong> (or local <code>.env.local</code>):
      <div class="code-box">ZOHO_CLIENT_ID=your_client_id_here<br>ZOHO_CLIENT_SECRET=your_client_secret_here<br>ZOHO_ORGANIZATION_ID=777888456</div>
    </div>
    <div class="step">
      <strong>Step 3:</strong> Redeploy or restart, then refresh this URL to authorize.
    </div>
  </div>
</body>
</html>`;
    return new NextResponse(html, {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const { searchParams } = new URL(request.url);
  const dcParam = searchParams.get('dc') || undefined;
  const accountsServerParam = searchParams.get('accounts_server') || undefined;

  // Compute redirect URI
  const redirectUri = getZohoRedirectUri(request.nextUrl.origin);

  // Generate cryptographic CSRF state token
  const state = generateOAuthState();

  try {
    const authUrl = buildZohoAuthUrl({
      redirectUri,
      dc: dcParam,
      accountsServer: accountsServerParam,
      state,
    });

    const response = NextResponse.redirect(authUrl, { status: 307 });

    // Store state in an HttpOnly, Secure cookie
    response.cookies.set({
      name: ZOHO_OAUTH_STATE_COOKIE,
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/zoho',
      maxAge: STATE_TTL_SECONDS,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to construct Zoho authorization URL' },
      { status: 500 }
    );
  }
}
