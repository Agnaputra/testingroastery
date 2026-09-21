import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CatalogProductDetail from '../../../components/catalog-product-detail';
import { getProductBySlug } from '../../../lib/data';
import { getPublishedProducts } from '../../../lib/catalog-master';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return getPublishedProducts().map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProductBySlug(params.slug);

  if (!product) {
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

export default function ProductPage({ params }: ProductPageProps) {
  if (!getProductBySlug(params.slug)) {
    notFound();
  }

  return <CatalogProductDetail slug={params.slug} />;
}
