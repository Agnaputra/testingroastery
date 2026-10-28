import assert from 'node:assert/strict';

process.env.NEXT_PUBLIC_PRICE_TEST_MODE = '1';
const { resolveCatalogPublicationAuthority, isCatalogReplyCurrent } = await import('./catalog-publication.ts?price-test');

const product = {
  id: 'synthetic', slug: 'sumbing-supernova-celestia', basePrice: 139000, cupPrice: 48000,
  variants: [{ weightGrams: 100, weightLabel: '100g', price: 139000, inStock: true }],
};
const payload = {
  revision: 2, effectiveCatalogFingerprint: 'synthetic-fingerprint', overrides: {},
  prices: {
    'sumbing-supernova-celestia:beans:100': { slug: product.slug, kind: 'beans', weightGrams: 100, amountIdr: 140000 },
    'sumbing-supernova-celestia:cup:1': { slug: product.slug, kind: 'cup', weightGrams: 1, amountIdr: 49000 },
  },
};
const active = resolveCatalogPublicationAuthority([product], payload);
assert.equal(active.status, 'verified');
assert.equal(active.products[0].variants[0].price, 140000);
assert.equal(active.products[0].basePrice, 140000);
assert.equal(active.products[0].cupPrice, 49000);
assert.equal(active.priceRevision, 2);
assert.equal(resolveCatalogPublicationAuthority([product], { ...payload, prices: {} }).products.length, 0);
assert.equal(resolveCatalogPublicationAuthority([product], { ...payload, overrides: { [product.slug]: false } }).products.length, 0);
assert.equal(resolveCatalogPublicationAuthority([product], { overrides: {} }).status, 'unavailable');
assert.equal(isCatalogReplyCurrent(active, [product.slug], active.effectiveCatalogFingerprint), true);
assert.equal(isCatalogReplyCurrent(active, [product.slug], 'old-fingerprint'), false);
assert.equal(isCatalogReplyCurrent(resolveCatalogPublicationAuthority([product], { ...payload, overrides: { [product.slug]: false } }), [product.slug]), false);
assert.equal(isCatalogReplyCurrent({ status: 'unavailable', products: [] }, [product.slug]), false);
assert.equal(isCatalogReplyCurrent({ status: 'verified', products: [{ slug: 'prau-natural-surya' }] }, ['prau-natural-el-davisio-surya']), true);
console.log('catalog-price-authority: ok (13 assertions)');
