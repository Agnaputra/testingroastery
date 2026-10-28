import type { Metadata } from 'next';
import CatalogContent from '../../components/catalog-content';
import { getServerCatalogPublicationAuthority } from '../../lib/catalog-publication-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catalog | 52 Coffee & Roastery',
  description: 'Jelajahi single origin, espresso roast, Grand Reserve, dan menu Slowbar 52 Coffee & Roastery.',
  alternates: {
    canonical: '/catalog',
  },
};

export default async function CatalogPage() {
  const authority = await getServerCatalogPublicationAuthority();
  return <CatalogContent publishedSlugs={authority.products.map((product) => product.slug)} effectiveProducts={authority.products} publicationUnavailable={authority.status === 'unavailable'} />;
}
