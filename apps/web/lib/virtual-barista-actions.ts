export const ACTION_MAX_QUANTITY = 10;

export const ALLOWED_FEATURE_PATHS = new Set([
  '/catalog',
  '/coffee-lab/brewing-guidance',
  '/blend-builder',
  '/coffee-lab/coffee-experiments',
  '/work-with-us/consultations',
  '/work-with-us#wholesale-partnership',
]);

export type VirtualBaristaAction =
  | { action_id: string; type: 'add_to_cart'; product_slug: string; variant_weight: number; quantity: number }
  | { action_id: string; type: 'view_product'; product_slug: string }
  | { action_id: string; type: 'open_feature'; path: string };

const hasSafeId = (value: unknown): value is string => typeof value === 'string' && /^vb-[a-f0-9]{20}$/.test(value);

export function isVirtualBaristaAction(value: unknown): value is VirtualBaristaAction {
  if (!value || typeof value !== 'object') return false;
  const action = value as Record<string, unknown>;
  if (!hasSafeId(action.action_id)) return false;
  if (action.type === 'add_to_cart') {
    return typeof action.product_slug === 'string'
      && Number.isInteger(action.variant_weight) && Number(action.variant_weight) > 0
      && Number.isInteger(action.quantity) && Number(action.quantity) >= 1 && Number(action.quantity) <= ACTION_MAX_QUANTITY;
  }
  if (action.type === 'view_product') return typeof action.product_slug === 'string';
  return action.type === 'open_feature' && typeof action.path === 'string' && ALLOWED_FEATURE_PATHS.has(action.path);
}
