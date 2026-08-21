'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Coffee,
  Sparkles,
  ChevronRight,
  Calculator,
  Flame,
  Droplets,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { BrewCalculator } from '../../components/brew-calculator';

const TOPICS = [
  {
    id: 'filter',
    num: '01',
    title: 'Filter Brewing (Manual Brew)',
    subtitle: 'V60, Kalita Wave, & Origami Routine',
    tag: 'Manual Brew',
    desc: 'Pour-over is where origin character lives. The setup matters less than the routine — same gear, same recipe, taste, then adjust.',
    tips: [
      'Gunakan rasio seduh 1:15 hingga 1:16 untuk ekstraksi optimal.',
      'Suhu air ideal 90°C - 93°C (92°C untuk washed, 90°C untuk natural anaerobik).',
      'Blooming 40-45 detik dengan rasio 3x berat kopi kering.',
    ],
  },
  {
    id: 'espresso',
    num: '02',
    title: 'Espresso Extraction Standard',
    subtitle: 'Dial-in & Calibration Guide',
    tag: 'Espresso',
    desc: 'Tekanan 9 bar, ekstraksi 25-30 detik dengan rasio yield 1:2. Didesain untuk menghasilkan krema padat dan rasa cokelat karamel yang seimbang saat dipadukan dengan susu.',
    tips: [
      'Gunakan WDT tool untuk mendistribusikan bubuk kopi secara merata.',
      'Dosis 18-19g untuk double basket berkapasitas 58mm.',
      'Target yield 36-38g espresso cair dalam waktu 26-28 detik.',
    ],
  },
  {
    id: 'rest',
    num: '03',
    title: 'Rest & Degassing Period',
    subtitle: 'Peak Flavor Window',
    tag: 'Peak Window',
    desc: 'Biji kopi yang baru disangrai membutuhkan waktu istirahat agar gas karbon dioksida (CO2) terlepas secara alami sebelum diseduh.',
    tips: [
      'Filter Light Roast: Istirahatkan 7 - 14 hari setelah tanggal sangrai.',
      'Espresso Medium-Dark: Istirahatkan 10 - 21 hari untuk krema yang stabil dan manis maksimal.',
      'Jangan simpan di wadah terbuka selama proses degassing.',
    ],
  },
  {
    id: 'storage',
    num: '04',
    title: 'Bean Storage & Freshness',
    subtitle: 'Preserving Aroma & Volatile Aromas',
    tag: 'Storage',
    desc: 'Lindungi biji kopi dari empat musuh utama: Oksigen, Kelembapan, Panas, dan Cahaya langsung.',
    tips: [
      'Simpan dalam kemasan asli 52 Coffee yang dilengkapi one-way valve dan zipper kedap udara.',
      'Letakkan di suhu ruang yang sejuk (20°C - 24°C) dan jauh dari paparan sinar matahari.',
      'Hindari menyimpan kopi di kulkas terbuka karena rentan menyerap bau makanan.',
    ],
  },
  {
    id: 'water',
    num: '05',
    title: 'Water Minerals & Chemistry',
    subtitle: 'TDS & Extraction Balance',
    tag: 'Water Spec',
    desc: 'Secangkir kopi terdiri dari 98.5% air. Mineral Magnesium (Mg2+) dan Kalsium (Ca2+) berperan penting dalam mengikat senyawa rasa buah dan asam manis kopi.',
    tips: [
      'TDS air ideal: 75 - 125 ppm.',
      'Tingkat keasaman (pH) netral antara 6.8 - 7.2.',
      'Gunakan air mineral murni berkualitas seperti Le Minerale / Cleo / Aqua kemasan galon terstandar.',
    ],
  },
];

export default function SpecialtyBrewGuidePage() {
  const [activeTopicId, setActiveTopicId] = useState<string>('filter');

  const currentTopic = TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];

  return (
    <div className="w-full bg-[#131313] text-gray-100 font-sans min-h-screen">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs font-mono">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-gray-300 hover:text-white hover:border-brand-teal transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-gray-500 hidden sm:inline">52 Coffee Brew Standard</span>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH SCROLL FADE                                          */}
      {/* ========================================================================= */}
      <section className="relative h-[600px] sm:h-[680px] w-full flex items-center justify-start overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/roaster-footage.png')`,
          }}
        />
        {/* Slowbar Navy & Crimson Hero Gradient */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(34, 60, 94, 0.6) 0%, rgba(19, 19, 19, 0.95) 100%)',
          }}
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-6">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-xs text-brand-teal-light tracking-widest uppercase font-bold"
          >
            Slowbar Tasting Room / 52 Coffee Malang
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-editorial text-5xl sm:text-7xl font-black max-w-3xl leading-[1.08]"
          >
            Brewing
            <br />
            with <span className="text-brand-teal-light italic font-normal">52</span>.
            <br />
            Made simple.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base lg:text-lg max-w-xl text-gray-200 leading-relaxed font-sans"
          >
            Resep seduh harian yang kami gunakan di Slowbar 52 Coffee Malang — mulai dari parameter dasar, cicipi, lalu kalibrasi gilingan dan rasio air.
          </motion.p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT SPLIT (ANIMATED TABS & CONTENT REVEAL)                     */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-1/4 pr-0 md:pr-8 md:border-r border-white/10">
          <h3 className="font-mono text-xs text-brand-teal-light tracking-widest uppercase mb-6 font-bold">
            Pilih Panduan
          </h3>
          <ul className="space-y-3 font-mono text-sm">
            {TOPICS.map((topic) => {
              const isActive = activeTopicId === topic.id;
              return (
                <li
                  key={topic.id}
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`relative p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-white/10 text-white font-bold border border-white/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-brand-teal-light font-mono">{topic.num}</span>
                    <span>{topic.title.split(' ')[0]}</span>
                  </div>
                  {isActive && (
                    <motion.span
                      layoutId="activeTopicIndicator"
                      className="w-1.5 h-4 rounded-full bg-brand-teal"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Main Animated Content Area */}
        <div className="w-full md:w-3/4 pl-0 md:pl-8 space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTopic.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-8"
            >
              <div>
                <p className="font-mono text-xs text-brand-teal-light tracking-widest uppercase mb-3 border-b border-white/10 pb-2 inline-block font-bold">
                  <span className="mr-2">{currentTopic.num}</span> {currentTopic.tag}
                </p>
                <h2 className="font-editorial text-4xl sm:text-5xl font-bold mb-4 text-white">
                  {currentTopic.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed font-sans">
                  {currentTopic.desc}
                </p>
              </div>

              {/* Key Tips Box */}
              <div className="p-6 rounded-2xl bg-[#1c222b] border border-white/10 space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-brand-teal-light font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Parameter Kunci Barista</span>
                </h4>
                <ul className="space-y-2 text-sm text-gray-200">
                  {currentTopic.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2 shrink-0"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gear & Tasting Gallery Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="group space-y-3">
                  <div className="w-full h-64 bg-[#1b1b1b] rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
                    <img
                      src="/images/the-roastery-behind-your-business.png"
                      alt="52 Coffee Roastery Process & Packaging"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    The Roastery Behind Your Business. Kualitas sangrai dan ketelitian pengemasan.
                  </p>
                </div>

                <div className="group space-y-3">
                  <div className="w-full h-64 bg-[#1b1b1b] rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
                    <img
                      src="/images/roaster-footage.png"
                      alt="Roaster machine in action at 52 Coffee Malang"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    Precision roast profiling. Mengeluarkan karakter terbaik terroir.
                  </p>
                </div>

                <div className="group space-y-3">
                  <div className="w-full h-64 bg-[#1b1b1b] rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
                    <img
                      src="/images/tasting-room-footage.png"
                      alt="52 Coffee Tasting Room - Take the shot then take the sip"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs text-brand-teal-light font-mono italic">
                    &#34;Take the shot then take the sip.&#34; Kalibrasi espresso &amp; slowbar Malang.
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE RATIO CALCULATOR EMBEDDED                                   */}
      {/* ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="p-6 sm:p-10 rounded-3xl bg-[#1A1D21] border border-white/10 shadow-2xl">
          <BrewCalculator />
        </div>
      </motion.section>
    </div>
  );
}
