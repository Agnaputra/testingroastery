import type { CartItem } from './store/useCartStore';

export function isCartItemAvailable(item: CartItem, activeSlugs: Set<string>): boolean {
  if (item.productId.startsWith('addon-')) return true;
  if (item.productId.startsWith('byob-')) {
    const components = item.componentSlugs ?? [];
    return components.length > 0 && components.every((slug) => activeSlugs.has(slug));
  }
  return activeSlugs.has(item.slug);
}
