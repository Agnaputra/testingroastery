'use client';

import { useState, type FormEvent, type InputHTMLAttributes } from 'react';
import { MessageCircle } from 'lucide-react';
import { formatRupiah, WHATSAPP_URL } from '../lib/data';

export interface ConsultationCoffeeSelection {
  sourceLabel: string;
  beanLabel: string;
  priceBasis: string;
  beanPricePerKg: number;
  tastingNotes: string[];
  doseGrams: number;
  targetCups: number;
  operationalDays: number;
  directCostPerCup: number;
  beanKg: number;
}

export function PartnershipBlendBrief({ selection }: { selection: ConsultationCoffeeSelection }) {
  const [opened, setOpened] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      'Halo 52 Coffee, saya ingin mendiskusikan custom blend untuk bisnis.',
      '',
      `Bisnis: ${data.get('businessName')}`,
      `Kontak: ${data.get('contactName')}`,
      `WhatsApp: ${data.get('whatsapp')}`,
      `Kota: ${data.get('city')}`,
      `Jenis bisnis: ${data.get('businessType')}`,
      `Penggunaan: ${data.get('useCase')}`,
      `Arah rasa: ${data.get('profile')}`,
      '',
      'Pilihan beans & simulasi HPP:',
      `Sumber: ${selection.sourceLabel}`,
      `Beans: ${selection.beanLabel}`,
      `Dasar harga: ${selection.priceBasis}`,
      `Harga setara: ${formatRupiah(selection.beanPricePerKg)}/kg`,
      `Tasting notes: ${selection.tastingNotes.join(' · ') || '-'}`,
      `Dosis: ${selection.doseGrams} g/cangkir`,
      `Target: ${selection.targetCups} cangkir/hari × ${selection.operationalDays} hari`,
      `Estimasi kebutuhan: ${selection.beanKg.toFixed(1)} kg/bulan`,
      `Estimasi biaya langsung: ${formatRupiah(selection.directCostPerCup)}/cangkir`,
      '',
      `Estimasi pemakaian: ${data.get('usage') || 'Belum ditentukan'}`,
      `Peralatan: ${data.get('equipment') || 'Belum diinformasikan'}`,
      `Catatan: ${data.get('notes') || '-'}`,
    ].join('\n');

    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setOpened(true);
  }

  return (
    <form onSubmit={submit} className="ui-surface grid gap-8 p-6 sm:p-8" aria-describedby="blend-brief-note">
      <section aria-labelledby="coffee-selection-heading" className="border-b border-border-subtle pb-7">
        <h3 id="coffee-selection-heading" className="font-editorial text-xl font-bold text-brand-charcoal">Pilihan dari kalkulator</h3>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-on-surface-variant">Sumber beans</dt><dd className="mt-1 font-semibold text-brand-charcoal">{selection.sourceLabel}</dd></div>
          <div><dt className="text-xs text-on-surface-variant">Beans terpilih</dt><dd className="mt-1 font-semibold text-brand-charcoal">{selection.beanLabel}</dd></div>
          <div><dt className="text-xs text-on-surface-variant">Dasar harga</dt><dd className="mt-1 font-mono font-semibold text-brand-charcoal">{selection.priceBasis}</dd></div>
          <div><dt className="text-xs text-on-surface-variant">Biaya langsung / cangkir</dt><dd className="mt-1 font-mono font-semibold text-brand-charcoal">{formatRupiah(selection.directCostPerCup)}</dd></div>
        </dl>
        <p className="mt-4 text-xs leading-5 text-on-surface-variant">Ringkasan ini mengikuti perubahan terakhir di BYOB dan Pricing Calculator.</p>
      </section>

      <fieldset>
        <legend className="font-editorial text-xl font-bold text-brand-charcoal">Informasi bisnis</legend>
        <p className="mt-1 text-xs leading-5 text-on-surface-variant">Kontak yang dapat dihubungi untuk membahas kebutuhan blend.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field id="businessName" label="Nama bisnis" autoComplete="organization" />
          <Field id="contactName" label="Nama penanggung jawab" autoComplete="name" />
          <Field id="whatsapp" label="Nomor WhatsApp" type="tel" autoComplete="tel" inputMode="tel" />
          <Field id="city" label="Kota / lokasi bisnis" autoComplete="address-level2" />
        </div>
      </fieldset>

      <fieldset className="border-t border-border-subtle pt-7">
        <legend className="pr-4 font-editorial text-xl font-bold text-brand-charcoal">Kebutuhan custom blend</legend>
        <p className="mt-1 text-xs leading-5 text-on-surface-variant">Berikan konteks awal; detail teknis tetap dibahas saat konsultasi.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Select id="businessType" label="Jenis bisnis" options={['Café / coffee shop', 'Restoran', 'Hotel / HORECA', 'Office / corporate', 'Retail / reseller', 'Lainnya']} />
          <Select id="useCase" label="Penggunaan utama" options={['Espresso & milk-based', 'Black coffee', 'Manual brew', 'Ready-to-drink', 'House blend multipurpose', 'Masih ingin dikonsultasikan']} />
          <Select id="profile" label="Arah profil rasa" options={['Chocolatey & nutty', 'Sweet & balanced', 'Fruity & bright', 'Bold & full-bodied', 'Masih ingin dieksplorasi']} />
          <Field id="usage" label="Estimasi pemakaian" required={false} placeholder="Contoh: kg per bulan atau cangkir per hari" />
          <Field id="equipment" label="Mesin / alat yang digunakan" required={false} placeholder="Contoh: espresso machine 2-group, V60" />
          <label className="space-y-1.5 sm:col-span-2" htmlFor="notes">
            <span className="field-label">Catatan tambahan <span className="font-normal text-on-surface-variant">(opsional)</span></span>
            <textarea id="notes" name="notes" rows={4} className="field-control resize-y" placeholder="Target menu, kendala konsistensi, atau kebutuhan lain." />
          </label>
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p id="blend-brief-note" className="max-w-xl text-xs leading-5 text-on-surface-variant">Data hanya dipakai untuk menyusun pesan. Brief belum terkirim sampai Anda menekan kirim di WhatsApp.</p>
        <button type="submit" className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 text-sm"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Siapkan brief di WhatsApp</button>
      </div>
      {opened && <p role="status" className="border-l-2 border-brand-maroon pl-4 text-sm font-medium text-brand-maroon">WhatsApp telah dibuka. Periksa ringkasan, lalu kirim pesannya untuk memulai konsultasi.</p>}
    </form>
  );
}

function Field({ id, label, required = true, ...props }: { id: string; label: string; required?: boolean } & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'required'>) {
  return <label className="space-y-1.5" htmlFor={id}><span className="field-label">{label}{required && ' *'}</span><input id={id} name={id} required={required} className="field-control" {...props} /></label>;
}

function Select({ id, label, options }: { id: string; label: string; options: string[] }) {
  return <label className="space-y-1.5" htmlFor={id}><span className="field-label">{label} *</span><select id={id} name={id} required defaultValue="" className="field-control"><option value="" disabled>Pilih satu</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}
