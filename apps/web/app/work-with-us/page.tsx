'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Package,
  Flame,
  Users,
  TrendingUp,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export default function WorkWithUsPage() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [serviceType, setServiceType] = useState('Wholesale Coffee Beans');
  const [estimatedVolume, setEstimatedVolume] = useState('10 - 30 kg / bulan');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactName || !phone) {
      alert('Mohon lengkapi nama bisnis, nama kontak, dan nomor WhatsApp.');
      return;
    }

    const text = `Halo Roaster 52 Coffee! Saya ${contactName} dari ${businessName} (${city}). Tertarik dengan program kemitraan ${serviceType} (Estimasi volume: ${estimatedVolume}). Catatan: ${message}`;
    const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;

    setSubmitted(true);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="w-full bg-surface-white text-on-surface antialiased font-sans">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs font-mono">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-border-subtle text-roastery-charcoal hover:text-roastery-crimson hover:border-roastery-crimson transition-all shadow-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-on-secondary-container hidden sm:inline">52 Coffee B2B Solutions</span>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Exact Figma Layout & Roastery Image)                     */}
      {/* ========================================================================= */}
      <section className="relative w-full h-[750px] sm:h-[870px] min-h-[600px] flex items-center justify-start overflow-hidden bg-[#141b2b]">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 w-full h-full mix-blend-luminosity opacity-40 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/roaster-footage.png')`,
          }}
        />
        {/* Gradient Overlay for Text Readability */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to right, rgba(18, 28, 40, 0.9) 0%, rgba(18, 28, 40, 0.3) 100%)',
          }}
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-6">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-[#10B981] rounded-full animate-pulse"></span>
              <span className="font-mono text-xs text-[#e6bdb8] tracking-widest uppercase font-bold">
                Partnership Program / 52 Coffee
              </span>
            </div>

            <h1 className="font-editorial text-5xl sm:text-7xl font-black text-white leading-tight">
              Work with <br />
              <span className="text-roastery-crimson-light">52 Coffee.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-xl leading-relaxed">
              We don&#39;t just provide coffee — we co-create unforgettable experiences. Join our network of elite cafes and restaurants dedicated to exceptional craft.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. 4 KEY PARTNERSHIP SERVICES                                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-surface-container-low border border-border-subtle space-y-3 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-roastery-crimson/10 border border-roastery-crimson/20 flex items-center justify-center text-roastery-crimson">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-roastery-muted block font-bold">Layanan 1</span>
            <h3 className="font-editorial text-xl font-bold text-on-surface">Wholesale Beans</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pasokan rutin kemasan bulk 1kg untuk kebutuhan kedai kopi, restoran, dan hotel dengan harga grosir kompetitif dan konsistensi batch 99.8%.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-low border border-border-subtle space-y-3 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/10 border border-teal-600/20 flex items-center justify-center text-teal-600">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-roastery-muted block font-bold">Layanan 2</span>
            <h3 className="font-editorial text-xl font-bold text-on-surface">Custom White-Label</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Kembangkan racikan house blend eksklusif dengan merek kedai kopi Anda sendiri. Kami bantu kurasi green bean hingga desain profil sangrai.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-low border border-border-subtle space-y-3 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-600">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-roastery-muted block font-bold">Layanan 3</span>
            <h3 className="font-editorial text-xl font-bold text-on-surface">Barista &amp; Sensory</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pelatihan kalibrasi espresso harian, teknik manual brew pour-over, latte art, serta pemahaman sensorik SCA untuk tim barista Anda.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface-container-low border border-border-subtle space-y-3 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-roastery-dark/10 border border-roastery-dark/20 flex items-center justify-center text-roastery-dark">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-roastery-muted block font-bold">Layanan 4</span>
            <h3 className="font-editorial text-xl font-bold text-on-surface">Cafe Consulting</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Konsultasi alur kerja bar, pemilihan mesin espresso &amp; grinder komersial, hingga kalkulasi HPP cangkir untuk profitabilitas bisnis kopi.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. B2B INQUIRY FORM                                                       */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-border-subtle space-y-8 shadow-xl">
          <div className="border-b border-border-subtle pb-4 space-y-1">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-on-surface">
              Mulai Diskusi Kemitraan
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Isi formulir di bawah untuk mendapatkan sample pack kopi gratis dan konsultasi kebutuhan bisnis Anda.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
              <h3 className="font-editorial text-xl font-bold text-roastery-dark">
                Pesan Kemitraan Terkirim!
              </h3>
              <p className="text-xs sm:text-sm text-roastery-charcoal max-w-md mx-auto">
                Tim roastery kami akan segera menghubungi Anda melalui nomor WhatsApp <strong>{phone}</strong> untuk mengirimkan katalog wholesale &amp; sample biji kopi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Nama Bisnis / Kedai Kopi *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Kopi Seduh Santai"
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-roastery-crimson"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Nama Kontak (PIC) *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-roastery-crimson"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-roastery-crimson font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Kota / Wilayah *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Malang, Surabaya, Jakarta..."
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-roastery-crimson"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Jenis Layanan yang Diminati:
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-roastery-crimson cursor-pointer"
                  >
                    <option value="Wholesale Coffee Beans">Pasokan Biji Kopi Grosir (Wholesale)</option>
                    <option value="Custom White-Label Roasting">Custom White-Label House Blend</option>
                    <option value="Barista Training & Calibration">Pelatihan Barista &amp; Kalibrasi</option>
                    <option value="Full Cafe Consulting">Konsultasi Pembukaan Kedai Kopi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Estimasi Kebutuhan Bulanan:
                  </label>
                  <select
                    value={estimatedVolume}
                    onChange={(e) => setEstimatedVolume(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-roastery-crimson cursor-pointer"
                  >
                    <option value="5 - 10 kg / bulan">5 - 10 kg / bulan (Kedai Rintisan)</option>
                    <option value="10 - 30 kg / bulan">10 - 30 kg / bulan (Kedai Reguler)</option>
                    <option value="30 - 100 kg / bulan">30 - 100 kg / bulan (High Volume Cafe)</option>
                    <option value="> 100 kg / bulan">&gt; 100 kg / bulan (Multi-Outlet / Distributor)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-on-surface font-semibold block">
                  Catatan Tambahan / Profil Rasa yang Dicari:
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan profil rasa yang diinginkan atau preferensi mesin yang digunakan..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-roastery-crimson"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-roastery-crimson text-white font-mono font-bold text-xs sm:text-sm py-4 rounded-xl hover:bg-roastery-crimson-dark transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>Kirim &amp; Terhubung ke WhatsApp Roastery</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
