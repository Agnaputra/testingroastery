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
import { PageIntro, SectionIntro } from '../../components/ui/page-structure';

export default function AboutPage() {
  return (
    <div className="page-shell">
      <PageIntro
        align="center"
        compact
        kicker="Transparansi dari kebun hingga cangkir"
        icon={<Sparkles size={14} />}
        title="Filosofi sangrai dan ketelusuran kopi"
        description="Dari Malang, kami menjaga setiap proses agar karakter asal kopi tetap jernih, dapat ditelusuri, dan mudah dinikmati."
      />

      <div className="site-container page-section space-y-16">

      {/* Hero Showcase Image & Roastery Ethos */}
      <div className="ui-surface p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-5">
          <span className="badge-crimson">Dikerjakan di Malang</span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-roastery-dark leading-tight">
            Sangrai mikro dengan kontrol suhu presisi
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

        <div className="lg:col-span-6 relative aspect-[4/3] rounded-xl overflow-hidden bg-roastery-light border border-roastery-border shadow-md">
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
        <SectionIntro
          align="center"
          kicker="Tiga pilar utama"
          title="Komitmen transparansi kami"
          description="Standar yang kami pegang dari pemilihan origin hingga kopi tiba di tangan pelanggan."
        />

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
          <span className="badge-crimson bg-roastery-crimson/25 text-roastery-crimson-light border-roastery-crimson/40">Kunjungi tasting room Malang</span>
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

        <div className="relative aspect-video rounded-xl overflow-hidden bg-roastery-charcoal border border-white/10 shadow-lg">
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
    </div>
  );
}
