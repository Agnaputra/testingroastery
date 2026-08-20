'use client';

import React from 'react';
import { GRIND_OPTIONS, GrindOption } from '../lib/data';
import { Coffee, Check } from 'lucide-react';

interface GrindSelectorProps {
  selectedGrind: GrindOption;
  onSelectGrind: (grind: GrindOption) => void;
}

export function GrindSelector({ selectedGrind, onSelectGrind }: GrindSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-roastery-muted">
          Pilihan Gilingan (Grind Size):
        </label>
        <span className="text-xs font-medium text-roastery-crimson">
          {GRIND_OPTIONS.find((g) => g.id === selectedGrind)?.label}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {GRIND_OPTIONS.map((option) => {
          const isSelected = selectedGrind === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectGrind(option.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex items-start gap-3 ${
                isSelected
                  ? 'border-roastery-crimson bg-roastery-crimson/5 ring-1 ring-roastery-crimson shadow-sm'
                  : 'border-roastery-border bg-white hover:border-roastery-slate/40 hover:bg-roastery-light/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected
                    ? 'bg-roastery-crimson text-white'
                    : 'bg-roastery-light text-roastery-charcoal'
                }`}
              >
                <Coffee className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-editorial text-sm font-bold ${
                      isSelected ? 'text-roastery-crimson' : 'text-roastery-dark'
                    }`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-roastery-crimson text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-roastery-muted mt-0.5 leading-snug">
                  {option.description}
                </p>
                <span className="inline-block mt-1 text-[10px] font-mono text-roastery-teal font-medium">
                  {option.recommendedFor}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
