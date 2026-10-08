import type { CoffeeProduct } from './data';

export interface CatalogSelectedVariant {
  weightGrams: number;
  weightLabel: string;
  price: number;
  pricePerGram: number;
}

export type CatalogRecommendedProduct = CoffeeProduct & {
  selectedVariant?: CatalogSelectedVariant;
};

export function resolveCatalogSelectedVariant(
  product: CoffeeProduct,
  value: unknown,
): CatalogSelectedVariant | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const weightGrams = (value as Record<string, unknown>).weightGrams;
  if (!Number.isInteger(weightGrams) || typeof weightGrams !== 'number' || weightGrams <= 0) return undefined;
  const variant = product.variants.find((item) => item.weightGrams === weightGrams && item.inStock);
  if (!variant) return undefined;
  return {
    weightGrams: variant.weightGrams,
    weightLabel: variant.weightLabel,
    price: variant.price,
    pricePerGram: variant.price / variant.weightGrams,
  };
}

export function mapRecommendationsToCatalog(
  products: CoffeeProduct[],
  rankedSlugs: unknown,
  recommendations: unknown,
): CatalogRecommendedProduct[] {
  if (!Array.isArray(rankedSlugs)) return [];

  const productsBySlug = new Map(products.map((product) => [product.slug, product]));
  const variantsBySlug = new Map<string, CatalogSelectedVariant>();
  if (Array.isArray(recommendations)) {
    for (const recommendation of recommendations) {
      if (!recommendation || typeof recommendation !== 'object') continue;
      const slug = (recommendation as Record<string, unknown>).slug;
      if (typeof slug !== 'string') continue;
      const product = productsBySlug.get(slug);
      const selectedVariant = product
        ? resolveCatalogSelectedVariant(product, (recommendation as Record<string, unknown>).selectedVariant)
        : undefined;
      if (selectedVariant) variantsBySlug.set(slug, selectedVariant);
    }
  }

  const seenSlugs = new Set<string>();
  return rankedSlugs.flatMap((slug: unknown) => {
    if (typeof slug !== 'string' || seenSlugs.has(slug)) return [];
    seenSlugs.add(slug);
    const product = productsBySlug.get(slug);
    return product ? [{ ...product, selectedVariant: variantsBySlug.get(slug) }] : [];
  });
}
