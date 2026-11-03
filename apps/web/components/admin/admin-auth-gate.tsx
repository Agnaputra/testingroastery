'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';

export function AdminAuthGate({ loginError }: { loginError: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F7F6] px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border-subtle bg-white p-8 text-brand-charcoal shadow-sm">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy text-white"><Lock size={18} /></div>
          <h1 className="font-headline text-xl font-bold tracking-tight">Portal Roastery</h1>
          <p className="text-xs leading-relaxed text-on-surface-variant">Masuk dengan akun Google yang memiliki role admin untuk mengelola katalog dan pesanan.</p>
        </div>
        {loginError && <p role="alert" className="text-center text-xs text-brand-maroon">{loginError}</p>}
        <a href="/api/customer/google/start?next=%2Fadmin" className="flex min-h-11 w-full items-center justify-center rounded-md bg-brand-navy px-4 py-2.5 text-center text-xs font-semibold text-white hover:bg-brand-navy-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy">
          Masuk sebagai admin dengan Google
        </a>
        <div className="border-t border-border-subtle pt-4 text-center"><Link href="/" className="text-xs text-on-surface-variant hover:text-brand-navy">Kembali ke Toko Publik</Link></div>
      </div>
    </div>
  );
}
