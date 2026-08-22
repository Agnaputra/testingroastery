'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  ChevronDown,
} from 'lucide-react';
import { useCartStore } from '../lib/store/useCartStore';
import { SearchModal } from './search-modal';
import { FiftyTwoLogo } from './logo';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'ID'>('EN');
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(0);
  const { toggleDrawer, getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Always show navbar at the top of the page (< 80px)
      if (currentScrollY < 80) {
        setVisible(true);
      } else {
        // Scrolling DOWN -> hide navbar
        if (currentScrollY > lastScrollY.current + 8) {
          setVisible(false);
          setToolsDropdownOpen(false);
        }
        // Scrolling UP -> reveal navbar
        else if (currentScrollY < lastScrollY.current - 8) {
          setVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  // Identify dark background pages vs light background pages
  const isDarkPage =
    pathname === '/' ||
    pathname === '/work-with-us' ||
    pathname === '/guide' ||
    pathname.startsWith('/tools/price-calculator') ||
    pathname.startsWith('/tools/brew-calculator');

  const isHeroOverlay = (pathname === '/' || pathname === '/work-with-us' || pathname === '/guide') && !scrolled;
  const isDarkNavbar = isDarkPage;

  const isToolsActive =
    pathname.startsWith('/tools') || pathname === '/guide' || pathname === '/track' || pathname === '/blend-builder';

  return (
    <>
      <header
        className={`w-full transition-all duration-300 z-50 transform ${
          visible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isHeroOverlay
            ? 'absolute top-0 left-0 bg-gradient-to-b from-black/85 via-black/35 to-transparent border-none text-white'
            : isDarkNavbar
            ? 'sticky top-0 bg-[#101A26]/85 backdrop-blur-xl border-b border-white/10 text-white shadow-lg'
            : 'sticky top-0 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] text-brand-navy shadow-xs'
        }`}
      >
        <div className="flex justify-between items-center px-4 sm:px-8 lg:px-12 w-full max-w-[1360px] mx-auto h-20">
          {/* Brand Logo */}
          <Link
            href="/"
            className="hover:opacity-90 transition-transform duration-200 hover:scale-[1.02] flex items-center"
          >
            <FiftyTwoLogo size="md" textColor={isDarkNavbar ? 'light' : 'dark'} />
          </Link>

          {/* Desktop Navigation Links with Prominent Typography and Generous Spacing */}
          <nav className="hidden md:flex items-center space-x-10 lg:space-x-12 font-sans text-[15px] sm:text-base font-semibold">
            {/* Home Link */}
            <Link
              href="/"
              className={`relative py-1.5 transition-colors duration-200 ${
                isDarkNavbar
                  ? pathname === '/' ? 'text-white font-bold' : 'text-white/80 hover:text-white'
                  : pathname === '/' ? 'text-brand-navy font-bold' : 'text-on-surface-variant hover:text-brand-navy'
              }`}
            >
              <span>Home</span>
              {pathname === '/' && (
                <motion.div
                  layoutId="navbarActiveUnderline"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkNavbar ? 'bg-white' : 'bg-brand-navy'}`}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </Link>

            {/* Shop Link (Direct to /catalog) */}
            <Link
              href="/catalog"
              className={`relative py-1.5 transition-colors duration-200 ${
                isDarkNavbar
                  ? pathname.startsWith('/catalog') ? 'text-white font-bold' : 'text-white/80 hover:text-white'
                  : pathname.startsWith('/catalog') ? 'text-brand-navy font-bold' : 'text-on-surface-variant hover:text-brand-navy'
              }`}
            >
              <span>Shop</span>
              {pathname.startsWith('/catalog') && (
                <motion.div
                  layoutId="navbarActiveUnderline"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkNavbar ? 'bg-white' : 'bg-brand-navy'}`}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </Link>

            {/* Work with Us */}
            <Link
              href="/work-with-us"
              className={`relative py-1.5 transition-colors duration-200 ${
                isDarkNavbar
                  ? pathname === '/work-with-us' ? 'text-white font-bold' : 'text-white/80 hover:text-white'
                  : pathname === '/work-with-us' ? 'text-brand-navy font-bold' : 'text-on-surface-variant hover:text-brand-navy'
              }`}
            >
              <span>Work with Us</span>
              {pathname === '/work-with-us' && (
                <motion.div
                  layoutId="navbarActiveUnderline"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkNavbar ? 'bg-white' : 'bg-brand-navy'}`}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </Link>

            {/* Tools Dropdown Menu */}
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`relative flex items-center gap-1.5 py-1.5 transition-colors duration-200 cursor-pointer ${
                  isDarkNavbar
                    ? isToolsActive ? 'text-white font-bold' : 'text-white/80 hover:text-white'
                    : isToolsActive ? 'text-brand-navy font-bold' : 'text-on-surface-variant hover:text-brand-navy'
                }`}
              >
                <span>Tools</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    toolsDropdownOpen ? 'rotate-180' : ''
                  } ${isDarkNavbar ? 'text-white/80' : 'text-on-surface-variant'}`}
                />
                {isToolsActive && (
                  <motion.div
                    layoutId="navbarActiveUnderline"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkNavbar ? 'bg-white' : 'bg-brand-navy'}`}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              {/* Tools Dropdown Popover */}
              <AnimatePresence>
                {toolsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className={`absolute top-full left-0 mt-3 w-60 rounded-2xl p-2 space-y-1 z-50 shadow-2xl backdrop-blur-xl ${
                      isDarkNavbar
                        ? 'bg-[#182333]/95 border border-white/15 text-white'
                        : 'bg-white/95 border border-border-subtle text-on-surface'
                    }`}
                  >
                    <Link
                      href="/tools/price-calculator"
                      onClick={() => setToolsDropdownOpen(false)}
                      className={`block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isDarkNavbar
                          ? 'hover:bg-white/10 text-gray-200 hover:text-white'
                          : 'hover:bg-surface-container-low text-on-surface hover:text-brand-navy'
                      }`}
                    >
                      <div className="font-bold text-sm">Price Calculator</div>
                      <div className={`text-[11px] font-normal font-sans ${isDarkNavbar ? 'text-gray-400' : 'text-on-surface-variant'}`}>
                        Estimasi HPP &amp; margin roast
                      </div>
                    </Link>

                    <Link
                      href="/guide"
                      onClick={() => setToolsDropdownOpen(false)}
                      className={`block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isDarkNavbar
                          ? 'hover:bg-white/10 text-gray-200 hover:text-white'
                          : 'hover:bg-surface-container-low text-on-surface hover:text-brand-navy'
                      }`}
                    >
                      <div className="font-bold text-sm">Brew Guide</div>
                      <div className={`text-[11px] font-normal font-sans ${isDarkNavbar ? 'text-gray-400' : 'text-on-surface-variant'}`}>
                        Panduan seduh manual V60 Slowbar
                      </div>
                    </Link>

                    <Link
                      href="/blend-builder"
                      onClick={() => setToolsDropdownOpen(false)}
                      className={`block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isDarkNavbar
                          ? 'hover:bg-white/10 text-gray-200 hover:text-white'
                          : 'hover:bg-surface-container-low text-on-surface hover:text-brand-navy'
                      }`}
                    >
                      <div className="font-bold text-sm flex items-center justify-between">
                        <span>Custom Blend</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-brand-maroon/15 text-brand-maroon text-[10px] font-mono font-bold">
                          BYOB
                        </span>
                      </div>
                      <div className={`text-[11px] font-normal font-sans ${isDarkNavbar ? 'text-gray-400' : 'text-on-surface-variant'}`}>
                        Rakit rasio blend kopi sendiri
                      </div>
                    </Link>

                    <Link
                      href="/track"
                      onClick={() => setToolsDropdownOpen(false)}
                      className={`block px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors border-t ${
                        isDarkNavbar
                          ? 'border-white/10 hover:bg-white/10 text-gray-200 hover:text-white'
                          : 'border-border-subtle/70 hover:bg-surface-container-low text-on-surface hover:text-brand-navy'
                      }`}
                    >
                      <div className="font-bold text-sm">Find Your Order</div>
                      <div className={`text-[11px] font-normal font-sans ${isDarkNavbar ? 'text-gray-400' : 'text-on-surface-variant'}`}>
                        Lacak status nomor resi order
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Icon Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDarkNavbar
                  ? 'text-white hover:bg-white/10'
                  : 'text-on-surface hover:text-brand-navy hover:bg-surface-container-low'
              }`}
              title="Cari Biji Kopi (⌘K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <button
              type="button"
              onClick={() => setLang(lang === 'EN' ? 'ID' : 'EN')}
              className={`hidden sm:flex items-center gap-1.5 font-mono text-xs font-bold transition-colors px-2.5 py-1.5 rounded-lg border ${
                isDarkNavbar
                  ? 'text-white border-white/25 hover:bg-white/10'
                  : 'text-brand-navy border-border-subtle hover:bg-surface-container-low'
              }`}
            >
              <span className="text-xs">🇺🇸</span>
              <span>{lang}</span>
              <ChevronDown className={`w-3 h-3 ${isDarkNavbar ? 'text-white/70' : 'text-gray-400'}`} />
            </button>

            {/* Cart Drawer Trigger Button */}
            <button
              type="button"
              onClick={toggleDrawer}
              className={`relative p-2 rounded-full transition-colors cursor-pointer ${
                isDarkNavbar
                  ? 'text-white hover:bg-white/10'
                  : 'text-on-surface hover:text-brand-navy hover:bg-surface-container-low'
              }`}
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-maroon text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${isDarkNavbar ? 'text-white' : 'text-brand-navy'}`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className={`md:hidden border-b px-6 py-6 space-y-4 shadow-xl overflow-hidden backdrop-blur-2xl ${
                isDarkNavbar
                  ? 'bg-[#141d2b]/95 border-white/10 text-white'
                  : 'bg-white/95 border-border-subtle text-brand-navy'
              }`}
            >
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-base hover:text-brand-maroon py-1.5"
              >
                Home
              </Link>
              <Link
                href="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-base hover:text-brand-maroon py-1.5"
              >
                Shop (Catalog)
              </Link>
              <Link
                href="/work-with-us"
                onClick={() => setMobileMenuOpen(false)}
                className="block font-bold text-base hover:text-brand-maroon py-1.5"
              >
                Work with Us
              </Link>

              <div className={`pt-3 border-t space-y-2 text-xs font-mono ${isDarkNavbar ? 'border-white/10' : 'border-border-subtle'}`}>
                <div className={`text-[10px] uppercase font-bold ${isDarkNavbar ? 'text-gray-400' : 'text-on-surface-variant'}`}>
                  Tools Roastery:
                </div>
                <Link
                  href="/tools/price-calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-semibold ${isDarkNavbar ? 'text-gray-200 hover:text-white' : 'text-on-surface hover:text-brand-navy'}`}
                >
                  • Price Calculator
                </Link>
                <Link
                  href="/guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-semibold ${isDarkNavbar ? 'text-gray-200 hover:text-white' : 'text-on-surface hover:text-brand-navy'}`}
                >
                  • Brew Guide V60
                </Link>
                <Link
                  href="/blend-builder"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-semibold ${isDarkNavbar ? 'text-gray-200 hover:text-white' : 'text-on-surface hover:text-brand-navy'}`}
                >
                  • Custom Blend (BYOB)
                </Link>
                <Link
                  href="/track"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-semibold ${isDarkNavbar ? 'text-gray-200 hover:text-white' : 'text-on-surface hover:text-brand-navy'}`}
                >
                  • Find Your Order
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
