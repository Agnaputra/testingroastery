'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Info,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatRupiah } from '../../../lib/data';

type CoffeeCategory = 'Daily Espresso' | 'Limited Espresso' | 'Daily Filter' | 'Limited Filter';

export default function PriceCalculatorPage() {
  const [category, setCategory] = useState<CoffeeCategory>('Daily Espresso');
  const [greenCostInput, setGreenCostInput] = useState<string>('120000');

  const greenCost = Number(greenCostInput.replace(/\D/g, '')) || 0;

  // Exact Calculation logic based on Figma specs
  const calc = useMemo(() => {
    // Weight loss factor ~20%
    const weightLoss = 0.20;
    const roastedCostPerKg = greenCost > 0 ? Math.round(greenCost / (1 - weightLoss)) : 0;
    
    // Labor & packaging overheads
    const laborCostPerKg = 10000;
    const packagingCost200g = 4000; // per pouch
    const totalRoastedHppPerKg = roastedCostPerKg + laborCostPerKg;

    // Margin factor based on category
    let margin = 0.40; // 40% margin for Daily Espresso
    if (category === 'Limited Espresso') margin = 0.48;
    if (category === 'Daily Filter') margin = 0.42;
    if (category === 'Limited Filter') margin = 0.52;

    // 200g pricing
    const baseHpp200g = (totalRoastedHppPerKg * 0.2) + packagingCost200g;
    const price200g = greenCost > 0 ? Math.round((baseHpp200g / (1 - margin)) / 1000) * 1000 : 0;

    // 500g pricing (slight bulk discount)
    const baseHpp500g = (totalRoastedHppPerKg * 0.5) + (packagingCost200g * 1.8);
    const price500g = greenCost > 0 ? Math.round(((baseHpp500g / (1 - margin)) * 0.95) / 1000) * 1000 : 0;

    // 1kg pricing (wholesale tier discount)
    const baseHpp1kg = (totalRoastedHppPerKg * 1.0) + (packagingCost200g * 2.5);
    const price1kg = greenCost > 0 ? Math.round(((baseHpp1kg / (1 - (margin - 0.12)))) / 1000) * 1000 : 0;

    return {
      roastedCostPerKg,
      laborCostPerKg,
      packagingCostTotal: 20000,
      price200g,
      price500g,
      price1kg,
    };
  }, [greenCost, category]);

  return (
    <div className="w-full bg-[#131313] text-[#e2e2e2] min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-10">
        {/* Top Breadcrumb */}
        <div className="flex items-center justify-between text-xs font-mono">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-gray-300 hover:text-white hover:border-roastery-crimson transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
          <span className="text-gray-500 font-mono hidden sm:inline">52 Coffee Price Estimator</span>
        </div>

        {/* Header Section (Exact Figma Text) */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-white">
            Price Calculator
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#c3c7c9] max-w-xl mx-auto">
            Estimate retail pricing for our coffee based on the green coffee cost!
          </p>
          <p className="text-xs text-[#8d9193] italic pt-1">
            Note: These are estimates only; actual prices may vary depending on roasting results.
          </p>
        </div>

        {/* 2-Column Calculator Layout (Exact Figma Frame 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: COFFEE DETAILS & INPUTS                                      */}
          {/* ========================================================================= */}
          <div className="bg-[#0e0e0e] rounded-3xl border border-[#434749]/60 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-white border-b border-[#434749]/40 pb-4">
              Coffee Details
            </h2>

            <div className="space-y-6">
              {/* Category Selection (Exact 4 buttons) */}
              <div className="space-y-2.5">
                <label className="block font-mono text-xs text-[#c3c7c9] uppercase tracking-wider font-semibold">
                  Coffee Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Daily Espresso', 'Limited Espresso', 'Daily Filter', 'Limited Filter'] as CoffeeCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold text-center transition-all ${
                        category === cat
                          ? 'border-roastery-crimson bg-[#8f001f] text-white shadow-md'
                          : 'border-[#434749]/80 bg-[#0e0e0e] text-white hover:border-gray-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Input */}
              <div className="space-y-2">
                <label className="block font-mono text-xs text-[#c3c7c9] uppercase tracking-wider font-semibold">
                  Green Coffee Cost per kg
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-[#c3c7c9] font-mono text-sm font-bold">Rp</span>
                  </div>
                  <input
                    type="text"
                    value={Number(greenCostInput).toLocaleString('id-ID')}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      setGreenCostInput(num);
                    }}
                    placeholder="120.000"
                    className="block w-full pl-12 pr-4 py-3 rounded-xl border border-[#434749] bg-[#1f1f1f] text-white font-mono text-base focus:outline-none focus:border-roastery-crimson transition-all"
                  />
                </div>
                <p className="text-xs text-[#8d9193]">
                  Enter the cost of your green (unroasted) coffee per kilogram
                </p>
              </div>

              {/* Info Box: What's included (Exact Figma Box) */}
              <div className="bg-[#004f58]/30 rounded-2xl p-4 flex gap-3 border border-[#8cd3dd]/30 text-xs">
                <Info className="w-5 h-5 text-[#8cd3dd] shrink-0 mt-0.5" />
                <div className="space-y-1 text-[#a7eff9]">
                  <h4 className="font-bold text-white font-mono">What&#39;s included</h4>
                  <ul className="text-xs space-y-1 text-gray-300">
                    <li>• Roasting labor costs</li>
                    <li>• Packaging materials</li>
                    <li>• Standard profit margins</li>
                    <li>• ~20% weight loss estimate</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: ESTIMATED RETAIL PRICES                                     */}
          {/* ========================================================================= */}
          <div className="bg-[#0e0e0e] rounded-3xl border border-[#434749]/60 p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-white border-b border-[#434749]/40 pb-4">
              Estimated Retail Prices
            </h2>

            <div className="space-y-3">
              {/* Row 1: 100g */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#434749]/50 bg-[#0e0e0e]">
                <div>
                  <span className="block font-mono text-sm text-white font-bold">100 g</span>
                  <span className="text-xs text-[#8d9193]">Not available</span>
                </div>
                <span className="text-[#8d9193] font-editorial text-xl font-bold">—</span>
              </div>

              {/* Row 2: 200g */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#434749]/50 bg-[#0e0e0e]">
                <span className="font-mono text-sm text-white font-bold">200 g</span>
                <span className="font-mono text-xl font-bold text-white">
                  {calc.price200g > 0 ? formatRupiah(calc.price200g) : 'Rp. 0'}
                </span>
              </div>

              {/* Row 3: 500g */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#434749]/50 bg-[#0e0e0e]">
                <span className="font-mono text-sm text-white font-bold">500 g</span>
                <span className="font-mono text-xl font-bold text-white">
                  {calc.price500g > 0 ? formatRupiah(calc.price500g) : 'Rp. 0'}
                </span>
              </div>

              {/* Row 4: 1 kg */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#434749]/50 bg-[#0e0e0e]">
                <span className="font-mono text-sm text-white font-bold">1 kg</span>
                <span className="font-mono text-xl font-bold text-white">
                  {calc.price1kg > 0 ? formatRupiah(calc.price1kg) : 'Rp. 0'}
                </span>
              </div>

              {/* Breakdown Box (Exact Figma Breakdown) */}
              <div className="mt-6 p-4 rounded-2xl bg-[#1b1b1b] border border-[#434749]/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs text-[#c3c7c9]">Roasted Cost per kg</span>
                  <span className="font-mono text-sm text-[#ffb3b8] font-bold">
                    {formatRupiah(calc.roastedCostPerKg)}
                  </span>
                </div>
                <p className="text-[11px] text-[#8d9193]">
                  Base cost after roasting (excl. packaging &amp; margins)
                </p>

                <div className="space-y-1.5 pt-3 border-t border-[#434749]/60 font-mono text-xs text-[#c3c7c9]">
                  <div className="flex justify-between">
                    <span>Labor Cost per kg</span>
                    <span>Rp. 10.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging (200g bags)</span>
                    <span>Rp. 20.000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
