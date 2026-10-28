import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = '52coffee_admin_session';

export function createAdminSessionToken(): string | null {
  const secret = process.env.ADMIN_API_KEY;
  if (!secret) return null;
  const issued = Math.floor(Date.now() / 1000).toString(36);
  const nonce = randomBytes(16).toString('hex');
  const body = `${issued}.${nonce}`;
  return `${body}.${createHmac('sha256', secret).update(body).digest('hex')}`;
}

export function hasValidAdminSession(request: NextRequest): boolean {
  return hasValidAdminSessionCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function hasValidAdminSessionCookie(supplied?: string): boolean {
  const secret = process.env.ADMIN_API_KEY;
  if (!secret || !supplied) return false;
  const match = /^([0-9a-z]+)\.([0-9a-f]{32})\.([0-9a-f]{64})$/.exec(supplied);
  if (!match) return false;
  const age = Math.floor(Date.now() / 1000) - parseInt(match[1], 36);
  if (!Number.isFinite(age) || age < 0 || age > 60 * 60 * 8) return false;
  const expected = createHmac('sha256', secret).update(`${match[1]}.${match[2]}`).digest('hex');
  return timingSafeEqual(Buffer.from(match[3]), Buffer.from(expected));
}

export function safeSecretEqual(supplied: string, expected: string): boolean {
  if (!supplied || !expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}
