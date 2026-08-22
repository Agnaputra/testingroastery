'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Flame,
  Users,
  TrendingUp,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowRight,
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full bg-surface-white text-on-surface antialiased font-sans"
    >
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Proportionate Height & Seamless Navbar Integration)       */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[480px] sm:min-h-[540px] pt-28 pb-16 flex items-center justify-start overflow-hidden bg-[#141b2b]">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 w-full h-full mix-blend-luminosity opacity-40 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/roaster-footage.png')`,
          }}
        />
        {/* Gradient Overlay for Crisp Text Readability */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to right, rgba(14, 23, 37, 0.95) 0%, rgba(14, 23, 37, 0.65) 50%, rgba(14, 23, 37, 0.35) 100%)',
          }}
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl space-y-4"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="font-mono text-[11px] text-gray-200 tracking-wider uppercase font-bold">
                52 Coffee B2B Partnership
              </span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-white leading-tight tracking-tight">
              Work with <br />
              <span className="text-[#e6bdb8]">52 Coffee &amp; Roastery.</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans max-w-xl">
              Kami bukan sekadar pemasok biji kopi — kami bermitra dengan kedai kopi, restoran, dan hotel untuk menyajikan kualitas specialty coffee terbaik secara konsisten.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. 4 KEY PARTNERSHIP SERVICES                                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-brand-maroon font-bold block">
            Solusi Kemitraan
          </span>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-brand-navy">
            Layanan Roastery untuk Bisnis Anda
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="p-6 rounded-3xl bg-surface-container-low border border-border-subtle space-y-3 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-maroon/10 border border-brand-maroon/20 flex items-center justify-center text-brand-maroon group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">Layanan 1</span>
            <h3 className="font-editorial text-xl font-bold text-brand-navy">Wholesale Beans</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pasokan rutin kemasan bulk 1kg untuk kebutuhan kedai kopi, restoran, dan hotel dengan harga grosir kompetitif dan konsistensi batch 99.8%.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 rounded-3xl bg-surface-container-low border border-border-subtle space-y-3 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center text-brand-teal group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">Layanan 2</span>
            <h3 className="font-editorial text-xl font-bold text-brand-navy">Custom White-Label</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Kembangkan racikan house blend eksklusif dengan merek kedai kopi Anda sendiri. Kami bantu kurasi green bean hingga profil sangrai.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="p-6 rounded-3xl bg-surface-container-low border border-border-subtle space-y-3 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">Layanan 3</span>
            <h3 className="font-editorial text-xl font-bold text-brand-navy">Barista &amp; Sensory</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pelatihan kalibrasi espresso harian, teknik manual brew pour-over, latte art, serta pemahaman sensorik SCA untuk tim barista Anda.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-3xl bg-surface-container-low border border-border-subtle space-y-3 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-on-surface-variant block font-bold">Layanan 4</span>
            <h3 className="font-editorial text-xl font-bold text-brand-navy">Cafe Consulting</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Konsultasi alur kerja bar, pemilihan mesin espresso &amp; grinder komersial, hingga kalkulasi HPP cangkir untuk profitabilitas bisnis kopi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. B2B INQUIRY FORM                                                       */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="p-6 sm:p-10 rounded-3xl bg-white border border-border-subtle space-y-8 shadow-xl"
        >
          <div className="border-b border-border-subtle pb-4 space-y-1">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-brand-navy">
              Mulai Diskusi Kemitraan
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Isi formulir di bawah untuk mendapatkan sample pack kopi dan konsultasi kebutuhan bisnis Anda bersama tim roastery.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-editorial text-xl font-bold text-brand-navy">
                Pesan Kemitraan Terkirim!
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto">
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
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Nama Penanggung Jawab *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Kota / Lokasi Bisnis
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Malang, Surabaya, Jakarta"
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Jenis Layanan Kemitraan:
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                  >
                    <option value="Wholesale Coffee Beans">Wholesale Coffee Beans (Bulk 1kg)</option>
                    <option value="Custom Blend & Profile">Custom Blend &amp; Roasting Profile</option>
                    <option value="White Label Packaging">White-Label Packaging Kedai</option>
                    <option value="Barista Training & Consulting">Pelatihan Barista &amp; Konsultasi</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-on-surface font-semibold block">
                    Estimasi Kebutuhan Biji Kopi:
                  </label>
                  <select
                    value={estimatedVolume}
                    onChange={(e) => setEstimatedVolume(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                  >
                    <option value="< 10 kg / bulan">&lt; 10 kg / bulan (Kedai Rintisan)</option>
                    <option value="10 - 30 kg / bulan">10 - 30 kg / bulan (Standard Cafe)</option>
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
                  className="w-full px-4 py-3 rounded-xl bg-surface-bright border border-border-subtle text-on-surface text-xs sm:text-sm focus:outline-none focus:border-brand-navy"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-mono font-bold text-xs sm:text-sm py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Kirim &amp; Terhubung ke WhatsApp Roastery</span>
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
}
