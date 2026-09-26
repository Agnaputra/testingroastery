import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageIntro } from '../../components/ui/page-structure';

export const metadata: Metadata = {
  title: 'Roasters | 52 Coffee & Roastery',
  description: 'Pendekatan roasting 52 Coffee dalam mengembangkan profil rasa melalui batch kecil dan evaluasi terukur.',
  alternates: { canonical: '/roasters' },
};

const ROASTING_STEPS = [
  ['Membaca beans', 'Origin, process, varietas, densitas, dan kadar air menjadi dasar sebelum profil dikembangkan.'],
  ['Mengembangkan profil', 'Setiap batch disangrai untuk membentuk ekstraksi yang konsisten, manis, dan tetap jelas.'],
  ['Mengevaluasi hasil', 'Cupping dan penyeduhan ulang membantu kami menilai rasa sebelum kopi disajikan.'],
];

export default function RoastersPage() {
  return (
    <main className="page-shell">
      <PageIntro
        compact
        tone="dark"
        title="Profil rasa dibentuk lewat sangrai yang presisi."
        description="Kami bekerja dalam batch kecil dan mengevaluasi hasil di dalam cangkir agar karakter setiap kopi tetap terbaca sesuai tujuan seduhnya."
        visual={
          <div className="relative aspect-[4/3] min-h-[260px] overflow-hidden rounded-md bg-brand-charcoal">
            <Image
              src="/images/roaster-footage.png"
              alt="Tim 52 Coffee bekerja di depan mesin sangrai"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
          </div>
        }
      />

      <section className="site-container page-section grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2 className="font-editorial text-3xl font-bold leading-tight text-brand-charcoal sm:text-4xl">
            Dari data roasting menuju rasa.
          </h2>
          <p className="mt-5 text-sm leading-7 text-on-surface-variant">
            Teknologi membantu menjaga konsistensi, tetapi keputusan akhir tetap dibaca melalui aroma, struktur, dan rasa di dalam cangkir.
          </p>
          <Link href="/catalog" className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-maroon hover:underline">
            Jelajahi Retail Beans <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ol className="border-y border-border-subtle lg:col-span-8">
          {ROASTING_STEPS.map(([title, description], index) => (
            <li key={title} className="grid gap-3 border-b border-border-subtle py-7 last:border-b-0 sm:grid-cols-[56px_180px_1fr] sm:gap-6">
              <span className="font-mono text-xs font-semibold text-brand-maroon">0{index + 1}</span>
              <h3 className="font-editorial text-xl font-bold text-brand-charcoal">{title}</h3>
              <p className="text-sm leading-7 text-on-surface-variant">{description}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
