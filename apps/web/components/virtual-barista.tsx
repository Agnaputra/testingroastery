'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  ShoppingBag,
  Check,
  ChevronRight,
  Coffee,
  Flame,
  Scale,
} from 'lucide-react';
import { PRODUCTS, CoffeeProduct, formatRupiah } from '../lib/data';
import { useCartStore } from '../lib/store/useCartStore';
import { FiftyTwoBeanMark } from './logo';

interface ChatMessage {
  id: string;
  sender: 'user' | 'barista';
  text: string;
  timestamp: string;
  recommendedProducts?: CoffeeProduct[];
}

const QUICK_PROMPTS = [
  'Rekomendasi biji kopi fruity & floral (Sumbing / Sidra)',
  'Biji kopi terbaik untuk V60 manual brew (Ijen / Walida)',
  'Blend espresso manis untuk es kopi susu (Dampit / Arjuna)',
  'Spesifikasi Grand Reserve Inmaculada Pink Bourbon',
  'Tips rasio seduh & suhu air V60 harian',
];

export function VirtualBaristaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'barista',
      text: 'Halo kawan seduh! Saya Virtual Barista 52 Coffee & Roastery. Ada yang bisa saya bantu rekomendasikan hari ini? Ceritakan profil rasa favoritmu (fruity, floral, winey, chocolate) atau metode seduh yang ingin kamu gunakan.',
      timestamp: 'Baru saja',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Progressive Typewriter streaming response effect
  const streamBaristaResponse = async (
    fullText: string,
    products?: CoffeeProduct[]
  ) => {
    const messageId = Date.now().toString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Initial empty message
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        sender: 'barista',
        text: '',
        timestamp,
      },
    ]);

    const words = fullText.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      const snapshot = currentText;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                text: snapshot,
                recommendedProducts: i === words.length - 1 ? products : undefined,
              }
            : msg
        )
      );

      // Natural reading speed delay
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Send request to /api/chat route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text.replace(/\*/g, ''),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi AI service');
      }

      const data = await response.json();

      let matchedProducts: CoffeeProduct[] = [];
      if (data.recommendedSlugs && Array.isArray(data.recommendedSlugs)) {
        matchedProducts = PRODUCTS.filter((p) => data.recommendedSlugs.includes(p.slug));
      }

      const rawReply = (data.reply || 'Berikut rekomendasi kurasi biji kopi segar dari roastery kami di Malang yang sangat pas dengan selera kamu:').replace(/\*/g, '');

      setIsLoading(false);
      await streamBaristaResponse(rawReply, matchedProducts.length > 0 ? matchedProducts : undefined);
    } catch (err) {
      console.warn('Fallback to local barista AI logic:', err);

      // Local fallback logic
      const lower = query.toLowerCase();
      let reply = '';
      let matched: CoffeeProduct[] = [];

      const clean = lower.replace(/[^\w\s]/gi, '').trim();

      if (
        clean === 'manual' ||
        clean === 'manual brew' ||
        clean === 'filter' ||
        clean === '1' ||
        clean === 'opsi 1' ||
        lower.includes('manual brew') ||
        (lower.includes('manual') && !lower.includes('buku')) ||
        (lower.includes('filter') && !lower.includes('roast'))
      ) {
        matched = PRODUCTS.filter((p) =>
          ['argopuro-walida-natural-anaerobic', 'sindoro-strawberry-triple-yeast', 'ijen-carbonic-maceration'].includes(p.slug)
        );
        reply = 'Untuk seduhan Filter Manual Brew (V60, Aeropress, Kalita), kurasi terbaik kami:\n1. Argopuro Walida Natural Anaerobic (Plum & Dark Cherry)\n2. Sindoro Strawberry Triple Yeast (Manis Selai Stroberi & Vanilla)\n3. Ijen Carbonic Maceration (Peach & Jasmine Floral)';
      } else if (
        clean === 'kopi susu' ||
        clean === 'espresso' ||
        clean === '2' ||
        clean === 'opsi 2' ||
        lower.includes('kopi susu') ||
        lower.includes('espresso') ||
        lower.includes('dampit') ||
        lower.includes('crema') ||
        lower.includes('robusta')
      ) {
        matched = PRODUCTS.filter((p) =>
          ['dampit-natural-robusta', 'kintamani-full-wash-arabica', 'brazil-santos-arabica'].includes(p.slug)
        );
        reply = 'Untuk seduhan Espresso & Kopi Susu Aren, primadona kami:\n1. Dampit Natural Robusta Malang (Dark Chocolate & Crema Tebal)\n2. Kintamani Full Wash Arabica (Sweet Chocolate & Smooth)\n3. Brazil Santos (Roasted Peanut & Nutty)';
      } else if (
        lower.includes('best seller') ||
        lower.includes('bestseller') ||
        lower.includes('terlaris') ||
        lower.includes('paling laku') ||
        lower.includes('favorit') ||
        lower.includes('populer') ||
        lower.includes('paling enak') ||
        lower.includes('rekomendasi') ||
        lower.includes('rekomen') ||
        lower.includes('apa yang rekomendasi')
      ) {
        matched = PRODUCTS.filter((p) =>
          ['argopuro-walida-natural-anaerobic', 'sindoro-strawberry-triple-yeast', 'dampit-natural-robusta'].includes(p.slug)
        );
        reply = 'Rekomendasi Best Seller & Terfavorit di 52 Coffee & Roastery:\n1. Argopuro Walida Natural Anaerobic (Filter V60 — Plum & Dark Cherry)\n2. Sindoro Strawberry Triple Yeast (Filter V60 — Selai Stroberi & Vanilla)\n3. Dampit Fine Robusta Malang (Espresso / Es Kopi Susu Aren)';
      } else if (lower.includes('fruity') || lower.includes('buah') || lower.includes('strawberry') || lower.includes('berry')) {
        matched = PRODUCTS.filter((p) => p.flavorCategory.includes('Fruity')).slice(0, 3);
        reply = 'Untuk profil Fruity & Exotic, saya sangat merekomendasikan Sindoro Strawberry Triple Yeast dengan aroma selai stroberi kental, atau Argopuro Walida dengan karakter plum dan cherry yang sangat juicy!';
      } else if (lower.includes('floral') || lower.includes('jasmine') || lower.includes('geisha') || lower.includes('bunga')) {
        matched = PRODUCTS.filter((p) => p.flavorCategory.includes('Floral')).slice(0, 2);
        reply = 'Bagi pencinta aroma Floral Elegan, pilihan mahkota kami adalah El Triunfo Geisha Tolima Colombia (Jasmine & Bergamot) serta Ijen Carbonic Maceration dengan harum melati dan peach manis!';
      } else if (lower.includes('argopuro') || lower.includes('walida')) {
        matched = PRODUCTS.filter((p) => p.slug === 'argopuro-walida-natural-anaerobic');
        reply = 'Argopuro Walida Natural Anaerobic adalah rilisan baru dengan dominasi rasa plum matang, blood orange segar, dan dark cherry yang juicy!';
      } else if (lower.includes('ijen')) {
        matched = PRODUCTS.filter((p) => p.series === 'Ijen Series');
        reply = 'Koleksi Ijen Series adalah lini signature 52 Coffee! Ditanam di lereng kaldera Ijen 1.400-1.600 MASL. Pilih Carbonic Maceration untuk rasa Peach & Jasmine, Lactic untuk sensasi Mango Lychee Creamy, atau Yellow Bourbon untuk kelembutan madu!';
      } else if (lower.includes('rasio') || lower.includes('v60') || lower.includes('seduh') || lower.includes('resep')) {
        reply = 'Untuk seduh V60 biji kopi kami, kami sarankan Dosis 15g, Air 225ml (Rasio 1:15), Suhu 92°C. Blooming 45g selama 40 detik, lalu tuang 2 tahap spiral hingga 225ml dengan drawdown tuntas di 02:15. Coba juga fitur Brew Calculator kami!';
      } else {
        matched = PRODUCTS.filter((p) => p.isFeatured).slice(0, 2);
        reply = `Halo! Kami memiliki beragam kurasi biji kopi segar yang disangrai di Malang. Kamu bisa memilih:\n1. Filter Manual Brew (Fruity, Floral, atau Sweet Strawberry)\n2. Espresso & Kopi Susu (Chocolate, Nutty, Crema Tebal)\n3. Grand Reserve Micro-Lot (Geisha & Sidra Langka)\n\nProfil rasa mana yang ingin kamu eksplorasi?`;
      }

      setIsLoading(false);
      await streamBaristaResponse(reply, matched.length > 0 ? matched : undefined);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5 font-sans select-none">
        {/* Helper Tooltip Badge */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.9 }}
              className="relative max-w-[260px] bg-white border border-brand-navy/15 rounded-2xl p-3 shadow-2xl text-xs font-sans text-brand-navy flex items-start gap-2.5 cursor-pointer hover:border-brand-navy/30 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <div className="w-6 h-6 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 text-[11px] leading-snug">
                <span className="font-bold block text-brand-navy">Bingung pilih beans?</span>
                <span className="text-on-surface-variant">Tanya AI Barista rekomendasi rasa &amp; origin</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-0.5"
                title="Tutup"
              >
                <X className="w-3 h-3" />
              </button>
              {/* Tooltip Arrow pointing down */}
              <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-b border-r border-brand-navy/15 transform rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button with Glowing Aurora Beacon */}
        {!isOpen && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-brand-navy via-[#1b2b40] to-brand-navy text-white px-4 py-3 rounded-full shadow-2xl border border-white/20 transition-all duration-300 ring-4 ring-brand-navy/10 hover:ring-brand-teal/30 cursor-pointer"
            aria-label="Open Virtual Barista"
          >
            {/* Pulsing Beacon Avatar */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-teal to-brand-teal-light p-[2px] shadow-sm">
                <div className="w-full h-full rounded-full bg-brand-navy flex items-center justify-center">
                  <FiftyTwoBeanMark className="w-4 h-4 text-brand-teal-light" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-brand-navy rounded-full animate-pulse shadow-sm" />
            </div>

            {/* Label Text */}
            <div className="text-left pr-1 hidden sm:block">
              <div className="text-xs font-editorial font-bold leading-tight flex items-center gap-1">
                <span>Virtual Barista AI</span>
                <span className="px-1.5 py-0.2 rounded-full bg-brand-teal/20 text-brand-teal-light text-[9px] font-mono font-bold">
                  PRO
                </span>
              </div>
              <div className="text-[10px] font-mono text-gray-300">
                Tanya Rekomendasi Rasa
              </div>
            </div>

            <Sparkles className="w-4 h-4 text-brand-teal-light group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </div>

      {/* Chat Modal Box with Framer Motion Entrance */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.94 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[430px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-border-subtle flex flex-col overflow-hidden"
          >
            {/* Header with Roastery Identity */}
            <div className="bg-gradient-to-r from-brand-navy via-[#162537] to-brand-navy text-white p-4 flex items-center justify-between border-b border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-teal to-brand-teal-light p-[2px]">
                    <div className="w-full h-full rounded-full bg-brand-navy flex items-center justify-center">
                      <FiftyTwoBeanMark className="w-5 h-5 text-brand-teal-light" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-brand-navy rounded-full" />
                </div>
                <div>
                  <h3 className="font-editorial text-sm font-bold text-white flex items-center gap-1.5">
                    Virtual Barista 52
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-brand-teal/30 text-brand-teal-light border border-brand-teal/40 rounded-md font-bold">
                      RAG AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-300 font-mono">
                    @52coffeeroastery • Malang Tasting Room
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: 'welcome',
                        sender: 'barista',
                        text: 'Halo kawan seduh! Ada profil rasa atau origin biji kopi yang ingin kamu tanyakan hari ini?',
                        timestamp: 'Baru saja',
                      },
                    ])
                  }
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset Chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close Chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low/40">
              {messages.map((msg) => {
                const isBarista = msg.sender === 'barista';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isBarista ? 'items-start' : 'items-end flex-row-reverse'}`}
                  >
                    {isBarista && (
                      <div className="w-7 h-7 rounded-full bg-brand-navy text-brand-teal-light flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <FiftyTwoBeanMark className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className={`space-y-2 max-w-[85%]`}>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-sans shadow-xs whitespace-pre-line ${
                          isBarista
                            ? 'bg-white border border-border-subtle text-on-surface'
                            : 'bg-brand-navy text-white rounded-br-none'
                        }`}
                      >
                        {msg.text || (
                          <span className="inline-block w-1.5 h-3 bg-brand-navy animate-pulse" />
                        )}
                      </div>

                      {/* Product Recommendation Cards Carousel if present */}
                      {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-mono text-on-surface-variant font-bold uppercase tracking-wider block">
                            Rekomendasi Biji Kopi Terpilih:
                          </span>
                          {msg.recommendedProducts.map((prod) => (
                            <div
                              key={prod.id}
                              className="p-3 rounded-2xl bg-white border border-border-subtle shadow-xs flex items-center justify-between gap-3 hover:border-brand-navy/30 transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-border-subtle">
                                  <Image
                                    src={prod.imageUrl}
                                    alt={prod.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <Link
                                    href={`/catalog/${prod.slug}?mode=beans`}
                                    onClick={() => setIsOpen(false)}
                                    className="font-editorial text-xs font-bold text-brand-navy hover:text-brand-teal line-clamp-1 block"
                                  >
                                    {prod.name}
                                  </Link>
                                  <div className="text-[10px] font-mono text-brand-maroon font-bold">
                                    {formatRupiah(prod.basePrice)} / {prod.defaultWeight}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  const variant = prod.variants[0];
                                  addItem({
                                    productId: prod.id,
                                    name: prod.name,
                                    slug: prod.slug,
                                    imageUrl: prod.imageUrl,
                                    weightGrams: variant.weightGrams,
                                    weightLabel: variant.weightLabel,
                                    grind: 'whole',
                                    grindLabel: 'Whole Beans',
                                    unitPrice: variant.price,
                                    quantity: 1,
                                    series: prod.series,
                                    tastingNotes: prod.tastingNotes,
                                  });
                                  setAddedProductId(prod.id);
                                  setTimeout(() => setAddedProductId(null), 1500);
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow-xs ${
                                  addedProductId === prod.id
                                    ? 'bg-brand-navy text-white'
                                    : 'bg-brand-navy hover:bg-brand-navy-light text-white'
                                }`}
                              >
                                {addedProductId === prod.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>+ Cart</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        className={`text-[9px] font-mono text-on-surface-variant ${
                          isBarista ? 'text-left' : 'text-right'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 text-on-surface-variant text-xs p-2.5 bg-white rounded-2xl border border-border-subtle max-w-[240px] shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-navy animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-brand-navy animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-brand-navy animate-bounce [animation-delay:0.4s]" />
                  <span className="font-mono text-[11px] text-brand-navy font-semibold">
                    AI Barista sedang meracik...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="px-3 py-2 bg-white border-t border-border-subtle overflow-x-auto flex gap-1.5 no-scrollbar">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-surface-container-low hover:bg-brand-navy hover:text-white border border-border-subtle text-[11px] text-brand-navy transition-colors font-medium shrink-0 shadow-2xs cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-border-subtle flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya rasa, origin, atau rekomendasi..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-surface-container-low rounded-full border border-border-subtle focus:outline-none focus:border-brand-navy text-on-surface placeholder:text-on-surface-variant"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-full bg-brand-navy hover:bg-brand-navy-light text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 shadow-md cursor-pointer hover:scale-105"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
