import CatalogContent from '../../components/catalog-content';
import { getServerCatalogPublicationAuthority } from '../../lib/catalog-publication-server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Slowbar | 52 Coffee & Roastery',
  description: 'Menu specialty coffee 52 Coffee & Roastery yang tersedia untuk dinikmati di lokasi.',
  alternates: {
    canonical: '/slowbar',
  },
};

export default async function SlowbarPage() {
  const authority = await getServerCatalogPublicationAuthority();
  return <CatalogContent initialCategory="slowbar" publishedSlugs={authority.products.map((product) => product.slug)} effectiveProducts={authority.products} publicationUnavailable={authority.status === 'unavailable'} />;
}
