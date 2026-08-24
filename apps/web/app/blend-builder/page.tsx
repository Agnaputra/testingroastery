'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Plus,
  ShoppingBag,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Flame,
  Coffee,
  Sliders,
  Scale,
} from 'lucide-react';
import { useCartStore } from '../../lib/store/useCartStore';
import { formatRupiah } from '../../lib/data';
import { FlavorRadarChart, FlavorMetrics } from '../../components/flavor-radar-chart';

interface BlendComponent {
  id: string;
  name: string;
  process: string;
  region: string;
  varietals: string;
  notes: string;
  landedGreenPricePerKg: number;
  sensory: FlavorMetrics;
}

const AVAILABLE_BEANS: BlendComponent[] = [
  {
    id: 'java-ijen-washed',
    name: 'Java Ijen Full Washed',
    process: 'Full Washed',
    region: 'East Java Bondowoso',
    varietals: 'Mix (Kartika, USDA)',
    notes: 'Apple, Lemon Juice, Brown Sugar, Chocolate Milk',
    landedGreenPricePerKg: 155000,
    sensory: {
      acidity: 7.8,
      sweetness: 8.2,
      body: 6.5,
      floral: 7.0,
      aftertaste: 8.0,
      balance: 8.5,
    },
  },
  {
    id: 'arjuna-budug-asu',
    name: 'Arjuna Budug Asu Natural Espresso',
    process: 'Natural',
    region: 'Arjuna, Malang',
    varietals: 'Mixed Varietals',
    notes: 'Tangerine, Lychee, Black Tea',
    landedGreenPricePerKg: 180000,
    sensory: {
      acidity: 8.8,
      sweetness: 8.5,
      body: 7.2,
      floral: 8.5,
      aftertaste: 8.2,
      balance: 8.0,
    },
  },
  {
    id: 'gayo-full-washed',
    name: 'Gayo Full Washed',
    process: 'Full Washed',
    region: 'Aceh Gayo',
    varietals: 'Ateng, Tim Tim',
    notes: 'Dark Chocolate, Brown Sugar, Sweet Cedar',
    landedGreenPricePerKg: 160000,
    sensory: {
      acidity: 6.2,
      sweetness: 8.0,
      body: 8.5,
      floral: 5.5,
      aftertaste: 8.6,
      balance: 8.8,
    },
  },
  {
    id: 'kerinci-blueberry',
    name: 'Kerinci Blueberry Natural',
    process: 'Natural Anaerobic',
    region: 'Kayu Aro, Kerinci',
    varietals: 'Andung Sari, Sigarar Utang',
    notes: 'Blueberry Jam, Sweet Vanilla, Winey',
    landedGreenPricePerKg: 195000,
    sensory: {
      acidity: 9.4,
      sweetness: 9.0,
      body: 7.0,
      floral: 9.2,
      aftertaste: 8.8,
      balance: 8.0,
    },
  },
  {
    id: 'dampit-fine-robusta',
    name: 'Dampit Fine Robusta Malang',
    process: 'Honey Process',
    region: 'Dampit, Malang',
    varietals: 'Robusta BP 42',
    notes: 'Dark Cocoa, Heavy Crema, Roasted Almond',
    landedGreenPricePerKg: 95000,
    sensory: {
      acidity: 3.5,
      sweetness: 6.5,
      body: 9.6,
      floral: 3.0,
      aftertaste: 8.0,
      balance: 7.5,
    },
  },
];

type RoastProfile = 'Filter Light-Medium' | 'Medium All-Rounder' | 'Dark Espresso Roast';

export default function BlendBuilderPage() {
  const [componentA, setComponentA] = useState<BlendComponent>(AVAILABLE_BEANS[0]);
  const [ratioA, setRatioA] = useState<number>(70);

  const [componentB, setComponentB] = useState<BlendComponent>(AVAILABLE_BEANS[1]);
  const [ratioB, setRatioB] = useState<number>(30);

  const [hasComponentC, setHasComponentC] = useState<boolean>(false);
  const [componentC, setComponentC] = useState<BlendComponent>(AVAILABLE_BEANS[3]);
  const [ratioC, setRatioC] = useState<number>(10);

  const [roastLevel, setRoastLevel] = useState<RoastProfile>('Medium All-Rounder');
  const [selectedSize, setSelectedSize] = useState<'200 g' | '500 g' | '1 kg'>('1 kg');
  const [isAdded, setIsAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Accordions
  const [openGreenInfo, setOpenGreenInfo] = useState(true);
  const [openPriceBreakdown, setOpenPriceBreakdown] = useState(true);

  const { addItem } = useCartStore();

  // Handle Preset Selection
  const applyPreset = (beanAName: string, beanBName: string, rA: number, rB: number, roast: RoastProfile = 'Medium All-Rounder') => {
    const a = AVAILABLE_BEANS.find((b) => b.name.includes(beanAName)) || AVAILABLE_BEANS[2];
    const b = AVAILABLE_BEANS.find((b) => b.name.includes(beanBName)) || AVAILABLE_BEANS[3];
    setComponentA(a);
    setComponentB(b);
    setRatioA(rA);
    setRatioB(rB);
    setHasComponentC(false);
    setRoastLevel(roast);
  };

  // Blended Landed Cost Calculation
  const blendedLandedCost = useMemo(() => {
    let cost = 0;
    if (!hasComponentC) {
      cost = (componentA.landedGreenPricePerKg * (ratioA / 100)) + (componentB.landedGreenPricePerKg * (ratioB / 100));
    } else {
      const totalRatio = ratioA + ratioB + ratioC;
      cost = (componentA.landedGreenPricePerKg * (ratioA / totalRatio)) +
             (componentB.landedGreenPricePerKg * (ratioB / totalRatio)) +
             (componentC.landedGreenPricePerKg * (ratioC / totalRatio));
    }
    return Math.round(cost);
  }, [componentA, ratioA, componentB, ratioB, hasComponentC, componentC, ratioC]);

  // HPP & Retail Pricing Breakdown (19.93% roast weight loss + Rp 10.000 electricity/kg)
  const hppPerKg = Math.round(blendedLandedCost / (1 - 0.1993) + 10000);
  const packagingCost1kg = 10000;
  const retailPrice1kg = 266000;
  const grossProfit1kg = retailPrice1kg - hppPerKg - packagingCost1kg;

  // Active Price based on selected size
  const activePrice = useMemo(() => {
    if (selectedSize === '200 g') return 78000;
    if (selectedSize === '500 g') return 145000;
    return retailPrice1kg;
  }, [selectedSize, retailPrice1kg]);

  // Dynamic Blended Flavor Sensory Profile calculation
  const blendedSensory: FlavorMetrics = useMemo(() => {
    const tot = hasComponentC ? ratioA + ratioB + ratioC : 100;
    const wA = ratioA / tot;
    const wB = ratioB / tot;
    const wC = hasComponentC ? ratioC / tot : 0;

    // Roast level modifiers
    const roastModifier =
      roastLevel === 'Filter Light-Medium'
        ? { acidity: +0.6, sweetness: 0, body: -0.5, floral: +0.6, aftertaste: -0.2, balance: +0.2 }
        : roastLevel === 'Dark Espresso Roast'
        ? { acidity: -1.4, sweetness: -0.2, body: +1.2, floral: -1.0, aftertaste: +0.4, balance: -0.2 }
        : { acidity: 0, sweetness: 0, body: 0, floral: 0, aftertaste: 0, balance: 0 };

    const calculateAxis = (key: keyof FlavorMetrics) => {
      const base =
        componentA.sensory[key] * wA +
        componentB.sensory[key] * wB +
        (componentC?.sensory?.[key] || 0) * wC;
      return Math.min(10, Math.max(1, base + (roastModifier[key] || 0)));
    };

    return {
      acidity: Number(calculateAxis('acidity').toFixed(1)),
      sweetness: Number(calculateAxis('sweetness').toFixed(1)),
      body: Number(calculateAxis('body').toFixed(1)),
      floral: Number(calculateAxis('floral').toFixed(1)),
      aftertaste: Number(calculateAxis('aftertaste').toFixed(1)),
      balance: Number(calculateAxis('balance').toFixed(1)),
    };
  }, [componentA, ratioA, componentB, ratioB, hasComponentC, componentC, ratioC, roastLevel]);

  const handleRatioAChange = (val: number) => {
    const clamped = Math.max(10, Math.min(90, val));
    setRatioA(clamped);
    if (!hasComponentC) setRatioB(100 - clamped);
  };

  const handleRatioBChange = (val: number) => {
    const clamped = Math.max(10, Math.min(90, val));
    setRatioB(clamped);
    if (!hasComponentC) setRatioA(100 - clamped);
  };

  const handleAddToCart = () => {
    const blendComponentsList = hasComponentC
      ? `${ratioA}% ${componentA.name.split(' ')[0]} + ${ratioB}% ${componentB.name.split(' ')[0]} + ${ratioC}% ${componentC.name.split(' ')[0]}`
      : `${ratioA}% ${componentA.name.split(' ')[0]} + ${ratioB}% ${componentB.name.split(' ')[0]}`;

    const blendName = `BYOB: ${blendComponentsList} (${roastLevel})`;

    addItem({
      productId: `byob-${Date.now()}`,
      name: blendName,
      slug: 'custom-blend',
      imageUrl: '/images/the-roastery-behind-your-business.png',
      weightGrams: selectedSize === '200 g' ? 200 : selectedSize === '500 g' ? 500 : 1000,
      weightLabel: selectedSize,
      grind: 'whole',
      grindLabel: `Whole Beans (${roastLevel})`,
      unitPrice: activePrice,
      quantity: 1,
      series: 'BYOB Custom Blend',
      tastingNotes: [
        componentA.name.split(' ')[0],
        componentB.name.split(' ')[0],
        roastLevel.split(' ')[0],
      ],
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full bg-surface-white text-on-surface min-h-screen py-10 px-4 sm:px-10 font-sans"
    >
      <div className="max-w-[1280px] mx-auto space-y-10">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMB                                                             */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
          <Link href="/catalog" className="hover:text-brand-navy transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-navy font-semibold">Custom Blend Simulator (BYOB)</span>
        </div>

        {/* ========================================================================= */}
        {/* 2. 2-COLUMN MAIN BYOB SECTION                                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Standing Pouch Mockup + Live Flavor Radar Chart (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-surface-container-low rounded-3xl p-8 border border-border-subtle flex items-center justify-center aspect-[3/4] relative shadow-sm group"
            >
              <div className="w-full h-full relative flex items-center justify-center">
                <img
                  src="/images/the-roastery-behind-your-business.png"
                  alt="52 Coffee BYOB Standing Pouch"
                  className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105"
                />
                {/* Custom Label Mockup Overlay */}
                <div className="absolute bottom-[20%] w-52 p-3.5 rounded-xl bg-gradient-to-r from-brand-navy/95 to-brand-maroon/95 text-white text-center shadow-xl backdrop-blur-md pointer-events-none border border-white/20">
                  <div className="text-[9px] font-mono uppercase tracking-widest font-bold text-amber-300">52 COFFEE ROASTERY</div>
                  <div className="font-editorial text-sm font-bold mt-0.5">Custom BYOB Blend</div>
                  <div className="text-[9px] font-mono opacity-90 mt-1 truncate">
                    {ratioA}% {componentA.name.split(' ')[0]} • {ratioB}% {componentB.name.split(' ')[0]}
                    {hasComponentC && ` • ${ratioC}% ${componentC.name.split(' ')[0]}`}
                  </div>
                  <div className="text-[8px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/20 inline-block mt-1 font-semibold">
                    {roastLevel}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* DYNAMIC SENSORY RADAR CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="p-6 rounded-3xl bg-white border border-border-subtle shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-maroon" />
                  <h3 className="font-editorial text-base font-bold text-brand-navy">
                    Prediksi Profil Rasa Racikan
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-brand-navy/10 text-brand-navy">
                  Live Dynamic
                </span>
              </div>

              {/* Flavor Radar Component */}
              <FlavorRadarChart
                metrics={blendedSensory}
                size={270}
                color="maroon"
                showLabels={true}
                showBars={true}
              />

              <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle text-[11px] font-sans text-on-surface-variant leading-relaxed">
                <span className="font-bold text-brand-navy block mb-0.5">Catatan Rasa Terprediksi:</span>
                Kombinasi ini menonjolkan keasaman segar dari <em>{componentA.name.split(' ')[0]}</em> dengan ketebalan body &amp; manis karamel dari <em>{componentB.name.split(' ')[0]}</em> disangrai pada level <strong>{roastLevel}</strong>.
              </div>
            </motion.div>
          </div>

          {/* RIGHT: BYOB Form Controls & Mix Sliders (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            <header className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-maroon/10 text-brand-maroon text-[11px] font-mono font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Roastery Blend Simulator</span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy leading-tight tracking-tight">
                B.Y.O.B - Build Your Own Blend
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant">
                Pilih kombinasi single origin favorit Anda dan atur rasio persentase. Profil rasa &amp; HPP dihitung secara presisi real-time.
              </p>
            </header>

            {/* Dual Ratio Progress Bar with Framer Motion */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-9 rounded-full overflow-hidden flex bg-gray-200 border border-border-subtle relative shadow-inner">
                {/* Segment A (Pink / Maroon) */}
                <motion.div
                  className="bg-brand-maroon h-full flex items-center justify-center font-mono text-xs font-bold text-white transition-all duration-300"
                  style={{ width: `${ratioA}%` }}
                >
                  A ({ratioA}%)
                </motion.div>

                {/* Segment B (Navy) */}
                <motion.div
                  className="bg-brand-navy h-full flex items-center justify-center font-mono text-xs font-bold text-white transition-all duration-300"
                  style={{ width: `${ratioB}%` }}
                >
                  B ({ratioB}%)
                </motion.div>

                {hasComponentC && (
                  <motion.div
                    className="bg-brand-teal h-full flex items-center justify-center font-mono text-xs font-bold text-white transition-all duration-300"
                    style={{ width: `${ratioC}%` }}
                  >
                    C ({ratioC}%)
                  </motion.div>
                )}
              </div>
            </div>

            {/* Component A Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border-subtle hover:border-brand-maroon transition-colors shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-7 h-7 rounded-full bg-brand-maroon text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    A
                  </div>
                  <select
                    value={componentA.id}
                    onChange={(e) => {
                      const found = AVAILABLE_BEANS.find((b) => b.id === e.target.value);
                      if (found) setComponentA(found);
                    }}
                    className="w-full bg-transparent border-none text-xs sm:text-sm font-semibold text-on-surface focus:ring-0 cursor-pointer"
                  >
                    {AVAILABLE_BEANS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.process})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1 pl-3 border-l border-border-subtle shrink-0">
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={ratioA}
                    onChange={(e) => handleRatioAChange(Number(e.target.value))}
                    className="w-10 text-right bg-transparent border-none font-mono text-sm font-bold text-on-surface focus:ring-0 p-0"
                  />
                  <span className="font-mono text-xs text-gray-400">%</span>
                </div>
              </div>

              {/* Component B Selector */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border-subtle hover:border-brand-navy transition-colors shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-7 h-7 rounded-full bg-brand-navy text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    B
                  </div>
                  <select
                    value={componentB.id}
                    onChange={(e) => {
                      const found = AVAILABLE_BEANS.find((b) => b.id === e.target.value);
                      if (found) setComponentB(found);
                    }}
                    className="w-full bg-transparent border-none text-xs sm:text-sm font-semibold text-on-surface focus:ring-0 cursor-pointer"
                  >
                    {AVAILABLE_BEANS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.process})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1 pl-3 border-l border-border-subtle shrink-0">
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={ratioB}
                    onChange={(e) => handleRatioBChange(Number(e.target.value))}
                    className="w-10 text-right bg-transparent border-none font-mono text-sm font-bold text-on-surface focus:ring-0 p-0"
                  />
                  <span className="font-mono text-xs text-gray-400">%</span>
                </div>
              </div>

              {/* Expandable Component C */}
              {hasComponentC && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border-subtle hover:border-brand-teal transition-colors shadow-sm">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-7 h-7 rounded-full bg-brand-teal text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                      C
                    </div>
                    <select
                      value={componentC.id}
                      onChange={(e) => {
                        const found = AVAILABLE_BEANS.find((b) => b.id === e.target.value);
                        if (found) setComponentC(found);
                      }}
                      className="w-full bg-transparent border-none text-xs sm:text-sm font-semibold text-on-surface focus:ring-0 cursor-pointer"
                    >
                      {AVAILABLE_BEANS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.process})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1 pl-3 border-l border-border-subtle shrink-0">
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={ratioC}
                      onChange={(e) => setRatioC(Number(e.target.value))}
                      className="w-10 text-right bg-transparent border-none font-mono text-sm font-bold text-on-surface focus:ring-0 p-0"
                    />
                    <span className="font-mono text-xs text-gray-400">%</span>
                  </div>
                </div>
              )}

              {/* Add a third coffee button */}
              {!hasComponentC && (
                <button
                  type="button"
                  onClick={() => {
                    setHasComponentC(true);
                    setRatioA(50);
                    setRatioB(35);
                    setRatioC(15);
                  }}
                  className="w-full py-3.5 border border-border-subtle rounded-2xl text-on-surface-variant hover:text-brand-navy hover:border-brand-navy transition-all font-mono text-xs flex items-center justify-center gap-2 border-dashed bg-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan Biji Kopi Ketiga (Component C)</span>
                </button>
              )}
            </div>

            {/* ROAST LEVEL PROFILE SELECTOR */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                Pilih Profil Sangrai (Roast Profile)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'Filter Light-Medium' as RoastProfile,
                    label: 'Light-Medium',
                    desc: 'Floral, bright acidity, juicy pour over',
                  },
                  {
                    id: 'Medium All-Rounder' as RoastProfile,
                    label: 'Medium (Balanced)',
                    desc: 'Sweet caramel, balanced, V60 / Espresso',
                  },
                  {
                    id: 'Dark Espresso Roast' as RoastProfile,
                    label: 'Dark Espresso',
                    desc: 'Bold cocoa, heavy crema, milk-based',
                  },
                ].map((item) => {
                  const isSelected = roastLevel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRoastLevel(item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-brand-navy bg-brand-navy text-white shadow-md'
                          : 'border-border-subtle bg-white text-on-surface hover:border-brand-navy'
                      }`}
                    >
                      <div className="font-mono text-xs font-bold flex items-center justify-between">
                        <span>{item.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                      </div>
                      <div className={`text-[10px] mt-1 leading-tight ${isSelected ? 'text-gray-200' : 'text-on-surface-variant'}`}>
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                Ukuran Kemasan
              </label>
              <div className="flex gap-3">
                {(['200 g', '500 g', '1 kg'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-5 py-2.5 rounded-full font-mono text-xs font-bold transition-all ${
                      selectedSize === s
                        ? 'bg-brand-navy text-white shadow-md'
                        : 'bg-white border border-border-subtle text-on-surface hover:border-brand-navy'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Display */}
            <div className="space-y-1 pt-2">
              <span className="text-xs font-mono text-on-surface-variant uppercase font-bold block">
                Total Harga BYOB
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-brand-maroon uppercase font-bold">RETAIL</span>
                <span className="font-mono text-3xl sm:text-4xl font-bold text-brand-navy">
                  {formatRupiah(activePrice)}
                </span>
                <span className="text-xs font-mono text-on-surface-variant">
                  / {selectedSize}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdded}
                className="flex-1 bg-brand-navy text-white font-mono font-bold text-sm py-4 px-8 rounded-2xl hover:bg-brand-navy-light transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>Tersimpan di Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Masukkan ke Keranjang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-5 py-4 rounded-2xl border border-border-subtle bg-white text-on-surface hover:border-brand-navy transition-colors flex items-center gap-2 text-xs font-mono font-bold shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Tersalin!' : 'Bagikan Racikan'}</span>
              </button>
            </div>

            {/* Our Picks Preset Pill */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-on-surface-variant uppercase font-bold block">
                Rekomendasi Racikan Roaster 52 Coffee
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => applyPreset('Gayo', 'Kerinci', 50, 50, 'Filter Light-Medium')}
                  className="text-left p-3.5 rounded-2xl bg-white border border-border-subtle hover:border-brand-navy hover:bg-surface-container-low transition-all font-mono text-xs font-semibold text-on-surface shadow-sm"
                >
                  <div className="font-bold text-brand-navy">50/50 Gayo + Kerinci</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Fruity Blueberry &amp; Sweet Cedar</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('Ijen', 'Dampit', 70, 30, 'Dark Espresso Roast')}
                  className="text-left p-3.5 rounded-2xl bg-white border border-border-subtle hover:border-brand-navy hover:bg-surface-container-low transition-all font-mono text-xs font-semibold text-on-surface shadow-sm"
                >
                  <div className="font-bold text-brand-navy">70/30 Ijen + Dampit Robusta</div>
                  <div className="text-[10px] text-on-surface-variant mt-0.5">Classic Espresso House Blend (Thick Crema)</div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DETAILS COMPARISON TABLE                                               */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-8 border-t border-border-subtle">
          <h2 className="font-editorial text-2xl font-bold text-brand-navy">
            Spesifikasi Komponen Racikan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-on-surface-variant font-mono">Component A</span>
              <span className="font-bold text-on-surface">{componentA.name}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-on-surface-variant font-mono">Component B</span>
              <span className="font-bold text-on-surface">{componentB.name}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-on-surface-variant font-mono">Process (A)</span>
              <span className="font-bold text-on-surface">{componentA.process}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-on-surface-variant font-mono">Process (B)</span>
              <span className="font-bold text-on-surface">{componentB.process}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-on-surface-variant font-mono">Region (A)</span>
              <span className="font-bold text-on-surface">{componentA.region}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-on-surface-variant font-mono">Region (B)</span>
              <span className="font-bold text-on-surface">{componentB.region}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-on-surface-variant font-mono">Varietals (A)</span>
              <span className="font-bold text-on-surface">{componentA.varietals}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-on-surface-variant font-mono">Varietals (B)</span>
              <span className="font-bold text-on-surface">{componentB.varietals}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
            <span className="text-on-surface-variant font-mono text-xs block font-bold">Catatan Rasa Gabungan</span>
            <p className="font-editorial text-sm sm:text-base font-bold text-brand-navy">
              {componentA.notes} • {componentB.notes}
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. TRANSPARENCY ACCORDIONS                                                */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-4">
          {/* Accordion 1: Green Information */}
          <div className="border border-border-subtle rounded-2xl bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setOpenGreenInfo(!openGreenInfo)}
              className="w-full p-5 flex items-center justify-between font-editorial text-base font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span>Transparansi Biaya Biji Mentah (Green Beans)</span>
              {openGreenInfo ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openGreenInfo && (
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-border-subtle/50">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between items-center font-mono text-xs">
                  <span className="text-on-surface-variant">Blended Landed Cost (1 kg, green)</span>
                  <span className="font-bold text-brand-navy">{formatRupiah(blendedLandedCost)}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-sans">
                  Dihitung dari harga landed green bean masing-masing origin sesuai bobot rasio sangrai. Estimasi susut bobot saat roasting: 19.93%.
                </p>
              </div>
            )}
          </div>

          {/* Accordion 2: Price Breakdown */}
          <div className="border border-border-subtle rounded-2xl bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setOpenPriceBreakdown(!openPriceBreakdown)}
              className="w-full p-5 flex items-center justify-between font-editorial text-base font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span>Rincian Struktur Harga &amp; HPP Sangrai</span>
              {openPriceBreakdown ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openPriceBreakdown && (
              <div className="px-5 pb-5 pt-1 space-y-3 border-t border-border-subtle/50 font-sans text-xs">
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>COGS/HPP (Harga Pokok Produksi)</strong> mencakup seluruh biaya produksi mengubah green bean menjadi roasted beans siap seduh:
                </p>
                <ul className="space-y-1 text-on-surface-variant pl-4 list-disc text-[11px]">
                  <li>Green coffee yang dibutuhkan untuk memproduksi <em>1 kg</em> roasted beans setelah susut bobot sangrai <strong>19.93%</strong>.</li>
                  <li>Biaya listrik &amp; gas operasional mesin sangrai per <em>1 kg</em> sebesar <strong>Rp 10.000</strong>.</li>
                </ul>

                <div className="space-y-2 font-mono text-xs pt-1">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">HPP Sangrai (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(hppPerKg)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">Kemasan Valve Pouch &amp; Label (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(packagingCost1kg)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">Gross Profit Roastery (1 kg)</span>
                    <span className="font-bold text-brand-teal-dark">{formatRupiah(Math.max(25000, grossProfit1kg))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
