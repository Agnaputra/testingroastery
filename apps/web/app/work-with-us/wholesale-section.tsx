'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Package,
  Flame,
  TrendingUp,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { SectionIntro } from '../../components/ui/page-structure';
import { ReserveLayout } from '../../components/ui/reserve-layout';
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
      <section id="wholesale-services" className="site-container scroll-mt-28 py-20 sm:py-28">
        <SectionIntro
          className="partnership-section-intro"
          align="left"
          kicker="Solusi kemitraan"
          title="Kopi yang tepat untuk cara kerjamu."
          description="Tiga pilihan kerja sama, dari pasokan rutin hingga pengembangan menu."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3 editorial-reveal-list">
          {[
            { label: 'Pasokan rutin', title: 'Supplier Roast Beans', description: 'Roasted beans dengan profil rasa dan jadwal pasokan yang disepakati untuk operasional harian.', image: '/images/canva-pouch-showcase.jpg', alt: 'Kemasan roasted beans 52 Coffee', href: '#wholesale-partnership', action: 'Diskusikan pasokan' },
            { label: 'Identitas rasa', title: 'Label Khusus & Special Blends', description: 'Kembangkan karakter kopi untuk menu dan identitas bisnismu bersama tim roastery.', image: '/images/byob-roaster-craft.jpg', alt: 'Proses meracik dan menyangrai blend', href: '/work-with-us/consultations#byob', action: 'Rancang custom blend' },
            { label: 'Pendampingan', title: 'Consultation Business Beverages', description: 'Diskusikan peralatan, SOP seduh, menu, dan biaya per sajian sebelum mengambil keputusan.', image: '/images/canva-cafe-table.jpg', alt: 'Penyajian kopi di meja kafe', href: '/work-with-us/consultations#consultation-form', action: 'Mulai konsultasi' },
          ].map((service) => (
            <article key={service.title} className="group overflow-hidden rounded-xl border border-border-subtle bg-white">
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-mist"><Image src={service.image} alt={service.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div>
              <div className="space-y-3 p-6"><span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-brand-maroon">{service.label}</span><h3 className="font-editorial text-xl font-bold text-brand-charcoal">{service.title}</h3><p className="min-h-20 text-sm leading-6 text-on-surface-variant">{service.description}</p><Link href={service.href} className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-maroon underline-offset-4 hover:underline">{service.action} →</Link></div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container pb-20 sm:pb-28 editorial-reveal" aria-labelledby="supply-process-title">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-maroon">Dari brief ke pasokan</p>
        <h2 id="supply-process-title" className="mt-3 max-w-[22ch] font-editorial text-3xl font-extrabold text-brand-charcoal sm:text-4xl">Proses yang jelas untuk bisnis Anda.</h2>
        <ol className="mt-8 grid border-y border-border-subtle md:grid-cols-3">
          {[
            ['01', 'Ceritakan kebutuhan', 'Jenis usaha, menu, volume, dan target rasa.'],
            ['02', 'Coba dan sesuaikan', 'Kami diskusikan pilihan beans atau sampel blend.'],
            ['03', 'Tetapkan pasokan', 'Sepakati spesifikasi, jumlah, dan jadwal bersama tim.'],
          ].map(([number, title, description]) => (
            <li key={number} className="border-b border-border-subtle py-5 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
              <span className="font-mono text-xs font-bold text-brand-maroon">{number}</span>
              <h3 className="mt-7 font-editorial text-lg font-bold text-brand-charcoal">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. B2B INQUIRY FORM */}
      <ReserveLayout
        id="wholesale-partnership"
        tone="maroon"
        kicker="Wholesale partnership"
        title="Bangun pasokan yang konsisten."
        description="Ceritakan kebutuhan operasional bisnis Anda. Tim roastery membantu menentukan layanan, volume, dan arah kopi yang paling masuk akal."
        details={[
          { icon: <Package className="h-4 w-4" aria-hidden="true" />, title: 'Supplier roast beans', description: 'Pasokan terjadwal dengan standar mutu dan ekstraksi.' },
          { icon: <Flame className="h-4 w-4" aria-hidden="true" />, title: 'Special blends', description: 'Profil sangrai dan racikan yang mewakili identitas bisnis.' },
          { icon: <TrendingUp className="h-4 w-4" aria-hidden="true" />, title: 'Business consultation', description: 'SOP, peralatan, layout bar, HPP, dan menu signature.' },
        ]}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="space-y-8"
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
      </ReserveLayout>
    </>
  );
}
