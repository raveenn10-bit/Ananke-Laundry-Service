import { ZohoAuthConfig, ZohoTokenResponse } from '@/types/zoho';

interface CachedToken {
  accessToken: string;
  expiresAt: number; // unix timestamp ms
}

let cachedToken: CachedToken | null = null;

export function getZohoAccountsDomain(dc?: string): string {
  const cleanDc = (dc || process.env.ZOHO_DC || 'com').toLowerCase();
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
    default:
      return 'https://accounts.zoho.com';
  }
}

export function getZohoBooksApiDomain(dc?: string): string {
  const cleanDc = (dc || process.env.ZOHO_DC || 'com').toLowerCase();
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
    default:
      return 'https://www.zohoapis.com/books/v3';
  }
}

export function isZohoConfigured(): boolean {
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORGANIZATION_ID } = process.env;
  return Boolean(
    ZOHO_CLIENT_ID &&
    ZOHO_CLIENT_SECRET &&
    ZOHO_REFRESH_TOKEN &&
    ZOHO_ORGANIZATION_ID
  );
}

export function getZohoConfig(): ZohoAuthConfig | null {
  if (!isZohoConfigured()) return null;

  return {
    clientId: process.env.ZOHO_CLIENT_ID!,
    clientSecret: process.env.ZOHO_CLIENT_SECRET!,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
    organizationId: process.env.ZOHO_ORGANIZATION_ID!,
    dc: (process.env.ZOHO_DC as any) || 'com',
  };
}

export async function getZohoAccessToken(): Promise<string> {
  const config = getZohoConfig();
  if (!config) {
    throw new Error('Zoho Books is not configured. Missing required environment variables.');
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
    const errorText = await response.text();
    console.error('[Zoho Auth] Token refresh failed with HTTP status:', response.status);
    throw new Error(`Failed to refresh Zoho Books access token: HTTP ${response.status} - ${errorText}`);
  }

  const data: ZohoTokenResponse = await response.json();

  if (data.error || !data.access_token) {
    console.error('[Zoho Auth] OAuth error response:', data.error);
    throw new Error(`Zoho OAuth Error: ${data.error || 'No access token received'}`);
  }

  const expiresInMs = (data.expires_in || 3600) * 1000;
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + expiresInMs,
  };

  return cachedToken.accessToken;
}

export async function testZohoConnectivity(): Promise<{ success: boolean; message: string; organizationId?: string }> {
  if (!isZohoConfigured()) {
    return {
      success: false,
      message: 'Zoho Books credentials not configured in environment variables (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ORGANIZATION_ID).',
    };
  }

  try {
    const accessToken = await getZohoAccessToken();
    const config = getZohoConfig()!;
    const apiDomain = getZohoBooksApiDomain(config.dc);

    const response = await fetch(`${apiDomain}/organizations/${config.organizationId}`, {
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'X-com-zoho-books-organizationid': config.organizationId,
      },
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Successfully connected to Zoho Books organization.',
        organizationId: config.organizationId,
      };
    } else {
      return {
        success: false,
        message: `Connected to OAuth server but Books API returned HTTP ${response.status}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to authenticate with Zoho Books.',
    };
  }
}
