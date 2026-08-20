'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Plus,
  Check,
  Coffee,
  Sparkles,
  ShoppingBag,
  Flame,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useCartStore } from '../lib/store/useCartStore';
import { formatRupiah } from '../lib/data';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  notes: string;
  price100g?: number;
  price200g: number;
  series: string;
  badge?: string;
  imageUrl: string;
}

const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: 'sumbing-supernova',
    name: 'Sumbing Supernova Wash',
    slug: 'sumbing-supernova-wash',
    notes: 'Explosive Berry, Complex, & Candy-Like',
    price100g: 139000,
    price200g: 259000,
    series: 'Java Exotic Series',
    badge: 'Java Exotic',
    imageUrl: '/images/java-exotic-lineup.jpg',
  },
  {
    id: 'prau-black-honey',
    name: 'Prau Black Honey Triple Yeast',
    slug: 'prau-black-honey-triple-yeast',
    notes: 'Brown Sugar, Peach, Blackcurrant, & Tea-Like',
    price100g: 115000,
    price200g: 215000,
    series: 'Java Exotic Series',
    badge: 'Triple Yeast',
    imageUrl: '/images/java-exotic-lineup.jpg',
  },
  {
    id: 'sindoro-lavender-candy',
    name: 'Sindoro Lavender Candy Wash',
    slug: 'sindoro-lavender-candy-wash',
    notes: 'Purple Flower, Floral, Clean, Plum Candy',
    price100g: 139000,
    price200g: 259000,
    series: 'Java Exotic Series',
    badge: 'Floral Candy',
    imageUrl: '/images/java-exotic-hero.jpg',
  },
  {
    id: 'inmaculada-pink-bourbon',
    name: 'Inmaculada Pink Bourbon',
    slug: 'inmaculada-pink-bourbon',
    notes: 'White Peach, Mandarin, Sweet Honey, Jasmine',
    price200g: 380000,
    series: 'Grand Reserve',
    badge: 'Grand Reserve',
    imageUrl: '/images/grand-reserve-series.jpg',
  },
];

export default function HomePage() {
  const { addItem } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleQuickAdd = (p: ProductItem) => {
    addItem({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      imageUrl: p.imageUrl,
      weightGrams: 200,
      weightLabel: '200g',
      grind: 'whole',
      grindLabel: 'Whole Beans (Biji Utuh)',
      unitPrice: p.price200g,
      quantity: 1,
      series: p.series,
      tastingNotes: p.notes.split(', '),
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="w-full bg-surface-white text-on-surface font-sans">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Real 52 Coffee Roaster Footage & Cinematic Typography)   */}
      {/* ========================================================================= */}
      <section className="w-full h-[78vh] sm:h-[84vh] relative overflow-hidden bg-roastery-dark flex items-center">
        {/* Background Image: Authentic 52 Coffee Roastery Footage */}
        <div
          className="absolute inset-0 bg-cover bg-center sm:bg-[center_top_30%] w-full h-full opacity-80 mix-blend-luminosity"
          style={{
            backgroundImage: `url('/images/roaster-footage.png')`,
          }}
        />

        {/* Gradient Overlays for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />

        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-10 w-full">
          <div className="max-w-2xl space-y-4 text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-white font-mono text-[11px] uppercase tracking-widest font-bold shadow-sm">
              Specialty Roastery • Malang
            </span>
            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
              Artisanal Roasting,{' '}
              <span className="italic font-normal text-red-500">Precision</span>{' '}
              Extraction.
            </h1>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed max-w-lg">
              Kami menyangrai biji kopi kurasi Java Exotic Series, Ijen, hingga Grand Reserve Micro-Lot dengan dedikasi presisi profil di Malang.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/catalog"
                className="btn-primary text-xs sm:text-sm px-8 py-3.5 shadow-xl"
              >
                <span>Jelajahi Lineup Biji Kopi</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blend-builder"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/95 hover:bg-white text-on-surface text-xs sm:text-sm font-semibold transition-all shadow-md backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Build Custom Blend (BYOB)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION 01: ON THE BENCH / OUR LATEST LINEUP                           */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-10 py-20">
        <div className="flex justify-between items-end mb-12 border-b border-border-subtle pb-6">
          <div>
            <span className="text-primary text-xs font-mono tracking-widest uppercase mb-2 block font-bold">
              01 — On the bench
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-on-surface">
              Our latest <span className="text-primary italic">lineup.</span>
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-mono font-bold text-on-surface-variant hover:text-primary transition-colors hidden md:flex items-center gap-2"
          >
            <span>BROWSE ALL COFFEES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group border border-border-subtle rounded-2xl p-5 bg-surface-container-lowest hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[0.9] mb-5 relative rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center p-3">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.badge && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 text-white font-mono text-[9px] uppercase tracking-wider backdrop-blur-sm">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 mb-4">
                  <Link
                    href={`/catalog/${product.slug}`}
                    className="font-editorial text-sm sm:text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="font-sans text-xs text-on-surface-variant line-clamp-2">
                    {product.notes}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mt-auto pt-3 border-t border-border-subtle/60">
                <div className="text-xs font-bold text-on-surface font-mono">
                  {formatRupiah(product.price200g)}
                  <span className="text-[10px] font-normal text-on-surface-variant block font-sans">
                    per 200g {product.price100g ? `• 100g: ${formatRupiah(product.price100g)}` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(product)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    addedId === product.id
                      ? 'bg-status-success text-white'
                      : 'bg-primary text-white hover:bg-surface-tint shadow-md'
                  }`}
                  title="Tambah ke Keranjang"
                >
                  {addedId === product.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SPOTLIGHT 1: JAVA EXOTIC SERIES (Real Footage & Origin Stories)        */}
      {/* ========================================================================= */}
      <section className="bg-[#0b1320] text-white py-20 border-t border-b border-border-subtle overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-5">
              <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] uppercase tracking-widest font-bold border border-blue-500/30">
                Curated Regional Project
              </span>
              <h2 className="font-editorial text-4xl sm:text-5xl font-black leading-tight text-white">
                Meet the <br />
                <span className="text-blue-400">JAVA EXOTIC</span> <br />
                SERIES.
              </h2>
              <div className="font-mono text-sm text-gray-300 font-bold border-l-2 border-blue-500 pl-3">
                One Island. Many Characters.
              </div>
              <p className="text-sm text-gray-300 leading-relaxed font-sans">
                Koleksi terkurasi biji kopi istimewa dari dataran tinggi pulau Jawa — Gunung Sindoro, Gunung Prau, dan Gunung Sumbing. Setiap origin menampilkan keunikan terroir, metode proses presisi, dan profil cangkir yang tak terlupakan.
              </p>

              {/* Bean Highlights List */}
              <div className="space-y-3 pt-2 font-mono text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span><strong>Sindoro Lavender Candy Wash:</strong> Purple Flower, Plum Candy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span><strong>Prau Black Honey Triple Yeast:</strong> Peach, Blackcurrant, Tea</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span><strong>Sumbing Supernova Wash:</strong> Explosive Berry, Candy-Like</span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  href="/catalog?series=Java%20Exotic"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all shadow-lg"
                >
                  <span>Lihat Seluruh Java Exotic Series</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Images (Real Footage Showcase) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#141d2c] group">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src="/images/java-exotic-hero.jpg"
                    alt="Java Exotic Series Pouches - Sindoro, Prau, Sumbing"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-mono text-blue-300 uppercase">Featured Trio</span>
                  <h4 className="font-editorial text-sm font-bold text-white">Sindoro • Prau • Sumbing</h4>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#141d2c] group">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src="/images/java-exotic-lineup.jpg"
                    alt="Java Exotic Lineup - Supernova Wash, Black Honey Triple Yeast"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-mono text-blue-300 uppercase">Packaging &amp; Pricing</span>
                  <h4 className="font-editorial text-sm font-bold text-white">Tersedia Kemasan 100g &amp; 200g</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SPOTLIGHT 2: GRAND RESERVE MICRO-LOT SERIES (Real Footage)             */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Pouch Image Showcase */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-2xl border border-border-subtle bg-[#0e1626]">
            <img
              src="/images/grand-reserve-series.jpg"
              alt="Grand Reserve Micro-Lot Series - Yemen Haraz, Colombia Magnum Sidra, Pink Bourbon"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Right Copy & Details */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-block px-3.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-[11px] uppercase tracking-widest font-bold border border-primary/20">
              Introducing
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-black text-on-surface leading-tight">
              GRAND RESERVE <br />
              <span className="text-primary">MICRO-LOT SERIES</span>
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-serif italic text-gray-600">
              &#34;Every coffee in this collection is selected in small lots for a reason: exceptional quality, distinctive origin, and limited availability.&#34;
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-border-subtle flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-on-surface font-editorial">Haraz Royal Origin</h4>
                  <p className="text-xs text-on-surface-variant">Yemen • Dried Fruits, Raisin, Cocoa Nibs</p>
                </div>
                <span className="font-mono text-xs font-bold text-primary">Micro-Lot</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-border-subtle flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-on-surface font-editorial">El-Vergel Magnum Sidra</h4>
                  <p className="text-xs text-on-surface-variant">Colombia • Strawberry Jam, Papaya, Jasmine</p>
                </div>
                <span className="font-mono text-xs font-bold text-primary">Micro-Lot</span>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-border-subtle flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-on-surface font-editorial">Inmaculada Pink Bourbon</h4>
                  <p className="text-xs text-on-surface-variant">Colombia • White Peach, Mandarin, Honey</p>
                </div>
                <span className="font-mono text-xs font-bold text-primary">Micro-Lot</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/catalog?category=reserve"
                className="btn-primary text-xs sm:text-sm px-8 py-3.5"
              >
                <span>Beli Grand Reserve Micro-Lot</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PEOPLE SECTION (02 — Together / Built by people, for people.)          */}
      {/* ========================================================================= */}
      <section className="bg-surface-bright py-20 border-t border-b border-border-subtle">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-primary text-xs font-mono tracking-widest uppercase block font-bold">
              02 — Together
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-on-surface leading-tight">
              Built by people, <span className="text-primary italic">for people.</span>
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-md">
              52 Coffee is a dedicated crew — roasters, baristas, late-night tinkers, developers, and connectors, all driven by the same passion for specialty coffee.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="btn-secondary text-xs"
              >
                <span>Pelajari Filosofi Tim Kami</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl border border-border-subtle relative aspect-[4/3]">
            <img
              src="https://lh3.googleusercontent.com/aida/AP1WRLvGU-_B1zGrzZ1l-rc9ZT2Xitmiz0dDC3iI_H21lR_ZdLL4vlMeShA-I227FrpimAUcMW_FA3Tg72s0CSjYpwVK0HT4Wpbb1aKyQj3ZmFngzgQ6MKb4xk2chfozV8msiMOqLGtuBfAAbO2T_EBWNRl3mfTwbPwTPtjrOqNLGCCwqzdxrxzIhpWSmjDDxxUnJBawQKIjaKNWawNT0zrYh9meEyEzfoQr9acbm1ycZshdigITtJvKICNLvGE"
              alt="52 Coffee Roastery and Barista Team"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. COMMUNITY & TASTING ROOM SECTION (Real Footage: Take the shot...)      */}
      {/* ========================================================================= */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-10 py-20 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Real Tasting Room Footage */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-2xl border border-border-subtle relative aspect-[4/5] bg-roastery-dark">
            <img
              src="/images/tasting-room-footage.png"
              alt="52 Coffee Tasting Room - Take the shot then take the sip"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-primary text-xs font-mono tracking-widest uppercase block font-bold">
              04 — Tasting Room
            </span>
            <h2 className="font-editorial text-4xl sm:text-5xl font-bold leading-tight text-on-surface">
              A <span className="text-primary italic">tasting room</span>
              <br />
              not a cafe.
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              This is where cafes, wholesalers, and home brewers come to taste with us — and dial in the profile that fits them. R&amp;D for our B2B program: try our coffee end-to-end, then decide what to bring back to your shop, your bar, or your kitchen.
            </p>
            <div className="border-t border-border-subtle pt-6 space-y-1 font-mono">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-widest block font-bold">
                Open
              </span>
              <p className="text-sm sm:text-base font-bold text-on-surface">
                Mon - Fri : 11AM - 4PM (Malang Slowbar)
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/guide"
                className="btn-primary text-xs px-7 py-3.5 inline-flex"
              >
                <span>Lihat Panduan Seduh Tasting Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CTA SECTION                                                            */}
      {/* ========================================================================= */}
      <section className="py-24 bg-surface-container-low text-center px-4 sm:px-10 border-t border-border-subtle">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-on-surface">
            Join us in raising the bar without inflating the cost.
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            We source carefully, roast with intention, and share full transparency in every cup.
          </p>
          <div>
            <Link
              href="/catalog"
              className="btn-primary text-xs sm:text-sm px-9 py-4 inline-flex shadow-xl"
            >
              <span>Shop our coffee</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
