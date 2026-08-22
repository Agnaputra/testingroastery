import React from 'react';
import Link from 'next/link';
import { FiftyTwoLogo } from './logo';

export function Footer() {
  return (
    <footer className="bg-[#101A26] text-white pt-16 pb-12 border-t border-white/10 w-full mt-auto">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Newsletter */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <FiftyTwoLogo size="md" textColor="light" />
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Dapatkan info jadwal sangrai terbaru, diskon micro-lot eksklusif, dan panduan kalibrasi seduh mingguan dari roastery kami di Malang.
            </p>
            <div className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Masukkan email Anda"
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#D8B168] flex-1"
              />
              <button className="px-5 py-3 rounded-xl bg-[#D8B168] hover:bg-[#C9A255] text-[#162A43] font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md">
                Subscribe
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3 font-mono text-xs">
            <span className="text-[11px] uppercase tracking-widest text-[#D8B168] font-bold block">
              Slowbar Menu
            </span>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/catalog?category=filter" className="hover:text-white transition-colors">
                  Filter Beans
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=espresso" className="hover:text-white transition-colors">
                  Espresso Blends
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=reserve" className="hover:text-white transition-colors">
                  Grand Reserve
                </Link>
              </li>
              <li>
                <Link href="/blend-builder" className="hover:text-white transition-colors">
                  Custom Blend (BYOB)
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Guides */}
          <div className="lg:col-span-2 space-y-3 font-mono text-xs">
            <span className="text-[11px] uppercase tracking-widest text-[#D8B168] font-bold block">
              Tools &amp; Info
            </span>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/guide" className="hover:text-white transition-colors">
                  Brewing Guide
                </Link>
              </li>
              <li>
                <Link href="/tools/brew-calculator" className="hover:text-white transition-colors">
                  Brew Calculator
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Roastery
                </Link>
              </li>
              <li>
                <Link href="/work-with-us" className="hover:text-white transition-colors">
                  B2B Wholesale
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational & Address */}
          <div className="lg:col-span-3 space-y-3 font-mono text-xs">
            <span className="text-[11px] uppercase tracking-widest text-[#D8B168] font-bold block">
              Tasting Room Malang
            </span>
            <p className="text-gray-400 leading-relaxed">
              📍 Jl. KH. Agus Salim No. 11, Klojen, Kota Malang, Jawa Timur.
            </p>
            <p className="text-gray-400">
              🕒 Senin - Jumat: 11.00 - 16.00 WIB
            </p>
            <a
              className="inline-block text-[#D8B168] hover:underline font-semibold mt-1"
              href="https://instagram.com/52coffeeroastery"
              target="_blank"
              rel="noreferrer"
            >
              📸 @52coffeeroastery
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-mono gap-4">
          <p>© {new Date().getFullYear()} 52 Coffee &amp; Roastery Malang. Crafted with Purpose, Roasted with Care.</p>
          <div className="flex gap-6">
            <Link href="/guide" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/guide" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
