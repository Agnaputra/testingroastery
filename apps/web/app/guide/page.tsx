'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Droplets,
  Flame,
  Scale,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Sliders,
  ChevronRight,
} from 'lucide-react';

interface BrewStep {
  startSec: number;
  endSec: number;
  timeLabel: string;
  action: string;
  waterPercent: number; // percentage of total water
  desc: string;
}

interface BrewTopic {
  id: string;
  num: string;
  tag: string;
  title: string;
  description: string;
  defaultDose: number;
  ratioMultiplier: number;
  grindSize: string;
  waterTemp: string;
  targetSeconds: number;
  steps: BrewStep[];
  keyTips: string[];
  recommendedBeans: string[];
}

const TOPICS: BrewTopic[] = [
  {
    id: 'v60-filter',
    num: '01',
    tag: 'MANUAL BREW',
    title: 'V60 Pour Over (Daily Filter)',
    description:
      'Teknik seduh standar kami di Slowbar 52 Coffee Malang untuk mengekstraksi aroma floral melati, keasaman manis buah tropis, dan rasa manis alami secara seimbang.',
    defaultDose: 15,
    ratioMultiplier: 15,
    grindSize: 'Medium-Fine (Sehalus garam laut meja)',
    waterTemp: '91°C - 93°C',
    targetSeconds: 150,
    steps: [
      {
        startSec: 0,
        endSec: 40,
        timeLabel: '00:00 - 00:40',
        action: 'Blooming & Swirl',
        waterPercent: 0.2,
        desc: 'Tuang 20% air panas merata ke seluruh bubuk kopi, lakukan gentle swirl 3-5 detik untuk melepas gas CO2 alami.',
      },
      {
        startSec: 40,
        endSec: 75,
        timeLabel: '00:40 - 01:15',
        action: 'Tuangan Kedua (Center Spiral)',
        waterPercent: 0.4,
        desc: 'Tuang memutar stabil dari tengah ke tepi tanpa menyiram dinding kertas untuk mengekstraksi rasa manis dan body.',
      },
      {
        startSec: 75,
        endSec: 110,
        timeLabel: '01:15 - 01:50',
        action: 'Tuangan Ketiga (Finishing)',
        waterPercent: 0.4,
        desc: 'Tuang memusat secara konstan hingga mencapai total target timbangan. Berikan 1 gentle swirl atau tap.',
      },
      {
        startSec: 110,
        endSec: 150,
        timeLabel: '01:50 - 02:30',
        action: 'Drawdown Selesai',
        waterPercent: 0,
        desc: 'Biarkan air turun habis dengan permukaan bed kopi rata. Angkat dripper, swirl server sebelum dinikmati!',
      },
    ],
    keyTips: [
      'Gunakan air mineral bersih dengan TDS 80–120 ppm untuk sweetness maksimal.',
      'Jika seduhan terasa pahit/kering (astringent), kasarkan ukuran gilingan 1–2 klik.',
    ],
    recommendedBeans: ['Ijen Carbonic Maceration (Asmara)', 'Sunda Aromanis Honey', 'Sumbing Supernova'],
  },
  {
    id: 'japanese-iced',
    num: '02',
    tag: 'ICED FILTER',
    title: 'Japanese Iced Drip (Es Seduh)',
    description:
      'Metode seduh panas langsung di atas es batu di server untuk mengunci aroma volatil buah dan menghasilkan kesegaran filter dingin yang kompleks.',
    defaultDose: 18,
    ratioMultiplier: 15,
    grindSize: 'Medium-Fine (Sedikit lebih halus dari V60)',
    waterTemp: '93°C - 95°C',
    targetSeconds: 120,
    steps: [
      {
        startSec: 0,
        endSec: 30,
        timeLabel: '00:00 - 00:30',
        action: 'Blooming di Atas Es',
        waterPercent: 0.25,
        desc: 'Siapkan 40% es batu di dalam server kaca. Tuang 25% air panas ke bubuk kopi untuk blooming singkat.',
      },
      {
        startSec: 30,
        endSec: 70,
        timeLabel: '00:30 - 01:10',
        action: 'Ekstraksi Konsentrat',
        waterPercent: 0.45,
        desc: 'Tuang dengan aliran lambat dan memusat untuk mengekstrak konsentrat kopi yang pekat dan manis.',
      },
      {
        startSec: 70,
        endSec: 120,
        timeLabel: '01:10 - 02:00',
        action: 'Final Pour & Chill',
        waterPercent: 0.30,
        desc: 'Tuang sisa air panas. Tetesan kopi panas langsung mendingin dan larut sempurna bersama es batu.',
      },
    ],
    keyTips: [
      'Gunakan es batu dari air mineral bersih agar rasa kopi tidak terdistorsi.',
      'Sangat cocok untuk kopi proses Anaerobik, Natural, atau Koji Fermentation.',
    ],
    recommendedBeans: ['Argopuro Walida Natural (Arcapada)', 'Prau Double Mosto (Surya)'],
  },
  {
    id: 'espresso-calibration',
    num: '03',
    tag: 'ESPRESSO BAR',
    title: 'Kalibrasi Espresso 52 Blend',
    description:
      'Parameter ekstraksi espresso harian untuk racikan House Blend 52 Coffee, menghasilkan crema tebal keemasan dan rasa manis cokelat susu yang seimbang.',
    defaultDose: 18,
    ratioMultiplier: 2,
    grindSize: 'Fine Espresso Grind',
    waterTemp: '92.5°C - 93.5°C (9 Bar)',
    targetSeconds: 30,
    steps: [
      {
        startSec: 0,
        endSec: 5,
        timeLabel: '00:00 - 00:05',
        action: 'Pre-infusion (3 Bar)',
        waterPercent: 0.2,
        desc: 'Distribusi bubuk kopi dengan WDT tool, tamping presisi 15kg horizontal rata.',
      },
      {
        startSec: 5,
        endSec: 30,
        timeLabel: '00:05 - 00:30',
        action: 'Full Extraction (9 Bar)',
        waterPercent: 0.8,
        desc: 'Aliran espresso menyerupai ekor tikus hangat dengan crema tebal keemasan hingga mencapai target 36g–38g.',
      },
    ],
    keyTips: [
      'Gunakan biji kopi yang telah mengalami resting minimal 10–14 hari setelah tanggal sangrai.',
      'Gunakan timbangan digital di bawah cangkir untuk menjaga rasio dose in dan yield out konsisten.',
    ],
    recommendedBeans: ['52 House Blend Espresso', 'Robusta Dampit Fine Honey'],
  },
];

export default function BrewGuidePage() {
  const [activeTopicId, setActiveTopicId] = useState<string>('v60-filter');
  const currentTopic = TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];

  // Interactive Dose State
  const [dose, setDose] = useState<number>(currentTopic.defaultDose);

  // Sync dose when switching topics
  useEffect(() => {
    setDose(currentTopic.defaultDose);
  }, [activeTopicId, currentTopic.defaultDose]);

  const totalWater = dose * currentTopic.ratioMultiplier;

  // Interactive Live Timer State
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const resetTimer = () => {
    setTimerRunning(false);
    setSeconds(0);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find active pouring step based on timer
  const currentActiveStepIndex = currentTopic.steps.findIndex(
    (step) => seconds >= step.startSec && seconds <= step.endSec
  );

  return (
    <div className="w-full bg-[#131313] text-gray-100 font-sans min-h-screen">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH PROPORTIONATE HEIGHT                                 */}
      {/* ========================================================================= */}
      <section className="relative min-h-[380px] sm:min-h-[440px] pt-24 pb-12 w-full flex items-center justify-start overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-45 mix-blend-luminosity"
          style={{
            backgroundImage: `url('/images/roaster-footage.png')`,
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(14, 23, 37, 0.8) 0%, rgba(19, 19, 19, 0.98) 100%)',
          }}
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs font-mono text-[11px] text-brand-teal-light tracking-widest uppercase font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Slowbar Tasting Room / 52 Coffee Malang</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl font-bold max-w-3xl leading-tight">
            Precision Brew <span className="text-[#e6bdb8]">Companion.</span>
          </h1>

          <p className="text-xs sm:text-sm max-w-xl text-gray-300 leading-relaxed font-sans">
            Panduan rasio seduh interaktif &amp; live timer yang digunakan setiap hari oleh barista di Slowbar 52 Coffee Malang.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE BREW GUIDE INTERFACE                                       */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Method Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 max-w-2xl mx-auto">
          {TOPICS.map((topic) => {
            const isActive = activeTopicId === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => {
                  setActiveTopicId(topic.id);
                  resetTimer();
                }}
                className={`relative px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 z-10 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeGuideMethodPill"
                    className="absolute inset-0 bg-brand-navy rounded-xl shadow-md border border-white/20 -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span>{topic.num}</span>
                <span>{topic.title.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Interactive Brewing Timer & Dose Calculator (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Stopwatch Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 text-center shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                <span className="uppercase font-bold tracking-wider">Live Pouring Timer</span>
                <span className="text-brand-teal-light font-bold">Target: ~{formatTimer(currentTopic.targetSeconds)}</span>
              </div>

              {/* Digital Clock Digits */}
              <div className="space-y-1 py-2">
                <div className="font-mono text-5xl sm:text-6xl font-black text-white tracking-widest">
                  {formatTimer(seconds)}
                </div>
                <div className="text-xs font-mono text-gray-400">
                  {timerRunning ? (
                    <span className="text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                      Sedang Menyeduh...
                    </span>
                  ) : seconds > 0 ? (
                    <span className="text-amber-400">Waktu Dijeda</span>
                  ) : (
                    <span>Tekan Mulai saat tuangan pertama</span>
                  )}
                </div>
              </div>

              {/* Action Timer Buttons */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className={`px-6 py-3.5 rounded-2xl font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                    timerRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-gray-950'
                      : 'bg-brand-teal hover:bg-brand-teal-dark text-white'
                  }`}
                >
                  {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerRunning ? 'Jeda Timer' : seconds > 0 ? 'Lanjutkan' : 'Mulai Seduh'}</span>
                </button>

                {seconds > 0 && (
                  <button
                    type="button"
                    onClick={resetTimer}
                    className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Interactive Dose Slider */}
              <div className="pt-4 border-t border-white/10 space-y-3 text-left">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400 uppercase font-bold">Atur Dosis Kopi (Dose):</span>
                  <span className="text-white font-bold text-sm">{dose} Gram</span>
                </div>

                <div className="flex items-center gap-2">
                  {[12, 15, 18, 20].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDose(d)}
                      className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold transition-colors ${
                        dose === d
                          ? 'bg-white text-gray-950 shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {d}g
                    </button>
                  ))}
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center font-mono text-xs">
                  <span className="text-gray-400">Total Kebutuhan Air:</span>
                  <span className="text-brand-teal-light font-bold text-sm sm:text-base">
                    {totalWater} {activeTopicId === 'espresso-calibration' ? 'Gram Yield' : 'ml Air'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Step-by-Step Pouring Timeline & Parameters (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTopic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* 4 Essential Quick Parameters Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                      <Scale className="w-3.5 h-3.5 text-brand-teal-light" />
                      <span>Rasio Seduh</span>
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm">
                      1:{currentTopic.ratioMultiplier} ({dose}g:{totalWater}ml)
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Gilingan</span>
                    </div>
                    <div className="font-bold text-white text-xs leading-tight">{currentTopic.grindSize}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                      <Flame className="w-3.5 h-3.5 text-red-400" />
                      <span>Suhu Air</span>
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm">{currentTopic.waterTemp}</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Target Waktu</span>
                    </div>
                    <div className="font-bold text-white text-xs sm:text-sm">
                      {formatTimer(currentTopic.targetSeconds)}
                    </div>
                  </div>
                </div>

                {/* Step by Step Timeline with Active Step Highlighting */}
                <div className="space-y-3">
                  <h3 className="font-editorial text-xl font-bold text-white">
                    Tahapan Seduhan (Step-by-Step)
                  </h3>

                  <div className="space-y-2.5">
                    {currentTopic.steps.map((step, idx) => {
                      const isCurrentActive = currentActiveStepIndex === idx;
                      const stepWaterAmount =
                        step.waterPercent > 0
                          ? Math.round(totalWater * step.waterPercent)
                          : totalWater;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isCurrentActive
                              ? 'bg-brand-navy/60 border-brand-teal shadow-md ring-2 ring-brand-teal/30 scale-[1.01]'
                              : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                          }`}
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                  isCurrentActive
                                    ? 'bg-brand-teal text-white'
                                    : 'bg-white/10 text-brand-teal-light'
                                }`}
                              >
                                {step.timeLabel}
                              </span>
                              <span className="font-bold text-sm text-white">{step.action}</span>
                            </div>
                            <p className="text-xs text-gray-300 font-sans">{step.desc}</p>
                          </div>

                          {step.waterPercent > 0 && (
                            <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-mono text-xs font-bold shrink-0">
                              +{stepWaterAmount} ml
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Barista Tips & Recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Kalibrasi Rasa (Barista Tip)
                    </span>
                    <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside font-sans">
                      {currentTopic.keyTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                    <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Biji Kopi Rekomendasi
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentTopic.recommendedBeans.map((bean, idx) => (
                        <Link
                          key={idx}
                          href="/catalog"
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-medium transition-colors"
                        >
                          {bean}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
