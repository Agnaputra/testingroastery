// Run with Node --experimental-strip-types from the repository root.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../../web/lib/data.ts');
const output = resolve(here, 'price_baseline_3b4_c2.json');
const { PRODUCTS } = await import(`file://${source.replaceAll('\\', '/')}`);
const coffees = PRODUCTS.filter((product) => ['filter', 'espresso', 'reserve'].includes(product.category));
if (coffees.length !== 31 || new Set(coffees.map((product) => product.slug)).size !== 31) {
  throw new Error('Expected exactly 31 distinct coffee products');
}
const skus = coffees.flatMap((product) => [
  ...product.variants.map((variant) => ({
    sku_id: `${product.slug}:beans:${variant.weightGrams}`,
    slug: product.slug,
    kind: 'beans',
    weight_grams: variant.weightGrams,
    amount_idr: variant.price,
  })),
  ...(product.cupPrice ? [{
    sku_id: `${product.slug}:cup:1`, slug: product.slug, kind: 'cup',
    weight_grams: 1, amount_idr: product.cupPrice,
  }] : []),
]);
if (skus.some((sku) => !Number.isSafeInteger(sku.amount_idr) || sku.amount_idr <= 0)
  || new Set(skus.map((sku) => sku.sku_id)).size !== skus.length) {
  throw new Error('Invalid or duplicate baseline SKU price');
}
const document = {
  baseline_revision: 1,
  source: 'apps/web/lib/data.ts (31 coffee products only; test baseline, not owner validated)',
  source_sha256: createHash('sha256').update(readFileSync(source)).digest('hex'),
  exported_at_utc: new Date().toISOString(),
  product_count: coffees.length,
  sku_count: skus.length,
  skus: skus.sort((a, b) => a.sku_id.localeCompare(b.sku_id)),
};
writeFileSync(output, `${JSON.stringify(document, null, 2)}\n`, { flag: 'wx' });
console.log(JSON.stringify({ output, products: document.product_count, skus: document.sku_count, source_sha256: document.source_sha256 }));
