import { NextRequest, NextResponse } from 'next/server';
import { exchangeZohoAuthCode, getZohoRedirectUri, DEFAULT_ZOHO_ORGANIZATION_ID } from '@/services/zoho/auth';
import { ZOHO_OAUTH_STATE_COOKIE, verifyOAuthState } from '../connect/route';
import { getClientIp, checkRateLimit } from '@/lib/security/rateLimiter';

export const dynamic = 'force-dynamic';

function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderErrorPage(title: string, message: string, detail?: string): string {
  const safeTitle = escapeHtml(title);
  const safeMsg = escapeHtml(message);
  const safeDetail = escapeHtml(detail);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Zoho Books Connection Error - Ananke Laundry</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1120; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #1e293b; border: 1px solid #ef4444; border-radius: 16px; max-width: 540px; width: 100%; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    h1 { color: #ef4444; margin-top: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    p { color: #cbd5e1; line-height: 1.6; font-size: 14px; }
    .box { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 13px; color: #f87171; word-break: break-all; margin: 16px 0; }
    .btn { display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 12px; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚠️ ${safeTitle}</h1>
    <p>${safeMsg}</p>
    ${safeDetail ? `<div class="box">${safeDetail}</div>` : ''}
    <p style="margin-top: 20px;">
      <a href="/api/zoho/connect" class="btn">← Restart Zoho Authorization</a>
    </p>
  </div>
</body>
</html>`;
}

function renderSuccessPage(data: {
  apiDomain: string;
  organizationId: string;
}): string {
  // Rigorously sanitize values for HTML display
  const escapedDomain = escapeHtml(data.apiDomain);
  const escapedOrgId = escapeHtml(data.organizationId);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Zoho Books Connected Successfully - Ananke Laundry</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #090e17;
      color: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      background: #111827;
      border: 1px solid #1e293b;
      border-radius: 20px;
      max-width: 620px;
      width: 100%;
      padding: 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    h1 {
      color: #ffffff;
      font-size: 26px;
      font-weight: 700;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 15px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 24px;
    }
    .meta-item {
      background: #1e293b;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid #334155;
    }
    .meta-label {
      color: #64748b;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }
    .meta-val {
      color: #38bdf8;
      font-size: 14px;
      font-weight: 600;
      font-family: monospace;
    }
    .scopes-box {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .scopes-title {
      color: #cbd5e1;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .scope-tag {
      display: inline-block;
      background: #0f172a;
      border: 1px solid #475569;
      color: #a5b4fc;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 11px;
      margin-right: 6px;
      margin-bottom: 4px;
    }
    .secure-notice {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid #059669;
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 24px;
    }
    .secure-title {
      color: #34d399;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .secure-desc {
      color: #cbd5e1;
      font-size: 13px;
      line-height: 1.5;
      margin: 0;
    }
    .instructions {
      color: #94a3b8;
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
      padding-left: 20px;
    }
    .instructions li {
      margin-bottom: 6px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">● Authorized &amp; Connected</div>
    <h1>Zoho Books Connected Successfully</h1>
    <p class="subtitle">Ananke Laundry Service has securely authorized read-only access to Zoho Books via OAuth 2.0.</p>

    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Organization ID</div>
        <div class="meta-val">${escapedOrgId}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">API Regional Domain</div>
        <div class="meta-val">${escapedDomain || 'https://www.zohoapis.com'}</div>
      </div>
    </div>

    <div class="scopes-box">
      <div class="scopes-title">Read-Only Scopes Granted:</div>
      <span class="scope-tag">ZohoBooks.contacts.READ</span>
      <span class="scope-tag">ZohoBooks.invoices.READ</span>
      <span class="scope-tag">ZohoBooks.customerpayments.READ</span>
    </div>

    <div class="secure-notice">
      <div class="secure-title">🔒 Security Hardening Active</div>
      <p class="secure-desc">
        To protect production secrets, the OAuth refresh token has been logged exclusively to the secure server console output. It is never exposed in browser DOM or client-side code.
      </p>
    </div>

    <ol class="instructions">
      <li>Check the secure server terminal / deployment runtime logs for the generated refresh token.</li>
      <li>Set <code>ZOHO_REFRESH_TOKEN</code> in your Vercel Dashboard (or local <code>.env.local</code>).</li>
      <li>Verify live connectivity anytime at: <a href="/api/zoho/test" style="color: #38bdf8;" target="_blank">/api/zoho/test</a>.</li>
    </ol>
  </div>
</body>
</html>`;
}

/**
 * GET /api/zoho/callback
 * Handles OAuth 2.0 redirect from Zoho with CSRF protection and rate limiting.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip, {
    windowMs: 5 * 60 * 1000,
    maxRequests: 15,
    prefix: 'zoho_cb_ip',
  });

  if (!rateLimit.allowed) {
    return new NextResponse(
      renderErrorPage('Too Many Requests', 'Rate limit exceeded for OAuth callback. Please wait a few moments.'),
      { status: 429, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const { searchParams } = new URL(request.url);

  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    const detail = errorDescription || error;
    console.error('[Zoho OAuth Callback Error]:', { error, errorDescription });
    return new NextResponse(
      renderErrorPage('Zoho Authorization Declined', 'Zoho returned an error or consent was denied.', detail),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // CSRF State Token Verification
  const stateParam = searchParams.get('state');
  const stateCookie = request.cookies.get(ZOHO_OAUTH_STATE_COOKIE)?.value;

  if (stateCookie) {
    const isStateValid = verifyOAuthState(stateParam) && stateParam === stateCookie;
    if (!isStateValid) {
      console.warn('[Zoho OAuth Security Alert] Invalid or mismatched OAuth state token (potential CSRF attempt)');
      return new NextResponse(
        renderErrorPage(
          'Security Verification Failed',
          'Invalid or expired OAuth state token (CSRF check failed). Please restart authorization.',
          'State token mismatch'
        ),
        { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
      );
    }
  }

  const code = searchParams.get('code');
  if (!code) {
    return new NextResponse(
      renderErrorPage('Missing Authorization Code', 'No authorization code was supplied in the callback URL.', 'Expected /api/zoho/callback?code=...'),
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Handle dynamic regional accounts server / location returned by Zoho
  const accountsServer =
    searchParams.get('accounts-server') ||
    undefined;

  const redirectUri = getZohoRedirectUri(request.nextUrl.origin);

  try {
    const tokenData = await exchangeZohoAuthCode(code, {
      redirectUri,
      accountsServer,
    });

    const organizationId = process.env.ZOHO_ORGANIZATION_ID || DEFAULT_ZOHO_ORGANIZATION_ID;

    // Secure server-side log for developer reference
    console.log('\n======================================================');
    console.log('🎉 ZOHO BOOKS OAUTH CONNECTION SUCCESSFUL!');
    console.log('Organization ID:', organizationId);
    console.log('API Domain:', tokenData.api_domain || '(default)');
    console.log('ZOHO_REFRESH_TOKEN (Copy this into Vercel & .env.local):');
    console.log(tokenData.refresh_token);
    console.log('======================================================\n');

    const html = renderSuccessPage({
      apiDomain: tokenData.api_domain || 'https://www.zohoapis.com',
      organizationId,
    });

    const response = new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });

    // Clear one-time CSRF state cookie
    response.cookies.delete(ZOHO_OAUTH_STATE_COOKIE);

    return response;
  } catch (err: any) {
    console.error('[Zoho Token Exchange Failure]:', err?.message || err);
    return new NextResponse(
      renderErrorPage(
        'Token Exchange Failed',
        'Could not exchange the authorization code for tokens. The authorization code may have expired or the redirect URI might not match.',
        err?.message || 'Unknown exchange failure'
      ),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
