require('../apps/web/node_modules/sucrase/register');
const assert = require('node:assert/strict');
const { loadSharedCatalogPublication } = require('../apps/web/lib/catalog-publication-client.ts');

async function run() {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  let finish;
  try {
    globalThis.fetch = async () => {
      calls++;
      return new Promise(resolve => { finish = resolve; });
    };
    const first = loadSharedCatalogPublication();
    const second = loadSharedCatalogPublication();
    assert.equal(first, second);
    assert.equal(calls, 1);
    finish(Response.json({ overrides: {} }));
    assert.equal((await first).status, 'verified');
    assert.equal(await first, await second);
    const next = loadSharedCatalogPublication();
    assert.equal(calls, 2, 'A completed response must not be cached');
    finish(new Response('', { status: 503 }));
    assert.equal((await next).status, 'unavailable');
    const recovered = loadSharedCatalogPublication();
    assert.equal(calls, 3, 'Failures must not stay cached');
    finish(Response.json({ overrides: {} }));
    assert.equal((await recovered).status, 'verified');
    console.log('PASS catalog request sharing, fresh reload, and recovery after failure');
  } finally {
    globalThis.fetch = originalFetch;
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
