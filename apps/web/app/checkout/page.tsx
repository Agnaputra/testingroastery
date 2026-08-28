'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Lock,
  Sparkles,
  ShoppingBag,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { useCartStore } from '../../lib/store/useCartStore';
import { formatRupiah } from '../../lib/data';

interface ShippingOption {
  id: string;
  name: string;
  eta: string;
  cost: number;
}

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Malang');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Shipping & Payment
  const [selectedShipping, setSelectedShipping] = useState<string>('jne-reg');
  const [selectedPayment, setSelectedPayment] = useState<string>('qris');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);

  // Modal simulation
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [copiedVA, setCopiedVA] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const isFreeShipping = subtotal >= 250000;

  const shippingOptions: ShippingOption[] = [
    {
      id: 'jne-reg',
      name: 'JNE Reguler (Nasional)',
      eta: '2 - 3 Hari Kerja',
      cost: isFreeShipping ? 0 : 18000,
    },
    {
      id: 'sicepat-best',
      name: 'SiCepat BEST (Next Day)',
      eta: '1 Hari Kerja',
      cost: isFreeShipping ? 10000 : 25000,
    },
    {
      id: 'malang-instant',
      name: 'Kurir Instan Malang (GoSend / Grab)',
      eta: '1 - 2 Jam (Area Kota Malang)',
      cost: isFreeShipping ? 0 : 15000,
    },
  ];

  const currentShippingCost =
    shippingOptions.find((s) => s.id === selectedShipping)?.cost || 0;
  const grandTotal = Math.max(0, subtotal + currentShippingCost - discountAmount);

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (voucherCode.toUpperCase() === 'SEDUPRESISI' || voucherCode.toUpperCase() === '52COFFEE') {
      const discount = Math.round(subtotal * 0.1); // 10% discount
      setDiscountAmount(discount);
      setVoucherApplied(true);
    } else {
      alert('Kode promo tidak valid. Coba kode: 52COFFEE untuk diskon 10%!');
    }
  };

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert('Mohon lengkapi nama, nomor WhatsApp, dan alamat pengiriman.');
      return;
    }

    setIsProcessing(true);
    const newOrderId = `52CR-${Date.now().toString().slice(-6)}`;
    setOrderId(newOrderId);

    // Simulate Midtrans Snap Token creation
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(true);
    }, 1000);
  };

  const handleFinishPayment = () => {
    setShowPaymentModal(false);
    setOrderCompleted(true);
    clearCart();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  if (orderCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="badge-teal font-mono">Pesanan Terkonfirmasi</span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-brand-navy">
            Terima Kasih, Kawan Seduh!
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Pesanan dengan nomor <strong>#{orderId}</strong> sedang disiapkan oleh tim roastery kami di Jl. KH. Agus Salim No. 11 Malang.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-border-subtle max-w-md mx-auto text-left text-xs font-mono space-y-2.5 shadow-sm">
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-on-surface-variant">Penerima:</span>
            <span className="font-bold text-on-surface">{fullName}</span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-on-surface-variant">Metode Kirim:</span>
            <span className="font-bold text-on-surface">
              {shippingOptions.find((s) => s.id === selectedShipping)?.name}
            </span>
          </div>
          <div className="flex justify-between border-b border-border-subtle pb-2">
            <span className="text-on-surface-variant">Status Pembayaran:</span>
            <span className="text-brand-teal font-bold">LUNAS (Midtrans Verified)</span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-bold">
            <span>Total Pembayaran:</span>
            <span className="text-brand-navy">{formatRupiah(grandTotal)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link href={`/track?order=${orderId}`} className="btn-primary text-xs flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>Lacak Status Pesanan #{orderId}</span>
          </Link>
          <Link href="/catalog" className="btn-secondary text-xs bg-white">
            Belanja Biji Kopi Lainnya
          </Link>
          <Link href="/tools/brew-calculator" className="btn-secondary text-xs bg-white">
            Buka Kalkulator Seduh
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-roastery-light text-roastery-muted flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-editorial text-2xl font-bold">Keranjang Belanja Kosong</h1>
        <p className="text-xs text-roastery-muted">
          Pilih biji kopi artisanal favoritmu di katalog sebelum melakukan checkout.
        </p>
        <Link href="/catalog" className="btn-primary inline-flex text-xs">
          Jelajahi Biji Kopi
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb / Back Navigation */}
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-roastery-border text-roastery-charcoal hover:text-roastery-crimson hover:border-roastery-crimson transition-all shadow-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Beranda</span>
          </Link>
          <span className="text-roastery-muted">/</span>
          <Link href="/catalog" className="text-roastery-muted hover:text-roastery-crimson">
            Katalog
          </Link>
          <span className="text-roastery-muted">/</span>
          <span className="text-roastery-dark font-semibold">Checkout</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-roastery-teal font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>SSL 256-Bit Encrypted Checkout</span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-roastery-border pb-6">
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-roastery-dark">
          Checkout & Pengiriman
        </h1>
        <p className="text-xs sm:text-sm text-roastery-muted mt-1">
          Lengkapi data penerima dan pilih metode pengiriman untuk pesanan biji kopimu.
        </p>
      </div>

      <form onSubmit={handlePayNow} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Customer Details, Shipping, Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Data Pemesan */}
          <div className="editorial-card p-6 bg-white space-y-4 shadow-sm">
            <h2 className="font-editorial text-lg font-bold text-roastery-dark flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-roastery-crimson text-white font-mono text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Informasi Penerima & Kontak</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-roastery-muted">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-roastery-light rounded-xl border border-roastery-border focus:outline-none focus:border-roastery-crimson"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-roastery-muted">Nomor WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-roastery-light rounded-xl border border-roastery-border focus:outline-none focus:border-roastery-crimson"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-mono uppercase text-roastery-muted">Email (Untuk Notifikasi Resi)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-roastery-light rounded-xl border border-roastery-border focus:outline-none focus:border-roastery-crimson"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-mono uppercase text-roastery-muted">Alamat Lengkap Pengiriman *</label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-roastery-light rounded-xl border border-roastery-border focus:outline-none focus:border-roastery-crimson resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-roastery-muted">Kota / Kabupaten</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-roastery-light rounded-xl border border-roastery-border focus:outline-none focus:border-roastery-crimson"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-roastery-muted">Kode Pos</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="65118"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-roastery-light rounded-xl border border-roastery-border focus:outline-none focus:border-roastery-crimson"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-mono uppercase text-roastery-muted">Catatan Khusus untuk Roaster / Barista</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Mohon kirim biji kopi yang di-roast minggu ini ya"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-roastery-light rounded-xl border border-roastery-border focus:outline-none focus:border-roastery-crimson"
                />
              </div>
            </div>
          </div>

          {/* 2. Layanan Ekspedisi & Pengiriman */}
          <div className="editorial-card p-6 bg-white space-y-4 shadow-sm">
            <h2 className="font-editorial text-lg font-bold text-roastery-dark flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-roastery-slate text-white font-mono text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Pilihan Kurir & Ekspedisi</span>
            </h2>

            <div className="space-y-2.5">
              {shippingOptions.map((shipping) => {
                const isSelected = selectedShipping === shipping.id;
                return (
                  <label
                    key={shipping.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-roastery-crimson bg-roastery-crimson/5 ring-1 ring-roastery-crimson'
                        : 'border-roastery-border bg-white hover:bg-roastery-light/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={isSelected}
                        onChange={() => setSelectedShipping(shipping.id)}
                        className="accent-roastery-crimson"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-roastery-dark">
                          {shipping.name}
                        </div>
                        <div className="text-[11px] font-mono text-roastery-muted">
                          Estimasi: {shipping.eta}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-bold text-roastery-dark">
                      {shipping.cost === 0 ? (
                        <span className="text-roastery-teal uppercase font-bold">Gratis</span>
                      ) : (
                        formatRupiah(shipping.cost)
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Metode Pembayaran (Midtrans Ready) */}
          <div className="editorial-card p-6 bg-white space-y-4 shadow-sm">
            <h2 className="font-editorial text-lg font-bold text-roastery-dark flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-roastery-teal text-white font-mono text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Metode Pembayaran (Midtrans Gateway)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'qris', name: 'QRIS Real-Time', sub: 'GoPay, OVO, ShopeePay, BCA', icon: QrCode },
                { id: 'bca-va', name: 'BCA Virtual Account', sub: 'Otomatis Verifikasi 24 Jam', icon: Building2 },
                { id: 'mandiri-va', name: 'Mandiri Virtual Account', sub: 'Livin by Mandiri / ATM', icon: Building2 },
                { id: 'card', name: 'Kartu Kredit / Debit', sub: 'Visa, Mastercard, JCB', icon: CreditCard },
              ].map((method) => {
                const isSelected = selectedPayment === method.id;
                const Icon = method.icon;
                return (
                  <label
                    key={method.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-roastery-crimson bg-roastery-crimson/5 ring-1 ring-roastery-crimson'
                        : 'border-roastery-border bg-white hover:bg-roastery-light/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={isSelected}
                      onChange={() => setSelectedPayment(method.id)}
                      className="accent-roastery-crimson mt-1"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-roastery-dark flex items-center gap-1.5">
                        <Icon className="w-4 h-4 text-roastery-crimson" />
                        <span>{method.name}</span>
                      </div>
                      <div className="text-[10px] text-roastery-muted mt-0.5">
                        {method.sub}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="editorial-card p-6 bg-white space-y-6 sticky top-28 shadow-sm">
            <h2 className="font-editorial text-xl font-bold text-roastery-dark border-b border-roastery-border pb-4">
              Ringkasan Pesanan Seduh
            </h2>

            {/* Items List */}
            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-roastery-light shrink-0 border border-roastery-border">
                    <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-editorial font-bold text-roastery-dark truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] font-mono text-roastery-muted mt-0.5">
                      {item.weightLabel} • {item.grindLabel}
                    </p>
                    <div className="flex justify-between items-center mt-1 font-mono text-xs">
                      <span className="text-roastery-muted">{item.quantity}x</span>
                      <span className="font-bold text-roastery-dark">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher Form */}
            <div className="pt-4 border-t border-roastery-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Kode Promo (cth: 52COFFEE)"
                  className="flex-1 px-3 py-2 text-xs bg-roastery-light rounded-xl border border-roastery-border focus:outline-none focus:border-roastery-crimson uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  className="btn-secondary text-xs py-2 px-4 bg-white"
                >
                  Pakai
                </button>
              </div>
              {voucherApplied && (
                <p className="text-[11px] font-mono text-roastery-teal mt-1.5 flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> Diskon promo 10% berhasil dipasang!
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs font-mono pt-4 border-t border-roastery-border">
              <div className="flex justify-between text-roastery-charcoal">
                <span>Subtotal Produk</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>

              <div className="flex justify-between text-roastery-charcoal">
                <span>Ongkos Kirim</span>
                <span>
                  {currentShippingCost === 0 ? (
                    <span className="text-roastery-teal font-bold">GRATIS</span>
                  ) : (
                    formatRupiah(currentShippingCost)
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-roastery-teal font-semibold">
                  <span>Diskon Promo</span>
                  <span>- {formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-roastery-dark pt-3 border-t border-roastery-border">
                <span>Total Pembayaran</span>
                <span className="text-roastery-crimson">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary w-full py-4 text-sm font-semibold tracking-wide disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Menghubungkan Midtrans...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatRupiah(grandTotal)})</span>
                </span>
              )}
            </button>

            <div className="text-center text-[11px] text-roastery-muted font-mono">
              Pembayaran aman tersertifikasi Bank Indonesia & Midtrans Snap.
            </div>
          </div>
        </div>
      </form>

      {/* Midtrans Snap Simulation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-roastery-border animate-slide-up text-roastery-dark">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-roastery-crimson text-white font-bold flex items-center justify-center text-xs">
                  52
                </div>
                <div>
                  <h3 className="font-bold text-sm">Midtrans Snap Payment</h3>
                  <p className="text-[10px] text-gray-500 font-mono">Order ID: #{orderId}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-mono font-bold">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>

            {selectedPayment === 'qris' && (
              <div className="text-center space-y-3 py-2">
                <p className="text-xs text-gray-600">Scan QRIS Nasional (GPN) via BCA, Mandiri, GoPay, OVO, ShopeePay:</p>
                <div className="bg-white p-3 rounded-2xl border-2 border-[#8B1E2D] shadow-sm inline-block max-w-[260px] mx-auto text-center">
                  <div className="relative w-56 h-72 mx-auto overflow-hidden rounded-xl bg-white">
                    <Image
                      src="/images/qris-nana-store.jpg"
                      alt="QRIS Nana Store Telecommunication"
                      fill
                      sizes="230px"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 font-mono text-[11px] text-gray-700">
                    <p className="font-bold text-[#162A43]">NANA STORE - TELECOMMUNICATION</p>
                    <p className="text-[10px] text-gray-500">NMID: ID1026579452370 • A01</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center">
                  <a
                    href="/images/qris-nana-store.jpg"
                    download="QRIS-Nana-Store.jpg"
                    className="text-xs font-mono px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Unduh Gambar QRIS</span>
                  </a>
                </div>
              </div>
            )}

            {(selectedPayment === 'bca-va' || selectedPayment === 'mandiri-va') && (
              <div className="space-y-3 py-2 text-xs">
                <p className="text-gray-600">Silakan transfer ke nomor Virtual Account berikut:</p>
                <div className="p-4 bg-gray-50 rounded-xl border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">Nomor Virtual Account</span>
                    <span className="font-mono text-base font-bold text-gray-900">
                      {selectedPayment === 'bca-va' ? '8801 2938 1029 4821' : '8920 1823 9920 1102'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('8801293810294821')}
                    className="p-2 text-roastery-crimson hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono"
                  >
                    {copiedVA ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedVA ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Pembayaran akan diverifikasi secara instan tanpa perlu upload bukti transfer.
                </p>
              </div>
            )}

            {selectedPayment === 'card' && (
              <div className="space-y-3 py-2 text-xs">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-gray-500">Nomor Kartu (Simulasi)</label>
                  <input
                    type="text"
                    defaultValue="4000 1234 5678 9010"
                    className="w-full p-2.5 border rounded-lg bg-gray-50 font-mono text-xs"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-mono text-[10px] uppercase text-gray-500">Expiry</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      className="w-full p-2.5 border rounded-lg bg-gray-50 font-mono text-xs"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] uppercase text-gray-500">CVV</label>
                    <input
                      type="text"
                      defaultValue="888"
                      className="w-full p-2.5 border rounded-lg bg-gray-50 font-mono text-xs"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 text-xs font-medium border rounded-xl hover:bg-gray-50"
              >
                Tutup / Batal
              </button>
              <button
                type="button"
                onClick={handleFinishPayment}
                className="flex-1 py-2.5 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-colors"
              >
                Simulasi Bayar Berhasil ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
