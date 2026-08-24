'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { PRODUCTS, CoffeeProduct, formatRupiah } from '../lib/data';
import { useCartStore } from '../lib/store/useCartStore';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          p.process.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.tastingNotes.some((n) => n.toLowerCase().includes(q))
        );
      })
    : PRODUCTS.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian Biji Kopi"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-border-subtle overflow-hidden z-10 animate-slide-up"
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center gap-3 bg-surface-container-low/60">
          <Search className="w-5 h-5 text-brand-navy shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari biji kopi (misal: Argopuro, Ijen, Strawberry, Geisha, Peach)..."
            className="w-full bg-transparent text-sm sm:text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-on-surface-variant hover:text-on-surface"
              aria-label="Hapus kata kunci"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono px-2 py-1 bg-white rounded-lg border border-border-subtle text-on-surface-variant hover:text-on-surface shadow-xs"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant px-1">
            <span>
              {query ? `Hasil Pencarian (${filtered.length})` : 'Rekomendasi Biji Kopi Populer'}
            </span>
            <span className="text-[11px] text-brand-maroon font-medium">@52coffeeroastery</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant text-xs space-y-2">
              <p>Tidak ada biji kopi yang cocok dengan &quot;{query}&quot;.</p>
              <p className="text-[11px]">Coba cari dengan kata kunci rasa: fruity, floral, chocolate, atau honey.</p>
            </div>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                className="p-3.5 rounded-2xl border border-border-subtle bg-white hover:border-brand-navy/30 hover:bg-surface-container-low/40 transition-all flex items-center justify-between gap-3 group"
              >
                <Link
                  href={`/catalog/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3.5 min-w-0 flex-1"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-border-subtle">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="56px"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-brand-pill text-brand-navy font-mono text-[9px] font-bold uppercase">
                        {product.process}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant">
                        {product.series}
                      </span>
                    </div>
                    <h4 className="font-editorial text-sm font-bold text-brand-navy group-hover:text-brand-maroon truncate mt-0.5">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant truncate">
                      Notes: {product.tastingNotes.join(', ')}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-brand-navy block">
                      {formatRupiah(product.basePrice)}
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant">
                      / {product.defaultWeight}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const v = product.variants[0];
                      addItem({
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        imageUrl: product.imageUrl,
                        weightGrams: v.weightGrams,
                        weightLabel: v.weightLabel,
                        grind: 'whole',
                        grindLabel: 'Whole Beans',
                        unitPrice: v.price,
                        quantity: 1,
                        series: product.series,
                        tastingNotes: product.tastingNotes,
                      });
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white transition-colors shadow-sm cursor-pointer"
                    title="Tambah ke Keranjang"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-surface-container-low border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-on-surface-variant px-4">
          <Link
            href="/catalog"
            onClick={onClose}
            className="hover:text-brand-maroon flex items-center gap-1 font-semibold text-brand-navy"
          >
            <span>Lihat Seluruh Katalog</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
          <span>Tekan ESC untuk menutup</span>
        </div>
      </div>
    </div>
  );
}
