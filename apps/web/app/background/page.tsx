import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { PageIntro } from '../../components/ui/page-structure';

export const metadata = {
  title: 'Background | 52 Coffee & Roastery',
  description: 'Latar belakang 52 Coffee & Roastery dari Malang.',
};

export default function BackgroundPage() {
  return (
    <div className="page-shell">
      <PageIntro
        align="center"
        compact
        kicker="52 Coffee & Roastery"
        title="Background"
        description="Berangkat dari Malang, kami memperlakukan setiap origin sebagai cerita yang perlu tetap terbaca di cangkir."
      />
      <section className="site-container page-section grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden border border-border-subtle bg-surface-container-low">
          <Image src="/images/the-roastery-behind-your-business.png" alt="Kegiatan dan origin 52 Coffee & Roastery" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="max-w-xl space-y-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-maroon">Dari origin ke Malang</p>
          <h2 className="font-headline text-3xl font-semibold leading-tight tracking-[-0.04em] text-brand-charcoal">Kopi yang jelas asalnya, disangrai dengan tujuan.</h2>
          <p className="text-sm leading-7 text-on-surface-variant">Kami memilih biji berdasarkan karakter origin dan potensinya saat diseduh. Proses sangrai dijaga dalam batch kecil agar rasa manis, struktur, dan aftertaste tetap seimbang.</p>
          <p className="flex items-start gap-2 text-sm leading-6 text-on-surface-variant"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-maroon" aria-hidden="true" />Jl. KH. Agus Salim No. 11, Klojen, Kota Malang.</p>
          <Link href="/roasters" className="inline-flex min-h-11 items-center gap-2 border border-brand-navy px-4 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white">Kenali para roaster <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
}
