import type { CoffeeProduct } from './data';

// Match publication_service.PUBLICATION_SLUG_GROUPS in the AI backend.
const SLUG_GROUPS = [
  ['prau-natural-surya', 'prau-natural-el-davisio-surya'],
  ['grand-reserve-magnum-sidra', 'magnum-sidra-el-vergel-soberano'],
  ['grand-reserve-el-triunfo-geisha', 'el-triunfo-geisha-tolima-aurora'],
  ['grand-reserve-sudan-rume-carmin', 'sudan-rume-huila-carmin'],
  ['grand-reserve-yemen-sahara', 'yemen-haraz-golden-harvest-sahara'],
  ['dampit-natural-robusta-espresso', 'dampit-natural-espresso'],
] as const;

export type CatalogPublicationAuthority =
  | { status: 'verified'; products: CoffeeProduct[]; priceRevision?: number; effectiveCatalogFingerprint?: string }
  | { status: 'unavailable'; products: [] };

export function isCatalogReplyCurrent(
  authority: CatalogPublicationAuthority | null,
  productSlugs: string[] = [],
  fingerprint?: string,
): boolean {
  return authority?.status === 'verified'
    && (!fingerprint || authority.effectiveCatalogFingerprint === fingerprint)
    && productSlugs.every((slug) => authority.products.some((product) => product.slug === slug
      || SLUG_GROUPS.some((group) => group.some((alias) => alias === slug) && group.some((alias) => alias === product.slug))));
}

export const PRICE_TEST_MODE = process.env.NEXT_PUBLIC_PRICE_TEST_MODE === '1';
export const CATALOG_AUTHORITY_PATH = PRICE_TEST_MODE ? '/api/catalog/authority' : '/api/catalog/publication';

type PublicationResponse = {
  overrides: Record<string, boolean>;
  managedProducts?: CoffeeProduct[];
  unpublishedSlugs?: string[];
  revision?: number;
  effectiveCatalogFingerprint?: string;
  prices?: Record<string, { slug: string; kind: string; weightGrams: number; amountIdr: number }>;
};

type PublicationRequest = () => Promise<{
  ok: boolean;
  json: () => Promise<unknown>;
}>;

const unavailable = (): CatalogPublicationAuthority => ({ status: 'unavailable', products: [] });

function isPublicationResponse(value: unknown): value is PublicationResponse {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const overrides = (value as Record<string, unknown>).overrides;
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return false;
  if (!Object.values(overrides).every((published) => typeof published === 'boolean')) return false;
  if (!PRICE_TEST_MODE) return true;
  const record = value as Record<string, unknown>;
  return Number.isSafeInteger(record.revision)
    && typeof record.effectiveCatalogFingerprint === 'string'
    && !!record.prices && typeof record.prices === 'object' && !Array.isArray(record.prices);
}

function applyEffectivePrices(product: CoffeeProduct, prices: NonNullable<PublicationResponse['prices']>): CoffeeProduct | null {
  const variants = product.variants.map((variant) => {
    const row = prices[`${product.slug}:beans:${variant.weightGrams}`];
    return row && row.slug === product.slug && row.kind === 'beans' && Number.isSafeInteger(row.amountIdr) && row.amountIdr > 0
      ? { ...variant, price: row.amountIdr } : null;
  });
  if (variants.some((variant) => variant === null)) return null;
  const cupRow = product.cupPrice ? prices[`${product.slug}:cup:1`] : undefined;
  if (product.cupPrice && (!cupRow || cupRow.slug !== product.slug || cupRow.kind !== 'cup' || !Number.isSafeInteger(cupRow.amountIdr) || cupRow.amountIdr <= 0)) return null;
  const pricedVariants = variants as CoffeeProduct['variants'];
  const baselineVariant = product.variants.find((variant) => variant.price === product.basePrice) ?? product.variants[0];
  const effectiveBase = pricedVariants.find((variant) => variant.weightGrams === baselineVariant?.weightGrams)?.price;
  if (!effectiveBase) return null;
  return { ...product, variants: pricedVariants, basePrice: effectiveBase, cupPrice: cupRow?.amountIdr };
}

export function resolveCatalogPublicationAuthority(
  products: CoffeeProduct[],
  payload: unknown,
): CatalogPublicationAuthority {
  if (!isPublicationResponse(payload)) return unavailable();
  const active = products.filter((product) => {
    const group = SLUG_GROUPS.find((entry) => entry.some((slug) => slug === product.slug));
    return [product.slug, ...(group ?? [])].every(
      (slug) => !slug || payload.overrides[slug] !== false,
    );
  });
  const priced = PRICE_TEST_MODE
    ? active.flatMap((product) => {
        const effective = applyEffectivePrices(product, payload.prices ?? {});
        return effective ? [effective] : [];
      })
    : active;
  const productsBySlug = new Map(priced.map((product) => [product.slug, product]));
  for (const slug of payload.unpublishedSlugs ?? []) productsBySlug.delete(slug);
  for (const product of payload.managedProducts ?? []) {
    if (product && typeof product.slug === 'string' && Array.isArray(product.variants)
        && payload.overrides[product.slug] !== false) productsBySlug.set(product.slug, product);
  }
  return {
    status: 'verified',
    products: [...productsBySlug.values()],
    priceRevision: payload.revision,
    effectiveCatalogFingerprint: payload.effectiveCatalogFingerprint,
  };
}

export async function loadCatalogPublicationAuthority(
  products: CoffeeProduct[],
  request: PublicationRequest,
): Promise<CatalogPublicationAuthority> {
  try {
    const response = await request();
    if (!response.ok) return unavailable();
    return resolveCatalogPublicationAuthority(products, await response.json());
  } catch {
    return unavailable();
  }
}

export async function isProductCurrentlyPublished(product: CoffeeProduct): Promise<boolean> {
  return (await getCurrentEffectiveProduct(product)) !== null;
}

export async function getCurrentEffectiveProduct(product: CoffeeProduct): Promise<CoffeeProduct | null> {
  const authority = await loadCatalogPublicationAuthority(
    [product],
    () => fetch(CATALOG_AUTHORITY_PATH, { cache: 'no-store' }),
  );
  return authority.status === 'verified' ? authority.products[0] ?? null : null;
}
