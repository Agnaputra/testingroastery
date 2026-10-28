import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlendBuilderExperience } from '../../../components/blend-builder-experience';
import { BackButton } from '../../../components/ui/back-button';

export const metadata: Metadata = {
  title: 'Consultations & Custom Blend | 52 Coffee & Roastery',
  description: 'Konsultasi custom coffee blend, formulir kemitraan, dan pricing calculator HPP untuk kafe, restoran, hotel, dan kebutuhan wholesale.',
  alternates: { canonical: '/work-with-us/consultations' },
};

const steps = [
  ['Pilih beans', 'Tentukan origin dan karakter dasar.'],
  ['Arah rasa', 'Tetapkan target sweetness, acidity, dan body.'],
  ['Atur blend', 'Uji komposisi dan estimasi biaya.'],
  ['Diskusikan', 'Kirim brief dan sesuaikan bersama roastery.'],
];

export default function ConsultationsPage() {
  return (
    <main className="page-shell relative bg-surface-bright">
      <section className="lab-hero" aria-labelledby="consultation-title">
        <div className="lab-hero__inner site-container">
          <div className="editorial-hero-copy">
            <div className="mb-4">
              <BackButton fallbackHref="/work-with-us" label="Kembali ke Work With Us" />
            </div>
            <p className="lab-hero__eyebrow">Partnerships / Consultation</p><h1 id="consultation-title" className="lab-hero__title">Rencanakan kopi untuk bisnismu.</h1><p className="lab-hero__description">Mulai dari target rasa dan biaya. Susun blend, lihat estimasi HPP, lalu bicarakan kebutuhanmu dengan tim roastery.</p><div className="lab-hero__actions"><a href="#byob" className="lab-hero__primary">Rancang blend <ArrowRight className="h-4 w-4" aria-hidden="true" /></a><a href="#consultation-form" className="lab-hero__secondary">Isi brief konsultasi</a></div></div>
          <figure className="lab-hero__media editorial-hero-media"><div className="lab-hero__photo"><Image src="/images/byob-roaster-craft.jpg" alt="Proses menyiapkan racikan kopi di roastery" fill priority sizes="(min-width: 1024px) 390px, 100vw" /></div><figcaption><span>Custom blend</span><span>Malang roastery</span></figcaption></figure>
        </div>
      </section>

      <section id="byob" className="site-container scroll-mt-28 py-20 sm:py-28">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-20 editorial-reveal">
          <div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-maroon">Build Your Own Blend</p><h2 className="mt-5 max-w-[15ch] font-editorial text-4xl font-extrabold leading-[1.06] tracking-tight text-brand-charcoal sm:text-5xl">Dari ide rasa ke racikan bisnis.</h2></div>
          <p className="max-w-xl self-end text-sm leading-7 text-on-surface-variant sm:text-base">Pilih komponen dan atur proporsi. Kalkulator HPP membantu membaca biaya dari harga katalog terverifikasi sebelum kamu mengirim brief.</p>
        </div>
        <ol className="mt-12 grid border-y border-border-subtle md:grid-cols-4 editorial-reveal-list">
          {steps.map(([title, description], index) => <li key={title} className="border-b border-border-subtle py-5 last:border-b-0 md:border-b-0 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0"><span className="font-mono text-xs font-bold text-brand-maroon">0{index + 1}</span><h3 className="mt-4 font-editorial text-base font-bold text-brand-charcoal">{title}</h3><p className="mt-2 text-xs leading-5 text-on-surface-variant">{description}</p></li>)}
        </ol>
        <div className="mt-14"><BlendBuilderExperience mode="partnership" /></div>
      </section>

      <aside className="border-t border-border-subtle bg-white"><div className="site-container flex flex-col gap-4 py-9 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-brand-maroon">Wholesale &amp; Partnership</p><p className="mt-2 text-sm text-on-surface-variant">Butuh pasokan rutin setelah racikanmu siap?</p></div><Link href="/work-with-us#wholesale-partnership" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-navy underline underline-offset-4">Lihat skema pasokan <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></aside>
    </main>
  );
}