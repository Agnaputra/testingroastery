'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CartDrawer } from './cart-drawer';
import { VirtualBaristaWidget } from './virtual-barista';
import { PageTransition } from './page-transition';
import { SiteIntroLoader } from './site-intro-loader';
import { Check, X } from 'lucide-react';
import { useCartStore } from '../lib/store/useCartStore';

function CartToast() {
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

export function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // If on admin routes, render as a clean standalone backoffice without customer store UI
  if (isAdminRoute) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#F8FAFC] flex-1">
        {children}
      </main>
    );
  }

  // Regular customer store layout with Navbar, Footer, Cart Drawer, and AI Assistant
  return (
    <>
      <SiteIntroLoader />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <CartToast />
      <VirtualBaristaWidget />
    </>
  );
}
