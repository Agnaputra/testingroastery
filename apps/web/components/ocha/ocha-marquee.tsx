import React from 'react';

interface OchaMarqueeProps {
  text?: string;
  variant?: 'navy' | 'teal' | 'mist' | 'crimson' | 'charcoal' | 'pink' | 'lime' | 'black' | 'cream';
  className?: string;
  reverse?: boolean;
}

export function OchaMarquee({
  text = 'THE BEST PLANS START WITH ARTISANAL COFFEE ✦ 52 COFFEE & ROASTERY ✦ TASTE THE TERROIR ✦ SMALL-BATCH ROASTED IN MALANG ✦',
  variant = 'navy',
  className = '',
  reverse = false,
}: OchaMarqueeProps) {
  const bgStyles = {
    navy: 'bg-[#465C70] text-white border-[#2C3136]',
    teal: 'bg-[#8FB9BC] text-[#2C3136] border-[#2C3136]',
    mist: 'bg-[#CFE8EA] text-[#2C3136] border-[#2C3136]',
    crimson: 'bg-[#A52136] text-white border-[#2C3136]',
    charcoal: 'bg-[#2C3136] text-[#CFE8EA] border-[#2C3136]',
    pink: 'bg-[#CFE8EA] text-[#2C3136] border-[#2C3136]',
    lime: 'bg-[#8FB9BC] text-[#2C3136] border-[#2C3136]',
    black: 'bg-[#2C3136] text-[#CFE8EA] border-[#2C3136]',
    cream: 'bg-[#F0F5F7] text-[#2C3136] border-[#2C3136]',
  }[variant];

  const repeatedText = Array(4).fill(text).join(' ');

  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden border-y-2 py-3 select-none ${bgStyles} ${className}`}
    >
      <div className={`flex w-max whitespace-nowrap will-change-transform ${reverse ? 'animate-[marquee_28s_linear_infinite_reverse]' : 'animate-[marquee_28s_linear_infinite]'}`}>
        <span className="font-anton text-lg sm:text-2xl md:text-3xl tracking-wider uppercase px-2">
          {repeatedText}
        </span>
        <span className="font-anton text-lg sm:text-2xl md:text-3xl tracking-wider uppercase px-2">
          {repeatedText}
        </span>
      </div>
    </div>
  );
}
