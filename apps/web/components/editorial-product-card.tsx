'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Plus, Check, Coffee } from 'lucide-react';
import { CoffeeProduct, formatRupiah } from '../lib/data';
import { QuickViewModal } from './quick-view-modal';
import { useCartStore } from '../lib/store/useCartStore';
import { SensoryTag } from './sensory-tag';

interface EditorialProductCardProps {
  product: CoffeeProduct;
  isBeverageMode?: boolean;
}

export function EditorialProductCard({ product, isBeverageMode = false }: EditorialProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const isCup = isBeverageMode && !!product.cupPrice;
  const detailUrl = `/catalog/${product.slug}?mode=${isCup ? 'cup' : 'beans'}`;

  const handleDirectAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    addItem({
      productId: product.id,
      name: isCup ? `${product.slowbarAlias || product.name} (Slowbar Cup)` : product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      weightGrams: isCup ? 1 : (defaultVariant?.weightGrams || 100),
      weightLabel: isCup ? '1 Cup' : (defaultVariant?.weightLabel || product.defaultWeight),
      grind: 'whole',
      grindLabel: isCup ? 'Manual Brew Cup' : 'Whole Beans',
      unitPrice: isCup ? (product.cupPrice || product.basePrice) : product.basePrice,
      quantity: 1,
      series: product.series,
      tastingNotes: product.tastingNotes,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <div className="group relative bg-[#F9FAFB] hover:bg-white border border-border-subtle hover:border-brand-navy/30 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between rounded-2xl overflow-hidden hover:shadow-xl">
        {/* Top Badges */}
        <div className="w-full flex items-center justify-between gap-1.5 text-[10px] font-mono mb-2">
          <span className="uppercase tracking-wider text-brand-maroon font-bold truncate max-w-[130px]">
            {product.series.replace(' Series', '')}
          </span>
          {isCup ? (
            <span className="px-2 py-0.5 rounded-full bg-brand-maroon/10 text-brand-maroon font-bold tracking-wider shrink-0">
              Slowbar Cup
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-brand-navy/10 text-brand-navy font-bold tracking-wider shrink-0">
              {product.defaultWeight}
            </span>
          )}
        </div>

        {/* Center: Studio Product Shot with Clean Hover Lift */}
        <Link href={detailUrl} className="relative w-full aspect-square max-w-[180px] mx-auto my-3 flex items-center justify-center block">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-108 group-hover:-translate-y-1 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Content Info (Clean & Concise for 4-column Grid) */}
        <div className="w-full space-y-2 mt-auto pt-2 border-t border-border-subtle/70">
          {/* Origin Subtitle */}
          <div className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider truncate">
            {product.origin}
          </div>

          {/* Title */}
          <Link href={detailUrl} className="block group-hover:text-brand-teal transition-colors">
            <h3 className="font-editorial text-base sm:text-lg font-bold tracking-tight text-brand-navy line-clamp-1 leading-snug">
              {isCup && product.slowbarAlias ? product.slowbarAlias : product.name}
            </h3>
            {isCup && product.slowbarAlias && (
              <p className="text-[11px] text-on-surface-variant font-mono truncate mt-0.5">
                {product.name}
              </p>
            )}
          </Link>

          {/* Tasting Notes (Color-coded Sensory Tag Badges) */}
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            {product.tastingNotes.slice(0, 2).map((note) => (
              <SensoryTag key={note} note={note} size="sm" />
            ))}
          </div>

          {/* Bottom Row: Price & Quick Action */}
          <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
            <div className="font-mono">
              {isCup ? (
                <div className="text-brand-maroon font-bold text-sm sm:text-base leading-none">
                  {formatRupiah(product.cupPrice || product.basePrice)}
                  <span className="text-[10px] font-normal text-on-surface-variant block mt-0.5">/ cangkir</span>
                </div>
              ) : (
                <div className="text-brand-navy font-bold text-sm sm:text-base leading-none">
                  {formatRupiah(product.basePrice)}
                  <span className="text-[10px] font-normal text-on-surface-variant block mt-0.5">/ pouch</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setQuickViewOpen(true);
                }}
                className="p-2 rounded-xl bg-white hover:bg-surface-container-low text-brand-navy border border-border-subtle transition-all text-xs font-bold shadow-xs hover:scale-105"
                title="Quick View Info"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDirectAdd}
                className="p-2 rounded-xl bg-brand-navy text-white hover:bg-brand-navy-light transition-all active:scale-90 shadow-xs hover:scale-105"
                title={isCup ? 'Pesan Cup' : 'Tambah ke Keranjang'}
              >
                {added ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickViewModal
        product={quickViewOpen ? product : null}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
