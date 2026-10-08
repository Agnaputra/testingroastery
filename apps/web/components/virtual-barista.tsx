'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Send,
  X,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { formatRupiah, getProductDisplayImage } from '../lib/data';
import { getPublishedProducts } from '../lib/catalog-master';
import { useCartStore } from '../lib/store/useCartStore';
import { FiftyTwoBeanMark } from './logo';
import { OPEN_VIRTUAL_BARISTA } from '../lib/virtual-barista-events';
import {
  ACTION_MAX_QUANTITY,
  claimVirtualBaristaActions,
  isVirtualBaristaAction,
  type VirtualBaristaAction,
} from '../lib/virtual-barista-actions';
import {
  mapRecommendationsToCatalog,
  type CatalogRecommendedProduct,
} from '../lib/virtual-barista-recommendations';
import { loadCatalogPublicationAuthority } from '../lib/catalog-publication';

const PUBLISHED_PRODUCTS = getPublishedProducts();

type BaristaRecommendedProduct = CatalogRecommendedProduct;

interface ChatMessage {
  id: string;
  sender: 'user' | 'barista';
  text: string;
  timestamp: string;
  recommendedProducts?: BaristaRecommendedProduct[];
  sources?: Array<{ title: string; url: string }>;
  followUpSuggestions?: string[];
  intent?: string;
  grounding?: 'catalog' | 'website' | 'coffee_web' | 'conversation' | 'none';
  recommendedProductSlugs?: string[];
  recommendedVariants?: Array<{ productSlug: string; weightGrams: number }>;
}

type ConversationMetadata = Pick<ChatMessage, 'intent' | 'grounding' | 'recommendedProductSlugs' | 'recommendedVariants'>;

function getCatalogPublicationAuthority() {
  return loadCatalogPublicationAuthority(
    PUBLISHED_PRODUCTS,
    () => fetch('/api/catalog/publication', { cache: 'no-store' }),
  );
}

const QUICK_PROMPTS = [
  { label: 'Pilih kopi', prompt: 'Bantu saya memilih kopi sesuai selera' },
  { label: 'Panduan seduh', prompt: 'Bantu saya membuat panduan seduh' },
  { label: 'Pengetahuan kopi', prompt: 'Apa itu varietal Pink Bourbon?' },
  { label: 'Kemitraan', prompt: 'Jelaskan layanan konsultasi dan kemitraan 52 Coffee' },
];

export function VirtualBaristaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener(OPEN_VIRTUAL_BARISTA, open);
    return () => window.removeEventListener(OPEN_VIRTUAL_BARISTA, open);
  }, []);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'barista',
      text: 'Halo! Saya bisa membantu memilih produk 52 Coffee, membahas specialty coffee, atau memandu kamu memakai fitur website. Mau mulai dari mana?',
      timestamp: 'Baru saja',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const claimedActionIds = useRef(new Set<string>());
  const { addItem } = useCartStore();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [messages, isOpen, shouldReduceMotion]);

  // Progressive Typewriter streaming response effect
  const streamBaristaResponse = async (
    fullText: string,
    products?: BaristaRecommendedProduct[],
    sources?: Array<{ title: string; url: string }>,
    followUpSuggestions?: string[],
    metadata?: ConversationMetadata
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
                followUpSuggestions: i === words.length - 1 ? followUpSuggestions : undefined,
                intent: i === words.length - 1 ? metadata?.intent : undefined,
                grounding: i === words.length - 1 ? metadata?.grounding : undefined,
                recommendedProductSlugs: i === words.length - 1 ? metadata?.recommendedProductSlugs : undefined,
                recommendedVariants: i === words.length - 1 ? metadata?.recommendedVariants : undefined,
              }
            : msg
        )
      );

      // Natural reading speed delay
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  };

  const executeAction = async (action: VirtualBaristaAction): Promise<string> => {
    if (action.type === 'open_feature') {
      window.location.assign(action.path);
      return '';
    }
    if (action.type === 'view_product') {
      const authority = await getCatalogPublicationAuthority();
      if (authority.status === 'unavailable') return 'Status katalog terbaru tidak dapat diverifikasi; detail produk belum dibuka.';
      const product = authority.products.find((item) => item.slug === action.product_slug);
      if (!product) return 'Produk tersebut sudah tidak aktif; detail produk belum dibuka.';
      window.location.assign(`/catalog/${product.slug}?mode=beans`);
      return '';
    }

    if (action.quantity < 1 || action.quantity > ACTION_MAX_QUANTITY) {
      return 'Produk atau jumlah untuk keranjang tidak valid.';
    }
    const authority = await getCatalogPublicationAuthority();
    if (authority.status === 'unavailable') return 'Status katalog terbaru tidak dapat diverifikasi; item belum ditambahkan.';
    const product = authority.products.find((item) => item.slug === action.product_slug);
    if (!product) return 'Produk tersebut sudah tidak aktif; item belum ditambahkan.';
    const variant = product.variants.find((item) => item.weightGrams === action.variant_weight && item.inStock);
    if (!variant) return 'Varian yang diminta tidak dapat ditambahkan saat ini.';
    const itemId = `${product.id}-${variant.weightGrams}-whole`;
    const previousQuantity = useCartStore.getState().items.find((item) => item.id === itemId)?.quantity ?? 0;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: getProductDisplayImage(product),
      weightGrams: variant.weightGrams,
      weightLabel: variant.weightLabel,
      grind: 'whole',
      grindLabel: 'Whole Beans',
      unitPrice: variant.price,
      quantity: action.quantity,
      series: product.series,
      tastingNotes: product.tastingNotes,
    });
    const actualQuantity = useCartStore.getState().items.find((item) => item.id === itemId)?.quantity ?? 0;
    if (actualQuantity !== previousQuantity + action.quantity) return 'Keranjang belum dapat diperbarui; item tidak ditambahkan.';
    return `Berhasil menambahkan ${product.name} ${variant.weightLabel} sebanyak ${action.quantity} bungkus ke keranjang.`;
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
    const requestId = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `vb-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const publicationAuthorityPromise = getCatalogPublicationAuthority();
      // Send request to /api/chat route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          requestId,
          history: messages.slice(-8).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text.replace(/\*/g, ''),
            intent: m.intent,
            grounding: m.grounding,
            recommendedProductSlugs: m.recommendedProductSlugs,
            recommendedVariants: m.recommendedVariants,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi AI service');
      }

      const data = await response.json();
      const publicationAuthority = await publicationAuthorityPromise;
      const currentProducts = publicationAuthority.products;

      let matchedProducts: BaristaRecommendedProduct[] = [];
      const recommendedSlugs = Array.isArray(data.recommendedProductSlugs)
        ? data.recommendedProductSlugs
        : data.recommendedSlugs;
      matchedProducts = mapRecommendationsToCatalog(
        currentProducts,
        recommendedSlugs,
        data.recommendedProducts,
      );

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
      const followUpSuggestions = Array.isArray(data.followUpSuggestions)
        ? data.followUpSuggestions.filter((suggestion: unknown): suggestion is string => typeof suggestion === 'string')
        : undefined;
      const actions: VirtualBaristaAction[] = publicationAuthority.status === 'verified' && Array.isArray(data.actions)
        ? data.actions.filter((action: unknown): action is VirtualBaristaAction => isVirtualBaristaAction(action))
        : [];
      if (actions.length > 0) matchedProducts = [];
      const claimedActions = claimVirtualBaristaActions(actions, claimedActionIds.current);
      const outcomes = await Promise.all(claimedActions.map((action) => executeAction(action)));
      const actionOutcome = outcomes.filter(Boolean).join('\n');
      const selectedVariantReferences = new Map(
        matchedProducts.flatMap((product) => product.selectedVariant
          ? [[product.slug, product.selectedVariant.weightGrams] as const]
          : [])
      );
      for (const action of actions) {
        if (action.type === 'add_to_cart') selectedVariantReferences.set(action.product_slug, action.variant_weight);
      }

      await streamBaristaResponse(
        [rawReply, actionOutcome].filter(Boolean).join('\n\n'),
        matchedProducts.length > 0 ? matchedProducts : undefined,
        sources,
        followUpSuggestions,
        {
          intent: typeof data.intent === 'string' ? data.intent : undefined,
          grounding: ['catalog', 'website', 'coffee_web', 'conversation', 'none'].includes(data.grounding)
            ? data.grounding
            : undefined,
          recommendedProductSlugs: Array.isArray(recommendedSlugs)
            ? recommendedSlugs.filter((slug: unknown): slug is string => typeof slug === 'string')
            : undefined,
          recommendedVariants: Array.from(selectedVariantReferences, ([productSlug, weightGrams]) => ({
            productSlug,
            weightGrams,
          })),
        }
      );
      setIsLoading(false);
    } catch (error) {
      console.warn('Virtual Barista backend unavailable:', error);
      await streamBaristaResponse(
        'Virtual Barista sedang tidak tersedia. Kamu masih bisa membuka Catalogue atau Brewing Guidance.'
      );
      setIsLoading(false);
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
                52 Coffee &amp; Coffee Assistant
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
                    Katalog &amp; pengetahuan kopi
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
                        text: 'Halo! Saya bisa membantu memilih produk 52 Coffee, membahas specialty coffee, atau memandu kamu memakai fitur website. Mau mulai dari mana?',
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
                                    {prod.selectedVariant
                                      ? `${formatRupiah(prod.selectedVariant.price)} / ${prod.selectedVariant.weightLabel}`
                                      : 'Varian pilihan belum tersedia'}
                                  </div>
                                </div>
                              </div>

                              {prod.selectedVariant ? (
                                <Link
                                  href={`/catalog/${prod.slug}?mode=beans`}
                                  onClick={() => setIsOpen(false)}
                                  className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-brand-navy px-3 text-[11px] font-bold text-white transition-colors hover:bg-brand-navy-light"
                                >
                                  <span>Lihat detail</span>
                                </Link>
                              ) : (
                                <Link
                                  href={`/catalog/${prod.slug}?mode=beans`}
                                  onClick={() => setIsOpen(false)}
                                  className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-brand-navy px-3 text-[11px] font-bold text-white transition-colors hover:bg-brand-navy-light"
                                >
                                  <span>Pilih varian</span>
                                </Link>
                              )}
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

                      {msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1" aria-label="Saran pertanyaan lanjutan">
                          {msg.followUpSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => handleSendMessage(suggestion)}
                              disabled={isLoading}
                              className="min-h-9 rounded-full border border-border-subtle bg-white px-3 text-left text-[11px] font-medium text-brand-navy transition-colors hover:border-brand-navy/30 disabled:opacity-50"
                            >
                              {suggestion}
                            </button>
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
                placeholder="Tanya tentang kopi atau 52 Coffee..."
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
