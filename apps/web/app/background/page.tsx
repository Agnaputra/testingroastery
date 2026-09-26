import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageIntro } from '../../components/ui/page-structure';

export const metadata: Metadata = {
  title: 'Background | 52 Coffee & Roastery',
  description: 'Cerita, filosofi, dan pendekatan 52 Coffee & Roastery dalam membaca kopi dari bahan baku hingga cangkir.',
  alternates: { canonical: '/background' },
};

export default function BackgroundPage() {
  return (
    <main className="page-shell">
      <PageIntro
        compact
        tone="dark"
        title="Rasa ingin tahu menjadi awal perjalanan kami."
        description="52 Coffee & Roastery tumbuh dari keinginan untuk memahami hubungan antara beans, panas, air, dan rasa—lalu membagikan proses itu melalui roastery dan slowbar."
        visual={
          <div className="relative aspect-[4/3] min-h-[260px] overflow-hidden rounded-md bg-brand-charcoal">
            <Image
              src="/images/the-roastery-behind-your-business.png"
              alt="Perjalanan dan proses produksi 52 Coffee Roastery"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        }
      />

      <section className="site-container page-section grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 className="font-editorial text-3xl font-bold leading-tight text-brand-charcoal sm:text-4xl">
            Kopi yang baik dimulai dari konteks.
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-on-surface-variant">
            <p>Origin, process, varietas, dan catatan rasa membantu kami membaca potensi setiap kopi sebelum menentukan pendekatan sangrainya.</p>
            <p>Roastery mengembangkan karakter tersebut. Slowbar menerjemahkannya lewat seduhan dan percakapan agar pengalaman kopi terasa lebih dekat dan mudah dipahami.</p>
          </div>
          <Link href="/roasters" className="mt-8 inline-flex min-h-11 items-center gap-2 font-semibold text-brand-maroon hover:underline">
            Lanjut ke Roasters <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <dl className="border-y border-border-subtle lg:col-span-7">
          {[
            ['Bahan baku', 'Kami membaca origin, process, varietas, dan karakter rasa sebagai satu konteks.'],
            ['Proses', 'Sangrai dan evaluasi dilakukan untuk menjaga karakter kopi tetap jelas dan konsisten.'],
            ['Pengalaman', 'Seduhan di Slowbar menjadi ruang untuk mencicipi, berdialog, dan terus belajar.'],
          ].map(([term, description]) => (
            <div key={term} className="grid gap-3 border-b border-border-subtle py-7 last:border-b-0 sm:grid-cols-[160px_1fr] sm:gap-8">
              <dt className="font-editorial text-xl font-bold text-brand-charcoal">{term}</dt>
              <dd className="text-sm leading-7 text-on-surface-variant">{description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
