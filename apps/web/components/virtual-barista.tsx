'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Coffee,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Bot,
  User,
  Check,
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
  '☕ Rekomendasi kopi Asmara & Wening dari Ijen',
  '🍓 Kopi dengan aroma stroberi manis (Selai / Celestia)',
  '👑 Ceritakan tentang Grand Reserve Aurora Geisha',
  '🥛 Biji espresso terbaik untuk es kopi susu (Dampit Natural)',
  '🌿 Rekomendasi kopi floral melati & mandarin (Buntu Lenta / Duharman)',
  '⏱️ Tips rasio seduh V60 untuk biji Ijen',
];

export function VirtualBaristaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'barista',
      text: 'Halo kawan seduh! Saya Virtual Barista 52 Coffee & Roastery ☕. Ada yang bisa saya bantu rekomendasikan hari ini? Ceritakan profil rasa favoritmu (fruity, floral, chocolate, sweet) atau metode seduh yang ingin kamu gunakan!',
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
      scrollToBottom();
    }
  }, [messages, isOpen]);

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

      // Find matching products from slugs or IDs if returned
      let matchedProducts: CoffeeProduct[] = [];
      if (data.recommendedSlugs && Array.isArray(data.recommendedSlugs)) {
        matchedProducts = PRODUCTS.filter((p) => data.recommendedSlugs.includes(p.slug));
      }

      const rawReply = (data.reply || 'Berikut rekomendasi kurasi biji kopi segar dari roastery kami di Malang yang sangat pas dengan selera kamu:').replace(/\*/g, '');

      const baristaMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'barista',
        text: rawReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProducts: matchedProducts.length > 0 ? matchedProducts : undefined,
      };

      setMessages((prev) => [...prev, baristaMessage]);
    } catch (err) {
      console.warn('Fallback to local barista AI logic:', err);

      // Local intelligent response generator
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
        matched = PRODUCTS.slice(0, 3);
        reply = `Senang berdiskusi kopi denganmu! Di 52 Coffee & Roastery, semua biji disangrai dalam batch kecil (small-batch artisanal) di roastery kami di Jl. KH. Agus Salim No. 11 Malang. Berikut beberapa pilihan biji kopi yang sedang di puncak kesegarannya:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'barista',
          text: reply.replace(/\*/g, ''),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedProducts: matched.length > 0 ? matched : undefined,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-roastery-dark text-white hover:bg-roastery-crimson px-4 py-3 rounded-full shadow-floating border border-roastery-slate-light/40 transition-all duration-300 hover:scale-105"
            aria-label="Open Virtual Barista"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-roastery-crimson to-roastery-amber p-[1.5px]">
                <div className="w-full h-full rounded-full bg-[#4A141B] flex items-center justify-center">
                  <FiftyTwoBeanMark className="w-4 h-4 text-roastery-teal" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-roastery-dark rounded-full animate-pulse" />
            </div>
            <div className="text-left pr-1 hidden sm:block">
              <div className="text-xs font-editorial font-bold leading-tight">
                Virtual Barista AI
              </div>
              <div className="text-[10px] font-mono text-roastery-teal-light">
                Tanya Rekomendasi Rasa
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-roastery-amber group-hover:rotate-12 transition-transform" />
          </button>
        )}
      </div>

      {/* Chat Modal Box */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-roastery-card rounded-2xl shadow-2xl border border-roastery-border flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-roastery-dark text-white p-4 flex items-center justify-between border-b border-roastery-charcoal">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-roastery-crimson to-roastery-amber p-[2px]">
                  <div className="w-full h-full rounded-full bg-[#4A141B] flex items-center justify-center">
                    <FiftyTwoBeanMark className="w-5 h-5 text-roastery-teal" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-roastery-dark rounded-full" />
              </div>
              <div>
                <h3 className="font-editorial text-sm font-bold text-white flex items-center gap-1.5">
                  Virtual Barista 52 Coffee
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-roastery-crimson rounded text-white">
                    RAG AI
                  </span>
                </h3>
                <p className="text-[11px] text-roastery-teal-light font-mono">
                  @52coffeeroastery • Malang
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
                      text: 'Halo kawan seduh! Ada profil rasa atau origin biji kopi yang ingin kamu tanyakan hari ini? ☕',
                      timestamp: 'Baru saja',
                    },
                  ])
                }
                className="p-1.5 rounded-lg text-roastery-muted hover:text-white hover:bg-roastery-charcoal transition-colors"
                title="Reset Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-roastery-muted hover:text-white hover:bg-roastery-charcoal transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-roastery-light/60">
            {messages.map((msg) => {
              const isBarista = msg.sender === 'barista';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isBarista ? 'items-start' : 'items-end flex-row-reverse'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-sm ${
                      isBarista
                        ? 'bg-roastery-crimson text-white'
                        : 'bg-roastery-slate text-white'
                    }`}
                  >
                    {isBarista ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[82%] space-y-2`}>
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isBarista
                          ? 'bg-white border border-roastery-border text-roastery-dark rounded-tl-none'
                          : 'bg-roastery-slate text-white rounded-tr-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text.replace(/\*/g, '')}</p>
                    </div>

                    {/* Render Recommended Product Cards in Chat */}
                    {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-mono text-roastery-muted uppercase tracking-wider">
                          Rekomendasi Biji Kopi:
                        </div>
                        {msg.recommendedProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-2.5 rounded-xl border border-roastery-border bg-white flex items-center justify-between gap-2.5 shadow-sm hover:border-roastery-crimson/50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-roastery-light">
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
                                  href={`/catalog/${prod.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="font-editorial text-xs font-bold text-roastery-dark hover:text-roastery-crimson line-clamp-1 block"
                                >
                                  {prod.name}
                                </Link>
                                <div className="text-[10px] font-mono text-roastery-crimson font-semibold">
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
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 shrink-0 transition-colors shadow-sm ${
                                addedProductId === prod.id
                                  ? 'bg-roastery-slate text-white'
                                  : 'bg-roastery-crimson hover:bg-roastery-dark text-white'
                              }`}
                            >
                              {addedProductId === prod.id ? (
                                <>
                                  <Check className="w-3 h-3 text-roastery-teal" />
                                  <span>Ditambahkan</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>+ Cart</span>
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[10px] font-mono text-roastery-muted ${
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
              <div className="flex items-center gap-2 text-roastery-muted text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-roastery-crimson animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-roastery-crimson animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-roastery-crimson animate-bounce [animation-delay:0.4s]" />
                <span className="font-mono text-[11px]">Barista sedang meracik jawaban...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-white border-t border-roastery-border overflow-x-auto flex gap-1.5 no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-roastery-light hover:bg-roastery-crimson hover:text-white border border-roastery-border text-[11px] text-roastery-charcoal transition-colors font-medium shrink-0"
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
            className="p-3 bg-white border-t border-roastery-border flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya rekomendasi rasa, origin, atau rasio..."
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-roastery-light rounded-full border border-roastery-border focus:outline-none focus:border-roastery-crimson text-roastery-dark placeholder:text-roastery-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-full bg-roastery-crimson hover:bg-roastery-dark text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
