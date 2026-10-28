// Exports current published prices for the restricted PostgreSQL checkout seed.
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  mod._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, filename);
};
const { getPublishedProducts } = require('../lib/catalog-master.ts');
const { getPackagePrice } = require('../lib/blend-profile.ts');
const { ACCESSORIES } = require('../lib/accessories.ts');
const products = getPublishedProducts();
const rows = products.flatMap((product) => [
  ...product.variants.map((variant) => ({
    skuId: `${product.slug}:beans:${variant.weightGrams}:${encodeURIComponent(variant.weightLabel)}`,
    slug: product.slug,
    productName: product.name,
    variantLabel: variant.weightLabel,
    amountIdr: variant.price,
    inStock: variant.inStock,
    category: 'beans', weightGrams: variant.weightGrams, resourceId: `bean:${product.slug}`,
  })),
  ...(product.cupPrice ? [{
    skuId: `${product.slug}:cup:1:${encodeURIComponent('1 sajian')}`,
    slug: product.slug,
    productName: product.name,
    variantLabel: '1 sajian',
    amountIdr: product.cupPrice,
    inStock: true,
    category: 'cup', weightGrams: 1, resourceId: `bean:${product.slug}`,
  }] : []),
]).concat(ACCESSORIES.map((item) => ({
  skuId: item.id, slug: 'brewing-accessories', productName: item.name,
  variantLabel: item.weightLabel, amountIdr: item.price, inStock: true,
  category: 'accessory', weightGrams: 0, resourceId: `accessory:${item.id}`,
})));
const blendPrices = products.filter((product) => product.category === 'espresso' && !product.isSoldOut)
  .flatMap((product) => [250, 500, 1000].map((weightGrams) => ({
    slug: product.slug, productName: product.name, weightGrams,
    amountIdr: getPackagePrice(product.variants, weightGrams),
  }))).filter((row) => row.amountIdr > 0);
if (!rows.length || rows.some((row) => !Number.isSafeInteger(row.amountIdr) || row.amountIdr <= 0)) {
  throw new Error('Published catalog price snapshot is invalid');
}
process.stdout.write(JSON.stringify({ rows, blendPrices }));
