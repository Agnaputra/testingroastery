'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerApi, customerJson } from '../lib/customer-api';

type Mode = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

export function CustomerAuthForm({ mode, googleEnabled }: { mode: Mode; googleEnabled?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get('next') ?? '/account';
  const next = nextParam.startsWith('/') && new URL(nextParam, 'https://local.invalid').origin === 'https://local.invalid'
    ? nextParam : '/account';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  useEffect(() => {
    if (mode !== 'verify' && mode !== 'reset') return;
    const url = new URL(window.location.href);
    setToken(new URLSearchParams(url.hash.slice(1)).get('token') ?? url.searchParams.get('token') ?? '');
  }, [mode]);
  const googleError = params.get('error') === 'google';
  const googleReason = params.get('reason');
  const googleMessage = googleReason === 'account_conflict' || googleReason === 'account_link_required'
    ? 'Email ini sudah terdaftar. Masuk dengan password, lalu hubungkan Google dari My Account.'
    : googleReason === 'google_denied' ? 'Persetujuan Google dibatalkan. Coba lagi jika ingin masuk dengan Google.'
      : `Login Google gagal${googleReason && /^[a-z_]{3,40}$/.test(googleReason) ? ` (kode: ${googleReason})` : ''}. Coba lagi atau masuk dengan email.`;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === 'register' && password !== confirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }
    setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'verify') {
        await customerApi('auth/verify', customerJson('POST', { token }));
        window.history.replaceState(null, '', window.location.pathname);
        setMessage('Email berhasil diverifikasi. Silakan masuk.');
      } else if (mode === 'reset') {
        await customerApi('auth/reset', customerJson('POST', { token, password }));
        window.history.replaceState(null, '', window.location.pathname);
        setMessage('Password diperbarui. Silakan masuk.');
      } else if (mode === 'forgot') {
        const result = await customerApi<{ message: string }>('auth/forgot', customerJson('POST', { email }));
        setMessage(result.message);
      } else if (mode === 'register') {
        const result = await customerApi<{ message: string }>('auth/register', customerJson('POST', { email, password, displayName: name }));
        setMessage(result.message);
      } else {
        await customerApi('auth/login', customerJson('POST', { email, password }));
        router.push(next); router.refresh();
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Permintaan gagal.');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    if (!email) { setError('Isi email terlebih dahulu.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await customerApi<{ message: string }>('auth/resend', customerJson('POST', { email }));
      setMessage(result.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Tautan belum dapat dikirim.');
    } finally { setBusy(false); }
  }

  const title = {
    login: 'Masuk ke akun', register: 'Buat akun pelanggan',
    forgot: 'Lupa password', reset: 'Atur ulang password', verify: 'Verifikasi email',
  }[mode];
  const submitLabel = {
    login: 'Masuk', register: 'Daftar', forgot: 'Kirim tautan reset',
    reset: 'Simpan password baru', verify: 'Verifikasi email',
  }[mode];
  const returnTo = `?next=${encodeURIComponent(next)}`;

  return <main className="page-shell nav-offset min-h-screen bg-surface-bright">
    <div className="site-container max-w-lg py-14 sm:py-20">
      <Link href="/catalog" className="text-sm font-semibold text-brand-navy underline">Kembali ke katalog</Link>
      <section className="mt-7 rounded-2xl border border-border-subtle bg-white p-6 shadow-sm sm:p-9">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-maroon">52 Coffee & Roastery</p>
        <h1 className="mt-3 font-editorial text-3xl font-bold text-brand-charcoal">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">Kelola alamat, pesanan, dan pembayaran Anda dalam satu akun.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === 'register' && <label className="block text-sm font-semibold">Nama lengkap
            <input className="field-control mt-2 w-full" required minLength={2} maxLength={100} autoComplete="name"
              value={name} onChange={(event) => setName(event.target.value)} />
          </label>}
          {['login', 'register', 'forgot'].includes(mode) && <label className="block text-sm font-semibold">Email
            <input className="field-control mt-2 w-full" type="email" required maxLength={254} autoComplete="email"
              value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>}
          {['login', 'register', 'reset'].includes(mode) && <label className="block text-sm font-semibold">Password
            <input className="field-control mt-2 w-full" type={showPassword ? 'text' : 'password'} required
              minLength={mode === 'login' ? undefined : 12} maxLength={128}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>}
          {['login', 'register', 'reset'].includes(mode) && <label className="flex items-center gap-2 text-xs text-on-surface-variant">
            <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
            Tampilkan password
          </label>}
          {mode === 'register' && <label className="block text-sm font-semibold">Konfirmasi password
            <input className="field-control mt-2 w-full" type={showPassword ? 'text' : 'password'} required minLength={12}
              maxLength={128} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          </label>}
          {error && <p role="alert" className="text-sm text-brand-maroon">{error}</p>}
          {googleError && !error && <p role="alert" className="text-sm text-brand-maroon">{googleMessage}</p>}
          {message && <p role="status" className="text-sm text-brand-navy">{message}</p>}
          <button className="min-h-12 w-full rounded-xl bg-brand-charcoal px-5 text-sm font-bold text-white disabled:opacity-50"
            type="submit" disabled={busy || ((mode === 'verify' || mode === 'reset') && !token)}>
            {busy ? 'Memproses…' : submitLabel}
          </button>
        </form>
        {mode === 'register' && <button type="button" onClick={resend} disabled={busy}
          className="mt-4 text-sm font-semibold text-brand-navy underline disabled:opacity-50">Kirim ulang verifikasi email</button>}
        {(mode === 'login' || mode === 'register') && googleEnabled && <a
          href={`/api/customer/google/start?next=${encodeURIComponent(next)}`}
          className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-border-subtle text-sm font-semibold text-brand-charcoal">
          Lanjutkan dengan Google
        </a>}
        {mode === 'login' && <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
          <Link href="/forgot-password" className="text-brand-navy underline">Lupa password?</Link>
          <Link href={`/register${returnTo}`} className="text-brand-navy underline">Buat akun</Link>
        </div>}
        {mode !== 'login' && <Link href={`/login${returnTo}`} className="mt-5 inline-block text-sm text-brand-navy underline">Kembali ke login</Link>}
      </section>
    </div>
  </main>;
}
