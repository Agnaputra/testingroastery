import type { ProductVariant } from './data';

export type BlendWeight = 250 | 500 | 1000;
export type BlendPackagePrices = Record<BlendWeight, number>;

const roundToThousand = (value: number) => Math.round(value / 1000) * 1000;

export function getVariantPricePerKg(variant: ProductVariant): number {
  if (variant.weightGrams <= 0 || variant.price <= 0) return 0;
  return Math.round((variant.price / variant.weightGrams) * 1000);
}

export function getPackagePrice(variants: ProductVariant[], targetWeight: BlendWeight): number {
  const available = variants.filter((variant) => variant.inStock && variant.price > 0);
  const exact = available.find((variant) => variant.weightGrams === targetWeight);
  if (exact) return exact.price;

  const nearest = [...available].sort((a, b) => Math.abs(a.weightGrams - targetWeight) - Math.abs(b.weightGrams - targetWeight))[0];
  return nearest ? roundToThousand((nearest.price / nearest.weightGrams) * targetWeight) : 0;
}

export function calculateBlendPackagePrice(
  components: Array<{ ratio: number; prices: BlendPackagePrices }>,
  targetWeight: BlendWeight,
): number {
  const totalRatio = components.reduce((total, component) => total + Math.max(0, component.ratio), 0);
  if (totalRatio === 0) return 0;

  return roundToThousand(components.reduce(
    (total, component) => total + component.prices[targetWeight] * (Math.max(0, component.ratio) / totalRatio),
    0,
  ));
}

export function combineBlendTastingNotes(
  components: Array<{ ratio: number; notes: string[] }>,
  limit = 4,
): string[] {
  const ordered = components.filter((component) => component.ratio > 0).sort((a, b) => b.ratio - a.ratio);
  const combined: string[] = [];

  for (const component of ordered) {
    const representative = component.notes.find((note) => !combined.includes(note));
    if (representative) combined.push(representative);
  }

  for (const component of ordered) {
    for (const note of component.notes) {
      if (!combined.includes(note)) combined.push(note);
      if (combined.length === limit) return combined;
    }
  }

  return combined.slice(0, limit);
}
