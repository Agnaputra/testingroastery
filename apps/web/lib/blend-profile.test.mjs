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
assert.deepEqual(combineBlendTastingNotes([
  { ratio: 70, notes: ['Chocolate', 'Brown Sugar', 'Full Body'] },
  { ratio: 30, notes: ['Sweet Chocolate', 'Brown Sugar', 'Medium Body'] },
]), ['Chocolate', 'Sweet Chocolate', 'Brown Sugar', 'Full Body']);

console.log('blend-profile: ok');
