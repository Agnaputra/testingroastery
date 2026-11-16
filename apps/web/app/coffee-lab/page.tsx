import type { Metadata } from 'next';
import CoffeeLabPage from '../../features/coffee-lab/coffee-lab-page';

export const metadata: Metadata = {
  title: 'Coffee Lab | 52 Coffee & Roastery',
  description: 'Panduan seduh, eksplorasi racikan blend, dan eksperimen kopi dari 52 Coffee & Roastery.',
};

export default function Page() {
  return <CoffeeLabPage />;
}
