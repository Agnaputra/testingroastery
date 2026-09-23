import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { BookOpen } from 'lucide-react';
import { PageIntro } from '../../../components/ui/page-structure';
import { BrewingGuidanceExperience } from '../../../components/brewing-guidance-experience';

export const metadata: Metadata = {
  title: 'Brewing Guidance | Coffee Lab 52 Coffee & Roastery',
  description:
    'Panduan seduh specialty coffee, resep barista teruji, kalibrasi ukuran gilingan (grind size), rasio ekstraksi, dan live timer seduh interaktif 52 Coffee.',
};

export default function BrewingGuidancePage() {
  return (
    <main className="page-shell">
      <PageIntro
        compact
        tone="dark"
        kicker="Coffee Lab / Brewing Guidance"
        icon={<BookOpen size={14} />}
        title="Seduh dengan parameter yang jelas."
        description="Pelajari metode seduh, resep barista, panduan ukuran gilingan, rasio ekstraksi, serta gunakan workspace dan timer seduh interaktif dalam satu tempat."
        visual={
          <div className="relative aspect-[4/3] min-h-[240px] overflow-hidden rounded-md bg-brand-charcoal">
            <Image
              src="/images/canva-v60-kettle-pour.jpg"
              alt="Proses manual brew kopi specialty di Slowbar 52 Coffee"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover opacity-90"
              priority
            />
          </div>
        }
      />

      <Suspense
        fallback={
          <div className="site-container py-16 text-center font-mono text-xs text-on-surface-variant">
            Memuat Brewing Guidance &amp; Timer Seduh...
          </div>
        }
      >
        <BrewingGuidanceExperience />
      </Suspense>
    </main>
  );
}

