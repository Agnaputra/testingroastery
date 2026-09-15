'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Flame,
  TrendingUp,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { PageIntro, SectionIntro } from '../../components/ui/page-structure';

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
      className="page-shell nav-offset"
    >
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Proportionate Height & Seamless Navbar Integration)       */}
      {/* ========================================================================= */}
      <PageIntro
        className="partnership-hero"
        tone="dark"
        kicker="Kemitraan B2B 52 Coffee"
        icon={<Package size={14} />}
        title="Kopi konsisten untuk bisnis yang terus tumbuh."
        description="Kami mendampingi kedai kopi, restoran, dan hotel menjaga mutu sajian melalui pasokan kopi, racikan khusus, dan dukungan operasional yang terukur."
      />

      {/* ========================================================================= */}
      {/* 2. 4 KEY PARTNERSHIP SERVICES                                             */}
      {/* ========================================================================= */}
      <section className="site-container page-section">
        <SectionIntro
          className="partnership-section-intro"
          align="center"
          kicker="Solusi kemitraan"
          title="Layanan roastery untuk bisnis Anda"
          description="Pilih dukungan yang paling sesuai dengan tahap dan kebutuhan operasional bisnis Anda."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="ui-surface p-6 space-y-3 group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#49697a]/25 bg-[#49697a]/10 text-[#49697a] transition-transform group-hover:scale-105">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-gray-500 block font-bold">Layanan 1</span>
            <h3 className="font-editorial text-xl font-bold text-brand-charcoal">Pasokan Biji Kopi Grosir</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pasokan rutin kemasan bulk 1kg untuk kebutuhan kedai kopi, restoran, dan hotel dengan harga grosir kompetitif dan konsistensi batch 99.8%.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="ui-surface p-6 space-y-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-gray-500 block font-bold">Layanan 2</span>
            <h3 className="font-editorial text-xl font-bold text-brand-charcoal">House Blend &amp; Label Khusus</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Kembangkan racikan house blend eksklusif dengan merek kedai kopi Anda sendiri. Kami bantu kurasi green bean hingga profil sangrai.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="ui-surface p-6 space-y-3 group"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-charcoal/10 border border-brand-charcoal/20 flex items-center justify-center text-brand-charcoal group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono uppercase text-gray-500 block font-bold">Layanan 3</span>
            <h3 className="font-editorial text-xl font-bold text-brand-charcoal">Konsultasi Bisnis Kedai</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Konsultasi alur kerja bar, pemilihan mesin espresso &amp; grinder komersial, hingga kalkulasi HPP cangkir untuk profitabilitas bisnis kopi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. B2B INQUIRY FORM                                                       */}
      {/* ========================================================================= */}
      <section className="site-container page-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="ui-surface mx-auto max-w-4xl p-6 sm:p-10 space-y-8"
        >
          <div className="border-b border-border-subtle pb-5 space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-brand-navy">
              Mulai Diskusi Kemitraan
            </h2>
            <p className="text-sm leading-6 text-on-surface-variant">
              Ceritakan kebutuhan bisnis Anda. Setelah formulir dikirim, percakapan akan dilanjutkan melalui WhatsApp.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-editorial text-xl font-bold text-brand-navy">
                Permintaan kemitraan siap ditindaklanjuti
              </h3>
              <p className="text-sm leading-6 text-on-surface-variant max-w-md mx-auto">
                Tim kami akan menghubungi Anda melalui WhatsApp di <strong>{phone}</strong> untuk menindaklanjuti kebutuhan pasokan dan sampel kopi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="business-name" className="field-label">
                    Nama Bisnis / Kedai Kopi
                  </label>
                  <input
                    id="business-name"
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: Kopi Seduh Santai"
                    className="field-control"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="field-label">
                    Nama Penanggung Jawab
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="field-control"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="business-phone" className="field-label">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    id="business-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="field-control"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="business-location" className="field-label">
                    Alamat / Lokasi Bisnis
                  </label>
                  <input
                    id="business-location"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jl. Ijen No. 52, Malang / Surabaya"
                    className="field-control"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="service-type" className="field-label">
                    Jenis Layanan Kemitraan
                  </label>
                  <select
                    id="service-type"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="field-control"
                  >
                    <option value="Pasokan Biji Kopi Grosir">Pasokan Biji Kopi Grosir (1 kg)</option>
                    <option value="House Blend dan Label Khusus">House Blend &amp; Label Khusus</option>
                    <option value="Konsultasi Bisnis Kedai">Konsultasi Bisnis Kedai</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="estimated-volume" className="field-label">
                    Estimasi Kebutuhan Biji Kopi
                  </label>
                  <select
                    id="estimated-volume"
                    value={estimatedVolume}
                    onChange={(e) => setEstimatedVolume(e.target.value)}
                    className="field-control"
                  >
                    <option value="< 10 kg / bulan">&lt; 10 kg / bulan (Kedai Rintisan)</option>
                    <option value="10 - 30 kg / bulan">10 - 30 kg / bulan (Kedai Reguler)</option>
                    <option value="30 - 100 kg / bulan">30 - 100 kg / bulan (Kedai Volume Tinggi)</option>
                    <option value="> 100 kg / bulan">&gt; 100 kg / bulan (Multi-Outlet / Distributor)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="partnership-notes" className="field-label">
                  Catatan Tambahan / Profil Rasa yang Dicari
                </label>
                <textarea
                  id="partnership-notes"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ceritakan profil rasa yang diinginkan atau preferensi mesin yang digunakan..."
                  className="field-control min-h-28 resize-y"
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
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
