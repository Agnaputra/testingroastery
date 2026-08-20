'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Coffee,
  Sparkles,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { BrewCalculator } from '../../components/brew-calculator';

export default function SpecialtyBrewGuidePage() {
  const [activeTopic, setActiveTopic] = useState<'rest' | 'storage' | 'filter' | 'espresso' | 'water'>('filter');

  return (
    <div className="w-full bg-[#131313] text-gray-100 font-sans min-h-screen">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs font-mono">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-gray-300 hover:text-white hover:border-roastery-crimson transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-gray-500 hidden sm:inline">52 Coffee Brew Standard</span>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Exact Figma Layout & Crimson/Green Gradient)             */}
      {/* ========================================================================= */}
      <section className="relative h-[650px] sm:h-[750px] w-full flex items-center justify-start overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmjLb1nVqE4hoN9eGAaRXrdu39eTNYrOCSH4X5ZKNgkhdPMQlHFkU5X-nE91KDvRr6zpY2slcQYFLbXZM0uQM-j2O_4nBlYgYuZBZP3rRj4PBS9-4ZHmodFRJzipd8pvC17QZuYJtXBa5Pqt8CPAVx1wrPGYg_jQwXoq38TC_czK2cVVoHXbhgomuLZFwFuuKEbV1W9EKp1D_N5DwmALsCG6t8AiBgyJCtf9P0ln_jQJXk_rqSSbayjQ')`,
          }}
        />
        {/* Figma Hero Gradient */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(183, 0, 17, 0.45) 0%, rgba(183, 0, 17, 0.92) 100%)',
          }}
        />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-6">
          <p className="font-mono text-xs text-[#10B981] tracking-widest uppercase font-bold">
            Tasting Room / 52 Coffee
          </p>
          <h1 className="font-editorial text-5xl sm:text-7xl font-black max-w-3xl leading-[1.08]">
            Brewing
            <br />
            with <span className="text-[#10B981] italic font-normal">52</span>.
            <br />
            Made simple.
          </h1>
          <p className="text-sm sm:text-base lg:text-lg max-w-xl text-gray-200 leading-relaxed font-sans">
            The recipes we use every day at 52 Coffee — start with the base, taste, then adjust your grind, water, or ratio.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT SPLIT (Exact Figma: Sidebar + Gear Gallery)               */}
      {/* ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-1/4 pr-0 md:pr-8 md:border-r border-white/10">
          <h3 className="font-mono text-xs text-[#10B981] tracking-widest uppercase mb-6 font-bold">
            Topics
          </h3>
          <ul className="space-y-4 font-mono text-sm">
            {[
              { id: 'rest', num: '02', label: 'Rest & Degassing' },
              { id: 'storage', num: '03', label: 'Bean Storage' },
              { id: 'filter', num: '04', label: 'Filter' },
              { id: 'espresso', num: '05', label: 'Espresso' },
              { id: 'water', num: '06', label: 'Water Mineral' },
            ].map((topic) => (
              <li
                key={topic.id}
                className={
                  activeTopic === topic.id
                    ? 'border-l-2 border-[#10B981] -ml-[1px] pl-3 text-[#10B981] font-bold'
                    : 'pl-3 text-gray-400 hover:text-white transition-colors cursor-pointer'
                }
                onClick={() => setActiveTopic(topic.id as any)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-mono">{topic.num}</span>
                  <span>{topic.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4 pl-0 md:pl-8 space-y-12">
          <div>
            <p className="font-mono text-xs text-[#10B981] tracking-widest uppercase mb-3 border-b border-white/10 pb-2 inline-block font-bold">
              <span className="mr-2">04</span> Filter
            </p>
            <h2 className="font-editorial text-4xl sm:text-5xl font-bold mb-4 text-white">
              Filter <span className="text-[#10B981] italic font-light">brewing.</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed font-sans">
              Pour-over is where origin character lives. The setup matters less than the routine — same gear, same recipe, taste, then adjust.
            </p>
          </div>

          {/* Gear & Tasting Gallery Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group space-y-3">
              <div className="w-full h-72 bg-[#1b1b1b] rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF-FJJLXO1N6BkoYE1FvmIcd_hQ88PIE9bZJl6RP93Tlg1i6DEHNfR3gSQQQtgY4qzGVEMSl8Gp1Eg4iFi2j2fwS1HBfv_5pmvC8XL5IdoTjSI4IqhK0KguCD-xL8WbofMwy4Ieh_JyJAu20i9XnSCpB0bQ3-zgfXKQnxMo9brxFsgKApSM0IPQKZ9cV_LlkWoOoTAEOWbMK1HNPQYtsh7k0D_ZVpsXezSEJ3cxeECrrQtwX5vh0-Vhw"
                  alt="Weber EG-1 with ULF burrs"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-xs text-gray-400 italic">
                Weber EG-1 with ULF burrs. Uniformitas partikel maksimum untuk kejernihan cup.
              </p>
            </div>

            <div className="group space-y-3">
              <div className="w-full h-72 bg-[#1b1b1b] rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA04t7aulnhGsHGZUctf7vQpgwX09ICMXlnqdUvhRzfnLvriDqoIBI00U0ENEQ9lYSiQg0WD80EQfaju2sFT6qQKN4TEaD1GoCDRiYudF7kfSaBt-QPNG6as8uixNkDhPa5wpjqr0W6f5uDiY925bmDg2s7TVfIfmx3_liz_HPqzOW9gGNBOw-jnRdt8QWnfiJ2uy6nskOINpvuKEi1oXbBI0ue3rQkabnh8Ao_SzPlsT3CeaZGrHlL1w"
                  alt="Glass V60 dripper on digital scale"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-xs text-gray-400 italic">
                Dripper, scale, and timer. Kunci konsistensi ekstraksi pour-over harian.
              </p>
            </div>

            <div className="group space-y-3">
              <div className="w-full h-72 bg-[#1b1b1b] rounded-2xl overflow-hidden relative border border-white/10 shadow-lg">
                <img
                  src="/images/tasting-room-footage.png"
                  alt="52 Coffee Tasting Room - Take the shot then take the sip"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="text-xs text-[#10B981] font-mono italic">
                &#34;Take the shot then take the sip.&#34; Kalibrasi espresso bar &amp; slowbar Malang.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE RATIO CALCULATOR EMBEDDED                                   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="p-6 sm:p-10 rounded-3xl bg-[#1A1D21] border border-white/10 shadow-2xl">
          <BrewCalculator />
        </div>
      </section>
    </div>
  );
}
