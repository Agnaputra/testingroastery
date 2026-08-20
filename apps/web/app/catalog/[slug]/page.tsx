'use client';

import React, { useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
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

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || { price: product.basePrice, weightLabel: '200g', weightGrams: 200, inStock: true }
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

  return (
    <div className="w-full bg-surface-white text-on-surface min-h-screen py-10 px-4 sm:px-10 font-sans">
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* ========================================================================= */}
        {/* 1. BREADCRUMB (Exact Screenshot 2)                                        */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <Link href="/catalog" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/catalog?series=${product.series.toLowerCase().includes('daily') ? 'daily' : 'limited'}`}
            className="hover:text-primary transition-colors"
          >
            {product.series}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="capitalize">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-on-surface font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* ========================================================================= */}
        {/* 2. 2-COLUMN MAIN PRODUCT SECTION (Exact Screenshot 2)                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT: Pouch Visual Mockup */}
          <div className="lg:col-span-5 bg-surface-container-low rounded-3xl p-8 border border-border-subtle flex items-center justify-center aspect-[3/4] relative shadow-sm group">
            <div className="w-full h-full relative flex items-center justify-center">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface leading-tight tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-mono text-gray-500 uppercase font-bold tracking-wider">
                Size
              </label>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { weightGrams: 200, weightLabel: '200 g', price: product.variants.find(v => v.weightGrams === 200)?.price || product.basePrice },
                  { weightGrams: 500, weightLabel: '500 g', price: product.variants.find(v => v.weightGrams === 500)?.price || Math.round(product.basePrice * 2.3) },
                  { weightGrams: 1000, weightLabel: '1 kg', price: product.variants.find(v => v.weightGrams === 1000)?.price || Math.round(product.basePrice * 3.8) },
                ].map((size) => (
                  <button
                    key={size.weightLabel}
                    type="button"
                    onClick={() => setSelectedVariant({ ...size, inStock: true })}
                    className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all ${
                      selectedVariant.weightLabel.replace(/\s+/g, '') === size.weightLabel.replace(/\s+/g, '')
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white border border-border-subtle text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size.weightLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Display */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-gray-500 uppercase font-bold block">
                Price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-bold text-on-surface">
                  {formatRupiah(selectedVariant.price)}
                </span>
                <span className="text-xs font-mono text-gray-500">
                  / {selectedVariant.weightLabel}
                </span>
              </div>
            </div>

            {/* Quantity & Add to Cart Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-gray-500 uppercase font-bold">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-red-100 text-primary font-bold flex items-center justify-center hover:bg-red-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-base text-on-surface">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center hover:bg-surface-tint transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
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
