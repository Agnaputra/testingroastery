'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calculator,
  Coffee,
  Sparkles,
  Layers,
  Award,
  Copy,
  Check,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { formatRupiah } from '../../../lib/data';
import { BrandPanel, PageIntro, SectionIntro } from '../../../components/ui/page-structure';

interface BeanOption {
  id: string;
  name: string;
  pricePerKg: number;
  category: string;
  notes: string;
}

const WHOLESALE_BEANS: BeanOption[] = [
  {
    id: 'dampit-robusta',
    name: 'Dampit Fine Robusta Espresso',
    pricePerKg: 150000,
    category: 'Robusta Espresso',
    notes: 'Dark Cocoa, Gula Aren, Dense Crema',
  },
  {
    id: 'arjuna-house-blend',
    name: '52 House Blend (Arjuna + Dampit)',
    pricePerKg: 200000,
    category: 'House Blend',
    notes: 'Caramel, Dark Chocolate, Balanced Body',
  },
  {
    id: 'java-ijen-espresso',
    name: 'Arabica Java Ijen Full Wash Blend',
    pricePerKg: 250000,
    category: '100% Arabica',
    notes: 'Brown Sugar, Clean Citrus, Sweet Cocoa',
  },
  {
    id: 'arjuna-budug-asu',
    name: 'Arjuna Budug Asu Natural Espresso',
    pricePerKg: 260000,
    category: '100% Arabica',
    notes: 'Tangerine, Lychee, Black Tea',
  },
  {
    id: 'brazil-santos-blend',
    name: 'Grand Espresso Blend (Brazil + Ijen)',
    pricePerKg: 290000,
    category: 'Signature Blend',
    notes: 'Roasted Peanut, Nutty Cocoa, Rich Body',
  },
];

interface DrinkPreset {
  id: string;
  name: string;
  extraCost: number; // Susu, sirup, cup, sedotan
  defaultPrice: number;
  description: string;
}

const DRINK_PRESETS: DrinkPreset[] = [
  {
    id: 'kopsus-aren',
    name: 'Es Kopi Susu Gula Aren',
    extraCost: 4500, // Susu 120ml + Gula Aren + Cup & Sedotan
    defaultPrice: 22000,
    description: 'Fresh milk 120ml, sirup aren asli, cup & sedotan',
  },
  {
    id: 'hot-latte',
    name: 'Hot Latte / Cappuccino',
    extraCost: 4000, // Fresh milk 150ml + Paper cup
    defaultPrice: 24000,
    description: 'Fresh milk steam 150ml, paper cup & lid',
  },
  {
    id: 'americano',
    name: 'Iced Americano / Long Black',
    extraCost: 1500, // Cup, seal, ice
    defaultPrice: 18000,
    description: 'Air mineral, es batu, cup & sedotan',
  },
  {
    id: 'manual-v60',
    name: 'Filter V60 Manual Brew',
    extraCost: 1000, // Filter paper + serving
    defaultPrice: 25000,
    description: 'Kertas filter V60, air mineral seduh',
  },
];

export default function B2BWholesaleCalculatorPage() {
  // Calculator State
  const [selectedBean, setSelectedBean] = useState<BeanOption>(WHOLESALE_BEANS[1]); // House blend 200k
  const [customBeanPrice, setCustomBeanPrice] = useState<number>(200000);
  const [isCustomPrice, setIsCustomPrice] = useState<boolean>(false);

  const [doseGrams, setDoseGrams] = useState<number>(18); // 18g double shot
  const [selectedDrink, setSelectedDrink] = useState<DrinkPreset>(DRINK_PRESETS[0]); // Kopsus aren
  const [extraCost, setExtraCost] = useState<number>(4500);
  const [sellingPrice, setSellingPrice] = useState<number>(22000);
  const [dailyCups, setDailyCups] = useState<number>(100);

  const [copied, setCopied] = useState<boolean>(false);

  // Active bean price per kg
  const activeBeanPrice = isCustomPrice ? customBeanPrice : selectedBean.pricePerKg;

  // Exact Financial Calculation Engine
  const calc = useMemo(() => {
    // 1. Yield & Cost per Cup
    const cupsPerKg = doseGrams > 0 ? 1000 / doseGrams : 0;
    const coffeeCostPerCup = Math.round((activeBeanPrice / 1000) * doseGrams);
    const totalHppPerCup = coffeeCostPerCup + extraCost;

    // 2. Profit Margin per Cup
    const grossProfitPerCup = Math.max(0, sellingPrice - totalHppPerCup);
    const marginPercent = sellingPrice > 0 ? Number(((grossProfitPerCup / sellingPrice) * 100).toFixed(1)) : 0;

    // 3. Monthly Projections (30 Days)
    const monthlyCups = dailyCups * 30;
    const monthlyBeanKg = Number(((monthlyCups * doseGrams) / 1000).toFixed(1));
    const monthlyBeanCost = Math.round(monthlyBeanKg * activeBeanPrice);
    const monthlyExtraCost = monthlyCups * extraCost;
    const monthlyTotalHpp = monthlyBeanCost + monthlyExtraCost;

    const monthlyRevenue = monthlyCups * sellingPrice;
    const monthlyGrossProfit = monthlyRevenue - monthlyTotalHpp;

    // 4. Determine Wholesale Tier Discount
    let tierName = 'Starter Partner';
    let discountPercent = 0;
    let tierBonus = 'Konsultasi Resep & Batch Tasting';

    if (monthlyBeanKg >= 50) {
      tierName = 'Tier 3 (Master Partner)';
      discountPercent = 15;
      tierBonus = 'Diskon grosir 15% + profil sangrai khusus + gratis ongkir Malang/Surabaya';
    } else if (monthlyBeanKg >= 25) {
      tierName = 'Tier 2 (Mitra Pro)';
      discountPercent = 10;
      tierBonus = 'Diskon Grosir 10% + Kalibrasi Barista Gratis Tiap Bulan';
    } else if (monthlyBeanKg >= 10) {
      tierName = 'Tier 1 (Starter Partner)';
      discountPercent = 5;
      tierBonus = 'Diskon grosir 5% + paket sampel batch terbaru';
    }

    const discountSavings = Math.round(monthlyBeanCost * (discountPercent / 100));
    const netBeanCostWithDiscount = monthlyBeanCost - discountSavings;
    const netMonthlyProfitWithDiscount = monthlyGrossProfit + discountSavings;

    return {
      cupsPerKg: Number(cupsPerKg.toFixed(1)),
      coffeeCostPerCup,
      totalHppPerCup,
      grossProfitPerCup,
      marginPercent,
      monthlyCups,
      monthlyBeanKg,
      monthlyBeanCost,
      monthlyRevenue,
      monthlyTotalHpp,
      monthlyGrossProfit,
      tierName,
      discountPercent,
      tierBonus,
      discountSavings,
      netBeanCostWithDiscount,
      netMonthlyProfitWithDiscount,
    };
  }, [activeBeanPrice, doseGrams, extraCost, sellingPrice, dailyCups]);

  const handleSelectDrinkPreset = (preset: DrinkPreset) => {
    setSelectedDrink(preset);
    setExtraCost(preset.extraCost);
    setSellingPrice(preset.defaultPrice);
  };

  const handleCopyCalculation = () => {
    const text = `Simulasi HPP & Laba Kedai Kopi — 52 Coffee & Roastery\n• Pilihan biji: ${isCustomPrice ? 'Harga khusus' : selectedBean.name} (${formatRupiah(activeBeanPrice)}/kg)\n• Dosis: ${doseGrams} g/cangkir (hasil: ~${calc.cupsPerKg} cangkir/kg)\n• HPP kopi: ${formatRupiah(calc.coffeeCostPerCup)}/cangkir\n• Bahan tambahan: ${formatRupiah(extraCost)}/cangkir\n• Total HPP: ${formatRupiah(calc.totalHppPerCup)}/cangkir\n• Harga jual: ${formatRupiah(sellingPrice)}/cangkir\n• Laba kotor: ${formatRupiah(calc.grossProfitPerCup)}/cangkir (margin ${calc.marginPercent}%)\n\nEstimasi bulanan (${dailyCups} cangkir/hari • ${calc.monthlyCups} cangkir/bulan):\n• Kebutuhan kopi: ${calc.monthlyBeanKg} kg/bulan\n• Estimasi omzet: ${formatRupiah(calc.monthlyRevenue)}\n• Estimasi laba kotor: ${formatRupiah(calc.netMonthlyProfitWithDiscount)}/bulan\n• Status mitra: ${calc.tierName} (${calc.tierBonus})`;

    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="page-shell"
    >
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (B2B Wholesale & Business Calculator)                     */}
      {/* ========================================================================= */}
      <PageIntro
        tone="dark"
        kicker="Kalkulator bisnis kopi"
        icon={<Calculator size={14} />}
        title="Hitung HPP dan proyeksi laba kedai Anda."
        description="Simulasikan biaya bahan per cangkir, harga jual, margin, dan kebutuhan pasokan bulanan dalam satu alur yang mudah diperiksa."
        visual={<BrandPanel label="Gunakan hasil simulasi sebagai dasar diskusi kebutuhan pasokan B2B." />}
      />

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SIMULATOR (2-Column Layout)                                */}
      {/* ========================================================================= */}
      <section className="site-container page-section space-y-12">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: Controls & Input Parameters (7 Cols) */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white lg:col-span-7">
            {/* 1. Bean Preset & Wholesale Price */}
            <div className="space-y-5 border-b border-gray-200 p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-brand-charcoal">
                  <Coffee className="w-4 h-4 text-brand-maroon" />
                  <span>1. Pilih Biji Kopi Grosir (1 kg)</span>
                </span>
                <span className="font-mono text-sm font-bold text-brand-maroon">
                  {formatRupiah(activeBeanPrice)} / kg
                </span>
              </div>

              {/* Bean Selector Dropdown Grid */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {WHOLESALE_BEANS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setSelectedBean(b);
                        setIsCustomPrice(false);
                      }}
                      aria-pressed={!isCustomPrice && selectedBean.id === b.id}
                      className={`flex min-h-20 cursor-pointer flex-col justify-between rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2 ${
                        !isCustomPrice && selectedBean.id === b.id
                          ? 'bg-brand-charcoal text-white border-brand-charcoal shadow-sm'
                          : 'bg-white text-brand-charcoal border-border-subtle hover:border-brand-teal'
                      }`}
                    >
                      <div className="text-xs font-bold leading-snug">{b.name}</div>
                      <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                        <span className={!isCustomPrice && selectedBean.id === b.id ? 'text-gray-300' : 'text-gray-500'}>
                          {b.category}
                        </span>
                        <span className="font-bold">
                          {formatRupiah(b.pricePerKg)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Price Toggle */}
                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:gap-3">
                  <label className="text-sm font-medium text-gray-600">
                    Atau masukkan harga grosir manual
                  </label>
                  <div className="flex items-center gap-1 bg-surface border border-gray-300 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-mono text-gray-500 font-bold">Rp</span>
                    <input
                      type="number"
                      aria-label="Harga grosir manual per kilogram"
                      step="5000"
                      value={customBeanPrice}
                      onChange={(e) => {
                        setCustomBeanPrice(Number(e.target.value));
                        setIsCustomPrice(true);
                      }}
                      className="w-24 bg-transparent border-none text-xs font-mono font-bold text-brand-charcoal focus:ring-0 p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Dose per Cup (Gramasi) */}
            <div className="space-y-4 border-b border-gray-200 p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 text-sm font-bold text-brand-charcoal">
                  <Layers className="w-4 h-4 text-brand-navy" />
                  <span>2. Atur Dosis Kopi per Cangkir</span>
                </span>
                <span className="text-sm font-mono font-black text-brand-navy">
                  {doseGrams} g / cangkir
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: '15g (Single/Light)', val: 15 },
                  { label: '16g (Standar Es)', val: 16 },
                  { label: '18g (Double Shot)', val: 18 },
                  { label: '20g (Heavy Body)', val: 20 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setDoseGrams(p.val)}
                    aria-pressed={doseGrams === p.val}
                    className={`min-h-11 cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      doseGrams === p.val
                        ? 'bg-brand-navy text-white border-brand-navy'
                        : 'bg-surface text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <input
                type="range"
                aria-label="Dosis kopi per cangkir"
                min="12"
                max="24"
                step="0.5"
                value={doseGrams}
                onChange={(e) => setDoseGrams(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-navy"
              />
              <div className="text-xs text-gray-600">
                Dari 1 kg biji kopi ({formatRupiah(activeBeanPrice)}), Anda menghasilkan sekitar <strong>~{calc.cupsPerKg} cangkir</strong> kopi.
              </div>
            </div>

            {/* 3. Drink Type & Extra Cost */}
            <div className="space-y-4 border-b border-gray-200 p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-bold text-brand-charcoal">
                  3. Pilih Menu &amp; Biaya Bahan Tambahan
                </span>
                <span className="text-sm font-mono font-black text-brand-charcoal">
                  {formatRupiah(extraCost)} / cangkir
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DRINK_PRESETS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelectDrinkPreset(d)}
                    aria-pressed={selectedDrink.id === d.id}
                    className={`min-h-16 cursor-pointer rounded-xl border p-2.5 text-left transition-colors ${
                      selectedDrink.id === d.id
                        ? 'bg-brand-charcoal text-white border-brand-charcoal'
                        : 'bg-surface text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-[11px] font-bold leading-snug">{d.name}</div>
                    <div className="text-[10px] font-mono opacity-80 mt-0.5">
                      +{formatRupiah(d.extraCost)}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-1 flex items-center gap-3">
                <label className="text-sm text-gray-600">Sesuaikan biaya</label>
                <input
                  type="range"
                  aria-label="Biaya bahan tambahan per cangkir"
                  min="500"
                  max="8000"
                  step="250"
                  value={extraCost}
                  onChange={(e) => setExtraCost(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-charcoal"
                />
              </div>
            </div>

            {/* 4. Selling Price & Daily Cups Target */}
            <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              {/* Selling Price */}
              <div className="space-y-3 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-charcoal">
                    Harga Jual Menu
                  </span>
                  <span className="text-base font-mono font-black text-brand-charcoal">
                    {formatRupiah(sellingPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Harga jual menu"
                  min="12000"
                  max="45000"
                  step="1000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-charcoal"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>12rb</span>
                  <span>22rb</span>
                  <span>35rb</span>
                  <span>45rb</span>
                </div>
              </div>

              {/* Daily Target */}
              <div className="space-y-3 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-charcoal">
                    Target Cangkir / Hari
                  </span>
                  <span className="text-base font-mono font-black text-brand-maroon">
                    {dailyCups} cangkir
                  </span>
                </div>
                <input
                  type="range"
                  aria-label="Target penjualan cangkir per hari"
                  min="20"
                  max="300"
                  step="10"
                  value={dailyCups}
                  onChange={(e) => setDailyCups(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-maroon"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>20</span>
                  <span>100</span>
                  <span>200</span>
                  <span>300</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Calculation Results (5 Cols) */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white lg:sticky lg:top-24 lg:col-span-5">
            {/* Unit Economics Highlight Cards */}
            <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
              {/* Total HPP per Cup */}
              <div className="space-y-1 p-5 sm:p-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold block">
                  Total HPP / Cangkir
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-black text-brand-charcoal">
                  {formatRupiah(calc.totalHppPerCup)}
                </div>
                <div className="text-[10px] font-mono text-gray-500 leading-snug">
                  Biji Kopi: {formatRupiah(calc.coffeeCostPerCup)} <br />
                  Bahan Lain: {formatRupiah(extraCost)}
                </div>
              </div>

              {/* Gross Profit Margin per Cup */}
              <div className="space-y-1 bg-brand-charcoal p-5 text-white sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-teal font-bold block">
                    Laba / Cangkir
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    Margin {calc.marginPercent}%
                  </span>
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-white">
                  {formatRupiah(calc.grossProfitPerCup)}
                </div>
                <div className="text-[10px] font-mono text-gray-300">
                  Harga Jual: {formatRupiah(sellingPrice)}
                </div>
              </div>
            </div>

            {/* Monthly Business Projections Card */}
            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-maroon" />
                  <h3 className="font-editorial text-lg font-bold text-brand-charcoal">
                    Proyeksi 30 Hari
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-brand-charcoal/10 text-brand-charcoal">
                  {calc.monthlyCups} cangkir / bulan
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Kebutuhan Biji Kopi:</span>
                  <span className="font-bold text-brand-charcoal">{calc.monthlyBeanKg} Kg / bulan</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Biaya Belanja Kopi:</span>
                  <span className="font-bold text-brand-charcoal">{formatRupiah(calc.monthlyBeanCost)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Estimasi Total Omzet:</span>
                  <span className="font-bold text-brand-charcoal">{formatRupiah(calc.monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-emerald-50 rounded-xl px-3 text-emerald-900 border border-emerald-200">
                  <span className="font-bold">Estimasi Laba Kotor:</span>
                  <span className="font-black text-sm">{formatRupiah(calc.monthlyGrossProfit)} / bln</span>
                </div>
              </div>

              {/* Wholesale Tier Discount Notification */}
              <div className="space-y-1 rounded-xl bg-surface-container-low p-3.5 text-xs">
                <div className="flex items-center gap-1.5 text-brand-charcoal font-bold">
                  <Award className="w-4 h-4 text-brand-maroon" />
                  <span>Mitra 52 Coffee &amp; Roastery: {calc.tierName}</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                  {calc.tierBonus}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleCopyCalculation}
                  className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs font-bold text-brand-charcoal transition-colors hover:border-brand-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:ring-offset-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Ringkasan</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                    `Halo Tim B2B 52 Coffee! Saya ingin berkonsultasi mengenai pasokan biji kopi grosir.\nEstimasi kebutuhan kedai saya: ~${calc.monthlyBeanKg} kg/bulan (${dailyCups} cangkir/hari).\nBiji yang diminati: ${isCustomPrice ? 'Harga khusus' : selectedBean.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-maroon px-4 py-3 text-center text-xs font-bold text-white transition-colors hover:bg-brand-maroon-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon focus-visible:ring-offset-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Konsultasi WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. WHOLESALE TIERS & BENEFIT TABLE                                        */}
      {/* ========================================================================= */}
      <section className="site-container page-section">
        <SectionIntro
          align="center"
          kicker="Pilihan kemitraan"
          title="Skema pasokan B2B"
          description="Bandingkan dukungan berdasarkan kebutuhan biji kopi bulanan bisnis Anda."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="ui-surface p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">10–25 kg / bulan</span>
              <h3 className="font-editorial text-xl font-bold text-brand-charcoal">Mitra Rintisan</h3>
              <p className="text-xs text-on-surface-variant">Cocok untuk kedai rintisan dan gerai kopi bawa pulang.</p>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-2 text-xs font-sans text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Diskon grosir 5% dari harga eceran</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Paket sampel gratis untuk batch panen baru</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Jadwal sangrai segar setiap minggu</span>
              </div>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="relative overflow-hidden rounded-xl border border-brand-charcoal bg-brand-charcoal p-6 text-white space-y-4">
            <div className="absolute top-3 right-3 bg-brand-maroon text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold">
              PALING POPULER
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-brand-teal font-bold">25–50 kg / bulan</span>
              <h3 className="font-editorial text-xl font-bold text-white">Mitra Pro</h3>
              <p className="text-xs text-white/70">Untuk kedai reguler dengan volume 100–200 cangkir per hari.</p>
            </div>
            <div className="pt-2 border-t border-white/10 space-y-2 text-xs font-sans text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Diskon Grosir 10% dari harga retail</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kalibrasi dan pelatihan barista setiap bulan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Prioritas alokasi panen &amp; micro-lot</span>
              </div>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="ui-surface p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-on-surface-variant font-bold">Lebih dari 50 kg / bulan</span>
              <h3 className="font-editorial text-xl font-bold text-brand-charcoal">Mitra Utama</h3>
              <p className="text-xs text-on-surface-variant">Untuk bisnis multi-gerai, restoran, dan hotel.</p>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-2 text-xs font-sans text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Diskon grosir 15%–20%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Racikan khusus dan profil sangrai eksklusif</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gratis pengiriman area Malang, Surabaya &amp; sekitarnya</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BOTTOM PARTNERSHIP CTA BANNER                                          */}
      {/* ========================================================================= */}
      <section className="site-container pb-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-xl bg-brand-charcoal p-8 text-white sm:flex-row sm:p-12">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
              Siap Bermitra dengan 52 Coffee?
            </h3>
            <p className="text-xs sm:text-sm text-white/70 font-sans max-w-md">
              Kunjungi formulir kemitraan atau hubungi tim roaster kami untuk meminta sesi cupping dan sampel kopi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/work-with-us"
              className="btn-secondary border-white bg-white text-brand-charcoal"
            >
              <span>Formulir Kemitraan →</span>
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
