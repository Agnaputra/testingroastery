const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('../apps/web/node_modules/typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, file);
const { BASE_STATIC_QRIS, calculateCrc16, generateDynamicQrisPayload } = require('../apps/web/lib/qris.ts');
const { qrisImage } = require('../apps/web/lib/customer-payment-server.ts');

async function run() {
  assert.equal(calculateCrc16('123456789'), '29B1');
  const payload = generateDynamicQrisPayload(125000);
  assert.ok(payload.includes('010212'));
  assert.ok(payload.includes('5406125000'));
  assert.equal(payload.slice(-4), calculateCrc16(payload.slice(0, -4)));
  assert.notEqual(payload, generateDynamicQrisPayload(125001));
  const updated = generateDynamicQrisPayload(99000, payload);
  assert.ok(updated.includes('540599000'));
  assert.equal(updated.split('5406').length, 1, 'old amount must be removed');
  for (const amount of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => generateDynamicQrisPayload(amount));
  }
  assert.throws(() => generateDynamicQrisPayload(1000, BASE_STATIC_QRIS.slice(0, -4) + '0000'));
  const malformed = '00020101021153033605802ID5910merchant6304';
  assert.throws(() => generateDynamicQrisPayload(1000, malformed + calculateCrc16(malformed)));
  const png = await qrisImage(BASE_STATIC_QRIS, 125000);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  const { NextRequest } = require('../apps/web/node_modules/next/server');
  const { GET } = require('../apps/web/app/api/customer/payment-instructions/image/route.ts');
  const savedEnv = { ...process.env };
  const savedFetch = global.fetch;
  try {
    for (const key of Object.keys(process.env)) if (/^(PAYMENT_|CUSTOMER_COMMERCE|CUSTOMER_PAYMENT_METHODS)/.test(key)) delete process.env[key];
    Object.assign(process.env, { CUSTOMER_COMMERCE_MODE: 'testing', ENVIRONMENT: 'preview', AI_BACKEND_URL: 'https://backend.invalid' });
    const order = { id: '00000000-0000-0000-0000-000000000001', paymentMethod: 'qris_static', paymentStatus: 'pending', total: 125000 };
    const request = () => new NextRequest(`https://frontend.invalid/api/customer/payment-instructions/image?order=${order.id}&amount=1`, { headers: { cookie: '52coffee_customer_session=fixture' } });
    global.fetch = async (_, options) => {
      assert.equal(options.headers.Authorization, 'Bearer fixture');
      return Response.json(order);
    };
    const response = await GET(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Content-Type'), 'image/png');
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('Content-Disposition'), 'inline');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), png, 'browser amount must not override backend total');
    const downloadRequest = new NextRequest(`${request().url}&download=1`, { headers: { cookie: '52coffee_customer_session=fixture' } });
    const download = await GET(downloadRequest);
    assert.equal(download.status, 200);
    assert.equal(download.headers.get('Content-Disposition'), 'attachment; filename="52coffee-qris.png"');
    assert.equal(download.headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(Buffer.from(await download.arrayBuffer()), png, 'download must match the displayed QR');
    for (const status of ['paid', 'cancelled', 'awaiting_verification']) {
      order.paymentStatus = status;
      assert.equal((await GET(request())).status, 404);
      assert.equal((await GET(downloadRequest)).status, 404);
    }
    global.fetch = async () => new Response(null, { status: 404 });
    assert.equal((await GET(request())).status, 404, 'backend denial must not produce a QR');
    global.fetch = async () => { throw new Error('must not fetch without session'); };
    assert.equal((await GET(new NextRequest(`https://frontend.invalid/?order=${order.id}`))).status, 404);
  } finally {
    global.fetch = savedFetch;
    for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
    Object.assign(process.env, savedEnv);
  }
  console.log('PASS: dynamic amount, replacement, CRC, invalid input, merchant validation, PNG');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
