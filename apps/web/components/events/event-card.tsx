import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { CoffeeEvent, eventDate, eventPrice, eventTime, registrationLabel } from '../../lib/events';

export function EventCard({ event }: { event: CoffeeEvent }) {
  return (
    <Link href={`/events/${event.slug}`} className="group overflow-hidden rounded-xl border border-border-subtle bg-white transition-shadow hover:shadow-editorial focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-maroon">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-navy/10">
        <Image src={event.has_cover ? `/api/events/images/event/${event.id}` : '/images/tasting-room-footage.png'} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute bottom-4 left-4 rounded-md bg-white/95 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-brand-charcoal">{eventDate(event.starts_at, event.timezone)}</span>
      </div>
      <div className="space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="rounded-full bg-brand-maroon/10 px-3 py-1.5 text-brand-maroon">{event.category_name}</span>
          <span className="text-brand-navy">{registrationLabel(event)}</span>
        </div>
        <h3 className="flex items-start justify-between gap-3 font-editorial text-xl font-extrabold leading-snug text-brand-charcoal group-hover:text-brand-maroon">{event.title}<ArrowUpRight className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" /></h3>
        <p className="flex items-center gap-2 text-xs text-on-surface-variant"><CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />{eventTime(event.starts_at, event.timezone)} ({event.timezone})</p>
        <p className="flex items-center gap-2 text-xs text-on-surface-variant"><MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />{event.location_type === 'online' ? 'Online' : event.venue_name}</p>
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle pt-3 text-xs"><span className="truncate text-on-surface-variant">Oleh {event.organizer_name}</span><strong className="shrink-0 text-brand-charcoal">{eventPrice(event)}</strong></div>
      </div>
    </Link>
  );
}