'use client';

import { RotateCcw, Search, X } from 'lucide-react';
import type React from 'react';
import type { CoffeeProduct } from '../../lib/data';

const FLAVOR_PROFILES = [
  { id: 'all', label: 'Semua profil' },
  { id: 'Fruity', label: 'Fruity' },
  { id: 'Floral', label: 'Floral' },
  { id: 'Sweet', label: 'Sweet' },
  { id: 'Chocolaty', label: 'Chocolaty' },
  { id: 'Nutty', label: 'Nutty' },
] as const;
export function CatalogFilters({
  selectedFlavor,
  setSelectedFlavor,
  setVisibleCount,
  searchQuery,
  setSearchQuery,
  selectedSeries,
  setSelectedSeries,
  allSeriesList,
  sortBy,
  setSortBy,
  displayedProducts,
  filteredProducts,
  hasActiveFilters,
  resetAllFilters,
}: {
  selectedFlavor: string;
  setSelectedFlavor: React.Dispatch<React.SetStateAction<string>>;
  setVisibleCount: React.Dispatch<React.SetStateAction<number>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedSeries: string;
  setSelectedSeries: React.Dispatch<React.SetStateAction<string>>;
  allSeriesList: string[];
  sortBy: 'name' | 'price-asc' | 'price-desc';
  setSortBy: React.Dispatch<React.SetStateAction<'name' | 'price-asc' | 'price-desc'>>;
  displayedProducts: CoffeeProduct[];
  filteredProducts: CoffeeProduct[];
  hasActiveFilters: boolean;
  resetAllFilters: () => void;
}) {
  return (<>
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
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon ${isActive
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


  </>);
}
