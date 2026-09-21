import type { Metadata } from 'next';
import CatalogContent from '../../components/catalog-content';

export const metadata: Metadata = {
  title: 'Catalog | 52 Coffee & Roastery',
  description: 'Jelajahi single origin, espresso roast, Grand Reserve, dan menu Slowbar 52 Coffee & Roastery.',
  alternates: {
    canonical: '/catalog',
  },
};

export default function CatalogPage() {
  return <CatalogContent />;
}
