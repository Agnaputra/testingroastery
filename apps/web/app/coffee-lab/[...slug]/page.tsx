import { CoffeeLabEntryPage } from '../../../features/coffee-lab/coffee-lab-entry';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCoffeeLabEntry } from '../../../features/coffee-lab/coffee-lab-content';
import { getServerCatalogPublicationAuthority } from '../../../lib/catalog-publication-server';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string[] } };

const LEGACY_ROUTES: Record<string, string> = {
  'brewing-methods': '/coffee-lab/brewing-guidance#brewing-methods',
  recipes: '/coffee-lab/brewing-guidance#recipes',
  'grind-size': '/coffee-lab/brewing-guidance#grind-size',
  'ratio-extraction': '/coffee-lab/brewing-guidance#ratio-extraction',
  'blend/choose-beans': '/coffee-lab/build-your-own-blend#choose-your-beans',
  'blend/define-profile': '/coffee-lab/build-your-own-blend#define-your-profile',
  'blend/blend-development': '/coffee-lab/build-your-own-blend#blend-development',
  'blend/tasting-adjustment': '/coffee-lab/build-your-own-blend#tasting-adjustment',
  'experiments/cupping': '/coffee-lab/coffee-experiments#cupping-events',
  'experiments/roasting': '/coffee-lab/coffee-experiments#agenda-events',
  'experiments/brewing': '/coffee-lab/coffee-experiments#agenda-events',
};

export function generateStaticParams() {
  return Object.keys(LEGACY_ROUTES).map((route) => ({ slug: route.split('/') }));
}

export function generateMetadata({ params }: Props): Metadata {
  const entry = getCoffeeLabEntry(params.slug);
  return entry ? { title: `${entry.title} | Coffee Lab`, description: entry.description } : {};
}

export default async function CoffeeLabDetailPage({ params }: Props) {
  const legacyTarget = LEGACY_ROUTES[params.slug.join('/')];
  if (legacyTarget) permanentRedirect(legacyTarget);

  const entry = getCoffeeLabEntry(params.slug);
  if (!entry) notFound();

  const authority = entry.group === 'blend' ? await getServerCatalogPublicationAuthority() : null;
  const beans = authority?.status === 'verified'
    ? authority.products.filter((product) => ['filter', 'espresso', 'reserve'].includes(product.category)).slice(0, 4)
    : [];

  return <CoffeeLabEntryPage entry={entry} beans={beans} />;
}
