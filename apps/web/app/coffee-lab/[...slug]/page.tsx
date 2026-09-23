import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, FlaskConical, Info } from 'lucide-react';
import { notFound, permanentRedirect } from 'next/navigation';
import { PageIntro } from '../../../components/ui/page-structure';
import { COFFEE_LAB_CONTENT, getCoffeeLabEntry } from '../../../lib/coffee-lab-content';
import { getPublishedProducts } from '../../../lib/catalog-master';

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
  'experiments/roasting': '/coffee-lab/coffee-experiments#roasting-experiments',
  'experiments/brewing': '/coffee-lab/coffee-experiments#brewing-experiments',
};

export function generateStaticParams() {
  return Object.keys(LEGACY_ROUTES).map((route) => ({ slug: route.split('/') }));
}

export function generateMetadata({ params }: Props): Metadata {
  const entry = getCoffeeLabEntry(params.slug);
  return entry ? { title: `${entry.title} | Coffee Lab`, description: entry.description } : {};
}

export default function CoffeeLabDetailPage({ params }: Props) {
  const legacyTarget = LEGACY_ROUTES[params.slug.join('/')];
  if (legacyTarget) permanentRedirect(legacyTarget);

  const entry = getCoffeeLabEntry(params.slug);
  if (!entry) notFound();

  const beans = entry.group === 'blend'
    ? getPublishedProducts().filter((product) => ['filter', 'espresso', 'reserve'].includes(product.category)).slice(0, 4)
    : [];

  return (
    <main className="page-shell">
      <PageIntro compact tone="dark" kicker={entry.kicker} icon={<FlaskConical size={14} />} title={entry.title} description={entry.description} visual={<div className="relative aspect-[4/3] min-h-[240px] overflow-hidden rounded-md bg-brand-charcoal"><Image src={entry.image} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover opacity-90" priority /></div>} />

      <section className="site-container page-section">
        <nav aria-label={`Isi ${entry.kicker}`} className="mb-12 border-y border-border-subtle py-4">
          <ol className="flex flex-wrap gap-x-6 gap-y-2">
            {entry.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-on-surface-variant hover:text-brand-maroon">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={entry.group === 'experiment' ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]' : 'grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-4'}>
          <div className={entry.group === 'experiment' ? 'grid gap-5 md:grid-cols-2' : 'contents'}>
            {entry.sections.map((section, index) => (
              <article id={section.id} key={section.id} className={`${entry.group === 'experiment' ? 'ui-surface p-6 sm:p-7' : 'border-t-2 border-brand-charcoal pt-5'} scroll-mt-28`}>
                <span className="font-mono text-xs text-brand-maroon">0{index + 1}</span>
                <h2 className="mt-5 font-editorial text-2xl font-bold text-brand-charcoal">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{section.body}</p>
                {section.points && <ul className="mt-5 space-y-2 border-t border-border-subtle pt-4 text-sm text-on-surface-variant">{section.points.map((point) => <li key={point} className="flex gap-2"><span className="text-brand-maroon" aria-hidden="true">—</span>{point}</li>)}</ul>}
              </article>
            ))}
          </div>

          {entry.group === 'experiment' && (
            <aside className="rounded-md border border-dashed border-brand-maroon/40 bg-brand-maroon/[0.04] p-6 sm:p-8">
              <Info className="h-6 w-6 text-brand-maroon" aria-hidden="true" />
              <p className="mt-8 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-maroon">Belum ada agenda dipublikasikan</p>
              <h2 className="mt-2 font-editorial text-2xl font-bold text-brand-charcoal">Jadwal akan tampil di sini setelah dikonfirmasi.</h2>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">Kami tidak menampilkan tanggal, kapasitas, atau pendaftaran sebelum data acara tersedia dari pemilik.</p>
            </aside>
          )}
        </div>

        {beans.length > 0 && (
          <div className="mt-12 border-t border-border-subtle pt-10">
            <h2 className="font-editorial text-2xl font-bold text-brand-charcoal">Beans yang tersedia untuk dieksplorasi</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {beans.map((product) => <Link key={product.id} href={`/catalog/${product.slug}`} className="group border-t-2 border-brand-charcoal pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon"><div className="relative aspect-square overflow-hidden rounded-md bg-surface-container-low"><Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-contain p-4 transition-transform motion-safe:group-hover:-translate-y-1" /></div><h3 className="mt-4 font-editorial text-lg font-bold text-brand-charcoal">{product.name}</h3><p className="mt-1 text-xs leading-5 text-on-surface-variant">{product.tastingNotes.join(' · ')}</p></Link>)}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col gap-3 border-t border-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/coffee-lab" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-brand-maroon"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Coffee Lab</Link>
          {entry.action.external ? (
            <a href={entry.action.href} target="_blank" rel="noreferrer" className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 text-sm">{entry.action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
          ) : (
            <Link href={entry.action.href} className="btn-primary inline-flex min-h-11 items-center justify-center gap-2 text-sm">{entry.action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          )}
        </div>
      </section>
    </main>
  );
}
