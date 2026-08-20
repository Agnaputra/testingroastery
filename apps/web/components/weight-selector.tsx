'use client';

import React from 'react';
import { ProductVariant, formatRupiah } from '../lib/data';
import { Check } from 'lucide-react';

interface WeightSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant;
  onSelectVariant: (variant: ProductVariant) => void;
}

export function WeightSelector({
  variants,
  selectedVariant,
  onSelectVariant,
}: WeightSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-roastery-muted">
          Pilihan Gramasi / Ukuran:
        </label>
        <span className="text-xs font-mono font-medium text-roastery-crimson">
          {selectedVariant.weightLabel} — {formatRupiah(selectedVariant.price)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {variants.map((variant) => {
          const isSelected = selectedVariant.weightGrams === variant.weightGrams;
          const pricePerGram = Math.round(variant.price / variant.weightGrams);

          return (
            <button
              key={variant.weightGrams}
              type="button"
              onClick={() => onSelectVariant(variant)}
              className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'border-roastery-crimson bg-roastery-crimson/5 ring-1 ring-roastery-crimson shadow-sm'
                  : 'border-roastery-border bg-white hover:border-roastery-slate/40 hover:bg-roastery-light/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-sm font-bold ${
                    isSelected ? 'text-roastery-crimson' : 'text-roastery-dark'
                  }`}
                >
                  {variant.weightLabel}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-roastery-crimson text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-col">
                <span className="font-mono text-xs font-semibold text-roastery-dark">
                  {formatRupiah(variant.price)}
                </span>
                <span className="text-[10px] font-mono text-roastery-muted">
                  Rp {pricePerGram}/gram
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
