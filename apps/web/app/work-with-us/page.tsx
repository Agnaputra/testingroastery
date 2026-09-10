'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Package,
  Flame,
  TrendingUp,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export default function WorkWithUsPage() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [serviceType, setServiceType] = useState('Pasokan Biji Kopi Grosir');
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
      className="w-full bg-[#FAFAFA] text-[#162A43] antialiased font-sans"
    >
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Proportionate Height & Seamless Navbar Integration)       */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-brand-charcoal py-14 sm:py-20">
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <div className="absolute -right-28 -top-44 h-[34rem] w-[34rem] rounded-full border-[72px] border-[#465c70]" />
          <div className="absolute -bottom-56 -left-36 h-[32rem] w-[42rem] rounded-[50%] border-[64px] border-[#52627a]" />
        </div>

        <div className="site-container relative z-20 grid items-center gap-10 text-white lg:grid-cols-[1.05fr_.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl space-y-5"
          >
            <div className="inline-flex items-center space-x-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#8fb9bc]" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white/85">
                Kemitraan B2B 52 Coffee
              </span>
            </div>

            <h1 className="max-w-xl font-editorial text-4xl font-bold leading-[1.04] tracking-[-0.03em] text-white sm:text-6xl">
              Kopi yang konsisten untuk bisnis yang terus tumbuh.
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans max-w-xl">
              Kami bukan sekadar pemasok biji kopi — kami bermitra dengan kedai kopi, restoran, dan hotel untuk menyajikan kualitas specialty coffee terbaik secara konsisten.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="relative mx-auto aspect-[1.74/1] w-full max-w-[610px] overflow-hidden rounded-2xl border border-white/15 bg-[#182237] shadow-[0_28px_70px_rgba(0,0,0,.28)]"
          >
            <div className="absolute -right-12 -top-32 h-64 w-80 rounded-[50%] border-[34px] border-[#47536c]/65" aria-hidden="true" />
            <div className="absolute -bottom-32 -left-24 h-56 w-[34rem] rounded-[50%] border-[42px] border-[#4b5872]/80" aria-hidden="true" />
            <div className="absolute inset-0 flex items-center justify-center gap-4 px-8">
              <Image src="/images/logo.png" alt="" width={112} height={82} className="h-auto w-24 brightness-0 invert sm:w-28" aria-hidden="true" />
              <span className="font-editorial text-2xl font-bold leading-tight text-white sm:text-3xl">52 Coffee<br />Roastery</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. 4 KEY PARTNERSHIP SERVICES                                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#A52136] font-bold block">
            Solusi Kemitraan
          </span>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#162A43]">
            Layanan Roastery untuk Bisnis Anda
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="p-6 rounded-3xl bg-white border border-gray-200 space-y-3 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#A52136]/10 border border-[#A52136]/20 flex items-center justify-center text-[#A52136] group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-gray-500 block font-bold">Layanan 1</span>
            <h3 className="font-editorial text-xl font-bold text-[#162A43]">Pasokan Biji Kopi Grosir</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pasokan rutin kemasan bulk 1kg untuk kebutuhan kedai kopi, restoran, dan hotel dengan harga grosir kompetitif dan konsistensi batch 99.8%.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 rounded-3xl bg-white border border-gray-200 space-y-3 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#246A73]/10 border border-[#246A73]/20 flex items-center justify-center text-[#246A73] group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-gray-500 block font-bold">Layanan 2</span>
            <h3 className="font-editorial text-xl font-bold text-[#162A43]">House Blend &amp; Label Khusus</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Kembangkan racikan house blend eksklusif dengan merek kedai kopi Anda sendiri. Kami bantu kurasi green bean hingga profil sangrai.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="p-6 rounded-3xl bg-white border border-gray-200 space-y-3 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#162A43]/10 border border-[#162A43]/20 flex items-center justify-center text-[#162A43] group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-gray-500 block font-bold">Layanan 3</span>
            <h3 className="font-editorial text-xl font-bold text-[#162A43]">Konsultasi Bisnis Kedai</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
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
          className="p-6 sm:p-10 rounded-3xl bg-white border border-gray-200 space-y-8 shadow-xl"
        >
          <div className="border-b border-gray-200 pb-4 space-y-1">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#162A43]">
              Mulai Diskusi Kemitraan
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Isi formulir untuk meminta sampel kopi dan membicarakan kebutuhan bisnis Anda bersama tim kami.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-editorial text-xl font-bold text-[#162A43]">
                Pesan Kemitraan Terkirim!
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                Tim kami akan menghubungi Anda melalui WhatsApp di <strong>{phone}</strong> untuk menindaklanjuti kebutuhan pasokan dan sampel kopi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#162A43] font-semibold block">
                    Nama Bisnis / Kedai Kopi
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Kopi Seduh Santai"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-300 text-[#162A43] text-xs sm:text-sm focus:outline-none focus:border-[#162A43]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#162A43] font-semibold block">
                    Nama Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-300 text-[#162A43] text-xs sm:text-sm focus:outline-none focus:border-[#162A43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#162A43] font-semibold block">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-300 text-[#162A43] text-xs sm:text-sm focus:outline-none focus:border-[#162A43]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#162A43] font-semibold block">
                    Alamat / Lokasi Bisnis
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jl. Ijen No. 52, Malang / Surabaya"
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-300 text-[#162A43] text-xs sm:text-sm focus:outline-none focus:border-[#162A43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#162A43] font-semibold block">
                    Jenis Layanan Kemitraan
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-300 text-[#162A43] text-xs sm:text-sm focus:outline-none focus:border-[#162A43]"
                  >
                    <option value="Pasokan Biji Kopi Grosir">Pasokan Biji Kopi Grosir (1 kg)</option>
                    <option value="House Blend dan Label Khusus">House Blend &amp; Label Khusus</option>
                    <option value="Konsultasi Bisnis Kedai">Konsultasi Bisnis Kedai</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-[#162A43] font-semibold block">
                    Estimasi Kebutuhan Biji Kopi
                  </label>
                  <select
                    value={estimatedVolume}
                    onChange={(e) => setEstimatedVolume(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-300 text-[#162A43] text-xs sm:text-sm focus:outline-none focus:border-[#162A43]"
                  >
                    <option value="< 10 kg / bulan">&lt; 10 kg / bulan (Kedai Rintisan)</option>
                    <option value="10 - 30 kg / bulan">10 - 30 kg / bulan (Kedai Reguler)</option>
                    <option value="30 - 100 kg / bulan">30 - 100 kg / bulan (Kedai Volume Tinggi)</option>
                    <option value="> 100 kg / bulan">&gt; 100 kg / bulan (Multi-Outlet / Distributor)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#162A43] font-semibold block">
                  Catatan Tambahan / Profil Rasa yang Dicari
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan profil rasa yang diinginkan atau preferensi mesin yang digunakan..."
                  className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-gray-300 text-[#162A43] text-xs sm:text-sm focus:outline-none focus:border-[#162A43]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#162A43] hover:bg-[#2C3136] text-white font-mono font-bold text-xs sm:text-sm py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Kirim melalui WhatsApp</span>
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </motion.div>
  );
}
