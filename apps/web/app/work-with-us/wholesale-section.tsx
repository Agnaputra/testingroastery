'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Flame,
  TrendingUp,
  Calculator,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { SectionIntro } from '../../components/ui/page-structure';
import { WHATSAPP_URL } from '../../lib/data';

export function WholesaleSection() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [serviceType, setServiceType] = useState('Supplier Roast Beans');
  const [estimatedVolume, setEstimatedVolume] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const whatsAppMessage = `Halo tim 52 Coffee & Roastery. Saya ${contactName || '[nama kontak]'} dari ${businessName || '[nama bisnis]'}${city ? ` di ${city}` : ''}. Saya tertarik dengan layanan ${serviceType}. Estimasi kebutuhan biji kopi: ${estimatedVolume}.${message ? ` Catatan tambahan: ${message}` : ''}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactName || !phone) {
      alert('Mohon lengkapi nama bisnis, nama kontak, dan nomor WhatsApp.');
      return;
    }

    const waUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(whatsAppMessage)}`;

    setSubmitted(true);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* 2. 3 KEY PARTNERSHIP SERVICES */}
      <section id="wholesale-partnership" className="site-container page-section scroll-mt-28">
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
            <h3 className="font-editorial text-xl font-bold text-brand-charcoal">Supplier Roast Beans</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pasokan roast beans terjadwal untuk kedai kopi, restoran, dan hotel dengan SOP mutu dan konsistensi ekstraksi.
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
            <h3 className="font-editorial text-xl font-bold text-brand-charcoal">Label Khusus &amp; Special Blends</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pembuatan signature blend eksklusif dengan profil sangrai yang dirancang khusus untuk identitas brand mitra (seperti BYOB).
            </p>
            <Link href="/work-with-us/blend-builder" className="inline-flex min-h-11 items-center text-xs font-semibold text-brand-maroon hover:underline">Buka konsultasi custom blend →</Link>
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
            <h3 className="font-editorial text-xl font-bold text-brand-charcoal">Consultation Business Beverages</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pendampingan menyeluruh mencakup SOP barista, supply mesin &amp; grinder, perancangan layout coffee bar, kalkulasi HPP cangkir, dan racikan signature menu.
            </p>
            <Link href="/tools/price-calculator" className="inline-flex min-h-11 items-center text-xs font-semibold text-brand-maroon hover:underline">Buka kalkulator HPP →</Link>
          </motion.div>
        </div>
      </section>

      {/* Kalkulator HPP Banner */}
      <section id="kalkulator-hpp" className="site-container pb-4" aria-labelledby="hpp-heading">
        <div className="grid gap-6 border border-border-subtle bg-surface-container-low p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-maroon/10 text-brand-maroon">
              <Calculator className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-maroon">Kemitraan Bisnis</p>
              <h2 id="hpp-heading" className="mt-1 font-editorial text-2xl font-bold text-brand-charcoal">Kalkulator HPP Bisnis</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">Hitung estimasi kebutuhan beans, biaya per sajian, harga jual, dan margin berdasarkan input bisnis Anda sebelum memulai diskusi kemitraan.</p>
            </div>
          </div>
          <Link href="/tools/price-calculator" className="btn-primary shrink-0 text-sm">Buka Kalkulator HPP</Link>
        </div>
      </section>

      {/* 3. B2B INQUIRY FORM */}
      <section id="consultation-form" className="site-container page-section scroll-mt-28">
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
              Ceritakan kebutuhan bisnis Anda. Formulir ini menyiapkan pesan untuk dilanjutkan melalui WhatsApp resmi 52 Coffee (+62 857-9252-4863).
            </p>
          </div>

          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-editorial text-xl font-bold text-brand-navy">
                Pesan siap dikirim di WhatsApp
              </h3>
              <p className="text-sm leading-6 text-on-surface-variant max-w-md mx-auto">
                Periksa percakapan yang terbuka, lalu tekan kirim di WhatsApp. Permintaan belum masuk sebelum pesan tersebut dikirim.
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
                    autoComplete="organization"
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
                    autoComplete="name"
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
                    autoComplete="tel"
                    inputMode="tel"
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
                    autoComplete="street-address"
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
                    <option value="Supplier Roast Beans">Supplier Roast Beans</option>
                    <option value="Label Khusus dan Special Blends">Label Khusus &amp; Special Blends</option>
                    <option value="Consultation Business Beverages">Consultation Business Beverages</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="estimated-volume" className="field-label">
                    Estimasi Kebutuhan Biji Kopi
                  </label>
                  <input
                    id="estimated-volume"
                    type="text"
                    value={estimatedVolume}
                    onChange={(e) => setEstimatedVolume(e.target.value)}
                    placeholder="Contoh: 25 kg / bulan atau sesuai kebutuhan kedai"
                    className="field-control"
                  />
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

              <div className="border border-border-subtle bg-surface-container-low p-4" aria-live="polite">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-maroon">Preview pesan WhatsApp</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-brand-charcoal">{whatsAppMessage}</p>
                <p className="mt-2 text-[11px] leading-5 text-on-surface-variant">Pesan ini belum dikirim. Tombol di bawah akan membuka WhatsApp dengan pesan yang sudah terisi.</p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Kirim melalui WhatsApp</span>
              </button>
            </form>
          )}
        </motion.div>
      </section>
    </>
  );
}
