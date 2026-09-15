import { notFound } from 'next/navigation';
import { getProductBySlug } from '../../../lib/data';

export default function ProductDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  if (!getProductBySlug(params.slug)) {
    notFound();
  }

  return children;
}
