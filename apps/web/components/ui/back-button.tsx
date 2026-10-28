'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

export interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
  variant?: 'outline' | 'ghost' | 'pill' | 'subtle';
  ariaLabel?: string;
}

export function BackButton({
  fallbackHref = '/',
  label = 'Kembali',
  className,
  variant = 'outline',
  ariaLabel = 'Kembali ke halaman sebelumnya',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // If browser has history within the session and referrer is same origin, go back to previous page
    if (typeof window !== 'undefined' && window.history.length > 1) {
      if (document.referrer) {
        try {
          const referrerUrl = new URL(document.referrer);
          if (referrerUrl.origin === window.location.origin) {
            router.back();
            return;
          }
        } catch {
          // If URL parsing fails, proceed to fallback
        }
      } else {
        // History exists in tab
        router.back();
        return;
      }
    }

    // Direct visit or external referrer fallback
    router.push(fallbackHref);
  };

  const variantStyles = {
    outline:
      'border border-border-subtle bg-white text-brand-charcoal hover:border-brand-navy/40 hover:text-brand-navy hover:bg-black/[0.02]',
    ghost:
      'border-transparent bg-transparent text-on-surface-variant hover:text-brand-charcoal hover:bg-black/[0.04]',
    pill:
      'rounded-full border border-border-subtle bg-white text-brand-charcoal hover:border-brand-navy hover:text-brand-navy shadow-2xs',
    subtle:
      'border border-black/10 bg-black/[0.03] text-brand-charcoal hover:bg-black/[0.06] hover:border-black/20',
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={ariaLabel}
      className={clsx(
        'group inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy select-none',
        variantStyles[variant],
        className
      )}
    >
      <ChevronLeft
        size={15}
        className="shrink-0 transition-transform duration-150 group-hover:-translate-x-0.5"
        aria-hidden="true"
      />
      <span>{label}</span>
    </button>
  );
}
