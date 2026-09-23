'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

interface OchaFaqProps {
  items: FaqItem[];
  title?: string;
  subtitle?: string;
}

export function OchaFaq({
  items,
  title = 'FAQS',
  subtitle = "Semua yang ingin Anda ketahui seputar kopi kami, dijawab sebelum tegukan pertama.",
}: OchaFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full bg-[#F8FAFC] py-20 px-4 sm:px-6 lg:px-12 border-t-2 border-[#2C3136]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-anton text-xs uppercase tracking-widest text-[#2C3136] bg-[#CFE8EA] px-3 py-1 border border-[#2C3136] rounded-full inline-block mb-3">
              FAQ & PERTANYAAN
            </span>
            <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-tight text-[#2C3136]">
              {title}
            </h2>
          </div>
          <p className="max-w-md font-sans text-sm sm:text-base text-[#2C3136]/80 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="border-t-2 border-[#2C3136]">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border-b-2 border-[#2C3136] transition-colors duration-200 hover:bg-[#F0F5F7]"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between py-6 sm:py-8 text-left gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                    <span className="font-mono text-sm sm:text-base text-[#2C3136]/60 shrink-0 font-bold">
                      {(idx + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="font-sans font-bold text-lg sm:text-2xl text-[#2C3136] tracking-tight">
                      {item.question}
                    </span>
                  </div>
                  <div className="shrink-0 rounded-full border-2 border-[#2C3136] bg-[#CFE8EA] p-2 transition-transform duration-200 hover:bg-[#8FB9BC]">
                    {isOpen ? (
                      <Minus className="h-5 w-5 text-[#2C3136]" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#2C3136]" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pt-1 pl-9 sm:pl-12 pr-4">
                        <p className="font-sans text-base sm:text-lg text-[#2C3136]/80 leading-relaxed max-w-3xl">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
