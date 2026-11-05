import assert from 'node:assert/strict';
import { ADMIN_SESSION_COOKIE, CUSTOMER_SESSION_COOKIE, hasAuthorizedAdminSession } from './admin-session.ts';

process.env.AI_BACKEND_URL = 'https://preview-backend.example';
const adminToken = 'a'.repeat(64);
const customerToken = 'b'.repeat(64);
const nonAdminToken = 'c'.repeat(64);
const request = (cookies) => ({ cookies: { get: (name) => cookies[name] ? { value: cookies[name] } : undefined } });
const originalFetch = globalThis.fetch;

// 1. Admin token verification
globalThis.fetch = async (url, options) => {
  assert.equal(url, 'https://preview-backend.example/api/customer/auth/me');
  if (options.headers.Authorization === `Bearer ${adminToken}` || options.headers.Authorization === `Bearer ${customerToken}`) {
    return Response.json({ role: 'admin', emailVerified: true });
  }
  return Response.json({ role: 'customer', emailVerified: true });
};

assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: 'invalid' })), false);
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: adminToken })), true);
assert.equal(await hasAuthorizedAdminSession(request({ [CUSTOMER_SESSION_COOKIE]: customerToken })), true);
assert.equal(await hasAuthorizedAdminSession(request({ [CUSTOMER_SESSION_COOKIE]: nonAdminToken })), false);

// 2. Customer role rejection
globalThis.fetch = async () => Response.json({ role: 'customer', emailVerified: true });
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: adminToken })), false);
assert.equal(await hasAuthorizedAdminSession(request({ [CUSTOMER_SESSION_COOKIE]: customerToken })), false);

// 3. Unverified email rejection
globalThis.fetch = async () => Response.json({ role: 'admin', emailVerified: false });
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: adminToken })), false);
assert.equal(await hasAuthorizedAdminSession(request({ [CUSTOMER_SESSION_COOKIE]: customerToken })), false);

// 4. Backend failure handling
globalThis.fetch = async () => { throw new Error('backend unavailable'); };
assert.equal(await hasAuthorizedAdminSession(request({ [ADMIN_SESSION_COOKIE]: adminToken })), false);
assert.equal(await hasAuthorizedAdminSession(request({ [CUSTOMER_SESSION_COOKIE]: customerToken })), false);

globalThis.fetch = originalFetch;
console.log('admin-session: ok');
