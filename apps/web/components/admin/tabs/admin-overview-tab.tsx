'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Clock,
  Flame,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { formatRupiah } from '../../../lib/data';
import { LoadingState } from '../../ui/loading-state';
import { paymentLabels, fulfillmentLabels } from '../../../lib/customer-order-labels';
import { useAdminPortalContext } from '../admin-context';
import type { AdminMetrics, AdminCatalogStats } from '../types';

interface AdminOverviewTabProps {
  metrics: AdminMetrics;
  catalogStats: AdminCatalogStats;
}

export function AdminOverviewTab({ metrics, catalogStats }: AdminOverviewTabProps) {
  const { overview, overviewError, refreshOverview, publicationLoaded } = useAdminPortalContext();
  if (overviewError) return <div role="alert" className="rounded-xl border border-brand-maroon/25 bg-white p-6 text-sm">{overviewError} <button type="button" className="ml-2 min-h-11 underline" onClick={() => void refreshOverview()}>Coba lagi</button></div>;
  if (!overview) return <LoadingState label="Memuat ringkasan operasional…" />;
  const { recentOrders, topProducts } = overview;
  const { waitingPaymentCount: pendingCount, roastingCount, shippedOrdersCount: shippedCount, completedCount } = metrics;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant">
        <p>{metrics.totalOrdersCount} pesanan tersimpan · {metrics.nonOperationalCount} pesanan pengujian / mode tidak diketahui, dikecualikan dari omzet production.</p>
        <button type="button" onClick={() => void refreshOverview()} className="min-h-11 rounded-md border border-border-subtle px-4 font-semibold text-brand-navy">Perbarui data</button>
      </div>

      {/* 1. Unified Operational Metrics Strip (Apple Mac-style Executive Bar) */}
      <section aria-label="Metrik Operasional" className="rounded-xl border border-border-subtle bg-white shadow-xs">
        <div className="grid grid-cols-2 divide-y divide-border-subtle sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
          {/* Item 1: Antrean Roasting */}
          <div className="p-5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Antrean Roasting
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-brand-charcoal sm:text-3xl tabular-nums">
                {metrics.pendingOrdersCount}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">order</span>
            </div>
            <p className="mt-1 text-[11px] text-brand-maroon font-medium">
              {metrics.processingCount} diproses · {roastingCount} berstatus disangrai
            </p>
          </div>

          {/* Item 2: Pesanan Selesai / Dikirim */}
          <div className="p-5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Pengiriman Kurir
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-brand-charcoal sm:text-3xl tabular-nums">
                {metrics.shippedOrdersCount}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">paket aktif</span>
            </div>
            <p className="mt-1 text-[11px] text-on-surface-variant font-medium">
              {completedCount} pesanan selesai
            </p>
          </div>

          {/* Item 3: Katalog SKU Tayang */}
          <div className="p-5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Katalog Master
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold tracking-tight text-brand-charcoal sm:text-3xl tabular-nums">
                {publicationLoaded ? catalogStats.published : '—'}
              </span>
              <span className="text-xs text-on-surface-variant font-medium">/ {catalogStats.total} SKU</span>
            </div>
            <p className="mt-1 text-[11px] text-emerald-700 font-medium">
              {publicationLoaded ? `${catalogStats.draft} draft · ${catalogStats.review} perlu ditinjau` : 'Status katalog belum tersedia'}
            </p>
          </div>

          {/* Item 4: Omset Tercatat */}
          <div className="p-5">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
              Omzet Produk Production
            </span>
            <div className="mt-2">
              <span className="font-mono text-xl font-bold tracking-tight text-brand-charcoal sm:text-2xl tabular-nums">
                {formatRupiah(metrics.productRevenue)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-on-surface-variant font-medium">
              {metrics.paidCount} pembayaran disetujui · setelah diskon, di luar ongkir
            </p>
          </div>
        </div>
      </section>

      {/* 2. Pipeline Roasting & Fulfillment */}
      <section aria-label="Pipeline Pemrosesan Pesanan" className="rounded-xl border border-border-subtle bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-4">
          <div>
            <h2 className="font-headline text-base font-bold text-brand-charcoal">
              Alur Fulfillment &amp; Roasting
            </h2>
            <p className="text-xs text-on-surface-variant">
              Berdasarkan status pesanan tersimpan; antrean proses hingga selesai hanya menghitung pembayaran disetujui
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand-navy hover:text-brand-maroon transition-colors"
          >
            Buka Manajemen Pesanan <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Step 1: Menunggu */}
          <div className="rounded-lg border border-border-subtle bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                <Clock size={15} />
              </span>
              <span className="font-mono text-xs font-bold text-brand-charcoal tabular-nums">
                {pendingCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-brand-charcoal">1. Menunggu Pembayaran</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant leading-relaxed">
              Verifikasi transfer / QRIS pelanggan
            </p>
          </div>

          {/* Step 2: Roasting */}
          <div className="rounded-lg border border-border-subtle bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-800">
                <Flame size={15} />
              </span>
              <span className="font-mono text-xs font-bold text-brand-charcoal tabular-nums">
                {roastingCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-brand-charcoal">2. Sedang Disangrai</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant leading-relaxed">
              Jumlah pesanan berstatus roasting, bukan jumlah batch mesin
            </p>
          </div>

          {/* Step 3: Ekspedisi */}
          <div className="rounded-lg border border-border-subtle bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-100 text-teal-800">
                <Truck size={15} />
              </span>
              <span className="font-mono text-xs font-bold text-brand-charcoal tabular-nums">
                {shippedCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-brand-charcoal">3. Pengiriman Ekspedisi</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant leading-relaxed">
              Paket diserahkan kurir dengan AWB
            </p>
          </div>

          {/* Step 4: Selesai */}
          <div className="rounded-lg border border-border-subtle bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                <CheckCircle2 size={15} />
              </span>
              <span className="font-mono text-xs font-bold text-brand-charcoal tabular-nums">
                {completedCount}
              </span>
            </div>
            <p className="mt-3 text-xs font-semibold text-brand-charcoal">4. Selesai Diterima</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant leading-relaxed">
              Pesanan tiba di tangan pembeli
            </p>
          </div>
        </div>
      </section>

      {/* 3. Operational Roast Catalog & Recent Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Featured Roasts / Biji Terlaris */}
        <section aria-label="Biji Kopi Unggulan" className="rounded-xl border border-border-subtle bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-headline text-base font-bold text-brand-charcoal">
                Produk Terjual Terbanyak
              </h2>
              <p className="text-xs text-on-surface-variant">
                Kuantitas dari pesanan production dengan pembayaran disetujui
              </p>
            </div>
            <Link
              href="/admin/catalog"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand-navy hover:text-brand-maroon transition-colors"
            >
              Katalog SKU <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border-subtle">
            {topProducts.length === 0 && <p className="py-8 text-sm text-on-surface-variant">Belum ada penjualan production yang pembayarannya disetujui.</p>}
            {topProducts.map((bean) => (
              <div key={bean.skuId} className="py-3.5 first:pt-1 last:pb-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <h3 className="font-sans text-sm font-semibold text-brand-charcoal">
                        {bean.name}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        {bean.variant}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-charcoal tabular-nums">
                      {bean.quantity} unit
                    </span>
                    <p className="mt-1 font-mono text-[10px] text-on-surface-variant">
                      {formatRupiah(bean.grossTotal)} sebelum diskon
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Pesanan Masuk Terbaru */}
        <section aria-label="Aktivitas Pesanan Terbaru" className="rounded-xl border border-border-subtle bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h2 className="font-headline text-base font-bold text-brand-charcoal">
                Pesanan Masuk Terbaru
              </h2>
              <p className="text-xs text-on-surface-variant">
                Antrean mutasi transaksi yang tersimpan di sistem
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-brand-navy hover:text-brand-maroon transition-colors"
            >
              Semua Pesanan <ArrowUpRight size={13} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant">
              Belum ada pesanan yang tercatat.
            </div>
          ) : (
            <div className="mt-4 divide-y divide-border-subtle">
              {recentOrders.map((order) => {
                const statusLabel = order.paymentStatus === 'paid'
                  ? fulfillmentLabels[order.fulfillmentStatus] : paymentLabels[order.paymentStatus];

                const statusColor =
                  order.fulfillmentStatus === 'completed'
                    ? 'text-emerald-700 bg-emerald-50'
                    : order.fulfillmentStatus === 'shipped'
                    ? 'text-brand-navy bg-brand-mist/40'
                    : order.fulfillmentStatus === 'roasting'
                    ? 'text-blue-700 bg-blue-50'
                    : order.fulfillmentStatus === 'cancelled'
                    ? 'text-brand-maroon bg-brand-maroon/10'
                    : 'text-amber-800 bg-amber-50';

                return (
                  <div key={order.id} className="py-3 flex items-center justify-between gap-4 first:pt-1 last:pb-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand-charcoal">
                          {order.id}
                        </span>
                        <span className={`inline-flex rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-on-surface-variant truncate">
                        {order.customerName} · {order.shipping.city} · {order.checkoutMode === 'operational' ? 'Production' : 'Pengujian / mode tidak diketahui'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs font-bold text-brand-charcoal tabular-nums">
                        {formatRupiah(order.total)}
                      </div>
                      <Link
                        href="/admin/orders"
                        className="mt-0.5 inline-block text-[11px] text-brand-navy hover:underline"
                      >
                        Kelola pesanan
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
