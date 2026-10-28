'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
} from 'lucide-react';
import { PRODUCTS, formatRupiah, getProductDisplayImage } from '../../../lib/data';
import { ACTIVE_CATALOG_MAPPING, OwnerCatalogProduct } from '../../../lib/catalog-master';
import { PRICE_TEST_MODE } from '../../../lib/catalog-publication';
import type { AdminCatalogStats } from '../types';

interface AdminCatalogTabProps {
  filteredCatalog: OwnerCatalogProduct[];
  catalogSearch: string;
  setCatalogSearch: (val: string) => void;
  catalogStatusFilter: 'all' | 'published' | 'draft' | 'review';
  setCatalogStatusFilter: (filter: 'all' | 'published' | 'draft' | 'review') => void;
  catalogStats: AdminCatalogStats;
  catalogSyncError: string;
  publishedRows: Set<number>;
  publicationLoaded: boolean;
  updatingRow: number | null;
  priceRevision: number | null;
  effectivePrices: Record<string, { amountIdr: number }>;
  openEditModal: (product: OwnerCatalogProduct) => void;
  handleTogglePublish: (row: number) => void;
}

function resolveCatalogImage(item: OwnerCatalogProduct): string {
  const mapping = ACTIVE_CATALOG_MAPPING.find((m) => m.masterRow === item.sourceRow);
  if (mapping) {
    const webProduct = PRODUCTS.find((p) => p.id === mapping.webId);
    if (webProduct) {
      return getProductDisplayImage(webProduct);
    }
  }

  const series = item.seriesExcel.toLowerCase();
  const name = item.name.toLowerCase();

  if (series.includes('grand reserve') || name.includes('sidra') || name.includes('geisha') || name.includes('reserve')) {
    return '/images/bag-grand-reserve.jpg';
  }
  if (
    series.includes('walida') ||
    series.includes('argopuro') ||
    series.includes('ijen') ||
    series.includes('arjuna') ||
    series.includes('dewata') ||
    name.includes('walida')
  ) {
    return '/images/bag-walida.jpg';
  }
  if (
    series.includes('java exotic') ||
    series.includes('sumbing') ||
    series.includes('enrekang') ||
    series.includes('espresso') ||
    series.includes('robusta')
  ) {
    return '/images/bag-sumbing.jpg';
  }

  return '/images/bag-prau.jpg';
}

export function AdminCatalogTab({
  filteredCatalog,
  catalogSearch,
  setCatalogSearch,
  catalogStatusFilter,
  setCatalogStatusFilter,
  catalogStats,
  catalogSyncError,
  publishedRows,
  publicationLoaded,
  updatingRow,
  priceRevision,
  effectivePrices,
  openEditModal,
  handleTogglePublish,
}: AdminCatalogTabProps) {
  return (
    <div className="space-y-6">
      {/* Control Bar: Search & Status Segments */}
      <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Cari SKU, nama produk, alias slowbar, origin..."
              className="h-9 w-full rounded-md border border-border-subtle bg-slate-50/70 pl-9 pr-3 text-xs text-brand-charcoal placeholder:text-on-surface-variant focus:border-brand-navy focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="inline-flex rounded-lg border border-border-subtle bg-slate-100/60 p-0.5">
              {[
                { id: 'all' as const, label: 'Semua', count: catalogStats.total },
                { id: 'published' as const, label: 'Tayang', count: catalogStats.published },
                { id: 'draft' as const, label: 'Draft', count: catalogStats.draft },
                { id: 'review' as const, label: 'Review', count: catalogStats.review },
              ].map((tab) => {
                const active = catalogStatusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCatalogStatusFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all ${
                      active
                        ? 'bg-white text-brand-charcoal font-semibold shadow-xs'
                        : 'text-on-surface-variant hover:text-brand-charcoal'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="font-mono text-[10px] text-on-surface-variant tabular-nums">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <Link
              href="/admin/products?new=1"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-navy px-3 text-xs font-semibold text-white hover:bg-brand-navy-dark transition-colors shadow-2xs"
            >
              <Plus size={13} />
              <span>Tambah Produk</span>
            </Link>
          </div>
        </div>
      </div>

      {catalogSyncError && (
        <div role="alert" className="rounded-lg border border-brand-maroon/20 bg-brand-maroon/5 p-3.5 text-xs text-brand-maroon font-medium">
          {catalogSyncError}
        </div>
      )}

      {/* Catalog Table */}
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-border-subtle bg-slate-50/70 text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              <tr>
                <th className="py-3 px-4 w-14">SKU</th>
                <th className="py-3 px-4 font-sans">Produk &amp; Kemasan</th>
                <th className="py-3 px-4">Series Excel</th>
                <th className="py-3 px-4">Origin</th>
                <th className="py-3 px-4">Harga Acuan</th>
                <th className="py-3 px-4">Status Web</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredCatalog.map((item) => {
                const isPublished = publishedRows.has(item.sourceRow);
                const hasWebMapping = ACTIVE_CATALOG_MAPPING.some((mapping) => mapping.masterRow === item.sourceRow);
                const isReview =
                  item.prices.filter100g === '-' &&
                  item.prices.filter200g === '-' &&
                  item.prices.espresso200g === '-' &&
                  item.prices.reserve100g === '-';

                const imageUrl = resolveCatalogImage(item);

                return (
                  <tr key={item.sourceRow} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-brand-charcoal tabular-nums">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">
                        #{item.sourceRow}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-slate-100 shadow-2xs">
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            width={44}
                            height={44}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-sans font-semibold text-brand-charcoal text-sm truncate max-w-xs" title={item.name}>
                            {item.name}
                          </div>
                          {item.slowbarAlias && item.slowbarAlias !== '-' && (
                            <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-brand-maroon">
                              <span>Slowbar:</span>
                              <span className="font-semibold">{item.slowbarAlias}</span>
                            </div>
                          )}
                          {item.ownerNote && (
                            <div className="text-[11px] text-on-surface-variant font-sans line-clamp-1 mt-0.5" title={item.ownerNote}>
                              {item.ownerNote}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-brand-charcoal">
                        {item.seriesExcel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-sans text-xs">
                      {item.origin || 'Indonesia'}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {PRICE_TEST_MODE ? (
                        priceRevision === null ? (
                          <span className="text-on-surface-variant text-[11px]">Memuat harga...</span>
                        ) : (
                          <div className="space-y-0.5">
                            {ACTIVE_CATALOG_MAPPING.filter((mapping) => mapping.masterRow === item.sourceRow).map((mapping) => {
                              const product = PRODUCTS.find((entry) => entry.id === mapping.webId);
                              const variant = product?.variants[0];
                              const sku = product && variant ? `${product.slug}:beans:${variant.weightGrams}` : '';
                              return (
                                <div key={mapping.webId} className="font-medium text-brand-charcoal text-[11px]">
                                  {effectivePrices[sku] ? formatRupiah(effectivePrices[sku].amountIdr) : 'N/A'}
                                </div>
                              );
                            })}
                          </div>
                        )
                      ) : item.prices.filter100g !== '-' ? (
                        <span className="text-brand-charcoal text-[11px]">
                          100g: Rp{item.prices.filter100g}k · 200g: Rp{item.prices.filter200g}k
                        </span>
                      ) : item.prices.espresso200g !== '-' ? (
                        <span className="text-brand-charcoal text-[11px]">
                          200g: Rp{item.prices.espresso200g}k (Espresso)
                        </span>
                      ) : item.prices.reserve100g !== '-' ? (
                        <span className="text-brand-charcoal text-[11px]">
                          100g: Rp{item.prices.reserve100g}k (Reserve)
                        </span>
                      ) : (
                        <span className="text-amber-800 text-[11px] font-medium">
                          Belum ada harga
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {!publicationLoaded ? (
                        <span className="text-slate-400 text-[11px]">Memverifikasi...</span>
                      ) : isPublished ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Tayang
                        </span>
                      ) : isReview ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle bg-white text-brand-charcoal hover:border-brand-navy hover:text-brand-navy transition-colors"
                          title="Edit Harga Produk"
                          aria-label={`Edit harga ${item.name}`}
                        >
                          <Edit2 size={12} />
                        </button>
                        {hasWebMapping && (
                          <Link
                            href={`/admin/products?edit=${encodeURIComponent(
                              ACTIVE_CATALOG_MAPPING.find((entry) => entry.masterRow === item.sourceRow)?.slug ?? ''
                            )}`}
                            className="inline-flex h-7 items-center rounded-md border border-border-subtle bg-white px-2 text-[11px] font-medium text-brand-charcoal hover:border-brand-navy hover:text-brand-navy transition-colors"
                          >
                            Kelola
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleTogglePublish(item.sourceRow)}
                          disabled={!hasWebMapping || updatingRow !== null || !publicationLoaded}
                          title={hasWebMapping ? undefined : 'Produk belum memiliki mapping rilis.'}
                          className={`inline-flex h-7 items-center rounded-md px-2.5 text-[11px] font-semibold transition-colors ${
                            !hasWebMapping
                              ? 'cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
                              : isPublished
                              ? 'border border-brand-maroon/20 bg-brand-maroon/5 text-brand-maroon hover:bg-brand-maroon/10'
                              : 'bg-brand-navy text-white hover:bg-brand-navy-dark'
                          }`}
                        >
                          {!hasWebMapping
                            ? 'Unmapped'
                            : updatingRow === item.sourceRow
                            ? '...'
                            : isPublished
                            ? 'Draft'
                            : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
