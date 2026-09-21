'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  Truck,
  CheckCircle2,
  Sparkles,
  TriangleAlert,
  Copy,
  Check,
  Package,
  Clock,
  Shield,
  Coffee,
} from 'lucide-react';
import { PageIntro } from '../../components/ui/page-structure';
import { useOrderStore, OrderRecord, OrderStatus } from '../../lib/store/useOrderStore';
import { formatRupiah } from '../../lib/data';

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 text-xs font-mono text-on-surface-variant">
          Memuat data pelacakan...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';
  const [orderCode, setOrderCode] = useState(initialOrder);
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+62');
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(Boolean(initialOrder));
  const [isLoading, setIsLoading] = useState(false);
  const [copiedResi, setCopiedResi] = useState(false);

  // Zustand persistent order store
  const { orders, getOrderById } = useOrderStore();

  useEffect(() => {
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setOrderCode(orderParam);
      setSearched(true);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() && !phone.trim() && !email.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSearched(true);
    }, 350);
  };

  // Look up matching order
  const foundOrder: OrderRecord | undefined = useMemo(() => {
    if (orderCode.trim()) {
      return getOrderById(orderCode);
    }
    if (phone.trim() || email.trim()) {
      return orders.find((o) => {
        const matchPhone = phone.trim() && o.customerPhone.includes(phone.trim());
        const matchEmail =
          email.trim() && o.customerEmail?.toLowerCase() === email.trim().toLowerCase();
        return matchPhone || matchEmail;
      });
    }
    return undefined;
  }, [orderCode, phone, email, orders, getOrderById]);

  const copyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Menunggu Konfirmasi',
          dot: 'bg-amber-500',
        };
      case 'roasting':
        return {
          label: 'Sedang Disangrai & Dikemas',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'shipped':
        return {
          label: 'Dalam Pengiriman Kurir',
          dot: 'bg-emerald-500 animate-pulse',
        };
      case 'completed':
        return {
          label: 'Pesanan Selesai / Diterima',
          dot: 'bg-purple-500',
        };
      case 'cancelled':
        return {
          label: 'Pesanan Dibatalkan',
          dot: 'bg-red-500',
        };
      default:
        return {
          label: 'Memproses Pesanan',
          dot: 'bg-gray-500',
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="page-shell"
    >
      <PageIntro
        align="center"
        compact
        kicker="Pelacakan Pesanan Roastery"
        icon={<Sparkles size={14} />}
        title="Lacak Pesanan Anda"
        description="Masukkan kode referensi pesanan atau nomor WhatsApp Anda untuk memeriksa status batch sangrai dan nomor resi kurir."
      />

      <section className="site-container page-section">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          {/* Back Link & Admin Portal Quick Access */}
          <div className="flex items-center justify-between">
            <Link
              href="/catalog"
              className="inline-flex items-center text-brand-navy font-mono text-xs font-bold hover:text-brand-maroon transition-colors gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali ke katalog</span>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-on-surface-variant hover:text-brand-navy transition-colors"
            >
              <Shield size={12} className="text-brand-maroon" />
              <span>Portal Admin Roastery</span>
            </Link>
          </div>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            onSubmit={handleSearch}
            className="ui-surface editorial-workspace space-y-5 p-6 sm:p-8"
          >
            {/* Order Code */}
            <div className="space-y-1">
              <label className="field-label" htmlFor="order-code">
                Kode Pesanan
              </label>
              <input
                id="order-code"
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="Contoh: 52CR-892011"
                className="field-control uppercase font-mono"
              />
              <p className="field-help">
                Tercantum pada invoice WhatsApp atau halaman selesai checkout (contoh: 52CR-892011).
              </p>
            </div>

            {/* Email & WhatsApp Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="field-label" htmlFor="phone">
                  Nomor WhatsApp
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="field-control w-auto shrink-0 font-mono text-xs"
                  >
                    <option value="+62">+62 (ID)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+60">+60 (MY)</option>
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="81234567890"
                    className="field-control font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="field-label" htmlFor="email">
                  Email (Opsional)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="field-control text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Mencari data sangrai...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Lacak Status &amp; Resi Pengiriman</span>
                </span>
              )}
            </button>
          </motion.form>

          {/* Tracking Result */}
          <AnimatePresence mode="wait">
            {searched && (
              <motion.div
                key={foundOrder ? foundOrder.id : 'not-found'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {foundOrder ? (
                  <div className="ui-surface editorial-workspace p-6 sm:p-8 space-y-6">
                    {/* Status Disclaimer */}
                    <div className="flex gap-3 rounded-lg border border-teal-200 bg-teal-50/60 p-3 text-teal-900 text-xs">
                      <TriangleAlert
                        className="mt-0.5 h-4 w-4 shrink-0 text-brand-navy"
                        aria-hidden="true"
                      />
                      <p className="leading-relaxed">
                        Status pesanan tersinkronisasi langsung dengan sistem operasional sangrai{' '}
                        <strong>52 Coffee &amp; Roastery</strong>.
                      </p>
                    </div>

                    {/* Header: Status & Order Code */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">
                          Status Terkini
                        </span>
                        <div className="font-headline text-xl font-bold text-brand-charcoal flex items-center gap-2 mt-0.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              getStatusDisplay(foundOrder.status).dot
                            }`}
                          />
                          <span>{getStatusDisplay(foundOrder.status).label}</span>
                        </div>
                        {foundOrder.roastDate && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-brand-maroon mt-1">
                            <Coffee size={12} />
                            <span>{foundOrder.roastDate}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-left sm:text-right font-mono">
                        <span className="inline-block text-xs px-3 py-1 rounded-full bg-brand-pill text-brand-navy font-bold border border-border-subtle">
                          {foundOrder.id}
                        </span>
                        <div className="text-[10px] text-on-surface-variant mt-1">
                          Dibuat:{' '}
                          {new Date(foundOrder.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Visual Roastery Timeline */}
                    <div className="space-y-4 font-mono text-xs border-b border-border-subtle pb-6">
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface-variant">
                        Proses Roastery &amp; Pengiriman
                      </h4>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Step 1: Pesanan Dikonfirmasi */}
                        <div className="flex items-center gap-3 text-emerald-700">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-brand-charcoal">
                              Pesanan Terkonfirmasi
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-sans">
                              Metode: {foundOrder.paymentMethod.toUpperCase()} · Pembayaran diterima
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold">Selesai</span>
                        </div>

                        {/* Step 2: Roasting & QC */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              ['roasting', 'shipped', 'completed'].includes(foundOrder.status)
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {['shipped', 'completed'].includes(foundOrder.status) ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-brand-charcoal">
                              Batch Sangrai Roaster &amp; Cupping QC
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-sans">
                              Profil sangrai presisi sesuai pesanan (Light–Medium)
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              foundOrder.status === 'roasting'
                                ? 'text-blue-600'
                                : ['shipped', 'completed'].includes(foundOrder.status)
                                ? 'text-emerald-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {foundOrder.status === 'roasting'
                              ? 'Sedang Berjalan'
                              : ['shipped', 'completed'].includes(foundOrder.status)
                              ? 'Selesai'
                              : 'Antrean'}
                          </span>
                        </div>

                        {/* Step 3: Packing Valve Pouch */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              ['shipped', 'completed'].includes(foundOrder.status)
                                ? 'bg-emerald-100 text-emerald-600'
                                : foundOrder.status === 'roasting'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-brand-charcoal">
                              Pengemasan Valve Pouch &amp; Box
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-sans">
                              Pouch one-way degas valve tertutup rapat untuk menjaga kesegaran aromatik
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              ['shipped', 'completed'].includes(foundOrder.status)
                                ? 'text-emerald-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {['shipped', 'completed'].includes(foundOrder.status)
                              ? 'Selesai'
                              : 'Menunggu'}
                          </span>
                        </div>

                        {/* Step 4: Diserahkan ke Kurir */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              foundOrder.status === 'shipped'
                                ? 'bg-brand-navy text-white shadow-sm'
                                : foundOrder.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <Truck className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-brand-charcoal">
                              Pengiriman bersama {foundOrder.courier}
                            </div>
                            <div className="text-[10px] text-on-surface-variant font-sans">
                              {foundOrder.trackingNumber ? (
                                <span>
                                  No. Resi:{' '}
                                  <strong className="font-mono text-brand-navy">
                                    {foundOrder.trackingNumber}
                                  </strong>
                                </span>
                              ) : (
                                <span>Nomor resi akan muncul setelah paket dijemput kurir</span>
                              )}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold ${
                              foundOrder.status === 'shipped'
                                ? 'text-brand-maroon'
                                : foundOrder.status === 'completed'
                                ? 'text-emerald-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {foundOrder.status === 'shipped'
                              ? 'Dalam Perjalanan'
                              : foundOrder.status === 'completed'
                              ? 'Tiba'
                              : 'Menunggu Kurir'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tracking Resi Box (If Resi exists) */}
                    {foundOrder.trackingNumber && (
                      <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold block">
                            Kurir &amp; Nomor Resi Terverifikasi
                          </span>
                          <div className="text-base font-bold text-emerald-950 mt-0.5">
                            {foundOrder.courier} — {foundOrder.trackingNumber}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyResi(foundOrder.trackingNumber!)}
                          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xs border border-emerald-400 bg-white px-3 py-1.5 font-mono text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          {copiedResi ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedResi ? 'Resi Tersalin!' : 'Salin Nomor Resi'}</span>
                        </button>
                      </div>
                    )}

                    {/* Order Details & Delivery Destination */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs border-t border-border-subtle pt-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold block">
                          Tujuan Pengiriman
                        </span>
                        <div className="font-sans font-semibold text-brand-charcoal mt-1">
                          {foundOrder.customerName}
                        </div>
                        <div className="text-on-surface-variant">{foundOrder.customerPhone}</div>
                        <div className="text-on-surface-variant text-[11px] mt-0.5">
                          {foundOrder.customerAddress}, {foundOrder.customerCity}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold block">
                          Ringkasan Produk
                        </span>
                        <div className="mt-1 space-y-1">
                          {foundOrder.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-[11px]">
                              <span className="font-sans text-brand-charcoal">
                                {it.quantity}x {it.name} ({it.weightLabel}, {it.grindLabel})
                              </span>
                              <span className="font-bold">
                                {formatRupiah(it.unitPrice * it.quantity)}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-black/10 pt-1.5 flex justify-between font-bold text-xs text-brand-charcoal">
                            <span>Total Pembayaran</span>
                            <span>{formatRupiah(foundOrder.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ui-surface editorial-workspace p-6 sm:p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg text-brand-charcoal">
                        Pesanan Tidak Ditemukan
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
                        Kode <strong>&quot;{orderCode || phone}&quot;</strong> belum terdaftar.
                        Pastikan kode pesanan diawali format <strong>52CR-</strong>.
                      </p>
                    </div>

                    {/* Demo Orders Quick Test */}
                    <div className="pt-4 border-t border-border-subtle max-w-md mx-auto text-left">
                      <span className="text-[11px] font-mono text-on-surface-variant font-semibold block mb-2">
                        Atau uji coba pelacakan dengan transaksi simulasi berikut:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {orders.slice(0, 4).map((demo) => (
                          <button
                            key={demo.id}
                            type="button"
                            onClick={() => {
                              setOrderCode(demo.id);
                              setSearched(true);
                            }}
                            className="px-2.5 py-1 text-xs font-mono rounded-xs border border-border-subtle bg-white hover:border-brand-navy hover:text-brand-navy transition-colors flex items-center gap-1.5"
                          >
                            <span className="font-bold">{demo.id}</span>
                            <span className="text-[10px] text-on-surface-variant">
                              ({demo.status})
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
}
