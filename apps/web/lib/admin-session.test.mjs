import assert from 'node:assert/strict';
import { ADMIN_SESSION_COOKIE, createAdminSessionToken, hasValidAdminSession } from './admin-session.ts';

process.env.ADMIN_API_KEY = 'synthetic-admin-session-test-key';
const token = createAdminSessionToken();
const request = (value) => ({ cookies: { get: (name) => name === ADMIN_SESSION_COOKIE ? { value } : undefined } });
assert.equal(hasValidAdminSession(request(token)), true);
assert.equal(hasValidAdminSession(request(token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a'))), false);
const [issued, nonce, signature] = token.split('.');
assert.equal(hasValidAdminSession(request(`${(parseInt(issued, 36) - 60 * 60 * 9).toString(36)}.${nonce}.${signature}`)), false);
assert.equal(hasValidAdminSession(request('invalid')), false);
console.log('admin-session: ok (4 assertions)');
