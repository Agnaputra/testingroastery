import React from 'react';
import Link from 'next/link';
import { FiftyTwoLogo } from './logo';
import { ArrowUpRight, Clock3, Instagram, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white pt-16 pb-24 sm:pb-10 border-t border-white/10 w-full mt-auto">
      <div className="site-container space-y-12">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10">
          {/* Newsletter */}
          <div className="col-span-2 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <FiftyTwoLogo size="md" textColor="light" />
            </div>
            <p className="text-sm text-white/70 max-w-xs leading-7">
              Dari origin pilihan hingga cangkir harianmu. Dikurasi dan disangrai dengan presisi di Malang.
            </p>
            <a href="https://instagram.com/52coffeeroastery" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-mist hover:text-white">
              <Instagram aria-hidden="true" className="h-4 w-4" /> Ikuti cerita kami <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-4 text-sm">
            <span className="text-[11px] uppercase tracking-widest text-[#8FB9BC] font-bold block">
              Koleksi Kopi
            </span>
            <ul className="text-white/75 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
              <li>
                <Link href="/catalog?category=filter" className="hover:text-white transition-colors">
                  Filter Roast
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=espresso" className="hover:text-white transition-colors">
                  Espresso Roast
                </Link>
              </li>
              <li>
                <Link href="/catalog?series=Grand%20Reserve" className="hover:text-white transition-colors">
                  Grand Reserve
                </Link>
              </li>
              <li>
                <Link href="/blend-builder" className="hover:text-white transition-colors">
                  Peracik Blend
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Guides */}
          <div className="lg:col-span-2 space-y-4 text-sm">
            <span className="text-[11px] uppercase tracking-widest text-[#8FB9BC] font-bold block">
              Jelajahi
            </span>
            <ul className="text-white/75 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
              <li>
                <Link href="/guide" className="hover:text-white transition-colors">
                  Panduan Seduh
                </Link>
              </li>
              <li>
                <Link href="/tools/brew-calculator" className="hover:text-white transition-colors">
                  Kalkulator Seduh
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Tentang Roastery
                </Link>
              </li>
              <li>
                <Link href="/work-with-us" className="hover:text-white transition-colors">
                  Kemitraan B2B
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational & Address */}
          <div className="col-span-2 lg:col-span-4 lg:pl-8 space-y-4 text-sm">
            <span className="text-[11px] uppercase tracking-widest text-[#8FB9BC] font-bold block">
              Temui kami di Malang
            </span>
            <p className="flex items-start gap-3 text-white/75 leading-7">
              <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-teal" /> Jl. KH. Agus Salim No. 11, Klojen, Kota Malang, Jawa Timur.
            </p>
            <p className="flex items-start gap-3 text-white/75 leading-7">
              <Clock3 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-teal" /> Senin–Jumat: 11.00–16.00 WIB
            </p>
            <a
              className="inline-flex min-h-11 items-center gap-2 text-brand-mist hover:underline"
              href="https://instagram.com/52coffeeroastery"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram aria-hidden="true" className="h-4 w-4" /> @52coffeeroastery
            </a>
          </div>
        </div>

        <div className="pt-7 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs leading-6 text-white/60 gap-4">
          <p>© {new Date().getFullYear()} 52 Coffee &amp; Roastery.</p>
          <Link href="/about" className="inline-flex min-h-11 items-center gap-2 hover:text-white">Artisanal roasting. Precision extraction.<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
        </div>
      </div>
    </footer>
  );
}
