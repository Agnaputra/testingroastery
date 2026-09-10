'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Check } from 'lucide-react';
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
      <article className="group relative min-w-0 bg-white border border-border-subtle hover:border-brand-navy/40 transition-colors duration-200 p-4 sm:p-5 flex flex-col justify-between rounded-xl overflow-hidden">
        {/* Top Badges */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
          <span className="text-brand-maroon font-semibold">
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
        <Link href={detailUrl} className="relative w-full aspect-[6/5] mx-auto my-4 flex items-center justify-center overflow-hidden rounded-lg bg-surface-container-low">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            width={300}
            height={250}
            className="w-full h-full object-contain mix-blend-multiply motion-safe:group-hover:scale-[1.04] transition-transform duration-300 ease-out"
          />
        </Link>

        {/* Content Info (Clean & Concise for 4-column Grid) */}
        <div className="w-full space-y-2 mt-auto pt-2 border-t border-border-subtle/70">
          {/* Origin Subtitle */}
          <div className="text-xs text-on-surface-variant truncate">
            {product.origin}
          </div>

          {/* Title */}
          <Link href={detailUrl} className="block">
            <h3 className="font-editorial text-lg font-semibold tracking-tight text-brand-navy min-h-[3.5rem] leading-7">
              {isCup && product.slowbarAlias ? product.slowbarAlias : product.name}
            </h3>
            {isCup && product.slowbarAlias && (
              <p className="text-[11px] text-on-surface-variant font-mono truncate mt-0.5">
                {product.name}
              </p>
            )}
          </Link>

          {/* Tasting Notes (Color-coded Sensory Tag Badges) */}
          <div className="flex min-h-10 flex-wrap items-center gap-1.5 py-1">
            {product.tastingNotes.slice(0, 2).map((note) => (
              <SensoryTag key={note} note={note} size="sm" />
            ))}
          </div>

          {/* Bottom Row: Price & Quick Action */}
          <div className="flex flex-wrap gap-3 items-center justify-between pt-4 border-t border-border-subtle/70">
            <div className="font-mono">
              {isCup ? (
                <div className="text-brand-maroon font-bold text-sm sm:text-base leading-none">
                  {formatRupiah(product.cupPrice || product.basePrice)}
                  <span className="text-xs font-normal text-on-surface-variant block mt-1">/ cangkir</span>
                </div>
              ) : (
                <div className="text-brand-navy font-bold text-sm sm:text-base leading-none">
                  {formatRupiah(product.basePrice)}
                  <span className="text-xs font-normal text-on-surface-variant block mt-1">/ {product.defaultWeight}</span>
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
                className="icon-button rounded-lg bg-white hover:bg-surface-container-low text-brand-navy border border-border-subtle"
                aria-label={`Lihat ringkasan ${product.name}`}
                title="Lihat ringkasan"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDirectAdd}
                className="icon-button rounded-lg bg-brand-navy text-white hover:bg-brand-navy-light"
                aria-label={added ? `${product.name} ditambahkan` : `Tambah ${product.name} ke keranjang`}
                title={isCup ? 'Pesan Cup' : 'Tambah ke Keranjang'}
              >
                {added ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </article>

      <QuickViewModal
        product={quickViewOpen ? product : null}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
