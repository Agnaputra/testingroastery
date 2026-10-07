'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Sliders,
  Volume2,
  VolumeX,
  ArrowRight,
  Droplets,
  Flame,
  Check,
  Timer,
  Compass,
  Scale,
  Share2,
  Layers,
  Edit3,
  RotateCw,
} from 'lucide-react';
import {
  BREWER_HARDWARE,
  GRINDER_DATABASE,
  WATER_SOURCES,
  PROCESS_OPTIONS,
  VARIETY_OPTIONS,
  TARGET_PROFILES,
  calculatePrecisionRecipe,
  type PrecisionRecipeResult,
  GRIND_CHART,
  CURATED_RECIPES,
  BREW_TOPICS,
} from '../lib/brewlogic-database';
import { ReserveLayout } from './ui/reserve-layout';

// Pre-configured 52 Coffee Quick Beans
const FIFTY_TWO_BEANS = [
  {
    name: 'Ijen Carbonic Maceration (Asmara)',
    origin: 'Kawah Ijen, Bondowoso',
    process: 'Carbonic Maceration (CM)',
    variety: 'Bourbon',
    roastLevel: 'light' as const,
  },
  {
    name: 'Sunda Aromanis Honey',
    origin: 'Gunung Puntang, Jawa Barat',
    process: 'Honey / Pulped Natural',
    variety: 'Typica',
    roastLevel: 'light' as const,
  },
  {
    name: 'Argopuro Walida Natural (Arcapada)',
    origin: 'Gunung Argopuro, Jawa Timur',
    process: 'Natural / Dry Process',
    variety: 'Catimor',
    roastLevel: 'light' as const,
  },
  {
    name: '52 House Blend Espresso',
    origin: 'Malang Roastery Blend',
    process: 'Washed / Fully Washed',
    variety: 'Mix Variety',
    roastLevel: 'medium' as const,
  },
  {
    name: 'Sumbing Supernova',
    origin: 'Gunung Sumbing, Jawa Tengah',
    process: 'Anaerobic / Fermented',
    variety: 'S795 (Jember)',
    roastLevel: 'light' as const,
  },
];

export function BrewingGuidanceExperience() {
  const searchParams = useSearchParams();
  const beanParam = searchParams.get('bean');

  // Console Step: 1 = Input Console, 2 = Recipe Dashboard, 3 = Live Brewing Mode
  const [consoleStep, setConsoleStep] = useState<1 | 2 | 3>(1);

  // Input Form State (ala BrewLogic)
  const [temperatureStyle, setTemperatureStyle] = useState<'hot' | 'iced'>('hot');
  const [origin, setOrigin] = useState<string>('Ijen Carbonic Maceration (Asmara)');
  const [dose, setDose] = useState<number>(15);
  const [process, setProcess] = useState<string>(PROCESS_OPTIONS[4]); // CM
  const [variety, setVariety] = useState<string>(VARIETY_OPTIONS[1]); // Bourbon
  const [roastLevel, setRoastLevel] = useState<'light' | 'medium' | 'dark'>('light');
  const [brewerId, setBrewerId] = useState<string>('hario_v60');
  const [grinderId, setGrinderId] = useState<string>('timemore_c2');
  const [waterSourceId, setWaterSourceId] = useState<string>('aqua');
  const [customPPM, setCustomPPM] = useState<number>(80);
  const [targetProfileId, setTargetProfileId] = useState<'balance' | 'sweet' | 'acidity' | 'body'>('balance');

  // Loading & Generating animation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingMessage, setGeneratingMessage] = useState<string>('Menganalisis parameter seduh...');

  // Generated Recipe Result
  const [recipe, setRecipe] = useState<PrecisionRecipeResult>(() =>
    calculatePrecisionRecipe({
      origin: 'Ijen Carbonic Maceration (Asmara)',
      dose: 15,
      temperatureStyle: 'hot',
      roastLevel: 'light',
      process: PROCESS_OPTIONS[4],
      variety: VARIETY_OPTIONS[1],
      brewerId: 'hario_v60',
      grinderId: 'timemore_c2',
      waterSourceId: 'aqua',
      targetProfileId: 'balance',
    })
  );

  // Sound chime state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Live Timer State (Step 3)
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const lastChimedSec = useRef<number>(-1);

  // Initialize with bean query parameter if present
  useEffect(() => {
    if (beanParam) {
      setOrigin(beanParam);
      const matched = FIFTY_TWO_BEANS.find((b) =>
        b.name.toLowerCase().includes(beanParam.toLowerCase())
      );
      if (matched) {
        setOrigin(matched.name);
        setProcess(matched.process);
        setVariety(matched.variety);
        setRoastLevel(matched.roastLevel);
      }
    }
  }, [beanParam]);

  // Synthetic Web Audio Chimes
  const playChime = useCallback(
    (type: 'start' | 'pour' | 'finish' = 'pour') => {
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
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        } else if (type === 'finish') {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        } else {
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.start();
          osc.stop(ctx.currentTime + 0.25);
        }
      } catch (e) {
        // Skip audio error
      }
    },
    [soundEnabled]
  );

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          const stepMatch = recipe.steps.find((s) => s.startSec === next);
          if (stepMatch && lastChimedSec.current !== next) {
            lastChimedSec.current = next;
            playChime(next === 0 ? 'start' : 'pour');
          } else if (next >= recipe.targetSeconds && lastChimedSec.current !== next) {
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
  }, [timerRunning, recipe.steps, recipe.targetSeconds, playChime]);

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

  // Find active step
  const currentActiveStepIndex = recipe.steps.findIndex(
    (step) => seconds >= step.startSec && seconds <= step.endSec
  );

  // Handle Recipe Generation (Step 1 -> Step 2)
  const handleGenerateRecipe = () => {
    setIsGenerating(true);
    setGeneratingMessage('Menganalisis densitas biji & profil sangrai...');

    setTimeout(() => {
      setGeneratingMessage('Mengkalibrasi setting klik grinder & laju alir...');
    }, 450);

    setTimeout(() => {
      setGeneratingMessage('Menyesuaikan suhu optimal terhadap mineral PPM air...');
    }, 900);

    setTimeout(() => {
      const generated = calculatePrecisionRecipe({
        origin,
        dose,
        temperatureStyle,
        roastLevel,
        process,
        variety,
        brewerId,
        grinderId,
        waterSourceId,
        customPPM,
        targetProfileId,
      });
      setRecipe(generated);
      setIsGenerating(false);
      setConsoleStep(2);
      resetTimer();

      const el = document.getElementById('precision-console');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 1350);
  };

  const select52Bean = (bean: (typeof FIFTY_TWO_BEANS)[0]) => {
    setOrigin(bean.name);
    setProcess(bean.process);
    setVariety(bean.variety);
    setRoastLevel(bean.roastLevel);
  };

  const copyRecipeToClipboard = () => {
    let text = `52 COFFEE × BREWLOGIC PRECISION RECIPE\n`;
    text += `${recipe.origin} | ${recipe.brewerName} (${recipe.temperatureStyle.toUpperCase()})\n`;
    text += `Target: ${recipe.targetProfile.label} | Suhu Air: ${recipe.temp}°C\n`;
    text += `Grinder Setting: ${recipe.grinderSetting} (${recipe.grinderName})\n`;
    text += `Rasio: ${recipe.ratio} | Dosis: ${recipe.dose}g | Total Air: ${recipe.totalWater}ml\n`;
    if (recipe.iceAmount > 0) {
      text += `Es Batu di Server: ${recipe.iceAmount}g | Air Panas Ekstraksi: ${recipe.brewingWater}ml\n`;
    }
    text += `\nSekuens Ekstraksi Bertahap:\n`;
    text += recipe.steps
      .map(
        (s, idx) =>
          `${idx + 1}. [${s.time}] ${s.action} ${
            s.valve !== 'TIDAK ADA' ? `(Katup: ${s.valve}) ` : ''
          }→ +${s.amount}ml (Total: ${s.cumulativeAmount}ml)\n   Catatan: ${s.note}`
      )
      .join('\n');
    text += `\n\nEstimasi Total Waktu: ${recipe.time}\nDisangrai oleh 52 Coffee & Roastery Malang.`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 3000);
      });
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pb-24 [&>section+section]:mt-16">
      {/* 1. IN-PAGE STICKY ANCHOR NAVIGATION */}
      <nav
        aria-label="Navigasi Brewing Guidance"
        className="sticky top-[76px] z-30 border-y border-border-subtle bg-surface-bright/95 py-3 shadow-xs backdrop-blur-md"
      >
        <div className="site-container flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('precision-console')}
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold text-brand-maroon bg-brand-maroon/10 border border-brand-maroon/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>BrewLogic Console</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('brewing-methods')}
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-on-surface-variant hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <span>01.</span>
              <span>Brewing Methods</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('recipes')}
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-on-surface-variant hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <span>02.</span>
              <span>Recipes</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('grind-size')}
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-on-surface-variant hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <span>03.</span>
              <span>Grind Size</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('ratio-extraction')}
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-on-surface-variant hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <span>04.</span>
              <span>Ratio &amp; Extraction</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setConsoleStep(3);
              scrollToSection('precision-console');
            }}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 font-mono text-xs font-bold text-white shadow-xs hover:bg-brand-navy-light transition-colors"
          >
            <Timer className="w-3.5 h-3.5 text-brand-teal" />
            <span>Mode Live Timer</span>
          </button>
        </div>
      </nav>

      {/* 2. PRECISION BREWING CONSOLE (ALA BREWLOGIC) */}
      <ReserveLayout
        id="precision-console"
        kicker="Brew with precision"
        title="Rancang resep seduhmu."
        description="Masukkan karakter beans, alat, grinder, dan air. BrewLogic menerjemahkannya menjadi parameter yang bisa langsung dipraktikkan."
        workspaceClassName="space-y-6"
        details={[
          { icon: <Compass className="h-4 w-4" aria-hidden="true" />, title: 'Parameter terarah', description: 'Beans, roast, process, dan target rasa.' },
          { icon: <Sliders className="h-4 w-4" aria-hidden="true" />, title: 'Kalibrasi alat', description: 'Brewer, grinder, serta mineral air.' },
          { icon: <Timer className="h-4 w-4" aria-hidden="true" />, title: 'Pendamping seduh', description: 'Resep bertahap dan live timer dalam satu alur.' },
        ]}
      >
        {/* Step Progression Tabs Header */}
        <div className="flex flex-col gap-4 border-b border-border-subtle pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-brand-charcoal">
              Precision Brewing Console
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2 font-mono text-xs font-bold">
            <button
              type="button"
              onClick={() => setConsoleStep(1)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                consoleStep === 1
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-brand-charcoal'
              }`}
            >
              Step 1: Input
            </button>
            <span className="text-gray-300">/</span>
            <button
              type="button"
              onClick={() => setConsoleStep(2)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                consoleStep === 2
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-brand-charcoal'
              }`}
            >
              Step 2: Resep
            </button>
            <span className="text-gray-300">/</span>
            <button
              type="button"
              onClick={() => setConsoleStep(3)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                consoleStep === 3
                  ? 'bg-brand-navy text-white shadow-xs'
                  : 'text-on-surface-variant hover:text-brand-charcoal'
              }`}
            >
              Step 3: Timer Seduh
            </button>
          </div>
        </div>

        {/* STEP 1 VIEW: INPUT PARAMETERS CONSOLE */}
        {consoleStep === 1 && (
          <div className="rounded-2xl border border-border-subtle bg-white p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in">
            {/* Hot vs Iced Segmented Switch */}
            <div className="mx-auto grid max-w-md grid-cols-2 rounded-2xl border border-border-subtle bg-surface-container-low p-1.5">
              <button
                type="button"
                onClick={() => setTemperatureStyle('hot')}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl py-3 font-mono text-[10px] font-bold transition-all sm:text-xs ${
                  temperatureStyle === 'hot'
                    ? 'bg-brand-maroon text-white shadow-md'
                    : 'text-on-surface-variant hover:text-brand-charcoal'
                }`}
              >
                <Flame className="h-4 w-4 shrink-0" />
                <span>HOT BREW</span>
              </button>
              <button
                type="button"
                onClick={() => setTemperatureStyle('iced')}
                className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl py-3 font-mono text-[10px] font-bold transition-all sm:gap-2 sm:text-xs ${
                  temperatureStyle === 'iced'
                    ? 'bg-brand-teal text-brand-charcoal shadow-md'
                    : 'text-on-surface-variant hover:text-brand-charcoal'
                }`}
              >
                <Droplets className="h-4 w-4 shrink-0" />
                <span className="text-center">ICED / FLASH CHILL</span>
              </button>
            </div>

            {/* Quick 52 Coffee Beans Autofill */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Pilih Cepat Beans Resmi 52 Coffee:
                </span>
                <span className="text-[11px] font-mono text-brand-maroon font-semibold">
                  Otomatis isi asal, proses &amp; sangrai
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {FIFTY_TWO_BEANS.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => select52Bean(b)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold border transition-all ${
                      origin === b.name
                        ? 'bg-brand-maroon/10 border-brand-maroon text-brand-maroon ring-1 ring-brand-maroon'
                        : 'bg-surface-container-low border-border-subtle text-on-surface-variant hover:border-brand-navy hover:text-brand-charcoal'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column Grid Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border-subtle">
              {/* Left Col: Coffee Parameters */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-brand-maroon font-mono text-xs font-bold uppercase">
                  <Coffee className="w-4 h-4" />
                  <span>Karakter Biji Kopi</span>
                </div>

                <div className="space-y-2">
                  <label htmlFor="bean-origin" className="block text-xs font-mono font-bold text-on-surface-variant">
                    Origin / Nama Biji Kopi:
                  </label>
                  <input
                    id="bean-origin"
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Ijen Carbonic Maceration, Sunda Aromanis..."
                    className="w-full rounded-xl border border-border-subtle bg-surface-container-low px-4 py-3 font-sans text-sm text-brand-charcoal focus:border-brand-maroon focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="coffee-dose" className="text-xs font-mono font-bold text-on-surface-variant">
                      Dosis Kopi (Dose in Grams):
                    </label>
                    <span className="font-mono text-sm font-bold text-brand-charcoal">
                      {dose}g
                    </span>
                  </div>
                  <input
                    id="coffee-dose"
                    type="range"
                    min="10"
                    max="30"
                    step="0.5"
                    value={dose}
                    onChange={(e) => setDose(parseFloat(e.target.value))}
                    className="w-full accent-brand-maroon cursor-pointer h-2 bg-surface-container rounded-lg"
                  />
                  <div className="flex gap-2">
                    {[12, 15, 18, 20].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDose(d)}
                        className={`px-2.5 py-1 rounded font-mono text-[11px] font-semibold border ${
                          dose === d
                            ? 'bg-brand-maroon border-brand-maroon text-white'
                            : 'bg-surface-container-low border-border-subtle text-on-surface-variant'
                        }`}
                      >
                        {d}g
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="coffee-process" className="block text-xs font-mono font-bold text-on-surface-variant">
                      Proses Pascapanen:
                    </label>
                    <select
                      id="coffee-process"
                      value={process}
                      onChange={(e) => setProcess(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-container-low px-3 py-3 font-sans text-xs text-brand-charcoal focus:border-brand-maroon focus:outline-none"
                    >
                      {PROCESS_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="coffee-variety" className="block text-xs font-mono font-bold text-on-surface-variant">
                      Varietas Tanaman:
                    </label>
                    <select
                      id="coffee-variety"
                      value={variety}
                      onChange={(e) => setVariety(e.target.value)}
                      className="w-full rounded-xl border border-border-subtle bg-surface-container-low px-3 py-3 font-sans text-xs text-brand-charcoal focus:border-brand-maroon focus:outline-none"
                    >
                      {VARIETY_OPTIONS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-on-surface-variant">
                    Tingkat Sangrai (Roast Profile):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['light', 'medium', 'dark'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoastLevel(r)}
                        className={`py-2.5 rounded-xl font-mono text-xs font-bold uppercase border transition-all ${
                          roastLevel === r
                            ? 'bg-brand-charcoal border-brand-charcoal text-white shadow-xs'
                            : 'bg-surface-container-low border-border-subtle text-on-surface-variant hover:text-brand-charcoal'
                        }`}
                      >
                        {r} Roast
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Hardware & Water Parameters */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-brand-navy font-mono text-xs font-bold uppercase">
                  <Sliders className="w-4 h-4 text-brand-teal" />
                  <span>Hardware &amp; Kalibrasi Alat</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="brewer-hardware" className="text-xs font-mono font-bold text-on-surface-variant">
                      Alat Seduh / Dripper (30+ Pilihan):
                    </label>
                    {BREWER_HARDWARE.find((b) => b.id === brewerId)?.hasValve && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                        Fitur Katup Immersion
                      </span>
                    )}
                  </div>
                  <select
                    id="brewer-hardware"
                    value={brewerId}
                    onChange={(e) => setBrewerId(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-container-low px-4 py-3 font-sans text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                  >
                    {BREWER_HARDWARE.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.brand})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="grinder-model" className="block text-xs font-mono font-bold text-on-surface-variant">
                    Model Grinder Anda (Kalibrasi Klik / Putaran):
                  </label>
                  <select
                    id="grinder-model"
                    value={grinderId}
                    onChange={(e) => setGrinderId(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-container-low px-4 py-3 font-sans text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                  >
                    {GRINDER_DATABASE.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} — [Satuan: {g.unit}]
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] font-mono text-gray-500">
                    Sistem akan menghitung rekomendasi angka klik/putaran spesifik untuk grinder ini.
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="water-source" className="block text-xs font-mono font-bold text-on-surface-variant">
                    Sumber Air Seduh (Kandungan Mineral / TDS):
                  </label>
                  <select
                    id="water-source"
                    value={waterSourceId}
                    onChange={(e) => setWaterSourceId(e.target.value)}
                    className="w-full rounded-xl border border-border-subtle bg-surface-container-low px-4 py-3 font-sans text-sm text-brand-charcoal focus:border-brand-navy focus:outline-none"
                  >
                    {WATER_SOURCES.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.ppm} PPM)
                      </option>
                    ))}
                  </select>
                  {waterSourceId === 'custom' && (
                    <div className="pt-1">
                      <input
                        type="number"
                        value={customPPM}
                        onChange={(e) => setCustomPPM(parseInt(e.target.value, 10) || 0)}
                        placeholder="Masukkan nilai PPM (e.g. 75)"
                        className="w-full rounded-xl border border-border-subtle bg-surface-container-low px-4 py-2.5 font-mono text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Target Cup Flavor Profile Cards */}
            <div className="space-y-3 pt-4 border-t border-border-subtle">
              <span className="block font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Target Profil Rasa (Target Cup Direction):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TARGET_PROFILES.map((p) => {
                  const isSelected = targetProfileId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTargetProfileId(p.id)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-brand-charcoal border-brand-charcoal text-white shadow-md'
                          : 'bg-surface-container-low border-border-subtle hover:border-brand-charcoal/40 text-on-surface-variant'
                      }`}
                    >
                      <span className={`font-editorial text-base font-bold block ${isSelected ? 'text-white' : 'text-brand-charcoal'}`}>
                        {p.label}
                      </span>
                      <span className={`text-xs mt-1 block leading-relaxed font-sans ${isSelected ? 'text-white/80' : 'text-on-surface-variant'}`}>
                        {p.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-6 border-t border-border-subtle flex flex-col items-center">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateRecipe}
                className="w-full sm:w-auto min-h-14 px-10 rounded-2xl bg-brand-maroon hover:bg-brand-maroon/90 text-white font-mono text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>{generatingMessage}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>GENERATE RESEP PRESISI &amp; KALIBRASI KLIK</span>
                  </>
                )}
              </button>
              <p className="mt-2 text-[11px] font-mono text-on-surface-variant">
                Mengintegrasikan algoritma ekstraksi, spesifikasi grinder, dan profil mineral air.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2 VIEW: GENERATED RECIPE DASHBOARD & CALIBRATION */}
        {consoleStep === 2 && (
          <div className="rounded-2xl border border-border-subtle bg-white p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in">
            {/* Summary Banner */}
            <div className="p-5 rounded-xl bg-surface-container-low border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand-maroon uppercase tracking-wider">
                    Resep Terkalibrasi
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    TDS {recipe.waterPPM} PPM
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-navy/10 text-brand-navy font-mono text-[10px] font-bold uppercase">
                    {recipe.temperatureStyle} Brew
                  </span>
                </div>
                <h3 className="font-editorial text-2xl font-bold text-brand-charcoal">
                  {recipe.origin}
                </h3>
                <p className="text-xs font-mono text-on-surface-variant">
                  {recipe.brewerName} • {recipe.roastLevel.toUpperCase()} ROAST • Target:{' '}
                  {recipe.targetProfile.label}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConsoleStep(1)}
                className="inline-flex min-h-11 items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-semibold border border-border-subtle bg-white text-on-surface-variant hover:text-brand-charcoal hover:border-brand-charcoal self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Parameter</span>
              </button>
            </div>

            {/* 4 Hero Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="p-5 rounded-2xl bg-surface-container-low border border-border-subtle space-y-1">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-bold">
                  Total Volume
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-brand-charcoal">
                    {recipe.totalWater}
                  </span>
                  <span className="text-sm font-semibold text-brand-navy">ml</span>
                </div>
                <span className="text-[10px] text-gray-400 block pt-1">
                  Rasio {recipe.ratio} ({recipe.dose}g Kopi)
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-border-subtle space-y-1">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-bold">
                  Target Waktu
                </span>
                <div className="text-3xl sm:text-4xl font-bold text-brand-charcoal">
                  {recipe.time}
                </div>
                <span className="text-[10px] text-gray-400 block pt-1">
                  Total waktu ekstraksi
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-border-subtle space-y-1">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-bold">
                  Suhu Air Seduh
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl sm:text-4xl font-bold text-brand-charcoal">
                    {recipe.temp}
                  </span>
                  <span className="text-lg font-semibold text-brand-maroon">°C</span>
                </div>
                <span className="text-[10px] text-gray-400 block pt-1">
                  Optimal terhadap {recipe.waterPPM} PPM
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-brand-charcoal text-white space-y-1 shadow-md">
                <span className="text-[11px] text-brand-teal uppercase tracking-wider block font-bold">
                  Kalibrasi Grinder
                </span>
                <div className="text-xl sm:text-2xl font-bold text-amber-300 truncate">
                  {recipe.grinderSetting}
                </div>
                <span className="text-[10px] text-gray-300 block truncate pt-1">
                  {recipe.grinderName}
                </span>
              </div>
            </div>

            {/* Split View for Iced Brew */}
            {recipe.iceAmount > 0 && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-cyan-900 font-semibold">Air Seduh Panas:</span>
                  <span className="font-bold text-cyan-950 text-sm">{recipe.brewingWater} ml</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-900 font-semibold">Es Batu di Server:</span>
                  <span className="font-bold text-cyan-950 text-sm">{recipe.iceAmount} gram</span>
                </div>
              </div>
            )}

            {/* Extraction Sequence Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-maroon" />
                  <span>Sekuens Tuangan Bertahap (Extraction Protocol)</span>
                </span>
                {recipe.brewerHardware.hasValve && (
                  <span className="text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                    Perhatikan Status Katup Immersion
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {recipe.steps.map((step, idx) => (
                  <div
                    key={`step-${idx}`}
                    className="p-5 rounded-xl border border-border-subtle bg-surface-container-low hover:bg-white hover:border-brand-navy/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl font-mono text-xs font-bold bg-brand-charcoal text-white flex items-center justify-center shrink-0 mt-0.5">
                        0{idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-editorial text-base font-bold text-brand-charcoal">
                            {step.action}
                          </h4>
                          {step.valve === 'BUKA' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              KATUP BUKA
                            </span>
                          )}
                          {step.valve === 'TUTUP' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              KATUP TUTUP
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
                          {step.note}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:flex-col sm:items-end font-mono shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border-subtle">
                      <div className="text-sm font-bold text-brand-maroon">
                        {step.amount > 0 ? `+${step.amount} ml` : 'Drawdown'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {step.time}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Total: {step.cumulativeAmount} ml
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Copy Recipe, Start Live Brewing */}
            <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={copyRecipeToClipboard}
                className="w-full sm:w-auto min-h-12 px-6 rounded-xl border-2 border-border-subtle hover:border-brand-charcoal bg-white font-mono text-xs font-bold text-brand-charcoal transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Resep Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Salin Resep Teks ke Clipboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setConsoleStep(3);
                  resetTimer();
                  const el = document.getElementById('precision-console');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto min-h-12 px-8 rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Timer className="w-4 h-4 text-brand-teal" />
                <span>Mulai Seduh Sekarang (Buka Timer)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 VIEW: LIVE INTERACTIVE BREWING MODE */}
        {consoleStep === 3 && (
          <div className="rounded-2xl bg-brand-charcoal text-white p-6 sm:p-10 shadow-xl space-y-8 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-maroon text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                    Live Seduh Aktif
                  </span>
                  <span className="font-mono text-xs text-amber-300 font-bold">
                    Target: {recipe.time}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl font-bold text-white">
                  {recipe.origin}
                </h3>
                <p className="font-mono text-xs text-gray-300">
                  {recipe.brewerName} • Suhu {recipe.temp}°C • Grinder:{' '}
                  <span className="text-amber-300 font-bold">{recipe.grinderSetting}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  aria-pressed={soundEnabled}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`min-h-10 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold border flex items-center gap-1.5 ${
                    soundEnabled
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/15 text-gray-400'
                  }`}
                  title="Audio interval chime"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConsoleStep(2)}
                  className="min-h-10 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold border border-white/15 bg-white/5 text-gray-300 hover:text-white"
                >
                  Kembali ke Resep
                </button>
              </div>
            </div>

            {/* Giant Monospace Timer Display & Progress Bar */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-4 backdrop-blur-md">
              <div className="font-mono text-6xl sm:text-8xl font-bold tracking-tight text-white drop-shadow-md" aria-live="polite">
                {formatTimer(seconds)}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden relative">
                <motion.div
                  className="h-full bg-gradient-to-r from-brand-teal via-amber-400 to-brand-maroon rounded-full"
                  style={{
                    width: `${Math.min(100, (seconds / recipe.targetSeconds) * 100)}%`,
                  }}
                />
              </div>

              <div className="text-xs font-mono text-gray-400">
                {timerRunning ? (
                  <span className="text-emerald-400 flex items-center justify-center gap-2 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Sedang Menyeduh... Ikuti instruksi interval tuangan di bawah!
                  </span>
                ) : seconds > 0 ? (
                  <span className="text-amber-300 font-bold">Timer Dijeda</span>
                ) : (
                  <span>Tekan Mulai Seduh saat tuangan pertama menyentuh bubuk kopi</span>
                )}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`min-h-14 flex-1 max-w-sm py-4 px-8 rounded-xl font-mono text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    timerRunning
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-brand-maroon hover:bg-brand-maroon/90 text-white'
                  }`}
                >
                  {timerRunning ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Pause Seduh</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white" />
                      <span>{seconds > 0 ? 'Lanjutkan Seduh' : 'Mulai Seduh (Start)'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="min-h-14 p-4 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 transition-colors"
                  aria-label="Reset timer"
                  title="Reset timer ke nol"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Active Step Highlight Card */}
            {currentActiveStepIndex !== -1 ? (
              <div className="p-6 rounded-2xl bg-brand-navy border-2 border-brand-maroon shadow-lg space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-brand-maroon text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                    LANGKAH AKTIF SEKARANG: TUANGAN 0{currentActiveStepIndex + 1}
                  </span>
                  <span className="font-mono text-xs text-amber-300 font-bold">
                    Interval: {recipe.steps[currentActiveStepIndex].time}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <h4 className="font-editorial text-2xl font-bold text-white">
                    {recipe.steps[currentActiveStepIndex].action}
                  </h4>
                  <div className="text-right font-mono">
                    <span className="text-2xl font-bold text-amber-300">
                      +{recipe.steps[currentActiveStepIndex].amount} ml
                    </span>
                    <span className="block text-[11px] text-gray-300">
                      Target Timbangan: {recipe.steps[currentActiveStepIndex].cumulativeAmount} ml
                    </span>
                  </div>
                </div>

                {recipe.steps[currentActiveStepIndex].valve !== 'TIDAK ADA' && (
                  <div
                    className={`p-2.5 rounded-lg font-mono text-xs font-bold text-center ${
                      recipe.steps[currentActiveStepIndex].valve === 'BUKA'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-400'
                    }`}
                  >
                    STATUS KATUP: {recipe.steps[currentActiveStepIndex].valve} KATUP
                  </div>
                )}

                <p className="text-sm text-gray-200 font-sans leading-relaxed">
                  {recipe.steps[currentActiveStepIndex].note}
                </p>
              </div>
            ) : seconds >= recipe.targetSeconds ? (
              <div className="p-6 rounded-2xl bg-emerald-900/40 border-2 border-emerald-500 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center mx-auto font-bold">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-editorial text-2xl font-bold text-white">
                  Ekstraksi Seduhan Selesai!
                </h4>
                <p className="text-sm text-gray-200 font-sans max-w-lg mx-auto">
                  Angkat dripper, buang ampas kopi, lalu putar (swirl) server kaca Anda beberapa kali sebelum menuangkan ke cangkir. Selamat menikmati specialty coffee 52 Coffee!
                </p>
              </div>
            ) : null}

            {/* All Steps Timeline Checklist */}
            <div className="space-y-3 pt-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-gray-400 block">
                Rangkaian Tuangan Lengkap:
              </span>
              <div className="space-y-2.5">
                {recipe.steps.map((step, idx) => {
                  const isActive = currentActiveStepIndex === idx;
                  const isCompleted = seconds > step.endSec;
                  return (
                    <div
                      key={`seq-${idx}`}
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-white/15 border-brand-maroon'
                          : isCompleted
                          ? 'bg-white/5 border-emerald-500/30 opacity-60'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-brand-maroon text-white'
                              : isCompleted
                              ? 'bg-emerald-500 text-black'
                              : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div>
                          <span className="font-editorial text-sm font-bold text-white block">
                            {step.action}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">
                            {step.time}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-xs font-bold text-amber-300 block">
                          +{step.amount} ml
                        </span>
                        <span className="text-[10px] text-gray-400">
                          (Target {step.cumulativeAmount} ml)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </ReserveLayout>

      {/* 3. SECTION: BREWING METHODS OVERVIEW (#brewing-methods) */}
      <section id="brewing-methods" className="site-container scroll-mt-36 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-5">
          <div>
            <div className="flex items-center gap-2 text-brand-maroon font-mono text-xs font-bold uppercase tracking-wider">
              <span>01. Educational Overview</span>
            </div>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-brand-charcoal">
              Spektrum Metode Seduh Specialty
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant font-sans">
              Setiap brewer dirancang dengan geometri, filter, dan dinamika hidrolik berbeda untuk memandu bagaimana air melarutkan senyawa rasa dari bubuk kopi.
            </p>
          </div>
          <span className="font-mono text-xs text-on-surface-variant font-semibold">
            6 Metode Standar Slowbar
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BREW_TOPICS.map((topic) => {
            const isSelected = brewerId.includes(topic.id.split('-')[0]);
            return (
              <article
                key={topic.id}
                className={`relative flex flex-col justify-between rounded-xl p-6 border transition-all ${
                  isSelected
                    ? 'bg-white border-brand-maroon shadow-md ring-2 ring-brand-maroon/20'
                    : 'bg-white border-border-subtle hover:border-brand-navy/40 shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-maroon">
                      {topic.num}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-surface-container-low text-on-surface-variant border border-border-subtle">
                      {topic.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-editorial text-xl font-bold text-brand-charcoal">
                      {topic.title}
                    </h3>
                    <p className="font-mono text-[11px] text-brand-navy font-medium mt-0.5">
                      {topic.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed font-sans line-clamp-3">
                    {topic.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-border-subtle text-[11px] font-mono">
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Clarity (Kejernihan)</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <span
                            key={`c-${level}`}
                            className={`w-2 h-2 rounded-full ${
                              level <= topic.cupProfile.clarity
                                ? 'bg-brand-teal'
                                : 'bg-surface-container'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-on-surface-variant">
                      <span>Body (Ketebalan)</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <span
                            key={`b-${level}`}
                            className={`w-2 h-2 rounded-full ${
                              level <= topic.cupProfile.body
                                ? 'bg-brand-maroon'
                                : 'bg-surface-container'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-surface-container-low p-3 font-mono text-[11px] space-y-1 text-on-surface-variant">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Filter:</span>
                      <span className="font-bold text-brand-charcoal truncate max-w-[170px]">
                        {topic.filterType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gilingan:</span>
                      <span className="font-bold text-brand-charcoal">
                        {topic.grindSize}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const matchedBrewer = BREWER_HARDWARE.find((b) =>
                        b.id.includes(topic.id.split('-')[0])
                      );
                      if (matchedBrewer) setBrewerId(matchedBrewer.id);
                      setConsoleStep(1);
                      scrollToSection('precision-console');
                    }}
                    className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs font-bold px-4 py-2 rounded-lg bg-surface-container text-brand-charcoal hover:bg-brand-navy hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Muat ke Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-mono text-xs font-bold text-on-surface-variant">
                    {formatTimer(topic.targetSeconds)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. SECTION: RECIPES BARISTA 52 COFFEE (#recipes) */}
      <section id="recipes" className="site-container scroll-mt-36 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-5">
          <div>
            <div className="flex items-center gap-2 text-brand-maroon font-mono text-xs font-bold uppercase tracking-wider">
              <span>02. Tested Roastery Recipes</span>
            </div>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-brand-charcoal">
              Resep Seduh Barista 52 Coffee
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant font-sans">
              Resep ekstraksi yang dikalibrasi harian di tasting room kami untuk mengoptimalkan potensi rasa tiap origin kopi.
            </p>
          </div>
          <span className="font-mono text-xs text-on-surface-variant font-semibold">
            Rekomendasi Berdasarkan Lot Panen
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {CURATED_RECIPES.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-border-subtle bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-maroon/10 text-brand-maroon font-mono text-[11px] font-bold">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>{r.beanName}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-navy">
                    {r.methodName}
                  </span>
                </div>

                <blockquote className="text-xs text-on-surface-variant font-sans italic border-l-2 border-brand-maroon pl-3 leading-relaxed">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-surface-container-low">
                    <span className="text-[10px] text-gray-500 block">Dose:</span>
                    <span className="font-bold text-brand-charcoal text-sm">{r.dose}g</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low">
                    <span className="text-[10px] text-gray-500 block">Air:</span>
                    <span className="font-bold text-brand-charcoal text-sm">{r.waterYield}ml</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low">
                    <span className="text-[10px] text-gray-500 block">Suhu:</span>
                    <span className="font-bold text-brand-charcoal text-sm">{r.temp}°C</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-container-low">
                    <span className="text-[10px] text-gray-500 block">Waktu:</span>
                    <span className="font-bold text-brand-charcoal text-sm">{r.time}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-mono text-gray-400 mr-1">Tasting Notes:</span>
                  {r.notes.map((note) => (
                    <span
                      key={note}
                      className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-mono text-[10px] font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOrigin(r.beanName);
                    setDose(r.dose);
                    setConsoleStep(1);
                    scrollToSection('precision-console');
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 font-mono text-xs font-bold text-white hover:bg-brand-navy-light transition-colors shadow-xs cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Kustomisasi di Console</span>
                </button>

                <Link
                  href={`/catalog/${r.beanId}`}
                  className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs font-semibold text-brand-maroon hover:underline"
                >
                  <span>Lihat Biji Kopi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SECTION: GRIND SIZE GUIDANCE (#grind-size) */}
      <section id="grind-size" className="site-container scroll-mt-36 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-5">
          <div>
            <div className="flex items-center gap-2 text-brand-maroon font-mono text-xs font-bold uppercase tracking-wider">
              <span>03. Particle Calibration</span>
            </div>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-brand-charcoal">
              Panduan Kalibrasi Ukuran Gilingan
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant font-sans">
              Ukuran partikel bubuk menentukan luas area kontak dan laju alir air. Pilih tingkat gilingan sesuai brewer yang Anda gunakan.
            </p>
          </div>
          <span className="font-mono text-xs text-on-surface-variant font-semibold">
            Referensi Mikron &amp; Sensori
          </span>
        </div>

        <div className="overflow-hidden rounded-xl border border-border-subtle bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-surface-container-low border-b border-border-subtle font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                <tr>
                  <th scope="col" className="p-4 sm:p-5 font-bold">Tingkat Gilingan</th>
                  <th scope="col" className="p-4 sm:p-5 font-bold">Estimasi Mikron</th>
                  <th scope="col" className="p-4 sm:p-5 font-bold">Analogi Tekstur Raba</th>
                  <th scope="col" className="p-4 sm:p-5 font-bold">Metode Seduh Cocok</th>
                  <th scope="col" className="p-4 sm:p-5 font-bold">Karakteristik Ekstraksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-normal">
                {GRIND_CHART.map((item) => (
                  <tr key={item.level} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 sm:p-5 font-mono font-bold text-brand-charcoal">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-maroon shrink-0" />
                        <span>{item.level}</span>
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 font-mono text-brand-navy font-semibold">
                      {item.micron}
                    </td>
                    <td className="p-4 sm:p-5 text-on-surface font-medium">
                      {item.analogy}
                    </td>
                    <td className="p-4 sm:p-5">
                      <div className="flex flex-wrap gap-1.5">
                        {item.methods.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-mono text-[10px]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 sm:p-5 text-on-surface-variant leading-relaxed">
                      {item.characteristics}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. SECTION: RATIO & EXTRACTION DYNAMICS (#ratio-extraction) */}
      <section id="ratio-extraction" className="site-container scroll-mt-36 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-5">
          <div>
            <div className="flex items-center gap-2 text-brand-maroon font-mono text-xs font-bold uppercase tracking-wider">
              <span>04. Extraction Dynamics</span>
            </div>
            <h2 className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-brand-charcoal">
              Rasio Seduh &amp; Teori Ekstraksi
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant font-sans">
              Rasio mengatur kekuatan konsentrasi rasa, sedangkan ekstraksi menentukan seberapa banyak senyawa yang larut.
            </p>
          </div>
          <span className="font-mono text-xs text-on-surface-variant font-semibold">
            Prinsip Golden Cup Specialty
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-12 items-stretch">
          <div className="md:col-span-7 rounded-xl border border-border-subtle bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2 text-brand-navy font-mono text-xs font-bold">
              <Compass className="w-4 h-4 text-brand-teal" />
              <span>KOMPAS DINAMIKA EKSTRAKSI KOPI</span>
            </div>
            <h3 className="font-editorial text-2xl font-bold text-brand-charcoal">
              Urutan Senyawa yang Larut Saat Menyeduh
            </h3>
            <div className="space-y-3 font-sans text-xs">
              <div className="space-y-1 rounded-lg border border-border-subtle border-t-2 border-t-amber-400 bg-surface-container-low p-3.5">
                <div className="font-bold text-brand-charcoal font-mono flex items-center justify-between">
                  <span>1. Fase Asam &amp; Enzimatik</span>
                  <span className="text-[10px] text-amber-700">0% - 30% Air</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Senyawa asam buah larut pertama. Jika ekstraksi terhenti di sini, cangkir terasa kecut menusuk dan hampa.
                </p>
              </div>

              <div className="space-y-1 rounded-lg border border-border-subtle border-t-2 border-t-emerald-500 bg-surface-container-low p-3.5">
                <div className="font-bold text-brand-charcoal font-mono flex items-center justify-between">
                  <span>2. Fase Sweetness &amp; Lipid</span>
                  <span className="text-[10px] text-emerald-700">30% - 80% Air</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Zona manis buah matang, madu, dan karamel alami yang melengkapi keasaman awal.
                </p>
              </div>

              <div className="space-y-1 rounded-lg border border-border-subtle border-t-2 border-t-rose-500 bg-surface-container-low p-3.5">
                <div className="font-bold text-brand-charcoal font-mono flex items-center justify-between">
                  <span>3. Fase Pahit &amp; Astringent</span>
                  <span className="text-[10px] text-rose-700">80% - 100% Air</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Senyawa berat memberi struktur dan aftertaste cokelat, namun jika berlebih membuat lidah kering getir.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 rounded-xl border border-border-subtle bg-surface-container-low p-6 sm:p-7 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-maroon font-mono text-xs font-bold">
                <Scale className="w-4 h-4" />
                <span>PEDOMAN RASIO EMAS</span>
              </div>
              <h3 className="font-editorial text-xl font-bold text-brand-charcoal">
                Karakteristik Cangkir Berdasarkan Rasio
              </h3>
              <ul className="space-y-2.5 font-mono text-xs text-on-surface-variant">
                <li className="p-3 rounded-lg bg-white border border-border-subtle">
                  <strong className="text-brand-charcoal">1 : 15 (Intense &amp; Syrupy)</strong>
                  <p className="text-[11px] font-sans text-gray-500 mt-0.5">Body pekat, manis buah dominan, tekstur kental.</p>
                </li>
                <li className="p-3 rounded-lg bg-white border border-border-subtle">
                  <strong className="text-brand-charcoal">1 : 16 (Harmonious Balance)</strong>
                  <p className="text-[11px] font-sans text-gray-500 mt-0.5">Standar specialty: acidity, body, dan sweetness berimbang.</p>
                </li>
                <li className="p-3 rounded-lg bg-white border border-border-subtle">
                  <strong className="text-brand-charcoal">1 : 17 (Delicate &amp; Floral)</strong>
                  <p className="text-[11px] font-sans text-gray-500 mt-0.5">Kejernihan tinggi, aroma bunga merekah, aftertaste ringan.</p>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setConsoleStep(1);
                scrollToSection('precision-console');
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-charcoal text-white font-mono text-xs font-bold hover:bg-brand-charcoal/90 transition-all cursor-pointer"
            >
              <span>Buka Console &amp; Kalibrasi Rasio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
