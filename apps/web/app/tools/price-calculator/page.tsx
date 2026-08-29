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
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { formatRupiah } from '../../../lib/data';

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
      tierBonus = 'Diskon Grosir 15% + Custom Sangrai Khusus + Free Ongkir Malang/Sby';
    } else if (monthlyBeanKg >= 25) {
      tierName = 'Tier 2 (Pro Cafe Partner)';
      discountPercent = 10;
      tierBonus = 'Diskon Grosir 10% + Kalibrasi Barista Gratis Tiap Bulan';
    } else if (monthlyBeanKg >= 10) {
      tierName = 'Tier 1 (Starter Partner)';
      discountPercent = 5;
      tierBonus = 'Diskon Grosir 5% + Sample Pack Batch Terbaru';
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
    const text = `☕ Simulasi HPP & Laba Kedai Kopi (52 Coffee Roastery):\n• Pilihan Biji: ${isCustomPrice ? 'Custom Price' : selectedBean.name} (${formatRupiah(activeBeanPrice)}/kg)\n• Dosis: ${doseGrams}g/cup (Yield: ~${calc.cupsPerKg} cup/kg)\n• HPP Kopi Murni: ${formatRupiah(calc.coffeeCostPerCup)}/cup\n• Bahan Tambahan (Susu/Cup): ${formatRupiah(extraCost)}/cup\n• TOTAL HPP: ${formatRupiah(calc.totalHppPerCup)}/cup\n• Harga Jual Menu: ${formatRupiah(sellingPrice)}/cup\n• LABA BERSIH: ${formatRupiah(calc.grossProfitPerCup)}/cup (${calc.marginPercent}% Margin)\n\n📊 Estimasi Bulanan (${dailyCups} cup/hari • ${calc.monthlyCups} cup/bln):\n- Kebutuhan Kopi: ${calc.monthlyBeanKg} kg/bln\n- Estimasi Omzet: ${formatRupiah(calc.monthlyRevenue)}\n- Estimasi Laba Kotor: ${formatRupiah(calc.netMonthlyProfitWithDiscount)}/bln\n- Status Mitra: ${calc.tierName} (${calc.tierBonus})`;

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
      className="w-full bg-[#FAFAFA] text-[#162A43] antialiased font-sans"
    >
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (B2B Wholesale & Business Calculator)                     */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[440px] sm:min-h-[500px] pt-28 pb-16 flex items-center justify-start overflow-hidden bg-[#101A26]">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 w-full h-full mix-blend-luminosity opacity-45 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/canva-roaster-drum.jpg')` }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#101A26] via-[#101A26]/85 to-[#101A26]/40" />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl space-y-3"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <Calculator className="w-3.5 h-3.5 text-[#D8B168]" />
              <span className="font-mono text-[11px] text-gray-200 tracking-widest uppercase font-bold">
                B2B WHOLESALE &amp; PROFIT SIMULATOR
              </span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-white leading-tight tracking-tight">
              B2B Wholesale &amp; <br />
              <span className="text-[#D8B168]">Kalkulator HPP Kedai Kopi.</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans max-w-2xl">
              Simulasikan estimasi biaya modal biji kopi per cangkir, bahan pendukung (susu &amp; cup), margin laba bersih, hingga kebutuhan pasokan kopi bulanan kedai Anda bersama 52 Coffee Roastery.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE SIMULATOR (2-Column Layout)                                */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN: Controls & Input Parameters (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Bean Preset & Wholesale Price */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-gray-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#162A43] font-extrabold flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#A52136]" />
                  <span>1. Pilihan Biji Kopi 52 Roastery (Wholesale 1kg)</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#A52136]">
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
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        !isCustomPrice && selectedBean.id === b.id
                          ? 'bg-[#162A43] text-white border-[#162A43] shadow-sm'
                          : 'bg-[#F8FAFC] text-[#162A43] border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{b.name}</div>
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
                <div className="pt-2 flex items-center gap-3">
                  <label className="text-xs font-mono font-bold text-gray-600">
                    Atau Input Harga Grosir Manual:
                  </label>
                  <div className="flex items-center gap-1 bg-[#F8FAFC] border border-gray-300 px-3 py-1.5 rounded-xl">
                    <span className="text-xs font-mono text-gray-500 font-bold">Rp</span>
                    <input
                      type="number"
                      step="5000"
                      value={customBeanPrice}
                      onChange={(e) => {
                        setCustomBeanPrice(Number(e.target.value));
                        setIsCustomPrice(true);
                      }}
                      className="w-24 bg-transparent border-none text-xs font-mono font-bold text-[#162A43] focus:ring-0 p-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Dose per Cup (Gramasi) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-gray-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#162A43] font-extrabold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#246A73]" />
                  <span>2. Dosis Bubuk Kopi per Cangkir (Gramasi)</span>
                </span>
                <span className="text-sm font-mono font-black text-[#246A73]">
                  {doseGrams} Gram / Cup
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
                    className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      doseGrams === p.val
                        ? 'bg-[#246A73] text-white border-[#246A73]'
                        : 'bg-[#F8FAFC] text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="12"
                max="24"
                step="0.5"
                value={doseGrams}
                onChange={(e) => setDoseGrams(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#246A73]"
              />
              <div className="text-[11px] font-mono text-gray-500">
                💡 Dari 1 kg biji kopi ({formatRupiah(activeBeanPrice)}), Anda menghasilkan sekitar <strong>~{calc.cupsPerKg} cup</strong> kopi.
              </div>
            </div>

            {/* 3. Drink Type & Extra Cost */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border-2 border-gray-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#162A43] font-extrabold">
                  3. Biaya Bahan Tambahan (Susu, Gula, Cup &amp; Sedotan)
                </span>
                <span className="text-sm font-mono font-black text-[#162A43]">
                  {formatRupiah(extraCost)} / cup
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DRINK_PRESETS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelectDrinkPreset(d)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedDrink.id === d.id
                        ? 'bg-[#162A43] text-white border-[#162A43]'
                        : 'bg-[#F8FAFC] text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-bold text-[11px] truncate">{d.name}</div>
                    <div className="text-[10px] font-mono opacity-80 mt-0.5">
                      +{formatRupiah(d.extraCost)}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-1 flex items-center gap-3">
                <label className="text-xs font-mono text-gray-600">Sesuaikan Biaya Tambahan:</label>
                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="250"
                  value={extraCost}
                  onChange={(e) => setExtraCost(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#162A43]"
                />
              </div>
            </div>

            {/* 4. Selling Price & Daily Cups Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selling Price */}
              <div className="p-5 rounded-3xl bg-white border-2 border-gray-200 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#162A43] font-bold">
                    Harga Jual Menu
                  </span>
                  <span className="text-base font-mono font-black text-[#162A43]">
                    {formatRupiah(sellingPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="12000"
                  max="45000"
                  step="1000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#162A43]"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>12rb</span>
                  <span>22rb</span>
                  <span>35rb</span>
                  <span>45rb</span>
                </div>
              </div>

              {/* Daily Target */}
              <div className="p-5 rounded-3xl bg-white border-2 border-gray-200 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#162A43] font-bold">
                    Target Cup / Hari
                  </span>
                  <span className="text-base font-mono font-black text-[#A52136]">
                    {dailyCups} Cup
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="10"
                  value={dailyCups}
                  onChange={(e) => setDailyCups(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#A52136]"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-400">
                  <span>20 cup</span>
                  <span>100 cup</span>
                  <span>200 cup</span>
                  <span>300 cup</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Calculation Results (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Unit Economics Highlight Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Total HPP per Cup */}
              <div className="p-5 rounded-3xl bg-white border-2 border-gray-200 shadow-md space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 font-bold block">
                  TOTAL HPP PER CUP
                </span>
                <div className="font-mono text-2xl sm:text-3xl font-black text-[#162A43]">
                  {formatRupiah(calc.totalHppPerCup)}
                </div>
                <div className="text-[10px] font-mono text-gray-500 leading-snug">
                  Biji Kopi: {formatRupiah(calc.coffeeCostPerCup)} <br />
                  Bahan Lain: {formatRupiah(extraCost)}
                </div>
              </div>

              {/* Gross Profit Margin per Cup */}
              <div className="p-5 rounded-3xl bg-[#162A43] text-white shadow-md space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8FB9BC] font-bold block">
                    LABA / CUP
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    {calc.marginPercent}% Margin
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
            <div className="p-6 rounded-3xl bg-white border-2 border-gray-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D8B168]" />
                  <h3 className="font-editorial text-lg font-bold text-[#162A43]">
                    Proyeksi Finansial Bulanan (30 Hari)
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#162A43]/10 text-[#162A43]">
                  {calc.monthlyCups} Cup / Bulan
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Kebutuhan Biji Kopi:</span>
                  <span className="font-bold text-[#162A43]">{calc.monthlyBeanKg} Kg / bulan</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Biaya Belanja Kopi:</span>
                  <span className="font-bold text-[#162A43]">{formatRupiah(calc.monthlyBeanCost)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">Estimasi Total Omzet:</span>
                  <span className="font-bold text-[#162A43]">{formatRupiah(calc.monthlyRevenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-emerald-50 rounded-xl px-3 text-emerald-900 border border-emerald-200">
                  <span className="font-bold">Estimasi Laba Kotor:</span>
                  <span className="font-black text-sm">{formatRupiah(calc.monthlyGrossProfit)} / bln</span>
                </div>
              </div>

              {/* Wholesale Tier Discount Notification */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-gray-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#162A43] font-bold">
                  <Award className="w-4 h-4 text-[#D8B168]" />
                  <span>Mitra 52 Roastery: {calc.tierName}</span>
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
                  className="flex-1 py-3 px-4 rounded-xl bg-white border-2 border-gray-300 hover:border-[#162A43] text-[#162A43] font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
                    `Halo Tim B2B 52 Coffee! Saya ingin konsultasi pasokan biji kopi wholesale.\nEstimasi kebutuhan kedai saya: ~${calc.monthlyBeanKg} kg/bulan (${dailyCups} cup/hari).\nBiji yang diminati: ${isCustomPrice ? 'Custom Price' : selectedBean.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#A52136] hover:bg-[#8B1E2D] text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm text-center"
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-200">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#A52136] font-bold block">
            TIER KEMITRAAN
          </span>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-[#162A43]">
            Skema Paket Berlangganan B2B
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="p-6 rounded-3xl bg-white border-2 border-gray-200 space-y-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">10 - 25 KG / BULAN</span>
              <h3 className="font-editorial text-xl font-bold text-[#162A43]">Starter Partner</h3>
              <p className="text-xs text-gray-500">Cocok untuk kedai kopi rintisan dan gerai kopi takeaway.</p>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-2 text-xs font-sans text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Diskon Grosir 5% dari harga retail</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Sample pack gratis setiap ada batch crop baru</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fresh roast schedule setiap minggu</span>
              </div>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="p-6 rounded-3xl bg-[#162A43] text-white space-y-4 shadow-lg border-2 border-[#162A43] relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-[#A52136] text-white px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold">
              PALING POPULER
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#8FB9BC] font-bold">25 - 50 KG / BULAN</span>
              <h3 className="font-editorial text-xl font-bold text-white">Pro Cafe Partner</h3>
              <p className="text-xs text-gray-300">Untuk coffee shop reguler dengan volume 100-200 cup/hari.</p>
            </div>
            <div className="pt-2 border-t border-white/10 space-y-2 text-xs font-sans text-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Diskon Grosir 10% dari harga retail</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kalibrasi &amp; training barista gratis tiap bulan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Prioritas alokasi panen &amp; micro-lot</span>
              </div>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="p-6 rounded-3xl bg-white border-2 border-gray-200 space-y-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">&gt; 50 KG / BULAN</span>
              <h3 className="font-editorial text-xl font-bold text-[#162A43]">Master Partner</h3>
              <p className="text-xs text-gray-500">Untuk multi-outlet cafe, chain store, restoran &amp; hotel.</p>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-2 text-xs font-sans text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Diskon Grosir 15% - 20%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Custom House Blend &amp; Sangrai Eksklusif</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free delivery Malang, Surabaya &amp; sekitarnya</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BOTTOM PARTNERSHIP CTA BANNER                                          */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#162A43] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
              Siap Bermitra dengan 52 Coffee?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-sans max-w-md">
              Kunjungi formulir kemitraan resmi atau hubungi tim roaster kami untuk sample cupping gratis.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/work-with-us"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-[#162A43] font-mono text-xs font-bold uppercase tracking-wider transition-all"
            >
              <span>Formulir Kemitraan →</span>
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
