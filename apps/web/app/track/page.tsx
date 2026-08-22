'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Coffee,
  Package,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { formatRupiah } from '../../lib/data';

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-mono text-on-surface-variant">Memuat data pelacakan...</div>}>
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
    }, 450);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full bg-surface-white text-on-surface min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans"
    >
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/catalog"
          className="inline-flex items-center text-brand-navy font-mono text-xs font-bold hover:text-brand-maroon transition-colors gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke Shop</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy/5 border border-border-subtle text-xs font-mono text-brand-navy font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Traceability</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-brand-navy">
            Find Your Order
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Masukkan kode pesanan 52 Coffee Anda untuk melihat status sangrai batch &amp; posisi pengiriman kurir.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          onSubmit={handleSearch}
          className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-xl"
        >
          {/* Order Code */}
          <div className="space-y-1">
            <label className="block font-mono text-xs text-on-surface font-semibold" htmlFor="order-code">
              Kode Pesanan (Order Code)
            </label>
            <input
              id="order-code"
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="52C-2026-X89A12"
              className="w-full rounded-xl border border-border-subtle bg-surface-bright px-4 py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-brand-navy transition-colors uppercase font-mono"
            />
            <p className="text-[10px] text-on-surface-variant">
              Tercantum pada invoice WhatsApp atau halaman konfirmasi checkout Anda.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block font-mono text-xs text-on-surface font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@gmail.com"
              className="w-full rounded-xl border border-border-subtle bg-surface-bright px-4 py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-brand-navy transition-colors font-sans"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block font-mono text-xs text-on-surface font-semibold" htmlFor="phone">
              Nomor WhatsApp
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="rounded-xl border border-border-subtle bg-surface-bright px-3 py-3 text-xs font-mono text-on-surface focus:outline-none focus:border-brand-navy shrink-0"
              >
                <option value="+62">+62 (ID)</option>
                <option value="+65">+65 (SG)</option>
                <option value="+60">+60 (MY)</option>
                <option value="+1">+1 (US)</option>
              </select>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="81234567890"
                className="w-full rounded-xl border border-border-subtle bg-surface-bright px-4 py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-brand-navy transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-mono font-bold text-xs sm:text-sm py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Mencari Pesanan...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Lacak Status Pesanan</span>
              </span>
            )}
          </button>
        </motion.form>

        {/* Mock Tracking Result */}
        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-border-subtle space-y-6 shadow-xl"
            >
              <div className="flex justify-between items-start border-b border-border-subtle pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">Status Pesanan:</span>
                  <div className="font-editorial text-xl font-bold text-brand-navy flex items-center gap-2 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Dalam Pengiriman Ekspedisi</span>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-brand-pill text-brand-navy font-bold border border-border-subtle">
                  {orderCode || '52C-2026-X89A12'}
                </span>
              </div>

              {/* Progress Timeline */}
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-on-surface">Batch Disangrai (Roasting Done)</div>
                    <div className="text-[10px] text-on-surface-variant font-sans">Rubasse Infrared • Profil Light-Medium</div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">Kemarin</span>
                </div>

                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-on-surface">Quality Control &amp; Nitrogen Flush</div>
                    <div className="text-[10px] text-on-surface-variant font-sans">Degassing valve pouch tertutup rapat</div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">09:30 WIB</span>
                </div>

                <div className="flex items-center gap-3 text-brand-navy">
                  <div className="w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-brand-navy">Dalam Perjalanan Kurir (JNE/SiCepat)</div>
                    <div className="text-[10px] text-on-surface-variant font-sans">No. Resi: 52EXP998823100</div>
                  </div>
                  <span className="text-[10px] text-brand-maroon font-bold">Hari Ini</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
