'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check, ShoppingBag, Plus, Minus, ArrowRight, ExternalLink } from 'lucide-react';
import { CoffeeProduct, ProductVariant, GrindOption, GRIND_OPTIONS, formatRupiah } from '../lib/data';
import { WeightSelector } from './weight-selector';
import { GrindSelector } from './grind-selector';
import { useCartStore } from '../lib/store/useCartStore';
import { SensoryTag } from './sensory-tag';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick View ${product.name}`}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-border-subtle overflow-hidden z-10 animate-slide-up max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface-container-low/60">
          <div className="flex items-center gap-2 text-xs font-mono text-brand-maroon uppercase">
            <span className="px-2 py-0.5 rounded-full bg-brand-pill text-brand-navy font-bold font-mono text-[9px]">
              {product.process}
            </span>
            <span className="font-bold">{product.series}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="relative w-full sm:w-44 aspect-square rounded-2xl overflow-hidden bg-surface-container-low shrink-0 border border-border-subtle">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-brand-navy">
                {product.name}
              </h3>
              <p className="text-xs text-on-surface-variant font-mono">
                {product.origin} • {product.altitude}
              </p>

              {/* Color-coded Sensory Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tastingNotes.map((note) => (
                  <SensoryTag key={note} note={note} size="sm" />
                ))}
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 pt-1">
                {product.description}
              </p>

              <Link
                href={`/catalog/${product.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1 text-xs font-mono font-bold text-brand-navy hover:text-brand-maroon transition-colors pt-1"
              >
                <span>Lihat Profil Sensorik SCA &amp; Story Origin</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Weight Variant Selector */}
          <div className="pt-2 border-t border-border-subtle">
            <WeightSelector
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          </div>

          {/* Grind Size Selector */}
          <div className="pt-2 border-t border-border-subtle">
            <GrindSelector
              selectedGrind={selectedGrind}
              onSelectGrind={setSelectedGrind}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-border-subtle bg-surface-container-low/60 flex items-center justify-between gap-4">
          <div className="font-mono">
            <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Harga Satuan</span>
            <span className="text-xl sm:text-2xl font-bold text-brand-navy">
              {formatRupiah(selectedVariant.price * quantity)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-border-subtle rounded-xl bg-white p-1 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-surface-container-low text-on-surface font-bold flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Kurangi"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center font-mono font-bold text-xs text-brand-navy">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-surface-container-low text-on-surface font-bold flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="Tambah"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              className="bg-brand-navy hover:bg-brand-navy-light text-white font-mono text-xs sm:text-sm font-bold py-3 px-5 sm:px-6 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Ditambahkan!</span>
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
