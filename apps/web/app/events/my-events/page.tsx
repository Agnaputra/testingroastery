'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CoffeeEvent, eventApi, eventDate, jsonOptions, registrationLabel } from '../../../lib/events';

export default function MyEventsPage() {
  const router = useRouter();
  const [items, setItems] = useState<CoffeeEvent[] | null>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const load = useCallback(() => eventApi<CoffeeEvent[]>('my').then(setItems).catch((cause) => { if (cause.message.includes('masuk') || cause.message.includes('Sesi')) router.replace('/events/login?next=/events/my-events'); else setError(cause.message); }), [router]);
  useEffect(() => { load(); }, [load]);

  async function action(item: CoffeeEvent, name: 'publish' | 'unpublish' | 'cancel' | 'complete' | 'delete') {
    if ((name === 'cancel' || name === 'delete') && !window.confirm(`${name === 'cancel' ? 'Batalkan' : 'Hapus draft'} ${item.title}?`)) return;
    setError('');
    try { await eventApi(name === 'delete' ? item.id : `${item.id}/status/${name}`, jsonOptions(name === 'delete' ? 'DELETE' : 'POST')); await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Aksi gagal.'); }
  }

  async function showStats(id: string) {
    try { const result = await eventApi<{ whatsappClicks: number }>(`manage/${id}/stats`); setStats((old) => ({ ...old, [id]: result.whatsappClicks })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Statistik gagal dimuat.'); }
  }

  async function logout() {
    await eventApi('auth/logout', jsonOptions('POST')).catch(() => {});
    router.push('/events/login');
    router.refresh();
  }

  return <main className="page-shell nav-offset min-h-screen bg-surface-bright"><div className="site-container py-14 sm:py-20"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-widest text-brand-maroon">Organizer dashboard</p><h1 className="mt-2 font-editorial text-4xl font-bold text-brand-charcoal">My Events</h1></div><div className="flex flex-wrap gap-2"><Link href="/organizers/me" className="inline-flex min-h-11 items-center rounded-full border border-brand-charcoal px-5 text-sm font-bold">Profil organizer</Link><Link href="/events/create" className="inline-flex min-h-11 items-center rounded-full bg-brand-charcoal px-5 text-sm font-bold text-white">Create Event</Link><button onClick={logout} className="min-h-11 rounded-full border border-border-subtle px-5 text-sm font-semibold">Keluar</button></div></div>{error ? <p role="alert" className="mt-6 text-sm text-brand-maroon">{error}</p> : null}{!items && !error ? <p role="status" className="py-12">Memuat event…</p> : null}{items?.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-border-subtle bg-white p-10 text-center"><h2 className="font-editorial text-2xl font-bold">Belum ada event.</h2><p className="mt-2 text-sm text-on-surface-variant">Mulai dari draft pertama Anda.</p><Link href="/events/create" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-brand-charcoal px-5 text-sm font-bold text-white">Buat event</Link></div> : null}<div className="mt-8 grid gap-5 md:grid-cols-2">{items?.map((item) => <article key={item.id} className="rounded-2xl border border-border-subtle bg-white p-6"><div className="flex flex-wrap justify-between gap-2 text-xs font-bold uppercase"><span className="text-brand-maroon">{item.status}</span><span className="text-on-surface-variant">{item.moderation_status === 'visible' ? registrationLabel(item) : `Moderasi: ${item.moderation_status}`}</span></div><h2 className="mt-3 font-editorial text-2xl font-bold text-brand-charcoal">{item.title}</h2><p className="mt-2 text-sm text-on-surface-variant">{eventDate(item.starts_at, item.timezone)} · {item.confirmed_count}/{item.capacity} peserta terkonfirmasi manual</p><div className="mt-5 flex flex-wrap gap-2 text-sm"><Link href={`/events/manage/${item.id}`} className="inline-flex min-h-10 items-center rounded-lg border px-3 font-semibold">Edit & kapasitas</Link>{item.status === 'draft' ? <button onClick={() => action(item, 'publish')} className="min-h-10 rounded-lg bg-brand-navy px-3 font-semibold text-white">Publish</button> : null}{item.status === 'published' ? <><button onClick={() => action(item, 'unpublish')} className="min-h-10 rounded-lg border px-3">Unpublish</button><button onClick={() => action(item, 'cancel')} className="min-h-10 rounded-lg border px-3">Cancel</button><button onClick={() => action(item, 'complete')} className="min-h-10 rounded-lg border px-3">Complete</button></> : null}{item.status === 'draft' && item.moderation_status === 'visible' ? <button onClick={() => action(item, 'delete')} className="min-h-10 rounded-lg border border-brand-maroon px-3 text-brand-maroon">Delete Draft</button> : null}<button onClick={() => showStats(item.id)} className="min-h-10 rounded-lg border px-3">Statistik</button>{item.status === 'published' ? <button onClick={() => navigator.clipboard.writeText(`${location.origin}/events/${item.slug}`).then(() => setError('')).catch(() => setError('Tautan gagal disalin.'))} className="min-h-10 rounded-lg border px-3">Copy Link</button> : null}</div>{stats[item.id] !== undefined ? <p role="status" className="mt-4 text-xs text-on-surface-variant">Klik WhatsApp: {stats[item.id]} · Bukan jumlah pendaftaran.</p> : null}</article>)}</div></div></main>;
}
