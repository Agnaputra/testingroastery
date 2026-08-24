'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  Volume2,
  VolumeX,
  ArrowLeft,
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
        action: 'Blooming & Gentle Swirl',
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
        action: 'Drawdown & Serving',
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
  return (
    <Suspense fallback={<div className="p-24 text-center text-xs font-mono text-gray-400">Loading Brew Guide...</div>}>
      <BrewGuideContent />
    </Suspense>
  );
}

function BrewGuideContent() {
  const searchParams = useSearchParams();
  const beanParam = searchParams.get('bean');

  const [activeTopicId, setActiveTopicId] = useState<string>('v60-filter');
  const currentTopic = TOPICS.find((t) => t.id === activeTopicId) || TOPICS[0];

  // Interactive Dose State
  const [dose, setDose] = useState<number>(currentTopic.defaultDose);

  // Sound State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync dose when switching topics
  useEffect(() => {
    setDose(currentTopic.defaultDose);
  }, [activeTopicId, currentTopic.defaultDose]);

  const totalWater = dose * currentTopic.ratioMultiplier;

  // Interactive Live Timer State
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const lastChimedSec = useRef<number>(-1);

  // Play synthetic Web Audio chimes without external audio assets
  const playChime = (type: 'start' | 'pour' | 'finish' = 'pour') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'start') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'finish') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.25); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else {
        // Pour interval chime (Double gentle ping)
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Ignore if autoplay blocked
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;

          // Check if current seconds matches any step start time
          const stepMatch = currentTopic.steps.find((s) => s.startSec === next);
          if (stepMatch && lastChimedSec.current !== next) {
            lastChimedSec.current = next;
            playChime(next === 0 ? 'start' : 'pour');
          } else if (next >= currentTopic.targetSeconds && lastChimedSec.current !== next) {
            lastChimedSec.current = next;
            playChime('finish');
          }

          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, currentTopic.steps, currentTopic.targetSeconds, soundEnabled]);

  const toggleTimer = () => {
    if (!timerRunning && seconds === 0) {
      playChime('start');
    }
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSeconds(0);
    lastChimedSec.current = -1;
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
      {/* 1. HERO SECTION                                                           */}
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
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xs font-mono text-[11px] text-brand-teal-light tracking-widest uppercase font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Slowbar Tasting Room / 52 Coffee Malang</span>
            </div>

            {beanParam && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-maroon/80 border border-brand-maroon font-mono text-[11px] text-white font-bold animate-fade-in">
                <Coffee className="w-3.5 h-3.5" />
                <span>Menyeduh: {beanParam}</span>
              </div>
            )}
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl font-bold max-w-3xl leading-tight">
            Precision Brew <span className="text-[#e6bdb8]">Companion.</span>
          </h1>

          <p className="text-xs sm:text-sm max-w-xl text-gray-300 leading-relaxed font-sans">
            Panduan rasio seduh interaktif, interval tuangan air otomatis, dan timer bersuara (*audio chimes*) yang digunakan barista di Slowbar 52 Coffee Malang.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE BREW GUIDE INTERFACE                                       */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Method Switcher Tabs & Sound Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
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

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all flex items-center gap-2 ${
              soundEnabled
                ? 'bg-brand-maroon/20 border-brand-maroon text-amber-200'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
            title={soundEnabled ? 'Suara audio aktif' : 'Suara audio dibisukan'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            <span>{soundEnabled ? 'Audio Chimes On' : 'Mute Audio'}</span>
          </button>
        </div>

        {/* Main 2-Column Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Interactive Brewing Timer & Dose Calculator (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* TIMER CARD */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-6 text-center">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="uppercase tracking-widest font-bold text-brand-teal-light">
                  {currentTopic.tag}
                </span>
                <span>Target: {formatTimer(currentTopic.targetSeconds)}</span>
              </div>

              {/* Huge Monospace Timer Display */}
              <div className="py-2">
                <div className="font-mono text-6xl sm:text-7xl font-bold tracking-tight text-white drop-shadow-md">
                  {formatTimer(seconds)}
                </div>
                <div className="text-xs font-mono text-gray-400 mt-2">
                  {timerRunning ? (
                    <span className="text-emerald-400 flex items-center justify-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Sedang Menyeduh...
                    </span>
                  ) : seconds > 0 ? (
                    <span className="text-amber-300">Timer Dijeda</span>
                  ) : (
                    <span>Tekan Start Saat Tuangan Pertama Dimulai</span>
                  )}
                </div>
              </div>

              {/* Progress Bar of Target Time */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-teal to-brand-maroon rounded-full"
                  style={{
                    width: `${Math.min(100, (seconds / currentTopic.targetSeconds) * 100)}%`,
                  }}
                />
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`flex-1 py-4 px-6 rounded-2xl font-mono text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                    timerRunning
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-brand-maroon hover:bg-brand-maroon-light text-white'
                  }`}
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Seduh</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{seconds > 0 ? 'Lanjutkan' : 'Mulai Seduh (Start)'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 text-gray-300 transition-colors"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* DOSE & RATIO CALCULATOR CARD */}
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-teal-light" />
                  <h3 className="font-editorial text-base font-bold text-white">
                    Kalkulator Rasio Seduh
                  </h3>
                </div>
                <span className="font-mono text-xs text-brand-teal-light font-bold">
                  Rasio 1:{currentTopic.ratioMultiplier}
                </span>
              </div>

              {/* Dose Stepper */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>Gramasi Kopi (Dose):</span>
                  <span className="text-white font-bold text-sm">{dose} Gram</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="0.5"
                    value={dose}
                    onChange={(e) => setDose(parseFloat(e.target.value))}
                    className="flex-1 accent-brand-maroon cursor-pointer h-2 bg-white/10 rounded-lg"
                  />
                </div>
              </div>

              {/* Total Water Yield Output */}
              <div className="p-4 rounded-2xl bg-brand-navy/60 border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-gray-300 font-bold block">
                    Total Air Panas (Yield):
                  </span>
                  <span className="text-xs text-gray-300 font-sans">
                    Suhu optimal {currentTopic.waterTemp}
                  </span>
                </div>
                <div className="font-mono text-2xl font-bold text-amber-300">
                  {totalWater} ml
                </div>
              </div>

              {/* Specs Pills */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block">Grind Size:</span>
                  <span className="font-bold text-white text-[11px] truncate block">
                    {currentTopic.grindSize.split(' (')[0]}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block">Target Waktu:</span>
                  <span className="font-bold text-white text-[11px] block">
                    {formatTimer(currentTopic.targetSeconds)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Step-by-Step Interactive Pour Timeline (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-brand-teal-light uppercase font-bold tracking-wider block">
                TIMELINE INTERVAL TUANGAN
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                {currentTopic.title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                {currentTopic.description}
              </p>
            </div>

            {/* Steps List */}
            <div className="space-y-3.5">
              {currentTopic.steps.map((step, idx) => {
                const isActive = currentActiveStepIndex === idx;
                const isCompleted = seconds > step.endSec;
                const waterAmount = Math.round(totalWater * step.waterPercent);

                return (
                  <motion.div
                    key={`step-${idx}`}
                    className={`p-5 rounded-2xl border transition-all duration-300 relative ${
                      isActive
                        ? 'bg-brand-navy/90 border-brand-maroon shadow-xl ring-1 ring-brand-maroon/50'
                        : isCompleted
                        ? 'bg-white/5 border-emerald-500/30 opacity-75'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-brand-maroon text-white animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : `0${idx + 1}`}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-editorial text-base font-bold text-white">
                              {step.action}
                            </h4>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-brand-maroon text-white font-mono text-[9px] font-bold uppercase animate-pulse">
                                Tuang Sekarang
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-300 font-sans leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>

                      {/* Interval & Grams Target */}
                      <div className="text-right font-mono shrink-0">
                        <div className="text-xs font-bold text-amber-300">
                          {step.waterPercent > 0 ? `+${waterAmount} ml` : 'Finishing'}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {step.timeLabel}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pro Barista Tips */}
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                Catatan Penting Barista 52 Coffee:
              </span>
              <ul className="space-y-1 text-xs text-amber-100/90 list-disc pl-4 font-sans">
                {currentTopic.keyTips.map((tip, i) => (
                  <li key={`tip-${i}`}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
