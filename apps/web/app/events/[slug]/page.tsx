import { EventDetail } from '../../../features/events/event-detail';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CoffeeEvent } from '../../../features/events/events';

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

  return <EventDetail event={event} related={related} />;
}
