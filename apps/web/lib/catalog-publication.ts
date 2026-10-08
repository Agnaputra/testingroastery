import type { CoffeeProduct } from './data';

export type CatalogPublicationAuthority =
  | { status: 'verified'; products: CoffeeProduct[] }
  | { status: 'unavailable'; products: [] };

type PublicationResponse = {
  overrides: Record<string, boolean>;
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
  return Object.values(overrides).every((published) => typeof published === 'boolean');
}

export function resolveCatalogPublicationAuthority(
  products: CoffeeProduct[],
  payload: unknown,
): CatalogPublicationAuthority {
  if (!isPublicationResponse(payload)) return unavailable();
  return {
    status: 'verified',
    products: products.filter((product) => payload.overrides[product.slug] !== false),
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
