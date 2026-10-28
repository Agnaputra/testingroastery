'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eventApi, jsonOptions } from '../../../lib/events';

export default function EventLoginPage() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await eventApi(register ? 'auth/register' : 'auth/login', jsonOptions('POST', { email, password }));
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next?.startsWith('/') && !next.startsWith('//') ? next : '/events/my-events');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Gagal masuk.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="page-shell nav-offset min-h-screen bg-surface-bright"><div className="site-container max-w-xl py-16 sm:py-24"><Link href="/coffee-lab/coffee-experiments#cupping-events" className="text-sm text-brand-navy underline">Kembali ke agenda</Link><div className="mt-8 rounded-2xl border border-border-subtle bg-white p-6 sm:p-9"><p className="font-mono text-xs uppercase tracking-widest text-brand-maroon">Organizer 52 Coffee Events</p><h1 className="mt-3 font-editorial text-3xl font-bold text-brand-charcoal">{register ? 'Buat akun organizer' : 'Masuk ke akun'}</h1><p className="mt-2 text-sm leading-6 text-on-surface-variant">Akun ini dipakai untuk membuat dan mengelola event. PIN admin roastery tetap terpisah.</p><form onSubmit={submit} className="mt-7 space-y-5"><label className="block text-sm font-semibold text-brand-charcoal">Email<input type="email" required autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="field-control mt-2 w-full" /></label><label className="block text-sm font-semibold text-brand-charcoal">Password<input type="password" required minLength={10} maxLength={128} autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="field-control mt-2 w-full" /></label>{error ? <p role="alert" className="text-sm text-brand-maroon">{error}</p> : null}<button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-brand-charcoal px-5 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Memproses…' : register ? 'Buat akun' : 'Masuk'}</button></form><button type="button" onClick={() => { setRegister(!register); setError(''); }} className="mt-5 min-h-11 text-sm font-semibold text-brand-navy underline">{register ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}</button></div></div></main>;
}
