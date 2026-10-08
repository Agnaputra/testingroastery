import assert from 'node:assert/strict';
import { PRODUCTS } from './data.ts';
import { mapRecommendationsToCatalog } from './virtual-barista-recommendations.ts';

const bySlug = (slug) => {
  const product = PRODUCTS.find((item) => item.slug === slug);
  assert.ok(product, `Missing fixture product: ${slug}`);
  return product;
};

const buntu = bySlug('buntu-lenta-natural-duharman');
const sindoro = bySlug('sindoro-strawberry-selai');
const puntang = bySlug('puntang-natural-aromanis');
const catalog = [buntu, puntang, sindoro];
const backendOrder = [buntu.slug, sindoro.slug, puntang.slug];

const selected = (product) => {
  const variant = product.variants.find((item) => item.inStock);
  assert.ok(variant, `Missing in-stock fixture variant: ${product.slug}`);
  return { slug: product.slug, selectedVariant: { weightGrams: variant.weightGrams, price: 1 } };
};

const ranked = mapRecommendationsToCatalog(catalog, backendOrder, backendOrder.map((slug) => selected(bySlug(slug))));
assert.deepEqual(ranked.map((product) => product.slug), backendOrder);
assert.equal(ranked[1].slug, sindoro.slug, 'Ordinal references must match the second visible card.');
assert.equal(ranked[1].selectedVariant?.price, sindoro.variants.find((item) => item.inStock)?.price);

const filtered = mapRecommendationsToCatalog(catalog, [buntu.slug, 'unpublished-product', sindoro.slug, puntang.slug], []);
assert.deepEqual(filtered.map((product) => product.slug), backendOrder);

const deduplicated = mapRecommendationsToCatalog(catalog, [buntu.slug, sindoro.slug, sindoro.slug, puntang.slug], []);
assert.deepEqual(deduplicated.map((product) => product.slug), backendOrder);

console.log('virtual-barista-recommendations: ok');
