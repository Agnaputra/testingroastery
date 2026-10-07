'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
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
import { CoffeeProduct, formatRupiah, getProductDisplayImage } from '../lib/data';
import { getPublishedProducts } from '../lib/catalog-master';
import { useCartStore } from '../lib/store/useCartStore';
import { FiftyTwoBeanMark } from './logo';
import { OPEN_VIRTUAL_BARISTA } from '../lib/virtual-barista-events';

const PUBLISHED_PRODUCTS = getPublishedProducts();

interface ChatMessage {
  id: string;
  sender: 'user' | 'barista';
  text: string;
  timestamp: string;
  recommendedProducts?: CoffeeProduct[];
  sources?: Array<{ title: string; url: string }>;
}

const QUICK_PROMPTS = [
  { label: 'Pilih kopi', prompt: 'Bantu saya memilih kopi sesuai selera' },
  { label: 'Panduan seduh', prompt: 'Bantu saya membuat panduan seduh' },
  { label: 'Cari di web', prompt: 'Apa berita teknologi terbaru hari ini?' },
  { label: 'Kemitraan', prompt: 'Jelaskan layanan konsultasi dan kemitraan 52 Coffee' },
];

export function VirtualBaristaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [availableProducts, setAvailableProducts] = useState(PUBLISHED_PRODUCTS);

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_VIRTUAL_BARISTA, open);
    return () => window.removeEventListener(OPEN_VIRTUAL_BARISTA, open);
  }, []);

  useEffect(() => {
    fetch('/api/catalog/publication', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const data = (await response.json()) as { overrides?: Record<string, boolean> };
        setAvailableProducts(PUBLISHED_PRODUCTS.filter((product) => data.overrides?.[product.slug] !== false));
      })
      .catch(() => undefined);
  }, []);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'barista',
      text: 'Halo, kawan seduh! Saya bisa membantu soal katalog dan fitur 52 Coffee, sekaligus menjawab pertanyaan umum serta mencari informasi terbaru dari web bila diperlukan.',
      timestamp: 'Baru saja',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [messages, isOpen, shouldReduceMotion]);

  // Progressive Typewriter streaming response effect
  const streamBaristaResponse = async (
    fullText: string,
    products?: CoffeeProduct[],
    sources?: Array<{ title: string; url: string }>
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
                sources: i === words.length - 1 ? sources : undefined,
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
        matchedProducts = availableProducts.filter((p) => data.recommendedSlugs.includes(p.slug));
      }

      const rawReply = (data.reply || 'Berikut rekomendasi kurasi biji kopi segar dari roastery kami di Malang yang sangat pas dengan selera kamu:').replace(/\*/g, '');
      const sources = Array.isArray(data.sources)
        ? data.sources.filter(
            (source: unknown): source is { title: string; url: string } =>
              typeof source === 'object' &&
              source !== null &&
              typeof (source as { title?: unknown }).title === 'string' &&
              typeof (source as { url?: unknown }).url === 'string' &&
              (source as { url: string }).url.startsWith('https://')
          )
        : undefined;

      setIsLoading(false);
      await streamBaristaResponse(
        rawReply,
        matchedProducts.length > 0 ? matchedProducts : undefined,
        sources
      );
    } catch (err) {
      console.warn('Fallback to local barista AI logic:', err);

      // Local fallback logic
      const lower = query.toLowerCase();
      let reply = '';
      let matched: CoffeeProduct[] = [];

      const clean = lower.replace(/[^\w\s]/gi, '').trim();

      if (lower.includes('byob') || lower.includes('by ob') || lower.includes('custom blend') || lower.includes('racik')) {
        matched = availableProducts.filter((p) =>
          ['dampit-natural-espresso', 'kintamani-full-wash-arabica-espresso', 'brazil-santos-espresso'].includes(p.slug)
        );
        reply = 'BYOB (Build Your Own Blend) di /blend-builder membantu kamu meracik dari beans Espresso Based yang published. Pilih komposisi, ukuran 250g/500g/1kg, lalu lihat prediksi rasa dan harga yang diperbarui dari data katalog.';
      } else if (lower.includes('price calculator') || lower.includes('kalkulator harga') || lower.includes('hpp') || lower.includes('cogs')) {
        reply = 'Kalkulator Harga Jual Kedai (/tools/price-calculator) membantu Anda menghitung estimasi biaya per cangkir, harga jual, margin, dan kebutuhan pasokan. Masukkan harga biji serta biaya operasional kedai Anda sendiri untuk menyusun proyeksi yang sesuai.';
      } else if (lower.includes('lokasi') || lower.includes('alamat') || lower.includes('dimana') || lower.includes('malang')) {
        reply = 'Roastery & Tasting Room 52 Coffee berlokasi di Jl. KH. Agus Salim No. 11, Klojen, Kota Malang. Jam operasional: Senin - Minggu, 10:00 - 20:00 WIB. Instagram: @52coffeeroastery.';
      } else if (
        lower.includes('lambung') ||
        lower.includes('maag') ||
        lower.includes('gerd') ||
        lower.includes('asam lambung') ||
        lower.includes('perut') ||
        lower.includes('ringan') ||
        lower.includes('low acid') ||
        lower.includes('tidak asam') ||
        lower.includes('lembut') ||
        lower.includes('smooth') ||
        lower.includes('mild')
      ) {
        matched = availableProducts.filter((p) =>
          ['kintamani-full-wash-arabica-espresso', 'ijen-yellow-bourbon-kencana', 'sumbing-supernova-celestia'].includes(p.slug)
        );
        reply = 'Tidak ada kopi yang dapat dijamin aman untuk maag atau GERD karena respons setiap orang berbeda. Jika kamu mencari karakter rasa dengan persepsi asam lebih ringan, coba:\n1. Kintamani Full Wash (sweet chocolate, citrus lembut)\n2. Ijen Yellow Bourbon Honey (madu dan kacang almond)\n3. Java Exotic Sumbing Deep Washed (brown sugar dan black tea)\n\nMulai dari porsi kecil dan hindari minum saat perut kosong. Jika kamu memiliki GERD atau gejala berulang, ikuti saran tenaga kesehatan.';
      } else if (
        clean === 'manual' ||
        clean === 'manual brew' ||
        clean === 'filter' ||
        clean === '1' ||
        clean === 'opsi 1' ||
        lower.includes('manual brew') ||
        (lower.includes('manual') && !lower.includes('buku')) ||
        (lower.includes('filter') && !lower.includes('roast'))
      ) {
        matched = availableProducts.filter((p) =>
          ['argopuro-walida-anaerob-arcapada', 'sindoro-strawberry-selai', 'ijen-carbonic-maceration-asmara'].includes(p.slug)
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
        matched = availableProducts.filter((p) =>
          ['dampit-natural-espresso', 'kintamani-full-wash-arabica-espresso', 'brazil-santos-espresso'].includes(p.slug)
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
        lower.includes('rekomen')
      ) {
        matched = availableProducts.filter((p) =>
          ['argopuro-walida-anaerob-arcapada', 'sindoro-strawberry-selai', 'dampit-natural-espresso'].includes(p.slug)
        );
        reply = 'Rekomendasi Best Seller & Terfavorit di 52 Coffee & Roastery:\n1. Argopuro Walida Natural Anaerobic (Filter V60 — Plum & Dark Cherry)\n2. Sindoro Strawberry Triple Yeast (Filter V60 — Selai Stroberi & Vanilla)\n3. Dampit Fine Robusta Malang (Espresso / Es Kopi Susu Aren)\n4. B.Y.O.B Custom House Blend (Dark Espresso)';
      } else if (lower.includes('fruity') || lower.includes('buah') || lower.includes('strawberry') || lower.includes('berry')) {
        matched = availableProducts.filter((p) => p.flavorCategory.includes('Fruity')).slice(0, 3);
        reply = 'Untuk profil Fruity & Exotic, saya sangat merekomendasikan Sindoro Strawberry Triple Yeast dengan aroma selai stroberi kental, atau Argopuro Walida dengan karakter plum dan cherry yang sangat juicy!';
      } else if (lower.includes('floral') || lower.includes('jasmine') || lower.includes('geisha') || lower.includes('bunga')) {
        matched = availableProducts.filter((p) => p.flavorCategory.includes('Floral')).slice(0, 2);
        reply = 'Bagi pencinta aroma Floral Elegan, pilihan mahkota kami adalah El Triunfo Geisha Tolima Colombia (Jasmine & Bergamot) serta Ijen Carbonic Maceration dengan harum melati dan peach manis!';
      } else if (lower.includes('rasio') || lower.includes('v60') || lower.includes('seduh') || lower.includes('resep')) {
        reply = 'Untuk memulai V60, gunakan Brewing Guidance di /guide untuk menyesuaikan dosis, rasio, suhu, timer, dan tahap tuang dengan beans yang dipilih.';
      } else {
        matched = availableProducts.filter((p) => p.isFeatured).slice(0, 2);
        reply = `Halo! Kami memiliki beragam kurasi biji kopi segar yang disangrai di Malang. Kamu bisa memilih:\n1. Filter Manual Brew (Fruity, Floral, atau Sweet Strawberry)\n2. Espresso & Kopi Susu (Chocolate, Nutty, Crema Tebal)\n3. B.Y.O.B Custom Blend Simulator (/blend-builder)\n4. Grand Reserve Micro-Lot (Geisha & Sidra Langka)\n\nProfil rasa atau topik mana yang ingin kamu eksplorasi?`;
      }

      setIsLoading(false);
      await streamBaristaResponse(reply, matched.length > 0 ? matched : undefined);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 font-sans select-none">

        {/* Virtual Barista launcher */}
        {!isOpen && (
          <motion.button
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex min-h-11 items-center gap-3 rounded-full border border-white/20 bg-brand-navy p-2.5 text-white shadow-lg transition-colors hover:bg-brand-charcoal sm:px-4"
            aria-label="Buka Virtual Barista"
          >
            {/* Roastery avatar */}
            <div className="relative">
              <div className="h-9 w-9 rounded-full border border-brand-teal-light/60 p-[2px]">
                <div className="w-full h-full rounded-full bg-brand-navy flex items-center justify-center">
                  <FiftyTwoBeanMark className="w-4 h-4 text-brand-teal-light" />
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-brand-teal border-2 border-brand-navy rounded-full" />
            </div>

            {/* Label Text */}
            <div className="text-left pr-1 hidden sm:block">
              <div className="text-xs font-editorial font-bold leading-tight flex items-center gap-1">
                <span>Virtual Barista</span>
              </div>
              <div className="text-[10px] font-mono text-gray-300">
                Kopi &amp; tanya apa saja
              </div>
            </div>

          </motion.button>
        )}
      </div>

      {/* Chat Modal Box with Framer Motion Entrance */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[min(680px,calc(100dvh-0.75rem))] flex-col overflow-hidden rounded-t-[24px] border border-border-subtle bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[420px] sm:rounded-[22px]"
            role="dialog"
            aria-label="Percakapan dengan Virtual Barista"
          >
            {/* Header with Roastery Identity */}
            <div className="flex min-h-[72px] items-center justify-between border-b border-border-subtle bg-white px-4 py-3 text-on-surface">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-brand-navy p-[2px]">
                    <div className="w-full h-full rounded-full bg-brand-navy flex items-center justify-center">
                      <FiftyTwoBeanMark className="w-5 h-5 text-brand-teal-light" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-editorial text-[15px] font-bold text-on-surface">
                    Virtual Barista
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    Katalog + pencarian web
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
                        text: 'Halo, kawan seduh! Kamu bisa bertanya tentang 52 Coffee maupun topik umum. Untuk informasi terbaru, saya dapat mencari sumber dari web.',
                        timestamp: 'Baru saja',
                      },
                    ])
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                  title="Mulai ulang"
                  aria-label="Mulai ulang percakapan"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
                  aria-label="Tutup percakapan"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 space-y-5 overflow-y-auto bg-surface-container-low/50 px-4 py-5">
              {messages.map((msg) => {
                const isBarista = msg.sender === 'barista';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isBarista ? 'items-start' : 'flex-row-reverse items-end'}`}
                  >
                    {isBarista && (
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-teal-light">
                        <FiftyTwoBeanMark className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="max-w-[88%] space-y-2">
                      <div
                        className={`whitespace-pre-line rounded-2xl px-4 py-3 font-sans text-sm leading-6 ${
                          isBarista
                            ? 'border border-border-subtle bg-white text-on-surface'
                            : 'rounded-br-md bg-brand-navy text-white'
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
                              className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-3 transition-colors hover:border-brand-navy/30"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-border-subtle">
                                  <Image
                                    src={getProductDisplayImage(prod)}
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
                                    imageUrl: getProductDisplayImage(prod),
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
                                className={`flex h-11 shrink-0 items-center gap-1 rounded-full px-3 text-[11px] font-bold transition-colors ${
                                  addedProductId === prod.id
                                    ? 'bg-brand-navy text-white'
                                    : 'bg-brand-navy hover:bg-brand-navy-light text-white'
                                }`}
                              >
                                {addedProductId === prod.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                                    <span>Ditambahkan</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                    <span>Tambah</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1" aria-label="Sumber jawaban">
                          {msg.sources.map((source, index) => (
                            <a
                              key={source.url}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-9 max-w-full items-center gap-1 rounded-full border border-border-subtle bg-white px-3 text-[11px] font-medium text-brand-navy hover:border-brand-navy/30"
                            >
                              <span className="truncate">{index + 1}. {source.title}</span>
                              <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                            </a>
                          ))}
                        </div>
                      )}

                      <div
                        className={`text-[11px] text-on-surface-variant ${
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
                <div className="flex max-w-[280px] items-center gap-2 rounded-2xl border border-border-subtle bg-white px-4 py-3 text-xs text-on-surface-variant" role="status">
                  <div className="w-2 h-2 rounded-full bg-brand-navy animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-brand-navy animate-pulse [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-brand-navy animate-pulse [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium text-brand-navy">
                    Menyiapkan jawaban...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Carousel */}
            <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-border-subtle bg-white px-3 py-2.5">
              {QUICK_PROMPTS.map(({ label, prompt }) => (
                <button
                  key={label}
                  onClick={() => handleSendMessage(prompt)}
                  className="min-h-11 shrink-0 whitespace-nowrap rounded-full border border-border-subtle bg-surface-container-low px-4 text-xs font-medium text-brand-navy transition-colors hover:border-brand-navy/30 hover:bg-brand-mist/50"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 border-t border-border-subtle bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya tentang kopi atau topik apa saja..."
                maxLength={500}
                aria-label="Pesan untuk Virtual Barista"
                className="h-11 min-w-0 flex-1 rounded-full border border-border-subtle bg-surface-container-low px-4 text-sm text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-brand-navy focus:ring-2 focus:ring-brand-mist"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white transition-colors hover:bg-brand-navy-light disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Kirim pesan"
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
