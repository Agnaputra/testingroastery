import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventActions } from '../../../components/events/event-actions';
import { EventCard } from '../../../components/events/event-card';
import { CoffeeEvent, eventDate, eventPrice, eventTime } from '../../../lib/events';

export const dynamic = 'force-dynamic';

async function load(slug: string): Promise<{ event: CoffeeEvent; related: CoffeeEvent[] } | null> {
  const backend = process.env.AI_BACKEND_URL?.replace(/\/$/, '');
  if (!backend) return null;
  try {
    const response = await fetch(`${backend}/api/events/detail/${encodeURIComponent(slug)}`, { cache: 'no-store' });
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await load(params.slug);
  if (!data) return { title: 'Event tidak ditemukan | 52 Coffee' };
  const { event } = data;
  const description = event.description.slice(0, 155);
  const image = event.has_cover ? `/api/events/images/event/${event.id}` : '/images/tasting-room-footage.png';
  return { title: `${event.title} | 52 Coffee Events`, description, alternates: { canonical: `/events/${event.slug}` }, openGraph: { title: event.title, description, images: [image], type: 'website' } };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const data = await load(params.slug);
  if (!data) notFound();
  const { event, related } = data;
  const location = event.location_type === 'online' ? 'Online, link diberikan organizer' : `${event.venue_name}, ${event.address}`;

  return (
    <main className="page-shell nav-offset min-h-screen bg-surface-bright">
      <div className="site-container max-w-6xl py-10 sm:py-16">
        <Link href="/coffee-lab/coffee-experiments#agenda-events" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-navy underline underline-offset-4">← Kembali ke agenda</Link>
        <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-2xl bg-brand-navy/10 sm:aspect-[2/1]">
          <Image src={event.has_cover ? `/api/events/images/event/${event.id}` : '/images/tasting-room-footage.png'} alt={`Cover ${event.title}`} fill sizes="(min-width: 1280px) 1152px, 100vw" className="object-cover" priority />
        </div>
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-brand-maroon">{event.category_name} / Cupping Events</p>
            <h1 className="mt-4 max-w-[20ch] font-editorial text-4xl font-extrabold leading-[1.08] tracking-tight text-brand-charcoal sm:text-5xl">{event.title}</h1>
            <Link href={`/organizers/${event.organizer_slug}`} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand-navy underline underline-offset-4">Diselenggarakan oleh {event.organizer_name}</Link>
            <section className="mt-10 border-t border-border-subtle pt-8" aria-labelledby="about-event"><h2 id="about-event" className="font-editorial text-2xl font-bold text-brand-charcoal">Tentang event</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{event.description}</p>{event.instructions ? <><h3 className="mt-8 font-editorial text-xl font-bold text-brand-charcoal">Sebelum datang</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{event.instructions}</p></> : null}</section>
          </div>
          <aside className="lg:sticky lg:top-28" aria-label="Informasi dan pendaftaran event">
            <dl className="divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-white px-6 text-sm text-brand-charcoal">
              <div className="py-4"><dt className="text-xs text-on-surface-variant">Tanggal</dt><dd className="mt-1 font-bold">{eventDate(event.starts_at, event.timezone)}</dd></div>
              <div className="py-4"><dt className="text-xs text-on-surface-variant">Waktu</dt><dd className="mt-1 font-bold">{eventTime(event.starts_at, event.timezone)}–{eventTime(event.ends_at, event.timezone)} ({event.timezone})</dd></div>
              <div className="py-4"><dt className="text-xs text-on-surface-variant">Lokasi</dt><dd className="mt-1 font-bold">{location}</dd></div>
              <div className="py-4"><dt className="text-xs text-on-surface-variant">Kapasitas</dt><dd className="mt-1 font-bold">{event.confirmed_count} dari {event.capacity} dikonfirmasi organizer</dd></div>
              <div className="py-4"><dt className="text-xs text-on-surface-variant">Biaya</dt><dd className="mt-1 font-bold">{eventPrice(event)}</dd></div>
            </dl>
            <div className="mt-4"><EventActions event={event} /></div>
          </aside>
        </div>
        {related.length ? <section className="mt-16 border-t border-border-subtle pt-10"><h2 className="font-editorial text-2xl font-bold text-brand-charcoal">Event lainnya untukmu</h2><div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <EventCard key={item.id} event={item} />)}</div></section> : null}
      </div>
    </main>
  );
}