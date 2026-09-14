import { ZohoAuthConfig, ZohoTokenResponse } from '@/types/zoho';

export const DEFAULT_ZOHO_ORGANIZATION_ID = '777888456';
export const DEFAULT_ZOHO_REDIRECT_URI = 'https://ananke-laundry-service.vercel.app/api/zoho/callback';

export const ZOHO_READONLY_SCOPES = [
  'ZohoBooks.contacts.READ',
  'ZohoBooks.invoices.READ',
  'ZohoBooks.customerpayments.READ',
] as const;

interface CachedToken {
  accessToken: string;
  expiresAt: number; // unix timestamp ms
}

let cachedToken: CachedToken | null = null;
let dynamicApiDomain: string | null = null;

export function setDynamicApiDomain(domain: string): void {
  if (domain && typeof domain === 'string') {
    dynamicApiDomain = domain.replace(/\/+$/, '');
  }
}

export function getZohoAccountsDomain(dcOrUrl?: string): string {
  if (dcOrUrl && (dcOrUrl.startsWith('https://') || dcOrUrl.startsWith('http://'))) {
    return dcOrUrl.replace(/\/+$/, '');
  }
  if (process.env.ZOHO_ACCOUNTS_URL) {
    return process.env.ZOHO_ACCOUNTS_URL.replace(/\/+$/, '');
  }
  const cleanDc = (dcOrUrl || process.env.ZOHO_DC || 'com').toLowerCase().trim();
  switch (cleanDc) {
    case 'in':
      return 'https://accounts.zoho.in';
    case 'eu':
      return 'https://accounts.zoho.eu';
    case 'com.au':
    case 'au':
      return 'https://accounts.zoho.com.au';
    case 'jp':
      return 'https://accounts.zoho.jp';
    case 'ca':
      return 'https://accounts.zoho.ca';
    default:
      return 'https://accounts.zoho.com';
  }
}

export function getZohoBooksApiDomain(dcOrDomain?: string): string {
  if (dynamicApiDomain) {
    return dynamicApiDomain.endsWith('/books/v3')
      ? dynamicApiDomain
      : `${dynamicApiDomain}/books/v3`;
  }
  if (process.env.ZOHO_API_DOMAIN) {
    const domain = process.env.ZOHO_API_DOMAIN.replace(/\/+$/, '');
    return domain.endsWith('/books/v3') ? domain : `${domain}/books/v3`;
  }
  if (dcOrDomain && (dcOrDomain.startsWith('https://') || dcOrDomain.startsWith('http://'))) {
    const domain = dcOrDomain.replace(/\/+$/, '');
    return domain.endsWith('/books/v3') ? domain : `${domain}/books/v3`;
  }
  const cleanDc = (dcOrDomain || process.env.ZOHO_DC || 'com').toLowerCase().trim();
  switch (cleanDc) {
    case 'in':
      return 'https://www.zohoapis.in/books/v3';
    case 'eu':
      return 'https://www.zohoapis.eu/books/v3';
    case 'com.au':
    case 'au':
      return 'https://www.zohoapis.com.au/books/v3';
    case 'jp':
      return 'https://www.zohoapis.jp/books/v3';
    case 'ca':
      return 'https://www.zohoapis.ca/books/v3';
    default:
      return 'https://www.zohoapis.com/books/v3';
  }
}

export function isZohoConfigured(): boolean {
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env;
  return Boolean(
    ZOHO_CLIENT_ID?.trim() &&
    ZOHO_CLIENT_SECRET?.trim() &&
    ZOHO_REFRESH_TOKEN?.trim()
  );
}

export function getZohoConfig(): ZohoAuthConfig | null {
  if (!isZohoConfigured()) return null;

  return {
    clientId: process.env.ZOHO_CLIENT_ID!.trim(),
    clientSecret: process.env.ZOHO_CLIENT_SECRET!.trim(),
    refreshToken: process.env.ZOHO_REFRESH_TOKEN!.trim(),
    organizationId: (process.env.ZOHO_ORGANIZATION_ID || DEFAULT_ZOHO_ORGANIZATION_ID).trim(),
    dc: (process.env.ZOHO_DC as any) || 'com',
  };
}

export function getZohoRedirectUri(origin?: string): string {
  if (process.env.ZOHO_REDIRECT_URI?.trim()) {
    return process.env.ZOHO_REDIRECT_URI.trim();
  }
  if (origin && origin.includes('localhost')) {
    return `${origin}/api/zoho/callback`;
  }
  return DEFAULT_ZOHO_REDIRECT_URI;
}

/**
 * Builds the authorization URL to initiate Zoho OAuth.
 */
export function buildZohoAuthUrl(options: {
  redirectUri?: string;
  dc?: string;
  accountsServer?: string;
} = {}): string {
  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('Missing ZOHO_CLIENT_ID in environment variables.');
  }

  const accountsDomain = options.accountsServer
    ? getZohoAccountsDomain(options.accountsServer)
    : getZohoAccountsDomain(options.dc);

  const redirectUri = options.redirectUri || getZohoRedirectUri();

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: ZOHO_READONLY_SCOPES.join(','),
    redirect_uri: redirectUri,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${accountsDomain}/oauth/v2/auth?${params.toString()}`;
}

/**
 * Server-side exchange of authorization code for OAuth access & refresh tokens.
 */
export async function exchangeZohoAuthCode(
  code: string,
  options: { redirectUri?: string; accountsServer?: string } = {}
): Promise<{
  access_token: string;
  refresh_token: string;
  api_domain: string;
  token_type: string;
  expires_in: number;
}> {
  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new Error('Missing ZOHO_CLIENT_ID or ZOHO_CLIENT_SECRET in environment variables.');
  }

  const accountsDomain = getZohoAccountsDomain(options.accountsServer);
  const redirectUri = options.redirectUri || getZohoRedirectUri();
  const tokenUrl = `${accountsDomain}/oauth/v2/token`;

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code: code.trim(),
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data || data.error) {
    const errorMsg = data?.error || `HTTP ${response.status}`;
    console.error('[Zoho OAuth Token Exchange Error]:', { status: response.status, data });
    throw new Error(`Zoho token exchange failed: ${errorMsg}`);
  }

  if (data.api_domain) {
    setDynamicApiDomain(data.api_domain);
  }

  return data;
}

/**
 * Server-side helper that automatically generates a new Zoho access token
 * using ZOHO_REFRESH_TOKEN, ZOHO_CLIENT_ID, and ZOHO_CLIENT_SECRET.
 * Tokens are cached in-memory until near expiration.
 */
export async function getZohoAccessToken(): Promise<string> {
  const config = getZohoConfig();
  if (!config) {
    throw new Error('Zoho Books is not configured. Missing required environment variables (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN).');
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 300000) {
    return cachedToken.accessToken;
  }

  const accountsDomain = getZohoAccountsDomain(config.dc);
  const tokenUrl = `${accountsDomain}/oauth/v2/token`;

  const params = new URLSearchParams({
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error('[Zoho Auth] Token refresh failed with HTTP status:', response.status);
    throw new Error(`Failed to refresh Zoho Books access token: HTTP ${response.status} - ${errorText}`);
  }

  const data: ZohoTokenResponse = await response.json();

  if (data.error || !data.access_token) {
    console.error('[Zoho Auth] OAuth error response:', data.error);
    throw new Error(`Zoho OAuth Error: ${data.error || 'No access token received'}`);
  }

  if (data.api_domain) {
    setDynamicApiDomain(data.api_domain);
  }

  const expiresInMs = (data.expires_in || 3600) * 1000;
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + expiresInMs,
  };

  return cachedToken.accessToken;
}

/**
 * Safe READ-ONLY Zoho Books API connectivity test using organization_id.
 * Never exposes customer or accounting data.
 */
export async function testZohoConnectivity(targetOrgId?: string): Promise<{
  connected: boolean;
  success: boolean;
  message: string;
  organizationId: string;
  error?: string;
}> {
  const orgId = (targetOrgId || process.env.ZOHO_ORGANIZATION_ID || DEFAULT_ZOHO_ORGANIZATION_ID).trim();

  if (!isZohoConfigured()) {
    return {
      connected: false,
      success: false,
      message: 'Zoho Books credentials not configured. Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN in environment variables.',
      organizationId: orgId,
      error: 'Zoho Books credentials not configured. Please set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN in environment variables.',
    };
  }

  try {
    const accessToken = await getZohoAccessToken();
    const config = getZohoConfig();
    const apiDomain = getZohoBooksApiDomain(config?.dc);

    // Safe read-only request to verify organization access using contact search with limit 1
    const url = new URL(`${apiDomain}/contacts`);
    url.searchParams.set('organization_id', orgId);
    url.searchParams.set('per_page', '1');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'X-com-zoho-books-organizationid': orgId,
        Accept: 'application/json',
      },
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data && (data.code === 0 || data.code === 200)) {
      return {
        connected: true,
        success: true,
        message: 'Successfully connected to Zoho Books organization.',
        organizationId: orgId,
      };
    } else {
      const errorDetail = data?.message || `HTTP ${response.status}`;
      return {
        connected: false,
        success: false,
        message: `Zoho Books API error (${response.status}): ${errorDetail}`,
        organizationId: orgId,
        error: `Zoho Books API error (${response.status}): ${errorDetail}`,
      };
    }
  } catch (err: any) {
    const errMsg = err?.message || 'Failed to authenticate with Zoho Books.';
    return {
      connected: false,
      success: false,
      message: errMsg,
      organizationId: orgId,
      error: errMsg,
    };
  }
}
