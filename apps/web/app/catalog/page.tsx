'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs font-mono text-gray-400">Loading catalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialSeries = searchParams.get('series');
  const initialType = searchParams.get('type');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<string>(
    initialSeries ? (initialSeries.toLowerCase().includes('daily') ? 'daily' : 'limited') : 'all'
  );
  const [selectedType, setSelectedType] = useState<string>(
    initialType ? initialType.toLowerCase() : 'all'
  );
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [addedId, setAddedId] = useState<string | null>(null);

  const { addItem } = useCartStore();

  const handleQuickAdd = (p: CoffeeProduct) => {
    const defaultVariant = p.variants[0] || { price: p.basePrice, weightLabel: '200g', weightGrams: 200 };
    addItem({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      imageUrl: p.imageUrl,
      weightGrams: defaultVariant.weightGrams,
      weightLabel: defaultVariant.weightLabel,
      grind: 'whole',
      grindLabel: 'Whole Beans (Biji Utuh)',
      unitPrice: defaultVariant.price,
      quantity: 1,
      series: p.series,
      tastingNotes: p.tastingNotes,
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Search
      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tastingNotes.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Series
      let matchSeries = true;
      if (selectedSeries === 'daily') {
        matchSeries = p.series === 'Ijen Series' || p.series === 'Sunda Series' || p.series === 'Espresso Roast';
      } else if (selectedSeries === 'limited') {
        matchSeries = p.series === 'Java Exotic' || p.series === 'Grand Reserve';
      }

      // Type
      let matchType = true;
      if (selectedType === 'filter') {
        matchType = p.category === 'filter' || p.category === 'reserve';
      } else if (selectedType === 'espresso') {
        matchType = p.category === 'espresso';
      }

      return matchSearch && matchSeries && matchType;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      return 0;
    });
  }, [searchQuery, selectedSeries, selectedType, sortBy]);

  // Group products into Daily and Limited
  const dailyProducts = filteredProducts.filter(
    (p) => p.series === 'Ijen Series' || p.series === 'Sunda Series' || p.series === 'Espresso Roast'
  );
  const limitedProducts = filteredProducts.filter(
    (p) => p.series === 'Java Exotic' || p.series === 'Grand Reserve'
  );

  return (
    <div className="w-full bg-surface-white text-on-surface min-h-screen py-12 px-4 sm:px-10 font-sans">
      <div className="max-w-[1280px] mx-auto space-y-10">
        {/* ========================================================================= */}
        {/* 1. HEADER (Exact Screenshot 1: Our Coffee & Past Releases button)         */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1.5">
            <h1 className="font-editorial text-4xl sm:text-5xl font-black text-on-surface tracking-tight">
              Our Coffee
            </h1>
            <p className="font-sans text-sm sm:text-base text-on-surface-variant">
              Sourced with intention, roasted with care.
            </p>
          </div>

          <Link
            href="/catalog?tab=past"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-border-subtle bg-white text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <span>Past Releases</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEARCH & FILTER TOOLBAR (Exact Screenshot 1 Layout)                    */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          {/* Top Row: Search Input & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coffees..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-subtle bg-white text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            <div className="w-full sm:w-auto flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 rounded-xl border border-border-subtle bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="name">A → Z</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: SERIES & TYPE Pills (Exact Screenshot 1) */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-sans">
            {/* SERIES Filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                SERIES
              </span>
              <button
                type="button"
                onClick={() => setSelectedSeries('all')}
                className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                  selectedSeries === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-border-subtle text-gray-600 hover:border-gray-400'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeries('daily')}
                className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                  selectedSeries === 'daily'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-border-subtle text-gray-600 hover:border-gray-400'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setSelectedSeries('limited')}
                className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                  selectedSeries === 'limited'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-border-subtle text-gray-600 hover:border-gray-400'
                }`}
              >
                Limited
              </button>
            </div>

            <div className="w-px h-5 bg-border-subtle mx-1 hidden sm:block"></div>

            {/* TYPE Filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                TYPE
              </span>
              <button
                type="button"
                onClick={() => setSelectedType('all')}
                className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                  selectedType === 'all'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white border border-border-subtle text-gray-600 hover:border-gray-400'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('filter')}
                className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                  selectedType === 'filter'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white border border-border-subtle text-gray-600 hover:border-gray-400'
                }`}
              >
                Filter
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('espresso')}
                className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                  selectedType === 'espresso'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white border border-border-subtle text-gray-600 hover:border-gray-400'
                }`}
              >
                Espresso
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BYOB BANNER CARD (Exact Screenshot 1 Red Beaker Card)                  */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-red-200 bg-[#fff8f8] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-editorial text-base sm:text-lg font-bold text-on-surface">
                Build Your Own Blend
              </h3>
              <p className="text-xs text-on-surface-variant">
                Pick coffees. Set ratios. We blend it for you.
              </p>
            </div>
          </div>

          <Link
            href="/blend-builder"
            className="text-primary font-bold text-xs sm:text-sm inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            <span>Start building</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* 4. DAILY SERIES SECTION (Exact Screenshot 1)                             */}
        {/* ========================================================================= */}
        {(selectedSeries === 'all' || selectedSeries === 'daily') && dailyProducts.length > 0 && (
          <section className="space-y-6 pt-4">
            <div>
              <div className="w-6 h-1 bg-primary rounded-full mb-3"></div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-black text-on-surface">
                Daily Series
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Reliable everyday coffee. Affordable, accessible, available year-round.
              </p>
              <span className="font-mono text-[11px] text-gray-400 uppercase tracking-widest font-bold mt-4 block">
                ESPRESSO &amp; FILTER
              </span>
            </div>

            {/* Grid of Pouches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyProducts.map((p) => (
                <div
                  key={p.id}
                  className="group border border-border-subtle rounded-2xl p-5 bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Pouch Mockup Frame */}
                    <div className="aspect-[0.9] mb-4 relative rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center p-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.badge && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 text-white font-mono text-[9px] uppercase tracking-wider backdrop-blur-sm">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mb-4">
                      <Link
                        href={`/catalog/${p.slug}`}
                        className="font-editorial text-sm sm:text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-2"
                      >
                        {p.name}
                      </Link>
                      <p className="font-sans text-xs text-on-surface-variant line-clamp-2">
                        {p.tastingNotes.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-border-subtle/60">
                    <div className="text-xs font-bold text-on-surface font-mono">
                      {formatRupiah(p.basePrice)}
                      <span className="text-[10px] font-normal text-on-surface-variant block font-sans">
                        per {p.defaultWeight}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(p)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        addedId === p.id
                          ? 'bg-status-success text-white'
                          : 'bg-primary text-white hover:bg-surface-tint shadow-md'
                      }`}
                      title="Tambah ke Keranjang"
                    >
                      {addedId === p.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* 5. LIMITED SERIES SECTION (Java Exotic & Grand Reserve)                  */}
        {/* ========================================================================= */}
        {(selectedSeries === 'all' || selectedSeries === 'limited') && limitedProducts.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-border-subtle">
            <div>
              <div className="w-6 h-1 bg-amber-600 rounded-full mb-3"></div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-black text-on-surface">
                Limited Series
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Micro-lots, rare varietals, and experimental processing. Roasted in small batches.
              </p>
              <span className="font-mono text-[11px] text-gray-400 uppercase tracking-widest font-bold mt-4 block">
                JAVA EXOTIC &amp; GRAND RESERVE MICRO-LOT
              </span>
            </div>

            {/* Grid of Limited Pouches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {limitedProducts.map((p) => (
                <div
                  key={p.id}
                  className="group border border-border-subtle rounded-2xl p-5 bg-white hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Pouch Mockup Frame */}
                    <div className="aspect-[0.9] mb-4 relative rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center p-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                      />
                      {p.badge && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-600 text-white font-mono text-[9px] uppercase tracking-wider backdrop-blur-sm">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mb-4">
                      <Link
                        href={`/catalog/${p.slug}`}
                        className="font-editorial text-sm sm:text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-2"
                      >
                        {p.name}
                      </Link>
                      <p className="font-sans text-xs text-on-surface-variant line-clamp-2">
                        {p.tastingNotes.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-border-subtle/60">
                    <div className="text-xs font-bold text-on-surface font-mono">
                      {formatRupiah(p.basePrice)}
                      <span className="text-[10px] font-normal text-on-surface-variant block font-sans">
                        per {p.defaultWeight}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(p)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        addedId === p.id
                          ? 'bg-status-success text-white'
                          : 'bg-primary text-white hover:bg-surface-tint shadow-md'
                      }`}
                      title="Tambah ke Keranjang"
                    >
                      {addedId === p.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
