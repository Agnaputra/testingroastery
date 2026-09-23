'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import { useCartStore } from '../../lib/store/useCartStore';
import { NAV_ITEMS, type NavItem } from '../navbar';

export function OchaPillNavbar() {
  const pathname = usePathname();
  const { getTotalItems, openDrawer } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [mobileExpandedSub, setMobileExpandedSub] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close menus on path change
  useEffect(() => {
    setActiveDropdown(null);
    setActiveSubmenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <nav
      ref={navRef}
      aria-label="52 Coffee Navigation"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(96vw,1080px)]"
    >
      <div className="flex items-center justify-between rounded-full border-2 border-[#2C3136] bg-white/95 px-4 sm:px-6 py-2.5 shadow-[0_8px_24px_rgba(44,49,54,0.12)] backdrop-blur-md">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="font-anton text-xl sm:text-2xl tracking-wider uppercase text-[#2C3136] hover:text-[#A52136] transition-colors shrink-0"
        >
          52 COFFEE
        </Link>

        {/* Center Desktop Navigation: Beranda | About Us ▼ | Catalogue ▼ | Partnerships ▼ | Coffee Lab ▼ */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children && item.children.length > 0;
            const isOpen = activeDropdown === item.id;
            const isCurrentPage = item.href === '/' ? pathname === '/' : (item.href && pathname.startsWith(item.href));

            if (!hasChildren) {
              return (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={`px-3 py-1.5 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-colors ${
                    isCurrentPage
                      ? 'bg-[#CFE8EA] text-[#2C3136]'
                      : 'text-[#2C3136]/80 hover:text-[#2C3136] hover:bg-[#F0F5F7]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => {
                  setActiveDropdown(item.id);
                  setActiveSubmenu(null);
                }}
                onMouseLeave={() => {
                  setActiveDropdown(null);
                  setActiveSubmenu(null);
                }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setActiveDropdown(isOpen ? null : item.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-colors ${
                    isOpen || isCurrentPage
                      ? 'bg-[#CFE8EA] text-[#2C3136]'
                      : 'text-[#2C3136]/80 hover:text-[#2C3136] hover:bg-[#F0F5F7]'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Level 2 Dropdown Panel */}
                {isOpen && (
                  <div className="absolute left-0 top-full pt-2 w-72 z-50">
                    <div className="rounded-2xl border-2 border-[#2C3136] bg-white p-2.5 shadow-[4px_4px_0px_#2C3136] flex flex-col gap-1">
                      {item.children!.map((child) => {
                        const hasSubChildren = !!child.children && child.children.length > 0;
                        const isSubOpen = activeSubmenu === child.id;

                        if (!hasSubChildren) {
                          return (
                            <Link
                              key={child.id}
                              href={child.href!}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#2C3136] hover:bg-[#CFE8EA] transition-colors"
                            >
                              <span>{child.label}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                            </Link>
                          );
                        }

                        // Submenu flyout trigger
                        return (
                          <div
                            key={child.id}
                            className="relative"
                            onMouseEnter={() => setActiveSubmenu(child.id)}
                          >
                            <Link
                              href={child.href!}
                              onClick={() => setActiveDropdown(null)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                                isSubOpen ? 'bg-[#8FB9BC] text-[#2C3136]' : 'text-[#2C3136] hover:bg-[#CFE8EA]'
                              }`}
                            >
                              <span>{child.label}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>

                            {/* Level 3 Nested Submenu Flyout */}
                            {isSubOpen && (
                              <div className="absolute left-full top-0 pl-2 w-64 z-50">
                                <div className="rounded-2xl border-2 border-[#2C3136] bg-white p-2 shadow-[4px_4px_0px_#2C3136] flex flex-col gap-1">
                                  <div className="px-3 py-1 font-mono text-[9px] uppercase tracking-wider font-extrabold text-brand-maroon border-b border-gray-100">
                                    {child.label}
                                  </div>
                                  {child.children!.map((leaf) => (
                                    <Link
                                      key={leaf.id}
                                      href={leaf.href!}
                                      onClick={() => {
                                        setActiveDropdown(null);
                                        setActiveSubmenu(null);
                                      }}
                                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#2C3136] hover:bg-[#CFE8EA] hover:font-bold transition-colors"
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
        </div>

        {/* Right Action & Cart Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Status pill: Roastery Open */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#2C3136] bg-[#8FB9BC] px-3 py-1 text-xs font-mono font-bold uppercase text-[#2C3136]">
            <span className="h-2 w-2 rounded-full bg-[#2C3136] animate-ping" />
            <span>ROASTERY OPEN</span>
          </div>

          {/* Cart button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Buka Keranjang Belanja"
            className="flex items-center gap-1.5 rounded-full border-2 border-[#2C3136] bg-[#CFE8EA] px-3.5 py-1.5 font-mono text-xs font-bold text-[#2C3136] transition-transform hover:scale-105 active:scale-95 hover:bg-[#8FB9BC]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{totalItems}</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden flex items-center justify-center p-2 rounded-full border-2 border-[#2C3136] text-[#2C3136] hover:bg-[#F0F5F7]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Accordion) */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 rounded-2xl border-2 border-[#2C3136] bg-white p-5 shadow-2xl flex flex-col gap-2 max-h-[82vh] overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children && item.children.length > 0;
            const isExpanded = mobileExpandedSection === item.id;

            if (!hasChildren) {
              return (
                <Link
                  key={item.id}
                  href={item.href!}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-anton text-lg uppercase tracking-wide text-[#2C3136] py-2 border-b border-gray-100 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            }

            return (
              <div key={item.id} className="border-b border-gray-100 pb-2">
                <button
                  type="button"
                  onClick={() => setMobileExpandedSection(isExpanded ? null : item.id)}
                  className="w-full font-anton text-lg uppercase tracking-wide text-[#2C3136] py-2 flex items-center justify-between text-left"
                >
                  <span>{item.label}</span>
                  {isExpanded ? <Minus className="w-4 h-4 text-brand-maroon" /> : <Plus className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="pl-3 border-l-2 border-[#2C3136] space-y-1.5 my-2">
                    {item.children!.map((child) => {
                      const hasSub = !!child.children && child.children.length > 0;
                      const isSubExpanded = mobileExpandedSub === child.id;

                      if (!hasSub) {
                        return (
                          <Link
                            key={child.id}
                            href={child.href!}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1.5 px-2 text-xs font-bold text-[#2C3136] rounded-lg hover:bg-[#CFE8EA]"
                          >
                            {child.label}
                          </Link>
                        );
                      }

                      return (
                        <div key={child.id} className="space-y-1">
                          <div className="flex items-center justify-between pr-2">
                            <Link
                              href={child.href!}
                              onClick={() => setMobileMenuOpen(false)}
                              className="py-1 px-2 text-xs font-extrabold text-[#2C3136] rounded-lg hover:bg-[#CFE8EA]"
                            >
                              {child.label}
                            </Link>
                            <button
                              type="button"
                              onClick={() => setMobileExpandedSub(isSubExpanded ? null : child.id)}
                              className="p-1 text-gray-500 hover:text-black"
                            >
                              {isSubExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {isSubExpanded && (
                            <div className="pl-4 border-l border-gray-300 space-y-1 my-1">
                              {child.children!.map((leaf) => (
                                <Link
                                  key={leaf.id}
                                  href={leaf.href!}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block py-1 px-2 text-[11px] font-medium text-gray-700 hover:text-[#2C3136] hover:bg-[#CFE8EA] rounded"
                                >
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

          {/* Bottom Info on Mobile Drawer */}
          <div className="pt-3 flex items-center justify-between text-xs font-mono text-[#2C3136]">
            <span className="font-bold">MALANG, ID • 10:00 - 20:00</span>
            <Link
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1 rounded-full border border-[#2C3136] bg-[#8FB9BC] px-3 py-1 font-mono text-xs font-bold uppercase text-[#2C3136]"
            >
              <span>Belanja Beans</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
