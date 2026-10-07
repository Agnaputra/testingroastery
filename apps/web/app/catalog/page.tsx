import type { Metadata } from 'next';
import CatalogContent from '../../components/catalog-content';
import { getPublishedProducts } from '../../lib/catalog-master';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catalog | 52 Coffee & Roastery',
  description: 'Jelajahi single origin, espresso roast, Grand Reserve, dan menu Slowbar 52 Coffee & Roastery.',
  alternates: {
    canonical: '/catalog',
  },
};

async function getRuntimePublishedSlugs(): Promise<string[]> {
  const defaults = getPublishedProducts().map((product) => product.slug);
  try {
    const backendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const response = await fetch(`${backendUrl}/api/catalog/publication`, { cache: 'no-store' });
    if (!response.ok) return defaults;
    const data = (await response.json()) as { overrides?: Record<string, boolean> };
    return defaults.filter((slug) => data.overrides?.[slug] !== false);
  } catch {
    return defaults;
  }
}

export default async function CatalogPage() {
  return <CatalogContent publishedSlugs={await getRuntimePublishedSlugs()} />;
}
