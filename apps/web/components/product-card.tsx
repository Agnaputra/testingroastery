'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Eye, ShoppingBag, Sparkles } from 'lucide-react';
import { CoffeeProduct, formatRupiah } from '../lib/data';
import { QuickViewModal } from './quick-view-modal';

interface ProductCardProps {
  product: CoffeeProduct;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  return (
    <>
      <div
        className={`group editorial-card flex flex-col justify-between bg-white border border-border-subtle hover:border-brand-navy/30 transition-all duration-300 hover:shadow-lg rounded-2xl overflow-hidden ${
          featured ? 'ring-1 ring-brand-maroon/30 shadow-md' : ''
        }`}
      >
        <div>
          {/* Image Container with Clean Badges */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-low">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Top Badge (Single Primary Pill) */}
            <div className="absolute top-3 left-3 z-10">
              {product.badge ? (
                <span className="px-2.5 py-1 rounded-full bg-brand-maroon text-white font-mono text-[10px] font-bold tracking-wider shadow-sm uppercase">
                  {product.badge}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-brand-navy/90 backdrop-blur-sm text-white font-mono text-[10px] font-semibold tracking-wider border border-white/10 shadow-sm uppercase">
                  {product.category === 'reserve' ? 'Grand Reserve' : product.categoryLabel}
                </span>
              )}
            </div>

            {/* Top Right Slowbar Alias Pill */}
            {product.slowbarAlias && (
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-brand-navy font-mono text-[10px] font-bold tracking-wider border border-border-subtle shadow-sm uppercase">
                  {product.slowbarAlias}
                </span>
              </div>
            )}

            {/* Quick Action Overlay for Desktop */}
            <div className="absolute inset-0 bg-brand-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center gap-3 p-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="p-3 rounded-full bg-white text-brand-navy hover:bg-brand-navy hover:text-white transition-all shadow-lg hover:scale-105"
                title="Quick View & Pilih Ukuran"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="p-3 rounded-full bg-brand-navy text-white hover:bg-brand-navy-light transition-all shadow-lg hover:scale-105"
                title="Pilih Gramasi & Masukkan ke Keranjang"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-3">
            {/* Origin & Altitude Metadata Row */}
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-on-surface-variant border-b border-border-subtle/80 pb-2.5">
              <span className="truncate font-medium">{product.origin}</span>
              <span className="shrink-0 font-semibold text-brand-navy-light">{product.altitude}</span>
            </div>

            {/* Process & Roast Subtitle */}
            <div className="flex items-center gap-1.5 text-xs text-brand-navy-light font-mono">
              <span className="text-brand-maroon font-bold uppercase tracking-wider text-[11px]">
                {product.roastLevel} Roast
              </span>
              <span className="text-border-subtle">•</span>
              <span className="truncate text-[11px] text-on-surface-variant font-sans">
                {product.process}
              </span>
            </div>

            {/* Title */}
            <Link href={`/catalog/${product.slug}`} className="block">
              <h3 className="font-editorial text-base sm:text-lg font-bold text-brand-navy group-hover:text-brand-teal transition-colors line-clamp-2 leading-snug min-h-[2.75rem]">
                {product.name}
              </h3>
            </Link>

            {/* Tasting Notes Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {product.tastingNotes.slice(0, 3).map((note) => (
                <span
                  key={note}
                  className="text-[11px] font-sans px-2.5 py-0.5 rounded-md bg-brand-pill border border-border-subtle/80 text-brand-navy font-medium"
                >
                  {note}
                </span>
              ))}
            </div>

            {/* Short Excerpt */}
            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed min-h-[2rem]">
              {product.description}
            </p>
          </div>
        </div>

        {/* Footer Card: Pricing & Action */}
        <div className="px-5 pb-5 pt-3 border-t border-border-subtle flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-on-surface-variant tracking-wider">
              Mulai dari
            </span>
            <span className="font-mono text-sm font-bold text-brand-navy">
              {formatRupiah(product.basePrice)}
              <span className="text-xs font-normal text-on-surface-variant"> / {product.defaultWeight}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuickViewOpen(true)}
              className="sm:hidden p-2 rounded-lg bg-surface-container-low text-brand-navy hover:bg-brand-pill border border-border-subtle"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <Link
              href={`/catalog/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:text-brand-teal font-sans transition-colors"
            >
              <span>Pilih Ukuran</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewOpen ? product : null}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}

