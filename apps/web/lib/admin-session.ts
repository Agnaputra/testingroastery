import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = '52coffee_admin_session';

export function createAdminSessionToken(): string | null {
  const secret = process.env.ADMIN_API_KEY;
  return secret ? createHmac('sha256', secret).update('52coffee-admin-session').digest('hex') : null;
}

export function hasValidAdminSession(request: NextRequest): boolean {
  const expected = createAdminSessionToken();
  const supplied = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!expected || !supplied || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export function safeSecretEqual(supplied: string, expected: string): boolean {
  if (!supplied || !expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
