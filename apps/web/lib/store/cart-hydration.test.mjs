import assert from 'node:assert/strict';
import { getHydratedCartItemCount } from './cart-hydration.ts';

const rendersBadge = (count) => count !== null && count > 0;

assert.equal(getHydratedCartItemCount(false, 5), null, 'Before hydration, the badge must be neutral.');
assert.equal(rendersBadge(getHydratedCartItemCount(false, 5)), false);

assert.equal(getHydratedCartItemCount(true, 5), 5, 'Persisted quantity must appear after hydration.');
assert.equal(getHydratedCartItemCount(true, 0), 0, 'An empty hydrated cart remains empty.');
assert.equal(rendersBadge(getHydratedCartItemCount(true, 0)), false);

assert.equal(getHydratedCartItemCount(false, 4), null, 'A remounted navbar must not show a stale zero.');
assert.equal(getHydratedCartItemCount(true, 4), 4);
assert.equal(getHydratedCartItemCount(true, 6), 6, 'Hydrated cart updates must remain reactive.');

console.log('cart-hydration: ok');
