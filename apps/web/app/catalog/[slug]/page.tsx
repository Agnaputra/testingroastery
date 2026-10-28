import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CatalogProductDetail from '../../../components/catalog-product-detail';
import { getPublishedProducts } from '../../../lib/catalog-master';
import { getServerCatalogPublicationAuthority } from '../../../lib/catalog-publication-server';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return getPublishedProducts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const authority = await getServerCatalogPublicationAuthority();
  const product = authority.products.find((item) => item.slug === params.slug);

  if (!product || authority.status !== 'verified') {
    return {
      title: 'Produk tidak ditemukan | 52 Coffee & Roastery',
    };
  }

  return {
    title: `${product.name} | 52 Coffee & Roastery`,
    description: product.description,
    alternates: {
      canonical: `/catalog/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const authority = await getServerCatalogPublicationAuthority();
  if (authority.status === 'unavailable') {
    return <main className="site-container py-32 text-center">Status katalog sedang tidak tersedia. Silakan coba lagi.</main>;
  }
  const effectiveProduct = authority.products.find((item) => item.slug === params.slug);
  if (!effectiveProduct) notFound();
  return <CatalogProductDetail slug={params.slug} effectiveProduct={effectiveProduct} />;
}
