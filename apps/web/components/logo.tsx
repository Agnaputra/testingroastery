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
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSize = {
    sm: 'text-sm',
    md: 'text-lg',
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
      {/* 52 Coffee Signature Bean Swirl Icon with Crimson / Amber Ring */}
      <div className={`relative shrink-0 ${iconDimensions} group`}>
        {/* Outer Ring with Gradient border matching IG Avatar */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-roastery-crimson via-roastery-crimson-light to-roastery-amber p-[2px] shadow-sm">
          {/* Inner Deep Wine Background */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#4A141B] to-[#2D0D12] flex items-center justify-center overflow-hidden">
            {/* 52 Coffee Bean Swirl Vector */}
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[72%] h-[72%] text-roastery-teal transition-transform duration-300 group-hover:scale-105"
            >
              {/* Outer top curve of bean */}
              <path
                d="M50 16C68.7778 16 84 31.2222 84 50C84 58.5 80.8 66.2 75.5 72.1C72 65.5 65.5 59 55 56.5C40 53 30 62 20 59C17.5 56.3 16 52.8 16 50C16 31.2222 31.2222 16 50 16Z"
                fill="currentColor"
                fillOpacity="0.88"
              />
              {/* Center S-curve cleft of coffee bean */}
              <path
                d="M24.5 43C31 38 41 38.5 49 43.5C59 49.8 69 48 76 43C73 53 66 60.5 56 61.5C44 62.7 34 54 24.5 43Z"
                fill="#8EB5BF"
              />
              {/* Lower inner swirl curve */}
              <path
                d="M22 59C30 63 38 67 49 66C62 65 71 58 75.5 72C68.5 80 58 84 50 84C35 84 24 73 22 59Z"
                fill="currentColor"
                fillOpacity="0.75"
              />
              {/* Bean center core */}
              <ellipse
                cx="50"
                cy="51"
                rx="8"
                ry="4"
                transform="rotate(-25 50 51)"
                fill="#F8FAFC"
                fillOpacity="0.9"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-editorial font-bold tracking-tight ${titleSize} ${
              textColor === 'light' ? 'text-white' : 'text-roastery-dark'
            }`}
          >
            52 COFFEE & ROASTERY
          </span>
          <span
            className={`font-mono tracking-widest uppercase mt-0.5 ${subtitleSize} ${
              textColor === 'light' ? 'text-roastery-teal-light' : 'text-roastery-crimson'
            }`}
          >
            Artisanal Roaster • Malang
          </span>
        </div>
      )}
    </div>
  );
}

export function FiftyTwoBeanMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="50" r="48" fill="#4A141B" />
      <path
        d="M50 16C68.7778 16 84 31.2222 84 50C84 58.5 80.8 66.2 75.5 72.1C72 65.5 65.5 59 55 56.5C40 53 30 62 20 59C17.5 56.3 16 52.8 16 50C16 31.2222 31.2222 16 50 16Z"
        fill="#6F98A2"
      />
      <path
        d="M24.5 43C31 38 41 38.5 49 43.5C59 49.8 69 48 76 43C73 53 66 60.5 56 61.5C44 62.7 34 54 24.5 43Z"
        fill="#8EB5BF"
      />
      <path
        d="M22 59C30 63 38 67 49 66C62 65 71 58 75.5 72C68.5 80 58 84 50 84C35 84 24 73 22 59Z"
        fill="#6F98A2"
        fillOpacity="0.75"
      />
      <ellipse
        cx="50"
        cy="51"
        rx="8"
        ry="4"
        transform="rotate(-25 50 51)"
        fill="#FFFFFF"
        fillOpacity="0.9"
      />
    </svg>
  );
}
