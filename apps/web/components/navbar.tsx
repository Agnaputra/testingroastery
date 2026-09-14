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
  { href: '/guide', label: 'Panduan & Kalkulator Seduh', description: 'Atur resep, ikuti timer, dan langkah seduh' },
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
  const [navVisible, setNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollYRef = useRef(0);
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolsButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { toggleDrawer, getTotalItems } = useCartStore();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMobileMenuOpen(false);
    setToolsDropdownOpen(false);
    setNavVisible(true);
  }, [pathname]);
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    setScrolled(window.scrollY > 18);
    let animationFrame = 0;

    const onScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(window.scrollY, 0);
        const delta = currentScrollY - lastScrollYRef.current;

        setScrolled(currentScrollY > 18);
        if (mobileMenuOpen || toolsDropdownOpen || currentScrollY < 32) {
          setNavVisible(true);
        } else if (delta > 9) {
          setNavVisible(false);
        } else if (delta < -9) {
          setNavVisible(true);
        }

        lastScrollYRef.current = currentScrollY;
        animationFrame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [mobileMenuOpen, pathname, toolsDropdownOpen]);
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
  const isHome = pathname === '/';
  const dark = pathname === '/' || pathname.startsWith('/catalog') || pathname === '/work-with-us' || pathname === '/guide' || pathname === '/blend-builder' || pathname.startsWith('/tools');
  const active = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const toolsActive = TOOL_LINKS.some(({ href }) => active(href));
  const navStyle = (selected: boolean) => dark
    ? `flex min-h-10 items-center px-1 transition-colors ${selected ? 'text-brand-teal' : 'text-white/80 hover:text-white'}`
    : `flex min-h-11 items-center border-b-2 transition-colors ${selected ? 'border-brand-navy text-brand-navy' : 'border-transparent text-on-surface-variant hover:text-brand-navy'}`;
  const iconColor = dark
    ? 'border border-white/30 bg-[#182131]/85 text-white hover:bg-[#182131]'
    : 'text-brand-navy hover:bg-brand-pill';
  const homeHeaderSurface = scrolled
    ? 'border-white/10 bg-brand-charcoal/95 shadow-[0_10px_30px_rgba(20,24,28,.18)] backdrop-blur-xl'
    : 'border-transparent bg-transparent';

  return (
    <>
      <header className={`${isHome ? 'fixed' : 'sticky'} top-0 z-50 w-full border-b transition-[transform,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transform-none ${navVisible ? 'translate-y-0' : '-translate-y-full'} ${isHome ? `${homeHeaderSurface} text-white` : dark ? 'border-white/10 bg-[#182131] text-white' : 'border-border-subtle bg-white/95 backdrop-blur-lg'}`}>
        <div className={`${dark ? 'mx-auto w-[calc(100%-28px)] px-1 sm:w-[calc(100%-52px)] sm:px-0' : 'site-container'} relative flex h-[76px] items-center justify-between gap-3`}>
          <Link href="/" aria-label="52 Coffee & Roastery — Beranda" className={`shrink-0 ${dark ? 'px-1 py-2' : 'rounded-md'}`}>
            <FiftyTwoLogo size="md" textColor={dark ? 'light' : 'dark'} className="max-[359px]:[&>div:last-child]:hidden" />
          </Link>
          <nav aria-label="Navigasi utama" className={`absolute left-1/2 hidden -translate-x-1/2 items-center text-[13px] font-semibold xl:flex ${dark ? 'gap-7 rounded-full border border-white/55 bg-[#182131]/90 px-7 shadow-[0_8px_24px_rgba(20,24,28,.14)]' : 'gap-7 xl:gap-9'}`}>
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
            <button type="button" aria-label="Cari kopi" title="Cari kopi (Ctrl/⌘ K)" onClick={() => { setSearchModalOpen(true); setMobileMenuOpen(false); }} className={`icon-button rounded-lg ${iconColor}`}><Search aria-hidden="true" className="h-5 w-5" /></button>
            <button type="button" onClick={toggleDrawer} aria-label={`Keranjang belanja, ${totalItems} item`} className={`icon-button relative rounded-lg ${iconColor}`}>
              <ShoppingBag aria-hidden="true" className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-maroon px-1 font-mono text-[10px] font-bold text-white">{totalItems > 99 ? '99+' : totalItems}</span>}
            </button>
            <button ref={menuButtonRef} type="button" aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((open) => !open)} className={`icon-button rounded-lg xl:hidden ${iconColor}`}>
              {mobileMenuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav id="mobile-navigation" aria-label="Navigasi mobile" className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.75rem)] overflow-y-auto border-b border-border-subtle bg-white px-5 py-5 text-brand-navy shadow-lg xl:hidden">
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
