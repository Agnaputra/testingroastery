const fs = require('fs');
const path = require('path');

const root = 'c:\\laragon\\www\\testingroastery\\apps\\web';

// 1. ocha-pill-navbar.tsx
const pillNavContent = `'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowUpRight, Menu, X } from 'lucide-react';
import { useCartStore } from '../../lib/store/useCartStore';

export function OchaPillNavbar() {
  const { getTotalItems, openDrawer } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  const links = [
    { label: 'Specials', href: '#specials' },
    { label: 'Roastery', href: '/about' },
    { label: 'Coffee Lab', href: '/coffee-lab/brewing-guidance' },
    { label: 'Cupping & Events', href: '#community' },
    { label: 'Merch', href: '#merch' },
  ];

  return (
    <nav
      aria-label="52 Coffee Navigation"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,960px)]"
    >
      <div className="flex items-center justify-between rounded-full border-2 border-[#2C3136] bg-white/95 px-4 sm:px-6 py-2.5 shadow-[0_8px_24px_rgba(44,49,54,0.12)] backdrop-blur-md">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="font-anton text-xl sm:text-2xl tracking-wider uppercase text-[#2C3136] hover:text-[#A52136] transition-colors"
        >
          52 COFFEE
        </Link>

        {/* Center Desktop Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-sans font-bold text-xs lg:text-sm uppercase tracking-wider text-[#2C3136]/80 hover:text-[#2C3136] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Action & Cart Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status pill: Roastery Open */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#2C3136] bg-[#8FB9BC] px-3 py-1 text-xs font-mono font-bold uppercase text-[#2C3136]">
            <span className="h-2 w-2 rounded-full bg-[#2C3136] animate-ping" />
            <span>ROASTERY OPEN</span>
          </div>

          {/* Cart button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Buka Keranjang Belanja"
            className="flex items-center gap-1.5 rounded-full border-2 border-[#2C3136] bg-[#CFE8EA] px-3 py-1.5 font-mono text-xs font-bold text-[#2C3136] transition-transform hover:scale-105 active:scale-95 hover:bg-[#8FB9BC]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{totalItems}</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="md:hidden flex items-center justify-center p-1.5 rounded-full border border-[#2C3136] text-[#2C3136] hover:bg-[#F0F5F7]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl border-2 border-[#2C3136] bg-[#F8FAFC] p-5 shadow-2xl flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-anton text-lg uppercase tracking-wide text-[#2C3136] border-b border-[#2C3136]/20 pb-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-[#2C3136]">MALANG, ID • 10:00 - 20:00</span>
            <Link
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1 rounded-full border border-[#2C3136] bg-[#8FB9BC] px-3 py-1 font-mono text-xs font-bold uppercase text-[#2C3136]"
            >
              <span>Belanja Beans</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
`;

// 2. ocha-faq.tsx
const faqContent = `'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

interface OchaFaqProps {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
}

export function OchaFaq({
  items,
  title = 'FAQS',
  subtitle = "Semua yang ingin Anda ketahui seputar kopi kami, dijawab sebelum tegukan pertama.",
}: OchaFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full bg-[#F8FAFC] py-20 px-4 sm:px-6 lg:px-12 border-t-2 border-[#2C3136]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#CFE8EA] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
              FAQ & PERTANYAAN
            </span>
            <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#2C3136]">
              {title}
            </h2>
          </div>
          <p className="max-w-md font-sans text-sm sm:text-base text-[#2C3136]/80 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="border-t-2 border-[#2C3136]">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border-b-2 border-[#2C3136] transition-colors duration-200 hover:bg-[#F0F5F7]"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between py-6 sm:py-8 text-left gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                    <span className="font-mono text-sm sm:text-base text-[#2C3136]/60 shrink-0 font-bold">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-sans font-bold text-lg sm:text-2xl text-[#2C3136] tracking-tight">
                      {item.question}
                    </span>
                  </div>
                  <div className="shrink-0 rounded-full border-2 border-[#2C3136] bg-[#CFE8EA] p-2 transition-transform duration-200 hover:bg-[#8FB9BC]">
                    {isOpen ? (
                      <Minus className="h-5 w-5 text-[#2C3136]" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#2C3136]" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pt-1 pl-9 sm:pl-12 pr-4">
                        <p className="font-sans text-base sm:text-lg text-[#2C3136]/80 leading-relaxed max-w-3xl">
                          {item.answer}
                        </p>
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
  );
}
`;

// 3. ocha-marquee.tsx
const marqueeContent = `import React from 'react';

interface OchaMarqueeProps {
  text?: string;
  variant?: 'navy' | 'teal' | 'mist' | 'crimson' | 'charcoal' | 'pink' | 'lime' | 'black' | 'cream';
  className?: string;
  reverse?: boolean;
}

export function OchaMarquee({
  text = 'THE BEST PLANS START WITH ARTISANAL COFFEE ✦ 52 COFFEE & ROASTERY ✦ TASTE THE TERROIR ✦ SMALL-BATCH ROASTED IN MALANG ✦',
  variant = 'navy',
  className = '',
  reverse = false,
}: OchaMarqueeProps) {
  const bgStyles = {
    navy: 'bg-[#465C70] text-white border-[#2C3136]',
    teal: 'bg-[#8FB9BC] text-[#2C3136] border-[#2C3136]',
    mist: 'bg-[#CFE8EA] text-[#2C3136] border-[#2C3136]',
    crimson: 'bg-[#A52136] text-white border-[#2C3136]',
    charcoal: 'bg-[#2C3136] text-[#CFE8EA] border-[#2C3136]',
    pink: 'bg-[#CFE8EA] text-[#2C3136] border-[#2C3136]',
    lime: 'bg-[#8FB9BC] text-[#2C3136] border-[#2C3136]',
    black: 'bg-[#2C3136] text-[#CFE8EA] border-[#2C3136]',
    cream: 'bg-[#F0F5F7] text-[#2C3136] border-[#2C3136]',
  }[variant];

  const repeatedText = Array(4).fill(text).join(' ');

  return (
    <div
      aria-hidden="true"
      className={\`relative w-full overflow-hidden border-y-2 py-3 select-none \${bgStyles} \${className}\`}
    >
      <div className={\`flex w-max whitespace-nowrap will-change-transform \${reverse ? 'animate-[marquee_28s_linear_infinite_reverse]' : 'animate-[marquee_28s_linear_infinite]'}\`}>
        <span className="font-anton text-lg sm:text-2xl md:text-3xl tracking-wider uppercase px-2">
          {repeatedText}
        </span>
        <span className="font-anton text-lg sm:text-2xl md:text-3xl tracking-wider uppercase px-2">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
`;

// 4. page.tsx
const pageContent = `'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Compass,
  MapPin,
  MessageCircle,
  Plus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { PRODUCTS, formatRupiah, getCustomerProductName } from '../lib/data';
import { useCartStore } from '../lib/store/useCartStore';
import { openVirtualBarista } from '../lib/virtual-barista-events';
import { HeroSection } from '../components/hero/HeroSection';
import { OchaMarquee } from '../components/ocha/ocha-marquee';
import { OchaFaq } from '../components/ocha/ocha-faq';

const SPECIAL_SLUGS = [
  { slug: 'ijen-carbonic-maceration-asmara', imageUrl: '/images/bag-sumbing.jpg', badge: 'Signature Anaerob', price: 115000 },
  { slug: 'sunda-aromanis-honey', imageUrl: '/images/bag-prau.jpg', badge: 'Honey Process', price: 95000 },
  { slug: 'argopuro-walida-anaerob-arcapada', imageUrl: '/images/bag-walida.jpg', badge: 'Complex Fruit', price: 105000 },
  { slug: 'inmaculada-pink-bourbon-marfil', imageUrl: '/images/bag-grand-reserve.jpg', badge: 'Grand Reserve', price: 195000 },
];

const REVIEWS = [
  {
    quote:
      'Aku cuma niat mampir beli satu bag beans buat stok di rumah. Tiga jam kemudian, aku masih betah di slowbar diajak cupping empat origin berbeda bareng baristanya. Suasana terbaik di Malang.',
    author: 'Fajar Kurniawan',
    role: 'Home Brewer & Designer',
    coffee: 'Ijen Carbonic Maceration Asmara',
  },
  {
    quote:
      'Profil sangrainya luar biasa presisi dan jernih. Notes strawberry dan floral di Ijen Asmara benar-benar meledak tanpa ada aftertaste pahit getir. Standar roastery kelas dunia.',
    author: 'Dinda Saraswati',
    role: 'Specialty Coffee Enthusiast',
    coffee: 'Sunda Aromanis Honey',
  },
  {
    quote:
      'Tempat ini resmi jadi tempat ketiga favoritku. Datang untuk kerja tenang sambil ngopi filter, dan selalu pulang dengan rekomendasi seduh baru dari timnya. Sangat direkomendasikan!',
    author: 'Rayhan Maulana',
    role: 'Software Engineer',
    coffee: 'Argopuro Walida Natural',
  },
];

const TEAM_MEMBERS = [
  {
    name: 'Agna Putra',
    role: 'Founder & Head Roaster',
    desc: 'Menjaga profil sangrai infrared tetap presisi, konsisten, dan membiarkan karakter unik tiap origin bersinar.',
    image: '/images/roaster-footage.png',
  },
  {
    name: 'Selene',
    role: 'Lead Barista & Sensory Specialist',
    desc: 'Mengembangkan formula ekstraksi harian dan memandu pengunjung slowbar menemukan cangkir ideal mereka.',
    image: '/images/the-roastery-behind-your-business.png',
  },
  {
    name: 'Bagas Arga',
    role: 'Green Coffee & Origin Relations',
    desc: 'Menjalin kemitraan langsung dengan kelompok tani di lereng Ijen, Puntang, dan Dataran Tinggi Sumbing.',
    image: '/images/canva-hero-pour.jpg',
  },
  {
    name: 'Nina Rahayu',
    role: 'Quality Control & Coffee Lab',
    desc: 'Memimpin protokol cupping setiap batch sangrai untuk memastikan kepatuhan standar specialty grade.',
    image: '/images/bag-grand-reserve.jpg',
  },
];

const MERCH_ITEMS = [
  {
    id: 'tee-52',
    name: '52 Roastery Heavyweight Tee',
    price: 185000,
    tag: 'the everyday uniform.',
    desc: 'Heavyweight 24s cotton dengan potongan relaxed drop-shoulder warna vintage charcoal. Nyaman dipakai seduh atau santai.',
    badge: 'Apparel',
  },
  {
    id: 'drip-bag-box',
    name: 'Single-Origin Drip Bag Box (5 Pack)',
    price: 75000,
    tag: 'for slow starts & travel.',
    desc: 'Biji kopi specialty pilihan yang dikemas dalam filter drip bag praktis siap seduh. Cukup tambahkan 150ml air panas.',
    badge: 'Instant Specialty',
  },
  {
    id: 'tote-canvas',
    name: 'Heavy Canvas Roastery Tote',
    price: 95000,
    tag: 'simple and functional.',
    desc: 'Tas kanvas tebal 14oz berlogo tipografi 52 Coffee, muat laptop 15 inci, tumbler, dan 3 bag beans kesayangan Anda.',
    badge: 'Carry Essential',
  },
  {
    id: 'cupping-bowl',
    name: '52 Ceramic Cupping Bowl 200ml',
    price: 85000,
    tag: 'sensory precision.',
    desc: 'Mangkuk cupping keramik berstandar SCA warna hitam doff interior untuk evaluasi aroma dan kejernihan ekstraksi rasa.',
    badge: 'Lab Tool',
  },
];

const EVENTS = [
  {
    category: 'UPCOMING EVENT',
    title: 'Saturday Public Cupping Session',
    desc: 'Sesi evaluasi sensorik bersama barista. Cicipi 6 origin berbeda, pelajari perbedaan proses pascapanen, dan temukan notes rasa favorit Anda.',
    time: 'Setiap Sabtu • 10:00 - 12:00 WIB',
    status: 'Gratis / RSVP Terbatas',
  },
  {
    category: 'WORKSHOP',
    title: 'Precision Pour-Over Masterclass',
    desc: 'Pelajari sains ekstraksi filter coffee: kalibrasi rasio, ukuran gilingan mikron, suhu air mineral, dan teknik pouring bertahap.',
    time: 'Batch II • Minggu, 14:00 WIB',
    status: 'Rp 150.000 / Peserta (Termasuk Beans & Sertifikat)',
  },
  {
    category: 'COMMUNITY',
    title: 'Roastery Tour & Green Coffee 101',
    desc: 'Melihat langsung mesin sangrai infrared kami bekerja, berdialog tentang terroir petani Ijen, dan mencoba batch sangrai pertama.',
    time: 'Jumat Sore • 16:00 WIB',
    status: 'Open for Community',
  },
];

const FAQS_DATA = [
  {
    question: 'Apakah seluruh biji kopi di 52 Coffee selalu fresh roasted?',
    answer:
      'Ya! Seluruh biji kopi disangrai dalam batch kecil (small-batch) secara presisi setiap minggu di roastery kami di Kota Malang. Tanggal sangrai (Roast Date) selalu tertera pada kemasan agar Anda dapat menikmati masa resting optimal (7 hingga 30 hari setelah sangrai).',
  },
  {
    question: 'Bagaimana cara memilih ukuran gilingan (grind size) yang sesuai?',
    answer:
      'Saat memesan di website kami, Anda dapat memilih Whole Bean (biji utuh untuk menjaga aroma maksimal), Giling Kasar (Cold Brew & French Press), Giling Medium (V60, Kalita Wave, Aeropress), atau Giling Halus (Espresso, Mokapot, Tubruk). Anda juga bisa mengonsultasikannya di menu Coffee Lab Brewing Guidance.',
  },
  {
    question: 'Apakah 52 Coffee melayani pengiriman ke seluruh Indonesia?',
    answer:
      'Tentu saja! Kami mengirimkan pesanan kopi ke seluruh pelosok Indonesia dengan kardus pelindung khusus dan bubble wrap tebal. Seluruh pesanan yang masuk sebelum pukul 15.00 WIB akan diproses dan dikirim di hari yang sama.',
  },
  {
    question: 'Bisakah kedai kopi saya memesan custom blend atau harga wholesale?',
    answer:
      'Sangat bisa. Kami memasok puluhan kedai kopi specialty di Malang, Surabaya, Bali, dan Jakarta. Anda dapat meracik profil blend sendiri lewat simulator BYOB (Build Your Own Blend) kami atau berdiskusi langsung dengan tim kemitraan di menu Work With Us.',
  },
  {
    question: 'Di mana lokasi dan jam operasional Slowbar 52 Coffee di Malang?',
    answer:
      'Slowbar dan Roastery kami berlokasi di Jl. KH Agus Salim No. 11, Klojen, Kota Malang, Jawa Timur. Kami buka setiap hari (Senin – Minggu) dari pukul 10.00 hingga 20.00 WIB. Anda sangat dipersilakan mampir untuk sekadar menikmati kopi filter santai atau berbincang seputar sangrai!',
  },
];

export default function HomePage() {
  const { addItem } = useCartStore();
  const [addedSlug, setAddedSlug] = useState<string | null>(null);
  const [timeString, setTimeString] = useState('10:00:00 WIB');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatted = new Intl.DateTimeFormat('id-ID', options).format(now);
      setTimeString(\`\${formatted} WIB\`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAdd = (slug: string) => {
    const product = PRODUCTS.find((p) => p.slug === slug);
    if (!product) return;
    const variant = product.variants.find((v) => v.inStock) ?? product.variants[0];

    addItem({
      productId: product.id,
      name: getCustomerProductName(product),
      slug: product.slug,
      imageUrl: product.imageUrl,
      weightGrams: variant.weightGrams,
      weightLabel: variant.weightLabel,
      grind: 'whole',
      grindLabel: 'Biji utuh (Whole bean)',
      unitPrice: variant.price,
      quantity: 1,
      series: product.series,
      tastingNotes: product.tastingNotes,
    });
    setAddedSlug(slug);
    setTimeout(() => setAddedSlug(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#2C3136] font-sans selection:bg-[#8FB9BC] selection:text-[#2C3136]">
      {/* SECTION 1: HERO ROTASI 360° INTERAKTIF (52 COFFEE CAROUSEL) */}
      <section className="relative w-full overflow-hidden">
        {/* Top Info Bar (Ocha Editorial Header) */}
        <div className="bg-[#2C3136] text-[#F0F5F7] px-4 sm:px-8 py-3 border-b-2 border-[#2C3136] font-mono text-xs uppercase tracking-wider font-bold">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#8FB9BC]" />
              <span>MALANG, ID</span>
              <span className="text-white/30">•</span>
              <span className="text-white/70">7°58′S 112°37′E</span>
            </div>

            <div className="flex items-center gap-2 bg-[#8FB9BC] text-[#2C3136] border border-[#2C3136] rounded-full px-3 py-0.5 font-bold">
              <Clock className="h-3.5 w-3.5 text-[#2C3136]" />
              <span>{timeString}</span>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-white/80">SMALL-BATCH ROASTERY & SLOWBAR</span>
              <a href="#specials" className="text-[#8FB9BC] hover:text-white transition-colors">
                GULIR ↓
              </a>
            </div>
          </div>
        </div>

        {/* 360° Rotatable Hero Section */}
        <HeroSection />

        {/* Roastery Quick Manifesto Bar */}
        <div className="w-full bg-[#FFFFFF] border-y-2 border-[#2C3136] py-8 px-4 sm:px-6 lg:px-12 shadow-sm">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#CFE8EA] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
                MANIFESTO ROASTERY
              </span>
              <p className="font-sans text-lg sm:text-xl font-bold leading-relaxed text-[#2C3136]">
                Kami menyangrai kopi dengan teknologi infrared presisi. Percakapan hangat, persahabatan baru, dan ritual seduh pagi setelahnya adalah cerita yang Anda bangun di setiap tegukan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#2C3136] bg-[#2C3136] px-5 py-3 font-sans font-bold text-xs uppercase tracking-wider text-white hover:bg-[#8FB9BC] hover:text-[#2C3136] transition-all shadow-[2px_2px_0px_#2C3136]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Beli Biji Kopi</span>
              </Link>
              <Link
                href="/coffee-lab/brewing-guidance"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#2C3136] bg-[#CFE8EA] px-5 py-3 font-sans font-bold text-xs uppercase tracking-wider text-[#2C3136] hover:bg-[#8FB9BC] transition-all shadow-[2px_2px_0px_#2C3136]"
              >
                <Compass className="h-4 w-4 text-[#A52136]" />
                <span>Brewing Guidance</span>
              </Link>
              <button
                type="button"
                onClick={() => openVirtualBarista()}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#2C3136] bg-white px-4 py-3 font-mono text-xs font-bold uppercase text-[#2C3136] hover:bg-[#CFE8EA] transition-colors"
              >
                <Sparkles className="h-4 w-4 text-[#A52136]" />
                <span>Barista AI</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SPECIALS (OCHA BRUTALIST COFFEE GRID) */}
      <section id="specials" className="w-full py-20 px-4 sm:px-6 lg:px-12 bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b-2 border-[#2C3136]">
            <div>
              <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#8FB9BC] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
                SPECIALS & PILIHAN SANGRAI
              </span>
              <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#2C3136]">
                CURATED BEANS
              </h2>
            </div>
            <p className="max-w-md font-sans text-sm sm:text-base text-[#617281] leading-relaxed">
              Biji kopi specialty yang dikurasi langsung dari petani binaan dan disangrai dalam kuantitas terbatas setiap minggu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPECIAL_SLUGS.map((item) => {
              const product = PRODUCTS.find((p) => p.slug === item.slug);
              const title = product ? getCustomerProductName(product) : item.slug;
              const notes = product ? product.tastingNotes.slice(0, 3) : ['Citrus', 'Sweet', 'Floral'];
              const isAdded = addedSlug === item.slug;

              return (
                <div
                  key={item.slug}
                  className="flex flex-col justify-between rounded-2xl border-2 border-[#2C3136] bg-white p-5 shadow-[4px_4px_0px_#2C3136] hover:shadow-[7px_7px_0px_#2C3136] hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="rounded-full border border-[#2C3136] bg-[#A52136] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                        {item.badge}
                      </span>
                      <span className="rounded-full border border-[#2C3136] bg-[#CFE8EA] px-2.5 py-0.5 font-mono text-xs font-bold text-[#2C3136]">
                        {product ? formatRupiah(product.variants[0].price) : formatRupiah(item.price)}
                      </span>
                    </div>

                    <Link
                      href={\`/catalog/\${item.slug}\`}
                      className="group relative mb-4 block aspect-square w-full overflow-hidden rounded-xl border border-[#2C3136]/30 bg-[#F0F5F7]"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-[#2C3136]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="rounded-full border-2 border-[#2C3136] bg-[#8FB9BC] px-3 py-1 font-mono text-xs font-bold uppercase text-[#2C3136] shadow">
                          Lihat Detail
                        </span>
                      </div>
                    </Link>

                    <Link href={\`/catalog/\${item.slug}\`} className="block group">
                      <h3 className="font-sans font-bold text-lg text-[#2C3136] group-hover:text-[#A52136] transition-colors line-clamp-2 mb-2">
                        {title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {notes.map((note) => (
                        <span
                          key={note}
                          className="rounded-md border border-[#2C3136]/20 bg-[#F0F5F7] px-2 py-0.5 font-mono text-[10px] text-[#2C3136]"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2C3136]/20 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[#617281]">200 gram</span>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(item.slug)}
                      className={\`inline-flex items-center gap-1.5 rounded-full border-2 border-[#2C3136] px-4 py-1.5 font-mono text-xs font-bold transition-all \${
                        isAdded
                          ? 'bg-[#8FB9BC] text-[#2C3136]'
                          : 'bg-[#2C3136] text-white hover:bg-[#CFE8EA] hover:text-[#2C3136]'
                      }\`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Ditambahkan</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          <span>Beli</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#2C3136] bg-white px-8 py-3.5 font-sans font-bold text-sm uppercase tracking-wider text-[#2C3136] hover:bg-[#8FB9BC] transition-colors shadow-[3px_3px_0px_#2C3136]"
            >
              <span>Lihat Seluruh Katalog Origin (20+ Beans)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: RUNNING MARQUEE TICKER 1 (NAVY) */}
      <OchaMarquee
        variant="navy"
        text="✦ THE BEST PLANS START WITH ARTISANAL COFFEE ✦ 52 COFFEE & ROASTERY ✦ TASTE THE TERROIR ✦ SMALL-BATCH ROASTED IN MALANG ✦"
      />

      {/* SECTION 4: REVIEWS & GUEST IMPRESSIONS */}
      <section id="reviews" className="w-full py-20 px-4 sm:px-6 lg:px-12 bg-[#F0F5F7] border-b-2 border-[#2C3136]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#CFE8EA] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
                KATA MEREKA
              </span>
              <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#2C3136]">
                REVIEWS & VIBES
              </h2>
            </div>
            <p className="max-w-md font-sans text-sm sm:text-base text-[#617281] leading-relaxed">
              Kesan jujur dari para pecinta specialty coffee yang mampir ke slowbar dan memesan beans secara rutin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((review, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border-2 border-[#2C3136] bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#2C3136]"
              >
                <div>
                  <span className="font-anton text-5xl text-[#A52136] leading-none select-none block mb-2">
                    “
                  </span>
                  <p className="font-sans text-base sm:text-lg text-[#2C3136] font-medium leading-relaxed mb-6">
                    {review.quote}
                  </p>
                </div>
                <div className="pt-4 border-t-2 border-[#2C3136] flex flex-col">
                  <span className="font-sans font-bold text-sm text-[#2C3136]">{review.author}</span>
                  <span className="font-mono text-xs text-[#617281]">{review.role}</span>
                  <span className="font-mono text-[11px] text-[#A52136] font-bold mt-2">
                    Favorit: {review.coffee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: INSIDE (THE) ROASTERY — TEAM & CRAFT */}
      <section id="roastery" className="w-full py-20 px-4 sm:px-6 lg:px-12 bg-[#F8FAFC] border-b-2 border-[#2C3136]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#8FB9BC] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
                BEHIND THE CRAFT
              </span>
              <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#2C3136]">
                INSIDE (THE) ROASTERY
              </h2>
            </div>
            <p className="max-w-md font-sans text-sm sm:text-base text-[#617281] leading-relaxed">
              Orang-orang di balik sangrai presisi, kurasi green beans petani lokal, dan secangkir kopi favorit Anda setiap pagi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="flex flex-col rounded-2xl border-2 border-[#2C3136] bg-white overflow-hidden shadow-[4px_4px_0px_#2C3136]"
              >
                <div className="relative aspect-[4/3] w-full border-b-2 border-[#2C3136] bg-[#F0F5F7]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A52136] bg-[#CFE8EA] px-2 py-0.5 rounded border border-[#2C3136]/20 inline-block mb-2">
                      {member.role}
                    </span>
                    <h3 className="font-anton text-xl uppercase tracking-tight text-[#2C3136] mb-2">
                      {member.name}
                    </h3>
                    <p className="font-sans text-xs text-[#617281] leading-relaxed">
                      {member.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: MERCH & LIFESTYLE */}
      <section id="merch" className="w-full py-20 px-4 sm:px-6 lg:px-12 bg-[#F8FAFC] border-b-2 border-[#2C3136]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#CFE8EA] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
                SLOWBAR UNIFORM & ESSENTIALS
              </span>
              <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#2C3136]">
                MERCH & LIFESTYLE
              </h2>
            </div>
            <p className="max-w-md font-sans text-sm sm:text-base text-[#617281] leading-relaxed">
              Apparel santai, drip bag sachet, dan peralatan seduh esensial yang dirancang untuk menemani rutinitas harian Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MERCH_ITEMS.map((merch) => (
              <div
                key={merch.id}
                className="flex flex-col justify-between rounded-2xl border-2 border-[#2C3136] bg-[#F0F5F7] p-5 shadow-[4px_4px_0px_#2C3136] hover:shadow-[7px_7px_0px_#2C3136] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2C3136] bg-white px-2 py-0.5 rounded border border-[#2C3136]">
                      {merch.badge}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#2C3136]">
                      {formatRupiah(merch.price)}
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-lg text-[#2C3136] mb-1">
                    {merch.name}
                  </h3>
                  <span className="font-script text-base text-[#A52136] block mb-3">
                    {merch.tag}
                  </span>
                  <p className="font-sans text-xs text-[#617281] leading-relaxed mb-4">
                    {merch.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#2C3136]/20">
                  <a
                    href="https://wa.me/6281234567890?text=Halo%2052%20Coffee,%20saya%20tertarik%20dengan%20merchandise"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#2C3136] bg-[#2C3136] py-2 font-mono text-xs font-bold uppercase text-white hover:bg-[#8FB9BC] hover:text-[#2C3136] transition-colors"
                  >
                    <span>Pesan via WA</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: RUNNING MARQUEE TICKER 2 (MIST) */}
      <OchaMarquee
        variant="mist"
        reverse
        text="✦ SATURDAY SESSIONS ✦ PUBLIC CUPPING CLUB ✦ BREWING WORKSHOPS ✦ VISIT US IN MALANG ✦"
      />

      {/* SECTION 8: COMMUNITY, WORKSHOPS & SATURDAY SESSIONS */}
      <section id="community" className="w-full py-20 px-4 sm:px-6 lg:px-12 bg-[#F8FAFC] border-b-2 border-[#2C3136]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#8FB9BC] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
                KUMPUL & KALIBRASI
              </span>
              <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#2C3136]">
                SATURDAY SESSIONS
              </h2>
            </div>
            <p className="max-w-md font-sans text-sm sm:text-base text-[#617281] leading-relaxed">
              Ruang belajar terbuka bagi home brewer, barista, dan penikmat rasa untuk mengeksplorasi sensorik kopi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {EVENTS.map((evt, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border-2 border-[#2C3136] bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#2C3136] relative overflow-hidden"
              >
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2C3136] bg-[#CFE8EA] px-2.5 py-0.5 rounded border border-[#2C3136] inline-block mb-4">
                    {evt.category}
                  </span>
                  <h3 className="font-anton text-2xl uppercase tracking-tight text-[#2C3136] mb-3">
                    {evt.title}
                  </h3>
                  <p className="font-sans text-sm text-[#617281] leading-relaxed mb-6">
                    {evt.desc}
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-[#2C3136]">
                  <p className="font-mono text-xs text-[#617281] mb-1">{evt.time}</p>
                  <p className="font-mono text-xs font-bold text-[#A52136]">{evt.status}</p>
                  <a
                    href="https://wa.me/6281234567890?text=Halo%2052%20Coffee,%20saya%20ingin%20daftar%20cupping%20session"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#2C3136] bg-[#8FB9BC] px-4 py-2 font-mono text-xs font-bold uppercase text-[#2C3136] hover:bg-[#CFE8EA] transition-colors"
                  >
                    <span>Reservasi Tempat</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: PHYSICAL LOCATION & SLOWBAR (MALANG) */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-12 bg-[#F0F5F7] border-b-2 border-[#2C3136]">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#CFE8EA] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
                LOKASI SLOWBAR
              </span>
              <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#2C3136] mb-4">
                VISIT US IN MALANG
              </h2>
              <p className="font-sans text-base sm:text-lg text-[#617281] leading-relaxed mb-6 max-w-xl">
                Suasana tenang untuk menikmati seduhan pour-over segar, mencium aroma roast terbaru, dan berdiskusi langsung tentang sains kopi dengan tim roaster kami.
              </p>
              <div className="space-y-3 font-mono text-sm text-[#2C3136] mb-8">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#A52136] shrink-0 mt-0.5" />
                  <span>Jl. KH Agus Salim No. 11, Klojen, Kota Malang, Jawa Timur 65118</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#2C3136] shrink-0" />
                  <span>Buka Setiap Hari: 10:00 – 20:00 WIB</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=Jl.+KH+Agus+Salim+No.+11+Malang"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#2C3136] bg-[#2C3136] px-6 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-[#8FB9BC] hover:text-[#2C3136] transition-colors shadow-[3px_3px_0px_#2C3136]"
                >
                  <span>Buka di Google Maps</span>
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/6281234567890?text=Halo%2052%20Coffee,%20saya%20mau%20tanya%20menu%20slowbar"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#2C3136] bg-white px-6 py-3 font-mono text-xs font-bold uppercase text-[#2C3136] hover:bg-[#CFE8EA] transition-colors shadow-[3px_3px_0px_#2C3136]"
                >
                  <MessageCircle className="h-4 w-4 text-[#A52136]" />
                  <span>WhatsApp Barista</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-3xl border-2 border-[#2C3136] bg-white p-6 shadow-[6px_6px_0px_#2C3136] relative overflow-hidden">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#2C3136]/30 mb-4 bg-[#F0F5F7]">
                <Image
                  src="/images/the-roastery-behind-your-business.png"
                  alt="Slowbar 52 Coffee Roastery Malang"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-script text-2xl text-[#A52136] text-center">
                “A quiet sanctuary for curious palates.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: BRUTALIST FAQ ACCORDION */}
      <OchaFaq items={FAQS_DATA} />

      {/* SECTION 11: GIANT BRUTALIST FOOTER & CONTACT */}
      <footer className="w-full bg-[#2C3136] text-[#F0F5F7] py-20 px-4 sm:px-6 lg:px-12 border-t-2 border-[#2C3136]">
        <div className="mx-auto max-w-6xl">
          {/* Huge headline link */}
          <div className="mb-16 border-b border-white/20 pb-12">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#8FB9BC] block mb-4">
              KATAKAN HALO / PARTNERSHIP INQUIRIES
            </span>
            <a
              href="mailto:hello@52coffee.id"
              className="font-anton text-[clamp(2.5rem,8vw,7rem)] uppercase tracking-tight text-white hover:text-[#8FB9BC] transition-colors leading-none block"
            >
              hello@52coffee.id
            </a>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div>
              <h4 className="font-anton text-lg uppercase tracking-wider text-[#8FB9BC] mb-4">
                NAVIGASI
              </h4>
              <ul className="space-y-2 font-mono text-xs text-white/80">
                <li>
                  <Link href="/catalog" className="hover:text-white transition-colors">
                    Katalog Biji Kopi
                  </Link>
                </li>
                <li>
                  <Link href="/coffee-lab/brewing-guidance" className="hover:text-white transition-colors">
                    Brewing Guidance
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    Tentang Roastery
                  </Link>
                </li>
                <li>
                  <Link href="/work-with-us" className="hover:text-white transition-colors">
                    Kemitraan Wholesale
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-anton text-lg uppercase tracking-wider text-[#8FB9BC] mb-4">
                JAM ROASTERY
              </h4>
              <p className="font-mono text-xs text-white/80 leading-relaxed mb-2">
                Senin – Minggu: 10:00 – 20:00 WIB
              </p>
              <p className="font-mono text-xs text-white/60">
                Jl. KH Agus Salim No. 11, Klojen, Kota Malang
              </p>
            </div>

            <div>
              <h4 className="font-anton text-lg uppercase tracking-wider text-[#8FB9BC] mb-4">
                TERHUBUNG
              </h4>
              <ul className="space-y-2 font-mono text-xs text-white/80">
                <li>
                  <a
                    href="https://instagram.com/52coffeeroastery"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>Instagram</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://tokopedia.com/52coffeeroastery"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>Tokopedia</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://tiktok.com/@52coffeeroastery"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>TikTok</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-anton text-lg uppercase tracking-wider text-[#8FB9BC] mb-4">
                NEWSLETTER
              </h4>
              <p className="font-mono text-xs text-white/70 mb-3 leading-relaxed">
                Dapatkan update batch sangrai micro-lot dan undangan cupping session mingguan.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="email@anda.com"
                  className="w-full rounded-full border border-white/30 bg-white/10 px-3.5 py-2 font-mono text-xs text-white placeholder:text-white/40 focus:border-[#8FB9BC] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full border border-[#8FB9BC] bg-[#8FB9BC] px-4 py-2 font-mono text-xs font-bold uppercase text-[#2C3136] hover:bg-[#CFE8EA] transition-colors"
                >
                  Kirim
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/60">
            <p>© {new Date().getFullYear()} 52 COFFEE & ROASTERY. All rights reserved.</p>
            <p>Artisanal Roasting & Extraction • Malang, East Java</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
`;

fs.writeFileSync(path.join(root, 'components', 'ocha', 'ocha-pill-navbar.tsx'), pillNavContent, 'utf8');
fs.writeFileSync(path.join(root, 'components', 'ocha', 'ocha-faq.tsx'), faqContent, 'utf8');
fs.writeFileSync(path.join(root, 'components', 'ocha', 'ocha-marquee.tsx'), marqueeContent, 'utf8');
fs.writeFileSync(path.join(root, 'app', 'page.tsx'), pageContent, 'utf8');

console.log('All 4 files written cleanly and completely!');

