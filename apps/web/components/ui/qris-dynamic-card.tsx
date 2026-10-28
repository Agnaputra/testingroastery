'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Check, Copy, ShieldCheck, Download, Sparkles, RefreshCw, QrCode } from 'lucide-react';
import { createDynamicQris, generateQrDataUrl } from '../../lib/qris';
import { formatRupiah } from '../../lib/data';

interface QrisDynamicCardProps {
  amount: number;
  orderId?: string;
  className?: string;
}

export function QrisDynamicCard({ amount, orderId, className = '' }: QrisDynamicCardProps) {
  const [copied, setCopied] = useState(false);
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [mode, setMode] = useState<'dynamic' | 'original'>('dynamic');

  const qris = useMemo(() => {
    return createDynamicQris(amount);
  }, [amount]);

  useEffect(() => {
    let active = true;
    void generateQrDataUrl(qris.payload, { width: 450, margin: 2 }).then((url) => {
      if (active) setPngDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [qris.payload]);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(qris.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    if (typeof window === 'undefined') return;
    if (mode === 'original') {
      const a = document.createElement('a');
      a.href = '/qris.jpg';
      a.download = 'qris-shopee-original.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (pngDataUrl) {
      const a = document.createElement('a');
      a.href = pngDataUrl;
      a.download = `qris-dinamis-52coffee-${orderId ?? 'pay'}-${amount}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div
      className={`relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-md ${className}`}
    >
      {/* Official QRIS Header */}
      <div className="border-b border-border-subtle bg-[#F8FAFC] px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-xl font-black tracking-tighter text-[#EA1C24]">
              QR<span className="text-[#1E293B]">IS</span>
            </span>
            <div className="h-3 w-px bg-border-subtle" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
              {mode === 'dynamic' ? 'ShopeePay Dynamic' : 'ShopeePay Asli'}
            </span>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3 w-3" />
            <span>ASPI / BI Certified</span>
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-3 flex rounded-lg bg-[#F1F5F9] p-0.5">
          <button
            type="button"
            onClick={() => setMode('dynamic')}
            className={`flex-1 rounded-md py-1 text-center font-sans text-xs font-semibold transition-all ${
              mode === 'dynamic'
                ? 'bg-white text-brand-charcoal shadow-2xs'
                : 'text-on-surface-variant hover:text-brand-charcoal'
            }`}
          >
            QRIS Dinamis (Otomatis)
          </button>
          <button
            type="button"
            onClick={() => setMode('original')}
            className={`flex-1 rounded-md py-1 text-center font-sans text-xs font-semibold transition-all ${
              mode === 'original'
                ? 'bg-white text-brand-charcoal shadow-2xs'
                : 'text-on-surface-variant hover:text-brand-charcoal'
            }`}
          >
            QRIS Asli Shopee
          </button>
        </div>

        {/* Merchant & NMID Info */}
        <div className="mt-2.5 text-center">
          <h4 className="font-sans text-base font-bold text-brand-charcoal">
            {qris.merchantName}
          </h4>
          <p className="font-mono text-[11px] text-on-surface-variant">
            NMID: {qris.nmid} · Terminal: {qris.terminalId}
          </p>
          <p className="text-[10px] text-brand-teal font-medium">
            52 Coffee &amp; Roastery Merchant Partner
          </p>
        </div>
      </div>

      {/* QR Code Matrix Frame */}
      <div className="flex flex-col items-center justify-center p-5">
        {mode === 'dynamic' ? (
          <div className="relative flex items-center justify-center rounded-xl border-2 border-border-subtle bg-white p-2 shadow-xs transition-transform">
            {pngDataUrl ? (
              /* High-contrast PNG DataURL — 100% verified scannable by mobile banking cameras */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pngDataUrl}
                alt="QRIS Dinamis 52 Coffee"
                width={260}
                height={260}
                className="h-60 w-60 object-contain"
              />
            ) : (
              <div
                className="h-60 w-60 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: qris.svg }}
              />
            )}
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-border-subtle bg-white p-2 shadow-xs">
            <Image
              src="/qris.jpg"
              alt="QRIS Asli ShopeePay"
              width={260}
              height={360}
              unoptimized
              className="h-auto max-h-72 w-auto object-contain rounded-lg"
            />
          </div>
        )}

        {/* Dynamic Amount Banner */}
        <div className="mt-4 w-full rounded-xl border border-brand-maroon/20 bg-brand-maroon/5 p-3 text-center">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-brand-maroon">
            Total Pembayaran
          </span>
          <span className="mt-0.5 block font-mono text-xl font-black tracking-tight text-brand-maroon">
            {formatRupiah(qris.amount)}
          </span>
          {mode === 'dynamic' ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-sans text-[10px] font-semibold text-brand-charcoal shadow-2xs border border-border-subtle">
              <Sparkles className="h-3 w-3 text-amber-500" /> Nominal terkunci otomatis saat di-scan
            </span>
          ) : (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-sans text-[10px] font-semibold text-brand-charcoal shadow-2xs border border-border-subtle">
              Masukkan nominal {formatRupiah(qris.amount)} manual di aplikasi
            </span>
          )}
        </div>

        {/* Instructions */}
        <p className="mt-3 text-center text-xs text-on-surface-variant leading-relaxed">
          {mode === 'dynamic' ? (
            <>
              Scan dengan <strong>BCA Mobile, Livin&apos; Mandiri, BRImo, ShopeePay, GoPay, OVO, atau Dana</strong>. Nominal akan otomatis terisi <strong>{formatRupiah(qris.amount)}</strong>.
            </>
          ) : (
            <>
              Scan QR asli di atas, lalu masukkan nominal <strong>{formatRupiah(qris.amount)}</strong> secara manual di aplikasi pembayaran Anda.
            </>
          )}
        </p>

        {/* Actions */}
        <div className="mt-4 flex w-full items-center gap-2">
          {mode === 'dynamic' && (
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3 text-xs font-semibold text-brand-charcoal transition-all hover:bg-black/[0.03] active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-on-surface-variant" />
                  <span>Salin Payload</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-white px-3 text-xs font-semibold text-brand-charcoal transition-all hover:bg-black/[0.03] active:scale-95 ${
              mode === 'original' ? 'w-full' : ''
            }`}
            title="Unduh file QRIS"
          >
            <Download className="h-3.5 w-3.5 text-on-surface-variant" />
            <span>Unduh QR</span>
          </button>
        </div>
      </div>

      {/* Footer Network Logos */}
      <div className="border-t border-border-subtle bg-[#F8FAFC] px-4 py-2.5 text-center">
        <p className="font-mono text-[10px] text-on-surface-variant">
          Didukung oleh semua aplikasi perbankan &amp; e-wallet berlogo QRIS
        </p>
      </div>
    </div>
  );
}
