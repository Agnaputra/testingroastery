'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Package,
  Flame,
  Scale,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { formatRupiah } from '../../../lib/data';

type CoffeeCategory = 'Daily Espresso' | 'Limited Espresso' | 'Daily Filter' | 'Limited Filter';

interface PresetBean {
  name: string;
  category: CoffeeCategory;
  price: number;
}

const PRESET_BEANS: PresetBean[] = [
  { name: 'Gayo Standard', category: 'Daily Espresso', price: 120000 },
  { name: 'Ijen Washed', category: 'Daily Filter', price: 155000 },
  { name: 'Sumbing Supernova', category: 'Limited Filter', price: 195000 },
  { name: 'Grand Reserve Geisha', category: 'Limited Filter', price: 450000 },
];

export default function PriceCalculatorPage() {
  const [category, setCategory] = useState<CoffeeCategory>('Daily Espresso');
  const [greenCost, setGreenCost] = useState<number>(135000);
  const [copied, setCopied] = useState<boolean>(false);

  // Exact Calculation logic based on specialty roastery economics
  const calc = useMemo(() => {
    // Susut sangrai (Roasting Weight Loss) ~20%
    const weightLoss = 0.20;
    const roastedCostPerKg = greenCost > 0 ? Math.round(greenCost / (1 - weightLoss)) : 0;
    
    // Labor, utilities & nitrogen flush packaging
    const laborAndGasPerKg = 10000;
    const packagingCost200g = 4500; // valve bag + zipper
    const totalRoastedHppPerKg = roastedCostPerKg + laborAndGasPerKg;

    // Target Gross Margin based on tier
    let margin = 0.40; // 40% margin for Daily Espresso
    if (category === 'Limited Espresso') margin = 0.46;
    if (category === 'Daily Filter') margin = 0.42;
    if (category === 'Limited Filter') margin = 0.50;

    // 200g Pricing
    const baseHpp200g = (totalRoastedHppPerKg * 0.2) + packagingCost200g;
    const price200g = greenCost > 0 ? Math.round((baseHpp200g / (1 - margin)) / 1000) * 1000 : 0;
    const profit200g = price200g - baseHpp200g;

    // 500g Pricing (bulk coffee shop discount)
    const baseHpp500g = (totalRoastedHppPerKg * 0.5) + (packagingCost200g * 1.6);
    const price500g = greenCost > 0 ? Math.round(((baseHpp500g / (1 - margin)) * 0.95) / 1000) * 1000 : 0;
    const profit500g = price500g - baseHpp500g;

    // 1kg Pricing (wholesale partner tier)
    const baseHpp1kg = (totalRoastedHppPerKg * 1.0) + (packagingCost200g * 2.2);
    const price1kg = greenCost > 0 ? Math.round(((baseHpp1kg / (1 - (margin - 0.12)))) / 1000) * 1000 : 0;
    const profit1kg = price1kg - baseHpp1kg;

    return {
      roastedCostPerKg,
      laborAndGasPerKg,
      totalRoastedHppPerKg,
      baseHpp200g,
      price200g,
      profit200g,
      price500g,
      profit500g,
      price1kg,
      profit1kg,
      marginPercent: Math.round(margin * 100),
    };
  }, [greenCost, category]);

  const CATEGORIES: CoffeeCategory[] = [
    'Daily Espresso',
    'Limited Espresso',
    'Daily Filter',
    'Limited Filter',
  ];

  const handleCopySummary = () => {
    const text = `📊 Estimasi Harga Sangrai 52 Coffee:\n• Kategori: ${category}\n• Harga Green Bean: ${formatRupiah(greenCost)}/kg\n• HPP Sangrai Susut 20%: ${formatRupiah(calc.roastedCostPerKg)}/kg\n\n🎯 Rekomendasi Jual:\n- 200g Retail: ${formatRupiah(calc.price200g)}\n- 500g Bulk: ${formatRupiah(calc.price500g)}\n- 1kg Wholesale: ${formatRupiah(calc.price1kg)}`;
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
      className="w-full bg-[#131313] text-[#e2e2e2] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-between"
    >
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono text-brand-teal-light">
            <Sparkles className="w-3.5 h-3.5" />
            <span>52 Coffee Precision Pricing Engine</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-white">
            Price Calculator
          </h1>
          <p className="font-sans text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Hitung HPP sangrai otomatis dengan faktor susut 20%, biaya kemasan valve, dan rekomendasi margin jual retail &amp; wholesale.
          </p>
        </motion.div>

        {/* Quick Green Bean Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400 font-bold block text-center">
            Pilih Cepat Profil Green Bean Populer:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PRESET_BEANS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setCategory(preset.category);
                  setGreenCost(preset.price);
                }}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all flex items-center gap-2 border ${
                  greenCost === preset.price && category === preset.category
                    ? 'bg-white text-gray-950 font-bold border-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                }`}
              >
                <span>{preset.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({formatRupiah(preset.price)})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Controls Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6 shadow-xl">
          {/* Category Selector */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-gray-400 font-bold block">
              1. Pilih Kategori Roast Profile:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`relative py-3 px-3.5 rounded-2xl font-mono text-xs font-bold transition-colors duration-200 text-center z-10 ${
                      isActive ? 'text-white' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryPricePill"
                        className="absolute inset-0 bg-brand-navy rounded-2xl shadow-md border border-white/20 -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Green Bean Price Slider & Input */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center text-xs font-mono">
              <label className="uppercase tracking-wider text-gray-400 font-bold block">
                2. Harga Green Bean (Per Kg):
              </label>
              <span className="text-brand-teal-light font-bold text-base sm:text-lg">
                {formatRupiah(greenCost)} / kg
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={80000}
              max={600000}
              step={5000}
              value={greenCost}
              onChange={(e) => setGreenCost(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-teal"
            />

            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span>Rp 80.000</span>
              <span>Rp 300.000</span>
              <span>Rp 600.000+</span>
            </div>
          </div>
        </div>

        {/* Live Cost & Margin Breakdown Ring */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="space-y-1">
            <span className="text-gray-400 text-[11px] block">Susut Sangrai 20%:</span>
            <span className="font-bold text-white text-sm">+{formatRupiah(calc.roastedCostPerKg - greenCost)}/kg</span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 text-[11px] block">HPP Biji Matang:</span>
            <span className="font-bold text-brand-teal-light text-sm">{formatRupiah(calc.roastedCostPerKg)}/kg</span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 text-[11px] block">Overhead &amp; Kemasan:</span>
            <span className="font-bold text-white text-sm">Rp 10.000/kg</span>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 text-[11px] block">Target Margin Roastery:</span>
            <span className="font-bold text-emerald-400 text-sm">~{calc.marginPercent}% Gross</span>
          </div>
        </div>

        {/* Results Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="uppercase tracking-wider text-gray-400 font-bold">
              Rekomendasi Harga Jual Resmi:
            </span>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-brand-teal-light font-mono font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin Ringkasan'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 200g Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 relative overflow-hidden group hover:border-brand-teal/40 transition-colors"
            >
              <div className="flex justify-between items-center font-mono text-xs text-gray-400">
                <span className="uppercase font-bold">Kemasan 200g</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px]">Retail Pouch</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={calc.price200g}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="font-mono text-3xl font-black text-white"
                >
                  {formatRupiah(calc.price200g)}
                </motion.div>
              </AnimatePresence>
              <div className="text-[11px] font-mono text-emerald-400 pt-1">
                Margin Bersih: ~{formatRupiah(calc.profit200g)} / bag
              </div>
              <p className="text-[11px] text-gray-400 font-sans">
                Cocok untuk penjualan retail ke pelanggan seduh rumah &amp; toko online.
              </p>
            </motion.div>

            {/* 500g Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3 relative overflow-hidden group hover:border-brand-teal/40 transition-colors"
            >
              <div className="flex justify-between items-center font-mono text-xs text-gray-400">
                <span className="uppercase font-bold">Kemasan 500g</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px]">Medium Bulk</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={calc.price500g}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="font-mono text-3xl font-black text-white"
                >
                  {formatRupiah(calc.price500g)}
                </motion.div>
              </AnimatePresence>
              <div className="text-[11px] font-mono text-emerald-400 pt-1">
                Margin Bersih: ~{formatRupiah(calc.profit500g)} / bag
              </div>
              <p className="text-[11px] text-gray-400 font-sans">
                Kemasan bundle hemat untuk kafe dengan konsumsi reguler harian.
              </p>
            </motion.div>

            {/* 1kg Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-3xl bg-brand-navy/70 border border-brand-teal/30 space-y-3 relative overflow-hidden group shadow-lg"
            >
              <div className="flex justify-between items-center font-mono text-xs text-brand-teal-light">
                <span className="uppercase font-bold">Kemasan 1kg</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal-light text-[10px] font-bold">
                  Wholesale B2B
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={calc.price1kg}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="font-mono text-3xl font-black text-white"
                >
                  {formatRupiah(calc.price1kg)}
                </motion.div>
              </AnimatePresence>
              <div className="text-[11px] font-mono text-emerald-300 pt-1 font-bold">
                Margin Bersih: ~{formatRupiah(calc.profit1kg)} / kg
              </div>
              <p className="text-[11px] text-gray-300 font-sans">
                Harga pasokan grosir mitra kedai kopi, kafe &amp; hotel 52 Coffee.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
