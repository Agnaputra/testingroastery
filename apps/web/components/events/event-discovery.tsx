'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { CoffeeEvent, EventCategory, eventApi } from '../../lib/events';
import { EventCard } from './event-card';

type Listing = { items: CoffeeEvent[]; total: number; page: number };

export function EventDiscovery() {
  const [period, setPeriod] = useState<'upcoming' | 'past'>('upcoming');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [listing, setListing] = useState<Listing | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    eventApi<EventCategory[]>('categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ period, page: String(page) });
    if (search) params.set('q', search);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (price) params.set('price', price);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    setListing(null);
    setError('');
    eventApi<Listing>(`?${params}`).then((data) => { if (active) setListing(data); }).catch((cause) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, [period, search, category, location, price, dateFrom, dateTo, page, retry]);

  const searchEvents = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  return (
    <div id="agenda-events" className="site-container scroll-mt-36 py-14 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-maroon">Yang akan datang</p><h2 className="mt-3 font-editorial text-3xl font-extrabold tracking-tight text-brand-charcoal sm:text-[42px]">Temukan event berikutnya.</h2><p className="mt-3 text-sm text-on-surface-variant">Belajar, mencicipi, dan bertemu sesama pencinta kopi.</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/events/my-events" className="inline-flex min-h-11 items-center rounded-lg border border-brand-charcoal px-5 text-sm font-bold text-brand-charcoal hover:bg-brand-mist">Event saya</Link><Link href="/events/create" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-charcoal px-5 text-sm font-bold text-white hover:bg-brand-navy">Buat event <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
      </div>
      <div className="mt-8 flex gap-5 border-b border-border-subtle" role="tablist" aria-label="Periode event">
        {(['upcoming', 'past'] as const).map((value) => <button key={value} type="button" role="tab" aria-selected={period === value} onClick={() => { setPeriod(value); setPage(1); }} className={`min-h-11 border-b-2 px-1 text-sm font-semibold ${period === value ? 'border-brand-maroon text-brand-charcoal' : 'border-transparent text-on-surface-variant'}`}>{value === 'upcoming' ? 'Upcoming Events' : 'Past Events'}</button>)}
      </div>
      <form onSubmit={searchEvents} className="mt-7 flex min-h-14 items-center gap-3 rounded-xl border border-border-subtle bg-white p-1.5 shadow-sm">
        <Search className="ml-3 h-5 w-5 shrink-0 text-brand-navy" aria-hidden="true" />
        <label className="sr-only" htmlFor="event-search">Cari judul atau deskripsi event</label><input id="event-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul atau deskripsi event..." maxLength={100} className="min-w-0 flex-1 bg-transparent px-1 text-sm text-brand-charcoal outline-none placeholder:text-on-surface-variant focus-visible:ring-2 focus-visible:ring-brand-maroon" />
        <button type="submit" className="min-h-11 rounded-lg bg-brand-navy px-5 text-sm font-bold text-white hover:bg-brand-charcoal">Cari</button>
      </form>
      <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter kategori event">
        <button type="button" onClick={() => { setCategory(''); setPage(1); }} aria-pressed={!category} className={`min-h-10 rounded-full border px-4 text-xs font-bold ${!category ? 'border-brand-charcoal bg-brand-charcoal text-white' : 'border-border-subtle bg-white text-brand-charcoal hover:border-brand-navy'}`}>Semua event</button>
        {categories.map((item) => <button key={item.slug} type="button" onClick={() => { setCategory(item.slug); setPage(1); }} aria-pressed={category === item.slug} className={`min-h-10 rounded-full border px-4 text-xs font-bold ${category === item.slug ? 'border-brand-charcoal bg-brand-charcoal text-white' : 'border-border-subtle bg-white text-brand-charcoal hover:border-brand-navy'}`}>{item.name}</button>)}
      </div>
      <details className="mt-5 border-y border-border-subtle py-2 text-sm">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-brand-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-maroon">Lokasi, harga &amp; tanggal{location || price || dateFrom || dateTo ? ' · Filter aktif' : ''}</summary>
      <div className="flex flex-wrap items-center gap-3 pb-4 pt-2 text-sm">
        <label className="sr-only" htmlFor="event-location">Lokasi</label><input id="event-location" value={location} onChange={(event) => { setLocation(event.target.value); setPage(1); }} placeholder="Lokasi" maxLength={100} className="field-control max-w-48" />
        <label className="sr-only" htmlFor="event-price">Harga</label><select id="event-price" value={price} onChange={(event) => { setPrice(event.target.value); setPage(1); }} className="field-control max-w-44"><option value="">Semua harga</option><option value="free">Gratis</option><option value="paid">Berbayar</option></select>
        <label className="flex items-center gap-2 text-xs text-on-surface-variant">Dari <input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="field-control" /></label><label className="flex items-center gap-2 text-xs text-on-surface-variant">Sampai <input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="field-control" /></label>
      </div>
      </details>
      {error ? <div role="alert" className="mt-8 rounded-xl border border-brand-maroon/25 bg-brand-maroon/5 p-6 text-sm text-brand-charcoal">{error} <button type="button" className="ml-2 underline" onClick={() => setRetry((current) => current + 1)}>Coba lagi</button></div> : null}
      {!error && !listing ? <p role="status" className="py-12 text-on-surface-variant">Memuat agenda…</p> : null}
      {listing && listing.items.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-border-subtle bg-surface-bright px-6 py-14 text-center"><h3 className="font-editorial text-xl font-bold text-brand-charcoal">Belum ada event yang sesuai.</h3><p className="mt-2 text-sm text-on-surface-variant">Coba ubah filter atau kembali saat jadwal baru diumumkan.</p></div> : null}
      {listing && listing.items.length > 0 ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 editorial-reveal-list">{listing.items.map((item) => <EventCard key={item.id} event={item} />)}</div> : null}
      {listing && listing.total > 12 ? <div className="mt-8 flex items-center justify-center gap-4 text-sm"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Sebelumnya</button><span>Halaman {page} dari {Math.ceil(listing.total / 12)}</span><button type="button" disabled={page * 12 >= listing.total} onClick={() => setPage(page + 1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Berikutnya</button></div> : null}
    </div>
  );
}
