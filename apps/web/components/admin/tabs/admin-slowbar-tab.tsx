'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { OWNER_SLOWBAR_ITEMS } from '../../../lib/catalog-master';

interface AdminSlowbarTabProps {
  slowbarOutOfStock: Set<string>;
  onToggleSlowbarStock: (alias: string) => void;
}

export function AdminSlowbarTab({
  slowbarOutOfStock,
  onToggleSlowbarStock,
}: AdminSlowbarTabProps) {
  const [search, setSearch] = useState('');

  const filteredItems = useMemo(() => {
    return OWNER_SLOWBAR_ITEMS.filter((item) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        item.alias.toLowerCase().includes(q) ||
        item.baseBean.toLowerCase().includes(q) ||
        item.series.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const readyCount = OWNER_SLOWBAR_ITEMS.length - slowbarOutOfStock.size;

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="rounded-xl border border-border-subtle bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-headline text-base font-bold text-brand-charcoal">
              Ketersediaan Seduh Slowbar (33 Menu)
            </h2>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Sakelar ketersediaan harian biji kopi manual brew untuk barista di bar.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {readyCount} Tersedia
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              {slowbarOutOfStock.size} Habis
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari menu slowbar, alias, atau origin..."
            className="h-9 w-full rounded-md border border-border-subtle bg-slate-50/70 pl-9 pr-3 text-xs text-brand-charcoal placeholder:text-on-surface-variant focus:border-brand-navy focus:bg-white focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid of Menu Tiles (Apple Home / Tile style) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((item) => {
          const isOut = slowbarOutOfStock.has(item.alias);

          return (
            <div
              key={item.alias}
              className={`rounded-xl p-4 border transition-all duration-150 flex flex-col justify-between shadow-xs ${
                isOut
                  ? 'border-border-subtle bg-slate-50/80 opacity-75'
                  : 'border-border-subtle bg-white hover:border-brand-navy/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-on-surface-variant font-medium">
                    {item.series}
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-charcoal tabular-nums">
                    Rp{item.cupPrice}k
                  </span>
                </div>

                <h3 className="mt-2 font-headline font-bold text-base text-brand-charcoal">
                  {item.alias}
                </h3>
                <p className="mt-0.5 text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                  {item.baseBean}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
                <span className="text-[11px] font-mono text-on-surface-variant">
                  Status Meja:
                </span>
                <button
                  type="button"
                  onClick={() => onToggleSlowbarStock(item.alias)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-mono text-[11px] font-semibold transition-colors ${
                    isOut
                      ? 'border border-border-subtle bg-white text-slate-600 hover:bg-slate-50'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOut ? 'bg-slate-400' : 'bg-emerald-500'
                    }`}
                  />
                  <span>{isOut ? 'Habis (Klik Aktifkan)' : 'Tersedia di Bar'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
