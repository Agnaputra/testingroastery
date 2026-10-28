'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventApi, jsonOptions } from '../../../lib/events';

type Profile = { slug: string; name: string; bio: string; whatsapp: string; has_avatar: boolean } | null;

export default function OrganizerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    eventApi<Profile>('profile/me').then((data) => { setProfile(data); if (data) { setName(data.name); setBio(data.bio); setWhatsapp(data.whatsapp); } }).catch(() => router.replace('/events/login?next=/organizers/me'));
  }, [router]);

  async function chooseAvatar(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2_000_000) { setError('Avatar harus JPEG, PNG, atau WebP maksimal 2 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try { const data = await eventApi<NonNullable<Profile>>('profile/me', jsonOptions('PUT', { name, bio, whatsapp, avatar })); setProfile(data); setSaved(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Gagal menyimpan profil.'); }
    finally { setBusy(false); }
  }

  return <main className="page-shell nav-offset min-h-screen bg-surface-bright"><div className="site-container max-w-2xl py-16"><Link href="/events/my-events" className="text-sm text-brand-navy underline">Kembali ke My Events</Link><h1 className="mt-5 font-editorial text-4xl font-bold text-brand-charcoal">Profil organizer</h1><p className="mt-2 text-sm text-on-surface-variant">Isi profil sebelum mempublikasikan event.</p><form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-border-subtle bg-white p-6 sm:p-8"><label className="block text-sm font-semibold">Nama organizer<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="field-control mt-2 w-full" /></label><label className="block text-sm font-semibold">Bio<textarea maxLength={1000} rows={4} value={bio} onChange={(event) => setBio(event.target.value)} className="field-control mt-2 w-full" /></label><label className="block text-sm font-semibold">WhatsApp (format internasional tanpa +)<input required inputMode="tel" pattern="[1-9][0-9]{7,14}" placeholder="628123456789" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} className="field-control mt-2 w-full" /></label><label className="block text-sm font-semibold">Avatar (opsional)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseAvatar(event.target.files?.[0])} className="mt-2 block w-full text-sm" /></label>{error ? <p role="alert" className="text-sm text-brand-maroon">{error}</p> : null}{saved ? <p role="status" className="text-sm text-brand-navy">Profil tersimpan.</p> : null}<button disabled={busy} className="min-h-12 rounded-xl bg-brand-charcoal px-6 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Menyimpan…' : 'Simpan profil'}</button>{profile ? <Link href={`/organizers/${profile.slug}`} className="ml-4 text-sm font-semibold text-brand-navy underline">Lihat profil publik</Link> : null}</form></div></main>;
}
