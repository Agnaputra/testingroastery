import assert from 'node:assert/strict';
import { isCartItemAvailable } from './cart-publication.ts';

const active = new Set(['published-bean', 'blend-bean']);
const item = (productId, slug, componentSlugs) => ({ productId, slug, componentSlugs });

assert.equal(isCartItemAvailable(item('coffee-1', 'published-bean'), active), true);
assert.equal(isCartItemAvailable(item('coffee-2', 'unpublished-bean'), active), false);
assert.equal(isCartItemAvailable(item('byob-1', 'custom', ['published-bean', 'blend-bean']), active), true);
assert.equal(isCartItemAvailable(item('byob-1', 'custom', ['published-bean', 'unpublished-bean']), active), false);
assert.equal(isCartItemAvailable(item('byob-legacy', 'custom'), active), false);
assert.equal(isCartItemAvailable(item('addon-1', 'brewing-accessories'), active), true);
console.log('cart-publication: ok (6 assertions)');
