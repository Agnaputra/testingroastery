import { getPublishedProducts } from './catalog-master';
import { CATALOG_AUTHORITY_PATH, loadCatalogPublicationAuthority, type CatalogPublicationAuthority } from './catalog-publication';

let pending: Promise<CatalogPublicationAuthority> | null = null;

export function loadSharedCatalogPublication(): Promise<CatalogPublicationAuthority> {
  if (!pending) {
    pending = loadCatalogPublicationAuthority(
      getPublishedProducts(),
      () => fetch(CATALOG_AUTHORITY_PATH, { cache: 'no-store' }),
    ).finally(() => { pending = null; });
  }
  return pending;
}
