'use client';

import React, { useRef, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Plus,
  Minus,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Coffee,
  Flame,
  Droplets,
  ArrowRight,
  ShoppingBag,
  Info,
  ExternalLink,
} from 'lucide-react';
import {
  getProductBySlug,
  ProductVariant,
  formatRupiah,
  getProductDisplayImage,
  getCustomerProductName,
  TOKOPEDIA_URL,
} from '../lib/data';
import { useCartStore } from '../lib/store/useCartStore';
import { FlavorRadarChart, FlavorMetrics } from './flavor-radar-chart';

interface CatalogProductDetailProps {
  slug: string;
}

export default function CatalogProductDetail({ slug }: CatalogProductDetailProps) {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs font-mono text-gray-400">Memuat detail produk...</div>}>
      <ProductDetailContent slug={slug} />
    </Suspense>
  );
}

function ProductDetailContent({ slug }: CatalogProductDetailProps) {
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
  const [showTastingInfo, setShowTastingInfo] = useState(false);
  const [showSensoryInfo, setShowSensoryInfo] = useState(false);
  const tastingInfoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Accordion states
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

  if (!product) return null;

  const displayImg = getProductDisplayImage(product);
  const cleanName = getCustomerProductName(product);
  const currentPrice = orderMode === 'cup' ? (product.cupPrice || product.basePrice) : selectedVariant.price;

  const handleAddToCart = () => {
    if (orderMode === 'cup') {
      addItem({
        productId: product.id,
        name: `${cleanName} (${servingTemp === 'hot' ? 'Hot Filter' : 'Ice Filter'})`,
        slug: product.slug,
        imageUrl: displayImg,
        weightGrams: 1,
        weightLabel: '1 sajian',
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
        name: cleanName,
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

  return (
    <div className="min-h-screen w-full bg-background pb-28 pt-[calc(76px+2rem)] font-sans text-on-surface sm:pb-20 sm:pt-[calc(76px+2.5rem)]">
      <div className="site-container space-y-12">
        {/* 1. BREADCRUMB */}
        <div className="flex min-w-0 items-center gap-2 overflow-hidden font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
          <Link href="/catalog" className="shrink-0 transition-colors hover:text-brand-maroon">
            Catalog
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
              ? 'Menu Slowbar'
              : product.category === 'espresso'
              ? 'Espresso Roast'
              : 'Filter Roast'}
          </span>
          <ChevronRight className="hidden h-3.5 w-3.5 sm:block" />
          <span className="truncate text-brand-charcoal">{cleanName}</span>
        </div>

        {/* 2. 2-COLUMN MAIN PRODUCT SECTION */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(390px,.92fr)] lg:gap-x-16 lg:gap-y-10">
          {/* LEFT: Large product visual */}
          <div className="space-y-8">
            <div className="group relative flex aspect-[4/5] items-center justify-center overflow-hidden border border-border-subtle bg-white p-8 sm:p-12 rounded-md shadow-xs">
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

            {/* SENSORY SCA RADAR */}
            {product.category !== 'glassware' && product.category !== 'machine' && (
              <section className="space-y-6 border-t border-border-subtle pt-8">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-maroon" />
                    <div className="relative flex items-center gap-2">
                      <h2 className="font-headline text-xl font-semibold tracking-tight text-brand-charcoal">Profil Sensorik SCA</h2>
                      <button
                        type="button"
                        aria-label="Apa arti profil sensorik?"
                        aria-expanded={showSensoryInfo}
                        aria-controls="sensory-help"
                        onClick={() => setShowSensoryInfo((open) => !open)}
                        className="inline-flex min-h-8 min-w-8 items-center justify-center text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon"
                      >
                        <Info aria-hidden="true" className="h-4 w-4" />
                      </button>
                      {showSensoryInfo && (
                        <p
                          id="sensory-help"
                          role="tooltip"
                          className="absolute left-0 top-full z-20 mt-2 max-w-xs border border-border-subtle bg-white p-3 text-xs font-normal leading-5 text-on-surface shadow-floating"
                        >
                          Sensory memetakan intensitas acidity, sweetness, body, floral, aftertaste, dan balance dari sesi cupping resmi 52 Coffee.
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                    Peta rasa dari sesi cupping untuk membantu Anda membayangkan karakter seduhan sebelum memilih.
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <FlavorRadarChart
                    metrics={productSensory}
                    size={280}
                    color={product.series === 'Grand Reserve' ? 'amber' : 'maroon'}
                    showLabels={true}
                    showBars={true}
                    surface="plain"
                  />
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="space-y-8 lg:sticky lg:top-28 lg:col-start-2 lg:self-start">
            {/* Title & Series only */}
            <div className="space-y-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-maroon block">
                {product.series}
              </span>

              {/* Clean Main Headline */}
              <h1 className="font-headline text-[clamp(2.2rem,4vw,3.8rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-brand-charcoal">
                {cleanName}
              </h1>
            </div>

            {/* AT A GLANCE */}
            <div className="space-y-0 border-t border-black/15">
              {/* Tasting Notes Box */}
              {product.tastingNotes && product.tastingNotes.length > 0 && (
                <div className="space-y-2 border-b border-black/15 py-4">
                  <div className="relative flex items-center gap-2">
                    <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                      TASTING NOTES
                    </span>
                    <button
                      type="button"
                      aria-label="Apa arti tasting notes?"
                      aria-expanded={showTastingInfo}
                      aria-controls="tasting-notes-help"
                      onClick={() => setShowTastingInfo((open) => !open)}
                      onMouseEnter={() => {
                        if (tastingInfoTimer.current) clearTimeout(tastingInfoTimer.current);
                        tastingInfoTimer.current = setTimeout(() => setShowTastingInfo(true), 450);
                      }}
                      onMouseLeave={() => {
                        if (tastingInfoTimer.current) clearTimeout(tastingInfoTimer.current);
                      }}
                      onFocus={() => setShowTastingInfo(true)}
                      className="inline-flex min-h-8 min-w-8 items-center justify-center text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon"
                    >
                      <Info aria-hidden="true" className="h-4 w-4" />
                    </button>
                    {showTastingInfo && (
                      <p
                        id="tasting-notes-help"
                        role="tooltip"
                        className="absolute left-0 top-full z-20 mt-2 max-w-xs border border-border-subtle bg-white p-3 text-xs font-normal normal-case leading-5 tracking-normal text-on-surface shadow-floating"
                      >
                        Tasting notes adalah gambaran pengalaman rasa dan aroma saat kopi diseduh, bukan bahan perisa yang ditambahkan.
                      </p>
                    )}
                  </div>
                  <p className="font-headline text-lg font-semibold leading-snug tracking-tight text-brand-charcoal sm:text-xl">
                    {product.tastingNotes.slice(0, 4).join(' · ')}
                  </p>
                </div>
              )}

              {/* Freshness Box */}
              <div className="space-y-1.5 border-b border-black/15 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider block">
                    KESEGARAN &amp; TANGGAL SANGRAI
                  </span>
                  <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-brand-teal-dark">
                    Semua kopi fresh roast
                  </span>
                </div>
                <p className="text-sm font-semibold text-brand-charcoal">
                  Disangrai di Malang
                </p>
                <p className="text-[11px] text-on-surface-variant leading-normal">
                  Puncak rasa optimal: resting min. 2 minggu (espresso) &amp; 3 minggu (filter).
                </p>
              </div>

              {/* Metadata 4 items: Kebun, Daerah, Proses, Ketinggian (Tanpa Produsen dan Tanpa Varietas) */}
              {product.category !== 'glassware' && product.category !== 'machine' && (
                <div className="grid grid-cols-2 border-b border-black/15">
                  <div className="space-y-1 border-b border-r border-black/10 py-3 pr-3">
                    <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">KEBUN</span>
                    <p className="break-words text-[11px] font-bold leading-4 text-on-surface">
                      {product.region.split(',')[0] || 'Gunung Argopuro'}
                    </p>
                  </div>
                  <div className="space-y-1 border-b border-black/10 px-3 py-3">
                    <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">DAERAH</span>
                    <p className="break-words text-[11px] font-bold leading-4 text-on-surface">
                      {product.origin.split(',')[0] || 'East Java'}
                    </p>
                  </div>
                  <div className="space-y-1 border-r border-black/10 py-3 pr-3">
                    <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">PROSES</span>
                    <p className="break-words text-[11px] font-bold leading-4 text-on-surface">
                      {product.process}
                    </p>
                  </div>
                  <div className="space-y-1 border-black/10 px-3 py-3">
                    <span className="text-[8px] font-mono text-gray-400 uppercase font-bold block">KETINGGIAN</span>
                    <p className="break-words text-[11px] font-bold leading-4 text-on-surface">
                      {product.altitude}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ONE-CLICK BREW GUIDE (FOR COFFEE) */}
            {orderMode !== 'cup' && product.category !== 'glassware' && product.category !== 'machine' && (
              <div className="flex flex-col items-start justify-between gap-4 border-b border-black/15 py-4 sm:flex-row sm:items-center">
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
                  href={`/guide?bean=${encodeURIComponent(cleanName)}`}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-brand-navy px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-brand-navy-light"
                >
                  <span>Buka panduan seduh</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* PURCHASE SECTION */}
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
                          ? 'border-brand-navy bg-brand-navy text-white'
                          : 'border-black/15 bg-transparent text-on-surface-variant hover:border-brand-navy'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Hot Filter</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServingTemp('iced')}
                      className={`relative z-10 flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 border px-4 py-2.5 font-mono text-xs font-bold transition-colors duration-200 ${
                        servingTemp === 'iced'
                          ? 'border-brand-navy bg-brand-navy text-white'
                          : 'border-black/15 bg-transparent text-on-surface-variant hover:border-brand-navy'
                      }`}
                    >
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
                        / {quantity} sajian
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAdded}
                      className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 bg-brand-navy px-6 py-3.5 font-mono text-xs font-bold text-white transition-colors hover:bg-brand-navy-light sm:text-sm"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-300" />
                          <span>Sajian Ditambahkan!</span>
                        </>
                      ) : (
                        <>
                          <Coffee className="w-4 h-4" />
                          <span>Pesan Sajian Slowbar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Option to switch to beans */}
                <div className="flex flex-col items-start justify-between gap-3 border-t border-black/15 pt-5 text-xs sm:flex-row sm:items-center">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-brand-navy block">Ingin Seduh Sendiri di Rumah?</span>
                    <span className="text-on-surface-variant text-[11px]">Tersedia kemasan biji kopi Retail Pouch</span>
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
                {product.variants && product.variants.length > 0 && (
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
                )}

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

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAdded}
                      className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 bg-brand-navy px-6 py-3.5 font-mono text-xs font-bold text-white transition-colors hover:bg-brand-navy-light sm:text-sm"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-300" />
                          <span>Ditambahkan ke Keranjang!</span>
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
                      <span className="font-mono font-bold text-brand-navy block">Tersedia sebagai sajian Slowbar</span>
                      <span className="text-on-surface-variant text-[11px]">Hanya dapat dinikmati di lokasi, diseduh oleh barista di Slowbar Malang ({formatRupiah(product.cupPrice)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrderMode('cup')}
                      className="flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 border border-brand-navy px-4 py-2.5 font-mono text-xs font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Pilih Seduhan Slowbar →</span>
                    </button>
                  </div>
                )}

                {/* Prominent Tokopedia button */}
                <div className="pt-2">
                  <a
                    href={TOKOPEDIA_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-sm border border-[#03AC0E] bg-[#03AC0E]/10 px-5 py-3 font-mono text-xs font-bold text-[#03AC0E] transition-colors hover:bg-[#03AC0E] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03AC0E]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Detail Produk di Tokopedia</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. TERROIR & STORY ACCORDIONS */}
        <section className="border-t border-black/15 pt-10">
          <span className="mb-6 block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
            Informasi Terroir &amp; Cerita
          </span>

          {/* Accordion 1: Origin & Sourcing */}
          <div className="border-b border-black/15">
            <button
              type="button"
              onClick={() => setOpenOrigin(!openOrigin)}
              aria-expanded={openOrigin}
              className="flex w-full items-center justify-between py-5 text-left font-headline text-lg font-semibold text-on-surface transition-colors hover:text-brand-maroon"
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

          {/* Accordion 2: Farm Story */}
          <div className="border-b border-black/15">
            <button
              type="button"
              onClick={() => setOpenStory(!openStory)}
              aria-expanded={openStory}
              className="flex w-full items-center justify-between py-5 text-left font-headline text-lg font-semibold text-on-surface transition-colors hover:text-brand-maroon"
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

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-black/10 bg-background/95 p-3.5 shadow-lg backdrop-blur-md sm:hidden">
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
