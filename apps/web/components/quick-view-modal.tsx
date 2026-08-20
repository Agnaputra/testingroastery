'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check, ShoppingBag, Plus, Minus, ArrowRight, ExternalLink } from 'lucide-react';
import { CoffeeProduct, ProductVariant, GrindOption, GRIND_OPTIONS, formatRupiah } from '../lib/data';
import { WeightSelector } from './weight-selector';
import { GrindSelector } from './grind-selector';
import { useCartStore } from '../lib/store/useCartStore';

interface QuickViewModalProps {
  product: CoffeeProduct | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  if (!product) return null;

  return <QuickViewContent product={product} onClose={onClose} />;
}

function QuickViewContent({ product, onClose }: { product: CoffeeProduct; onClose: () => void }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [selectedGrind, setSelectedGrind] = useState<GrindOption>('whole');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  React.useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0]);
      setSelectedGrind('whole');
      setQuantity(1);
    }
  }, [product.id]);

  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    const grindLabel = GRIND_OPTIONS.find((g) => g.id === selectedGrind)?.label || 'Whole Beans';
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      weightGrams: selectedVariant.weightGrams,
      weightLabel: selectedVariant.weightLabel,
      grind: selectedGrind,
      grindLabel: grindLabel,
      unitPrice: selectedVariant.price,
      quantity: quantity,
      series: product.series,
      tastingNotes: product.tastingNotes,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-roastery-dark/70 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-roastery-card rounded-3xl shadow-2xl border border-roastery-border overflow-hidden z-10 animate-slide-up max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-roastery-border flex items-center justify-between bg-roastery-light/60">
          <div className="flex items-center gap-2 text-xs font-mono text-roastery-crimson uppercase">
            <span className="badge-slate">{product.process}</span>
            <span>{product.series}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-roastery-muted hover:text-roastery-dark hover:bg-roastery-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden bg-roastery-light shrink-0 border border-roastery-border">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-roastery-dark">
                {product.name}
              </h3>
              <p className="text-xs text-roastery-muted font-mono">
                {product.origin} • {product.altitude}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tastingNotes.map((note) => (
                  <span
                    key={note}
                    className="text-[11px] font-sans px-2.5 py-0.5 rounded-md bg-roastery-light border border-roastery-border text-roastery-charcoal font-semibold"
                  >
                    {note}
                  </span>
                ))}
              </div>

              <p className="text-xs text-roastery-muted leading-relaxed line-clamp-2 pt-1">
                {product.description}
              </p>

              <Link
                href={`/catalog/${product.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-mono text-roastery-crimson hover:underline pt-1"
              >
                <span>Lihat Panduan Seduh Lengkap & Cerita Origin</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Weight Variant Selector */}
          <div className="pt-2 border-t border-roastery-border">
            <WeightSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          </div>

          {/* Grind Size Selector */}
          <div className="pt-2 border-t border-roastery-border">
            <GrindSelector
              selectedGrind={selectedGrind}
              onSelectGrind={setSelectedGrind}
            />
          </div>
        </div>

        {/* Modal Footer / Add to Cart */}
        <div className="p-4 sm:p-5 border-t border-roastery-border bg-roastery-light/60 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-roastery-muted uppercase block">
              Total ({selectedVariant.weightLabel}):
            </span>
            <span className="font-mono text-xl font-bold text-roastery-dark">
              {formatRupiah(selectedVariant.price * quantity)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-roastery-border rounded-full bg-white p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 text-roastery-muted hover:text-roastery-dark rounded-full"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 font-mono text-xs font-bold text-roastery-dark min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1.5 text-roastery-muted hover:text-roastery-dark rounded-full"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-3 px-6 rounded-full font-medium text-xs flex items-center gap-2 transition-all shadow-sm ${
                isAdded
                  ? 'bg-roastery-teal text-white'
                  : 'bg-roastery-crimson hover:bg-roastery-dark text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Dimasukkan!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Tambah ke Keranjang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
