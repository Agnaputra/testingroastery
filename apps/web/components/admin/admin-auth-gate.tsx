'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface AdminAuthGateProps {
  authStep: 'credentials' | 'pin';
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  pinInput: string;
  setPinInput: (value: string) => void;
  pinError: string;
  setPinError: (value: string) => void;
  handleLogin: (event: React.FormEvent) => void;
}

export function AdminAuthGate(props: AdminAuthGateProps) {
  const { authStep, username, setUsername, password, setPassword, pinInput,
    setPinInput, pinError, setPinError, handleLogin } = props;
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F7F6] px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border-subtle bg-white p-8 text-brand-charcoal shadow-sm">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy text-white shadow-xs"><Lock size={18} /></div>
          <h1 className="font-headline text-xl font-bold tracking-tight">Portal Roastery</h1>
          <p className="text-xs leading-relaxed text-on-surface-variant">Akses internal manajemen sangrai, katalog, dan pesanan pelanggan.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {authStep === 'credentials' ? <>
            <label className="block text-xs font-semibold">Username
              <input required autoComplete="username" value={username} autoFocus
                onChange={(event) => { setUsername(event.target.value); setPinError(''); }}
                className="field-control mt-1.5 w-full" />
            </label>
            <label className="block text-xs font-semibold">Password
              <input type="password" required autoComplete="current-password" value={password}
                onChange={(event) => { setPassword(event.target.value); setPinError(''); }}
                className="field-control mt-1.5 w-full" />
            </label>
          </> : <div className="space-y-1.5">
            <label className="block text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">PIN Keamanan</label>
            <input type="password" inputMode="numeric" maxLength={6} value={pinInput} autoFocus
              onChange={(event) => { setPinInput(event.target.value); setPinError(''); }} placeholder="••••"
              className="w-full rounded-md border border-border-subtle bg-slate-50/50 p-2.5 text-center font-mono text-2xl font-bold tracking-[0.4em] focus:border-brand-navy focus:bg-white focus:outline-none" />
          </div>}
          {pinError ? <p role="alert" className="text-center font-mono text-xs font-medium text-brand-maroon">{pinError}</p>
            : <p className="text-center font-mono text-[10px] text-on-surface-variant">{authStep === 'credentials' ? 'Langkah 1 dari 2 · Identitas staff' : 'Langkah 2 dari 2 · PIN roastery'}</p>}
          <button type="submit" className="w-full rounded-md bg-brand-navy py-2.5 font-mono text-xs font-semibold text-white shadow-2xs hover:bg-brand-navy-dark">
            {authStep === 'credentials' ? 'Lanjut ke PIN' : 'Masuk Portal'}
          </button>
        </form>
        <div className="border-t border-border-subtle pt-4 text-center"><Link href="/" className="font-mono text-xs text-on-surface-variant hover:text-brand-navy">← Kembali ke Toko Publik</Link></div>
      </div>
    </div>
  );
}
