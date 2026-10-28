'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CoffeeEvent, EventCategory, eventApi, jsonOptions } from '../../lib/events';

type FormData = {
  title: string; description: string; category: string; startsAt: string; endsAt: string; timezone: string;
  locationType: 'offline' | 'online'; venueName: string; address: string; meetingLink: string;
  capacity: number; confirmedCount: number; isPaid: boolean; price: number; whatsapp: string;
  instructions: string; registrationStatus: 'open' | 'full' | 'closed'; cover: string | null;
};

const initial: FormData = { title: '', description: '', category: 'cupping', startsAt: '', endsAt: '', timezone: 'Asia/Jakarta', locationType: 'offline', venueName: '', address: '', meetingLink: '', capacity: 12, confirmedCount: 0, isPaid: false, price: 0, whatsapp: '', instructions: '', registrationStatus: 'open', cover: null };
const offsets: Record<string, string> = { 'Asia/Jakarta': '+07:00', 'Asia/Singapore': '+08:00', UTC: 'Z' };

function inputDate(value: string, zone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

export function EventForm({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initial);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loaded, setLoaded] = useState(!eventId);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slug, setSlug] = useState('');
  const [eventStatus, setEventStatus] = useState<'draft' | 'published' | 'cancelled' | 'completed'>('draft');

  useEffect(() => {
    eventApi<EventCategory[]>('categories').then(setCategories).catch(() => setError('Kategori tidak dapat dimuat.'));
    eventApi<{ organizer_slug: string }>('auth/me').then((user) => {
      if (!user.organizer_slug) router.replace('/organizers/me');
    }).catch(() => router.replace(`/events/login?next=${encodeURIComponent(eventId ? `/events/manage/${eventId}` : '/events/create')}`));
    if (eventId) eventApi<CoffeeEvent[]>('my').then((items) => {
      const item = items.find((candidate) => candidate.id === eventId);
      if (!item) { setError('Event tidak ditemukan atau bukan milik Anda.'); return; }
      setSlug(item.slug);
      setEventStatus(item.status);
      setForm({ title: item.title, description: item.description, category: item.category_slug, startsAt: inputDate(item.starts_at, item.timezone), endsAt: inputDate(item.ends_at, item.timezone), timezone: item.timezone, locationType: item.location_type, venueName: item.venue_name, address: item.address, meetingLink: item.meeting_link, capacity: item.capacity, confirmedCount: item.confirmed_count, isPaid: item.is_paid, price: item.price, whatsapp: item.whatsapp, instructions: item.instructions, registrationStatus: item.registration_status, cover: null });
      setLoaded(true);
    }).catch((cause) => setError(cause.message));
  }, [eventId, router]);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) { setForm((current) => ({ ...current, [key]: value })); }

  async function chooseCover(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2_000_000) { setError('Cover harus JPEG, PNG, atau WebP maksimal 2 MB.'); return; }
    const reader = new FileReader(); reader.onload = () => set('cover', String(reader.result)); reader.readAsDataURL(file);
  }

  function payload() {
    return { ...form, startsAt: new Date(`${form.startsAt}:00${offsets[form.timezone]}`).toISOString(), endsAt: new Date(`${form.endsAt}:00${offsets[form.timezone]}`).toISOString(), price: form.isPaid ? form.price : 0 };
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const publish = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('data-publish') === 'true';
      const data = eventId ? await eventApi<{ ok: boolean }>(`${eventId}`, jsonOptions('PATCH', payload())) : await eventApi<{ id: string; slug: string }>('', jsonOptions('POST', payload()));
      const savedId = eventId ?? ('id' in data ? data.id : null);
      if (publish && savedId) {
        await eventApi(`${savedId}/status/publish`, jsonOptions('POST'));
        setEventStatus('published');
        setNotice('Event berhasil dipublikasikan.');
      } else setNotice(eventId ? 'Perubahan tersimpan.' : 'Draft tersimpan.');
      if (!eventId && savedId) router.push(`/events/manage/${savedId}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Gagal menyimpan event.'); }
    finally { setBusy(false); }
  }

  if (!loaded) return <p role="status" className="py-10 text-sm">Memuat event… {error}</p>;

  return <div className="site-container max-w-5xl py-14 sm:py-20"><div className="flex flex-wrap items-center justify-between gap-3"><Link href="/events/my-events" className="text-sm text-brand-navy underline">← My Events</Link>{eventId && slug ? <Link href={`/events/${slug}`} className="text-sm text-brand-navy underline">Lihat halaman event</Link> : null}</div><h1 className="mt-6 font-editorial text-4xl font-bold text-brand-charcoal">{eventId ? 'Kelola event' : 'Buat event'}</h1><p className="mt-2 text-sm text-on-surface-variant">Isi rincian nyata sebelum membuka pendaftaran via WhatsApp.</p>
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"><form onSubmit={submit} className="space-y-6 rounded-2xl border border-border-subtle bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-semibold">Judul event<input required minLength={3} maxLength={150} value={form.title} onChange={(e) => set('title', e.target.value)} className="field-control mt-2 w-full" /></label><label className="sm:col-span-2 text-sm font-semibold">Deskripsi<textarea required minLength={20} maxLength={10000} rows={6} value={form.description} onChange={(e) => set('description', e.target.value)} className="field-control mt-2 w-full" /></label><label className="text-sm font-semibold">Kategori<select value={form.category} onChange={(e) => set('category', e.target.value)} className="field-control mt-2 w-full">{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label className="text-sm font-semibold">Cover image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => chooseCover(e.target.files?.[0])} className="mt-2 block w-full text-sm" /></label><label className="text-sm font-semibold">Mulai<input type="datetime-local" required value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} className="field-control mt-2 w-full" /></label><label className="text-sm font-semibold">Selesai<input type="datetime-local" required min={form.startsAt} value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} className="field-control mt-2 w-full" /></label><label className="text-sm font-semibold">Timezone<select value={form.timezone} onChange={(e) => set('timezone', e.target.value)} className="field-control mt-2 w-full"><option value="Asia/Jakarta">Asia/Jakarta (WIB)</option><option value="Asia/Singapore">Asia/Singapore (WITA)</option><option value="UTC">UTC</option></select></label><label className="text-sm font-semibold">Jenis lokasi<select value={form.locationType} onChange={(e) => set('locationType', e.target.value as FormData['locationType'])} className="field-control mt-2 w-full"><option value="offline">Offline</option><option value="online">Online</option></select></label>{form.locationType === 'offline' ? <><label className="text-sm font-semibold">Nama tempat<input required maxLength={150} value={form.venueName} onChange={(e) => set('venueName', e.target.value)} className="field-control mt-2 w-full" /></label><label className="text-sm font-semibold">Alamat<input required maxLength={300} value={form.address} onChange={(e) => set('address', e.target.value)} className="field-control mt-2 w-full" /></label></> : <label className="sm:col-span-2 text-sm font-semibold">Meeting link<input type="url" required pattern="https://.*" value={form.meetingLink} onChange={(e) => set('meetingLink', e.target.value)} className="field-control mt-2 w-full" /></label>}<label className="text-sm font-semibold">Kapasitas<input type="number" required min={1} max={100000} value={form.capacity} onChange={(e) => set('capacity', Number(e.target.value))} className="field-control mt-2 w-full" /></label><label className="text-sm font-semibold">Peserta terkonfirmasi (manual)<input type="number" required min={0} max={form.capacity} value={form.confirmedCount} onChange={(e) => set('confirmedCount', Number(e.target.value))} className="field-control mt-2 w-full" /></label><label className="text-sm font-semibold">Biaya<select value={form.isPaid ? 'paid' : 'free'} onChange={(e) => set('isPaid', e.target.value === 'paid')} className="field-control mt-2 w-full"><option value="free">Gratis</option><option value="paid">Berbayar</option></select></label>{form.isPaid ? <label className="text-sm font-semibold">Harga tiket (Rp)<input type="number" required min={1} value={form.price} onChange={(e) => set('price', Number(e.target.value))} className="field-control mt-2 w-full" /></label> : null}<label className="text-sm font-semibold">Status pendaftaran<select value={form.registrationStatus} onChange={(e) => set('registrationStatus', e.target.value as FormData['registrationStatus'])} className="field-control mt-2 w-full"><option value="open">Open</option><option value="full">Full</option><option value="closed">Closed</option></select></label><label className="text-sm font-semibold">WhatsApp organizer<input required inputMode="tel" pattern="[1-9][0-9]{7,14}" placeholder="628123456789" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className="field-control mt-2 w-full" /></label><label className="sm:col-span-2 text-sm font-semibold">Instruksi tambahan<textarea maxLength={2000} rows={3} value={form.instructions} onChange={(e) => set('instructions', e.target.value)} className="field-control mt-2 w-full" /></label></div>
      {error ? <p role="alert" className="text-sm text-brand-maroon">{error}</p> : null}{notice ? <p role="status" className="text-sm text-brand-navy">{notice}</p> : null}<div className="flex flex-wrap gap-3"><button disabled={busy} type="submit" className="min-h-12 rounded-xl bg-brand-charcoal px-6 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Menyimpan…' : 'Save Draft / Simpan Perubahan'}</button>{eventStatus === 'draft' ? <button disabled={busy} type="submit" data-publish="true" className="min-h-12 rounded-xl bg-brand-maroon px-6 text-sm font-bold text-white disabled:opacity-50">Publish</button> : null}<button type="button" onClick={() => setPreview(!preview)} className="min-h-12 rounded-xl border border-brand-charcoal px-6 text-sm font-bold text-brand-charcoal">{preview ? 'Tutup Preview' : 'Preview'}</button></div>
    </form><aside className="rounded-2xl border border-border-subtle bg-surface-bright p-6"><p className="font-mono text-xs uppercase tracking-widest text-brand-maroon">{preview ? 'Preview' : 'Catatan'}</p>{preview ? <><h2 className="mt-3 font-editorial text-2xl font-bold">{form.title || 'Judul event'}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{form.description || 'Deskripsi event akan muncul di sini.'}</p><p className="mt-4 text-xs">{form.startsAt || 'Tanggal belum dipilih'} · {form.venueName || 'Lokasi belum diisi'}</p></> : <p className="mt-3 text-sm leading-6 text-on-surface-variant">Publikasi tersedia di My Events setelah draft tersimpan. Klik WhatsApp tidak menambah jumlah peserta; perbarui angka peserta terkonfirmasi setelah organizer menyetujui secara manual.</p>}</aside></div></div>;
}
