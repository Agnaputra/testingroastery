const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

function loadRoute(name) {
  const file = path.join(__dirname, '../app/api/customer/google', name, 'route.ts');
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const routeModule = { exports: {} };
  const routeRequire = id => id.includes('admin-session')
    ? { ADMIN_SESSION_COOKIE: '52coffee_admin_session', hasAdminBackendSessionToken: async () => false }
    : require(id);
  vm.runInNewContext(code, { module: routeModule, exports: routeModule.exports, require: routeRequire, process, URL, URLSearchParams, console, fetch, Headers, AbortSignal });
  return routeModule.exports.GET;
}

async function run() {
  process.env.CUSTOMER_GOOGLE_CLIENT_ID = 'test-client';
  process.env.CUSTOMER_GOOGLE_REDIRECT_URI = 'https://coffee.example/api/customer/google/callback';
  const start = loadRoute('start');
  const callback = loadRoute('callback');
  const request = () => new NextRequest('https://coffee.example/api/customer/google/start?next=%2Faccount');
  const first = start(request());
  const second = start(request());
  assert.equal(first.headers.get('cache-control'), 'no-store');
  const firstUrl = new URL(first.headers.get('location'));
  assert.notEqual(firstUrl.searchParams.get('state'), new URL(second.headers.get('location')).searchParams.get('state'));
  const flow = first.cookies.get('52coffee_google_flow');
  assert.ok(flow.httpOnly);
  assert.equal(flow.sameSite, 'lax');
  const target = new URL(process.env.CUSTOMER_GOOGLE_REDIRECT_URI);
  target.searchParams.set('state', firstUrl.searchParams.get('state'));
  target.searchParams.set('error', 'access_denied');
  const req = new NextRequest(target);
  req.cookies.set(flow.name, flow.value);
  const denied = await callback(req);
  assert.equal(new URL(denied.headers.get('location')).searchParams.get('reason'), 'google_denied');
  assert.equal(denied.headers.get('cache-control'), 'no-store');
  target.searchParams.set('state', 'forged');
  const forged = new NextRequest(target);
  forged.cookies.set(flow.name, flow.value);
  assert.equal(new URL((await callback(forged)).headers.get('location')).searchParams.get('reason'), 'state_mismatch');
  const missing = await callback(new NextRequest(target));
  assert.equal(new URL(missing.headers.get('location')).searchParams.get('reason'), 'flow_cookie_missing');
  assert.equal(missing.headers.get('cache-control'), 'no-store');
  const canonical = start(new NextRequest('https://alias.example/api/customer/google/start'));
  assert.equal(new URL(canonical.headers.get('location')).origin, 'https://coffee.example');
  assert.equal(canonical.headers.get('cache-control'), 'no-store');
  console.log('PASS OAuth cookies, fresh state, canonical origin, no-store, and state rejection');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
