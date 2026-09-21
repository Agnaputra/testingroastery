import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { PageIntro } from '../../components/ui/page-structure';

export const metadata = {
  title: 'Roasters | 52 Coffee & Roastery',
  description: 'Proses sangrai 52 Coffee & Roastery di Malang.',
};

export default function RoastersPage() {
  return (
    <div className="page-shell">
      <PageIntro
        align="center"
        compact
        kicker="Di balik sangrai"
        title="Roasters"
        description="Kontrol suhu, waktu, dan evaluasi rasa untuk menjaga karakter origin tetap jernih."
      />
      <section className="site-container page-section grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="order-2 max-w-xl space-y-5 lg:order-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-maroon">Small-batch roasting</p>
          <h2 className="font-headline text-3xl font-semibold leading-tight tracking-[-0.04em] text-brand-charcoal">Setiap batch dibaca, bukan sekadar dipanggang.</h2>
          <p className="text-sm leading-7 text-on-surface-variant">Kurva sangrai, aliran udara, dan development time dievaluasi untuk menghasilkan profil yang konsisten. Cupping membantu kami memastikan karakter rasa sesuai dengan tujuan seduhnya.</p>
          <div className="border-l-2 border-brand-maroon bg-surface-container-low px-4 py-4 text-sm leading-6 text-on-surface-variant"><Flame className="mb-2 h-5 w-5 text-brand-maroon" aria-hidden="true" />Dari espresso harian sampai filter micro-lot, profil sangrai dipilih untuk menyampaikan rasa terbaik dari setiap beans.</div>
          <Link href="/catalog" className="inline-flex min-h-11 items-center gap-2 border border-brand-navy px-4 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white">Lihat Catalog <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="relative order-1 aspect-[4/3] overflow-hidden border border-border-subtle bg-surface-container-low lg:order-2">
          <Image src="/images/canva-roaster-drum.jpg" alt="Proses sangrai 52 Coffee & Roastery" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>
    </div>
  );
}
