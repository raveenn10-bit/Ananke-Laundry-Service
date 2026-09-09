import { getZohoAccessToken, getZohoBooksApiDomain, getZohoConfig } from './auth';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

export async function zohoRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const config = getZohoConfig();
  if (!config) {
    throw new Error('Zoho Books configuration is missing');
  }

  const accessToken = await getZohoAccessToken();
  const baseDomain = getZohoBooksApiDomain(config.dc);

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseDomain}${cleanEndpoint}`);

  url.searchParams.set('organization_id', config.organizationId);

  if (options.params) {
    for (const [key, val] of Object.entries(options.params)) {
      if (val !== undefined && val !== null) {
        url.searchParams.set(key, String(val));
      }
    }
  }

  const method = options.method || 'GET';
  const headers: Record<string, string> = {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    'X-com-zoho-books-organizationid': config.organizationId,
    Accept: 'application/json',
  };

  let body: string | undefined = undefined;
  if (options.body && (method === 'POST' || method === 'PUT')) {
    headers['Content-Type'] = 'application/json;charset=UTF-8';
    body = JSON.stringify(options.body);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status === 429) {
      console.warn('[Zoho API] Rate limit hit (429)');
      throw new Error('Zoho Books API rate limit exceeded. Please retry in a few moments.');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Zoho Books API HTTP error: ${response.status}`;
      console.error('[Zoho API Error]', { endpoint: cleanEndpoint, status: response.status, message: errorMessage });
      throw new Error(errorMessage);
    }

    if (data && data.code !== 0 && data.code !== 200) {
      console.error('[Zoho API Response Error]', { code: data.code, message: data.message });
      throw new Error(data.message || 'Zoho Books API returned non-zero code');
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Zoho Books API request timed out');
    }
    throw err;
  }
}
