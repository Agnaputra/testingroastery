'use client';

import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { WHATSAPP_URL } from '../../../lib/data';

export function ConsultationFormSection() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [serviceType, setServiceType] = useState('Supplier Roast Beans');
  const [estimatedVolume, setEstimatedVolume] = useState('10 - 30 kg / bulan (Kedai Reguler)');
  const [customVolume, setCustomVolume] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const effectiveVolume = estimatedVolume === 'Lainnya (Tulis sendiri)' ? (customVolume || 'Sesuai kebutuhan') : estimatedVolume;

  const whatsAppMessage = `Halo Roaster 52 Coffee! Saya ${contactName || '[Nama Penanggung Jawab]'} dari ${businessName || '[Nama Bisnis]'}${city ? ` di ${city}` : ''}.
Tertarik dengan program kemitraan: ${serviceType}.
Estimasi volume: ${effectiveVolume}.
Nomor WA: ${phone || '-'}.${notes ? `\nCatatan kebutuhan: ${notes}` : ''}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactName || !phone) {
      alert('Mohon lengkapi Nama Bisnis, Nama Penanggung Jawab, dan Nomor WhatsApp.');
      return;
    }

    const waUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(whatsAppMessage)}`;
    setSubmitted(true);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      {submitted ? (
        <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-editorial text-2xl font-bold text-brand-charcoal">
            Format Pesan WhatsApp Berhasil Disusun!
          </h3>
          <p className="text-sm leading-6 text-on-surface-variant max-w-md mx-auto">
            Halaman WhatsApp resmi 52 Coffee telah terbuka. Silakan tekan tombol kirim di WhatsApp untuk memulai dialog langsung bersama tim roastery kami.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#2C3136] bg-white px-5 py-2 font-mono text-xs font-bold text-[#2C3136] hover:bg-surface-container-low transition-colors"
          >
            Edit Formulir Kembali
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="b2b-biz-name" className="field-label font-bold text-brand-charcoal text-xs">
                Nama Bisnis / Kedai Kopi *
              </label>
              <input
                id="b2b-biz-name"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Contoh: Kopi Seduh Santai"
                className="field-control rounded-xl border-2 border-gray-200 focus:border-[#2C3136]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="b2b-contact-name" className="field-label font-bold text-brand-charcoal text-xs">
                Nama Penanggung Jawab *
              </label>
              <input
                id="b2b-contact-name"
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="field-control rounded-xl border-2 border-gray-200 focus:border-[#2C3136]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="b2b-phone" className="field-label font-bold text-brand-charcoal text-xs">
                Nomor WhatsApp Aktif *
              </label>
              <input
                id="b2b-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="field-control rounded-xl border-2 border-gray-200 focus:border-[#2C3136]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="b2b-city" className="field-label font-bold text-brand-charcoal text-xs">
                Alamat / Lokasi Bisnis
              </label>
              <input
                id="b2b-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Jl. Ijen No. 52, Malang"
                className="field-control rounded-xl border-2 border-gray-200 focus:border-[#2C3136]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="b2b-service" className="field-label font-bold text-brand-charcoal text-xs">
                Jenis Layanan Kemitraan
              </label>
              <select
                id="b2b-service"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="field-control rounded-xl border-2 border-gray-200 focus:border-[#2C3136]"
              >
                <option value="Supplier Roast Beans">1. Supplier Roast Beans (Pasokan Rutin)</option>
                <option value="Label Khusus & Special Blends (BYOB)">2. Label Khusus &amp; Special Blends (BYOB)</option>
                <option value="Consultation Business Beverages">3. Consultation Business Beverages (SOP, Mesin, Layout Bar, HPP)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="b2b-volume" className="field-label font-bold text-brand-charcoal text-xs">
                Estimasi Kebutuhan Biji Kopi
              </label>
              <select
                id="b2b-volume"
                value={estimatedVolume}
                onChange={(e) => setEstimatedVolume(e.target.value)}
                className="field-control rounded-xl border-2 border-gray-200 focus:border-[#2C3136]"
              >
                <option value="< 10 kg / bulan (Kedai Rintisan)">&lt; 10 kg / bulan (Kedai Rintisan)</option>
                <option value="10 - 30 kg / bulan (Kedai Reguler)">10 - 30 kg / bulan (Kedai Reguler)</option>
                <option value="30 - 100 kg / bulan (Kedai Volume Tinggi)">30 - 100 kg / bulan (Kedai Volume Tinggi)</option>
                <option value="> 100 kg / bulan (Multi-Outlet / Distributor)">&gt; 100 kg / bulan (Multi-Outlet / Distributor)</option>
                <option value="Lainnya (Tulis sendiri)">Lainnya (Tulis sendiri)</option>
              </select>
            </div>
          </div>

          {estimatedVolume === 'Lainnya (Tulis sendiri)' && (
            <div className="space-y-2">
              <label htmlFor="b2b-custom-volume" className="field-label font-bold text-brand-charcoal text-xs">
                Tuliskan Kebutuhan Volume Anda
              </label>
              <input
                id="b2b-custom-volume"
                type="text"
                value={customVolume}
                onChange={(e) => setCustomVolume(e.target.value)}
                placeholder="Contoh: 15-20 kg per 2 minggu"
                className="field-control rounded-xl border-2 border-gray-200 focus:border-[#2C3136]"
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="b2b-notes" className="field-label font-bold text-brand-charcoal text-xs">
              Catatan Kebutuhan / Karakter Rasa yang Dicari
            </label>
            <textarea
              id="b2b-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Mencari beans espresso bold untuk es kopi susu gula aren, serta filter beans fruity untuk manual brew bar."
              className="field-control rounded-xl border-2 border-gray-200 focus:border-[#2C3136] resize-y"
            />
          </div>

          {/* Standardized WhatsApp Preview */}
          <div className="rounded-xl border border-dashed border-[#2C3136]/30 bg-surface-container-low p-4 font-mono text-xs text-on-surface-variant space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#2C3136]">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Standarisasi Format Pesan WhatsApp:</span>
            </div>
            <p className="whitespace-pre-line text-[11px] text-gray-700 italic bg-white p-3 rounded-lg border border-gray-200 mt-2">
              {whatsAppMessage}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-on-surface-variant">
              WhatsApp Resmi: <span className="font-bold text-[#2C3136]">+62 857-9252-4863</span> (Senin - Minggu 10:00 - 20:00 WIB)
            </p>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#2C3136] bg-[#2C3136] px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white hover:bg-[#8FB9BC] hover:text-[#2C3136] transition-all shadow-[2px_2px_0px_#2C3136]"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Formulir via WhatsApp</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

