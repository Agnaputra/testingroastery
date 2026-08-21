import React from 'react';
import Link from 'next/link';
import { FiftyTwoLogo } from './logo';

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-border-subtle w-full py-16 px-4 sm:px-10 mt-auto">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-3">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <FiftyTwoLogo size="md" textColor="dark" />
          </Link>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Crafted with Purpose, Roasted with Care. Single origin artisanal roastery berfokus pada varietas pilihan dan inovasi pascapanen Nusantara hingga Grand Reserve dunia.
          </p>
          <div className="pt-2 text-xs font-mono text-brand-navy">
            <p className="font-semibold">📍 Jl. KH. Agus Salim No. 11, Malang</p>
            <p className="text-on-surface-variant mt-0.5">Slowbar &amp; Tasting Room</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <h4 className="font-bold text-brand-navy uppercase tracking-wider mb-1 font-mono">Slowbar Menu</h4>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/catalog?category=filter">
            Filter Based Roast (Single Origin)
          </Link>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/catalog?category=espresso">
            Espresso Based Roast Profiles
          </Link>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/catalog?category=reserve">
            Grand Reserve Micro-Lot Series
          </Link>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/blend-builder">
            Custom Blend Builder
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <h4 className="font-bold text-brand-navy uppercase tracking-wider mb-1 font-mono">Tools &amp; Guides</h4>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/guide">
            Slowbar Brew Recipe Guide
          </Link>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/tools/brew-calculator">
            Brew Ratio Calculator
          </Link>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/tools/price-calculator">
            Price Calculator
          </Link>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/track">
            Track Order
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <h4 className="font-bold text-brand-navy uppercase tracking-wider mb-1 font-mono">Connect</h4>
          <a
            className="text-on-surface-variant hover:text-brand-navy transition-colors font-medium"
            href="https://instagram.com/52coffeeroastery"
            target="_blank"
            rel="noreferrer"
          >
            📸 @52coffeeroastery
          </a>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/work-with-us">
            Work with Us (B2B Wholesale)
          </Link>
          <Link className="text-on-surface-variant hover:text-brand-navy transition-colors" href="/about">
            About 52 Coffee &amp; Roastery
          </Link>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto border-t border-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
        <p className="italic font-editorial">Crafted with Purpose, Roasted with Care • @52coffeeroastery · Jl. KH. Agus Salim No. 11, Malang</p>
        <p>© 2024-2026 52 Coffee &amp; Roastery. All rights reserved.</p>
      </div>
    </footer>
  );
}
