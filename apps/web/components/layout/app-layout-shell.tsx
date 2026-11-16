'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { CartDrawer } from '../../features/cart/cart-drawer';
import { VirtualBaristaWidget } from '../../features/virtual-barista/virtual-barista';
import { PageTransition } from './page-transition';
import { SiteIntroLoader } from './site-intro-loader';
import { CartToast } from '../../features/cart/cart-toast';

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
