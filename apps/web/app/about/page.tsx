'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  MapPin,
  Clock,
  Coffee,
  Flame,
  Award,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

      {/* Header Banner */}
      <div className="border-b border-roastery-border pb-8 text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-roastery-border shadow-sm text-xs font-mono text-roastery-crimson">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRANSPARENT COFFEE & SPECIALTY ROASTERY</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-roastery-dark leading-tight">
          Filosofi Sangrai & Ketelusuran Kopi 52 Coffee
        </h1>
        <p className="text-sm sm:text-base text-roastery-muted font-sans leading-relaxed">
          Berasal dari jantung Kota Malang, kami mendedikasikan setiap proses untuk menghasilkan kopi dengan rasa jernih, transparan dari kebun hingga cangkir, dan dapat dinikmati dengan presisi.
        </p>
      </div>

      {/* Hero Showcase Image & Roastery Ethos */}
      <div className="editorial-card p-6 sm:p-10 bg-white grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
        <div className="lg:col-span-6 space-y-5">
          <span className="badge-crimson font-mono">Our Craft in Malang</span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-roastery-dark leading-tight">
            Micro-Batch Roasting dengan Kontrol Suhu Presisi
          </h2>
          <p className="text-xs sm:text-sm text-roastery-charcoal leading-relaxed">
            Di 52 Coffee & Roastery, kami menyangrai kopi dalam kelompok kecil (small-batch 1-5kg). Pendekatan ini memungkinkan kami memantau kurva suhu (Rate of Rise / RoR), aliran udara (airflow), dan waktu development phase dengan ketelitian hingga 0.1°C.
          </p>
          <p className="text-xs sm:text-sm text-roastery-muted leading-relaxed">
            Hasilnya adalah rasa manis karamelisasi alami yang utuh, tanpa cacat rasa terbakar (scorching) atau rasa langu (underdeveloped).
          </p>

          <div className="pt-2 grid grid-cols-2 gap-4 border-t border-roastery-border text-xs font-mono">
            <div>
              <span className="text-[10px] text-roastery-muted uppercase block">SCA Cupping QC</span>
              <strong className="text-base text-roastery-dark font-bold">84+ Points</strong>
            </div>
            <div>
              <span className="text-[10px] text-roastery-muted uppercase block">Batch Consistency</span>
              <strong className="text-base text-roastery-crimson font-bold">99.8% Profile Match</strong>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden bg-roastery-light border border-roastery-border shadow-md">
          <Image
            src="/images/canva-roaster-drum.jpg"
            alt="52 Coffee Roasting Process"
            fill
            sizes="500px"
            className="object-cover"
          />
        </div>
      </div>

      {/* 3 Pillars of Transparency */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-roastery-crimson">
            3 Pilar Utama 52 Coffee
          </span>
          <h2 className="font-editorial text-3xl font-bold text-roastery-dark">
            Komitmen Transparansi Kami
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="editorial-card p-6 bg-white space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-roastery-crimson/10 text-roastery-crimson flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-roastery-dark">
              1. Direct Trade &amp; Petani Lokal
            </h3>
            <p className="text-xs text-roastery-muted leading-relaxed">
              Bekerjasama langsung dengan kelompok tani di lereng Kawah Ijen, Gunung Argopuro, dan Gunung Puntang. Kami membayar harga di atas rata-rata pasar untuk mendukung kesejahteraan petani ceri matang.
            </p>
          </div>

          <div className="editorial-card p-6 bg-white space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-roastery-slate/15 text-roastery-slate flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-roastery-dark">
              2. Scientific Roasting Profile
            </h3>
            <p className="text-xs text-roastery-muted leading-relaxed">
              Setiap origin memiliki profil sangrai unik yang diuji melalui sesi *cupping* berulang hingga kami menemukan titik manis (*sweet spot*) antara keasaman buah dan kekayaan *body*.
            </p>
          </div>

          <div className="editorial-card p-6 bg-white space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-roastery-teal/20 text-roastery-teal flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-roastery-dark">
              3. Valve Packaging &amp; Freshness
            </h3>
            <p className="text-xs text-roastery-muted leading-relaxed">
              Biji kopi dikemas dalam *foil pouch* dengan *one-way degassing valve* untuk membuang gas CO2 alami tanpa membiarkan oksigen masuk, menjaga rasa optimal selama berbulan-bulan.
            </p>
          </div>
        </div>
      </div>

      {/* Tasting Room Location Malang */}
      <div className="editorial-card p-8 sm:p-12 bg-roastery-dark text-white border border-roastery-charcoal grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <span className="badge-crimson font-mono bg-roastery-crimson/25 text-roastery-crimson-light border-roastery-crimson/40">Visit Tasting Room Malang</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white">
            Mari Mampir dan Berdiskusi Kopi Bersama Kami
          </h2>
          <p className="text-xs sm:text-sm text-roastery-muted leading-relaxed">
            Ingin mencicipi seduhan langsung di bar atau berkonsultasi mengenai pemilihan biji kopi untuk kedai kopi Anda? Kunjungi tasting room kami di Malang.
          </p>

          <div className="space-y-2.5 pt-2 text-xs font-mono">
            <div className="flex items-start gap-2 text-roastery-light">
              <MapPin className="w-4 h-4 text-roastery-teal shrink-0 mt-0.5" />
              <span>Jl. KH. Agus Salim No. 11, Sukoharjo, Klojen, Kota Malang, Jawa Timur 65118</span>
            </div>
            <div className="flex items-center gap-2 text-roastery-light">
              <Clock className="w-4 h-4 text-roastery-teal shrink-0" />
              <span>Buka Senin - Jumat: 11.00 - 16.00 WIB</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <a
              href="https://maps.google.com/?q=52+Coffee+Roastery+Malang"
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs"
            >
              <span>Buka Petunjuk Google Maps</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/catalog" className="btn-secondary text-xs bg-transparent border-white/30 text-white hover:bg-white hover:text-roastery-dark">
              Beli Online
            </Link>
          </div>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden bg-roastery-charcoal border border-white/10 shadow-lg">
          <Image
            src="/images/canva-cafe-table.jpg"
            alt="52 Coffee Tasting Room Malang"
            fill
            sizes="500px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
