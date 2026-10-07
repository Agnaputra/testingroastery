import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BrewingGuidanceExperience } from '../../../components/brewing-guidance-experience';

export const metadata: Metadata = {
  title: 'Brewing Guidance | Coffee Lab 52 Coffee & Roastery',
  description:
    'Panduan seduh specialty coffee, resep barista teruji, kalibrasi ukuran gilingan (grind size), rasio ekstraksi, dan live timer seduh interaktif 52 Coffee.',
};

export default function BrewingGuidancePage() {
  return (
    <main className="page-shell nav-offset relative">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[76px] bg-brand-navy" aria-hidden="true" />
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

