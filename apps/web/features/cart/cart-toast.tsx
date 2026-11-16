'use client';

import { Check, X } from 'lucide-react';
import { useEffect } from 'react';
import { useCartStore } from '../../lib/store/useCartStore';

export function CartToast() {
  const { lastAddedName, dismissToast, openDrawer } = useCartStore();

  useEffect(() => {
    if (!lastAddedName) return;
    const timeout = window.setTimeout(dismissToast, 4000);
    return () => window.clearTimeout(timeout);
  }, [lastAddedName, dismissToast]);

  if (!lastAddedName) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-[80] flex w-[min(92vw,30rem)] -translate-x-1/2 items-center gap-3 border border-white/20 bg-brand-charcoal px-4 py-3 text-sm text-white shadow-floating sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0 rounded-lg"
    >
      <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-teal" />
      <span className="min-w-0 flex-1 truncate">
        <strong className="font-semibold">{lastAddedName}</strong> ditambahkan ke keranjang.
      </span>
      <button
        type="button"
        onClick={() => {
          dismissToast();
          openDrawer();
        }}
        className="shrink-0 rounded bg-brand-teal px-2.5 py-1 text-xs font-semibold text-brand-charcoal transition-colors hover:bg-brand-mist"
      >
        Lihat Keranjang
      </button>
      <button
        type="button"
        onClick={dismissToast}
        aria-label="Tutup notifikasi"
        className="icon-button h-8 min-h-8 w-8 min-w-8 border-white/20 text-white hover:bg-white/10"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
