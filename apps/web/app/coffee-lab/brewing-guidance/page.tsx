import type { Metadata } from 'next';
import BrewingGuidancePage from '../../../features/coffee-lab/brewing-guidance/brewing-guidance-page';
import './brewing-guidance.css';
export const metadata: Metadata = {
  title: 'Brewing Guidance | Coffee Lab 52 Coffee & Roastery',
  description:
    'Panduan seduh specialty coffee, resep barista teruji, kalibrasi ukuran gilingan (grind size), rasio ekstraksi, dan live timer seduh interaktif 52 Coffee.',
};

export default function Page() {
  return <BrewingGuidancePage />;
}
