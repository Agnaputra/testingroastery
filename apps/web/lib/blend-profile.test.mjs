import assert from 'node:assert/strict';
import { calculateBlendPackagePrice, combineBlendTastingNotes, getPackagePrice, getVariantPricePerKg } from './blend-profile.ts';

const variants = [
  { weightGrams: 200, weightLabel: '200g', price: 35_000, inStock: true },
  { weightGrams: 500, weightLabel: '500g', price: 85_000, inStock: true },
  { weightGrams: 1000, weightLabel: '1kg', price: 150_000, inStock: true },
];

assert.equal(getPackagePrice(variants, 250), 44_000);
assert.equal(getPackagePrice(variants, 500), 85_000);
assert.equal(getVariantPricePerKg(variants[0]), 175_000);
assert.equal(getVariantPricePerKg({ weightGrams: 0, weightLabel: 'invalid', price: 10_000, inStock: true }), 0);
assert.equal(calculateBlendPackagePrice([
  { ratio: 70, prices: { 250: 88_000, 500: 135_000, 1000: 260_000 } },
  { ratio: 30, prices: { 250: 44_000, 500: 85_000, 1000: 150_000 } },
], 250), 75_000);
const roundingComponents = [
  { ratio: 14, prices: { 250: 44_000, 500: 88_000, 1000: 176_000 } },
  { ratio: 57, prices: { 250: 44_000, 500: 88_000, 1000: 176_000 } },
  { ratio: 29, prices: { 250: 94_000, 500: 188_000, 1000: 376_000 } },
];
assert.equal(calculateBlendPackagePrice(roundingComponents, 250), 59_000, '58,500 must round up as in checkout');
assert.equal(calculateBlendPackagePrice([
  { ratio: 30, prices: { 250: 10_000, 500: 20_000, 1000: 40_000 } },
  { ratio: 70, prices: { 250: 85_000, 500: 170_000, 1000: 340_000 } },
], 250), 63_000, '62,500 must also round up for two beans');
for (const weight of [250, 500, 1000]) {
  for (let ratioA = 5; ratioA <= 90; ratioA++) {
    for (let ratioB = 5; ratioB <= 95 - ratioA; ratioB++) {
      const ratios = [ratioA, ratioB, 100 - ratioA - ratioB];
      const components = roundingComponents.map((component, index) => ({ ...component, ratio: ratios[index] }));
      const weightedTotal = components.reduce((total, component) => total + component.prices[weight] * component.ratio, 0);
      const checkoutPrice = Math.floor(weightedTotal / 100_000 + 0.5) * 1000;
      assert.equal(calculateBlendPackagePrice(components, weight), checkoutPrice);
    }
  }
}
assert.equal(calculateBlendPackagePrice(roundingComponents.map((component) => ({ ...component, ratio: component.ratio * 2 })), 250), 59_000);
assert.equal(calculateBlendPackagePrice([], 250), 0);
assert.equal(calculateBlendPackagePrice(roundingComponents.map((component) => ({ ...component, ratio: 0 })), 250), 0);
assert.deepEqual(combineBlendTastingNotes([
  { ratio: 70, notes: ['Chocolate', 'Brown Sugar', 'Full Body'] },
  { ratio: 30, notes: ['Sweet Chocolate', 'Brown Sugar', 'Medium Body'] },
]), ['Chocolate', 'Sweet Chocolate', 'Brown Sugar', 'Full Body']);

console.log('blend-profile: ok');
