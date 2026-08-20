'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Plus,
  ShoppingBag,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { useCartStore } from '../../lib/store/useCartStore';
import { formatRupiah } from '../../lib/data';

interface BlendComponent {
  id: string;
  name: string;
  process: string;
  region: string;
  varietals: string;
  notes: string;
  landedGreenPricePerKg: number;
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
  },
  {
    id: 'arjuna-budug-asu',
    name: 'Arjuna Budug Asu Natural Espresso',
    process: 'Natural',
    region: 'Arjuna, Malang',
    varietals: 'Mixed Varietals',
    notes: 'Tangerine, Lychee, Black Tea',
    landedGreenPricePerKg: 180000,
  },
  {
    id: 'gayo-full-washed',
    name: 'Gayo Full Washed',
    process: 'Full Washed',
    region: 'Aceh Gayo',
    varietals: 'Ateng, Tim Tim',
    notes: 'Dark Chocolate, Brown Sugar, Sweet Cedar',
    landedGreenPricePerKg: 160000,
  },
  {
    id: 'kerinci-blueberry',
    name: 'Kerinci Blueberry Natural',
    process: 'Natural Anaerobic',
    region: 'Kayu Aro, Kerinci',
    varietals: 'Andung Sari, Sigarar Utang',
    notes: 'Blueberry Jam, Sweet Vanilla, Winey',
    landedGreenPricePerKg: 195000,
  },
  {
    id: 'dampit-fine-robusta',
    name: 'Dampit Fine Robusta Malang',
    process: 'Honey Process',
    region: 'Dampit, Malang',
    varietals: 'Robusta BP 42',
    notes: 'Dark Cocoa, Heavy Crema, Roasted Almond',
    landedGreenPricePerKg: 95000,
  },
];

export default function BlendBuilderPage() {
  const [componentA, setComponentA] = useState<BlendComponent>(AVAILABLE_BEANS[0]);
  const [ratioA, setRatioA] = useState<number>(70);

  const [componentB, setComponentB] = useState<BlendComponent>(AVAILABLE_BEANS[1]);
  const [ratioB, setRatioB] = useState<number>(30);

  const [hasComponentC, setHasComponentC] = useState<boolean>(false);
  const [componentC, setComponentC] = useState<BlendComponent>(AVAILABLE_BEANS[3]);
  const [ratioC, setRatioC] = useState<number>(10);

  const [selectedSize, setSelectedSize] = useState<'200 g' | '500 g' | '1 kg'>('1 kg');
  const [isAdded, setIsAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Accordions
  const [openGreenInfo, setOpenGreenInfo] = useState(true);
  const [openPriceBreakdown, setOpenPriceBreakdown] = useState(true);

  const { addItem } = useCartStore();

  // Handle Preset Selection
  const applyPreset = (beanAName: string, beanBName: string, rA: number, rB: number) => {
    const a = AVAILABLE_BEANS.find((b) => b.name.includes(beanAName)) || AVAILABLE_BEANS[2];
    const b = AVAILABLE_BEANS.find((b) => b.name.includes(beanBName)) || AVAILABLE_BEANS[3];
    setComponentA(a);
    setComponentB(b);
    setRatioA(rA);
    setRatioB(rB);
    setHasComponentC(false);
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
    const blendName = `BYOB: ${ratioA}% ${componentA.name} + ${ratioB}% ${componentB.name}`;
    addItem({
      productId: `byob-${Date.now()}`,
      name: blendName,
      slug: 'custom-blend',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5JWPgUZd9_tVkcmBHkgtho4yAiQgnIQPaihCRFPZNWtBBT1Ivy1LbiHGC7ajTKofJtnPZ4Hn8UC7BhkgcbxOL2pZa4qQwDEIt-XUUd95oIPsaF8mTnmbize6TPmiVdlf7-E0eA1HXrDe7SVvFIeDHMcNmwd1AEu4l8d02aIKnZUkH_lWncb2z474KLdJLMQeRkhAITtZ4HzPT6ueaY2F6gCgxJke4Lnik-wpT6997hDqx3Kba_Xgpzw',
      weightGrams: selectedSize === '200 g' ? 200 : selectedSize === '500 g' ? 500 : 1000,
      weightLabel: selectedSize,
      grind: 'whole',
      grindLabel: 'Whole Beans (Biji Utuh)',
      unitPrice: activePrice,
      quantity: 1,
      series: 'BYOB Custom Blend',
      tastingNotes: [componentA.name.split(' ')[0], componentB.name.split(' ')[0]],
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
    <div className="w-full bg-surface-white text-on-surface min-h-screen py-10 px-4 sm:px-10 font-sans">
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMB (Exact Screenshot 3)                                        */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <Link href="/catalog" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-on-surface font-semibold">Custom Blend</span>
        </div>

        {/* ========================================================================= */}
        {/* 2. 2-COLUMN MAIN BYOB SECTION (Exact Screenshot 3)                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT: Standing White Pouch with Custom Blend Label */}
          <div className="lg:col-span-5 bg-surface-container-low rounded-3xl p-8 border border-border-subtle flex items-center justify-center aspect-[3/4] relative shadow-sm group">
            <div className="w-full h-full relative flex items-center justify-center">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5JWPgUZd9_tVkcmBHkgtho4yAiQgnIQPaihCRFPZNWtBBT1Ivy1LbiHGC7ajTKofJtnPZ4Hn8UC7BhkgcbxOL2pZa4qQwDEIt-XUUd95oIPsaF8mTnmbize6TPmiVdlf7-E0eA1HXrDe7SVvFIeDHMcNmwd1AEu4l8d02aIKnZUkH_lWncb2z474KLdJLMQeRkhAITtZ4HzPT6ueaY2F6gCgxJke4Lnik-wpT6997hDqx3Kba_Xgpzw"
                alt="52 Coffee BYOB Standing Pouch"
                className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
              {/* Custom Label Mockup Overlay */}
              <div className="absolute bottom-[22%] w-48 p-3 rounded-xl bg-gradient-to-r from-amber-500/90 to-red-500/90 text-white text-center shadow-lg backdrop-blur-sm pointer-events-none">
                <div className="text-[10px] font-mono uppercase tracking-widest font-bold">52 COFFEE ROASTERY</div>
                <div className="font-editorial text-sm font-bold mt-0.5">Build Your Own Blend</div>
                <div className="text-[9px] font-mono opacity-90 mt-1">{ratioA}% {componentA.name.split(' ')[0]} • {ratioB}% {componentB.name.split(' ')[0]}</div>
              </div>
            </div>
          </div>

          {/* RIGHT: BYOB Form Controls */}
          <div className="lg:col-span-7 space-y-6">
            <header className="space-y-1">
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface leading-tight tracking-tight">
                B.Y.O.B - Build Your Own Blend
              </h1>
              <p className="text-sm sm:text-base text-on-surface-variant">
                Pick the espresso you like from our list. We blend it for you.
              </p>
            </header>

            {/* Dual Ratio Progress Bar (Exact Screenshot 3) */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-7 rounded-full overflow-hidden flex bg-gray-200 border border-border-subtle relative shadow-inner">
                {/* Segment A (Pink / Red) */}
                <div
                  className="bg-[#fb7185] h-full flex items-center justify-center font-mono text-xs font-bold text-white transition-all duration-300"
                  style={{ width: `${ratioA}%` }}
                >
                  A
                </div>

                {/* Slider Handle Knob */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-[#fb7185] rounded-full shadow-md z-10 cursor-ew-resize hidden sm:block"
                  style={{ left: `calc(${ratioA}% - 10px)` }}
                />

                {/* Segment B (Yellow / Amber) */}
                <div
                  className="bg-[#facc15] h-full flex items-center justify-center font-mono text-xs font-bold text-gray-800 transition-all duration-300"
                  style={{ width: `${ratioB}%` }}
                >
                  B
                </div>

                {hasComponentC && (
                  <div
                    className="bg-teal-500 h-full flex items-center justify-center font-mono text-xs font-bold text-white transition-all duration-300"
                    style={{ width: `${ratioC}%` }}
                  >
                    C
                  </div>
                )}
              </div>
            </div>

            {/* Component A Selector (Exact Screenshot 3 Pink Pill A) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border-subtle hover:border-primary transition-colors shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-7 h-7 rounded-full bg-[#fb7185] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
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
                        {b.name}
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

              {/* Component B Selector (Exact Screenshot 3 Yellow Pill B) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border-subtle hover:border-amber-500 transition-colors shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-7 h-7 rounded-full bg-[#facc15] text-gray-900 font-mono text-xs font-bold flex items-center justify-center shrink-0">
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
                        {b.name}
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
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-border-subtle hover:border-teal-500 transition-colors shadow-sm">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-7 h-7 rounded-full bg-teal-500 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
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
                          {b.name}
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
                  className="w-full py-3.5 border border-border-subtle rounded-2xl text-gray-500 hover:text-primary hover:border-primary transition-all font-mono text-xs flex items-center justify-center gap-2 border-dashed bg-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add a third coffee</span>
                </button>
              )}
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-gray-500 uppercase font-bold tracking-wider">
                Size
              </label>
              <div className="flex gap-3">
                {(['200 g', '500 g', '1 kg'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all ${
                      selectedSize === s
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white border border-border-subtle text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Display */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-gray-400 uppercase font-bold block">
                Price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-gray-400 uppercase font-bold">RETAIL</span>
                <span className="font-mono text-3xl sm:text-4xl font-bold text-on-surface">
                  {formatRupiah(activePrice)}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  / {selectedSize}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdded}
                className="flex-1 bg-primary text-white font-mono font-bold text-sm py-4 px-8 rounded-xl hover:bg-surface-tint transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <span>Add to Cart</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-5 py-4 rounded-xl border border-border-subtle bg-white text-on-surface hover:border-primary transition-colors flex items-center gap-2 text-xs font-mono font-bold"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Our Picks Preset Pill (Exact Screenshot 3) */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-gray-400 uppercase font-bold block">
                Our picks
              </span>
              <button
                type="button"
                onClick={() => applyPreset('Gayo', 'Kerinci', 50, 50)}
                className="w-full text-left p-4 rounded-2xl bg-white border border-border-subtle hover:border-primary hover:bg-surface-container-low transition-all font-mono text-xs font-semibold text-gray-700 shadow-sm"
              >
                50/50 Gayo Full Washed + Kerinci Blueberry
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DETAILS COMPARISON TABLE (Exact Screenshot 5)                          */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-8 border-t border-border-subtle">
          <h2 className="font-editorial text-2xl font-bold text-on-surface">
            Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-gray-500 font-mono">Component A</span>
              <span className="font-bold text-on-surface">{componentA.name}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-gray-500 font-mono">Component B</span>
              <span className="font-bold text-on-surface">{componentB.name}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-gray-500 font-mono">Process (A)</span>
              <span className="font-bold text-on-surface">{componentA.process}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-gray-500 font-mono">Process (B)</span>
              <span className="font-bold text-on-surface">{componentB.process}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-gray-500 font-mono">Region (A)</span>
              <span className="font-bold text-on-surface">{componentA.region}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-gray-500 font-mono">Region (B)</span>
              <span className="font-bold text-on-surface">{componentB.region}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-gray-500 font-mono">Varietals (A)</span>
              <span className="font-bold text-on-surface">{componentA.varietals}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
              <span className="text-gray-500 font-mono">Varietals (B)</span>
              <span className="font-bold text-on-surface">{componentB.varietals}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
            <span className="text-gray-500 font-mono text-xs block font-bold">Tasting Notes</span>
            <p className="font-editorial text-sm sm:text-base font-bold text-on-surface">
              {componentA.notes} • {componentB.notes}
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. TRANSPARENCY ACCORDIONS (Exact Screenshot 5)                           */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-4">
          {/* Accordion 1: Green Information */}
          <div className="border border-border-subtle rounded-2xl bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setOpenGreenInfo(!openGreenInfo)}
              className="w-full p-5 flex items-center justify-between font-editorial text-base font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span>Green Information</span>
              {openGreenInfo ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openGreenInfo && (
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-border-subtle/50">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between items-center font-mono text-xs">
                  <span className="text-on-surface-variant">Blended Landed Cost (1 kg, green)</span>
                  <span className="font-bold text-on-surface">{formatRupiah(blendedLandedCost)}</span>
                </div>
                <p className="text-[11px] text-gray-500 font-sans">
                  Calculated from each component&#39;s landed cost weighted by its blend ratio. Estimated average roast loss for this blend: 19.93%.
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
              <span>Price Breakdown</span>
              {openPriceBreakdown ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openPriceBreakdown && (
              <div className="px-5 pb-5 pt-1 space-y-3 border-t border-border-subtle/50 font-sans text-xs">
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>COGS/HPP (Harga Pokok Produksi)</strong> represents the cost of turning green beans into roasted coffee, which includes:
                </p>
                <ul className="space-y-1 text-gray-600 pl-4 list-disc text-[11px]">
                  <li>Green coffee used to produce <em>1 kg</em> for this blended coffee, calculated after <strong>19.93%</strong> average weight loss during roasting.</li>
                  <li>Electricity cost, which for this <em>1 kg</em> equals to <strong>Rp. 10.000</strong>.</li>
                </ul>
                <p className="text-[11px] text-gray-500 italic">
                  HPP <em>does not</em> include labor, mistakes during roasting, or other overhead costs.
                </p>

                <div className="space-y-2 font-mono text-xs pt-1">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">HPP (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(hppPerKg)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">Packaging (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(packagingCost1kg)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">Gross Profit (1 kg)</span>
                    <span className="font-bold text-primary">{formatRupiah(Math.max(25000, grossProfit1kg))}</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 italic">
                  There might be slight rounding discrepancy, as for the actual price we round once at the end.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
