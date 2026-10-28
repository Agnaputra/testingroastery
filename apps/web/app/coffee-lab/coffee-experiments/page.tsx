import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CuppingEventSection } from './cupping-event-section';
import { EventDiscovery } from '../../../components/events/event-discovery';

export const metadata: Metadata = {
  title: 'Cupping Events | Coffee Lab 52 Coffee',
  description: 'Temukan sesi cupping 52 Coffee dan komunitas kopi, lihat detail event, lalu hubungi organizer melalui WhatsApp.',
  alternates: { canonical: '/coffee-lab/coffee-experiments' },
};

export default function CoffeeExperimentsPage() {
  return (
    <main className="page-shell relative bg-white">
      <CuppingEventSection />
      <EventDiscovery />
      <section aria-labelledby="flavor-guide-heading" className="border-t border-border-subtle bg-[#e9eef0] py-20 sm:py-28">
        <div className="site-container grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20 editorial-reveal">
          <div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-brand-maroon">Panduan cupping</p><h2 id="flavor-guide-heading" className="mt-5 max-w-[17ch] font-editorial text-4xl font-extrabold leading-[1.06] tracking-tight text-brand-charcoal sm:text-5xl">Kenali rasa sebelum duduk di meja cupping.</h2><p className="mt-5 max-w-[50ch] text-sm leading-7 text-on-surface-variant">Jelajahi aroma, acidity, sweetness, body, dan aftertaste untuk membantumu mendeskripsikan setiap cangkir.</p><Link href="/#sensory-spectrum" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-navy underline underline-offset-4">Jelajahi Flavor Wheel <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
          <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-full bg-brand-charcoal"><Image src="/images/coffee-tasting-wheel-interactive.png" alt="Flavor wheel 52 Coffee" fill sizes="300px" className="object-cover" /></div>
        </div>
      </section>
      <aside className="border-t border-border-subtle bg-white"><div className="site-container flex flex-col gap-4 py-9 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.13em] text-brand-maroon">Bangun komunitas kopi</p><p className="mt-2 text-sm text-on-surface-variant">Punya ide cupping atau workshop? Buat event dan terima pertanyaan peserta di WhatsApp.</p></div><Link href="/events/create" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-navy underline underline-offset-4">Buat event <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></aside>
    </main>
  );
}