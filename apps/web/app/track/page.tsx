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
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { PageIntro } from '../../components/ui/page-structure';

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
      className="page-shell"
    >
      <PageIntro
        align="center"
        compact
        kicker="Pelacakan pesanan"
        icon={<Sparkles size={14} />}
        title="Lacak pesanan Anda"
        description="Masukkan kode pesanan atau data kontak untuk memeriksa status penyiapan dan pengiriman kopi Anda."
      />

      <section className="site-container page-section">
      <div className="w-full max-w-xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/catalog"
          className="inline-flex items-center text-brand-navy font-mono text-xs font-bold hover:text-brand-maroon transition-colors gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke katalog</span>
        </Link>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          onSubmit={handleSearch}
          className="ui-surface space-y-5 p-6 sm:p-8"
        >
          {/* Order Code */}
          <div className="space-y-1">
            <label className="field-label" htmlFor="order-code">
              Kode pesanan
            </label>
            <input
              id="order-code"
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="52C-2026-X89A12"
              className="field-control uppercase font-mono"
            />
            <p className="field-help">
              Tercantum pada invoice WhatsApp atau halaman konfirmasi checkout Anda.
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@gmail.com"
              className="field-control"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="field-label" htmlFor="phone">
              Nomor WhatsApp
            </label>
            <div className="flex gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="field-control w-auto shrink-0 font-mono"
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
                className="field-control font-mono"
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
                <span>Mencari pesanan...</span>
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
              className="ui-surface p-6 sm:p-8 space-y-6"
            >
              <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="text-xs leading-5">
                  Tampilan ini masih berupa simulasi dan belum terhubung ke data pesanan maupun layanan kurir.
                </p>
              </div>
              <div className="flex justify-between items-start border-b border-border-subtle pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">Contoh status</span>
                  <div className="font-editorial text-xl font-bold text-brand-navy flex items-center gap-2 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Dalam pengiriman</span>
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
                    <div className="font-bold text-on-surface">Batch selesai disangrai</div>
                    <div className="text-[10px] text-on-surface-variant font-sans">Profil sangrai ringan–sedang</div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">Kemarin</span>
                </div>

                <div className="flex items-center gap-3 text-emerald-700">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-on-surface">Kendali mutu dan pengemasan</div>
                    <div className="text-[10px] text-on-surface-variant font-sans">Kemasan berkatup telah diperiksa</div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant">09:30 WIB</span>
                </div>

                <div className="flex items-center gap-3 text-brand-navy">
                  <div className="w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-brand-navy">Dalam perjalanan bersama kurir</div>
                    <div className="text-[10px] text-on-surface-variant font-sans">Contoh nomor resi: 52EXP998823100</div>
                  </div>
                  <span className="text-[10px] text-brand-maroon font-bold">Hari Ini</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </section>
    </motion.div>
  );
}
