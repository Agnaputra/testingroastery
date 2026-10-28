import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { BrewingGuidanceExperience } from '../../../components/brewing-guidance-experience';
import './brewing-guidance.css';

export const metadata: Metadata = {
  title: 'Brewing Guidance | Coffee Lab 52 Coffee & Roastery',
  description:
    'Panduan seduh specialty coffee, resep barista teruji, kalibrasi ukuran gilingan (grind size), rasio ekstraksi, dan live timer seduh interaktif 52 Coffee.',
};

export default function BrewingGuidancePage() {
  return (
    <main className="page-shell brewing-redesign relative">
      <section className="lab-hero brewing-hero" aria-labelledby="brewing-title">
        <div className="lab-hero__inner site-container">
          <div className="editorial-hero-copy"><p className="lab-hero__eyebrow">Coffee Lab / Brewing Guidance</p><h1 id="brewing-title" className="lab-hero__title">Setiap seduhan berarti.</h1><p className="lab-hero__description">Dari gilingan pertama hingga tuangan terakhir. Kenali metode, susun resep, dan seduh dengan percaya diri.</p><div className="lab-hero__actions"><a href="#precision-console" className="lab-hero__primary">Mulai menyeduh <ArrowRight className="h-4 w-4" aria-hidden="true" /></a></div></div>
          <figure className="lab-hero__media editorial-hero-media"><div className="lab-hero__photo"><Image src="/images/canva-v60-kettle-pour.jpg" alt="Air dituangkan ke dripper kopi manual" fill priority sizes="(min-width: 1024px) 447px, 100vw" /></div><figcaption><span>Manual brew</span><span>Water / Grind / Time</span></figcaption></figure>
        </div>
      </section>
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

