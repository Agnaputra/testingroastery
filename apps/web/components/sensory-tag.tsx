'use client';

import React from 'react';

interface SensoryTagProps {
  note: string;
  size?: 'sm' | 'md';
  className?: string;
}

// Map tasting note keywords to specialized specialty coffee color spectrum
export function getSensoryCategory(note: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const n = note.toLowerCase().trim();

  // 1. Berry & Red Fruits
  if (
    n.includes('berry') ||
    n.includes('strawberry') ||
    n.includes('blueberry') ||
    n.includes('blackcurrant') ||
    n.includes('raspberry') ||
    n.includes('cherry') ||
    n.includes('wine') ||
    n.includes('grape')
  ) {
    return {
      bg: 'bg-rose-50/90',
      text: 'text-rose-900',
      border: 'border-rose-200/80',
      dot: 'bg-rose-500',
    };
  }

  // 2. Stone Fruit & Tropical
  if (
    n.includes('peach') ||
    n.includes('mango') ||
    n.includes('lychee') ||
    n.includes('tangerine') ||
    n.includes('mandarin') ||
    n.includes('orange') ||
    n.includes('apple') ||
    n.includes('lemon') ||
    n.includes('lime') ||
    n.includes('pineapple') ||
    n.includes('jackfruit') ||
    n.includes('tropical')
  ) {
    return {
      bg: 'bg-amber-50/90',
      text: 'text-amber-900',
      border: 'border-amber-200/80',
      dot: 'bg-amber-500',
    };
  }

  // 3. Floral & Tea-like
  if (
    n.includes('jasmine') ||
    n.includes('floral') ||
    n.includes('bergamot') ||
    n.includes('tea') ||
    n.includes('lavender') ||
    n.includes('rose') ||
    n.includes('chamomile')
  ) {
    return {
      bg: 'bg-emerald-50/90',
      text: 'text-emerald-900',
      border: 'border-emerald-200/80',
      dot: 'bg-emerald-500',
    };
  }

  // 4. Sweet & Caramel
  if (
    n.includes('honey') ||
    n.includes('sugar') ||
    n.includes('caramel') ||
    n.includes('vanilla') ||
    n.includes('syrup') ||
    n.includes('candy') ||
    n.includes('butter')
  ) {
    return {
      bg: 'bg-orange-50/90',
      text: 'text-orange-950',
      border: 'border-orange-200/80',
      dot: 'bg-orange-500',
    };
  }

  // 5. Chocolaty & Nutty & Spice (Default)
  return {
    bg: 'bg-slate-100/90',
    text: 'text-slate-800',
    border: 'border-slate-200/90',
    dot: 'bg-slate-500',
  };
}

export function SensoryTag({ note, size = 'sm', className = '' }: SensoryTagProps) {
  const style = getSensoryCategory(note);
  const sizeClasses =
    size === 'sm'
      ? 'text-[10px] px-2 py-0.5 gap-1.5'
      : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className} select-none transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
      <span className="truncate">{note}</span>
    </span>
  );
}
