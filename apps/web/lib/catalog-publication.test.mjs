import assert from 'node:assert/strict';
import { PRODUCTS } from './data.ts';
import {
  loadCatalogPublicationAuthority,
  resolveCatalogPublicationAuthority,
} from './catalog-publication.ts';

const catalog = PRODUCTS.slice(0, 2);
const hiddenSlug = catalog[0].slug;

const zeroOverrides = resolveCatalogPublicationAuthority(catalog, { overrides: {} });
assert.equal(zeroOverrides.status, 'verified');
assert.deepEqual(zeroOverrides.products, catalog);

const explicitUnpublished = resolveCatalogPublicationAuthority(catalog, {
  overrides: { [hiddenSlug]: false },
});
assert.equal(explicitUnpublished.status, 'verified');
assert.deepEqual(explicitUnpublished.products.map((product) => product.slug), [catalog[1].slug]);

const malformedAuthority = resolveCatalogPublicationAuthority(catalog, { overrides: { [hiddenSlug]: 'false' } });
assert.equal(malformedAuthority.status, 'unavailable');
assert.deepEqual(malformedAuthority.products, []);

const endpointError = await loadCatalogPublicationAuthority(catalog, async () => ({
  ok: false,
  json: async () => ({ overrides: {} }),
}));
assert.equal(endpointError.status, 'unavailable');
assert.deepEqual(endpointError.products, []);

const requestFailure = await loadCatalogPublicationAuthority(catalog, async () => {
  throw new Error('publication endpoint unavailable');
});
assert.equal(requestFailure.status, 'unavailable');
assert.deepEqual(requestFailure.products, []);

console.log('catalog-publication: ok (10 assertions)');
