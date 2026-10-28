import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventCard } from '../../../components/events/event-card';
import { CoffeeEvent } from '../../../lib/events';

export const dynamic = 'force-dynamic';

type Organizer = { profile: { slug: string; name: string; bio: string; has_avatar: boolean }; events: CoffeeEvent[] };

async function load(slug: string): Promise<Organizer | null> {
  const backend = process.env.AI_BACKEND_URL?.replace(/\/$/, '');
  if (!backend) return null;
  try { const response = await fetch(`${backend}/api/events/organizers/${encodeURIComponent(slug)}`, { cache: 'no-store' }); return response.ok ? response.json() : null; }
  catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await load(params.slug);
  return data ? { title: `${data.profile.name} | Organizer 52 Coffee Events`, description: data.profile.bio.slice(0, 155) } : { title: 'Organizer tidak ditemukan' };
}

export default async function OrganizerPage({ params }: { params: { slug: string } }) {
  const data = await load(params.slug);
  if (!data) notFound();
  return <main className="page-shell nav-offset min-h-screen bg-surface-bright"><div className="site-container max-w-5xl py-14 sm:py-20"><Link href="/coffee-lab/coffee-experiments#cupping-events" className="text-sm text-brand-navy underline">← Semua event</Link><div className="mt-8 flex items-start gap-5 border-b border-border-subtle pb-8"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-mist">{data.profile.has_avatar ? <Image src={`/api/events/images/organizer/${data.profile.slug}`} alt="" fill sizes="80px" className="object-cover" /> : null}</div><div><p className="font-mono text-xs uppercase tracking-widest text-brand-maroon">Organizer</p><h1 className="mt-1 font-editorial text-3xl font-bold text-brand-charcoal">{data.profile.name}</h1><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-on-surface-variant">{data.profile.bio}</p></div></div><h2 className="mt-10 font-editorial text-2xl font-bold text-brand-charcoal">Event dari organizer ini</h2>{data.events.length ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data.events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <p className="mt-5 text-sm text-on-surface-variant">Belum ada event terpublikasi.</p>}</div></main>;
}
