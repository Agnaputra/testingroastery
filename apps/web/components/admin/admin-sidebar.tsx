'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Coffee,
  Coins,
  Users,
  ShieldCheck,
  Store,
  LogOut,
  X,
  LucideIcon,
} from 'lucide-react';
import { useAdminPortalContext } from './admin-context';

interface AdminSidebarProps {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  handleLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: (pendingOrders: number) => React.ReactNode;
  isActive: (pathname: string) => boolean;
}

const MAIN_NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    isActive: (p) => p === '/admin' || p === '/admin/',
  },
  {
    href: '/admin/orders',
    label: 'Pesanan & Roast',
    icon: ShoppingBag,
    badge: (pending) =>
      pending > 0 ? (
        <span className="ml-auto inline-flex items-center rounded-full bg-brand-maroon px-2 py-0.5 font-mono text-[10px] font-bold text-white tabular-nums">
          {pending}
        </span>
      ) : null,
    isActive: (p) => p.startsWith('/admin/orders'),
  },
  {
    href: '/admin/catalog',
    label: 'Katalog 55 SKU',
    icon: Layers,
    badge: () => (
      <span className="ml-auto font-mono text-[10px] text-white/40 tabular-nums">55</span>
    ),
    isActive: (p) => p.startsWith('/admin/catalog') || p.startsWith('/admin/products'),
  },
  {
    href: '/admin/slowbar',
    label: 'Konsol Slowbar',
    icon: Coffee,
    isActive: (p) => p.startsWith('/admin/slowbar'),
  },
  {
    href: '/admin/financials',
    label: 'HPP & Margin',
    icon: Coins,
    isActive: (p) => p.startsWith('/admin/financials'),
  },
  {
    href: '/admin/users',
    label: 'Akun & Role',
    icon: Users,
    isActive: (p) => p.startsWith('/admin/users'),
  },
];

const SECONDARY_NAV = [
  {
    href: '/events/moderation',
    label: 'Moderasi Event',
    icon: ShieldCheck,
  },
  {
    href: '/',
    label: 'Toko Publik',
    icon: Store,
  },
];

export function AdminSidebar({
  mobileNavOpen,
  setMobileNavOpen,
  handleLogout,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const portal = useAdminPortalContext();
  const usesDatabaseOrders = process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE === '1';

  return (
    <>
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi admin"
          className="fixed inset-0 z-40 bg-brand-charcoal/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-68 flex-col bg-brand-charcoal text-white border-r border-white/10 transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigasi admin"
      >
        {/* Header Branding - Apple clean aesthetic */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            onClick={() => setMobileNavOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-white font-headline font-bold text-sm">
              52
            </div>
            <div>
              <span className="font-headline text-sm font-bold tracking-tight text-white">
                52 Coffee
              </span>
              <span className="ml-1.5 font-mono text-[9px] uppercase tracking-wider text-brand-teal font-medium">
                Roastery
              </span>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Tutup sidebar"
            onClick={() => setMobileNavOpen(false)}
            className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-6 overflow-y-auto p-3.5" aria-label="Menu Admin">
          <div>
            <div className="px-2.5 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Operasional
            </div>
            <div className="space-y-0.5">
              {MAIN_NAV.map(({ href, label, icon: Icon, badge, isActive }) => {
                const active = isActive(pathname);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileNavOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex h-10 items-center gap-3 rounded-lg px-2.5 text-xs transition-colors duration-150 ${
                      active
                        ? 'bg-brand-navy text-white font-semibold shadow-xs'
                        : 'text-white/70 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={active ? 'text-brand-teal' : 'text-white/60'}
                    />
                    <span className="truncate">{label}</span>
                    {badge &&
                      (href !== '/admin/orders' || !usesDatabaseOrders) &&
                      badge(portal.metrics.pendingOrdersCount)}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-2.5 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Akses Luar
            </div>
            <div className="space-y-0.5">
              {SECONDARY_NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex h-10 items-center gap-3 rounded-lg px-2.5 text-xs text-white/70 hover:bg-white/[0.07] hover:text-white transition-colors duration-150"
                >
                  <Icon size={16} className="text-white/60" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer Session Strip */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2.5">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-medium text-white/90">
                Staff Roastery
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Sesi Terverifikasi</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Kunci sesi admin"
              aria-label="Kunci sesi admin"
              className="rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
