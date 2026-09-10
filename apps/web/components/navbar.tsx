'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../lib/store/useCartStore';
import { SearchModal } from './search-modal';
import { FiftyTwoLogo } from './logo';

const MAIN_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/catalog', label: 'Koleksi Kopi' },
  { href: '/work-with-us', label: 'Kemitraan B2B' },
];
const TOOL_LINKS = [
  { href: '/guide', label: 'Panduan Seduh', description: 'Kenali teknik seduh V60' },
  { href: '/tools/brew-calculator', label: 'Kalkulator Seduh', description: 'Atur rasio, dosis, dan waktu' },
  { href: '/blend-builder', label: 'Peracik Blend (BYOB)', description: 'Racik karakter kopi pilihanmu' },
  { href: '/tools/price-calculator', label: 'Kalkulator HPP', description: 'Hitung modal dan margin kedai' },
  { href: '/track', label: 'Lacak Pesanan', description: 'Periksa status pengiriman' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { toggleDrawer, getTotalItems } = useCartStore();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) setToolsDropdownOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearchModalOpen((open) => !open);
        setMobileMenuOpen(false);
        setToolsDropdownOpen(false);
      }
      if (event.key === 'Escape') {
        if (toolsDropdownOpen) toolsButtonRef.current?.focus();
        if (mobileMenuOpen) menuButtonRef.current?.focus();
        setToolsDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen, toolsDropdownOpen]);

  const totalItems = mounted ? getTotalItems() : 0;
  const dark = pathname === '/' || pathname === '/work-with-us' || pathname === '/guide' || pathname.startsWith('/tools');
  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const toolsActive = TOOL_LINKS.some(({ href }) => active(href));
  const navStyle = (selected: boolean) => `flex min-h-11 items-center border-b-2 transition-colors ${selected ? (dark ? 'border-brand-teal text-white' : 'border-brand-maroon text-brand-navy') : (dark ? 'border-transparent text-white/75 hover:text-white' : 'border-transparent text-on-surface-variant hover:text-brand-navy')}`;
  const iconColor = dark ? 'text-white hover:bg-white/10' : 'text-brand-navy hover:bg-brand-pill';

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b ${dark ? 'bg-brand-charcoal text-white border-white/10' : 'bg-white/95 backdrop-blur-lg border-border-subtle'}`}>
        <div className="site-container flex h-20 items-center justify-between gap-3">
          <Link href="/" aria-label="52 Coffee & Roastery — Beranda" className="shrink-0 rounded-md">
            <FiftyTwoLogo size="md" textColor={dark ? 'light' : 'dark'} className="max-[359px]:[&>div:last-child]:hidden" />
          </Link>
          <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-7 xl:gap-9 text-sm font-semibold">
            {MAIN_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={navStyle(active(href))}>{label}</Link>
            ))}
            <div ref={toolsRef} className="relative" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setToolsDropdownOpen(false);
            }}>
              <button ref={toolsButtonRef} type="button" aria-expanded={toolsDropdownOpen} aria-controls="tools-navigation" onClick={() => setToolsDropdownOpen((open) => !open)} className={`${navStyle(toolsActive)} gap-2`}>
                Panduan & Alat<ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {toolsDropdownOpen && (
                <div id="tools-navigation" className="absolute right-0 top-full mt-4 w-80 rounded-xl border border-border-subtle bg-white p-2 text-brand-navy shadow-floating">
                  {TOOL_LINKS.map(({ href, label, description }) => (
                    <Link key={href} href={href} onClick={() => setToolsDropdownOpen(false)} aria-current={active(href) ? 'page' : undefined} className={`flex items-center justify-between gap-4 rounded-lg px-4 py-3 hover:bg-brand-pill ${active(href) ? 'bg-brand-pill' : ''}`}>
                      <span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs font-normal text-on-surface-variant">{description}</span></span>
                      <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className="flex items-center gap-0.5 sm:gap-2">
            <button type="button" aria-label="Cari kopi" title="Cari kopi (Ctrl/⌘ K)" onClick={() => { setSearchModalOpen(true); setMobileMenuOpen(false); }} className={`icon-button ${iconColor}`}><Search aria-hidden="true" className="h-5 w-5" /></button>
            <button type="button" onClick={toggleDrawer} aria-label={`Keranjang belanja, ${totalItems} item`} className={`icon-button relative ${iconColor}`}>
              <ShoppingBag aria-hidden="true" className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-maroon px-1 font-mono text-[10px] font-bold text-white">{totalItems > 99 ? '99+' : totalItems}</span>}
            </button>
            <button ref={menuButtonRef} type="button" aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((open) => !open)} className={`icon-button lg:hidden ${iconColor}`}>
              {mobileMenuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Navigasi mobile" className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-border-subtle bg-white px-5 py-5 text-brand-navy shadow-lg lg:hidden">
            <div className="space-y-1">
              {MAIN_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} aria-current={active(href) ? 'page' : undefined} className={`flex min-h-12 items-center justify-between rounded-lg px-3 text-base font-semibold ${active(href) ? 'bg-brand-pill' : 'hover:bg-brand-pill'}`}>
                  {label}<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <p className="mb-2 mt-5 border-t border-border-subtle px-3 pt-5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Panduan & Alat</p>
            {TOOL_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} aria-current={active(href) ? 'page' : undefined} className={`flex min-h-11 items-center rounded-lg px-3 text-sm hover:bg-brand-pill ${active(href) ? 'bg-brand-pill font-semibold' : ''}`}>{label}</Link>
            ))}
          </nav>
        )}
      </header>
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
