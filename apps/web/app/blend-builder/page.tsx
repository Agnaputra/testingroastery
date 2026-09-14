'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
import { PageIntro } from '../../components/ui/page-structure';

interface BlendComponent {
  id: string;
  name: string;
  process: string;
  region: string;
  varietals: string;
  notes: string;
  pricePerKg: number; // Retail price per 1kg
  pricePer200g: number;
  sensory: FlavorMetrics;
  image: string;
}

const AVAILABLE_BEANS: BlendComponent[] = [
  {
    id: 'java-ijen-full-wash',
    name: 'Arabica Java Ijen Full Wash',
    process: 'Full Wash',
    region: 'Gunung Ijen, Bondowoso',
    varietals: 'Kartika, USDA 762',
    notes: 'Dark Chocolate, Brown Sugar, Clean Citrus',
    pricePerKg: 250000,
    pricePer200g: 60000,
    image: '/images/bag-prau.jpg',
    sensory: {
      acidity: 6.5,
      sweetness: 8.5,
      body: 7.5,
      floral: 5.0,
      aftertaste: 8.2,
      balance: 8.8,
    },
  },
  {
    id: 'arjuna-budug-asu',
    name: 'Arjuna Budug Asu Natural Espresso',
    process: 'Natural',
    region: 'Gunung Arjuna, Malang',
    varietals: 'Mixed Heirloom',
    notes: 'Tangerine, Lychee, Caramel, Black Tea',
    pricePerKg: 260000,
    pricePer200g: 68000,
    image: '/images/bag-walida.jpg',
    sensory: {
      acidity: 7.5,
      sweetness: 8.8,
      body: 7.5,
      floral: 7.2,
      aftertaste: 8.5,
      balance: 8.4,
    },
  },
  {
    id: 'dampit-fine-robusta',
    name: 'Dampit Fine Robusta Malang',
    process: 'Natural Honey',
    region: 'Dampit, Malang',
    varietals: 'Fine Robusta BP 42',
    notes: 'Dark Cocoa, Gula Aren, Heavy Crema',
    pricePerKg: 150000,
    pricePer200g: 35000,
    image: '/images/bag-sumbing.jpg',
    sensory: {
      acidity: 2.0,
      sweetness: 7.0,
      body: 9.8,
      floral: 2.5,
      aftertaste: 8.5,
      balance: 7.5,
    },
  },
  {
    id: 'kintamani-full-wash',
    name: 'Kintamani Full Wash Arabica',
    process: 'Full Wash',
    region: 'Kintamani, Bali',
    varietals: 'Typica, Kartika',
    notes: 'Sweet Chocolate, Orange Citrus, Smooth Body',
    pricePerKg: 260000,
    pricePer200g: 70000,
    image: '/images/bag-prau.jpg',
    sensory: {
      acidity: 6.8,
      sweetness: 8.5,
      body: 7.2,
      floral: 6.0,
      aftertaste: 8.0,
      balance: 8.6,
    },
  },
  {
    id: 'gayo-full-washed',
    name: 'Gayo Full Wash Arabica',
    process: 'Full Wash',
    region: 'Takengon, Aceh Tengah',
    varietals: 'Ateng, Tim Tim',
    notes: 'Dark Chocolate, Earthy Spices, Full Body',
    pricePerKg: 265000,
    pricePer200g: 75000,
    image: '/images/bag-prau.jpg',
    sensory: {
      acidity: 5.5,
      sweetness: 8.0,
      body: 8.8,
      floral: 4.5,
      aftertaste: 8.8,
      balance: 8.5,
    },
  },
  {
    id: 'brazil-santos',
    name: 'Brazil Santos Arabica Espresso',
    process: 'Natural',
    region: 'Minas Gerais, Brazil',
    varietals: 'Mundo Novo, Catuai',
    notes: 'Roasted Peanut, Nutty Cocoa, Low Acid',
    pricePerKg: 340000,
    pricePer200g: 92000,
    image: '/images/bag-grand-reserve.jpg',
    sensory: {
      acidity: 3.5,
      sweetness: 8.2,
      body: 9.0,
      floral: 3.0,
      aftertaste: 8.5,
      balance: 8.8,
    },
  },
  {
    id: 'telemung-honey-robusta',
    name: 'Telemung Honey Robusta Banyuwangi',
    process: 'Honey Process',
    region: 'Telemung, Banyuwangi',
    varietals: 'Fine Robusta',
    notes: 'Sweet Chocolate, Brown Sugar, Dense Crema',
    pricePerKg: 150000,
    pricePer200g: 35000,
    image: '/images/bag-sumbing.jpg',
    sensory: {
      acidity: 2.2,
      sweetness: 7.8,
      body: 9.2,
      floral: 3.0,
      aftertaste: 8.2,
      balance: 8.0,
    },
  },
];

export default function BlendBuilderPage() {
  const [componentA, setComponentA] = useState<BlendComponent>(AVAILABLE_BEANS[0]); // Java Ijen
  const [ratioA, setRatioA] = useState<number>(70);

  const [componentB, setComponentB] = useState<BlendComponent>(AVAILABLE_BEANS[1]); // Arjuna Budug Asu
  const [ratioB, setRatioB] = useState<number>(30);

  const [hasComponentC, setHasComponentC] = useState<boolean>(false);
  const [componentC, setComponentC] = useState<BlendComponent>(AVAILABLE_BEANS[2]); // Dampit Robusta
  const [ratioC, setRatioC] = useState<number>(15);

  const roastLevel = 'Dark Espresso Roast';
  const [selectedSize, setSelectedSize] = useState<'200 g' | '500 g' | '1 kg'>('1 kg');
  const [isAdded, setIsAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { addItem } = useCartStore();

  // Handle Preset Selection
  const applyPreset = (beanAId: string, beanBId: string, rA: number = 70, rB: number = 30) => {
    const a = AVAILABLE_BEANS.find((b) => b.id === beanAId) || AVAILABLE_BEANS[0];
    const b = AVAILABLE_BEANS.find((b) => b.id === beanBId) || AVAILABLE_BEANS[1];
    setComponentA(a);
    setComponentB(b);
    setRatioA(rA);
    setRatioB(rB);
    setHasComponentC(false);
  };

  // Precise Weighted Price Calculation
  const priceCalculation = useMemo(() => {
    const totalRatio = hasComponentC ? ratioA + ratioB + ratioC : ratioA + ratioB;
    const wA = ratioA / totalRatio;
    const wB = ratioB / totalRatio;
    const wC = hasComponentC ? ratioC / totalRatio : 0;

    const costA = Math.round(componentA.pricePerKg * wA);
    const costB = Math.round(componentB.pricePerKg * wB);
    const costC = hasComponentC ? Math.round(componentC.pricePerKg * wC) : 0;

    const blendedPricePerKg = costA + costB + costC;

    // Price scaling for packaging sizes
    const price1kg = blendedPricePerKg;
    const price500g = Math.round((blendedPricePerKg * 0.52) / 1000) * 1000;
    const price200g = Math.round((blendedPricePerKg * 0.22) / 1000) * 1000;

    return {
      wA,
      wB,
      wC,
      costA,
      costB,
      costC,
      blendedPricePerKg,
      price1kg,
      price500g,
      price200g,
    };
  }, [componentA, ratioA, componentB, ratioB, hasComponentC, componentC, ratioC]);

  // Active Price based on selected size
  const activePrice = useMemo(() => {
    if (selectedSize === '200 g') return priceCalculation.price200g;
    if (selectedSize === '500 g') return priceCalculation.price500g;
    return priceCalculation.price1kg;
  }, [selectedSize, priceCalculation]);

  // Dynamic Blended Flavor Sensory Profile calculation
  const blendedSensory: FlavorMetrics = useMemo(() => {
    const wA = priceCalculation.wA;
    const wB = priceCalculation.wB;
    const wC = priceCalculation.wC;

    // Dark Espresso Roast modifiers
    const roastModifier: Record<keyof FlavorMetrics, number> = {
      acidity: -1.2,
      sweetness: +0.2,
      body: +1.2,
      floral: -0.8,
      aftertaste: +0.6,
      balance: +0.4,
    };

    const calculateAxis = (key: keyof FlavorMetrics) => {
      const base =
        componentA.sensory[key] * wA +
        componentB.sensory[key] * wB +
        (hasComponentC && componentC ? componentC.sensory[key] * wC : 0);
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
  }, [componentA, componentB, hasComponentC, componentC, priceCalculation]);

  const handleRatioAChange = (val: number) => {
    if (!hasComponentC) {
      const clamped = Math.max(10, Math.min(90, Math.round(val)));
      setRatioA(clamped);
      setRatioB(100 - clamped);
      return;
    }
    const clamped = Math.max(5, Math.min(90, Math.round(val)));
    const remaining = 100 - clamped;
    const oldOtherSum = ratioB + ratioC;
    let newB = oldOtherSum > 0 ? Math.round(remaining * (ratioB / oldOtherSum)) : Math.round(remaining / 2);
    let newC = remaining - newB;

    if (newB < 5) {
      newB = 5;
      newC = remaining - 5;
    } else if (newC < 5) {
      newC = 5;
      newB = remaining - 5;
    }
    setRatioA(clamped);
    setRatioB(newB);
    setRatioC(newC);
  };

  const handleRatioBChange = (val: number) => {
    if (!hasComponentC) {
      const clamped = Math.max(10, Math.min(90, Math.round(val)));
      setRatioB(clamped);
      setRatioA(100 - clamped);
      return;
    }
    const clamped = Math.max(5, Math.min(90, Math.round(val)));
    const remaining = 100 - clamped;
    const oldOtherSum = ratioA + ratioC;
    let newA = oldOtherSum > 0 ? Math.round(remaining * (ratioA / oldOtherSum)) : Math.round(remaining / 2);
    let newC = remaining - newA;

    if (newA < 5) {
      newA = 5;
      newC = remaining - 5;
    } else if (newC < 5) {
      newC = 5;
      newA = remaining - 5;
    }
    setRatioB(clamped);
    setRatioA(newA);
    setRatioC(newC);
  };

  const handleRatioCChange = (val: number) => {
    const clamped = Math.max(5, Math.min(90, Math.round(val)));
    const remaining = 100 - clamped;
    const oldOtherSum = ratioA + ratioB;
    let newA = oldOtherSum > 0 ? Math.round(remaining * (ratioA / oldOtherSum)) : Math.round(remaining / 2);
    let newB = remaining - newA;

    if (newA < 5) {
      newA = 5;
      newB = remaining - 5;
    } else if (newB < 5) {
      newB = 5;
      newA = remaining - 5;
    }
    setRatioC(clamped);
    setRatioA(newA);
    setRatioB(newB);
  };

  const handleAddComponentC = () => {
    setHasComponentC(true);
    const newC = 20;
    const remaining = 80;
    const oldSum = ratioA + ratioB;
    const newA = Math.round(remaining * (ratioA / oldSum));
    const newB = remaining - newA;
    setRatioA(newA);
    setRatioB(newB);
    setRatioC(newC);
  };

  const handleRemoveComponentC = () => {
    setHasComponentC(false);
    const oldSum = ratioA + ratioB;
    const newA = Math.round((ratioA / oldSum) * 100);
    const newB = 100 - newA;
    setRatioA(newA);
    setRatioB(newB);
    setRatioC(0);
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
      imageUrl: '/images/canva-pouch-showcase.jpg',
      weightGrams: selectedSize === '200 g' ? 200 : selectedSize === '500 g' ? 500 : 1000,
      weightLabel: selectedSize,
      grind: 'whole',
      grindLabel: `Biji utuh (${roastLevel})`,
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
      className="page-shell"
    >
      <PageIntro
        tone="dark"
        compact
        kicker="Peracik blend / BYOB"
        icon={<Sparkles size={14} />}
        title="Racik profil kopi Anda sendiri."
        description="Pilih dua atau tiga origin, atur komposisinya, lalu baca perubahan karakter rasa dan estimasi harga secara langsung."
      />

      <div className="site-container page-section space-y-10">

        {/* ========================================================================= */}
        {/* 2. 2-COLUMN MAIN BYOB SECTION                                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Dynamic Bean Pouch Showcase + Live Flavor Radar Chart (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-white rounded-xl p-5 sm:p-6 border-2 border-gray-200 shadow-md space-y-4"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-maroon" />
                  <span className="font-editorial text-sm font-extrabold text-brand-charcoal">
                    Visualisasi Racikan Biji
                  </span>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-brand-charcoal/10 text-brand-charcoal">
                  {hasComponentC ? '3-Bean Blend' : '2-Bean Blend'}
                </span>
              </div>

              {/* Component Pouches Showcase Grid */}
              <div className={`grid ${hasComponentC ? 'grid-cols-3 gap-2 sm:gap-3' : 'grid-cols-2 gap-3 sm:gap-4'} items-stretch`}>
                {/* Component A Card */}
                <div className="bg-surface border-2 border-gray-200 hover:border-brand-maroon rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-between text-center transition-all shadow-xs group">
                  <div className="w-full flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-brand-maroon text-white text-[9px] sm:text-[10px] font-mono font-extrabold shadow-xs">
                      A
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-brand-maroon">
                      {ratioA}%
                    </span>
                  </div>
                  <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-white border border-gray-200 p-1.5 flex items-center justify-center my-1 group-hover:scale-105 transition-transform">
                    <Image
                      src={componentA.image}
                      alt={componentA.name}
                      fill
                      sizes="(max-width: 640px) 40vw, 180px"
                      className="object-contain p-1.5 drop-shadow-sm"
                    />
                  </div>
                  <div className="w-full mt-1 space-y-0.5">
                    <div className="font-editorial text-[11px] sm:text-xs font-extrabold text-brand-charcoal truncate">
                      {componentA.name.replace(/Arabica|Robusta/g, '').trim()}
                    </div>
                    <div className="text-[9px] font-mono text-on-surface-variant truncate font-semibold">
                      {componentA.process}
                    </div>
                  </div>
                </div>

                {/* Component B Card */}
                <div className="bg-surface border-2 border-gray-200 hover:border-brand-charcoal rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-between text-center transition-all shadow-xs group">
                  <div className="w-full flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-brand-charcoal text-white text-[9px] sm:text-[10px] font-mono font-extrabold shadow-xs">
                      B
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-brand-charcoal">
                      {ratioB}%
                    </span>
                  </div>
                  <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-white border border-gray-200 p-1.5 flex items-center justify-center my-1 group-hover:scale-105 transition-transform">
                    <Image
                      src={componentB.image}
                      alt={componentB.name}
                      fill
                      sizes="(max-width: 640px) 40vw, 180px"
                      className="object-contain p-1.5 drop-shadow-sm"
                    />
                  </div>
                  <div className="w-full mt-1 space-y-0.5">
                    <div className="font-editorial text-[11px] sm:text-xs font-extrabold text-brand-charcoal truncate">
                      {componentB.name.replace(/Arabica|Robusta/g, '').trim()}
                    </div>
                    <div className="text-[9px] font-mono text-on-surface-variant truncate font-semibold">
                      {componentB.process}
                    </div>
                  </div>
                </div>

                {/* Component C Card (if active) */}
                {hasComponentC && (
                  <div className="bg-surface border-2 border-gray-200 hover:border-brand-navy rounded-xl p-2.5 sm:p-3 flex flex-col items-center justify-between text-center transition-all shadow-xs group">
                    <div className="w-full flex items-center justify-between mb-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-brand-navy text-white text-[9px] sm:text-[10px] font-mono font-extrabold shadow-xs">
                        C
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-black text-brand-navy">
                        {ratioC}%
                      </span>
                    </div>
                    <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-white border border-gray-200 p-1.5 flex items-center justify-center my-1 group-hover:scale-105 transition-transform">
                      <Image
                        src={componentC.image}
                        alt={componentC.name}
                        fill
                        sizes="(max-width: 640px) 28vw, 160px"
                        className="object-contain p-1.5 drop-shadow-sm"
                      />
                    </div>
                    <div className="w-full mt-1 space-y-0.5">
                      <div className="font-editorial text-[11px] sm:text-xs font-extrabold text-brand-charcoal truncate">
                        {componentC.name.replace(/Arabica|Robusta/g, '').trim()}
                      </div>
                      <div className="text-[9px] font-mono text-on-surface-variant truncate font-semibold">
                        {componentC.process}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom BYOB Blend Packaging Label Banner */}
              <div className="rounded-xl border border-white/10 bg-brand-charcoal p-4 text-center text-white space-y-1">
                <div className="text-[9px] font-mono uppercase tracking-widest font-extrabold text-brand-teal">
                  52 COFFEE ROASTERY • ARTISAN BLEND
                </div>
                <div className="font-editorial text-sm sm:text-base font-extrabold text-white">
                  {ratioA}% {componentA.name.split(' ')[0]} + {ratioB}% {componentB.name.split(' ')[0]}
                  {hasComponentC && ` + ${ratioC}% ${componentC.name.split(' ')[0]}`}
                </div>
                <div className="inline-block mt-1">
                  <span className="text-[9px] font-mono uppercase px-3 py-0.5 rounded-full bg-brand-maroon text-white font-extrabold tracking-wider">
                    {roastLevel}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* DYNAMIC SENSORY RADAR CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="p-6 rounded-xl bg-white border-2 border-gray-200 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-maroon" />
                  <h3 className="font-editorial text-base font-extrabold text-brand-charcoal">
                    Prediksi Profil Rasa Racikan
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-full bg-brand-charcoal/10 text-brand-charcoal">
                  Diperbarui langsung
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

              <div className="p-3.5 rounded-xl bg-surface border border-gray-200 text-xs font-sans text-on-surface leading-relaxed">
                <span className="font-extrabold text-brand-charcoal block mb-0.5">Catatan Karakter Sangrai:</span>
                Kombinasi menonjolkan keasaman segar dari <strong className="text-brand-charcoal">{componentA.name.split(' ')[0]}</strong> berpadu manis karamel &amp; krema tebal dari <strong className="text-brand-charcoal">{componentB.name.split(' ')[0]}</strong> disangrai pada level <strong className="text-brand-maroon">{roastLevel}</strong>.
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
            {/* Dual/Triple Ratio Progress Bar with Balance Indicator */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-extrabold text-brand-charcoal uppercase tracking-wider">
                  Rasio Racikan Blend
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                  ✓ Total: {ratioA + ratioB + (hasComponentC ? ratioC : 0)}% (Seimbang)
                </span>
              </div>

              <div className="w-full h-10 rounded-full overflow-hidden flex bg-gray-200 border-2 border-gray-300 relative shadow-inner">
                {/* Segment A (Crimson) */}
                <motion.div
                  className="bg-brand-maroon h-full flex items-center justify-center font-mono text-xs font-extrabold text-white transition-all duration-300 shadow-sm"
                  style={{ width: `${ratioA}%` }}
                >
                  A ({ratioA}%)
                </motion.div>

                {/* Segment B (Navy) */}
                <motion.div
                  className="bg-brand-charcoal h-full flex items-center justify-center font-mono text-xs font-extrabold text-white transition-all duration-300 shadow-sm"
                  style={{ width: `${ratioB}%` }}
                >
                  B ({ratioB}%)
                </motion.div>

                {hasComponentC && (
                  <motion.div
                    className="bg-brand-navy h-full flex items-center justify-center font-mono text-xs font-extrabold text-white transition-all duration-300 shadow-sm"
                    style={{ width: `${ratioC}%` }}
                  >
                    C ({ratioC}%)
                  </motion.div>
                )}
              </div>

              {/* Quick Blend Ratio Presets for 2-Bean and 3-Bean modes */}
              {!hasComponentC ? (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-brand-navy font-bold mr-1">Preset 2-Biji:</span>
                  {[
                    { label: '70 / 30 (Klasik)', a: 70, b: 30 },
                    { label: '60 / 40 (Seimbang)', a: 60, b: 40 },
                    { label: '50 / 50 (Setara)', a: 50, b: 50 },
                    { label: '80 / 20 (Basis dominan)', a: 80, b: 20 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setRatioA(p.a);
                        setRatioB(p.b);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer shadow-xs ${
                        ratioA === p.a && ratioB === p.b
                          ? 'bg-brand-charcoal text-white border-brand-charcoal'
                          : 'bg-white border-gray-300 text-brand-charcoal hover:border-brand-charcoal hover:bg-surface'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-brand-navy font-bold mr-1">Preset 3-Biji:</span>
                  {[
                    { label: '50 / 30 / 20', a: 50, b: 30, c: 20 },
                    { label: '40 / 40 / 20', a: 40, b: 40, c: 20 },
                    { label: '60 / 20 / 20', a: 60, b: 20, c: 20 },
                    { label: '34 / 33 / 33', a: 34, b: 33, c: 33 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setRatioA(p.a);
                        setRatioB(p.b);
                        setRatioC(p.c);
                      }}
                      className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer shadow-xs ${
                        ratioA === p.a && ratioB === p.b && ratioC === p.c
                          ? 'bg-brand-charcoal text-white border-brand-charcoal'
                          : 'bg-white border-gray-300 text-brand-charcoal hover:border-brand-charcoal hover:bg-surface'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Component A Selector */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-brand-maroon transition-colors shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-brand-maroon text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                      A
                    </div>
                    <select
                      value={componentA.id}
                      onChange={(e) => {
                        const found = AVAILABLE_BEANS.find((b) => b.id === e.target.value);
                        if (found) setComponentA(found);
                      }}
                      className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-brand-charcoal focus:ring-0 cursor-pointer"
                    >
                      {AVAILABLE_BEANS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({formatRupiah(b.pricePerKg)}/kg)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1 pl-3 border-l-2 border-gray-200 shrink-0">
                    <input
                      type="number"
                      min="5"
                      max="90"
                      value={ratioA}
                      onChange={(e) => handleRatioAChange(Number(e.target.value))}
                      className="w-10 text-right bg-transparent border-none font-mono text-base font-extrabold text-brand-charcoal focus:ring-0 p-0"
                    />
                    <span className="font-mono text-xs font-extrabold text-brand-navy">%</span>
                  </div>
                </div>
                {/* Visual Range Slider for Component A */}
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="1"
                    value={ratioA}
                    onChange={(e) => handleRatioAChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-maroon"
                  />
                </div>
              </div>

              {/* Component B Selector */}
              <div className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-brand-charcoal transition-colors shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-brand-charcoal text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                      B
                    </div>
                    <select
                      value={componentB.id}
                      onChange={(e) => {
                        const found = AVAILABLE_BEANS.find((b) => b.id === e.target.value);
                        if (found) setComponentB(found);
                      }}
                      className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-brand-charcoal focus:ring-0 cursor-pointer"
                    >
                      {AVAILABLE_BEANS.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({formatRupiah(b.pricePerKg)}/kg)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1 pl-3 border-l-2 border-gray-200 shrink-0">
                    <input
                      type="number"
                      min="5"
                      max="90"
                      value={ratioB}
                      onChange={(e) => handleRatioBChange(Number(e.target.value))}
                      className="w-10 text-right bg-transparent border-none font-mono text-base font-extrabold text-brand-charcoal focus:ring-0 p-0"
                    />
                    <span className="font-mono text-xs font-extrabold text-brand-navy">%</span>
                  </div>
                </div>
                {/* Visual Range Slider for Component B */}
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="1"
                    value={ratioB}
                    onChange={(e) => handleRatioBChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-charcoal"
                  />
                </div>
              </div>

              {/* Expandable Component C (Flexible up to 90% with auto-balancing) */}
              {hasComponentC && (
                <div className="p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-brand-navy transition-colors shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-brand-navy text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                        C
                      </div>
                      <select
                        value={componentC.id}
                        onChange={(e) => {
                          const found = AVAILABLE_BEANS.find((b) => b.id === e.target.value);
                          if (found) setComponentC(found);
                        }}
                        className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-brand-charcoal focus:ring-0 cursor-pointer"
                      >
                        {AVAILABLE_BEANS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({formatRupiah(b.pricePerKg)}/kg)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pl-3 border-l-2 border-gray-200 shrink-0">
                      <input
                        type="number"
                        min="5"
                        max="90"
                        value={ratioC}
                        onChange={(e) => handleRatioCChange(Number(e.target.value))}
                        className="w-10 text-right bg-transparent border-none font-mono text-base font-extrabold text-brand-charcoal focus:ring-0 p-0"
                      />
                      <span className="font-mono text-xs font-extrabold text-brand-navy">%</span>
                      <button
                        type="button"
                        onClick={handleRemoveComponentC}
                        className="text-xs text-brand-maroon hover:bg-brand-maroon/10 p-1.5 rounded-lg font-bold cursor-pointer"
                        title="Hapus Biji C"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {/* Visual Range Slider for Component C */}
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="range"
                      min="5"
                      max="90"
                      step="1"
                      value={ratioC}
                      onChange={(e) => handleRatioCChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-navy"
                    />
                  </div>
                </div>
              )}

              {/* Add Bean Button for Component C */}
              {!hasComponentC && (
                <button
                  type="button"
                  onClick={handleAddComponentC}
                  className="w-full py-4 border border-dashed border-outline-variant hover:border-brand-charcoal rounded-xl text-brand-charcoal hover:bg-surface-container-low transition-colors font-mono text-xs flex items-center justify-center gap-2 bg-white font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambahkan biji kopi ketiga (Komponen C)</span>
                </button>
              )}
            </div>

            {/* ROAST LEVEL PROFILE - LOCKED TO DARK ESPRESSO AS REQUESTED */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-mono text-brand-charcoal uppercase font-extrabold tracking-wider">
                Profil Sangrai (Roast Profile)
              </label>
              <div className="p-4 rounded-xl bg-brand-charcoal text-white border border-white/15 shadow-lg flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-sm font-bold text-white">Dark Espresso Roast</span>
                    <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-brand-maroon text-white">
                      Fixed Profile
                    </span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed font-normal">
                    Diformulasikan khusus untuk mesin espresso, moka pot, &amp; es kopi susu dengan ekstraksi krema tebal dan rasa cokelat manis pekat tanpa asam menusuk.
                  </p>
                </div>
                <Check className="w-5 h-5 text-emerald-400 shrink-0 ml-4" />
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-brand-charcoal uppercase font-extrabold tracking-wider">
                Ukuran Kemasan
              </label>
              <div className="flex gap-3">
                {(['200 g', '500 g', '1 kg'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`px-6 py-3 rounded-xl font-mono text-xs font-extrabold transition-all cursor-pointer ${
                      selectedSize === s
                        ? 'bg-brand-charcoal text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 text-brand-charcoal hover:border-brand-charcoal'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Display with Live Formula */}
            <div className="p-5 rounded-xl bg-white border-2 border-gray-200 shadow-md space-y-3.5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-mono text-brand-maroon-dark uppercase font-black tracking-wider block">
                    HARGA RACIKAN {selectedSize}
                  </span>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-brand-charcoal mt-0.5">
                    {formatRupiah(activePrice)}
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-on-surface-variant">
                  <span>Rate: </span>
                  <span className="font-extrabold text-brand-charcoal">{formatRupiah(priceCalculation.blendedPricePerKg)}</span>
                  <span> / kg</span>
                </div>
              </div>

              {/* Formula Breakdown */}
              <div className="p-3.5 rounded-xl bg-surface border border-border-subtle text-[11px] font-mono space-y-2 text-on-surface">
                <div className="flex justify-between items-center text-on-surface">
                  <span>• {ratioA}% {componentA.name.split(' ')[0]} ({formatRupiah(componentA.pricePerKg)}/kg)</span>
                  <span className="font-extrabold text-brand-charcoal">{formatRupiah(priceCalculation.costA)}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface">
                  <span>• {ratioB}% {componentB.name.split(' ')[0]} ({formatRupiah(componentB.pricePerKg)}/kg)</span>
                  <span className="font-extrabold text-brand-charcoal">{formatRupiah(priceCalculation.costB)}</span>
                </div>
                {hasComponentC && (
                  <div className="flex justify-between items-center text-on-surface">
                    <span>• {ratioC}% {componentC.name.split(' ')[0]} ({formatRupiah(componentC.pricePerKg)}/kg)</span>
                    <span className="font-extrabold text-brand-charcoal">{formatRupiah(priceCalculation.costC)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-2 flex justify-between items-center font-black text-xs text-brand-charcoal">
                  <span>Total Harga Dasar / kg</span>
                  <span>{formatRupiah(priceCalculation.blendedPricePerKg)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdded}
                className="flex-1 bg-brand-charcoal hover:bg-brand-charcoal text-white font-mono font-extrabold text-sm py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-300" />
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
                className="px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-brand-charcoal hover:border-brand-charcoal transition-colors flex items-center gap-2 text-xs font-mono font-extrabold shadow-sm cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
              </button>
            </div>

            {/* Our Picks Preset Pill */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-mono text-brand-charcoal uppercase font-extrabold block tracking-wider">
                Rekomendasi Racikan Roaster 52 Coffee
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => applyPreset('java-ijen-full-wash', 'arjuna-budug-asu', 70, 30)}
                  className="text-left p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-brand-charcoal hover:bg-surface transition-all font-mono text-xs font-semibold text-on-surface shadow-sm cursor-pointer"
                >
                  <div className="font-extrabold text-brand-charcoal text-sm">70/30 Java Ijen + Arjuna Budug</div>
                  <div className="text-[11px] text-on-surface-variant mt-1 font-medium">Fruity Tangerine, Sweet Caramel &amp; Clean Body</div>
                  <div className="text-xs font-extrabold text-brand-maroon-dark mt-1.5">Rp 253.000 / kg</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('java-ijen-full-wash', 'dampit-fine-robusta', 70, 30)}
                  className="text-left p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-brand-charcoal hover:bg-surface transition-all font-mono text-xs font-semibold text-on-surface shadow-sm cursor-pointer"
                >
                  <div className="font-extrabold text-brand-charcoal text-sm">70/30 Java Ijen + Dampit Robusta</div>
                  <div className="text-[11px] text-on-surface-variant mt-1 font-medium">Racikan klasik (Krema tebal &amp; kakao pekat)</div>
                  <div className="text-xs font-extrabold text-brand-maroon-dark mt-1.5">Rp 220.000 / kg</div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* 3. DETAILS COMPARISON TABLE                                               */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-8 border-t-2 border-gray-200">
          <h2 className="font-editorial text-2xl font-bold text-brand-charcoal">
            Spesifikasi Komponen Racikan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex justify-between">
              <span className="text-brand-navy font-mono font-bold">Komponen A</span>
              <span className="font-extrabold text-brand-charcoal">{componentA.name} ({formatRupiah(componentA.pricePerKg)}/kg)</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex justify-between">
              <span className="text-brand-navy font-mono font-bold">Komponen B</span>
              <span className="font-extrabold text-brand-charcoal">{componentB.name} ({formatRupiah(componentB.pricePerKg)}/kg)</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex justify-between">
              <span className="text-brand-navy font-mono font-bold">Process (A)</span>
              <span className="font-extrabold text-brand-charcoal">{componentA.process}</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex justify-between">
              <span className="text-brand-navy font-mono font-bold">Process (B)</span>
              <span className="font-extrabold text-brand-charcoal">{componentB.process}</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex justify-between">
              <span className="text-brand-navy font-mono font-bold">Region (A)</span>
              <span className="font-extrabold text-brand-charcoal">{componentA.region}</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex justify-between">
              <span className="text-brand-navy font-mono font-bold">Region (B)</span>
              <span className="font-extrabold text-brand-charcoal">{componentB.region}</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex justify-between">
              <span className="text-brand-navy font-mono font-bold">Varietals (A)</span>
              <span className="font-extrabold text-brand-charcoal">{componentA.varietals}</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex justify-between">
              <span className="text-brand-navy font-mono font-bold">Varietals (B)</span>
              <span className="font-extrabold text-brand-charcoal">{componentB.varietals}</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border-2 border-gray-200 space-y-1.5 shadow-sm">
            <span className="text-brand-navy font-mono text-xs block font-bold uppercase tracking-wider">Catatan Rasa Gabungan</span>
            <p className="font-editorial text-base font-extrabold text-brand-charcoal">
              {componentA.notes} • {componentB.notes}
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
