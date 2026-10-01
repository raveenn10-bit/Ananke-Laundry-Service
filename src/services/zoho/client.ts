import { getZohoAccessToken, getZohoBooksApiDomain, getZohoConfig } from './auth';

export class ZohoRateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(message = 'Zoho Books API rate limit exceeded. Requests paused to protect organization quota.', retryAfterSeconds = 60) {
    super(message);
    this.name = 'ZohoRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  timeoutMs?: number;
  skipCache?: boolean;
}

// 1. Rate Limit Cooldown State (Stops ALL traffic when rate limit is hit)
let rateLimitCooldownUntil = 0;
let lastRateLimitMessage = '';

export function isZohoRateLimited(): boolean {
  return Date.now() < rateLimitCooldownUntil;
}

export function getZohoRateLimitResetSeconds(): number {
  if (!isZohoRateLimited()) return 0;
  return Math.max(1, Math.ceil((rateLimitCooldownUntil - Date.now()) / 1000));
}

// 2. In-Flight Request Deduplication (Coalesces concurrent identical GET requests into 1)
const inFlightRequests = new Map<string, Promise<any>>();

// 3. Short-Term In-Memory Cache for GET Requests (Prevents duplicate calls within 2 minutes)
interface CacheEntry {
  data: any;
  expiresAt: number;
}
const getResponseCache = new Map<string, CacheEntry>();
const DEFAULT_GET_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// 4. Outbound Request Pacer (Enforces minimum 150ms gap between any outbound calls to prevent burst limits)
let lastOutboundTime = 0;
const MIN_GAP_MS = 150;

async function paceOutbound(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastOutboundTime;
  if (elapsed < MIN_GAP_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_GAP_MS - elapsed));
  }
  lastOutboundTime = Date.now();
}

export async function zohoRequest<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const config = getZohoConfig();
  if (!config) {
    throw new Error('Zoho Books configuration is missing');
  }

  // Pre-flight Rate Limit Check: If cooled down, reject immediately without hitting network
  if (isZohoRateLimited()) {
    const remaining = getZohoRateLimitResetSeconds();
    throw new ZohoRateLimitError(
      lastRateLimitMessage || `Zoho Books API rate limit active. Paused for ${remaining}s to protect quota.`,
      remaining
    );
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseDomain = getZohoBooksApiDomain(config.dc);
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
  const cacheKey = `${method}:${url.toString()}`;

  // Cache check for GET requests
  if (method === 'GET' && !options.skipCache) {
    const cached = getResponseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data as T;
    }

    // Deduplication check for pending in-flight GET requests
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey) as Promise<T>;
    }
  }

  const executeRequest = async (): Promise<T> => {
    await paceOutbound();

    const accessToken = await getZohoAccessToken();
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

      // Handle 429 Rate Limit
      if (response.status === 429) {
        const retryHeader = response.headers.get('retry-after');
        const retrySec = retryHeader ? parseInt(retryHeader, 10) : 60;
        const cooldown = Math.max(30, isNaN(retrySec) ? 60 : retrySec);

        rateLimitCooldownUntil = Date.now() + cooldown * 1000;
        lastRateLimitMessage = 'Zoho Books daily API limit exceeded (10,000 calls/day reached). Requests paused.';
        console.warn(`[Zoho API] Rate limit hit (429). Outbound requests paused for ${cooldown}s.`);

        throw new ZohoRateLimitError(lastRateLimitMessage, cooldown);
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

      // Store in short-term cache for GET requests
      if (method === 'GET') {
        getResponseCache.set(cacheKey, {
          data,
          expiresAt: Date.now() + DEFAULT_GET_CACHE_TTL_MS,
        });
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Zoho Books API request timed out');
      }
      throw err;
    }
  };

  if (method === 'GET') {
    const promise = executeRequest().finally(() => {
      inFlightRequests.delete(cacheKey);
    });
    inFlightRequests.set(cacheKey, promise);
    return promise;
  }

  return executeRequest();
}

export async function zohoDownloadRequest(
  endpoint: string,
  options: { params?: Record<string, string | number | boolean | undefined>; timeoutMs?: number } = {}
): Promise<{ buffer: Buffer; contentType: string }> {
  const config = getZohoConfig();
  if (!config) {
    throw new Error('Zoho Books configuration is missing');
  }

  if (isZohoRateLimited()) {
    const remaining = getZohoRateLimitResetSeconds();
    throw new ZohoRateLimitError(
      lastRateLimitMessage || `Zoho Books API rate limit active. Paused for ${remaining}s to protect quota.`,
      remaining
    );
  }

  await paceOutbound();

  const accessToken = await getZohoAccessToken();
  const baseDomain = getZohoBooksApiDomain(config.dc);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseDomain}${cleanEndpoint}`);

  url.searchParams.set('organization_id', config.organizationId);
  url.searchParams.set('accept', 'pdf');

  if (options.params) {
    for (const [key, val] of Object.entries(options.params)) {
      if (val !== undefined && val !== null) {
        url.searchParams.set(key, String(val));
      }
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    'X-com-zoho-books-organizationid': config.organizationId,
    Accept: 'application/pdf',
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 25000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.status === 429) {
      rateLimitCooldownUntil = Date.now() + 60 * 1000;
      throw new ZohoRateLimitError();
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Zoho PDF download failed with HTTP ${response.status}: ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'application/pdf';

    return { buffer, contentType };
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Zoho PDF download request timed out');
    }
    throw err;
  }
}
