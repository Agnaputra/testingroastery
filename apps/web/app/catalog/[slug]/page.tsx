'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ChevronUp,
  Share2,
  Sparkles,
  Coffee,
  Flame,
  Droplets,
  Scale,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import {
  PRODUCTS,
  getProductBySlug,
  ProductVariant,
  formatRupiah,
} from '../../../lib/data';
import { useCartStore } from '../../../lib/store/useCartStore';
import { FlavorRadarChart, FlavorMetrics } from '../../../components/flavor-radar-chart';

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs font-mono text-gray-400">Loading product...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}

function ProductDetailContent() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-editorial text-2xl font-bold">Produk Tidak Ditemukan</h1>
        <p className="text-sm text-on-surface-variant">Biji kopi yang kamu cari mungkin sedang berganti batch sangrai.</p>
        <Link href="/catalog" className="btn-primary inline-flex text-xs">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const initialMode = modeParam === 'cup' && product.cupPrice ? 'cup' : 'beans';
  const [orderMode, setOrderMode] = useState<'cup' | 'beans'>(initialMode);
  const [servingTemp, setServingTemp] = useState<'hot' | 'iced'>('hot');

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || { price: product.basePrice, weightLabel: '100g', weightGrams: 100, inStock: true }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  // Accordion states
  const [openGreenInfo, setOpenGreenInfo] = useState(true);
  const [openPriceBreakdown, setOpenPriceBreakdown] = useState(true);
  const [openOrigin, setOpenOrigin] = useState(false);
  const [openStory, setOpenStory] = useState(false);

  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (orderMode === 'cup') {
      addItem({
        productId: product.id,
        name: `${product.slowbarAlias || product.name} (${servingTemp === 'hot' ? 'Hot Filter' : 'Ice Filter'})`,
        slug: product.slug,
        imageUrl: product.imageUrl,
        weightGrams: 1,
        weightLabel: '1 Cup',
        grind: 'whole',
        grindLabel: `Slowbar Brew (${servingTemp === 'hot' ? 'Hot Filter' : 'Ice Filter'})`,
        unitPrice: product.cupPrice || product.basePrice,
        quantity: quantity,
        series: product.series,
        tastingNotes: product.tastingNotes,
      });
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        imageUrl: product.imageUrl,
        weightGrams: selectedVariant.weightGrams,
        weightLabel: selectedVariant.weightLabel,
        grind: 'whole',
        grindLabel: 'Whole Beans (Biji Utuh)',
        unitPrice: selectedVariant.price,
        quantity: quantity,
        series: product.series,
        tastingNotes: product.tastingNotes,
      });
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Sensory Radar Metrics for this single origin / product
  const productSensory: FlavorMetrics = useMemo(() => {
    const acid = Math.min(10, Math.max(2, (product.acidity || 3.5) * 2));
    const sweet = Math.min(10, Math.max(2, (product.sweetness || 3.8) * 2));
    const bod = Math.min(10, Math.max(2, (product.body || 3.5) * 2));
    const flor = product.flavorCategory.includes('Floral')
      ? 9.0
      : product.flavorCategory.includes('Fruity')
      ? 8.5
      : 6.0;
    const after = Number(Math.min(10, (sweet + bod) * 0.55).toFixed(1));
    const bal = Number(Math.min(10, (acid + sweet + bod) / 3 + 1.2).toFixed(1));

    return {
      acidity: acid,
      sweetness: sweet,
      body: bod,
      floral: flor,
      aftertaste: after,
      balance: bal,
    };
  }, [product]);

  // Calculated transparency figures
  const landedGreenCost = Math.round((product.basePrice * 0.58) / 1000) * 1000 || 169993;
  const hppPerKg = Math.round((landedGreenCost / 0.8) + 10000);
  const packagingPerKg = 10000;
  const price1kg = selectedVariant.weightGrams === 1000
    ? selectedVariant.price
    : Math.round(product.basePrice * 3.8);
  const grossProfit1kg = price1kg - hppPerKg - packagingPerKg;

  // Resolve clean studio product bag image
  let displayImg = product.imageUrl;
  if (!product.imageUrl || product.imageUrl.startsWith('http')) {
    if (product.series === 'Java Exotic') displayImg = '/images/bag-sumbing.jpg';
    else if (product.series === 'Grand Reserve') displayImg = '/images/bag-grand-reserve.jpg';
    else if (product.series === 'Argopuro Walida' || product.series === 'Arjuna Series') displayImg = '/images/bag-walida.jpg';
    else displayImg = '/images/bag-prau.jpg';
  }

  const currentPrice = orderMode === 'cup' ? (product.cupPrice || product.basePrice) : selectedVariant.price;
  const cleanName = product.name.replace(/\(.*?\)/g, '').trim();

  return (
    <div className="w-full bg-surface-white text-on-surface min-h-screen py-10 px-4 sm:px-10 font-sans pb-28 sm:pb-16">
      <div className="max-w-[1280px] mx-auto space-y-10">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMB                                                             */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
          <Link href="/catalog" className="hover:text-brand-navy transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/catalog?series=${encodeURIComponent(product.series)}`}
            className="hover:text-brand-navy transition-colors"
          >
            {product.series}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="capitalize font-mono">
            {orderMode === 'cup'
              ? 'Slowbar Menu'
              : product.category === 'espresso'
              ? 'Espresso Based'
              : 'Filter Based'}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-navy font-semibold truncate max-w-xs">{cleanName}</span>
        </div>

        {/* ========================================================================= */}
        {/* 2. 2-COLUMN MAIN PRODUCT SECTION                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Visual Mockup & Sensory Radar Chart (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-low rounded-3xl p-8 sm:p-12 border border-border-subtle flex items-center justify-center aspect-[3/4] relative shadow-sm group">
              <div className="w-full h-full relative flex items-center justify-center">
                <img
                  src={displayImg}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105 filter drop-shadow-md"
                />
              </div>
            </div>

            {/* SENSORY RADAR CARD */}
            <div className="p-6 rounded-3xl bg-white border border-border-subtle shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-maroon" />
                  <h3 className="font-editorial text-base font-bold text-brand-navy">
                    Profil Sensorik SCA
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-brand-maroon/10 text-brand-maroon">
                  Cupping Verified
                </span>
              </div>

              {/* Flavor Radar Component */}
              <FlavorRadarChart
                metrics={productSensory}
                size={270}
                color={product.series === 'Grand Reserve' ? 'amber' : 'maroon'}
                showLabels={true}
                showBars={true}
              />
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-7">
            {/* Title & Metadata Hierarchy */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1 rounded-full bg-brand-maroon text-white font-bold text-[10px] uppercase tracking-wider">
                  {product.series}
                </span>
                <span className="px-3 py-1 rounded-full bg-brand-navy/10 text-brand-navy font-bold text-[10px] uppercase tracking-wider font-mono">
                  {orderMode === 'cup'
                    ? 'BEVERAGES (SLOWBAR)'
                    : product.category === 'espresso'
                    ? 'ESPRESSO BASED'
                    : 'FILTER BASED'}
                </span>
                {product.slowbarAlias && (
                  <span className="px-3 py-1 rounded-full bg-brand-pill text-brand-navy font-bold text-[10px] uppercase tracking-wider border border-border-subtle">
                    Slowbar Alias: {product.slowbarAlias}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-[10px] uppercase tracking-wider font-mono">
                  Roast: {product.roastLevel}
                </span>
              </div>

              {/* Clean Main Headline */}
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy leading-tight tracking-tight">
                {orderMode === 'cup' && product.slowbarAlias
                  ? product.slowbarAlias
                  : cleanName}
              </h1>

              {/* Secondary Clean Subtitle */}
              <p className="text-sm text-on-surface-variant font-sans font-medium">
                {cleanName} <span className="text-border-subtle mx-1.5">•</span> <span className="font-mono text-xs text-brand-navy-light">{product.process}</span>
              </p>
            </div>

            {/* ========================================================================= */}
            {/* AT A GLANCE (Compact & Lean Hierarchy)                                    */}
            {/* ========================================================================= */}
            <div className="space-y-2.5 pt-2 border-t border-border-subtle">
              {/* Tasting Notes Box */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-0.5">
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                  TASTING NOTES
                </span>
                <p className="font-editorial text-base sm:text-lg font-bold text-brand-navy leading-snug">
                  {product.tastingNotes.join(', ')}
                </p>
              </div>

              {/* Freshness Box */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                    FRESHNESS &amp; ROAST DATE
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    &lt; 7 Hari Fresh Sangrai
                  </span>
                </div>
                <p className="text-xs font-semibold text-brand-navy">
                  Disangrai fresh kurang dari 7 hari yang lalu di Roastery Malang
                </p>
                <p className="text-[10px] text-on-surface-variant leading-normal">
                  Puncak rasa optimal: resting min. 2 minggu (espresso) &amp; 3 minggu (filter).
                </p>
              </div>

              {/* Metadata 3x2 Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-0.5">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">FARM</span>
                  <p className="text-[11px] font-bold text-on-surface truncate">{product.region.split(',')[0] || 'Gunung Argopuro'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-0.5">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">REGION</span>
                  <p className="text-[11px] font-bold text-on-surface truncate">{product.origin.split(',')[0] || 'East Java'}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-0.5">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">PRODUCER</span>
                  <p className="text-[11px] font-bold text-on-surface truncate">52 Roastery Partner</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-0.5">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">PROCESS</span>
                  <p className="text-[11px] font-bold text-on-surface truncate">{product.process}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-0.5">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">ALTITUDE</span>
                  <p className="text-[11px] font-bold text-on-surface truncate">{product.altitude}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-0.5">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">VARIETALS</span>
                  <p className="text-[11px] font-bold text-on-surface truncate">{product.varietal}</p>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* ONE-CLICK BREW GUIDE (HANYA MUNCUL DI FILTER & ESPRESSO ROAST PROFILE)   */}
            {/* ========================================================================= */}
            {orderMode !== 'cup' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-brand-maroon">
                    <Coffee className="w-4 h-4" />
                    <span>Resep Ekstraksi Barista 52 Coffee</span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-mono">
                    {product.brewingRecipe.dose} • Rasio {product.brewingRecipe.ratio} • Suhu {product.brewingRecipe.temp}
                  </p>
                </div>
                <Link
                  href={`/guide?bean=${encodeURIComponent(product.name)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-mono font-bold hover:bg-brand-navy-light transition-colors shadow-sm shrink-0"
                >
                  <span>Seduh di Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PURCHASE SECTION (SLOWBAR CUP vs BEANS POUCH)                             */}
            {/* ========================================================================= */}
            {orderMode === 'cup' && product.cupPrice ? (
              /* MODE 1: SLOWBAR CUP */
              <div className="space-y-4 pt-2 border-t border-border-subtle">
                <div className="space-y-2.5 p-3.5 sm:p-4 rounded-2xl bg-brand-pill/60 border border-border-subtle">
                  <span className="text-[11px] font-mono text-on-surface-variant uppercase font-semibold block">
                    Pilihan Seduhan Slowbar:
                  </span>
                  <div className="flex gap-2.5 relative">
                    <button
                      type="button"
                      onClick={() => setServingTemp('hot')}
                      className={`relative flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-2 z-10 cursor-pointer ${
                        servingTemp === 'hot'
                          ? 'text-white'
                          : 'bg-white border border-border-subtle text-on-surface-variant hover:border-brand-navy'
                      }`}
                    >
                      {servingTemp === 'hot' && (
                        <motion.div
                          layoutId="activeServingTempPill"
                          className="absolute inset-0 bg-brand-navy rounded-xl shadow-sm -z-10"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <Flame className="w-3.5 h-3.5" />
                      <span>Hot Filter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServingTemp('iced')}
                      className={`relative flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-2 z-10 cursor-pointer ${
                        servingTemp === 'iced'
                          ? 'text-white'
                          : 'bg-white border border-border-subtle text-on-surface-variant hover:border-brand-navy'
                      }`}
                    >
                      {servingTemp === 'iced' && (
                        <motion.div
                          layoutId="activeServingTempPill"
                          className="absolute inset-0 bg-brand-navy rounded-xl shadow-sm -z-10"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Ice Filter</span>
                    </button>
                  </div>
                </div>

                {/* Total Price & Stepper & Add to Cart */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                      Total Harga
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-3xl sm:text-4xl font-bold text-brand-navy">
                        {formatRupiah((product.cupPrice || product.basePrice) * quantity)}
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant">
                        / {quantity} Cangkir
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-border-subtle rounded-xl bg-surface-container-low p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 rounded-lg bg-white text-brand-navy font-bold flex items-center justify-center hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-mono font-bold text-sm text-brand-navy">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 rounded-lg bg-white text-brand-navy font-bold flex items-center justify-center hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAdded}
                      className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-white font-mono text-xs sm:text-sm font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-300" />
                          <span>Cup Berhasil Ditambahkan!</span>
                        </>
                      ) : (
                        <>
                          <Coffee className="w-4 h-4" />
                          <span>Pesan Cangkir Slowbar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Option to buy beans pouch below */}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-brand-navy block">Ingin Seduh Sendiri di Rumah?</span>
                    <span className="text-on-surface-variant text-[11px]">Tersedia kemasan biji kopi Retail Pouch (100g, 200g, 500g)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderMode('beans')}
                    className="px-4 py-2.5 rounded-xl bg-white border border-brand-navy text-brand-navy font-mono font-bold hover:bg-brand-navy hover:text-white transition-colors shrink-0 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Beli Biji Kopi (Pouch) →</span>
                  </button>
                </div>
              </div>
            ) : (
              /* MODE 2: BEANS POUCH */
              <div className="space-y-5 pt-2 border-t border-border-subtle">
                <div className="space-y-2.5">
                  <label className="block text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                    Pilih Ukuran Biji Kopi (Kemasan Retail Pouch)
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((size) => (
                      <button
                        key={size.weightLabel}
                        type="button"
                        onClick={() => setSelectedVariant(size)}
                        className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                          selectedVariant.weightGrams === size.weightGrams
                            ? 'bg-brand-navy text-white shadow-md'
                            : 'bg-white border border-border-subtle text-gray-700 hover:border-brand-navy'
                        }`}
                      >
                        {size.weightLabel} — {formatRupiah(size.price)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Price & Stepper & Add to Cart */}
                <div className="space-y-4 pt-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                      Total Harga
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-3xl sm:text-4xl font-bold text-brand-navy">
                        {formatRupiah(selectedVariant.price * quantity)}
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant">
                        / {quantity} {selectedVariant.weightLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stepper */}
                    <div className="flex items-center border border-border-subtle rounded-xl bg-surface-container-low p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 rounded-lg bg-white text-brand-navy font-bold flex items-center justify-center hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-mono font-bold text-sm text-brand-navy">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 rounded-lg bg-white text-brand-navy font-bold flex items-center justify-center hover:bg-gray-100 transition-colors shadow-xs cursor-pointer"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAdded}
                      className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-white font-mono text-xs sm:text-sm font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-300" />
                          <span>Biji Kopi Ditambahkan!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Beli Biji Kopi Pouch</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Option to switch to slowbar cup if available */}
                {product.cupPrice && (
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-brand-navy block">Tersedia Seduhan Cangkir di Slowbar</span>
                      <span className="text-on-surface-variant text-[11px]">Nikmati seduhan presisi oleh barista di Slowbar Malang ({formatRupiah(product.cupPrice)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrderMode('cup')}
                      className="px-4 py-2.5 rounded-xl bg-white border border-brand-navy text-brand-navy font-mono font-bold hover:bg-brand-navy hover:text-white transition-colors shrink-0 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Pesan Per Cangkir →</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TRANSPARENCY ACCORDIONS SECTION                                        */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-8 border-t border-border-subtle">
          <span className="font-mono text-xs text-gray-400 uppercase tracking-widest font-bold block">
            TRANSPARENCY &amp; SOURCING
          </span>

          {/* Accordion 1: Green Information */}
          <div className="border border-border-subtle rounded-2xl bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setOpenGreenInfo(!openGreenInfo)}
              className="w-full p-5 flex items-center justify-between font-editorial text-base font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span>Informasi Green Beans Mentah</span>
              {openGreenInfo ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openGreenInfo && (
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-border-subtle/50">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between items-center font-mono text-xs">
                  <span className="text-on-surface-variant">Landed Cost per 1 kg of Green Coffee</span>
                  <span className="font-bold text-brand-navy">{formatRupiah(landedGreenCost)}</span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-sans">
                  Landed cost adalah biaya green coffee mentah per kilogram termasuk ongkir kurir origin sebelum disangrai dan dikemas.
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
              <div className="px-5 pb-5 pt-1 space-y-3 border-t border-border-subtle/50">
                <p className="text-xs text-on-surface-variant font-sans">
                  <strong>HPP (Harga Pokok Produksi)</strong> mencakup green bean disesuaikan dengan 20% susut bobot roasting, ditambah Rp 10.000 listrik/gas per 1 kg.
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">HPP Sangrai (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(hppPerKg)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">Kemasan Valve Pouch &amp; Label (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(packagingPerKg)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">Gross Profit Roastery (1 kg)</span>
                    <span className="font-bold text-brand-teal-dark">{formatRupiah(Math.max(20000, grossProfit1kg))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Origin & Sourcing */}
          <div className="border border-border-subtle rounded-2xl bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setOpenOrigin(!openOrigin)}
              className="w-full p-5 flex items-center justify-between font-editorial text-base font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span>Terroir &amp; Karakteristik Origin</span>
              {openOrigin ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openOrigin && (
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-border-subtle/50 text-xs text-on-surface-variant leading-relaxed">
                <p>{product.description}</p>
                <p className="font-mono text-[11px] text-brand-navy font-semibold">
                  Terroir: {product.region} • Altitude: {product.altitude}
                </p>
              </div>
            )}
          </div>

          {/* Accordion 4: Farm Story */}
          <div className="border border-border-subtle rounded-2xl bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setOpenStory(!openStory)}
              className="w-full p-5 flex items-center justify-between font-editorial text-base font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span>Cerita Petani &amp; Roastery</span>
              {openStory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openStory && (
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-border-subtle/50 text-xs text-on-surface-variant leading-relaxed">
                <p>{product.story}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM ACTION BAR                                           */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-40 bg-white/95 backdrop-blur-md border-t border-border-subtle p-3.5 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-mono text-on-surface-variant uppercase block">Total</span>
          <div className="font-mono font-bold text-base text-brand-navy truncate">
            {formatRupiah(currentPrice * quantity)}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdded}
          className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-white font-mono text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Ditambahkan!</span>
            </>
          ) : (
            <>
              <span>+ Keranjang ({orderMode === 'cup' ? 'Cup' : selectedVariant.weightLabel})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
