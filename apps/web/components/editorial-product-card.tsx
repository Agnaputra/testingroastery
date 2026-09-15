'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Plus, Check } from 'lucide-react';
import { CoffeeProduct, formatRupiah } from '../lib/data';
import { QuickViewModal } from './quick-view-modal';
import { useCartStore } from '../lib/store/useCartStore';

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
      name: isCup ? `${product.slowbarAlias || product.name} (Cangkir slowbar)` : product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      weightGrams: isCup ? 1 : (defaultVariant?.weightGrams || 100),
      weightLabel: isCup ? '1 cangkir' : (defaultVariant?.weightLabel || product.defaultWeight),
      grind: 'whole',
      grindLabel: isCup ? 'Seduhan manual' : 'Biji utuh',
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
      <article className="group min-w-0">
        <div className="relative overflow-hidden bg-[#ecece8]">
          <Link href={detailUrl} className="relative block aspect-[4/5] w-full overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-[9%] mix-blend-multiply transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.035]"
            />
          </Link>

          <div className="absolute inset-x-3 bottom-3 flex translate-y-0 items-center gap-2 opacity-100 transition-all duration-300 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                setQuickViewOpen(true);
              }}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 bg-white/95 px-3 text-[11px] font-semibold text-brand-charcoal shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
              aria-label={`Lihat ringkasan ${product.name}`}
            >
              <Eye size={15} aria-hidden="true" />
              Lihat cepat
            </button>
            <button
              type="button"
              onClick={handleDirectAdd}
              className="flex min-h-11 min-w-11 items-center justify-center bg-brand-navy px-3 text-white shadow-sm transition-colors hover:bg-brand-navy-light"
              aria-label={added ? `${product.name} ditambahkan` : `Tambah ${product.name} ke keranjang`}
              title={isCup ? 'Pesan cangkir' : 'Tambah ke keranjang'}
            >
              {added ? <Check size={16} className="text-brand-teal-light" /> : <Plus size={16} />}
            </button>
          </div>
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between gap-3 font-mono text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant">
            <span className="truncate">{product.series}</span>
            <span className="shrink-0">{isCup ? 'Per cangkir' : product.defaultWeight}</span>
          </div>

          <Link href={detailUrl} className="mt-2 block">
            <h3 className="font-headline text-xl font-semibold leading-tight tracking-[-0.025em] text-brand-charcoal transition-colors group-hover:text-brand-maroon">
              {isCup && product.slowbarAlias ? product.slowbarAlias : product.name}
            </h3>
            {isCup && product.slowbarAlias && (
              <p className="mt-1 truncate font-mono text-[10px] text-on-surface-variant">
                {product.name}
              </p>
            )}
          </Link>

          <p className="mt-2 truncate text-xs text-on-surface-variant">{product.origin}</p>
          <p className="mt-1 min-h-10 text-sm leading-5 text-brand-charcoal/75">
            {product.tastingNotes.slice(0, 3).join(', ')}
          </p>

          <p className="mt-3 font-mono text-xs font-semibold text-brand-charcoal">
            {formatRupiah(isCup ? (product.cupPrice || product.basePrice) : product.basePrice)}
            <span className="ml-1 font-normal text-on-surface-variant">
              / {isCup ? 'cangkir' : product.defaultWeight}
            </span>
          </p>
        </div>
      </article>

      <QuickViewModal
        product={quickViewOpen ? product : null}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
