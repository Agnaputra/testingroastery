'use client';

import React from 'react';
import { X } from 'lucide-react';
import { PRODUCTS } from '../../../lib/data';
import { ACTIVE_CATALOG_MAPPING, OwnerCatalogProduct } from '../../../lib/catalog-master';
import { PRICE_TEST_MODE } from '../../../lib/catalog-publication';

interface AdminPriceModalProps {
  editingProduct: OwnerCatalogProduct | null;
  onClose: () => void;
  onSave: () => void;
  price100g: string;
  setPrice100g: (val: string) => void;
  price200g: string;
  setPrice200g: (val: string) => void;
  price500g: string;
  setPrice500g: (val: string) => void;
  priceCup: string;
  setPriceCup: (val: string) => void;
  editingSlug: string;
  editingAmounts: Record<string, string>;
  setEditingAmounts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  effectivePrices: Record<string, { amountIdr: number }>;
  priceRevision: number | null;
  priceError: string;
  onSelectPriceProfile: (slug: string, prices: Record<string, { amountIdr: number }>) => void;
}

export function AdminPriceModal({
  editingProduct,
  onClose,
  onSave,
  price100g,
  setPrice100g,
  price200g,
  setPrice200g,
  price500g,
  setPrice500g,
  priceCup,
  setPriceCup,
  editingSlug,
  editingAmounts,
  setEditingAmounts,
  effectivePrices,
  priceRevision,
  priceError,
  onSelectPriceProfile,
}: AdminPriceModalProps) {
  if (!editingProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl border border-border-subtle p-6 shadow-xl space-y-5 animate-in fade-in-0 duration-150">
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div>
            <h3 className="font-headline font-bold text-base text-brand-charcoal">
              Edit Harga Produk
            </h3>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              {editingProduct.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-on-surface-variant hover:bg-slate-100 hover:text-brand-charcoal transition-colors"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>
        </div>

        {PRICE_TEST_MODE ? (
          <div className="space-y-3 font-mono text-xs">
            <p className="text-on-surface-variant">Harga efektif dalam Rupiah penuh. Revisi {priceRevision ?? 'belum terverifikasi'}.</p>
            {ACTIVE_CATALOG_MAPPING.filter((mapping) => mapping.masterRow === editingProduct.sourceRow).length > 1 && (
              <select
                value={editingSlug}
                onChange={(event) => onSelectPriceProfile(event.target.value, effectivePrices)}
                className="w-full border border-border-subtle bg-slate-50/70 p-2 rounded-md font-sans text-xs focus:border-brand-navy focus:bg-white focus:outline-none"
                aria-label="Pilih profil produk"
              >
                {ACTIVE_CATALOG_MAPPING.filter((mapping) => mapping.masterRow === editingProduct.sourceRow).map((mapping) => {
                  const product = PRODUCTS.find((item) => item.id === mapping.webId);
                  return product ? (
                    <option key={mapping.webId} value={product.slug}>
                      {product.name} ({mapping.profileType})
                    </option>
                  ) : null;
                })}
              </select>
            )}
            {Object.entries(editingAmounts).map(([sku, amount]) => (
              <label key={sku} className="block">
                <span className="block mb-1 text-on-surface-variant font-medium text-[11px]">{sku.split(':').slice(-2).join(' ')} — Rupiah penuh</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) => setEditingAmounts((current) => ({ ...current, [sku]: event.target.value }))}
                  className="w-full rounded-md border border-border-subtle bg-slate-50/70 p-2 text-sm font-semibold tabular-nums focus:border-brand-navy focus:bg-white focus:outline-none"
                />
              </label>
            ))}
            {priceError && <p role="alert" className="text-brand-maroon font-semibold">{priceError}</p>}
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
                Kemasan 100g (Rupiah penuh, misal 65000)
              </label>
              <input
                type="text"
                value={price100g}
                onChange={(e) => setPrice100g(e.target.value)}
                placeholder="65000"
                className="w-full rounded-md border border-border-subtle bg-slate-50/70 p-2 text-sm font-semibold text-brand-charcoal tabular-nums focus:border-brand-navy focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
                Kemasan 200g (Rupiah penuh, misal 120000)
              </label>
              <input
                type="text"
                value={price200g}
                onChange={(e) => setPrice200g(e.target.value)}
                placeholder="120000"
                className="w-full rounded-md border border-border-subtle bg-slate-50/70 p-2 text-sm font-semibold text-brand-charcoal tabular-nums focus:border-brand-navy focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
                Kemasan 500g (Rupiah penuh, misal 300000)
              </label>
              <input
                type="text"
                value={price500g}
                onChange={(e) => setPrice500g(e.target.value)}
                placeholder="300000"
                className="w-full rounded-md border border-border-subtle bg-slate-50/70 p-2 text-sm font-semibold text-brand-charcoal tabular-nums focus:border-brand-navy focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
                Cangkir Slowbar (Rupiah penuh, misal 38000)
              </label>
              <input
                type="text"
                value={priceCup}
                onChange={(e) => setPriceCup(e.target.value)}
                placeholder="38000"
                className="w-full rounded-md border border-border-subtle bg-slate-50/70 p-2 text-sm font-semibold text-brand-charcoal tabular-nums focus:border-brand-navy focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border-subtle bg-white px-3.5 py-2 font-mono text-xs font-medium text-brand-charcoal hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={PRICE_TEST_MODE && (priceRevision === null || Boolean(priceError))}
            className="rounded-md bg-brand-navy px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-brand-navy-dark transition-colors disabled:opacity-50"
          >
            Simpan Harga
          </button>
        </div>
      </div>
    </div>
  );
}
