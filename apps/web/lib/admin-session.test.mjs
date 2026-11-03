import assert from 'node:assert/strict';
import { randomBytes, scryptSync } from 'node:crypto';
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  adminCredentialsConfigured,
  createAdminSessionToken,
  getExpectedAdminPin,
  hasAuthorizedAdminSession,
  hasValidAdminSession,
  verifyAdminCredentials,
} from './admin-session.ts';

process.env.ADMIN_API_KEY = 'synthetic-admin-session-test-key';
const token = createAdminSessionToken();
const request = (value) => ({ cookies: { get: (name) => name === ADMIN_SESSION_COOKIE ? { value } : undefined } });
assert.equal(hasValidAdminSession(request(token)), true);
assert.equal(hasValidAdminSession(request(token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a'))), false);
const [issued, nonce, signature] = token.split('.');
assert.equal(hasValidAdminSession(request(`${(parseInt(issued, 36) - 60 * 60 * 9).toString(36)}.${nonce}.${signature}`)), false);
assert.equal(hasValidAdminSession(request('invalid')), false);
process.env.AI_BACKEND_URL = 'https://preview-backend.example';
const originalFetch = globalThis.fetch;
globalThis.fetch = async (_url, options) => new Response(JSON.stringify({ role: 'admin', emailVerified: true }), {
  status: options?.headers?.Authorization === 'Bearer synthetic-customer-session' ? 200 : 401,
  headers: { 'Content-Type': 'application/json' },
});
const authorizedRequest = {
  cookies: {
    get: (name) => name === ADMIN_SESSION_COOKIE ? { value: token }
      : name === CUSTOMER_SESSION_COOKIE ? { value: 'synthetic-customer-session' } : undefined,
  },
};
assert.equal(await hasAuthorizedAdminSession(authorizedRequest), true);
globalThis.fetch = async () => new Response(JSON.stringify({ role: 'customer', emailVerified: true }), {
  status: 200, headers: { 'Content-Type': 'application/json' },
});
assert.equal(await hasAuthorizedAdminSession(authorizedRequest), false);
globalThis.fetch = async () => new Response(JSON.stringify({ role: 'admin', emailVerified: false }), {
  status: 200, headers: { 'Content-Type': 'application/json' },
});
assert.equal(await hasAuthorizedAdminSession(authorizedRequest), false);
assert.equal(await hasAuthorizedAdminSession(request(token)), false);
globalThis.fetch = originalFetch;
delete process.env.ADMIN_USERNAME;
delete process.env.ADMIN_PASSWORD_HASH;
assert.equal(adminCredentialsConfigured(), false);
const salt = randomBytes(16);
process.env.ADMIN_USERNAME = 'synthetic-owner';
process.env.ADMIN_PASSWORD_HASH = `${salt.toString('hex')}:${scryptSync('synthetic-password', salt, 32).toString('hex')}`;
process.env.ADMIN_PIN = '987654';
assert.equal(adminCredentialsConfigured(), true);
assert.equal(verifyAdminCredentials('synthetic-owner', 'synthetic-password'), true);
assert.equal(verifyAdminCredentials('synthetic-owner', 'wrong-password'), false);
assert.equal(getExpectedAdminPin(), '987654');
console.log('admin-session: ok (13 assertions)');
