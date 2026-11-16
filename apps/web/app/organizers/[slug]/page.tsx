import { OrganizerDetail } from '../../../features/events/organizer-detail';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { CoffeeEvent } from '../../../features/events/events';

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
  return <OrganizerDetail data={data} />;
}
