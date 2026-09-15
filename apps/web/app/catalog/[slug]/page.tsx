'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
  getProductDisplayImage,
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

  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const initialMode = modeParam === 'cup' && product?.cupPrice ? 'cup' : 'beans';
  const [orderMode, setOrderMode] = useState<'cup' | 'beans'>(initialMode);
  const [servingTemp, setServingTemp] = useState<'hot' | 'iced'>('hot');

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product?.variants[0] || { price: product?.basePrice || 0, weightLabel: '100g', weightGrams: 100, inStock: true }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  // Accordion states
  const [openGreenInfo, setOpenGreenInfo] = useState(true);
  const [openPriceBreakdown, setOpenPriceBreakdown] = useState(true);
  const [openOrigin, setOpenOrigin] = useState(false);
  const [openStory, setOpenStory] = useState(false);

  const { addItem } = useCartStore();

  // Sensory Radar Metrics for this single origin / product
  const productSensory: FlavorMetrics = useMemo(() => {
    if (!product) {
      return { acidity: 0, sweetness: 0, body: 0, floral: 0, aftertaste: 0, balance: 0 };
    }
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

  if (!product) {
    notFound();
  }

  const displayImg = getProductDisplayImage(product);

  const handleAddToCart = () => {
    if (orderMode === 'cup') {
      addItem({
        productId: product.id,
        name: `${product.slowbarAlias || product.name} (${servingTemp === 'hot' ? 'Hot Filter' : 'Ice Filter'})`,
        slug: product.slug,
        imageUrl: displayImg,
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
        imageUrl: displayImg,
        weightGrams: selectedVariant.weightGrams,
        weightLabel: selectedVariant.weightLabel,
        grind: 'whole',
        grindLabel: 'Biji utuh',
        unitPrice: selectedVariant.price,
        quantity: quantity,
        series: product.series,
        tastingNotes: product.tastingNotes,
      });
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Calculated transparency figures
  const landedGreenCost = Math.round((product.basePrice * 0.58) / 1000) * 1000 || 169993;
  const hppPerKg = Math.round((landedGreenCost / 0.8) + 10000);
  const packagingPerKg = 10000;
  const price1kg = selectedVariant.weightGrams === 1000
    ? selectedVariant.price
    : Math.round(product.basePrice * 3.8);
  const grossProfit1kg = price1kg - hppPerKg - packagingPerKg;

  const currentPrice = orderMode === 'cup' ? (product.cupPrice || product.basePrice) : selectedVariant.price;
  const cleanName = product.name.replace(/\(.*?\)/g, '').trim();

  return (
    <div className="min-h-screen w-full bg-[#f7f7f4] pb-28 pt-[calc(76px+2rem)] font-sans text-on-surface sm:pb-20 sm:pt-[calc(76px+2.5rem)]">
      <div className="site-container space-y-12">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMB                                                             */}
        {/* ========================================================================= */}
        <div className="flex min-w-0 items-center gap-2 overflow-hidden font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
          <Link href="/catalog" className="shrink-0 transition-colors hover:text-brand-maroon">
            Koleksi kopi
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/catalog?series=${encodeURIComponent(product.series)}`}
            className="hover:text-brand-navy transition-colors"
          >
            {product.series}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hidden capitalize sm:inline">
            {orderMode === 'cup'
              ? 'Menu slowbar'
              : product.category === 'espresso'
              ? 'Espresso Based'
              : 'Filter Based'}
          </span>
          <ChevronRight className="hidden h-3.5 w-3.5 sm:block" />
          <span className="truncate text-brand-charcoal">{cleanName}</span>
        </div>

        {/* ========================================================================= */}
        {/* 2. 2-COLUMN MAIN PRODUCT SECTION                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,.92fr)] lg:gap-x-16 lg:gap-y-10">
          {/* LEFT: Large product visual */}
          <div>
            <div className="group relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[#ecece8] p-8 sm:p-12">
              <div className="w-full h-full relative flex items-center justify-center">
                <Image
                  src={displayImg}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 36vw, 80vw"
                  className="object-contain p-[4%] mix-blend-multiply transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.035]"
                />
              </div>
            </div>

          </div>

          {/* RIGHT: Product Details & Purchase Form (7 Cols) */}
          <div className="space-y-8 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
            {/* Title & Metadata Hierarchy */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em]">
                <span className="text-brand-maroon">
                  {product.series}
                </span>
                <span className="text-on-surface-variant">
                  {orderMode === 'cup'
                    ? 'BEVERAGES (SLOWBAR)'
                    : product.category === 'espresso'
                    ? 'ESPRESSO'
                    : 'FILTER'}
                </span>
                {product.slowbarAlias && (
                  <span className="text-on-surface-variant">
                    Slowbar: {product.slowbarAlias}
                  </span>
                )}
                <span className="text-on-surface-variant">
                  {product.roastLevel} roast
                </span>
              </div>

              {/* Clean Main Headline */}
              <h1 className="max-w-[15ch] font-headline text-[clamp(2.6rem,4.5vw,4.75rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-brand-charcoal">
                {orderMode === 'cup' && product.slowbarAlias
                  ? product.slowbarAlias
                  : cleanName}
              </h1>

              {/* Secondary Clean Subtitle */}
              <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
                {product.origin} <span className="mx-1.5 text-border-subtle">•</span> {product.process}
              </p>
            </div>

            {/* ========================================================================= */}
            {/* AT A GLANCE (Compact & Lean Hierarchy)                                    */}
            {/* ========================================================================= */}
            <div className="space-y-0 border-t border-black/15">
              {/* Tasting Notes Box */}
              <div className="space-y-2 border-b border-black/15 py-5">
                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                  CATATAN RASA
                </span>
                <p className="font-headline text-xl font-semibold leading-snug tracking-tight text-brand-charcoal sm:text-2xl">
                  {product.tastingNotes.join(', ')}
                </p>
              </div>

              {/* Freshness Box */}
              <div className="space-y-2 border-b border-black/15 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                    KESEGARAN &amp; TANGGAL SANGRAI
                  </span>
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-teal-dark">
                    &lt; 7 Hari Fresh Sangrai
                  </span>
                </div>
                <p className="text-sm font-semibold text-brand-charcoal">
                  Disangrai fresh kurang dari 7 hari yang lalu di Roastery Malang
                </p>
                <p className="text-[10px] text-on-surface-variant leading-normal">
                  Puncak rasa optimal: resting min. 2 minggu (espresso) &amp; 3 minggu (filter).
                </p>
              </div>

              {/* Metadata 3x2 Grid */}
              <div className="grid grid-cols-2 border-b border-black/15 sm:grid-cols-3">
                <div className="space-y-1 border-b border-r border-black/10 py-4 pr-3 sm:border-b-0">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">KEBUN</span>
                  <p className="break-words text-[11px] font-bold leading-4 text-on-surface">{product.region.split(',')[0] || 'Gunung Argopuro'}</p>
                </div>
                <div className="space-y-1 border-b border-black/10 px-3 py-4 sm:border-b-0 sm:border-r">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">DAERAH</span>
                  <p className="break-words text-[11px] font-bold leading-4 text-on-surface">{product.origin.split(',')[0] || 'East Java'}</p>
                </div>
                <div className="space-y-1 border-b border-r border-black/10 py-4 pr-3 sm:border-b-0 sm:border-r-0 sm:px-3">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">PRODUSEN</span>
                  <p className="break-words text-[11px] font-bold leading-4 text-on-surface">Mitra 52 Coffee &amp; Roastery</p>
                </div>
                <div className="space-y-1 border-black/10 px-3 py-4 sm:border-l sm:pl-0 sm:pr-3">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">PROSES</span>
                  <p className="break-words text-[11px] font-bold leading-4 text-on-surface">{product.process}</p>
                </div>
                <div className="space-y-1 border-l border-black/10 px-3 py-4 sm:border-r">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">KETINGGIAN</span>
                  <p className="break-words text-[11px] font-bold leading-4 text-on-surface">{product.altitude}</p>
                </div>
                <div className="space-y-1 border-l border-black/10 py-4 pl-3">
                  <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">VARIETAS</span>
                  <p className="break-words text-[11px] font-bold leading-4 text-on-surface">{product.varietal}</p>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* ONE-CLICK BREW GUIDE (HANYA MUNCUL DI FILTER & ESPRESSO ROAST PROFILE)   */}
            {/* ========================================================================= */}
            {orderMode !== 'cup' && (
              <div className="flex flex-col items-start justify-between gap-4 border-b border-black/15 py-5 sm:flex-row sm:items-center">
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
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-brand-navy px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-navy-light"
                >
                  <span>Buka panduan seduh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PURCHASE SECTION (SLOWBAR CUP vs BEANS POUCH)                             */}
            {/* ========================================================================= */}
            {orderMode === 'cup' && product.cupPrice ? (
              /* MODE 1: SLOWBAR CUP */
              <div className="space-y-5 border-t border-black/15 pt-6">
                <div className="space-y-3">
                  <span className="text-[11px] font-mono text-on-surface-variant uppercase font-semibold block">
                    Pilihan Seduhan Slowbar:
                  </span>
                  <div className="flex gap-2.5 relative">
                    <button
                      type="button"
                      onClick={() => setServingTemp('hot')}
                    className={`relative z-10 flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 border px-4 py-2.5 font-mono text-xs font-bold transition-colors duration-200 ${
                        servingTemp === 'hot'
                          ? 'text-white'
                          : 'border-black/15 bg-transparent text-on-surface-variant hover:border-brand-navy'
                      }`}
                    >
                      {servingTemp === 'hot' && (
                        <motion.div
                          layoutId="activeServingTempPill"
                          className="absolute inset-0 -z-10 bg-brand-navy"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <Flame className="w-3.5 h-3.5" />
                      <span>Hot Filter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServingTemp('iced')}
                    className={`relative z-10 flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 border px-4 py-2.5 font-mono text-xs font-bold transition-colors duration-200 ${
                        servingTemp === 'iced'
                          ? 'text-white'
                          : 'border-black/15 bg-transparent text-on-surface-variant hover:border-brand-navy'
                      }`}
                    >
                      {servingTemp === 'iced' && (
                        <motion.div
                          layoutId="activeServingTempPill"
                          className="absolute inset-0 -z-10 bg-brand-navy"
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
                    <div className="flex shrink-0 items-center border border-black/15 bg-transparent">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-11 w-11 cursor-pointer items-center justify-center font-bold text-brand-navy transition-colors hover:bg-black/5"
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
                        className="flex h-11 w-11 cursor-pointer items-center justify-center font-bold text-brand-navy transition-colors hover:bg-black/5"
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
                      className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 bg-brand-navy px-6 py-3.5 font-mono text-xs font-bold text-white transition-colors hover:bg-brand-navy-light sm:text-sm"
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
                <div className="flex flex-col items-start justify-between gap-3 border-t border-black/15 pt-5 text-xs sm:flex-row sm:items-center">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-brand-navy block">Ingin Seduh Sendiri di Rumah?</span>
                    <span className="text-on-surface-variant text-[11px]">Tersedia kemasan biji kopi Retail Pouch (100g, 200g, 500g)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderMode('beans')}
                    className="flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 border border-brand-navy px-4 py-2.5 font-mono text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Beli Biji Kopi (Pouch) →</span>
                  </button>
                </div>
              </div>
            ) : (
              /* MODE 2: BEANS POUCH */
              <div className="space-y-6 border-t border-black/15 pt-6">
                <div className="space-y-2.5">
                  <label className="block text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                    Pilih ukuran
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((size) => (
                      <button
                        key={size.weightLabel}
                        type="button"
                        onClick={() => setSelectedVariant(size)}
                        className={`min-h-11 cursor-pointer border px-5 py-2.5 font-mono text-xs font-bold transition-colors ${
                          selectedVariant.weightGrams === size.weightGrams
                            ? 'border-brand-navy bg-brand-navy text-white'
                            : 'border-black/15 bg-transparent text-gray-700 hover:border-brand-navy'
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
                    <div className="flex shrink-0 items-center border border-black/15 bg-transparent">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-11 w-11 cursor-pointer items-center justify-center font-bold text-brand-navy transition-colors hover:bg-black/5"
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
                        className="flex h-11 w-11 cursor-pointer items-center justify-center font-bold text-brand-navy transition-colors hover:bg-black/5"
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
                      className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 bg-brand-navy px-6 py-3.5 font-mono text-xs font-bold text-white transition-colors hover:bg-brand-navy-light sm:text-sm"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-300" />
                          <span>Biji Kopi Ditambahkan!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Tambah ke keranjang</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Option to switch to slowbar cup if available */}
                {product.cupPrice && (
                  <div className="flex flex-col items-start justify-between gap-3 border-t border-black/15 pt-5 text-xs sm:flex-row sm:items-center">
                    <div className="space-y-0.5">
                      <span className="font-mono font-bold text-brand-navy block">Tersedia Seduhan Cangkir di Slowbar</span>
                      <span className="text-on-surface-variant text-[11px]">Nikmati seduhan presisi oleh barista di Slowbar Malang ({formatRupiah(product.cupPrice)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrderMode('cup')}
                      className="flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 border border-brand-navy px-4 py-2.5 font-mono text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Pesan Per Cangkir →</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        <section className="space-y-7 border-t border-black/15 pt-8 lg:col-start-1 lg:row-start-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-maroon" />
              <h2 className="font-headline text-2xl font-semibold tracking-tight text-brand-charcoal">
                Profil Sensorik SCA
              </h2>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-on-surface-variant">
              Peta rasa dari sesi cupping untuk membantu Anda membayangkan karakter kopi sebelum menyeduh.
            </p>
            <span className="mt-5 block font-mono text-[9px] font-semibold uppercase tracking-[0.13em] text-brand-maroon">
              Terverifikasi cupping
            </span>
          </div>

          <div className="max-w-2xl">
            <FlavorRadarChart
              metrics={productSensory}
              size={300}
              color={product.series === 'Grand Reserve' ? 'amber' : 'maroon'}
              showLabels={true}
              showBars={true}
              surface="plain"
            />
          </div>
        </section>
        </div>

        {/* ========================================================================= */}
        {/* 3. TRANSPARENCY ACCORDIONS SECTION                                        */}
        {/* ========================================================================= */}
        <section className="border-t border-black/15 pt-10">
          <span className="mb-6 block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
            Asal &amp; transparansi harga
          </span>

          {/* Accordion 1: Green Information */}
          <div className="border-b border-black/15">
            <button
              type="button"
              onClick={() => setOpenGreenInfo(!openGreenInfo)}
              className="flex w-full items-center justify-between py-6 text-left font-headline text-lg font-semibold text-on-surface transition-colors hover:text-brand-maroon"
            >
              <span>Informasi Green Beans Mentah</span>
              {openGreenInfo ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openGreenInfo && (
              <div className="space-y-3 pb-6">
                <div className="flex items-center justify-between border-y border-black/10 py-4 font-mono text-xs">
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
          <div className="border-b border-black/15">
            <button
              type="button"
              onClick={() => setOpenPriceBreakdown(!openPriceBreakdown)}
              className="flex w-full items-center justify-between py-6 text-left font-headline text-lg font-semibold text-on-surface transition-colors hover:text-brand-maroon"
            >
              <span>Rincian Struktur Harga &amp; HPP Sangrai</span>
              {openPriceBreakdown ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openPriceBreakdown && (
              <div className="space-y-4 pb-6">
                <p className="text-xs text-on-surface-variant font-sans">
                  <strong>HPP (Harga Pokok Produksi)</strong> mencakup green bean disesuaikan dengan 20% susut bobot roasting, ditambah Rp 10.000 listrik/gas per 1 kg.
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between border-b border-black/10 py-3">
                    <span className="text-on-surface-variant">HPP Sangrai (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(hppPerKg)}</span>
                  </div>
                  <div className="flex justify-between border-b border-black/10 py-3">
                    <span className="text-on-surface-variant">Kemasan Valve Pouch &amp; Label (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(packagingPerKg)}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-on-surface-variant">Gross Profit Roastery (1 kg)</span>
                    <span className="font-bold text-brand-teal-dark">{formatRupiah(Math.max(20000, grossProfit1kg))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 3: Origin & Sourcing */}
          <div className="border-b border-black/15">
            <button
              type="button"
              onClick={() => setOpenOrigin(!openOrigin)}
              className="flex w-full items-center justify-between py-6 text-left font-headline text-lg font-semibold text-on-surface transition-colors hover:text-brand-maroon"
            >
              <span>Terroir &amp; Karakteristik Origin</span>
              {openOrigin ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openOrigin && (
              <div className="max-w-3xl space-y-2 pb-6 text-sm leading-7 text-on-surface-variant">
                <p>{product.description}</p>
                <p className="font-mono text-[11px] text-brand-navy font-semibold">
                  Terroir: {product.region} • Altitude: {product.altitude}
                </p>
              </div>
            )}
          </div>

          {/* Accordion 4: Farm Story */}
          <div className="border-b border-black/15">
            <button
              type="button"
              onClick={() => setOpenStory(!openStory)}
              className="flex w-full items-center justify-between py-6 text-left font-headline text-lg font-semibold text-on-surface transition-colors hover:text-brand-maroon"
            >
              <span>Cerita Petani &amp; Roastery</span>
              {openStory ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openStory && (
              <div className="max-w-3xl space-y-2 pb-6 text-sm leading-7 text-on-surface-variant">
                <p>{product.story}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM ACTION BAR                                           */}
      {/* ========================================================================= */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-black/10 bg-[#f7f7f4]/95 p-3.5 shadow-lg backdrop-blur-md sm:hidden">
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
          className="flex min-h-12 flex-1 items-center justify-center gap-1.5 bg-brand-navy px-4 py-3 font-mono text-xs font-bold text-white transition-colors hover:bg-brand-navy-light"
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
