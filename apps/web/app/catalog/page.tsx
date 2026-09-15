'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coffee,
  RotateCcw,
} from 'lucide-react';
import { PRODUCTS, CoffeeProduct, getProductDisplayImage } from '../../lib/data';
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
    initialSeries || (initialCategory?.toLowerCase() === 'reserve' ? 'Grand Reserve' : 'all')
  );
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const category = initialCategory?.toLowerCase();
    setMainTab(category === 'beverages' || category === 'slowbar' ? 'slowbar' : 'beans');
    setBeansSubTab(category === 'espresso' ? 'espresso' : 'filter');
    setSelectedSeries(
      initialSeries || (category === 'reserve' ? 'Grand Reserve' : 'all')
    );
    setVisibleCount(12);
  }, [initialCategory, initialSeries]);

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
      return {
        ...p,
        imageUrl: getProductDisplayImage(p),
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
    <div className="min-h-screen bg-[#f7f7f4] pb-24 pt-[76px] text-brand-charcoal [&_button]:min-h-11">
      <section className="border-b border-black/10">
        <div className="site-container grid gap-8 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,.7fr)] lg:items-end lg:py-20">
          <div>
            <p className="mb-5 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-maroon">
              <Coffee size={14} aria-hidden="true" />
              Koleksi sangrai 52 Coffee
            </p>
            <h1 className="max-w-[13ch] font-headline text-[clamp(2.8rem,6.5vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-brand-charcoal">
              Temukan kopi yang terasa personal.
            </h1>
          </div>
          <div className="max-w-md lg:justify-self-end">
            <p className="text-sm leading-7 text-on-surface-variant sm:text-base">
              Jelajahi origin, proses, dan profil rasa yang disangrai untuk ritual seduh Anda.
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-black/15 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
              <span>{PRODUCTS.length} pilihan kopi</span>
              <span>Disangrai di Malang</span>
            </div>
          </div>
        </div>
      </section>
      <div className="site-container">
        <div className="flex flex-col gap-5 border-b border-black/10 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label="Jenis penyajian kopi" className="flex items-center gap-7">
            {([
              ['beans', 'Biji kopi'],
              ['slowbar', 'Slowbar'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mainTab === value}
                onClick={() => {
                  setMainTab(value);
                  setVisibleCount(12);
                }}
                className={`relative px-0 py-1 text-sm font-semibold transition-colors ${
                  mainTab === value
                    ? 'text-brand-charcoal'
                    : 'text-on-surface-variant hover:text-brand-charcoal'
                }`}
              >
                {label}
                {mainTab === value && (
                  <motion.span
                    layoutId="activeCatalogTabLine"
                    className="absolute inset-x-0 -bottom-[1.55rem] h-0.5 bg-brand-maroon"
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
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
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
                      setVisibleCount(12);
                    }}
                    className={`border-b py-1 transition-colors ${
                      beansSubTab === value
                        ? 'border-brand-maroon text-brand-maroon'
                        : 'border-transparent text-on-surface-variant hover:text-brand-charcoal'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-10 mt-8 grid gap-5 border-y border-black/10 py-5 md:grid-cols-[1fr_auto] md:items-end">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
            Menampilkan {displayedProducts.length} dari {filteredProducts.length} produk
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block min-w-0 sm:w-56">
              <span className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
                Series kopi
              </span>
              <select
                value={selectedSeries}
                onChange={(event) => {
                  setSelectedSeries(event.target.value);
                  setVisibleCount(12);
                }}
                className="min-h-11 w-full border-0 border-b border-black/20 bg-transparent px-0 pr-8 text-sm font-semibold text-brand-charcoal outline-none focus:border-brand-maroon focus:ring-0"
              >
                <option value="all">Semua series</option>
                {allSeriesList.map((series) => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </label>

            <label className="block min-w-0 sm:w-48">
              <span className="mb-2 block font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
                Urutkan
              </span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                className="min-h-11 w-full border-0 border-b border-black/20 bg-transparent px-0 pr-8 text-sm font-semibold text-brand-charcoal outline-none focus:border-brand-maroon focus:ring-0"
              >
                <option value="name">Nama A-Z</option>
                <option value="price-asc">Harga terendah</option>
                <option value="price-desc">Harga tertinggi</option>
              </select>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex min-h-0 w-fit items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-brand-maroon hover:underline md:col-start-2 md:justify-self-end"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Hapus filter
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {displayedProducts.length > 0 ? (
            <motion.div
              key={`${mainTab}-${beansSubTab}-${selectedSeries}-${sortBy}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-6"
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
              className="space-y-4 border-y border-black/10 py-24 text-center"
            >
              <h3 className="font-headline text-2xl font-semibold tracking-tight text-brand-charcoal">
                Tidak ada kopi pada pilihan ini.
              </h3>
              <p className="text-sm text-on-surface-variant">
                Pilih series lain atau tampilkan kembali seluruh koleksi.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="border-b border-brand-charcoal font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-charcoal"
              >
                Tampilkan semua
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {visibleCount < filteredProducts.length && (
          <div className="mt-16 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="border border-brand-charcoal bg-transparent px-7 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-charcoal transition-colors hover:bg-brand-charcoal hover:text-white"
            >
              Lihat {Math.min(8, filteredProducts.length - visibleCount)} kopi berikutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
