'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  ArrowRight,
  Plus,
  Check,
  Sparkles,
  Flame,
  Filter as FilterIcon,
  FlaskConical,
  RotateCcw,
} from 'lucide-react';
import { useCartStore } from '../../lib/store/useCartStore';
import { formatRupiah, PRODUCTS, CoffeeProduct } from '../../lib/data';
import { ProductCard } from '../../components/product-card';

const CATEGORY_TABS = [
  { id: 'all', label: 'ALL MENU' },
  { id: 'filter', label: 'FILTER BASED (MANUAL BREW)' },
  { id: 'espresso', label: 'ESPRESSO BASED PROFILES' },
  { id: 'reserve', label: '⭐ GRAND RESERVE MICRO-LOT' },
];

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs font-mono text-gray-400">Loading slowbar menu...</div>}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSeries = searchParams.get('series');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory ? initialCategory.toLowerCase() : 'all'
  );
  const [selectedSeries, setSelectedSeries] = useState<string>(
    initialSeries || 'all'
  );
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Search
      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.slowbarAlias && p.slowbarAlias.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tastingNotes.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      let matchCategory = true;
      if (selectedCategory === 'filter') {
        matchCategory = p.category === 'filter';
      } else if (selectedCategory === 'espresso') {
        matchCategory = p.category === 'espresso';
      } else if (selectedCategory === 'reserve') {
        matchCategory = p.category === 'reserve';
      }

      // Series
      let matchSeries = true;
      if (selectedSeries !== 'all') {
        matchSeries = p.series.toLowerCase() === selectedSeries.toLowerCase();
      }

      return matchSearch && matchCategory && matchSeries;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedSeries, sortBy]);

  // Group by series for clean slowbar menu layout
  const seriesGroups = useMemo(() => {
    const groups: { [key: string]: CoffeeProduct[] } = {};
    filteredProducts.forEach((p) => {
      if (!groups[p.series]) groups[p.series] = [];
      groups[p.series].push(p);
    });
    return groups;
  }, [filteredProducts]);

  return (
    <div className="w-full bg-surface-white text-on-surface min-h-screen py-12 px-4 sm:px-10 font-sans">
      <div className="max-w-[1280px] mx-auto space-y-10">
        {/* ========================================================================= */}
        {/* 1. SLOWBAR MENU HEADER (Exact 52 Coffee PDF Menu Aesthetic)               */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <span className="font-mono text-xs text-brand-navy-light uppercase tracking-[0.25em] font-bold block">
            52 COFFEE &amp; ROASTERY • MALANG
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-black text-brand-navy tracking-tight">
            MENU SLOWBAR
          </h1>
          <div className="w-20 h-0.5 bg-brand-maroon mx-auto rounded-full"></div>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant italic">
            Single Origin Filter Based, Espresso Roast Profiles, &amp; Grand Reserve Micro-Lot
          </p>
        </motion.div>

        {/* ========================================================================= */}
        {/* 2. CATEGORY PILL NAVIGATION WITH FRAMER MOTION GLIDING HIGHLIGHT          */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 border-b border-border-subtle pb-6">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(tab.id);
                  setSelectedSeries('all');
                }}
                className={`relative px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 border ${
                  isSelected
                    ? tab.id === 'reserve'
                      ? 'text-white border-brand-maroon bg-brand-maroon shadow-sm'
                      : 'text-white border-brand-navy bg-brand-navy shadow-sm'
                    : tab.id === 'reserve'
                    ? 'text-brand-maroon border-brand-maroon/30 hover:bg-brand-maroon/10 bg-white'
                    : 'text-brand-navy border-border-subtle bg-brand-pill hover:bg-brand-pill-hover'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="activeCatalogCategoryPill"
                    className={`absolute inset-0 rounded-full ${
                      tab.id === 'reserve' ? 'bg-brand-maroon' : 'bg-brand-navy'
                    } -z-10`}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 3. SEARCH & SORT TOOLBAR                                                 */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 items-center justify-between"
        >
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari biji kopi, alias slowbar (Asmara, Celestia, Soberano...), atau tasting notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-white text-xs sm:text-sm text-on-surface focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy transition-colors"
            />
          </div>

          <div className="w-full sm:w-auto flex justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-border-subtle bg-white text-xs font-semibold text-brand-navy focus:outline-none focus:border-brand-navy cursor-pointer"
            >
              <option value="name">Urutan: Nama A → Z</option>
              <option value="price-asc">Harga: Termurah ke Tertinggi</option>
              <option value="price-desc">Harga: Tertinggi ke Termurah</option>
            </select>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 4. BYOB BANNER CARD                                                       */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-border-subtle bg-brand-pill/50 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center shrink-0 shadow-md">
              <FlaskConical className="w-6 h-6 text-brand-teal-light" />
            </div>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-bold text-brand-navy">
                Build Your Own Blend (BYOB)
              </h3>
              <p className="text-xs text-on-surface-variant">
                Pilih kombinasi single origin favoritmu, atur persentase rasio, dan kami racik presisi untukmu.
              </p>
            </div>
          </div>

          <Link
            href="/blend-builder"
            className="text-brand-navy font-bold text-xs sm:text-sm inline-flex items-center gap-1 hover:gap-2 transition-all font-mono"
          >
            <span>Mulai Racik Blend</span>
            <ArrowRight className="w-4 h-4 text-brand-teal" />
          </Link>
        </motion.div>

        {/* ========================================================================= */}
        {/* 5. PRODUCTS SECTION WITH ANIMATEPRESENCE TAB & SCROLL TRANSITIONS         */}
        {/* ========================================================================= */}
        <AnimatePresence mode="wait">
          {Object.keys(seriesGroups).length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center py-20 bg-surface-container-low rounded-2xl border border-border-subtle"
            >
              <p className="font-mono text-sm text-on-surface-variant mb-3">
                Tidak ada kopi yang sesuai dengan pencarian &quot;{searchQuery}&quot;.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSeries('all');
                }}
                className="btn-pill"
              >
                Reset Filter
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={selectedCategory + selectedSeries + searchQuery + sortBy}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-12"
            >
              {Object.entries(seriesGroups).map(([seriesName, items], sIdx) => (
                <motion.section
                  key={seriesName}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: sIdx * 0.08 }}
                  className="space-y-6"
                >
                  <div className="border-b border-border-subtle pb-4 flex justify-between items-end">
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-[0.2em] font-bold ${
                        seriesName.includes('Grand Reserve') ? 'text-brand-maroon' : 'text-brand-navy-light'
                      }`}>
                        52 COFFEE MENU
                      </span>
                      <h2 className={`font-editorial text-2xl sm:text-3xl font-black ${
                        seriesName.includes('Grand Reserve') ? 'text-brand-maroon' : 'text-brand-navy'
                      }`}>
                        {seriesName.toUpperCase()}
                      </h2>
                    </div>
                    <span className="font-mono text-xs text-on-surface-variant">
                      {items.length} Produk
                    </span>
                  </div>

                  {/* Grid of Product Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((product, pIdx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: pIdx * 0.04 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
