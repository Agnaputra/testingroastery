'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Eye, ShoppingBag } from 'lucide-react';
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
        className={`group editorial-card flex flex-col justify-between bg-roastery-card ${
          featured ? 'ring-1 ring-roastery-crimson/40 shadow-editorial' : ''
        }`}
      >
        <div>
          {/* Image Container with Badges */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-roastery-light">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
              {product.badge && (
                <span className="badge-crimson font-mono font-bold">
                  {product.badge}
                </span>
              )}
              <span className="badge-slate font-mono">
                {product.process}
              </span>
            </div>

            {/* Category Series tag on top right */}
            <div className="absolute top-3 right-3 z-10">
              <span className="px-2.5 py-0.5 rounded-full bg-roastery-dark/80 backdrop-blur-sm text-[10px] font-mono text-roastery-teal-light border border-white/10">
                {product.series}
              </span>
            </div>

            {/* Quick Action Overlay on Hover */}
            <div className="absolute inset-0 bg-roastery-dark/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="p-3 rounded-full bg-white text-roastery-dark hover:bg-roastery-crimson hover:text-white transition-all shadow-lg hover:scale-110"
                title="Quick View & Pilih Ukuran"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setQuickViewOpen(true);
                }}
                className="p-3 rounded-full bg-roastery-crimson text-white hover:bg-roastery-dark transition-all shadow-lg hover:scale-110"
                title="Pilih Gramasi & Masukkan ke Keranjang"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-3">
            {/* Origin & Altitude */}
            <div className="flex items-center justify-between text-xs text-roastery-muted font-mono">
              <span className="truncate max-w-[170px]">{product.origin}</span>
              <span>{product.altitude}</span>
            </div>

            {/* Title */}
            <Link href={`/catalog/${product.slug}`} className="block">
              <h3 className="font-editorial text-lg font-bold text-roastery-dark group-hover:text-roastery-crimson transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>

            {/* Tasting Notes Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.tastingNotes.map((note) => (
                <span
                  key={note}
                  className="text-[11px] font-sans px-2.5 py-0.5 rounded-md bg-roastery-light border border-roastery-border text-roastery-charcoal font-medium"
                >
                  {note}
                </span>
              ))}
            </div>

            {/* Short Excerpt */}
            <p className="text-xs text-roastery-muted line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        {/* Footer Card: Pricing & Action */}
        <div className="px-5 pb-5 pt-3 border-t border-roastery-border/70 flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-roastery-muted tracking-wider">
              Mulai dari
            </span>
            <span className="font-mono text-sm font-bold text-roastery-dark">
              {formatRupiah(product.basePrice)}
              <span className="text-xs font-normal text-roastery-muted"> / {product.defaultWeight}</span>
            </span>
          </div>

          <Link
            href={`/catalog/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-roastery-crimson group-hover:text-roastery-slate font-sans transition-colors"
          >
            <span>Pilih Ukuran</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
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
