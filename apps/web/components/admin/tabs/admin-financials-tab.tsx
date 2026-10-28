'use client';

import React from 'react';
import { Lock } from 'lucide-react';

const FINANCIAL_ROWS = [
  {
    category: 'Ijen Series (Single Origin)',
    hppGreenBean: 'Rp 120.000 – Rp 150.000',
    shrinkage: '~15.5%',
    roastAndPackCost: 'Rp 12.500 / pouch',
    retailPrice: 'Rp 109.000 – Rp 120.000',
    grossMargin: '52% – 58%',
  },
  {
    category: 'Java Exotic (Fermentasi Spesial)',
    hppGreenBean: 'Rp 220.000 – Rp 280.000',
    shrinkage: '~14.8%',
    roastAndPackCost: 'Rp 14.000 / pouch',
    retailPrice: 'Rp 220.000 – Rp 259.000',
    grossMargin: '48% – 54%',
  },
  {
    category: 'Grand Reserve Micro-Lot (Colombia / Yemen)',
    hppGreenBean: 'Rp 850.000 – Rp 1.400.000',
    shrinkage: '~13.2%',
    roastAndPackCost: 'Rp 25.000 / tube kaca',
    retailPrice: 'Rp 350.000 – Rp 380.000 (100g)',
    grossMargin: '62% – 66%',
  },
  {
    category: 'Espresso Roast & Robusta Modern',
    hppGreenBean: 'Rp 65.000 – Rp 95.000',
    shrinkage: '~18.0%',
    roastAndPackCost: 'Rp 9.500 / pouch',
    retailPrice: 'Rp 60.000 – Rp 75.000 (200g)',
    grossMargin: '45% – 50%',
  },
];

export function AdminFinancialsTab() {
  return (
    <div className="space-y-6">
      {/* Security Banner - Understated & Professional */}
      <div className="rounded-xl border border-border-subtle bg-slate-50/80 p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-charcoal text-white">
            <Lock size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline font-bold text-brand-charcoal text-sm">
                Parameter Finansial &amp; Margin HPP Roastery
              </h2>
              <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Internal Only
              </span>
            </div>
            <p className="mt-0.5 text-xs text-on-surface-variant leading-relaxed">
              Kalkulasi HPP green bean, landed cost proses roasting (energi &amp; penyusutan kadar air), kemasan ritel, dan batas gross margin yang digunakan sebagai acuan pricing toko online.
            </p>
          </div>
        </div>
      </div>

      {/* Financial Table - Apple Numbers aesthetic */}
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-border-subtle bg-slate-50/70 text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              <tr>
                <th className="py-3 px-4 font-sans">Kategori Kopi</th>
                <th className="py-3 px-4">HPP Green Bean / kg</th>
                <th className="py-3 px-4">Susut Sangrai</th>
                <th className="py-3 px-4">Biaya Roasting &amp; Kemasan</th>
                <th className="py-3 px-4">Harga Retail Standar</th>
                <th className="py-3 px-4 text-right">Target Margin Kotor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {FINANCIAL_ROWS.map((row) => (
                <tr key={row.category} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-semibold text-sm text-brand-charcoal">
                    {row.category}
                  </td>
                  <td className="py-3.5 px-4 text-brand-charcoal tabular-nums">
                    {row.hppGreenBean}
                  </td>
                  <td className="py-3.5 px-4 text-brand-maroon font-medium tabular-nums">
                    {row.shrinkage}
                  </td>
                  <td className="py-3.5 px-4 text-on-surface-variant tabular-nums">
                    {row.roastAndPackCost}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-brand-charcoal tabular-nums">
                    {row.retailPrice}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-brand-navy tabular-nums">
                    {row.grossMargin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
