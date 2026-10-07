'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Coffee,
  MapPin,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import {
  getProductDisplayImage,
} from '../lib/data';
import { getPublishedProducts } from '../lib/catalog-master';
import { EditorialProductCard } from './editorial-product-card';

const PUBLISHED_PRODUCTS = getPublishedProducts();

// Ordered according to official 52 Coffee Menu Blueprint
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

const FLAVOR_PROFILES = [
  { id: 'all', label: 'Semua profil' },
  { id: 'Fruity', label: 'Fruity' },
  { id: 'Floral', label: 'Floral' },
  { id: 'Sweet', label: 'Sweet' },
  { id: 'Chocolaty', label: 'Chocolaty' },
  { id: 'Nutty', label: 'Nutty' },
] as const;

export default function CatalogContent({ initialCategory: defaultCategory }: { initialCategory?: string }) {
  return (
    <Suspense
      fallback={
        <div className="p-24 text-center text-xs font-mono uppercase tracking-widest text-on-surface-variant">
          Memuat Menu Katalog 52 Coffee...
        </div>
      }
    >
      <CatalogClientContent defaultCategory={defaultCategory} />
    </Suspense>
  );
}

function CatalogClientContent({ defaultCategory }: { defaultCategory?: string }) {
  const reducedMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') ?? defaultCategory ?? null;
  const initialSeries = searchParams.get('series');

  const [mainTab, setMainTab] = useState<'beans' | 'slowbar' | 'glassware' | 'machine'>(() => {
    if (initialCategory) {
      const cat = initialCategory.toLowerCase();
      if (cat === 'beverages' || cat === 'slowbar') return 'slowbar';
      if (cat === 'glassware') return 'glassware';
      if (cat === 'machine' || cat === 'coffee machine') return 'machine';
    }
    return 'beans';
  });

  const [beansSubTab, setBeansSubTab] = useState<'filter' | 'espresso'>(() => {
    if (initialCategory && initialCategory.toLowerCase() === 'espresso') {
      return 'espresso';
    }
    return 'filter';
  });
  const [slowbarGroup, setSlowbarGroup] = useState<'specialty' | 'classic'>('specialty');
  const [slowbarBrewBase, setSlowbarBrewBase] = useState<'filter' | 'espresso'>('filter');

  const [selectedSeries, setSelectedSeries] = useState<string>(
    initialSeries || (initialCategory?.toLowerCase() === 'reserve' ? 'Grand Reserve' : 'all')
  );
  const [selectedFlavor, setSelectedFlavor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const category = initialCategory?.toLowerCase();
    if (category === 'beverages' || category === 'slowbar') {
      setMainTab('slowbar');
    } else if (category === 'glassware') {
      setMainTab('glassware');
    } else if (category === 'machine' || category === 'coffee machine') {
      setMainTab('machine');
    } else {
      setMainTab('beans');
    }
    setBeansSubTab(category === 'espresso' ? 'espresso' : 'filter');
    setSelectedSeries(
      initialSeries || (category === 'reserve' ? 'Grand Reserve' : 'all')
    );
    setVisibleCount(4);
  }, [initialCategory, initialSeries]);

  // Extract and sort all unique series by official Blueprint menu order
  const allSeriesList = useMemo(() => {
    const set = new Set<string>();
    PUBLISHED_PRODUCTS.forEach((p) => set.add(p.series));
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return PUBLISHED_PRODUCTS.filter((p) => {
      // 1. Category Filter
      if (mainTab === 'slowbar') {
        if (!p.cupPrice) return false;
        if (slowbarGroup === 'classic') {
          if (p.category !== 'espresso') return false;
        } else {
          if (slowbarBrewBase === 'filter' && p.category === 'espresso') return false;
          if (slowbarBrewBase === 'espresso' && p.category !== 'espresso') return false;
        }
      } else if (mainTab === 'glassware') {
        if (p.category !== 'glassware') return false;
      } else if (mainTab === 'machine') {
        if (p.category !== 'machine') return false;
      } else {
        if (beansSubTab === 'filter') {
          if (p.category !== 'filter' && p.category !== 'reserve') return false;
        } else if (beansSubTab === 'espresso') {
          if (p.category !== 'espresso') return false;
        }
      }

      // 2. Series Filter (only for coffee tabs)
      if (mainTab !== 'glassware' && mainTab !== 'machine' && selectedSeries !== 'all') {
        if (p.series.toLowerCase() !== selectedSeries.toLowerCase()) return false;
      }

      // 3. Flavor Filter (only for coffee tabs)
      if (mainTab !== 'glassware' && mainTab !== 'machine' && selectedFlavor !== 'all') {
        const matchFlavor = p.flavorCategory.some(
          (f) => f.toLowerCase() === selectedFlavor.toLowerCase()
        );
        if (!matchFlavor) return false;
      }

      // 4. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch =
          p.name.toLowerCase().includes(q) ||
          (p.slowbarAlias && p.slowbarAlias.toLowerCase().includes(q)) ||
          p.origin.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.process.toLowerCase().includes(q) ||
          p.varietal.toLowerCase().includes(q) ||
          p.tastingNotes.some((t) => t.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      return true;
    }).sort((a, b) => {
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
      return a.name.localeCompare(b.name);
    });
  }, [mainTab, beansSubTab, slowbarGroup, slowbarBrewBase, selectedSeries, selectedFlavor, searchQuery, sortBy]);

  // Assign image URLs
  const enrichedProducts = useMemo(() => {
    return filteredProducts.map((p) => {
      return {
        ...p,
        imageUrl: getProductDisplayImage(p),
      };
    });
  }, [filteredProducts]);

  const displayedProducts = enrichedProducts.slice(0, visibleCount);

  const filterCount = useMemo(
    () => PUBLISHED_PRODUCTS.filter((p) => p.category === 'filter' || p.category === 'reserve').length,
    []
  );
  const espressoCount = useMemo(
    () => PUBLISHED_PRODUCTS.filter((p) => p.category === 'espresso').length,
    []
  );
  const slowbarCount = useMemo(
    () => PUBLISHED_PRODUCTS.filter((p) => !!p.cupPrice).length,
    []
  );

  const hasActiveFilters =
    selectedSeries !== 'all' || selectedFlavor !== 'all' || searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setSelectedSeries('all');
    setSelectedFlavor('all');
    setSearchQuery('');
    setVisibleCount(4);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] pb-24 pt-[76px] text-brand-charcoal [&_button]:min-h-11">
      {/* Editorial Hero Header */}
      <motion.section
        className="border-b border-black/10"
        initial={reducedMotion ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="site-container grid gap-8 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)] lg:items-end lg:py-16">
          <motion.div initial={reducedMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.08 }}>
            <p className="mb-4 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-maroon">
              <Coffee size={14} aria-hidden="true" />
              Koleksi Sangrai 52 Coffee & Roastery
            </p>
            <h1 className="max-w-[13ch] font-headline text-[clamp(2.5rem,5.5vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-brand-charcoal">
              Temukan kopi yang terasa personal.
            </h1>
          </motion.div>
          <motion.div className="max-w-md lg:justify-self-end" initial={reducedMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.18 }}>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Jelajahi origin nusantara, proses fermentasi presisi, dan profil rasa unik yang disangrai segar di Malang untuk ritual seduh Anda.
            </p>
            <div className="mt-5 flex items-center justify-between border-t border-black/15 pt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
              <span>
                {mainTab === 'slowbar'
                  ? `${slowbarCount} menu Slowbar`
                  : `${PUBLISHED_PRODUCTS.length} pilihan kopi (${filterCount} filter · ${espressoCount} espresso)`}
              </span>
              <span>Di sangrai di Malang · Semua kopi fresh roast</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.div
        className="site-container pt-8"
        initial={reducedMotion ? false : { opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.7, delay: reducedMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Primary Tabs (Beans vs Slowbar) & Sub-tabs (Filter vs Espresso) */}
        <div className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Jenis penyajian kopi" className="flex items-center gap-7">
            {([
              ['beans', 'Retail Beans'],
              ['slowbar', 'Slowbar Beverages'],
              ['glassware', 'Glassware'],
              ['machine', 'Machine & Tools'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mainTab === value}
                onClick={() => {
                  setMainTab(value);
                  setVisibleCount(4);
                }}
                className={`relative px-0 py-1 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon ${
                  mainTab === value
                    ? 'text-brand-charcoal'
                    : 'text-on-surface-variant hover:text-brand-charcoal'
                }`}
              >
                {label}
                {mainTab === value && (
                  <motion.span
                    layoutId="activeCatalogTabLine"
                    className="absolute inset-x-0 -bottom-[1.3rem] h-0.5 bg-brand-maroon"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mainTab === 'beans' && (
              <motion.div
                key="bean-roasts"
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-6 font-mono text-[10px] font-semibold uppercase tracking-[0.15em]"
              >
                {([
                  ['filter', 'Filter roast'],
                  ['espresso', 'Espresso roast'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={beansSubTab === value}
                    onClick={() => {
                      setBeansSubTab(value);
                      setVisibleCount(4);
                    }}
                    className={`border-b py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon ${
                      beansSubTab === value
                        ? 'border-brand-maroon text-brand-maroon font-bold'
                        : 'border-transparent text-on-surface-variant hover:text-brand-charcoal'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
            {mainTab === 'slowbar' && (
              <motion.div key="slowbar-groups" initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -2 }} className="flex flex-col gap-3 sm:items-end">
                <div role="group" aria-label="Kelompok menu Slowbar" className="flex items-center gap-5 text-xs font-semibold">
                  {([['specialty', 'Specialty Coffee'], ['classic', 'Classic Coffee']] as const).map(([value, label]) => (
                    <button key={value} type="button" aria-pressed={slowbarGroup === value} onClick={() => { setSlowbarGroup(value); setVisibleCount(4); }} className={`min-h-10 border-b transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon ${slowbarGroup === value ? 'border-brand-maroon text-brand-maroon' : 'border-transparent text-on-surface-variant hover:text-brand-charcoal'}`}>{label}</button>
                  ))}
                </div>
                <div role="group" aria-label="Basis seduhan Slowbar" className="flex items-center gap-5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                  {([['filter', 'Filter Based'], ['espresso', 'Espresso Based']] as const).map(([value, label]) => (
                    <button key={value} type="button" aria-pressed={slowbarBrewBase === value} onClick={() => { setSlowbarBrewBase(value); setVisibleCount(4); }} className={`min-h-9 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon ${slowbarBrewBase === value ? 'text-brand-maroon' : 'text-on-surface-variant hover:text-brand-charcoal'}`}>{label}</button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {mainTab === 'slowbar' && (
          <div className="my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-brand-maroon/20 bg-brand-maroon/10 p-4 text-brand-maroon">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                <MapPin size={14} aria-hidden="true" /> Hanya bisa dinikmati di lokasi
              </span>
              <span className="text-xs text-brand-charcoal">
                Menu seduhan manual dan espresso disajikan langsung oleh barista di 52 Coffee, Malang.
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-maroon font-semibold">
              Slowbar Experience
            </span>
          </div>
        )}

        {mainTab === 'slowbar' && (
          <section className="mb-6 grid overflow-hidden border border-black/10 bg-brand-charcoal text-white md:grid-cols-[1.25fr_1fr]" aria-labelledby="slowbar-guide-heading">
            <div className="relative min-h-56 bg-black/20">
              <Image src="/images/canva-v60-kettle-pour.jpg" alt="Fallback visual Brewing Guidance 52 Coffee" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover opacity-80" />
              <span className="absolute left-4 top-4 bg-black/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em]">Fallback gambar · slot video belum tersedia</span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-brand-mist">Coffee Lab</p>
              <h2 id="slowbar-guide-heading" className="mt-2 font-headline text-2xl font-semibold">Brewing Guidance</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">Pelajari rasio, dosis, suhu, dan urutan tuang untuk membaca karakter beans resmi 52 Coffee.</p>
              <Link href="/coffee-lab/brewing-guidance" className="mt-5 inline-flex min-h-11 w-fit items-center border border-white/40 px-4 text-sm font-semibold hover:bg-white hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-mist">Buka Brewing Guidance →</Link>
            </div>
          </section>
        )}

        {/* Clean, Simple Flavor Pills */}
        <div className="py-3 border-b border-black/10">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {FLAVOR_PROFILES.map((cat) => {
              const isActive = selectedFlavor === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedFlavor(cat.id);
                    setVisibleCount(4);
                  }}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon ${
                    isActive
                      ? 'bg-brand-charcoal text-white font-medium'
                      : 'bg-black/[0.04] text-brand-charcoal/75 hover:bg-black/[0.08]'
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simple Toolbar: Search, Series, Sort */}
        <div className="mb-6 mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(4);
              }}
              placeholder="Cari kopi, origin, tasting notes..."
              className="min-h-11 w-full rounded-sm border border-black/15 bg-white pl-9 pr-8 text-xs text-brand-charcoal placeholder:text-on-surface-variant/60 focus:border-brand-maroon focus:outline-none focus:ring-1 focus:ring-brand-maroon"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-brand-charcoal focus-visible:outline-none"
                aria-label="Hapus kata kunci pencarian"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Series Filter Dropdown */}
          <label className="block min-w-0 sm:w-44">
            <span className="sr-only">Series kopi</span>
            <select
              value={selectedSeries}
              onChange={(event) => {
                setSelectedSeries(event.target.value);
    setVisibleCount(4);
              }}
              className="min-h-11 w-full rounded-sm border border-black/15 bg-white px-3 text-xs font-semibold text-brand-charcoal focus:border-brand-maroon focus:outline-none focus:ring-1 focus:ring-brand-maroon"
              aria-label="Filter berdasarkan series kopi"
            >
              <option value="all">Semua series</option>
              {allSeriesList.map((series) => (
                <option key={series} value={series}>{series}</option>
              ))}
            </select>
          </label>

          {/* Sort Dropdown */}
          <label className="block min-w-0 sm:w-44">
            <span className="sr-only">Urutkan</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
              className="min-h-11 w-full rounded-sm border border-black/15 bg-white px-3 text-xs font-semibold text-brand-charcoal focus:border-brand-maroon focus:outline-none focus:ring-1 focus:ring-brand-maroon"
              aria-label="Urutkan produk"
            >
              <option value="name">Nama A - Z</option>
              <option value="price-asc">Harga terendah</option>
              <option value="price-desc">Harga tertinggi</option>
            </select>
          </label>
        </div>

        {/* Results Count & Active Filter Indicator */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Menampilkan {displayedProducts.length} dari {filteredProducts.length} kopi
            </span>

            {selectedSeries !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-0.5 text-brand-charcoal">
                Series: {selectedSeries}
                <button
                  type="button"
                  onClick={() => setSelectedSeries('all')}
                  className="hover:text-brand-maroon ml-0.5"
                  aria-label={`Hapus filter series ${selectedSeries}`}
                >
                  <X size={11} aria-hidden="true" />
                </button>
              </span>
            )}

            {selectedFlavor !== 'all' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-0.5 text-brand-charcoal">
                Profil: {selectedFlavor}
                <button
                  type="button"
                  onClick={() => setSelectedFlavor('all')}
                  className="hover:text-brand-maroon ml-0.5"
                  aria-label={`Hapus filter profil ${selectedFlavor}`}
                >
                  <X size={11} aria-hidden="true" />
                </button>
              </span>
            )}

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-0.5 text-brand-charcoal">
                Cari: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-brand-maroon ml-0.5"
                  aria-label="Hapus kata kunci pencarian"
                >
                  <X size={11} aria-hidden="true" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 font-semibold text-brand-maroon hover:underline focus-visible:outline-none"
            >
              <RotateCcw size={11} aria-hidden="true" />
              Reset filter
            </button>
          )}
        </div>

        {/* Clean Editorial Product Grid */}
        <AnimatePresence mode="wait">
          {displayedProducts.length > 0 ? (
            <motion.div
              key={`${mainTab}-${beansSubTab}-${selectedSeries}-${selectedFlavor}-${searchQuery}-${sortBy}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {displayedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : Math.min(index * 0.07, 0.28), ease: [0.22, 1, 0.36, 1] }}
                >
                  <EditorialProductCard
                    product={product}
                    isBeverageMode={mainTab === 'slowbar'}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 border-y border-black/10 py-20 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-on-surface-variant">
                <Search size={22} aria-hidden="true" />
              </div>
              <h3 className="font-headline text-2xl font-semibold tracking-tight text-brand-charcoal">
                {mainTab === 'slowbar' ? 'Menu pada kelompok ini belum tersedia.' : 'Tidak ada kopi yang sesuai filter.'}
              </h3>
              <p className="mx-auto max-w-md text-sm text-on-surface-variant">
                {mainTab === 'slowbar' ? 'Dataset owner belum memuat item published untuk kombinasi ini. Tidak ada menu atau harga sementara yang ditampilkan.' : 'Coba sesuaikan kata kunci pencarian atau tampilkan kembali seluruh pilihan kopi 52 Coffee.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-2 border-b border-brand-charcoal pb-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-charcoal hover:border-brand-maroon hover:text-brand-maroon focus-visible:outline-none"
                >
                  <RotateCcw size={12} aria-hidden="true" />
                  Tampilkan semua kopi
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        {visibleCount < filteredProducts.length && (
          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="border border-brand-charcoal bg-transparent px-8 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-charcoal transition-all hover:bg-brand-charcoal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon"
            >
              Lihat {Math.min(4, filteredProducts.length - visibleCount)} kopi berikutnya
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
