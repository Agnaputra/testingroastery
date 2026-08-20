'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
    <Suspense fallback={<div className="text-center py-20 text-xs font-mono text-roastery-muted">Memuat data pelacakan...</div>}>
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
    }, 500);
  };

  return (
    <div className="w-full bg-surface-white text-on-surface min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/catalog"
          className="inline-flex items-center text-roastery-crimson font-mono text-xs font-bold hover:opacity-80 transition-opacity gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-on-surface">
            Find Your Order
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            Enter your order code, email, and the phone number used during checkout to view your order details.
          </p>
        </div>

        {/* Form (Exact Figma Inputs) */}
        <form onSubmit={handleSearch} className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-border-subtle shadow-sm">
          {/* Order Code */}
          <div className="space-y-1">
            <label className="block font-mono text-xs text-on-surface font-semibold" htmlFor="order-code">
              Order Code
            </label>
            <input
              id="order-code"
              type="text"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="NIR-120225-ABC12XYZ9"
              className="w-full rounded-xl border border-border-subtle bg-surface-bright px-4 py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-roastery-crimson focus:border-roastery-crimson transition-colors uppercase font-mono"
            />
            <p className="text-[10px] text-on-surface-variant">
              You can find this in your order confirmation email or checkout success page.
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
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border-subtle bg-surface-bright px-4 py-3 text-xs sm:text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-roastery-crimson focus:border-roastery-crimson transition-colors"
            />
            <p className="text-[10px] text-on-surface-variant">
              The email address used at checkout.
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="block font-mono text-xs text-on-surface font-semibold" htmlFor="phone">
              Phone Number
            </label>
            <div className="flex rounded-xl border border-border-subtle bg-surface-bright overflow-hidden focus-within:ring-1 focus-within:ring-roastery-crimson focus-within:border-roastery-crimson transition-colors">
              <select
                id="country-code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-transparent border-none py-3 pl-3 pr-2 text-xs font-mono text-on-surface focus:ring-0 cursor-pointer"
              >
                <option value="+62">ID +62</option>
                <option value="+1">US +1</option>
                <option value="+44">UK +44</option>
              </select>
              <div className="w-px bg-border-subtle my-2"></div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="812 345 678"
                className="flex-1 bg-transparent border-none px-4 py-3 text-xs sm:text-sm text-on-surface focus:ring-0 font-mono"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant">
              The phone number of the recipient or the one used at checkout.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-roastery-crimson text-white font-mono font-bold text-xs sm:text-sm py-4 rounded-xl hover:bg-roastery-crimson-dark transition-colors shadow-md"
          >
            {isLoading ? 'Searching...' : 'Find Order'}
          </button>
        </form>

        {/* Live Tracking Result Details Card */}
        {searched && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-roastery-muted block">Order ID</span>
                  <strong className="font-mono text-sm text-roastery-dark">{orderCode || '52CR-892102'}</strong>
                </div>
                <span className="badge-teal font-mono text-xs font-bold">
                  ✓ Dalam Pengiriman (In Transit)
                </span>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-3 pt-2">
                {[
                  { step: '1. Pesanan Diterima & Roasting Batch', date: 'Hari ini, 09:15 WIB', done: true },
                  { step: '2. Degassing & Nitrogen Flush Packaging', date: 'Hari ini, 13:40 WIB', done: true },
                  { step: '3. Diserahkan ke Kurir Ekspedisi (JNE REG)', date: 'Hari ini, 16:20 WIB', done: true },
                  { step: '4. Tiba di Kota Tujuan', date: 'Estimasi Besok Sore', done: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.done ? 'bg-roastery-teal text-white' : 'bg-roastery-light text-roastery-muted border border-border-subtle'}`}>
                      {item.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className={`font-semibold ${item.done ? 'text-roastery-dark' : 'text-roastery-muted'}`}>
                        {item.step}
                      </div>
                      <div className="text-[10px] text-roastery-muted font-mono">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Package Summary */}
              <div className="p-3.5 rounded-2xl bg-roastery-light border border-border-subtle flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-roastery-dark">Arjuna Budug Asu Natural + Ijen Honey</div>
                  <div className="text-[10px] text-roastery-muted font-mono">2 item • Total {formatRupiah(339000)}</div>
                </div>
                <span className="text-[11px] font-mono text-roastery-crimson font-bold">Resi: JNE8829104819</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
