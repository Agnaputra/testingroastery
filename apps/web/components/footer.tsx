import React from 'react';
import Link from 'next/link';
import { FiftyTwoLogo } from './logo';
import { ArrowUpRight, Clock3, Instagram, MapPin, MessageCircle, ShoppingBag } from 'lucide-react';

import {
  TOKOPEDIA_URL,
  TIKTOK_URL,
  WHATSAPP_URL,
  WHATSAPP_NUMBER,
  INSTAGRAM_URL,
} from '../lib/data';

export function Footer() {
  return (
    <footer className="bg-brand-charcoal text-white pt-16 pb-24 sm:pb-10 border-t border-white/10 w-full mt-auto">
      <div className="site-container space-y-12">
        <div className="border-b border-white/25 pb-8">
          <p aria-hidden="true" className="overflow-hidden whitespace-nowrap font-headline text-[clamp(3.2rem,11vw,10rem)] font-black leading-none tracking-[-0.085em] text-white">
            52 COFFEE
          </p>
          <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-mist">
            Roastery / Malang / Indonesia
          </p>
        </div>
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
            <span className="text-[11px] font-semibold text-brand-teal block">
              Catalog
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
                  Build Your Own Blend
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Guides */}
          <div className="lg:col-span-2 space-y-4 text-sm">
            <span className="text-[11px] font-semibold text-brand-teal block">
              Coffee Lab
            </span>
            <ul className="text-white/75 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
              <li>
                <Link href="/guide" className="hover:text-white transition-colors">
                  Brewing Guidance
                </Link>
              </li>
              <li>
                <Link href="/blend-builder" className="hover:text-white transition-colors">
                  Build Your Own Blend
                </Link>
              </li>
              <li>
                <Link href="/work-with-us" className="hover:text-white transition-colors">
                  Kemitraan Bisnis
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational & Address */}
          <div className="col-span-2 lg:col-span-4 lg:pl-8 space-y-4 text-sm">
            <span className="text-[11px] font-semibold text-brand-teal block">
              Temui kami di Malang
            </span>
            <p className="flex items-start gap-3 text-white/75 leading-7">
              <MapPin aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-teal" /> Jl. KH. Agus Salim No. 11, Klojen, Kota Malang, Jawa Timur.
            </p>
            <p className="flex items-start gap-3 text-white/75 leading-7">
              <Clock3 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-brand-teal" /> Senin–Minggu: 10.00–20.00 WIB
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-brand-mist">
              <a className="inline-flex min-h-11 items-center gap-2 hover:text-white" href={INSTAGRAM_URL} target="_blank" rel="noreferrer"><Instagram aria-hidden="true" className="h-4 w-4" /> Instagram</a>
              <a className="inline-flex min-h-11 items-center gap-2 hover:text-white" href={WHATSAPP_URL} target="_blank" rel="noreferrer"><MessageCircle aria-hidden="true" className="h-4 w-4" /> {WHATSAPP_NUMBER}</a>
              <a className="inline-flex min-h-11 items-center gap-2 hover:text-white" href={TOKOPEDIA_URL} target="_blank" rel="noreferrer"><ShoppingBag aria-hidden="true" className="h-4 w-4" /> Tokopedia</a>
              <a className="inline-flex min-h-11 items-center gap-2 hover:text-white" href={TIKTOK_URL} target="_blank" rel="noreferrer">TikTok <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        <div className="pt-7 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs leading-6 text-white/60 gap-4">
          <p>© {new Date().getFullYear()} 52 Coffee &amp; Roastery.</p>
          <Link href="/about" className="inline-flex min-h-11 items-center gap-2 hover:text-white">Sangrai terukur, rasa yang jernih.<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
        </div>
      </div>
    </footer>
  );
}
