'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from './useCartStore';

export function useCartHydration(): boolean {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const persist = useCartStore.persist;
    const unsubscribe = persist.onFinishHydration(() => setHasHydrated(true));

    if (persist.hasHydrated()) setHasHydrated(true);

    return unsubscribe;
  }, []);

  return hasHydrated;
}
