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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle handled outside or if already open
      }
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-roastery-dark/70 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-roastery-card rounded-2xl shadow-2xl border border-roastery-border overflow-hidden z-10 animate-slide-up">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-roastery-border flex items-center gap-3 bg-roastery-light/60">
          <Search className="w-5 h-5 text-roastery-crimson shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari biji kopi (misal: Argopuro, Ijen, Strawberry, Geisha, Peach)..."
            className="w-full bg-transparent text-sm sm:text-base text-roastery-dark placeholder:text-roastery-muted focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-roastery-muted hover:text-roastery-dark"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-mono px-2 py-1 bg-white rounded border border-roastery-border text-roastery-muted hover:text-roastery-dark"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-roastery-muted px-1">
            <span>
              {query ? `Hasil Pencarian (${filtered.length})` : 'Rekomendasi Biji Kopi Populer'}
            </span>
            <span className="text-[11px] text-roastery-crimson font-medium">@52coffeeroastery</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-roastery-muted text-xs space-y-2">
              <p>Tidak ada biji kopi yang cocok dengan &quot;{query}&quot;.</p>
              <p className="text-[11px]">Coba cari dengan kata kunci rasa: fruity, floral, chocolate, atau honey.</p>
            </div>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-xl border border-roastery-border bg-white hover:border-roastery-slate/40 hover:bg-roastery-light/40 transition-all flex items-center justify-between gap-3 group"
              >
                <Link
                  href={`/catalog/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0 flex-1"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-roastery-light shrink-0 border border-roastery-border">
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
                      <span className="badge-slate text-[9px] py-0 px-1.5 font-mono">
                        {product.process}
                      </span>
                      <span className="text-[10px] font-mono text-roastery-muted">
                        {product.series}
                      </span>
                    </div>
                    <h4 className="font-editorial text-sm font-bold text-roastery-dark group-hover:text-roastery-crimson truncate mt-0.5">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-roastery-muted truncate">
                      Notes: {product.tastingNotes.join(', ')}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-roastery-dark block">
                      {formatRupiah(product.basePrice)}
                    </span>
                    <span className="text-[10px] font-mono text-roastery-muted">
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
                    className="p-2 rounded-lg bg-roastery-crimson hover:bg-roastery-dark text-white transition-colors shadow-sm"
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
        <div className="p-3 bg-roastery-light/80 border-t border-roastery-border flex items-center justify-between text-[11px] font-mono text-roastery-muted px-4">
          <Link
            href="/catalog"
            onClick={onClose}
            className="hover:text-roastery-crimson flex items-center gap-1 font-semibold text-roastery-charcoal"
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
