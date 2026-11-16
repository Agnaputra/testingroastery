import { claimVirtualBaristaActions, type VirtualBaristaAction } from './virtual-barista-actions';

const addToCart = (action_id: string): VirtualBaristaAction => ({
  action_id,
  type: 'add_to_cart',
  product_slug: 'prau',
  variant_weight: 100,
  quantity: 1,
});

export function runVirtualBaristaActionClaimTests() {
  const claimed = new Set<string>();
  const first = addToCart('vb-aaaaaaaaaaaaaaaaaaaa');

  const firstClaim = claimVirtualBaristaActions([first, first], claimed);
  if (firstClaim.length !== 1 || firstClaim[0] !== first) throw new Error('Duplicate batch action was not deduplicated.');

  if (claimVirtualBaristaActions([first], claimed).length !== 0) {
    throw new Error('Replayed action ID was not rejected.');
  }

  const retry = addToCart('vb-bbbbbbbbbbbbbbbbbbbb');
  const retryClaim = claimVirtualBaristaActions([retry], claimed);
  if (retryClaim.length !== 1 || retryClaim[0] !== retry) throw new Error('New action ID was rejected.');

  const navigation: VirtualBaristaAction = {
    action_id: 'vb-cccccccccccccccccccc',
    type: 'open_feature',
    path: '/coffee-lab/brewing-guidance',
  };
  const navigationClaim = claimVirtualBaristaActions([navigation, navigation], claimed);
  if (navigationClaim.length !== 1 || navigationClaim[0] !== navigation) {
    throw new Error('Duplicate navigation action was not deduplicated.');
  }
}
