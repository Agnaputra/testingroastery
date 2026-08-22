'use client';

import React, { useState, Suspense } from 'react';
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
  Info,
} from 'lucide-react';
import {
  PRODUCTS,
  getProductBySlug,
  ProductVariant,
  formatRupiah,
} from '../../../lib/data';
import { useCartStore } from '../../../lib/store/useCartStore';

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
        name: `${product.slowbarAlias || product.name} (Slowbar Cup - ${servingTemp === 'hot' ? 'Hot' : 'Iced'})`,
        slug: product.slug,
        imageUrl: product.imageUrl,
        weightGrams: 1,
        weightLabel: '1 Cup',
        grind: 'whole',
        grindLabel: `Manual Brew (${servingTemp.toUpperCase()})`,
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
    <div className="w-full bg-surface-white text-on-surface min-h-screen py-10 px-4 sm:px-10 font-sans">
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
          <span className="capitalize">{product.categoryLabel || product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-brand-navy font-semibold truncate max-w-xs">{cleanName}</span>
        </div>

        {/* ========================================================================= */}
        {/* 2. 2-COLUMN MAIN PRODUCT SECTION                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Visual Mockup */}
          <div className="lg:col-span-5 bg-surface-container-low rounded-3xl p-8 sm:p-12 border border-border-subtle flex items-center justify-center aspect-[3/4] relative shadow-sm group">
            <div className="w-full h-full relative flex items-center justify-center">
              <img
                src={displayImg}
                alt={product.name}
                className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105 filter drop-shadow-md"
              />
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="lg:col-span-7 space-y-7">
            {/* Title & Metadata Hierarchy */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1 rounded-full bg-brand-maroon text-white font-bold text-[10px] uppercase tracking-wider">
                  {product.series}
                </span>
                {product.slowbarAlias && (
                  <span className="px-3 py-1 rounded-full bg-brand-pill text-brand-navy font-bold text-[10px] uppercase tracking-wider border border-border-subtle">
                    Slowbar Alias: {product.slowbarAlias}
                  </span>
                )}
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

            {/* ORDER TYPE TOGGLE (Slowbar Cup vs Beans Pouch) */}
            {product.cupPrice && (
              <div className="space-y-2">
                <span className="block text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                  Format Pesanan
                </span>
                <div className="grid grid-cols-2 gap-2 max-w-lg p-1.5 bg-surface-container-low rounded-2xl border border-border-subtle relative">
                  <button
                    type="button"
                    onClick={() => setOrderMode('cup')}
                    className={`relative py-3 px-4 rounded-xl text-xs transition-colors duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 z-10 ${
                      orderMode === 'cup'
                        ? 'text-white font-bold'
                        : 'text-on-surface-variant hover:text-brand-navy font-medium'
                    }`}
                  >
                    {orderMode === 'cup' && (
                      <motion.div
                        layoutId="activeOrderModePill"
                        className="absolute inset-0 bg-brand-navy rounded-xl shadow-md -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span>☕ Seduhan Cangkir</span>
                    <span className="font-mono text-[11px] opacity-90">{formatRupiah(product.cupPrice)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderMode('beans')}
                    className={`relative py-3 px-4 rounded-xl text-xs transition-colors duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 z-10 ${
                      orderMode === 'beans'
                        ? 'text-white font-bold'
                        : 'text-on-surface-variant hover:text-brand-navy font-medium'
                    }`}
                  >
                    {orderMode === 'beans' && (
                      <motion.div
                        layoutId="activeOrderModePill"
                        className="absolute inset-0 bg-brand-navy rounded-xl shadow-md -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span>🛍️ Biji Kopi (Pouch)</span>
                    <span className="font-mono text-[11px] opacity-90">Mulai {formatRupiah(product.basePrice)}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT TRANSITION */}
            <AnimatePresence mode="wait">
              {orderMode === 'cup' && product.cupPrice ? (
                /* MODE 1: SLOWBAR CUP (Tanpa Gramasi Biji Kopi) */
                <motion.div
                  key="slowbar-cup-mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 p-5 rounded-2xl bg-brand-pill/60 border border-border-subtle"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-brand-navy font-bold uppercase tracking-wider">Format Penyajian:</span>
                    <span className="px-3 py-1 rounded-full bg-brand-maroon text-white font-bold text-[10px]">
                      1 Cangkir (Single Cup)
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-on-surface-variant uppercase font-semibold block">
                      Pilihan Suhu Seduhan Barista:
                    </span>
                    <div className="flex gap-2.5 relative">
                      <button
                        type="button"
                        onClick={() => setServingTemp('hot')}
                        className={`relative flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-2 z-10 ${
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
                        <span>🔥 Hot (V60 Seduh Panas)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setServingTemp('iced')}
                        className={`relative flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-2 z-10 ${
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
                        <span>🧊 Iced (Japanese Drip Dingin)</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* MODE 2: BIJI KOPI KEMASAN POUCH (Dengan Pilihan Gramasi) */
                <motion.div
                  key="beans-pouch-mode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2.5"
                >
                  <label className="block text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                    Pilih Ukuran Biji Kopi (Kemasan Retail Pouch)
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((size) => (
                      <button
                        key={size.weightLabel}
                        type="button"
                        onClick={() => setSelectedVariant(size)}
                        className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                          selectedVariant.weightGrams === size.weightGrams
                            ? 'bg-brand-navy text-white shadow-md'
                            : 'bg-white border border-border-subtle text-gray-700 hover:border-brand-navy'
                        }`}
                      >
                        {size.weightLabel} — {formatRupiah(size.price)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price & Quantity & Add to Cart Section */}
            <div className="pt-4 border-t border-border-subtle space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono text-on-surface-variant uppercase font-bold tracking-wider">
                  Total Harga
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-brand-navy">
                    {formatRupiah(currentPrice * quantity)}
                  </span>
                  <span className="text-xs font-mono text-on-surface-variant">
                    / {quantity} {orderMode === 'cup' ? 'Cup' : selectedVariant.weightLabel}
                  </span>
                </div>
              </div>

              {/* Quantity & CTA Row */}
              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-border-subtle rounded-xl bg-surface-container-low p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg bg-white text-brand-navy font-bold flex items-center justify-center hover:bg-gray-100 transition-colors shadow-xs"
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
                    className="w-9 h-9 rounded-lg bg-white text-brand-navy font-bold flex items-center justify-center hover:bg-gray-100 transition-colors shadow-xs"
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
                      <span>{orderMode === 'cup' ? 'Cup Berhasil Ditambahkan!' : 'Biji Kopi Ditambahkan!'}</span>
                    </>
                  ) : (
                    <span>{orderMode === 'cup' ? 'Pesan Cangkir Slowbar' : 'Beli Biji Kopi Pouch'}</span>
                  )}
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* AT A GLANCE (Exact Screenshot 2 Layout)                                    */}
            {/* ========================================================================= */}
            <div className="space-y-4 pt-6 border-t border-border-subtle">
              <span className="font-mono text-xs text-gray-400 uppercase tracking-widest font-bold block">
                AT A GLANCE
              </span>

              {/* Tasting Notes Box */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-border-subtle space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                  TASTING NOTES
                </span>
                <p className="font-editorial text-lg sm:text-xl font-bold text-on-surface">
                  {product.tastingNotes.join(', ')}
                </p>
              </div>

              {/* Freshness Box */}
              <div className="p-5 rounded-2xl bg-surface-container-low border border-border-subtle space-y-2">
                <span className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                  FRESHNESS
                </span>
                <div className="w-full h-2 rounded-full bg-gray-200 relative overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-status-success to-teal-400 w-full rounded-full"></div>
                  <div className="absolute top-0 left-[15%] w-2 h-2 rounded-full bg-white border border-gray-400 shadow-sm"></div>
                </div>
                <p className="text-xs font-semibold text-on-surface">
                  Roasted less than 7 days ago
                </p>
              </div>

              {/* Roast Rest Advisory Note (Exact Screenshot 2 Text) */}
              <div className="text-xs text-on-surface-variant space-y-3 leading-relaxed font-sans pt-1">
                <p>
                  Our beans are at their best after a proper rest — at least 2 weeks for espresso and 3 weeks for filter. If the cup still tastes gassy, give it a little more time; some of our beans need up to 2 months to fully open up.{' '}
                  <strong className="text-primary">
                    We don&#39;t recommend brewing freshly roasted coffee, but the choice is always yours.
                  </strong>
                </p>
                <p className="text-gray-500 text-[11px]">
                  Please note: we cannot check the roast date of each coffee individually — our inventory moves quite fast, so at the time of purchase we can&#39;t be sure which batch your order will come from. Rest assured, it&#39;s always freshly roasted and will still need to be rested no matter what.
                </p>
              </div>

              {/* Metadata 3x2 Grid (Exact Screenshot 2) */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">FARM</span>
                  <p className="text-xs font-bold text-on-surface">{product.region.split(',')[0] || 'Budug Asu'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">REGION</span>
                  <p className="text-xs font-bold text-on-surface">{product.origin.split(',')[0] || 'Arjuna'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">PRODUCER</span>
                  <p className="text-xs font-bold text-on-surface">52 Roastery Partner</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">PROCESS</span>
                  <p className="text-xs font-bold text-on-surface">{product.process}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">ALTITUDE</span>
                  <p className="text-xs font-bold text-on-surface">{product.altitude}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-border-subtle space-y-1">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold block">VARIETALS</span>
                  <p className="text-xs font-bold text-on-surface">{product.varietal}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TRANSPARENCY ACCORDIONS SECTION (Exact Screenshot 4)                   */}
        {/* ========================================================================= */}
        <section className="space-y-4 pt-8 border-t border-border-subtle">
          <span className="font-mono text-xs text-gray-400 uppercase tracking-widest font-bold block">
            TRANSPARENCY
          </span>

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
                  <span className="text-on-surface-variant">Landed Cost per 1 kg of Green Coffee</span>
                  <span className="font-bold text-on-surface">{formatRupiah(landedGreenCost)}</span>
                </div>
                <p className="text-[11px] text-gray-500 font-sans">
                  Landed cost is the raw green coffee cost per kilogram, including all shipping charges, before roasting and packaging.
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
              <div className="px-5 pb-5 pt-1 space-y-3 border-t border-border-subtle/50">
                <p className="text-xs text-on-surface-variant font-sans">
                  <strong>HPP (Harga Pokok Produksi)</strong> is the production cost: green coffee adjusted for 20% roast weight loss, plus Rp. 10.000 electricity for 1 kg.
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">HPP (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(hppPerKg)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">Packaging (1 kg)</span>
                    <span className="font-bold text-on-surface">{formatRupiah(packagingPerKg)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-border-subtle flex justify-between">
                    <span className="text-on-surface-variant">Gross Profit (1 kg)</span>
                    <span className="font-bold text-primary">{formatRupiah(Math.max(20000, grossProfit1kg))}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 italic">
                  Slight rounding discrepancy may occur.
                </p>
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
              <span>Origin &amp; Sourcing</span>
              {openOrigin ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            {openOrigin && (
              <div className="px-5 pb-5 pt-1 space-y-2 border-t border-border-subtle/50 text-xs text-on-surface-variant leading-relaxed">
                <p>{product.description}</p>
                <p className="font-mono text-[11px] text-gray-500">
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
              <span>Farm Story</span>
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
    </div>
  );
}
