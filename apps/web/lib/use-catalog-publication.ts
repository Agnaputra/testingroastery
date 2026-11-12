'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CatalogPublicationAuthority } from './catalog-publication';
import { loadSharedCatalogPublication } from './catalog-publication-client';

export function useCatalogPublication(enabled = true) {
  const [authority, setAuthority] = useState<CatalogPublicationAuthority | null>(null);
  const refresh = useCallback(async () => {
    const result = await loadSharedCatalogPublication();
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
