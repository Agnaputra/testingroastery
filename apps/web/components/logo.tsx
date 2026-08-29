import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  className?: string;
}

export function FiftyTwoLogo({
  size = 'md',
  showText = true,
  textColor = 'dark',
  className = '',
}: LogoProps) {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  const titleSize = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  const subtitleSize = {
    sm: 'text-[8px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* 52 Coffee Official Swirl Logo Mark */}
      <div className={`relative shrink-0 ${iconDimensions} flex items-center justify-center`}>
        <FiftyTwoBeanMark className="w-full h-full object-contain" />
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-headline font-extrabold tracking-wider ${titleSize} ${
              textColor === 'light' ? 'text-white' : 'text-brand-navy'
            }`}
          >
            52 COFFEE
          </span>
          <span
            className={`font-mono tracking-[0.2em] uppercase mt-0.5 ${subtitleSize} ${
              textColor === 'light' ? 'text-brand-teal' : 'text-brand-navy-light'
            }`}
          >
            & ROASTERY • MALANG
          </span>
        </div>
      )}
    </div>
  );
}

export function FiftyTwoBeanMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <img
      src="/images/logo-icon.png"
      alt="52 Coffee Roastery Logo Mark"
      className={`object-contain ${className}`}
    />
  );
}

