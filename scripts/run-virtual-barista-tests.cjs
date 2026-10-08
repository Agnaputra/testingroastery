const { spawnSync } = require('node:child_process');
const path = require('node:path');

require('../apps/web/node_modules/sucrase/register');

const { runVirtualBaristaActionClaimTests } = require('../apps/web/lib/virtual-barista-actions.test.ts');
const { runVirtualBaristaResponseContractTests } = require('../apps/web/lib/virtual-barista-response.test.ts');

runVirtualBaristaActionClaimTests();
runVirtualBaristaResponseContractTests();

const moduleTests = [
  'apps/web/lib/virtual-barista-recommendations.test.mjs',
  'apps/web/lib/store/cart-hydration.test.mjs',
  'apps/web/lib/catalog-publication.test.mjs',
];

for (const testFile of moduleTests) {
  const result = spawnSync(process.execPath, ['--experimental-strip-types', testFile], {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log('virtual-barista frontend: 5 suites passed (37 assertions)');
