'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface AdminAuthGateProps {
  pinInput: string;
  setPinInput: (val: string) => void;
  pinError: string;
  setPinError: (val: string) => void;
  handleLogin: (e: React.FormEvent) => void;
}

export function AdminAuthGate({
  pinInput,
  setPinInput,
  pinError,
  setPinError,
  handleLogin,
}: AdminAuthGateProps) {
  return (
    <div className="min-h-screen bg-[#F6F7F6] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm bg-white text-brand-charcoal rounded-xl border border-border-subtle p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-brand-navy text-white flex items-center justify-center mx-auto shadow-xs">
            <Lock size={18} />
          </div>
          <h1 className="font-headline text-xl font-bold text-brand-charcoal tracking-tight">
            Portal Roastery
          </h1>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Akses internal manajemen sangrai, master 55 SKU, dan pesanan pelanggan.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-semibold text-center">
              PIN Keamanan
            </label>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError('');
              }}
              placeholder="••••"
              className="w-full rounded-md border border-border-subtle bg-slate-50/50 p-2.5 text-center font-mono text-2xl tracking-[0.4em] font-bold text-brand-charcoal focus:border-brand-navy focus:bg-white focus:outline-none transition-colors"
              autoFocus
            />
            {pinError ? (
              <p className="text-xs text-brand-maroon font-mono text-center font-medium">{pinError}</p>
            ) : (
              <p className="text-[10px] text-on-surface-variant font-mono text-center">
                Masukkan PIN staff roastery
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-brand-navy py-2.5 font-mono text-xs font-semibold text-white hover:bg-brand-navy-dark transition-colors shadow-2xs"
          >
            Masuk Portal
          </button>
        </form>

        <div className="border-t border-border-subtle pt-4 text-center">
          <Link
            href="/"
            className="font-mono text-xs text-on-surface-variant hover:text-brand-navy transition-colors"
          >
            ← Kembali ke Toko Publik
          </Link>
        </div>
      </div>
    </div>
  );
}
