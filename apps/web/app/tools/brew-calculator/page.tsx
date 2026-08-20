'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Coffee, Droplets, Flame, HelpCircle, BookOpen } from 'lucide-react';
import { BrewCalculator } from '../../../components/brew-calculator';

export default function BrewCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Top Breadcrumb / Back to Home Navigation */}
      <div className="flex items-center justify-between text-xs font-mono">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-roastery-border text-roastery-charcoal hover:text-roastery-crimson hover:border-roastery-crimson transition-all shadow-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="text-roastery-muted hidden sm:flex items-center gap-1.5">
          <Link href="/" className="hover:text-roastery-crimson">Beranda</Link>
          <span>/</span>
          <span className="text-roastery-dark font-semibold">Slowbar Tools & Brew Calculator</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-roastery-border pb-8">
        <div className="flex items-center gap-2 text-roastery-crimson font-mono text-xs uppercase tracking-widest">
          <Sparkles className="w-4 h-4" />
          <span>52 Coffee Precision Extraction Guide</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-roastery-dark mt-2">
          Kalkulator Rasio & Slowbar Companion
        </h1>
        <p className="text-sm sm:text-base text-roastery-muted mt-2 max-w-3xl leading-relaxed">
          Kopi yang luar biasa berakar pada ketepatan perbandingan gramasi bubuk kopi, volume air seduh, suhu ekstraksi, serta ritme tuangan air. Gunakan alat ini untuk menyeduh biji kopi 52 Coffee secara optimal di rumah atau bar kopi kamu.
        </p>
      </div>

      {/* Interactive Brew Calculator Widget */}
      <BrewCalculator />

      {/* Comprehensive Brewing Principles Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="editorial-card p-6 bg-white space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-roastery-crimson/10 text-roastery-crimson flex items-center justify-center">
            <Droplets className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-roastery-dark">
            1. Rasio Kopi & Air (Brew Ratio)
          </h3>
          <p className="text-xs text-roastery-muted leading-relaxed">
            Rasio menentukan kepekatan rasa (Total Dissolved Solids/TDS). Rasio <strong>1:15</strong> menghasilkan rasa tebal dan manis, sementara <strong>1:16.6</strong> memberikan clarity dan sensasi floral yang lebih jernih.
          </p>
        </div>

        <div className="editorial-card p-6 bg-white space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-roastery-slate/15 text-roastery-slate flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-roastery-dark">
            2. Suhu Air Seduh (Water Temp)
          </h3>
          <p className="text-xs text-roastery-muted leading-relaxed">
            Gunakan air <strong>91°C - 93°C</strong> untuk sangrai Light / Light-Medium agar keasaman buah keluar tanpa rasa pahit berlebih. Untuk profil Medium-Dark Espresso Roast, turunkan suhu ke <strong>88°C - 90°C</strong>.
          </p>
        </div>

        <div className="editorial-card p-6 bg-white space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-roastery-teal/20 text-roastery-teal flex items-center justify-center">
            <Coffee className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-roastery-dark">
            3. Derajat Gilingan (Grind Size)
          </h3>
          <p className="text-xs text-roastery-muted leading-relaxed">
            Jika seduhan terasa terlalu pahit atau sepat (over-extraction), giling sedikit lebih kasar. Sebaliknya jika seduhan terasa encer, asam menusuk, atau hambar (under-extraction), haluskan ukuran gilingan.
          </p>
        </div>
      </div>
    </div>
  );
}
