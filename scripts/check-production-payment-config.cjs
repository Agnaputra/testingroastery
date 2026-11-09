const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('../apps/web/node_modules/typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, file);
const { manualPaymentConfig } = require('../apps/web/lib/customer-payment-server.ts');
const saved = { ...process.env };
try {
  for (const key of Object.keys(process.env)) if (/^(PAYMENT_|CUSTOMER_PAYMENT_METHODS|CUSTOMER_COMMERCE|NEXT_PUBLIC_CUSTOMER_COMMERCE|VERCEL_|ENVIRONMENT)/.test(key)) delete process.env[key];
  process.env.CUSTOMER_COMMERCE_MODE = 'operational';
  process.env.VERCEL_ENV = 'production';
  process.env.PAYMENT_TEST_BCA_ACCOUNT = '1234567890';
  process.env.CUSTOMER_PAYMENT_METHODS = 'bca_transfer';
  assert.equal(manualPaymentConfig('bca_transfer'), null, 'production must not use testing credentials');
  Object.assign(process.env, { PAYMENT_BCA_ACCOUNT: '1234567890', PAYMENT_BCA_HOLDER: 'Synthetic Fixture', PAYMENT_QRIS_MERCHANT: 'Synthetic Merchant', PAYMENT_QRIS_PATH: 'public/nonexistent-configuration-fixture.jpg' });
  assert.ok(manualPaymentConfig('bca_transfer'), 'BCA must work without QRIS');
  assert.equal(manualPaymentConfig('qris_static'), null, 'disabled QRIS must remain unavailable despite configured merchant');
  delete process.env.CUSTOMER_PAYMENT_METHODS;
  assert.equal(manualPaymentConfig('bca_transfer'), null, 'production methods require explicit activation');
  process.env.CUSTOMER_PAYMENT_METHODS = 'bca_transfer,qris_static';
  assert.equal(manualPaymentConfig('qris_static'), null, 'missing production QRIS must not fall back');
  process.env.VERCEL_ENV = 'preview';
  assert.equal(manualPaymentConfig('bca_transfer'), null, 'preview must not enable operational payment config');
  process.env.CUSTOMER_COMMERCE_MODE = 'testing';
  delete process.env.CUSTOMER_PAYMENT_METHODS;
  delete process.env.PAYMENT_QRIS_PATH;
  assert.ok(manualPaymentConfig('bca_transfer'), 'Preview BCA remains available');
  assert.ok(manualPaymentConfig('qris_static'), 'Preview QRIS remains available');
  const modePath = require.resolve('../apps/web/lib/customer-commerce-mode.ts');
  for (const mode of ['operational', 'testing', 'disabled']) {
    process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_MODE = mode;
    process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE = '0';
    delete require.cache[modePath];
    assert.equal(require(modePath).usesCustomerCommerce, mode !== 'disabled');
  }
  console.log('PASS: BCA independent of QRIS; explicit production methods; Preview testing preserved');
} finally {
  for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
  Object.assign(process.env, saved);
}
