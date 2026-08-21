'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  Coffee,
  Calculator,
  Search,
  ChevronDown,
  Globe,
  User,
  Truck,
  History,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '../lib/store/useCartStore';
import { SearchModal } from './search-modal';
import { FiftyTwoLogo } from './logo';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [lang, setLang] = useState<'EN' | 'ID'>('EN');

  const { toggleDrawer, getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(event.target as Node)) {
        setShopDropdownOpen(false);
      }
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
    };
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface-white border-b border-border-subtle">
        <div className="flex justify-between items-center px-4 sm:px-10 w-full max-w-[1280px] mx-auto h-20">
          {/* Brand Logo (52 Coffee Oceanic Swirl from PDF Menu) */}
          <Link
            href="/"
            className="hover:opacity-90 transition-opacity"
          >
            <FiftyTwoLogo size="md" textColor="dark" />
          </Link>

          {/* Desktop Navigation Links (Exact Screenshot 1 Menu) */}
          <nav className="hidden md:flex items-center space-x-8 font-sans text-sm font-semibold">
            <Link
              href="/"
              className={`transition-all duration-200 py-1 ${
                pathname === '/'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Home
            </Link>

            {/* Shop Dropdown (Exact Screenshot 1 Dropdown) */}
            <div className="relative" ref={shopRef}>
              <button
                type="button"
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className={`flex items-center gap-1 transition-all duration-200 py-1 ${
                  pathname.startsWith('/catalog') || pathname === '/blend-builder'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span>Shop</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    shopDropdownOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant'
                  }`}
                />
              </button>

              {shopDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-border-subtle shadow-2xl p-4 space-y-4 z-50 animate-slide-up text-xs font-sans">
                  {/* Category Header */}
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block font-bold mb-2">
                      COFFEE
                    </span>

                    {/* Daily Series */}
                    <div className="space-y-1 mb-3">
                      <span className="text-primary font-bold block text-[11px]">Daily</span>
                      <div className="pl-2 space-y-1">
                        <Link
                          href="/blend-builder"
                          onClick={() => setShopDropdownOpen(false)}
                          className="block py-1 text-gray-600 hover:text-primary transition-colors font-medium"
                        >
                          BYOB
                        </Link>
                        <Link
                          href="/catalog?type=espresso&series=daily"
                          onClick={() => setShopDropdownOpen(false)}
                          className="block py-1 text-gray-600 hover:text-primary transition-colors font-medium"
                        >
                          Espresso
                        </Link>
                        <Link
                          href="/catalog?type=filter&series=daily"
                          onClick={() => setShopDropdownOpen(false)}
                          className="block py-1 text-gray-600 hover:text-primary transition-colors font-medium"
                        >
                          Filter
                        </Link>
                      </div>
                    </div>

                    {/* Limited Series */}
                    <div className="space-y-1">
                      <span className="text-amber-600 font-bold block text-[11px]">Limited</span>
                      <div className="pl-2 space-y-1">
                        <Link
                          href="/catalog?type=espresso&series=limited"
                          onClick={() => setShopDropdownOpen(false)}
                          className="block py-1 text-gray-600 hover:text-primary transition-colors font-medium"
                        >
                          Espresso
                        </Link>
                        <Link
                          href="/catalog?type=filter&series=limited"
                          onClick={() => setShopDropdownOpen(false)}
                          className="block py-1 text-gray-600 hover:text-primary transition-colors font-medium"
                        >
                          Filter
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border-subtle pt-2 space-y-1.5">
                    <Link
                      href="/catalog"
                      onClick={() => setShopDropdownOpen(false)}
                      className="flex items-center justify-between py-1 font-bold text-gray-800 hover:text-primary transition-colors"
                    >
                      <span>View all coffee</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/catalog?filter=past"
                      onClick={() => setShopDropdownOpen(false)}
                      className="flex items-center gap-2 py-1 text-gray-500 hover:text-primary transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Past Releases</span>
                    </Link>

                    <Link
                      href="/catalog?filter=garage"
                      onClick={() => setShopDropdownOpen(false)}
                      className="flex items-center gap-2 py-1 text-gray-500 hover:text-primary transition-colors"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Garage Sale</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/work-with-us"
              className={`transition-all duration-200 py-1 ${
                pathname === '/work-with-us'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Work with Us
            </Link>

            <Link
              href="/about"
              className={`transition-all duration-200 py-1 ${
                pathname === '/about'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Rubasse
            </Link>

            {/* Tools Dropdown Menu */}
            <div className="relative" ref={toolsRef}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`flex items-center gap-1 transition-all duration-200 py-1 ${
                  pathname.startsWith('/tools') || pathname === '/guide' || pathname === '/track'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span>Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    toolsDropdownOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant'
                  }`}
                />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl border border-border-subtle shadow-2xl p-2 space-y-1 z-50 animate-slide-up">
                  <Link
                    href="/tools/price-calculator"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-on-surface hover:text-primary transition-colors"
                  >
                    <div className="font-bold">Price Calculator</div>
                    <div className="text-[10px] text-on-surface-variant font-normal font-sans">
                      Estimasi HPP & margin
                    </div>
                  </Link>

                  <Link
                    href="/guide"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-on-surface hover:text-primary transition-colors"
                  >
                    <div className="font-bold">Brew Guide</div>
                    <div className="text-[10px] text-on-surface-variant font-normal font-sans">
                      Panduan seduh manual V60
                    </div>
                  </Link>

                  <Link
                    href="/blend-builder"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-on-surface hover:text-primary transition-colors"
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>Custom Blend</span>
                      <span className="badge-crimson text-[9px] font-mono">BYOB</span>
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-normal font-sans">
                      Rakit blend kopi sendiri
                    </div>
                  </Link>

                  <Link
                    href="/track"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl hover:bg-surface-container-low text-xs font-semibold text-on-surface hover:text-primary transition-colors border-t border-border-subtle/60"
                  >
                    <div className="font-bold">Find Your Order</div>
                    <div className="text-[10px] text-on-surface-variant font-normal font-sans">
                      Lacak status nomor order
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Trailing Actions (Search, Language, Cart) */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="text-on-surface hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low"
              title="Cari Biji Kopi (⌘K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <button
              type="button"
              onClick={() => setLang(lang === 'EN' ? 'ID' : 'EN')}
              className="hidden sm:flex items-center gap-1 font-mono text-xs font-bold text-on-surface hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-container-low border border-border-subtle"
            >
              <span className="text-xs">🇺🇸</span>
              <span>{lang}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* Cart Drawer Trigger Button */}
            <button
              type="button"
              onClick={toggleDrawer}
              className="relative text-on-surface hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low"
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-on-surface p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-subtle bg-surface-white px-6 py-5 space-y-4 animate-slide-up">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-sm text-on-surface hover:text-primary py-1"
            >
              Home
            </Link>
            <Link
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-sm text-on-surface hover:text-primary py-1"
            >
              Shop All
            </Link>
            <Link
              href="/blend-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-sm text-on-surface hover:text-primary py-1"
            >
              Custom Blend (BYOB)
            </Link>
            <Link
              href="/work-with-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-sm text-on-surface hover:text-primary py-1"
            >
              Work with Us
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block font-semibold text-sm text-on-surface hover:text-primary py-1"
            >
              Rubasse
            </Link>

            <div className="pt-2 border-t border-border-subtle space-y-2 text-xs font-mono">
              <div className="text-[10px] text-on-surface-variant uppercase font-bold">Tools:</div>
              <Link
                href="/tools/price-calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-on-surface hover:text-primary"
              >
                • Price Calculator
              </Link>
              <Link
                href="/guide"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-on-surface hover:text-primary"
              >
                • Specialty Brew Guide
              </Link>
              <Link
                href="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1 text-on-surface hover:text-primary"
              >
                • Find Your Order
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
}
