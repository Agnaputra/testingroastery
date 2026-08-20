import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-border-subtle w-full py-16 px-4 sm:px-10 mt-auto">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <Link href="/" className="text-xl font-editorial font-black tracking-tighter text-primary mb-4 block">
            52 COFFEE
          </Link>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Join us in raising the bar without inflating the cost. We source carefully, roast with intention, and share full transparency in every cup.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <h4 className="font-bold text-on-surface uppercase tracking-wider mb-1 font-mono">Shop</h4>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/catalog">
            Shop All
          </Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/blend-builder">
            Custom Blend (BYOB)
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <h4 className="font-bold text-on-surface uppercase tracking-wider mb-1 font-mono">Learn</h4>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/guide">
            Brew Guides
          </Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/tools/price-calculator">
            Price Calculator
          </Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/track">
            Find Your Order
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <h4 className="font-bold text-on-surface uppercase tracking-wider mb-1 font-mono">Connect</h4>
          <Link className="text-on-surface-variant hover:text-primary transition-colors" href="/work-with-us">
            Work with Us (B2B)
          </Link>
          <a
            className="text-on-surface-variant hover:text-primary transition-colors"
            href="https://instagram.com/52coffeeroastery"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto border-t border-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
        <p>© 2024-2025 CV NGALAM INDONESIA RESERVE COFFEE. Made with love, 52 Coffee Team.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Terms &amp; Conditions</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
