import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Beaker, BookOpen, Coffee, FlaskConical, Flame, SlidersHorizontal } from 'lucide-react';
import { PageIntro, SectionIntro } from '../../components/ui/page-structure';

export const metadata: Metadata = {
  title: 'Coffee Lab | 52 Coffee & Roastery',
  description: 'Panduan seduh, eksplorasi racikan blend, dan eksperimen kopi dari 52 Coffee & Roastery.',
};

const EXPERIMENTS = [
  {
    href: '/coffee-lab/coffee-experiments#cupping-events',
    icon: Coffee,
    title: 'Cupping Events',
    description: 'Sesi evaluasi aroma, rasa, dan karakter origin bersama tim roastery.',
  },
  {
    href: '/coffee-lab/coffee-experiments#roasting-experiments',
    icon: Flame,
    title: 'Roasting Experiments',
    description: 'Catatan eksplorasi profil sangrai, development, dan respons tiap origin.',
  },
  {
    href: '/coffee-lab/coffee-experiments#brewing-experiments',
    icon: Beaker,
    title: 'Brewing Experiments',
    description: 'Eksperimen variabel seduh untuk memahami perubahan ekstraksi di dalam cangkir.',
  },
];

export default function CoffeeLabPage() {
  return (
    <main className="page-shell">
      <div className="editorial-enter">
        <PageIntro
          tone="dark"
          kicker="Coffee Lab / Learn by tasting"
          icon={<FlaskConical size={14} />}
          title="Pelajari kopi melalui seduh, racik, dan eksperimen."
          description="Ruang belajar 52 Coffee untuk memahami variabel seduh, membangun profil rasa, dan mengikuti eksplorasi yang lahir dari meja cupping serta roaster kami."
        />
      </div>

      <section className="editorial-reveal site-container page-section">
        <SectionIntro
          kicker="Mulai bereksperimen"
          title="Dua cara memahami karakter kopi"
          description="Gunakan panduan seduh untuk presisi harian, atau bangun racikan sendiri untuk melihat bagaimana origin dan proporsi mengubah rasa."
        />

        <div className="editorial-reveal-list grid gap-5 lg:grid-cols-12">
          <article className="ui-surface overflow-hidden lg:col-span-7">
            <div className="relative aspect-[16/8] min-h-[240px] overflow-hidden bg-surface-container">
              <Image src="/images/canva-v60-kettle-pour.jpg" alt="Proses manual brew dengan V60" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 text-brand-maroon"><BookOpen className="h-5 w-5" aria-hidden="true" /><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">Brewing Guidance</p></div>
              <h2 className="mt-4 max-w-xl font-editorial text-3xl font-bold text-brand-charcoal">Seduh dengan parameter yang jelas.</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-on-surface-variant">Pilih metode, sesuaikan dosis, grind size, rasio, suhu, dan ikuti tahapan ekstraksi dalam satu workspace.</p>
              <Link href="/coffee-lab/brewing-guidance" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-maroon hover:underline">Buka Brewing Guidance <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </article>

          <article className="relative flex min-h-[420px] overflow-hidden rounded-md bg-brand-charcoal p-6 text-white sm:p-8 lg:col-span-5">
            <Image src="/images/byob-craft-collage.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal via-brand-charcoal/85 to-brand-charcoal/25" aria-hidden="true" />
            <div className="relative flex w-full flex-col justify-end">
              <SlidersHorizontal className="h-7 w-7 text-brand-teal" aria-hidden="true" />
              <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-teal">Build Your Own Blend / Lab</p>
              <h2 className="mt-2 font-editorial text-3xl font-bold text-white">Eksplorasi profil rasa pilihanmu.</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">Pilih beans, tentukan proporsi, baca perubahan profil, lalu lakukan tasting dan adjustment secara eksperimental.</p>
              <Link href="/coffee-lab/build-your-own-blend" className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand-mist hover:text-white">Mulai meracik <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </article>
        </div>
      </section>

      <section id="coffee-experiments" className="editorial-reveal scroll-mt-28 border-y border-border-subtle bg-surface-container-low">
        <div className="site-container page-section">
          <SectionIntro
            kicker="Coffee Experiments"
            title="Catatan dari proses yang terus diuji"
            description="Program eksperimen akan diumumkan ketika jadwal dan materinya siap. Bagian ini menjadi rumah bagi cupping, roasting, dan brewing experiments 52 Coffee."
          />

          <div className="editorial-reveal-list grid gap-x-6 gap-y-8 md:grid-cols-3">
            {EXPERIMENTS.map(({ href, icon: Icon, title, description }) => (
              <Link key={href} href={href} className="group border-t-2 border-brand-charcoal pt-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon">
                <Icon className="h-6 w-6 text-brand-maroon" aria-hidden="true" />
                <h2 className="mt-5 font-editorial text-xl font-bold text-brand-charcoal">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
                <p className="mt-6 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-maroon">Lihat ruang eksperimen <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" /></p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
