'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { CourierType } from '../../../lib/store/useOrderStore';

interface AdminShippingModalProps {
  shippingOrderId: string | null;
  selectedCourier: CourierType;
  setSelectedCourier: (val: CourierType) => void;
  trackingNumberInput: string;
  setTrackingNumberInput: (val: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const COURIER_OPTIONS: CourierType[] = [
  'JNE Reguler',
  'J&T Express',
  'SiCepat BEST',
  'Paxel Sameday',
  'Pickup Di Kedai',
];

export function AdminShippingModal({
  shippingOrderId,
  selectedCourier,
  setSelectedCourier,
  trackingNumberInput,
  setTrackingNumberInput,
  onClose,
  onSave,
}: AdminShippingModalProps) {
  if (!shippingOrderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-xl border border-border-subtle p-6 shadow-xl space-y-5 animate-in fade-in-0 duration-150">
        <div className="flex items-start justify-between border-b border-border-subtle pb-4">
          <div>
            <h3 className="font-headline font-bold text-base text-brand-charcoal">
              Pengiriman &amp; Resi Kurir
            </h3>
            <p className="mt-0.5 text-xs text-on-surface-variant font-mono">
              Pesanan #{shippingOrderId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-on-surface-variant hover:bg-slate-100 hover:text-brand-charcoal transition-colors"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
              Layanan Kurir / Ekspedisi
            </label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value as CourierType)}
              className="w-full rounded-md border border-border-subtle bg-slate-50/70 p-2 text-xs font-semibold text-brand-charcoal focus:border-brand-navy focus:bg-white focus:outline-none"
            >
              {COURIER_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-on-surface-variant mb-1 font-medium">
              Nomor Resi Pengiriman (AWB)
            </label>
            <input
              type="text"
              value={trackingNumberInput}
              onChange={(e) => setTrackingNumberInput(e.target.value)}
              placeholder="Contoh: JNE-0982310291"
              className="w-full rounded-md border border-border-subtle bg-slate-50/70 p-2 text-xs font-mono font-bold text-brand-charcoal tabular-nums focus:border-brand-navy focus:bg-white focus:outline-none"
            />
            <p className="mt-1 text-[11px] font-sans text-on-surface-variant leading-relaxed">
              Resi akan otomatis tampil di halaman lacak pesanan pembeli.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border-subtle bg-white px-3.5 py-2 font-mono text-xs font-medium text-brand-charcoal hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-md bg-brand-navy px-4 py-2 font-mono text-xs font-semibold text-white hover:bg-brand-navy-dark transition-colors"
          >
            Simpan Resi
          </button>
        </div>
      </div>
    </div>
  );
}
