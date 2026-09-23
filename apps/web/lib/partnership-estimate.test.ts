import assert from 'node:assert/strict';
import { calculatePartnershipEstimate } from './partnership-estimate';

const result = calculatePartnershipEstimate({ beanPrice: 200_000, dose: 18, otherCost: 4_500, sellingPrice: 22_000, dailyCups: 100, days: 30 });
assert.ok(result);
assert.equal(result.coffeePerCup, 3_600);
assert.equal(result.directCostPerCup, 8_100);
assert.equal(result.beanKg, 54);
assert.equal(result.monthlyContribution, 41_700_000);
assert.equal(calculatePartnershipEstimate({ beanPrice: 0, dose: 18, otherCost: 0, sellingPrice: 0, dailyCups: 0, days: 0 }), null);

console.log('partnership-estimate: ok');
