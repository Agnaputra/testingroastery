'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Plus, Check } from 'lucide-react';
import { CoffeeProduct, formatRupiah, getCustomerProductName, getProductDisplayImage } from '../lib/data';
import { QuickViewModal } from './quick-view-modal';
import { useCartStore } from '../lib/store/useCartStore';

interface EditorialProductCardProps {
  product: CoffeeProduct;
  isBeverageMode?: boolean;
}

export function EditorialProductCard({
  product,
  isBeverageMode = false,
}: EditorialProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const isCup = isBeverageMode && !!product.cupPrice;
  const displayName = getCustomerProductName(product);
  const detailUrl = `/catalog/${product.slug}?mode=${isCup ? 'cup' : 'beans'}`;

  const handleDirectAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    addItem({
      productId: product.id,
      name: displayName,
      slug: product.slug,
      imageUrl: product.imageUrl,
      weightGrams: isCup ? 1 : defaultVariant?.weightGrams || 100,
      weightLabel: isCup
        ? '1 sajian'
        : defaultVariant?.weightLabel || product.defaultWeight,
      grind: 'whole',
      grindLabel: isCup ? 'Seduhan manual' : 'Biji utuh',
      unitPrice: isCup
        ? product.cupPrice || product.basePrice
        : product.basePrice,
      quantity: 1,
      series: product.series,
      tastingNotes: product.tastingNotes,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <article className="group min-w-0 flex flex-col justify-between bg-white border border-border-subtle rounded-md p-3 transition-shadow hover:shadow-sm">
        <div>
          {/* Product media fills the frame so no empty white gutter remains. */}
          <div className="relative overflow-hidden bg-surface-container-low rounded-xs">
            <Link
              href={detailUrl}
              className="relative block aspect-[4/5] w-full overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon"
            >
              <Image
                src={getProductDisplayImage(product)}
                alt={`Kemasan ${displayName}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.025]"
              />
            </Link>

            {/* Quick action buttons on hover / accessible focus */}
            <div className="absolute inset-x-3 bottom-3 flex translate-y-0 items-center gap-2 opacity-100 transition-all duration-300 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  setQuickViewOpen(true);
                }}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xs bg-white/95 px-3 text-[11px] font-semibold text-brand-charcoal shadow-xs backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon"
                aria-label={`Lihat ringkasan ${displayName}`}
              >
                <Eye size={15} aria-hidden="true" />
                Lihat cepat
              </button>
              <button
                type="button"
                onClick={handleDirectAdd}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-xs bg-brand-navy px-3 text-white shadow-xs transition-colors hover:bg-brand-navy-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon"
                aria-label={
                  added
                    ? `${displayName} telah ditambahkan ke keranjang`
                    : `Tambah ${displayName} ke keranjang`
                }
                title={isCup ? 'Pilih sajian' : 'Tambah ke keranjang'}
              >
                {added ? (
                  <Check size={16} className="text-brand-teal-light" />
                ) : (
                  <Plus size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Simple, clean editorial metadata */}
          <div className="pt-3">
            <div className="flex items-center justify-between gap-3 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
              <span className="truncate">{product.series}</span>
              <span className="shrink-0">
                {isCup ? 'Slowbar' : product.defaultWeight}
              </span>
            </div>

            <Link
              href={detailUrl}
              className="mt-1.5 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon"
            >
              <h3 className="font-headline text-lg font-semibold leading-snug tracking-[-0.02em] text-brand-charcoal transition-colors group-hover:text-brand-maroon line-clamp-1">
                {displayName}
              </h3>
            </Link>

            <p className="mt-1 truncate text-xs text-on-surface-variant">
              {product.origin}
            </p>

            <p className="mt-1 text-xs text-brand-charcoal/80 leading-relaxed line-clamp-1">
              {product.tastingNotes.slice(0, 3).join(' · ')}
            </p>
          </div>
        </div>

        {/* Clean price display */}
        <div className="mt-3 border-t border-border-subtle pt-2.5">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-xs font-semibold text-brand-charcoal">
              {formatRupiah(
                isCup ? product.cupPrice || product.basePrice : product.basePrice
              )}
              {!isCup && (
                <span className="ml-1 font-normal text-on-surface-variant">
                  / {product.defaultWeight}
                </span>
              )}
            </p>
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-maroon opacity-0 transition-opacity group-hover:opacity-100">
              Pilih &rarr;
            </span>
          </div>
          {isCup && (
            <p className="mt-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-teal">
              Hanya bisa dinikmati di lokasi
            </p>
          )}
        </div>
      </article>

      <QuickViewModal
        product={quickViewOpen ? product : null}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
