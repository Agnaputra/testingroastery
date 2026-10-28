'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ExternalLink, Plus } from 'lucide-react';

interface AdminHeaderProps {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
}

function getRouteInfo(pathname: string): { title: string; subtitle: string } {
  if (pathname === '/admin' || pathname === '/admin/') {
    return {
      title: 'Overview Roastery',
      subtitle: 'Ringkasan operasional sangrai, pesanan pelanggan, dan performa katalog.',
    };
  }
  if (pathname.startsWith('/admin/orders')) {
    return {
      title: 'Pesanan & Roasting',
      subtitle: 'Antrean pemrosesan biji kopi, konfirmasi status, dan pengiriman kurir.',
    };
  }
  if (pathname.startsWith('/admin/catalog')) {
    return {
      title: 'Katalog 55 Master SKU',
      subtitle: 'Kelola rilis publik e-commerce, penetapan harga per kemasan, dan varian.',
    };
  }
  if (pathname.startsWith('/admin/products')) {
    return {
      title: 'Detail & Manajemen Produk',
      subtitle: 'Pengaturan deskripsi editorial, foto kemasan, dan parameter rasa.',
    };
  }
  if (pathname.startsWith('/admin/slowbar')) {
    return {
      title: 'Konsol Slowbar Barista',
      subtitle: 'Status ketersediaan harian 33 varian manual brew di coffee bar.',
    };
  }
  if (pathname.startsWith('/admin/financials')) {
    return {
      title: 'HPP & Margin Kotor',
      subtitle: 'Kalkulasi landed cost green bean, susut roasting, dan batas profitabilitas.',
    };
  }
  return {
    title: 'Portal Roastery',
    subtitle: 'Sistem operasional internal 52 Coffee.',
  };
}

export function AdminHeader({
  mobileNavOpen,
  setMobileNavOpen,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const { title, subtitle } = getRouteInfo(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 px-5 py-3.5 backdrop-blur-md sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Section Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Buka menu navigasi"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
            className="rounded-md border border-border-subtle p-2 text-brand-charcoal hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-navy lg:hidden"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="font-headline text-lg font-bold text-brand-charcoal sm:text-xl tracking-tight">
              {title}
            </h1>
            <p className="hidden text-xs text-on-surface-variant sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick actions & Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-slate-50 px-2.5 py-1 text-[11px] font-mono text-on-surface-variant">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-charcoal">
              Sistem Aktif
            </span>
          </div>

          <Link
            href="/admin/products?new=1"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-charcoal px-3 text-xs font-semibold text-white hover:bg-brand-navy transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Tambah Produk</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-subtle bg-white px-2.5 text-xs font-medium text-brand-charcoal hover:border-brand-navy/40 hover:text-brand-navy transition-colors"
            title="Buka Toko Publik (Tab Baru)"
          >
            <ExternalLink size={13} />
            <span className="hidden md:inline">Toko Publik</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
