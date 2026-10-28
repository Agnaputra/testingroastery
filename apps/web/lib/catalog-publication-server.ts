import { getPublishedProducts } from './catalog-master';
import { loadCatalogPublicationAuthority, PRICE_TEST_MODE } from './catalog-publication';

export async function getServerCatalogPublicationAuthority() {
  const backendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
  return loadCatalogPublicationAuthority(
    getPublishedProducts(),
    () => fetch(`${backendUrl}${PRICE_TEST_MODE ? '/api/catalog/authority' : '/api/catalog/publication'}`, { cache: 'no-store' }),
  );
}
