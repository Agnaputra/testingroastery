'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { PRODUCTS, CoffeeProduct } from '../../lib/data';
import { EditorialProductCard } from '../../components/editorial-product-card';

const CATEGORY_TABS = [
  { id: 'all', label: 'SEMUA BIJI KOPI' },
  { id: 'filter', label: 'FILTER BEANS' },
  { id: 'espresso', label: 'ESPRESSO BEANS' },
  { id: 'reserve', label: 'GRAND RESERVE' },
  { id: 'beverages', label: 'SLOWBAR MENU (PER CUP)' },
];

const FLAVOR_FILTERS = [
  { id: 'all', label: 'Semua Flavor' },
  { id: 'Fruity', label: 'Fruity & Berry' },
  { id: 'Floral', label: 'Floral & Jasmine' },
  { id: 'Sweet', label: 'Sweet & Honey' },
  { id: 'Chocolaty', label: 'Chocolaty & Nutty' },
];

const PROCESS_FILTERS = [
  { id: 'all', label: 'Semua Proses' },
  { id: 'natural', label: 'Natural / Anaerob' },
  { id: 'washed', label: 'Washed' },
  { id: 'carbonic', label: 'Carbonic / Koji' },
  { id: 'honey', label: 'Honey / Lactic' },
];

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory ? initialCategory.toLowerCase() : 'all'
  );
  const [selectedSeries, setSelectedSeries] = useState<string>(
    initialSeries || 'all'
  );
  const [selectedFlavor, setSelectedFlavor] = useState<string>('all');
  const [selectedProcess, setSelectedProcess] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [filtersOpen, setFiltersOpen] = useState(false);
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
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        p.name.toLowerCase().includes(q) ||
        (p.slowbarAlias && p.slowbarAlias.toLowerCase().includes(q)) ||
        p.origin.toLowerCase().includes(q) ||
        p.process.toLowerCase().includes(q) ||
        p.tastingNotes.some((t) => t.toLowerCase().includes(q));

      // 2. Category
      let matchCategory = true;
      if (selectedCategory === 'filter') {
        matchCategory = p.category === 'filter';
      } else if (selectedCategory === 'espresso') {
        matchCategory = p.category === 'espresso';
      } else if (selectedCategory === 'reserve') {
        matchCategory = p.category === 'reserve';
      } else if (selectedCategory === 'beverages') {
        matchCategory = !!p.cupPrice;
      }

      // 3. Series
      let matchSeries = true;
      if (selectedSeries !== 'all') {
        matchSeries = p.series.toLowerCase() === selectedSeries.toLowerCase();
      }

      // 4. Flavor
      let matchFlavor = true;
      if (selectedFlavor !== 'all') {
        matchFlavor =
          p.flavorCategory?.includes(selectedFlavor as any) ||
          p.tastingNotes.some((n) => n.toLowerCase().includes(selectedFlavor.toLowerCase()));
      }

      // 5. Process
      let matchProcess = true;
      if (selectedProcess === 'washed') {
        matchProcess = p.process.toLowerCase().includes('wash');
      } else if (selectedProcess === 'natural') {
        const proc = p.process.toLowerCase();
        matchProcess = proc.includes('natural') || proc.includes('anaerob') || proc.includes('wine');
      } else if (selectedProcess === 'carbonic') {
        const proc = p.process.toLowerCase();
        matchProcess = proc.includes('carbonic') || proc.includes('koji') || proc.includes('maceration');
      } else if (selectedProcess === 'honey') {
        const proc = p.process.toLowerCase();
        matchProcess = proc.includes('honey') || proc.includes('lactic');
      } else if (selectedProcess !== 'all') {
        matchProcess = p.process.toLowerCase().includes(selectedProcess.toLowerCase());
      }

      return matchSearch && matchCategory && matchSeries && matchFlavor && matchProcess;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'price-asc') {
        const priceA = selectedCategory === 'beverages' && a.cupPrice ? a.cupPrice : a.basePrice;
        const priceB = selectedCategory === 'beverages' && b.cupPrice ? b.cupPrice : b.basePrice;
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        const priceA = selectedCategory === 'beverages' && a.cupPrice ? a.cupPrice : a.basePrice;
        const priceB = selectedCategory === 'beverages' && b.cupPrice ? b.cupPrice : b.basePrice;
        return priceB - priceA;
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedSeries, selectedFlavor, selectedProcess, sortBy]);

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

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'all' ||
    selectedSeries !== 'all' ||
    selectedFlavor !== 'all' ||
    selectedProcess !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSeries('all');
    setSelectedFlavor('all');
    setSelectedProcess('all');
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

          {/* Centered Category Links with Smooth Sliding Indicator */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-6 font-mono text-xs uppercase tracking-wider font-bold">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedCategory(tab.id);
                    setVisibleCount(12);
                  }}
                  className={`relative px-3 py-2 transition-colors duration-200 ${
                    isActive ? 'text-brand-maroon' : 'text-on-surface-variant hover:text-brand-navy'
                  }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeCatalogTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-maroon"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 2. MINIMALIST TOOLBAR: FILTERS +  &  SORT BY +                        */}
        {/* ===================================================================== */}
        <div className="mt-10 mb-6 border-y border-border-subtle py-3.5 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-brand-navy">
          {/* Filters Toggle Button */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 hover:text-brand-teal transition-colors cursor-pointer"
          >
            <span>FILTERS {filtersOpen ? '–' : '+'}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-maroon" />
            )}
          </button>

          {/* Results Count (Center) */}
          <span className="hidden md:inline-block text-[11px] font-mono text-on-surface-variant font-normal normal-case">
            Menampilkan {displayedProducts.length} dari {filteredProducts.length} {selectedCategory === 'beverages' ? 'menu seduh cangkir' : 'biji kopi'}
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

        {/* ===================================================================== */}
        {/* 3. COLLAPSIBLE FILTERS SLIDE-DOWN DRAWER                              */}
        {/* ===================================================================== */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-surface-container-low border border-border-subtle p-6 rounded-2xl space-y-6 text-xs font-mono">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-on-surface-variant absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari aroma (misal: Berry, Jasmine, Peach), alias (Asmara, Celestia), origin..."
                    className="w-full bg-white border border-border-subtle rounded-xl pl-11 pr-10 py-3 text-xs text-brand-navy placeholder-gray-400 focus:outline-none focus:border-brand-navy"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-navy"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Series Chips Filter */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">
                    Pilih Series (Origin Nusantara &amp; Dunia)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedSeries('all')}
                      className={`px-3 py-1.5 rounded-full border transition-all text-xs ${
                        selectedSeries === 'all'
                          ? 'bg-brand-navy text-white border-brand-navy font-bold'
                          : 'bg-white text-on-surface-variant border-border-subtle hover:border-brand-navy'
                      }`}
                    >
                      Semua Series
                    </button>
                    {allSeriesList.map((series) => (
                      <button
                        key={series}
                        onClick={() => setSelectedSeries(series)}
                        className={`px-3 py-1.5 rounded-full border transition-all text-xs ${
                          selectedSeries === series
                            ? 'bg-brand-navy text-white border-brand-navy font-bold'
                            : 'bg-white text-on-surface-variant border-border-subtle hover:border-brand-navy'
                        }`}
                      >
                        {series}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flavor & Process Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border-subtle/60">
                  {/* Flavor Categories */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">
                      Profil Rasa (Taste Notes)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {FLAVOR_FILTERS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFlavor(f.id)}
                          className={`px-3 py-1.5 rounded-full border transition-all text-xs ${
                            selectedFlavor === f.id
                              ? 'bg-brand-maroon text-white border-brand-maroon font-bold'
                              : 'bg-white text-on-surface-variant border-border-subtle hover:border-brand-maroon'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Process Filters */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block">
                      Metode Proses Pasca-Panen
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PROCESS_FILTERS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProcess(p.id)}
                          className={`px-3 py-1.5 rounded-full border transition-all text-xs ${
                            selectedProcess === p.id
                              ? 'bg-brand-teal text-white border-brand-teal font-bold'
                              : 'bg-white text-on-surface-variant border-border-subtle hover:border-brand-teal'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset Action */}
                {hasActiveFilters && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 text-xs text-brand-maroon hover:underline font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Semua Filter</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================================== */}
        {/* 4. 4-COLUMN COMPACT EDITORIAL PRODUCT GRID                           */}
        {/* ===================================================================== */}
        <AnimatePresence mode="wait">
          {displayedProducts.length > 0 ? (
            <motion.div
              key={`${selectedCategory}-${selectedSeries}-${selectedFlavor}-${selectedProcess}-${sortBy}`}
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
                  isBeverageMode={selectedCategory === 'beverages'}
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
