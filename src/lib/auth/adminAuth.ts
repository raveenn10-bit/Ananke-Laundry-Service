import { NextRequest } from 'next/server';

/**
 * Validates whether the incoming request is authorized for admin actions
 */
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const secretKey = process.env.ADMIN_SECRET_KEY;

  // Extract from header
  const headerKey = req.headers.get('x-admin-key');
  const authHeader = req.headers.get('authorization');
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  // Extract from query string
  const url = new URL(req.url);
  const queryKey = url.searchParams.get('admin_key');

  const providedKey = headerKey || bearerKey || queryKey;

  if (secretKey && secretKey.trim().length > 0) {
    return providedKey === secretKey;
  }

  // Fallback for local development when ADMIN_SECRET_KEY is not yet defined
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return false;
}
