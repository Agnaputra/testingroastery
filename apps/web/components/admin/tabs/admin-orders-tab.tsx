'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ExternalLink,
  Truck,
  Search,
  Package,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  MapPin,
  Phone,
  CreditCard,
  FileText,
} from 'lucide-react';
import { PRODUCTS, formatRupiah, getProductDisplayImage } from '../../../lib/data';
import { AdminRealOrders } from '../../admin-real-orders';
import type { OrderRecord, OrderStatus, CourierType, OrderItem } from '../../../lib/store/useOrderStore';

interface AdminOrdersTabProps {
  orders: OrderRecord[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onOpenShippingModal: (orderId: string, courier?: CourierType, trackingNumber?: string) => void;
}

function formatOrderDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

function getOrderItemImage(item: OrderItem): string {
  if (item.imageUrl && !item.imageUrl.startsWith('http')) {
    return item.imageUrl;
  }
  const matched = PRODUCTS.find((p) => p.id === item.productId || p.slug === item.slug);
  if (matched) {
    return getProductDisplayImage(matched);
  }
  const name = item.name.toLowerCase();
  if (name.includes('walida') || name.includes('argopuro') || name.includes('ijen')) {
    return '/images/bag-walida.jpg';
  }
  if (name.includes('sumbing') || name.includes('exotic') || name.includes('espresso')) {
    return '/images/bag-sumbing.jpg';
  }
  if (name.includes('sidra') || name.includes('reserve') || name.includes('geisha')) {
    return '/images/bag-grand-reserve.jpg';
  }
  return '/images/bag-prau.jpg';
}

export function AdminOrdersTab({
  orders,
  updateOrderStatus,
  onOpenShippingModal,
}: AdminOrdersTabProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const match =
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.customerCity.toLowerCase().includes(q) ||
          (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [orders, statusFilter, orderSearch]);

  const stats = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      roasting: orders.filter((o) => o.status === 'roasting').length,
      shipped: orders.filter((o) => o.status === 'shipped').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE === '1' && <AdminRealOrders />}

      {process.env.NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE !== '1' && (
        <div className="space-y-6">
          {/* Top Control Bar: Search & Status Segments */}
          <div className="rounded-xl border border-border-subtle bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search Field */}
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari ID pesanan, nama pemesan, no HP, kota, resi..."
                  className="h-9 w-full rounded-md border border-border-subtle bg-slate-50/70 pl-9 pr-3 text-xs text-brand-charcoal placeholder:text-on-surface-variant focus:border-brand-navy focus:bg-white focus:outline-none transition-colors"
                />
              </div>

              {/* Segmented Filter Pills */}
              <div className="inline-flex flex-wrap rounded-lg border border-border-subtle bg-slate-100/60 p-0.5 font-mono text-xs">
                {[
                  { id: 'all' as const, label: 'Semua', count: stats.all },
                  { id: 'pending' as const, label: 'Menunggu', count: stats.pending },
                  { id: 'roasting' as const, label: 'Sangrai & Pack', count: stats.roasting },
                  { id: 'shipped' as const, label: 'Dikirim', count: stats.shipped },
                  { id: 'completed' as const, label: 'Selesai', count: stats.completed },
                  { id: 'cancelled' as const, label: 'Batal', count: stats.cancelled },
                ].map((tab) => {
                  const active = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setStatusFilter(tab.id)}
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
            </div>
          </div>

          {/* Orders Card Grid */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-subtle bg-white p-12 text-center">
              <Package size={32} className="mx-auto text-on-surface-variant/40 mb-3" />
              <h3 className="font-headline font-semibold text-brand-charcoal text-sm">
                Tidak ada pesanan ditemukan
              </h3>
              <p className="mt-1 text-xs text-on-surface-variant">
                Coba ubah kata kunci pencarian atau ganti filter status di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2">
              {filteredOrders.map((o) => {
                const isPaid = o.paymentStatus === 'paid';

                const statusConfig: Record<
                  OrderStatus,
                  { label: string; bg: string; dot: string; textColor: string; icon: typeof Clock }
                > = {
                  pending: {
                    label: 'Menunggu Pembayaran',
                    bg: 'bg-amber-50 border-amber-200/70',
                    dot: 'bg-amber-500',
                    textColor: 'text-amber-800',
                    icon: Clock,
                  },
                  roasting: {
                    label: 'Sedang Disangrai & Packing',
                    bg: 'bg-blue-50 border-blue-200/70',
                    dot: 'bg-blue-500',
                    textColor: 'text-blue-800',
                    icon: Flame,
                  },
                  shipped: {
                    label: 'Dalam Pengiriman Kurir',
                    bg: 'bg-teal-50 border-teal-200/70',
                    dot: 'bg-teal-600',
                    textColor: 'text-teal-900',
                    icon: Truck,
                  },
                  completed: {
                    label: 'Pesanan Selesai',
                    bg: 'bg-emerald-50 border-emerald-200/70',
                    dot: 'bg-emerald-500',
                    textColor: 'text-emerald-800',
                    icon: CheckCircle2,
                  },
                  cancelled: {
                    label: 'Pesanan Dibatalkan',
                    bg: 'bg-rose-50 border-rose-200/70',
                    dot: 'bg-rose-500',
                    textColor: 'text-rose-800',
                    icon: XCircle,
                  },
                };

                const currentStatus = statusConfig[o.status] || statusConfig.pending;

                return (
                  <div
                    key={o.id}
                    className="flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-5 shadow-xs hover:border-brand-navy/30 transition-all duration-150"
                  >
                    <div>
                      {/* 1. Header: Order ID, Timestamp & Status Pill */}
                      <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-brand-charcoal tracking-tight">
                              {o.id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(o.id, o.id)}
                              title="Salin Order ID"
                              aria-label="Salin Order ID"
                              className="text-on-surface-variant hover:text-brand-charcoal transition-colors p-0.5"
                            >
                              {copiedId === o.id ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">
                            {formatOrderDate(o.createdAt)}
                          </p>
                        </div>

                        <div
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium font-mono ${currentStatus.bg} ${currentStatus.textColor}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`} />
                          <span>{currentStatus.label}</span>
                        </div>
                      </div>

                      {/* 2. Customer & Address Information */}
                      <div className="mt-3.5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-brand-charcoal text-sm">
                            {o.customerName}
                          </span>
                          <a
                            href={`https://wa.me/${o.customerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-navy hover:underline"
                          >
                            <Phone size={11} />
                            <span>{o.customerPhone}</span>
                          </a>
                        </div>

                        <div className="flex items-start gap-1.5 text-on-surface-variant text-[11px]">
                          <MapPin size={13} className="shrink-0 mt-0.5 text-on-surface-variant/70" />
                          <span className="line-clamp-2">
                            {o.customerAddress}, {o.customerCity}
                          </span>
                        </div>

                        {o.notes && (
                          <div className="mt-2 rounded-md bg-amber-50/60 border border-amber-200/50 p-2 text-[11px] text-amber-900 flex items-start gap-1.5">
                            <FileText size={12} className="shrink-0 mt-0.5" />
                            <span>Catatan: {o.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* 3. Items Ordered Breakdown with Pouch Thumbnails */}
                      <div className="mt-4 rounded-lg bg-slate-50/70 border border-border-subtle p-3 space-y-2">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                          Item Pesanan ({o.items.reduce((acc, it) => acc + it.quantity, 0)} item)
                        </div>

                        <div className="divide-y divide-border-subtle/60">
                          {o.items.map((it, idx) => {
                            const itemImg = getOrderItemImage(it);
                            return (
                              <div key={idx} className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs">
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border-subtle bg-white shadow-2xs">
                                    <Image
                                      src={itemImg}
                                      alt={it.name}
                                      width={40}
                                      height={40}
                                      className="h-full w-full object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="rounded bg-white border border-border-subtle px-1.5 py-0.2 font-mono text-[10px] font-bold text-brand-charcoal">
                                        {it.quantity}x
                                      </span>
                                      <span className="font-medium text-brand-charcoal truncate">
                                        {it.name}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                                      {it.weightLabel} · {it.grindLabel || 'Biji Utuh'}
                                    </div>
                                  </div>
                                </div>
                                <div className="font-mono text-xs font-semibold text-brand-charcoal shrink-0 tabular-nums">
                                  {formatRupiah(it.unitPrice * it.quantity)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 4. Payment & Shipping Info Strip */}
                      <div className="mt-4 grid grid-cols-2 gap-3 text-xs pt-1">
                        <div className="rounded-md border border-border-subtle p-2.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant block">
                            Pembayaran
                          </span>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="font-medium uppercase text-brand-charcoal font-mono text-[11px]">
                              {o.paymentMethod}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 font-mono text-[9px] font-semibold ${
                                isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isPaid ? 'Lunas' : 'Menunggu'}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-md border border-border-subtle p-2.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant block">
                            Kurir &amp; Resi
                          </span>
                          <div className="mt-1">
                            <span className="font-medium text-brand-charcoal text-[11px] block truncate">
                              {o.courier}
                            </span>
                            {o.trackingNumber ? (
                              <button
                                type="button"
                                onClick={() => handleCopy(o.trackingNumber!, `track-${o.id}`)}
                                className="font-mono text-[10px] text-brand-navy hover:underline flex items-center gap-1 mt-0.5 truncate"
                                title="Klik untuk salin resi"
                              >
                                <span>{o.trackingNumber}</span>
                                {copiedId === `track-${o.id}` ? (
                                  <Check size={10} className="text-emerald-600 shrink-0" />
                                ) : (
                                  <Copy size={10} className="shrink-0" />
                                )}
                              </button>
                            ) : (
                              <span className="font-mono text-[10px] text-amber-800 block mt-0.5">
                                Resi belum diinput
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="mt-3.5 flex items-baseline justify-between border-t border-border-subtle pt-3">
                        <span className="text-xs text-on-surface-variant font-medium">
                          Total Pembayaran:
                        </span>
                        <span className="font-mono text-base font-bold text-brand-charcoal tabular-nums">
                          {formatRupiah(o.total)}
                        </span>
                      </div>
                    </div>

                    {/* 5. Card Footer Actions: Status Changer & Modals */}
                    <div className="mt-4 pt-3.5 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-on-surface-variant">
                          Status:
                        </span>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="h-8 rounded-md border border-border-subtle bg-slate-50 px-2 py-1 text-xs font-semibold text-brand-charcoal shadow-2xs focus:border-brand-navy focus:bg-white focus:outline-none transition-colors"
                        >
                          <option value="pending">Menunggu Pembayaran</option>
                          <option value="roasting">Sedang Sangrai / Packing</option>
                          <option value="shipped">Sudah Dikirim Kurir</option>
                          <option value="completed">Selesai (Diterima)</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <Link
                          href={`/track?order=${o.id}`}
                          target="_blank"
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-border-subtle bg-white px-2.5 text-xs font-medium text-brand-charcoal hover:border-brand-navy hover:text-brand-navy transition-colors"
                          title="Halaman pelacakan pembeli"
                        >
                          <ExternalLink size={12} />
                          <span>Lacak</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => onOpenShippingModal(o.id, o.courier, o.trackingNumber)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-charcoal px-3 text-xs font-semibold text-white hover:bg-brand-navy transition-colors"
                        >
                          <Truck size={12} />
                          <span>{o.trackingNumber ? 'Edit Resi' : 'Input Resi'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
