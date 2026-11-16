'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw, Search } from 'lucide-react';
import type { CoffeeProduct } from '../../lib/data';
import { EditorialProductCard } from './editorial-product-card';


export function ProductGrid({
  displayedProducts,
  mainTab,
  beansSubTab,
  selectedSeries,
  selectedFlavor,
  searchQuery,
  sortBy,
  reducedMotion,
  publicationUnavailable,
  resetAllFilters,
}: {
  displayedProducts: CoffeeProduct[];
  mainTab: 'beans' | 'slowbar' | 'glassware' | 'machine';
  beansSubTab: 'filter' | 'espresso';
  selectedSeries: string;
  selectedFlavor: string;
  searchQuery: string;
  sortBy: 'name' | 'price-asc' | 'price-desc';
  reducedMotion: boolean | null;
  publicationUnavailable: boolean;
  resetAllFilters: () => void;
}) {
  return (<>
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
            {publicationUnavailable ? 'Status katalog sedang tidak tersedia.' : mainTab === 'slowbar' ? 'Menu pada kelompok ini belum tersedia.' : 'Tidak ada kopi yang sesuai filter.'}
          </h3>
          <p className="mx-auto max-w-md text-sm text-on-surface-variant">
            {publicationUnavailable ? 'Coba muat ulang halaman setelah layanan katalog pulih.' : mainTab === 'slowbar' ? 'Dataset owner belum memuat item published untuk kombinasi ini. Tidak ada menu atau harga sementara yang ditampilkan.' : 'Coba sesuaikan kata kunci pencarian atau tampilkan kembali seluruh pilihan kopi 52 Coffee.'}
          </p>
          {!publicationUnavailable && <div className="pt-2">
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-2 border-b border-brand-charcoal pb-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-charcoal hover:border-brand-maroon hover:text-brand-maroon focus-visible:outline-none"
            >
              <RotateCcw size={12} aria-hidden="true" />
              Tampilkan semua kopi
            </button>
          </div>}
        </motion.div>
      )}
    </AnimatePresence>


  </>);
}
