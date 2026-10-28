import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CuppingEventSection() {
  return (
    <section id="cupping-events" aria-labelledby="cupping-title" className="lab-hero scroll-mt-32">
      <div className="lab-hero__inner site-container">
        <div className="editorial-hero-copy"><p className="lab-hero__eyebrow">Coffee Lab / Cupping Events</p><h1 id="cupping-title" className="lab-hero__title">Kenali kopi lewat satu meja.</h1><p className="lab-hero__description">Temukan sesi cupping dan workshop, baca detailnya, lalu hubungi organizer melalui WhatsApp untuk meminta tempat.</p><div className="lab-hero__actions"><a href="#agenda-events" className="lab-hero__primary">Lihat agenda <ArrowRight className="h-4 w-4" aria-hidden="true" /></a><Link href="/events/create" className="lab-hero__secondary">Buat event</Link></div></div>
        <figure className="lab-hero__media editorial-hero-media"><div className="lab-hero__photo"><Image src="/images/tasting-room-footage.png" alt="Suasana sesi mencicipi kopi" fill priority sizes="(min-width: 1024px) 390px, 100vw" /></div><figcaption><span>Cupping table</span><span>Taste / Learn / Meet</span></figcaption></figure>
      </div>
    </section>
  );
}