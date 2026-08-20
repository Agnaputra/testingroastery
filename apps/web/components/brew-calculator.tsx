'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, Droplets, Clock, Sparkles, Scale, Info } from 'lucide-react';

interface BrewMethod {
  id: string;
  name: string;
  defaultRatio: number;
  defaultDose: number;
  defaultTemp: number;
  grindRecommendation: string;
  iconName: string;
  description: string;
  steps: { time: string; targetWater: number; label: string; instruction: string }[];
}

const METHODS: BrewMethod[] = [
  {
    id: 'v60',
    name: 'V60 Pour Over',
    defaultRatio: 15,
    defaultDose: 15,
    defaultTemp: 92,
    grindRecommendation: 'Medium (Pasir Laut Bersih)',
    iconName: 'V60',
    description: 'Menonjolkan kejernihan rasa, aroma floral yang semerbak, dan keasaman buah (acidity) yang kompleks.',
    steps: [
      { time: '00:00 - 00:45', targetWater: 0.2, label: 'Blooming & Agitasi', instruction: 'Basahi seluruh bubuk kopi merata, swirl perlahan 3 kali.' },
      { time: '00:45 - 01:20', targetWater: 0.6, label: 'Penuangan Pertama', instruction: 'Tuang melingkar stabil dari tengah ke arah luar tanpa menyentuh dinding kertas.' },
      { time: '01:20 - 02:15', targetWater: 1.0, label: 'Penuangan Akhir & Drawdown', instruction: 'Tuang perlahan di titik pusat hingga volume target tercapai. Biarkan menetes tuntas.' },
    ],
  },
  {
    id: 'kalita',
    name: 'Kalita Wave',
    defaultRatio: 15.5,
    defaultDose: 16,
    defaultTemp: 91,
    grindRecommendation: 'Medium-Coarse',
    iconName: 'Kalita',
    description: 'Ekstraksi rata berkat flat bottom dengan 3 lubang, menghasilkan sweetness manis seimbang dan body lembut.',
    steps: [
      { time: '00:00 - 00:40', targetWater: 0.25, label: 'Blooming', instruction: 'Tuang 50g air, biarkan gas CO2 terlepas secara sempurna.' },
      { time: '00:40 - 01:30', targetWater: 0.65, label: 'Pulse Pouring', instruction: 'Tuang bertahap dengan ritme halus untuk menjaga level air konstan.' },
      { time: '01:30 - 02:30', targetWater: 1.0, label: 'Final Pour', instruction: 'Capai target air, drawdown selesai di 02:30.' },
    ],
  },
  {
    id: 'aeropress',
    name: 'Aeropress (Inverted)',
    defaultRatio: 13.5,
    defaultDose: 16,
    defaultTemp: 89,
    grindRecommendation: 'Medium-Fine',
    iconName: 'Aero',
    description: 'Metode rendam & tekan udara bertekanan lembut, menghasilkan body padat dan rasa buah yang intens.',
    steps: [
      { time: '00:00 - 00:30', targetWater: 0.5, label: 'Tuang & Stirring', instruction: 'Tuang setengah air, aduk 5 putaran perlahan.' },
      { time: '00:30 - 01:00', targetWater: 1.0, label: 'Top-Up Air', instruction: 'Tuang sisa air, pasang filter cap yang telah dibasahi.' },
      { time: '01:00 - 01:45', targetWater: 1.0, label: 'Balik & Pressing', instruction: 'Balikkan tabung ke server, tekan lembut konstan selama 30 detik.' },
    ],
  },
  {
    id: 'french-press',
    name: 'French Press / Immersion',
    defaultRatio: 14,
    defaultDose: 20,
    defaultTemp: 94,
    grindRecommendation: 'Coarse (Kasar Sea Salt)',
    iconName: 'Press',
    description: 'Immersion murni tanpa kertas saring, menjaga minyak alami kopi untuk body tebal dan rasa karamel kaya.',
    steps: [
      { time: '00:00 - 00:30', targetWater: 1.0, label: 'Tuang Seluruh Air', instruction: 'Tuang 100% air mendidih, pastikan seluruh bubuk terendam.' },
      { time: '00:30 - 04:00', targetWater: 1.0, label: 'Steeping / Seduhan', instruction: 'Diamkan 4 menit. Pecahkan kerak (crust) di menit ke-4 dan buang busa.' },
      { time: '04:00 - 04:30', targetWater: 1.0, label: 'Plunge Perlahan', instruction: 'Turunkan saringan logam dengan lembut dan tuang segera.' },
    ],
  },
  {
    id: 'iced-filter',
    name: 'Japanese Iced Pour Over',
    defaultRatio: 15,
    defaultDose: 18,
    defaultTemp: 93,
    grindRecommendation: 'Medium-Fine',
    iconName: 'Iced',
    description: 'Seduhan panas langsung di atas es batu untuk mengunci (flash chill) aroma floral dan rasa asam buah yang segar.',
    steps: [
      { time: '00:00', targetWater: 0.4, label: 'Persiapan Es', instruction: 'Masukkan 40% es batu di dalam server (misal 110g es).' },
      { time: '00:00 - 00:45', targetWater: 0.2, label: 'Blooming Air Panas', instruction: 'Gunakan air 93°C sebanyak 40ml untuk bloom.' },
      { time: '00:45 - 02:00', targetWater: 0.6, label: 'Seduh Air Panas', instruction: 'Ekstraksi 60% sisa air panas (160ml) langsung melelehkan es.' },
    ],
  },
];

export function BrewCalculator() {
  const [selectedMethod, setSelectedMethod] = useState<BrewMethod>(METHODS[0]);
  const [dose, setDose] = useState<number>(METHODS[0].defaultDose);
  const [ratio, setRatio] = useState<number>(METHODS[0].defaultRatio);
  const [temp, setTemp] = useState<number>(METHODS[0].defaultTemp);

  // Timer states
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleSelectMethod = (method: BrewMethod) => {
    setSelectedMethod(method);
    setDose(method.defaultDose);
    setRatio(method.defaultRatio);
    setTemp(method.defaultTemp);
    setTimerRunning(false);
    setSecondsElapsed(0);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setSecondsElapsed(0);
  };

  const totalWater = Math.round(dose * ratio);
  const bloomWater = Math.round(dose * 3);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="editorial-card p-6 sm:p-8 bg-roastery-card">
      {/* Header */}
      <div className="border-b border-roastery-border pb-6">
        <div className="flex items-center gap-2 text-roastery-crimson font-mono text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>52 Coffee Slowbar Precision Tool</span>
        </div>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-roastery-dark mt-1">
          Kalkulator Rasio & Panduan Seduh Presisi
        </h2>
        <p className="text-xs sm:text-sm text-roastery-muted mt-1 max-w-2xl">
          Hitung gramasi kopi, volume air, suhu seduh, dan ikuti panduan waktu ekstraksi langkah-demi-langkah layaknya barista profesional.
        </p>
      </div>

      {/* Method Selection Tabs */}
      <div className="pt-6">
        <label className="text-xs font-mono uppercase tracking-wider text-roastery-muted block mb-3">
          1. Pilih Metode Seduh:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {METHODS.map((method) => {
            const isSelected = selectedMethod.id === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => handleSelectMethod(method)}
                className={`p-3 rounded-xl border text-center transition-all duration-200 flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'border-roastery-slate bg-roastery-slate text-white shadow-sm font-bold'
                    : 'border-roastery-border bg-roastery-light/60 text-roastery-dark hover:border-roastery-crimson/50 hover:bg-roastery-light font-medium'
                }`}
              >
                <span className="font-editorial text-xs sm:text-sm">{method.name}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-roastery-teal-light' : 'text-roastery-muted'}`}>
                  Rasio 1:{method.defaultRatio}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-roastery-muted mt-2 italic">
          {selectedMethod.description}
        </p>
      </div>

      {/* Sliders & Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-roastery-border mt-6">
        {/* Dose Slider */}
        <div className="p-4 rounded-xl bg-roastery-light/60 border border-roastery-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-roastery-muted">
              <Scale className="w-3.5 h-3.5 text-roastery-crimson" />
              <span>Dosis Biji Kopi</span>
            </div>
            <span className="font-mono text-base font-bold text-roastery-dark">
              {dose} gram
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="40"
            step="0.5"
            value={dose}
            onChange={(e) => setDose(parseFloat(e.target.value))}
            className="w-full accent-roastery-crimson cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-roastery-muted">
            <span>10g (Single)</span>
            <span>20g (Double)</span>
            <span>40g (Server)</span>
          </div>
        </div>

        {/* Ratio Slider */}
        <div className="p-4 rounded-xl bg-roastery-light/60 border border-roastery-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-roastery-muted">
              <Droplets className="w-3.5 h-3.5 text-roastery-slate" />
              <span>Rasio Seduh</span>
            </div>
            <span className="font-mono text-base font-bold text-roastery-slate">
              1 : {ratio}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="18"
            step="0.5"
            value={ratio}
            onChange={(e) => setRatio(parseFloat(e.target.value))}
            className="w-full accent-roastery-slate cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-roastery-muted">
            <span>1:10 (Pekat)</span>
            <span>1:15 (Standar)</span>
            <span>1:18 (Ringan)</span>
          </div>
        </div>

        {/* Temp Slider */}
        <div className="p-4 rounded-xl bg-roastery-light/60 border border-roastery-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-roastery-muted">
              <Flame className="w-3.5 h-3.5 text-roastery-amber" />
              <span>Suhu Air Seduh</span>
            </div>
            <span className="font-mono text-base font-bold text-roastery-dark">
              {temp}°C
            </span>
          </div>
          <input
            type="range"
            min="85"
            max="96"
            step="1"
            value={temp}
            onChange={(e) => setTemp(parseInt(e.target.value))}
            className="w-full accent-roastery-amber cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-roastery-muted">
            <span>85°C (Dark/Sweet)</span>
            <span>92°C (Optimal)</span>
            <span>96°C (Light Roast)</span>
          </div>
        </div>
      </div>

      {/* Extraction Calculation Summary Banner */}
      <div className="mt-6 p-5 rounded-2xl bg-roastery-dark text-white grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-roastery-teal-light">
            Total Air Seduh
          </span>
          <p className="font-mono text-xl sm:text-2xl font-bold text-white mt-0.5">
            {totalWater} <span className="text-xs font-normal text-roastery-muted">ml / g</span>
          </p>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-roastery-teal-light">
            Air Blooming
          </span>
          <p className="font-mono text-xl sm:text-2xl font-bold text-white mt-0.5">
            {bloomWater} <span className="text-xs font-normal text-roastery-muted">ml</span>
          </p>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-roastery-teal-light">
            Rekomendasi Grind
          </span>
          <p className="text-xs sm:text-sm font-sans font-semibold text-white mt-1 truncate">
            {selectedMethod.grindRecommendation}
          </p>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-roastery-teal-light">
            Target Yield Minum
          </span>
          <p className="font-mono text-xl sm:text-2xl font-bold text-roastery-amber mt-0.5">
            ~{Math.round(totalWater - dose * 2)} <span className="text-xs font-normal text-roastery-muted">ml</span>
          </p>
        </div>
      </div>

      {/* Interactive Brew Timer & Step Timeline */}
      <div className="mt-8 border-t border-roastery-border pt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer Control Panel */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-roastery-light border border-roastery-border text-center space-y-4">
          <div className="flex items-center gap-1 text-xs font-mono uppercase text-roastery-muted">
            <Clock className="w-3.5 h-3.5 text-roastery-crimson" />
            <span>Interactive Brew Timer</span>
          </div>

          <div className="font-mono text-4xl sm:text-5xl font-bold text-roastery-dark tracking-wider py-2">
            {formatTimer(secondsElapsed)}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTimerRunning(!timerRunning)}
              className={`px-5 py-2.5 rounded-full font-medium text-xs flex items-center gap-2 transition-all shadow-sm ${
                timerRunning
                  ? 'bg-roastery-amber hover:bg-amber-700 text-white'
                  : 'bg-roastery-crimson hover:bg-roastery-dark text-white'
              }`}
            >
              {timerRunning ? (
                <>
                  <Pause className="w-4 h-4" /> Jeda Timer
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Mulai Seduh
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetTimer}
              className="p-2.5 rounded-full border border-roastery-border bg-white text-roastery-muted hover:text-roastery-dark transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step by Step Timeline */}
        <div className="lg:col-span-2 space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-roastery-muted block">
            Tahapan Penuangan Air Presisi:
          </label>
          <div className="space-y-2.5">
            {selectedMethod.steps.map((step, idx) => {
              const targetWaterStep = Math.round(totalWater * step.targetWater);
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-roastery-border bg-white flex items-start gap-3 hover:border-roastery-slate/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-roastery-light text-roastery-crimson font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className="font-editorial text-sm font-bold text-roastery-dark">
                        {step.label}
                      </h4>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-roastery-muted">{step.time}</span>
                        <span className="font-bold text-roastery-crimson">
                          Target: {targetWaterStep} ml
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-roastery-muted mt-1 leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
