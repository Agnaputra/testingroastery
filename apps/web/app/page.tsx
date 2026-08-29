'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Plus,
  Check,
  Coffee,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  ChevronDown,
  FlaskConical,
  CupSoda,
} from 'lucide-react';
import { useCartStore } from '../lib/store/useCartStore';
import { formatRupiah } from '../lib/data';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  weight: string;
  price: number;
  series: string;
  notes: string;
  imageUrl: string;
}

const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: 'sumbing-supernova',
    name: 'Sumbing Supernova Wash',
    slug: 'sumbing-supernova-celestia',
    category: 'FILTER BASED',
    weight: '200g Whole Beans',
    price: 139000,
    series: 'Java Exotic Series',
    notes: 'Explosive Berry, Complex, Lavender Candy',
    imageUrl: '/images/bag-sumbing.jpg',
  },
  {
    id: 'prau-black-honey',
    name: 'Prau Black Honey Triple Yeast',
    slug: 'prau-black-honey-triple-yeast',
    category: 'FILTER BASED',
    weight: '200g Whole Beans',
    price: 115000,
    series: 'Java Exotic Series',
    notes: 'Brown Sugar, Peach, Blackcurrant',
    imageUrl: '/images/bag-prau.jpg',
  },
  {
    id: 'inmaculada-pink-bourbon',
    name: 'Inmaculada Pink Bourbon Huila',
    slug: 'inmaculada-pink-bourbon-marfil',
    category: 'GRAND RESERVE',
    weight: '200g Whole Beans',
    price: 687000,
    series: 'Grand Reserve Micro-Lot',
    notes: 'White Peach, Mandarin, Jasmine Honey',
    imageUrl: '/images/bag-grand-reserve.jpg',
  },
  {
    id: 'argopuro-walida-anaerob',
    name: 'Argopuro Walida Natural Anaerob',
    slug: 'argopuro-walida-natural-anaerob',
    category: 'JAVA EXOTIC',
    weight: '200g Whole Beans',
    price: 125000,
    series: 'Argopuro Series',
    notes: 'Blueberry, Rose, Dark Chocolate',
    imageUrl: '/images/bag-walida.jpg',
  },
];

const CATEGORIES = [
  {
    id: 'filter',
    title: 'Filter Roast Profiles',
    subtitle: 'Ijen, Java Exotic, Walida, Sunda',
    icon: Coffee,
    href: '/catalog?category=filter',
  },
  {
    id: 'espresso',
    title: 'Espresso Roast Profiles',
    subtitle: 'Robusta Dampit & Arabica (200g-1kg)',
    icon: Flame,
    href: '/catalog?category=espresso',
  },
  {
    id: 'reserve',
    title: 'Grand Reserve Micro-Lot',
    subtitle: 'Geisha, Sidra, Sudan Rume, Yemen',
    icon: Award,
    href: '/catalog?category=reserve',
  },
  {
    id: 'beverages',
    title: 'Slowbar Manual Brew (Cup)',
    subtitle: 'Asmara, Celestia, Soberano Cup',
    icon: CupSoda,
    href: '/catalog?category=beverages',
  },
  {
    id: 'byob',
    title: 'BYOB Custom Blend',
    subtitle: 'Simulator Profil Sangrai Kedai Kopi',
    icon: FlaskConical,
    href: '/blend-builder',
  },
];

const FAQS = [
  {
    question: 'Apakah biji kopi di 52 Coffee selalu fresh roasted?',
    answer:
      'Ya, seluruh biji kopi disangrai dalam batch kecil (small-batch) setiap minggunya di roastery kami di Malang. Tanggal sangrai (Roast Date) selalu tertera jelas pada kemasan agar Anda menikmati masa resting optimal (7-30 hari setelah sangrai).',
  },
  {
    question: 'Bagaimana cara memilih ukuran gilingan (grind size) yang tepat?',
    answer:
      'Saat memesan di website, Anda bisa memilih varian Whole Bean (biji utuh untuk menjaga kesegaran maksimal), Giling Kasar (Cold Brew, French Press), Giling Medium (V60, Aeropress, Kalita Wave), atau Giling Halus (Espresso, Mokapot, Tubruk).',
  },
  {
    question: 'Apakah 52 Coffee melayani pengiriman ke seluruh Indonesia?',
    answer:
      'Tentu! Kami melayani pengiriman ke seluruh kota di Indonesia dengan packing kardus khusus dan bubble wrap tebal. Seluruh pesanan yang masuk sebelum pukul 15.00 WIB akan diproses kirim di hari yang sama.',
  },
  {
    question: 'Apakah bisa memesan custom blend atau harga wholesale untuk kedai kopi?',
    answer:
      'Sangat bisa! Kami bermitra dengan puluhan coffee shop di Malang, Surabaya, dan kota lainnya. Anda dapat menggunakan fitur BYOB Blend Simulator kami atau langsung menghubungi tim wholesale kami di menu Work With Us.',
  },
  {
    question: 'Kapan jam operasional Slowbar & Tasting Room di Malang?',
    answer:
      'Slowbar & Tasting Room kami buka Senin - Jumat, pukul 11.00 - 16.00 WIB di Jl. KH Agus Salim No. 11, Klojen, Kota Malang. Anda bisa langsung datang untuk mencicipi kurasi origin terbaru kami.',
  },
];

export default function HomePage() {
  const { addItem } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      unitPrice: p.price,
      quantity: 1,
      series: p.series,
      tastingNotes: p.notes.split(', '),
    });
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="w-full bg-[#FAFAFA] text-[#1A1A1A] font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Cinematic Organic Full-Bleed + Daily Roast Offer Card)   */}
      {/* ========================================================================= */}
      <section className="w-full min-h-screen relative overflow-hidden bg-[#101A26] flex items-center pt-24 pb-16">
        {/* Background Image with Ken Burns animation */}
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.65 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-cover bg-center sm:bg-[center_top_30%] w-full h-full mix-blend-luminosity will-change-transform"
          style={{ backgroundImage: `url('/images/canva-hero-pour.jpg')` }}
        />

        {/* Ambient Dark Overlay for High Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101A26] via-black/55 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101A26]/95 via-[#101A26]/75 to-transparent" />

        <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-3xl space-y-6 text-white"
          >
            {/* Category Tag */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block font-mono text-[11px] uppercase tracking-[0.25em] text-[#D8B168] font-bold"
            >
              TOP SPECIALTY ROASTERY • MALANG
            </motion.span>

            {/* Massive Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight"
            >
              52 Coffee &amp; Roastery – Malang&apos;s Favorite Artisanal Roastery
            </motion.h1>

            {/* Action Button & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4 pt-2"
            >
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#D8B168] hover:bg-[#C9A255] text-[#162A43] font-bold text-sm transition-all shadow-xl font-mono tracking-wide"
                >
                  <span>Jelajahi Menu Slowbar</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/blend-builder"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#A52136] hover:bg-[#8B1E2D] text-white font-bold text-sm transition-all shadow-xl font-mono tracking-wide"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Custom Blend (BYOB)</span>
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                Kami mengurasi dan menyangrai biji kopi specialty artisanal dari Java Exotic Series, Kaldera Ijen, hingga Grand Reserve Micro-Lot dengan dedikasi presisi profil di Malang.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ABOUT US SECTION (Dual Image Gallery & Editorial Story)               */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Dual Offset Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 grid grid-cols-2 gap-4 items-center"
          >
            <div className="rounded-3xl overflow-hidden aspect-[3/4] shadow-xl border border-gray-200">
              <img
                src="/images/canva-barista-roaster.jpg"
                alt="52 Coffee Roasting Process"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="rounded-3xl overflow-hidden aspect-[3/4] shadow-xl border border-gray-200 mt-8">
              <img
                src="/images/canva-lamarzocco-espresso.jpg"
                alt="52 Coffee Tasting Room Malang"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </motion.div>

          {/* Right Story */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-5"
          >
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8B1E2D] font-bold block">
              ABOUT US
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#162A43] leading-tight">
              The Malang Roastery Where Quality Comes First
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Selamat datang di 52 Coffee &amp; Roastery. Sejak berdiri di Malang, dedikasi kami adalah menghadirkan specialty coffee terbaik dari lereng Kaldera Ijen, Gunung Sumbing, hingga varietal langka dunia seperti Colombia Geisha.
            </p>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Setiap batch disangrai dengan presisi tinggi menggunakan teknologi infrared untuk memastikan profil ekstraksi yang konsisten, manis, dan jernih di setiap cangkir Anda.
            </p>
            <div className="pt-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#162A43] hover:text-[#8B1E2D] transition-colors border-b-2 border-[#162A43] pb-1"
              >
                <span>Pelajari Filosofi Tim Kami</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CATEGORIES SECTION ("What We Roast & Brew")                           */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#F3F4F6] border-y border-gray-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 font-bold block">
              CATEGORIES
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#162A43]">
              What We Roast &amp; Brew
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  <Link
                    href={cat.href}
                    className="group bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#162A43] hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-40"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#EAF0F6] text-[#162A43] flex items-center justify-center group-hover:bg-[#162A43] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#162A43] group-hover:text-[#8B1E2D] transition-colors">
                          {cat.title}
                        </h4>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.5. 52 SENSORY FLAVOR SPECTRUM & TASTING NOTES SECTION                   */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: 52 Branded Sensory Flavor Wheel Artwork */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 flex flex-col items-center"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 bg-[#F4F1EA] p-3 sm:p-4 group w-full max-w-md">
              <div className="rounded-2xl overflow-hidden relative aspect-[3/4] bg-white flex items-center justify-center border border-gray-200">
                <img
                  src="/images/flavor-wheel-52coffee.jpg"
                  alt="52 Coffee Roastery Sensory Flavor Spectrum Wheel"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 filter drop-shadow-sm"
                />
              </div>
              <div className="p-3 text-center space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#162A43] block">
                  52 SENSORY LAB • MALANG ROASTERY
                </span>
                <p className="text-[11px] text-gray-500 font-sans">
                  Peta Taksonomi Spektrum Rasa &amp; Karakteristik Kopi Spesialti
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Explanation & Interactive Sensory Categories */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8B1E2D] font-extrabold block">
                SENSORY TASTE SPECTRUM
              </span>
              <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#162A43] leading-tight">
                Standar Kurasi Profil Rasa 52 Roastery
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Setiap biji kopi yang kami sangrai dikurasi berdasarkan peta rasa sensorik standar dunia. Melalui fermentasi anaerob, yeast terisolasi, dan teknik sangrai infrared presisi, kami menghadirkan kejernihan rasa asli perkebunan Indonesia.
              </p>
            </div>

            {/* 6 Key Sensory Notes Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {/* Card 1: Floral */}
              <Link
                href="/catalog"
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border-2 border-gray-200 hover:border-[#246A73] hover:shadow-md transition-all group block space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#246A73]" />
                  <span className="text-[10px] font-mono text-gray-400 font-bold">01</span>
                </div>
                <h4 className="font-editorial text-sm font-bold text-[#162A43] group-hover:text-[#246A73] transition-colors">
                  Floral &amp; Jasmine
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1">
                  Melati, Lavender, Rose
                </p>
              </Link>

              {/* Card 2: Fruity */}
              <Link
                href="/catalog"
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border-2 border-gray-200 hover:border-[#A52136] hover:shadow-md transition-all group block space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A52136]" />
                  <span className="text-[10px] font-mono text-gray-400 font-bold">02</span>
                </div>
                <h4 className="font-editorial text-sm font-bold text-[#162A43] group-hover:text-[#A52136] transition-colors">
                  Fruity &amp; Berry
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1">
                  Stroberi, Peach, Cherry
                </p>
              </Link>

              {/* Card 3: Citrus */}
              <Link
                href="/catalog"
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border-2 border-gray-200 hover:border-[#E57A44] hover:shadow-md transition-all group block space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E57A44]" />
                  <span className="text-[10px] font-mono text-gray-400 font-bold">03</span>
                </div>
                <h4 className="font-editorial text-sm font-bold text-[#162A43] group-hover:text-[#E57A44] transition-colors">
                  Citrus &amp; Apple
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1">
                  Jeruk Mandarin, Apel
                </p>
              </Link>

              {/* Card 4: Sweet */}
              <Link
                href="/catalog"
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border-2 border-gray-200 hover:border-[#D8B168] hover:shadow-md transition-all group block space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D8B168]" />
                  <span className="text-[10px] font-mono text-gray-400 font-bold">04</span>
                </div>
                <h4 className="font-editorial text-sm font-bold text-[#162A43] group-hover:text-[#D8B168] transition-colors">
                  Honey &amp; Caramel
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1">
                  Madu, Gula Aren, Toffee
                </p>
              </Link>

              {/* Card 5: Chocolaty */}
              <Link
                href="/catalog"
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border-2 border-gray-200 hover:border-[#162A43] hover:shadow-md transition-all group block space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#162A43]" />
                  <span className="text-[10px] font-mono text-gray-400 font-bold">05</span>
                </div>
                <h4 className="font-editorial text-sm font-bold text-[#162A43] group-hover:text-[#162A43] transition-colors">
                  Chocolate &amp; Cocoa
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1">
                  Dark Cocoa, Nutty
                </p>
              </Link>

              {/* Card 6: Spices */}
              <Link
                href="/catalog"
                className="p-3.5 rounded-2xl bg-[#F8FAFC] border-2 border-gray-200 hover:border-[#8B5E3C] hover:shadow-md transition-all group block space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8B5E3C]" />
                  <span className="text-[10px] font-mono text-gray-400 font-bold">06</span>
                </div>
                <h4 className="font-editorial text-sm font-bold text-[#162A43] group-hover:text-[#8B5E3C] transition-colors">
                  Spices &amp; Herbal
                </h4>
                <p className="text-[11px] text-gray-500 line-clamp-1">
                  Kayu Manis, Cengkeh
                </p>
              </Link>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#162A43] hover:bg-[#2C3136] text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <span>Jelajahi Menu Berdasarkan Rasa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/blend-builder"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#A52136]/10 hover:bg-[#A52136]/20 text-[#8B1E2D] font-mono text-xs font-bold uppercase tracking-wider transition-all border border-[#A52136]/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Eksplorasi di BYOB Simulator</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PROMO / HIGHLIGHT BANNER (Dark Cinematic Feature)                     */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden bg-[#162A43] text-white p-8 sm:p-16 flex items-center shadow-2xl min-h-[380px]"
        >
          {/* Background image overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: `url('/images/canva-roaster-drum.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#162A43] via-[#162A43]/80 to-transparent" />

          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D8B168] font-bold block">
              LIMITED MICRO-LOT RELEASE
            </span>
            <h3 className="font-editorial text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Inmaculada Pink Bourbon Huila / Grand Reserve
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Varietal Pink Bourbon dari ketinggian 1.950 MASL Huila Colombia dengan proses Natural Anaerobic. Karakter White Peach, Mandarin, dan Jasmine Honey.
            </p>
            <div className="pt-2">
              <Link
                href="/catalog/inmaculada-pink-bourbon-marfil"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#D8B168] hover:bg-[#C9A255] text-[#162A43] font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-lg"
              >
                <span>Dapatkan Batch Terbatas</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PRODUCTS SHOWCASE ("Our Favorite Products")                           */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-200 pb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8B1E2D] font-bold block mb-1">
                PRODUCTS
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#162A43]">
                Our Favorite Products
              </h2>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D8B168] hover:bg-[#C9A255] text-[#162A43] font-bold text-xs font-mono tracking-wider transition-all shadow-md self-start sm:self-auto"
            >
              <span>Lihat Semua Produk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Clean Studio Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-xl hover:border-[#162A43]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Category Pill & Quick Add Button */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-[10px] font-mono uppercase font-bold text-[#162A43]">
                      {product.category}
                    </span>
                    <button
                      onClick={() => handleQuickAdd(product)}
                      className="w-8 h-8 rounded-full bg-[#F1F5F9] group-hover:bg-[#162A43] text-[#162A43] group-hover:text-white flex items-center justify-center transition-all shadow-sm"
                      title="Tambah ke Keranjang"
                    >
                      {addedId === product.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Clean Studio Product Image */}
                  <Link
                    href={`/catalog/${product.slug}`}
                    className="block aspect-square rounded-xl overflow-hidden bg-white mb-4 relative p-2"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-gray-500 block">
                      {product.weight}
                    </span>
                    <Link
                      href={`/catalog/${product.slug}`}
                      className="font-editorial text-base font-bold text-[#162A43] group-hover:text-[#8B1E2D] transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {product.notes}
                    </p>
                  </div>
                </div>

                {/* Price Footer */}
                <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between font-mono">
                  <span className="text-sm font-bold text-[#8B1E2D]">
                    {formatRupiah(product.price)}
                  </span>
                  <Link
                    href={`/catalog/${product.slug}`}
                    className="text-[11px] font-bold text-[#162A43] hover:underline"
                  >
                    Detail →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ORIGIN REGIONS & PARTNERS LOGO STRIP                                  */}
      {/* ========================================================================= */}
      <section className="py-14 border-y border-gray-200 bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-8 opacity-70 grayscale hover:grayscale-0 transition-all font-mono text-xs uppercase tracking-widest font-bold text-[#162A43]">
            <span>🌋 KALDERA IJEN RAUNG</span>
            <span>🏔️ ARGOPURO WALIDA</span>
            <span>🌿 GUNUNG SUMBING</span>
            <span>⛰️ SINDORO DIENG</span>
            <span>🏆 HUILA COLOMBIA</span>
            <span>⚡ RUBASSE INFRARED</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQ SECTION (Collapsible Accordion + Roastery Photo)                  */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: FAQ Header & Real Building Photo */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#8B1E2D] font-bold block mb-1">
                INFO
              </span>
              <h2 className="font-editorial text-4xl font-bold text-[#162A43]">
                FAQ
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Pertanyaan umum seputar sangrai, pengiriman, dan layanan slowbar kami di Malang.
              </p>
            </div>

            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl border border-gray-200 relative">
              <img
                src="/images/canva-cafe-table.jpg"
                alt="52 Coffee Tasting Room"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white text-xs font-mono">
                52 Coffee Slowbar &amp; Tasting Room • Malang
              </div>
            </div>
          </div>

          {/* Right Column: Accordion List */}
          <div className="lg:col-span-7 space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#162A43] hover:text-[#8B1E2D] transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-gray-400 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[#8B1E2D]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-[#F9FAFB]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
