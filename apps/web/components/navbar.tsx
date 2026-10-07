'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown, ChevronRight, Menu, Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { useCartStore } from '../lib/store/useCartStore';
import { SearchModal } from './search-modal';
import { FiftyTwoLogo } from './logo';

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  children?: NavItem[];
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', href: '/', label: 'Beranda' },
  {
    id: 'about',
    label: 'About Us',
    href: '/about',
    children: [
      { id: 'about-behind', href: '/about#behind', label: 'Behind 52 Coffee & Roastery' },
      { id: 'about-journey', href: '/about#roastery-journey', label: 'Roastery Journey' },
      { id: 'about-slowbar', href: '/about#slowbar-ambience', label: 'Slowbar Ambience' },
    ],
  },
  {
    id: 'catalogue',
    label: 'Catalogue',
    href: '/catalog',
    children: [
      { id: 'catalogue-beans', href: '/catalog?category=beans', label: 'Retail Beans' },
      { id: 'catalogue-slowbar', href: '/catalog?category=slowbar', label: 'Slowbar Beverages' },
      { id: 'catalogue-glassware', href: '/catalog?category=glassware', label: 'Glassware' },
      { id: 'catalogue-machine', href: '/catalog?category=machine', label: 'Machine & Tools' },
    ],
  },
  {
    id: 'partnerships',
    label: 'Partnerships',
    href: '/work-with-us',
    children: [
      {
        id: 'partnerships-consultations',
        href: '/work-with-us/consultations',
        label: 'Consultations',
      },
      {
        id: 'wholesale',
        href: '/work-with-us#wholesale-partnership',
        label: 'Wholesale & Partnership',
      },
    ],
  },
  {
    id: 'coffee-lab',
    label: 'Coffee Lab',
    href: '/coffee-lab',
    children: [
      {
        id: 'brewing-guidance',
        href: '/coffee-lab/brewing-guidance',
        label: 'Brewing Guidance',
      },
      {
        id: 'lab-blend',
        href: '/coffee-lab/build-your-own-blend',
        label: 'Build Your Own Blend',
      },
      {
        id: 'coffee-experiments',
        href: '/coffee-lab/coffee-experiments',
        label: 'Coffee Experiments',
      },
    ],
  },
];

const sectionMatchesPath = (item: NavItem, pathname: string): boolean => {
  if (item.href && item.href !== '/' && pathname.startsWith(item.href.split('#')[0].split('?')[0])) return true;
  return item.children?.some((child) => sectionMatchesPath(child, pathname)) ?? false;
};

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState<string | null>(null);
  const [desktopSubmenuOpen, setDesktopSubmenuOpen] = useState<string | null>(null);
  const [mobileSectionOpen, setMobileSectionOpen] = useState<string | null>(null);
  const [mobileSubsectionOpen, setMobileSubsectionOpen] = useState<string | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const desktopNavRef = useRef<HTMLElement>(null);
  const lastDesktopTriggerRef = useRef<HTMLButtonElement | null>(null);
  const lastDesktopSubmenuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { toggleDrawer, getTotalItems } = useCartStore();

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setMobileMenuOpen(false);
    setDesktopMenuOpen(null);
    setDesktopSubmenuOpen(null);
    setMobileSectionOpen(null);
    setMobileSubsectionOpen(null);
  }, [pathname]);
  useEffect(() => {
    setScrolled(window.scrollY > 18);
    let animationFrame = 0;

    const onScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(() => {
        setScrolled(Math.max(window.scrollY, 0) > 18);
        animationFrame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [pathname]);
  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(event.target as Node)) {
        setDesktopMenuOpen(null);
        setDesktopSubmenuOpen(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearchModalOpen((open) => !open);
        setMobileMenuOpen(false);
        setDesktopMenuOpen(null);
        setDesktopSubmenuOpen(null);
      }
      if (event.key === 'Escape') {
        if (desktopMenuOpen) lastDesktopTriggerRef.current?.focus();
        if (mobileMenuOpen) menuButtonRef.current?.focus();
        setDesktopMenuOpen(null);
        setDesktopSubmenuOpen(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [desktopMenuOpen, mobileMenuOpen]);

  const totalItems = mounted ? getTotalItems() : 0;
  const isHome = pathname === '/';
  const hasDarkNavbarCanvas = isHome || pathname.startsWith('/about') || pathname.startsWith('/guide') || pathname.startsWith('/coffee-lab') || pathname.startsWith('/blend-builder') || pathname.startsWith('/work-with-us') || pathname.startsWith('/tools/price-calculator');
  const active = (href: string) => {
    if (href.includes('#') || href.includes('?')) return false;
    return href === '/' ? pathname === '/' : pathname === href;
  };
  const navStyle = (selected: boolean) => `flex min-h-10 items-center px-1 transition-colors ${
    selected ? 'text-brand-teal' : 'text-white/80 hover:text-white'
  }`;
  const iconColor = 'border border-white/30 bg-[#182131]/90 text-white hover:bg-[#182131]';
  const headerSurface = scrolled
    ? 'border-white/15 bg-[rgba(44,49,54,.82)] shadow-[0_10px_30px_rgba(20,24,28,.16)] backdrop-blur-md'
    : 'border-transparent bg-transparent';
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSectionOpen(null);
    setMobileSubsectionOpen(null);
  };
  const closeDesktopMenu = () => {
    setDesktopMenuOpen(null);
    setDesktopSubmenuOpen(null);
  };
  const openDesktopMenu = (id: string) => {
    setDesktopMenuOpen(id);
    setDesktopSubmenuOpen(null);
  };
  const focusMenuItem = (id: string, edge: 'first' | 'last' = 'first') => {
    window.requestAnimationFrame(() => {
      const items = document.querySelectorAll<HTMLElement>(`#${id} [data-nav-focus]`);
      items[edge === 'first' ? 0 : items.length - 1]?.focus();
    });
  };

  return (
    <>
      <header className={`fixed top-0 z-50 w-full border-b text-white transition-[background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${headerSurface}`}>
        <div className="relative mx-auto flex h-[76px] w-[calc(100%-28px)] items-center justify-between gap-3 px-1 sm:w-[calc(100%-52px)] sm:px-0">
          <Link href="/" aria-label="52 Coffee & Roastery — Beranda" className="shrink-0 px-1 py-2">
            <FiftyTwoLogo size="md" textColor={hasDarkNavbarCanvas || scrolled ? 'light' : 'dark'} className="max-[359px]:[&>div:last-child]:hidden" />
          </Link>

          <nav ref={desktopNavRef} aria-label="Navigasi utama" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 rounded-full border border-white/55 bg-[#182131]/90 px-6 text-[12px] font-semibold shadow-[0_8px_24px_rgba(20,24,28,.14)] xl:flex">
            {NAV_ITEMS.map((item) => {
              const selected = item.href === '/' ? pathname === '/' : sectionMatchesPath(item, pathname);
              if (!item.children) {
                return <Link key={item.id} href={item.href!} aria-current={selected ? 'page' : undefined} className={navStyle(selected)}>{item.label}</Link>;
              }

              const isOpen = desktopMenuOpen === item.id;
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => openDesktopMenu(item.id)}
                  onMouseLeave={closeDesktopMenu}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) closeDesktopMenu();
                  }}
                >
                  <button
                    ref={(node) => { if (isOpen && node) lastDesktopTriggerRef.current = node; }}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={`desktop-${item.id}-navigation`}
                    aria-current={selected ? 'page' : undefined}
                    onFocus={() => openDesktopMenu(item.id)}
                    onClick={(event) => {
                      lastDesktopTriggerRef.current = event.currentTarget;
                      openDesktopMenu(item.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        openDesktopMenu(item.id);
                        focusMenuItem(`desktop-${item.id}-navigation`, event.key === 'ArrowUp' ? 'last' : 'first');
                      }
                    }}
                    className={`${navStyle(selected)} gap-1.5`}
                  >
                    {item.label}
                    <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3">
                      <div
                        id={`desktop-${item.id}-navigation`}
                        className="w-72 rounded-xl border border-border-subtle bg-white p-2 text-brand-navy shadow-floating motion-safe:animate-fade-in motion-safe:[animation-duration:160ms]"
                      >
                        {item.children.map((child) => {
                          if (!child.children) {
                            return (
                              <Link
                                key={child.id}
                                href={child.href!}
                                data-nav-focus
                                aria-current={active(child.href!) ? 'page' : undefined}
                                onClick={closeDesktopMenu}
                                className={`flex min-h-11 items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-pill ${active(child.href!) ? 'bg-brand-pill text-brand-maroon' : ''}`}
                              >
                                {child.label}
                                <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                              </Link>
                            );
                          }

                          const isSubmenuOpen = desktopSubmenuOpen === child.id;
                          return (
                            <div
                              key={child.id}
                              className="relative"
                              onMouseEnter={() => setDesktopSubmenuOpen(child.id)}
                              onMouseLeave={() => setDesktopSubmenuOpen(null)}
                            >
                              <button
                                ref={(node) => { if (isSubmenuOpen && node) lastDesktopSubmenuTriggerRef.current = node; }}
                                type="button"
                                data-nav-focus
                                aria-haspopup="true"
                                aria-expanded={isSubmenuOpen}
                                aria-controls={`desktop-${child.id}-navigation`}
                                onFocus={() => setDesktopSubmenuOpen(child.id)}
                                onClick={() => setDesktopSubmenuOpen(child.id)}
                                onKeyDown={(event) => {
                                  if (event.key === 'ArrowRight') {
                                    event.preventDefault();
                                    setDesktopSubmenuOpen(child.id);
                                    focusMenuItem(`desktop-${child.id}-navigation`);
                                  }
                                  if (event.key === 'ArrowLeft') {
                                    event.preventDefault();
                                    setDesktopSubmenuOpen(null);
                                  }
                                }}
                                className={`flex min-h-11 w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-brand-pill ${isSubmenuOpen ? 'bg-brand-pill text-brand-maroon' : ''}`}
                              >
                                {child.label}
                                <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                              </button>

                              {isSubmenuOpen && (
                                <div className="absolute left-full top-0 pl-2">
                                  <div id={`desktop-${child.id}-navigation`} className="w-72 rounded-xl border border-border-subtle bg-white p-2 shadow-floating motion-safe:animate-fade-in motion-safe:[animation-duration:160ms]">
                                    {child.children.map((leaf) => (
                                      <Link
                                        key={leaf.id}
                                        href={leaf.href!}
                                        data-nav-focus
                                        aria-current={active(leaf.href!) ? 'page' : undefined}
                                        onClick={closeDesktopMenu}
                                        onKeyDown={(event) => {
                                          if (event.key === 'ArrowLeft') {
                                            event.preventDefault();
                                            setDesktopSubmenuOpen(null);
                                            lastDesktopSubmenuTriggerRef.current?.focus();
                                          }
                                        }}
                                        className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-pill ${active(leaf.href!) ? 'bg-brand-pill text-brand-maroon' : ''}`}
                                      >
                                        {leaf.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-2">
            <button type="button" aria-label="Cari kopi" title="Cari kopi (Ctrl/⌘ K)" onClick={() => { setSearchModalOpen(true); closeMobileMenu(); }} className={`icon-button rounded-lg ${iconColor}`}><Search aria-hidden="true" className="h-5 w-5" /></button>
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
          <nav id="mobile-navigation" aria-label="Navigasi mobile" className="absolute inset-x-0 top-full max-h-[calc(100dvh-4.75rem)] overflow-y-auto border-b border-border-subtle bg-white px-5 py-4 text-brand-navy shadow-lg xl:hidden">
            <div className="divide-y divide-border-subtle">
              {NAV_ITEMS.map((item) => {
                if (!item.children) {
                  return (
                    <Link key={item.id} href={item.href!} onClick={closeMobileMenu} aria-current={active(item.href!) ? 'page' : undefined} className={`flex min-h-12 items-center justify-between px-3 text-base font-semibold ${active(item.href!) ? 'text-brand-maroon' : ''}`}>
                      {item.label}<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  );
                }

                const isOpen = mobileSectionOpen === item.id;
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`mobile-${item.id}-navigation`}
                      onClick={() => {
                        setMobileSectionOpen((open) => open === item.id ? null : item.id);
                        setMobileSubsectionOpen(null);
                      }}
                      className={`flex min-h-12 w-full items-center justify-between px-3 text-left text-base font-semibold ${sectionMatchesPath(item, pathname) ? 'text-brand-maroon' : ''}`}
                    >
                      {item.label}
                      {isOpen ? <Minus aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
                    </button>

                    {isOpen && (
                      <div id={`mobile-${item.id}-navigation`} className="mb-3 ml-3 border-l border-brand-maroon/25 pl-3">
                        {item.children.map((child) => {
                          if (!child.children) {
                            return (
                              <Link key={child.id} href={child.href!} onClick={closeMobileMenu} aria-current={active(child.href!) ? 'page' : undefined} className={`flex min-h-11 items-center justify-between px-3 text-sm font-medium hover:text-brand-maroon ${active(child.href!) ? 'text-brand-maroon' : ''}`}>
                                {child.label}<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                              </Link>
                            );
                          }

                          const subsectionOpen = mobileSubsectionOpen === child.id;
                          return (
                            <div key={child.id}>
                              <button
                                type="button"
                                aria-expanded={subsectionOpen}
                                aria-controls={`mobile-${child.id}-navigation`}
                                onClick={() => setMobileSubsectionOpen((open) => open === child.id ? null : child.id)}
                                className="flex min-h-11 w-full items-center justify-between px-3 text-left text-sm font-semibold"
                              >
                                {child.label}
                                {subsectionOpen ? <Minus aria-hidden="true" className="h-3.5 w-3.5" /> : <Plus aria-hidden="true" className="h-3.5 w-3.5" />}
                              </button>
                              {subsectionOpen && (
                                <div id={`mobile-${child.id}-navigation`} className="ml-3 border-l border-border-subtle pl-3">
                                  {child.children.map((leaf) => (
                                    <Link key={leaf.id} href={leaf.href!} onClick={closeMobileMenu} aria-current={active(leaf.href!) ? 'page' : undefined} className={`flex min-h-11 items-center px-3 text-sm text-on-surface-variant hover:text-brand-maroon ${active(leaf.href!) ? 'font-semibold text-brand-maroon' : ''}`}>
                                      {leaf.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        )}
      </header>
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
