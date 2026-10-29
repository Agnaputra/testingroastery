import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = '52coffee_admin_session';
export const ADMIN_CREDENTIAL_COOKIE = '52coffee_admin_credentials';

const DEFAULT_DEV_SECRET = '52coffee-secret-admin-key';
const DEFAULT_DEV_PIN = '5252';
const DEFAULT_DEV_USER = 'admin';

function getAdminSecret(): string | null {
  return process.env.ADMIN_API_KEY || (process.env.NODE_ENV !== 'production' ? DEFAULT_DEV_SECRET : null);
}

function createScopedToken(scope: 'admin' | 'credentials'): string | null {
  const secret = getAdminSecret();
  if (!secret) return null;
  const issued = Math.floor(Date.now() / 1000).toString(36);
  const nonce = randomBytes(16).toString('hex');
  const body = `${issued}.${nonce}`;
  return `${body}.${createHmac('sha256', secret).update(`${scope}.${body}`).digest('hex')}`;
}

export function createAdminSessionToken(): string | null {
  return createScopedToken('admin');
}

export function createAdminCredentialToken(): string | null {
  return createScopedToken('credentials');
}

export function hasValidAdminSession(request: NextRequest): boolean {
  return hasValidAdminSessionCookie(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function hasValidAdminSessionCookie(supplied?: string): boolean {
  return hasValidScopedToken(supplied, 'admin', 60 * 60 * 8);
}

export function hasValidAdminCredential(request: NextRequest): boolean {
  return hasValidScopedToken(request.cookies.get(ADMIN_CREDENTIAL_COOKIE)?.value, 'credentials', 60 * 10);
}

function hasValidScopedToken(supplied: string | undefined, scope: 'admin' | 'credentials', maxAge: number): boolean {
  const secret = getAdminSecret();
  if (!secret || !supplied) return false;
  const match = /^([0-9a-z]+)\.([0-9a-f]{32})\.([0-9a-f]{64})$/.exec(supplied);
  if (!match) return false;
  const age = Math.floor(Date.now() / 1000) - parseInt(match[1], 36);
  if (!Number.isFinite(age) || age < 0 || age > maxAge) return false;
  const expected = createHmac('sha256', secret).update(`${scope}.${match[1]}.${match[2]}`).digest('hex');
  return timingSafeEqual(Buffer.from(match[3]), Buffer.from(expected));
}

export function safeSecretEqual(supplied: string, expected: string): boolean {
  if (!supplied || !expected || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export function adminCredentialsConfigured(): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH);
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const trimmedUser = username.trim();

  // Local development fallback so dev server doesn't get blocked before reload
  if (process.env.NODE_ENV !== 'production') {
    if (trimmedUser === DEFAULT_DEV_USER && (password === 'kopi52roastery' || password === '52coffee')) {
      return true;
    }
  }

  const expectedUsername = process.env.ADMIN_USERNAME ?? (process.env.NODE_ENV !== 'production' ? DEFAULT_DEV_USER : '');
  const [salt, expectedHash] = (process.env.ADMIN_PASSWORD_HASH ?? '').split(':');
  if (!safeSecretEqual(trimmedUser, expectedUsername) || !salt || !expectedHash || !password) return false;
  const actualHash = scryptSync(password, Buffer.from(salt, 'hex'), 32).toString('hex');
  return safeSecretEqual(actualHash, expectedHash);
}

export function getExpectedAdminPin(): string {
  return process.env.ADMIN_PIN ?? (process.env.NODE_ENV !== 'production' ? DEFAULT_DEV_PIN : '');
}

