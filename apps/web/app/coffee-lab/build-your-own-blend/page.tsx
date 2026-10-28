import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlendBuilderExperience } from '../../../components/blend-builder-experience';

export const metadata: Metadata = {
  title: 'Build Your Own Blend (BYOB) | Coffee Lab 52 Coffee',
  description: 'Eksplorasi rasa kopi dengan memilih beans dan mengatur proporsi blend di Coffee Lab 52 Coffee.',
  alternates: { canonical: '/coffee-lab/build-your-own-blend' },
};

const stages = [
  ['choose-your-beans', 'Pilih beans', 'Mulai dengan dua karakter rasa.'],
  ['define-your-profile', 'Tentukan rasa', 'Cari arah manis, cerah, atau tebal.'],
  ['blend-development-step', 'Atur proporsi', 'Lihat profil rasa berubah.'],
  ['tasting-adjustment-step', 'Cicipi', 'Sesuaikan sedikit demi sedikit.'],
];

export default function BuildYourOwnBlendLabPage() {
  return (
    <main className="page-shell relative bg-white">
      <section className="lab-hero" aria-labelledby="lab-blend-title">
        <div className="lab-hero__inner site-container">
          <div className="editorial-hero-copy"><p className="lab-hero__eyebrow">Coffee Lab / Build Your Own Blend</p><h1 id="lab-blend-title" className="lab-hero__title">Racik kopi dari rasa yang kamu suka.</h1><p className="lab-hero__description">Kenali karakter beans. Atur proporsi dan lihat bagaimana profil rasa berubah.</p><div className="lab-hero__actions"><a href="#blend-lab" className="lab-hero__primary">Mulai meracik <ArrowRight className="h-4 w-4" aria-hidden="true" /></a></div></div>
          <figure className="lab-hero__media editorial-hero-media"><div className="lab-hero__photo"><Image src="/images/byob-craft-collage.jpg" alt="Berbagai biji dan seduhan kopi untuk eksplorasi blend" fill priority sizes="(min-width: 1024px) 390px, 100vw" /></div><figcaption><span>Explore your taste</span><span>52 Coffee Lab</span></figcaption></figure>
        </div>
      </section>

      <section id="blend-lab" className="scroll-mt-28 bg-white py-20 sm:py-28" aria-labelledby="blend-workspace-title">
        <div className="site-container">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-20 editorial-reveal"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-maroon">Eksplorasi rasa</p><h2 id="blend-workspace-title" className="mt-5 max-w-[14ch] font-editorial text-4xl font-extrabold leading-[1.06] tracking-tight text-brand-charcoal sm:text-5xl">Racikanmu, seleramu.</h2></div><p className="max-w-xl self-end text-sm leading-7 text-on-surface-variant sm:text-base">Pilih beans yang tersedia, atur rasio, dan baca perubahan aroma, body, acidity, serta sweetness. Ini adalah ruang belajar rasa.</p></div>
          <ol className="mt-12 grid border-y border-border-subtle md:grid-cols-4 editorial-reveal-list">{stages.map(([id, title, description], index) => <li id={id} key={id} className="scroll-mt-28 border-b border-border-subtle py-5 last:border-b-0 md:border-b-0 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0"><span className="font-mono text-xs font-bold text-brand-maroon">0{index + 1}</span><h3 className="mt-4 font-editorial text-base font-bold text-brand-charcoal">{title}</h3><p className="mt-2 text-xs leading-5 text-on-surface-variant">{description}</p></li>)}</ol>
          <div className="mt-14 rounded-xl border border-border-subtle bg-surface-bright p-4 sm:p-8"><BlendBuilderExperience mode="lab" embedded /></div>
        </div>
      </section>

      <aside className="border-t border-border-subtle bg-surface-bright"><div className="site-container flex flex-col gap-4 py-9 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-brand-maroon">Untuk kebutuhan bisnis</p><p className="mt-2 text-sm text-on-surface-variant">Ingin membuat house blend dan menghitung HPP?</p></div><Link href="/work-with-us/consultations" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-navy underline underline-offset-4">Buka Consultation <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></aside>
    </main>
  );
}
