import React from 'react';

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
      {/* 52 Coffee Signature Oceanic Swirl Logo Mark from Slowbar PDF */}
      <div className={`relative shrink-0 ${iconDimensions} flex items-center justify-center`}>
        <FiftyTwoBeanMark className="w-full h-full" />
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-editorial font-bold tracking-wider ${titleSize} ${
              textColor === 'light' ? 'text-white' : 'text-brand-navy'
            }`}
          >
            52 COFFEE
          </span>
          <span
            className={`font-mono tracking-[0.2em] uppercase mt-0.5 ${subtitleSize} ${
              textColor === 'light' ? 'text-brand-teal-light' : 'text-brand-navy-light'
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
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Upper Arch - Deep Navy Blue (#223C5E) */}
      <path
        d="M50 10C68 10 88 22 90 46C92 68 76 86 54 89C51 89.4 47 89 44 88C64 83 76 68 74 49C72 31 58 22 43 23C32 23.5 24 28 18 36C22 22 34 10 50 10Z"
        fill="#223C5E"
      />
      {/* Center S-Curve Bean Silhouette / Oceanic Teal Swirl (#2698AB) */}
      <path
        d="M20 42C24 33 34 26 46 27C60 28 72 38 72 52C72 65 60 76 46 76C32 76 22 66 22 53C22 47 25 43 30 40C38 36 46 41 53 45C60 49 66 49 68 44C66 38 58 33 48 33C38 33 30 38 26 44C23 48 21 53 21 58C14 54 13 46 20 42Z"
        fill="#2698AB"
      />
      {/* Lower Arc & Bean Core Shade (#1B304B) */}
      <path
        d="M48 76C62 76 74 65 74 51C74 48 73 45 72 42C74 54 67 67 54 71C44 74 34 71 27 64C32 72 40 76 48 76Z"
        fill="#1B304B"
      />
      {/* Central Clean Coffee Bean Cleft / Negative Space */}
      <path
        d="M36 45C42 42 49 45 54 49C59 53 64 53 66 50C64 56 57 60 50 59C42 58 37 52 36 45Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
