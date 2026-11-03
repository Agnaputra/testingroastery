import assert from 'node:assert/strict';
import { ADMIN_SESSION_COOKIE, CUSTOMER_SESSION_COOKIE, hasAuthorizedAdminSession } from './admin-session.ts';

process.env.AI_BACKEND_URL = 'https://preview-backend.example';
const adminToken = 'a'.repeat(64);
const customerToken = 'b'.repeat(64);
const request = (cookies) => ({ cookies: { get: (name) => cookies[name] ? { value: cookies[name] } : undefined } });
const originalFetch = globalThis.fetch;
let calls = 0;
globalThis.fetch = async (url, options) => {
  calls++;
  assert.equal(url, 'https://preview-backend.example/api/customer/auth/me');
  assert.equal(options.headers.Authorization, `Bearer ${adminToken}`);
  return Response.json({ role: 'admin', emailVerified: true });
};
assert.equal(await hasAuthorizedAdminSession(request({ [CUSTOMER_SESSION_COOKIE]: customerToken })), false);
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: 'invalid' })), false);
assert.equal(calls, 0);
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: adminToken })), true);
globalThis.fetch = async () => Response.json({ role: 'customer', emailVerified: true });
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: adminToken })), false);
globalThis.fetch = async () => Response.json({ role: 'admin', emailVerified: false });
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: adminToken })), false);
globalThis.fetch = async () => { throw new Error('backend unavailable'); };
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: adminToken })), false);
globalThis.fetch = originalFetch;
console.log('admin-session: ok');
