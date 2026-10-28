'use client';

import { useCallback, useEffect, useState } from 'react';
import { getPublishedProducts } from './catalog-master';
import {
  loadCatalogPublicationAuthority,
  CATALOG_AUTHORITY_PATH,
  type CatalogPublicationAuthority,
} from './catalog-publication';

const catalog = getPublishedProducts();

export function useCatalogPublication(enabled = true) {
  const [authority, setAuthority] = useState<CatalogPublicationAuthority | null>(null);
  const refresh = useCallback(async () => {
    const result = await loadCatalogPublicationAuthority(
      catalog,
      () => fetch(CATALOG_AUTHORITY_PATH, { cache: 'no-store' }),
    );
    setAuthority(result);
    return result;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
    const onFocus = () => { void refresh(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [enabled, refresh]);

  return { authority, refresh };
}
