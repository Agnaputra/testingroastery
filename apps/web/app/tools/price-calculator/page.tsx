'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, Copy, Info } from 'lucide-react';
import { PageIntro, SectionIntro } from '../../../components/ui/page-structure';
import { formatRupiah } from '../../../lib/data';
import { calculatePartnershipEstimate } from '../../../lib/partnership-estimate';

const number = (value: string) => Math.max(0, Number(value) || 0);

export default function PriceCalculatorPage() {
  const [beanPrice, setBeanPrice] = useState('');
  const [dose, setDose] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [dailyCups, setDailyCups] = useState('');
  const [days, setDays] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    return calculatePartnershipEstimate({ beanPrice: number(beanPrice), dose: number(dose), otherCost: number(otherCost), sellingPrice: number(sellingPrice), dailyCups: number(dailyCups), days: number(days) });
  }, [beanPrice, dose, otherCost, sellingPrice, dailyCups, days]);

  async function copySummary() {
    if (!result) return;
    const lines = [
      'Simulasi kebutuhan kemitraan 52 Coffee',
      `Harga beans (input): ${formatRupiah(number(beanPrice))}/kg`,
      `Dosis: ${number(dose)} g/cangkir`,
      `Biaya kopi/cangkir: ${formatRupiah(result.coffeePerCup)}`,
      `Biaya langsung/cangkir: ${formatRupiah(result.directCostPerCup)}`,
      result.beanKg ? `Estimasi kebutuhan: ${result.beanKg.toFixed(1)} kg/bulan` : '',
      'Catatan: simulasi bukan quotation dan belum memasukkan seluruh biaya operasional.',
    ].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(lines);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="page-shell">
      <PageIntro compact tone="dark" kicker="Partnerships / Pricing Calculator" icon={<Calculator size={14} />} title="Simulasikan kebutuhan dengan angka bisnis Anda." description="Kalkulator ini hanya melakukan aritmetika dari input Anda. Hasilnya bukan harga wholesale, quotation, atau proyeksi keuntungan resmi." />

      <section className="site-container page-section">
        <SectionIntro kicker="Input simulasi" title="Mulai dari biaya yang benar-benar Anda ketahui" description="Tidak ada harga produk, diskon, atau tier kemitraan yang diasumsikan oleh sistem." />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.78fr)] lg:items-start">
          <div className="ui-surface grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <MoneyField id="bean-price" label="Harga beans per kg" value={beanPrice} onChange={setBeanPrice} placeholder="Contoh: 180000" />
            <NumberField id="dose" label="Dosis per cangkir (gram)" value={dose} onChange={setDose} placeholder="Contoh: 18" />
            <MoneyField id="other-cost" label="Biaya bahan lain per cangkir" value={otherCost} onChange={setOtherCost} placeholder="Susu, cup, filter, dan lain-lain" required={false} />
            <MoneyField id="selling-price" label="Harga jual per cangkir" value={sellingPrice} onChange={setSellingPrice} placeholder="Opsional" required={false} />
            <NumberField id="daily-cups" label="Cangkir per hari" value={dailyCups} onChange={setDailyCups} placeholder="Opsional" required={false} />
            <NumberField id="days" label="Hari operasional per bulan" value={days} onChange={setDays} placeholder="Opsional" required={false} />
          </div>

          <aside className="rounded-md bg-brand-charcoal p-6 text-white sm:p-8 lg:sticky lg:top-28" aria-live="polite">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-teal">Hasil simulasi</p>
            {!result ? (
              <div className="mt-10 border-t border-white/15 pt-6"><h2 className="font-editorial text-2xl font-bold">Masukkan harga beans dan dosis.</h2><p className="mt-3 text-sm leading-6 text-white/70">Hasil akan muncul setelah dua input utama terisi.</p></div>
            ) : (
              <>
                <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <Result label="Cangkir per kg" value={`± ${result.cupsPerKg.toFixed(1)}`} />
                  <Result label="Biaya kopi / cangkir" value={formatRupiah(result.coffeePerCup)} />
                  <Result label="Biaya langsung / cangkir" value={formatRupiah(result.directCostPerCup)} />
                  <Result label="Kontribusi kotor / cangkir" value={result.contributionPerCup === null ? '—' : formatRupiah(result.contributionPerCup)} />
                  <Result label="Kebutuhan beans / bulan" value={result.monthlyCups ? `${result.beanKg.toFixed(1)} kg` : '—'} />
                  <Result label="Kontribusi kotor / bulan" value={result.monthlyContribution === null || !result.monthlyCups ? '—' : formatRupiah(result.monthlyContribution)} />
                </dl>
                <button type="button" onClick={copySummary} className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-4 text-sm font-semibold transition-colors hover:bg-white hover:text-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"><Copy className="h-4 w-4" aria-hidden="true" />{copied ? 'Ringkasan tersalin' : 'Salin ringkasan'}</button>
              </>
            )}
          </aside>
        </div>

        <div className="mt-10 grid gap-5 border border-border-subtle bg-surface-container-low p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-3"><Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-maroon" aria-hidden="true" /><div><h2 className="font-editorial text-xl font-bold text-brand-charcoal">Batas simulasi</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">Belum mencakup tenaga kerja, sewa, utilitas, pajak, penyusutan alat, delivery, waste, diskon, atau syarat partnership. Harga dan skema pasokan perlu dikonfirmasi melalui konsultasi.</p></div></div>
          <Link href="/work-with-us#consultation-form" className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 text-sm">Minta konsultasi <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}

function NumberField({ id, label, value, onChange, placeholder, required = true }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string; required?: boolean }) {
  return <label htmlFor={id} className="space-y-1.5"><span className="field-label">{label}{required && ' *'}</span><input id={id} type="number" min="0" step="any" inputMode="decimal" required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-control" /></label>;
}

function MoneyField({ id, label, value, onChange, placeholder, required = true }: Parameters<typeof NumberField>[0]) {
  return <label htmlFor={id} className="space-y-1.5"><span className="field-label">{label}{required && ' *'}</span><span className="relative block"><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-on-surface-variant">Rp</span><input id={id} type="number" min="0" step="any" inputMode="decimal" required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-control pl-10" /></span></label>;
}

function Result({ label, value }: { label: string; value: string }) {
  return <div className="border-t border-white/15 pt-3"><dt className="text-xs text-white/55">{label}</dt><dd className="mt-1 font-mono text-base font-semibold text-white">{value}</dd></div>;
}
