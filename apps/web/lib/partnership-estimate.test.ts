import assert from 'node:assert/strict';
import { calculatePartnershipEstimate } from './partnership-estimate';
import { calculateBlendPackagePrice, getVariantPricePerKg } from './blend-profile';

const result = calculatePartnershipEstimate({ beanPrice: 200_000, dose: 18, otherCost: 4_500, sellingPrice: 22_000, dailyCups: 100, days: 30 });
assert.ok(result);
assert.equal(result.coffeePerCup, 3_600);
assert.equal(result.directCostPerCup, 8_100);
assert.equal(result.beanKg, 54);
assert.equal(result.monthlyContribution, 41_700_000);
assert.equal(calculatePartnershipEstimate({ beanPrice: 0, dose: 18, otherCost: 0, sellingPrice: 0, dailyCups: 0, days: 0 }), null);

const blendPrice = calculateBlendPackagePrice([
  { ratio: 14, prices: { 250: 44_000, 500: 88_000, 1000: 176_000 } },
  { ratio: 57, prices: { 250: 44_000, 500: 88_000, 1000: 176_000 } },
  { ratio: 29, prices: { 250: 94_000, 500: 188_000, 1000: 376_000 } },
], 250);
const blendEstimate = calculatePartnershipEstimate({
  beanPrice: getVariantPricePerKg({ price: blendPrice, weightGrams: 250, weightLabel: '250 g', inStock: true }),
  dose: 18, otherCost: 4_500, sellingPrice: 22_000, dailyCups: 100, days: 30,
});
assert.ok(blendEstimate);
assert.equal(blendEstimate.coffeePerCup, 4_248);
assert.equal(blendEstimate.directCostPerCup, 8_748);
assert.equal(blendEstimate.monthlyContribution, 39_756_000);

console.log('partnership-estimate: ok');
