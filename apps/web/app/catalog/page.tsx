'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { PRODUCTS, CoffeeProduct } from '../../lib/data';
import { EditorialProductCard } from '../../components/editorial-product-card';

// Ordered according to official 52 Coffee Menu PDF
const ORDERED_SERIES = [
  'Ijen Series',
  'Java Exotic',
  'Argopuro Walida',
  'Grand Reserve',
  'Enrekang Series',
  'Sunda Series',
  'Arjuna Series',
  'Dewata Series',
  'Aceh Series',
  'Robusta Espresso',
  'Arabica Espresso',
];

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="p-24 text-center text-xs font-mono uppercase tracking-widest text-on-surface-variant">
          Memuat Menu Katalog 52 Coffee...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSeries = searchParams.get('series');

  const [mainTab, setMainTab] = useState<'beans' | 'slowbar'>(() => {
    if (initialCategory && (initialCategory.toLowerCase() === 'beverages' || initialCategory.toLowerCase() === 'slowbar')) {
      return 'slowbar';
    }
    return 'beans';
  });

  const [beansSubTab, setBeansSubTab] = useState<'filter' | 'espresso'>(() => {
    if (initialCategory && initialCategory.toLowerCase() === 'espresso') {
      return 'espresso';
    }
    return 'filter';
  });

  const [selectedSeries, setSelectedSeries] = useState<string>(
    initialSeries || 'all'
  );
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [sortOpen, setSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Extract and sort all unique series by PDF menu order
  const allSeriesList = useMemo(() => {
    const set = new Set<string>();
    PRODUCTS.forEach((p) => set.add(p.series));
    const list = Array.from(set);
    return list.sort((a, b) => {
      const idxA = ORDERED_SERIES.indexOf(a);
      const idxB = ORDERED_SERIES.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // 1. Category Filter
      let matchCategory = true;
      if (mainTab === 'slowbar') {
        matchCategory = !!p.cupPrice;
      } else {
        if (beansSubTab === 'filter') {
          matchCategory = p.category === 'filter' || p.category === 'reserve';
        } else if (beansSubTab === 'espresso') {
          matchCategory = p.category === 'espresso';
        }
      }

      // 2. Series Filter
      let matchSeries = true;
      if (selectedSeries !== 'all') {
        matchSeries = p.series.toLowerCase() === selectedSeries.toLowerCase();
      }

      return matchCategory && matchSeries;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'price-asc') {
        const priceA = mainTab === 'slowbar' && a.cupPrice ? a.cupPrice : a.basePrice;
        const priceB = mainTab === 'slowbar' && b.cupPrice ? b.cupPrice : b.basePrice;
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        const priceA = mainTab === 'slowbar' && a.cupPrice ? a.cupPrice : a.basePrice;
        const priceB = mainTab === 'slowbar' && b.cupPrice ? b.cupPrice : b.basePrice;
        return priceB - priceA;
      }
      return 0;
    });
  }, [mainTab, beansSubTab, selectedSeries, sortBy]);

  // Handle image assignment for clean studio isolated bag preview
  const enrichedProducts = useMemo(() => {
    return filteredProducts.map((p) => {
      let customImg = p.imageUrl;
      if (!p.imageUrl || p.imageUrl.startsWith('http')) {
        if (p.series === 'Java Exotic') customImg = '/images/bag-sumbing.jpg';
        else if (p.series === 'Grand Reserve') customImg = '/images/bag-grand-reserve.jpg';
        else if (p.series === 'Argopuro Walida' || p.series === 'Arjuna Series' || p.series === 'Dewata Series') customImg = '/images/bag-walida.jpg';
        else if (p.series === 'Enrekang Series' || p.series === 'Arabica Espresso') customImg = '/images/bag-sumbing.jpg';
        else customImg = '/images/bag-prau.jpg';
      }
      return {
        ...p,
        imageUrl: customImg,
      };
    });
  }, [filteredProducts]);

  const displayedProducts = enrichedProducts.slice(0, visibleCount);

  const hasActiveFilters = selectedSeries !== 'all';

  const resetAllFilters = () => {
    setSelectedSeries('all');
    setVisibleCount(12);
  };

  return (
    <div className="w-full bg-surface-white text-on-surface font-sans min-h-screen pb-24 antialiased">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* ===================================================================== */}
        {/* 1. BREADCRUMB & 52 COFFEE CATALOG HEADER                              */}
        {/* ===================================================================== */}
        <div className="pt-10 pb-4 text-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-navy font-semibold">Catalog</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold text-brand-navy tracking-tight uppercase mb-6">
            52 Coffee Catalog
          </h1>

          {/* 1. PRIMARY EDITORIAL TABS (WHOLEBEANS/RETAIL vs SLOWBAR) */}
          <div className="flex items-center justify-center border-b border-border-subtle max-w-sm sm:max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setMainTab('beans');
                setVisibleCount(12);
              }}
              className={`relative flex-1 pb-3 pt-2 font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-colors duration-200 text-center cursor-pointer ${
                mainTab === 'beans' ? 'text-brand-navy' : 'text-on-surface-variant hover:text-brand-navy'
              }`}
            >
              <span>Wholebeans/Retail</span>
              {mainTab === 'beans' && (
                <motion.div
                  layoutId="activeCatalogTabLine"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-navy"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setMainTab('slowbar');
                setVisibleCount(12);
              }}
              className={`relative flex-1 pb-3 pt-2 font-mono text-xs sm:text-sm uppercase tracking-wider font-bold transition-colors duration-200 text-center cursor-pointer ${
                mainTab === 'slowbar' ? 'text-brand-navy' : 'text-on-surface-variant hover:text-brand-navy'
              }`}
            >
              <span>Slowbar</span>
              {mainTab === 'slowbar' && (
                <motion.div
                  layoutId="activeCatalogTabLine"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-navy"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          </div>

          {/* 2. SUB-FILTERS INSIDE WHOLEBEANS: FILTER vs ESPRESSO */}
          <AnimatePresence>
            {mainTab === 'beans' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="flex items-center justify-center gap-2.5 pt-4 font-mono text-[11px] uppercase tracking-wider"
              >
                <button
                  type="button"
                  onClick={() => {
                    setBeansSubTab('filter');
                    setVisibleCount(12);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer border text-xs ${
                    beansSubTab === 'filter'
                      ? 'bg-brand-maroon text-white border-brand-maroon font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant border-border-subtle hover:border-brand-navy hover:text-brand-navy'
                  }`}
                >
                  <span>Filter Roast</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBeansSubTab('espresso');
                    setVisibleCount(12);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer border text-xs ${
                    beansSubTab === 'espresso'
                      ? 'bg-brand-maroon text-white border-brand-maroon font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant border-border-subtle hover:border-brand-navy hover:text-brand-navy'
                  }`}
                >
                  <span>Espresso Roast</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===================================================================== */}
        {/* 2. PERMANENTLY OPEN SERIES FILTER BAR & SORT TOOLBAR                  */}
        {/* ===================================================================== */}
        <div className="mt-8 mb-8 space-y-4">
          {/* Series Selection Bar (Always Open) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-border-subtle space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold block">
                Pilih Series (Origin Nusantara &amp; Dunia)
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-maroon hover:underline font-mono font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSeries('all')}
                className={`px-3.5 py-1.5 rounded-full border transition-all text-xs font-mono cursor-pointer ${
                  selectedSeries === 'all'
                    ? 'bg-brand-navy text-white border-brand-navy font-bold shadow-xs'
                    : 'bg-white text-on-surface-variant border-border-subtle hover:border-brand-navy hover:text-brand-navy'
                }`}
              >
                Semua Series
              </button>
              {allSeriesList.map((series) => (
                <button
                  key={series}
                  onClick={() => setSelectedSeries(series)}
                  className={`px-3.5 py-1.5 rounded-full border transition-all text-xs font-mono cursor-pointer ${
                    selectedSeries === series
                      ? 'bg-brand-navy text-white border-brand-navy font-bold shadow-xs'
                      : 'bg-white text-on-surface-variant border-border-subtle hover:border-brand-navy hover:text-brand-navy'
                  }`}
                >
                  {series}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count & Sort By Toolbar */}
          <div className="border-y border-border-subtle py-3 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-brand-navy">
            {/* Results Count */}
            <span className="text-[11px] font-mono text-on-surface-variant font-normal normal-case">
              Menampilkan {displayedProducts.length} dari {filteredProducts.length} {mainTab === 'slowbar' ? 'menu seduh cangkir' : 'biji kopi'}
            </span>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 hover:text-brand-teal transition-colors cursor-pointer"
              >
                <span>SORT BY {sortOpen ? '–' : '+'}</span>
              </button>

              {sortOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border-subtle shadow-xl rounded-xl p-2 z-40 space-y-1 normal-case text-xs font-sans">
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-brand-pill transition-colors ${
                      sortBy === 'name' ? 'font-bold text-brand-navy bg-brand-pill' : 'text-on-surface-variant'
                    }`}
                  >
                    Nama (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('price-asc');
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-brand-pill transition-colors ${
                      sortBy === 'price-asc' ? 'font-bold text-brand-navy bg-brand-pill' : 'text-on-surface-variant'
                    }`}
                  >
                    Harga: Terendah → Tertinggi
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('price-desc');
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-brand-pill transition-colors ${
                      sortBy === 'price-desc' ? 'font-bold text-brand-navy bg-brand-pill' : 'text-on-surface-variant'
                    }`}
                  >
                    Harga: Tertinggi → Terendah
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. 4-COLUMN COMPACT EDITORIAL PRODUCT GRID                           */}
        {/* ===================================================================== */}
        <AnimatePresence mode="wait">
          {displayedProducts.length > 0 ? (
            <motion.div
              key={`${mainTab}-${beansSubTab}-${selectedSeries}-${sortBy}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {displayedProducts.map((product) => (
                <EditorialProductCard
                  key={product.id}
                  product={product}
                  isBeverageMode={mainTab === 'slowbar'}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center space-y-4 bg-surface-container-low border border-border-subtle rounded-3xl p-10"
            >
              <h3 className="font-editorial text-2xl font-bold text-brand-navy">
                Tidak ada biji kopi yang cocok dengan filter.
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                Coba gunakan kata kunci lain atau reset filter untuk melihat seluruh katalog.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-mono font-bold hover:bg-brand-navy-light transition-all shadow-sm"
              >
                Reset Filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* 5. BOTTOM "VIEW MORE" ACTION                                         */}
        {/* ===================================================================== */}
        {visibleCount < filteredProducts.length && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="px-8 py-3 rounded-full bg-brand-navy text-white font-mono text-xs font-bold hover:bg-brand-navy-light transition-all shadow-sm cursor-pointer hover:scale-105"
            >
              Lihat Lebih Banyak ({filteredProducts.length - visibleCount} kopi tersisa)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
