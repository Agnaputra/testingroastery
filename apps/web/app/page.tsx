'use client';

import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Play,
  Plus,
  X,
} from 'lucide-react';
import { HeroSection } from '../components/hero/HeroSection';
import { SensorySection } from '../components/sensory/SensorySection';
import { formatRupiah, getCustomerProductName } from '../lib/data';
import { getPublishedProducts } from '../lib/catalog-master';
import { useCartStore } from '../lib/store/useCartStore';
import { openVirtualBarista } from '../lib/virtual-barista-events';
import styles from './page.module.css';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  weightGrams: number;
  weightLabel: string;
  price: number;
  series: string;
  notes: string[];
  imageUrl: string;
}

const PUBLISHED_PRODUCTS = getPublishedProducts();

const FEATURED_CONFIG = [
  { slug: 'sumbing-supernova-celestia', imageUrl: '/images/bag-sumbing.jpg' },
  { slug: 'prau-natural-el-davisio-surya', imageUrl: '/images/bag-prau.jpg' },
  { slug: 'inmaculada-pink-bourbon-marfil', imageUrl: '/images/bag-grand-reserve.jpg' },
  { slug: 'argopuro-walida-anaerob-arcapada', imageUrl: '/images/bag-walida.jpg' },
];

const FEATURED_PRODUCTS: ProductItem[] = FEATURED_CONFIG.flatMap(({ slug, imageUrl }) => {
  const product = PUBLISHED_PRODUCTS.find((item) => item.slug === slug);
  if (!product) return [];

  const variant = [...product.variants]
    .filter((item) => item.inStock)
    .sort((a, b) => a.weightGrams - b.weightGrams)[0] ?? product.variants[0];
  return [{
    id: product.id,
    name: getCustomerProductName(product),
    slug: product.slug,
    category: product.categoryLabel,
    weightGrams: variant.weightGrams,
    weightLabel: variant.weightLabel,
    price: variant.price,
    series: product.series,
    notes: product.tastingNotes.slice(0, 4),
    imageUrl,
  }];
});

const CATEGORIES = [
  {
    id: 'about',
    title: 'Apa 52 Coffee Roasters',
    subtitle: 'Filosofi sangrai dan para roaster',
    href: '/about',
  },
  {
    id: 'catalog',
    title: 'Catalog',
    subtitle: 'Retail beans, slowbar, dan alat seduh',
    href: '/catalog',
  },
  {
    id: 'business',
    title: 'Kemitraan Bisnis',
    subtitle: 'Pasokan roastery, label khusus, konsultasi',
    href: '/work-with-us',
  },
  {
    id: 'lab',
    title: 'Coffee Lab',
    subtitle: 'Brewing Guidance dan racik blend (BYOB)',
    href: '/coffee-lab/brewing-guidance',
  },
  {
    id: 'barista',
    title: 'Virtual Barista',
    subtitle: 'Konsultasi rasa dan panduan seduh AI',
    href: '#virtual-barista',
  },
];

const MARQUEE_ITEMS = ['PILIHAN ROASTERY', 'PILIHAN ROASTERY', 'PILIHAN ROASTERY'];

const PROCESS_STEPS = [
  {
    id: 'background',
    number: '01',
    word: 'BACKGROUND',
    title: 'Rasa ingin tahu menjadi awal perjalanan kami.',
    description:
      '52 Coffee & Roastery mempertemukan pemilihan beans, proses sangrai, evaluasi, dan penyeduhan agar kopi dapat dipahami dari bahan baku hingga cangkir.',
    detail: 'Cerita brand · Filosofi · Perjalanan kopi',
    imageUrl: '/images/the-roastery-behind-your-business.png',
    imageAlt: 'Perjalanan dan proses produksi 52 Coffee Roastery',
    imagePosition: 'center',
    actionHref: '/background',
    actionLabel: 'Baca background kami',
  },
  {
    id: 'roasters',
    number: '02',
    word: 'ROASTERS',
    title: 'Profil rasa dibentuk lewat sangrai yang presisi.',
    description:
      'Setiap batch disangrai menggunakan teknologi infrared untuk membentuk profil ekstraksi yang konsisten, manis, dan jernih.',
    detail: 'Small-batch · Profil ekstraksi · Konsistensi',
    imageUrl: '/images/roaster-footage.png',
    imageAlt: 'Tim 52 Coffee bekerja di depan mesin sangrai',
    imagePosition: 'center 42%',
    actionHref: '/roasters',
    actionLabel: 'Lihat proses roasters',
  },
  {
    id: 'slowbar',
    number: '03',
    word: 'SLOWBAR',
    title: 'Rasa diselesaikan lewat seduhan dan percakapan.',
    description:
      'Slowbar menerjemahkan karakter beans melalui pilihan menu, teknik seduh, dan dialog dengan barista agar setiap cangkir lebih mudah dipahami.',
    detail: 'Manual brew · Tasting · Malang',
    imageUrl: '/images/tasting-room-footage.png',
    imageAlt: 'Suasana Slowbar dan Tasting Room 52 Coffee di Malang',
    imagePosition: 'center',
    actionHref: '/slowbar',
    actionLabel: 'Jelajahi menu Slowbar',
  },
];

const FAQS = [
  {
    question: 'Apa itu Virtual Barista 52 Coffee?',
    answer:
      'Virtual Barista adalah asisten berbasis AI yang membantu Anda mengenal katalog dan menggunakan fitur website 52 Coffee. Jawabannya diarahkan pada produk yang dipublikasikan, karakter rasa, panduan seduh, Coffee Lab, serta layanan kemitraan kami.',
  },
  {
    question: 'Bagaimana cara menggunakan Virtual Barista?',
    answer:
      'Klik tombol Virtual Barista di kanan bawah, lalu ceritakan kebutuhan Anda. Contohnya: “Saya suka kopi fruity untuk V60”, “Bagaimana memakai Brewing Guidance?”, atau “Di mana saya bisa mengajukan konsultasi wholesale?”',
  },
  {
    question: 'Apa saja yang bisa dibantu oleh AI ini?',
    answer:
      'AI dapat membantu memilih beans berdasarkan preferensi rasa dan metode seduh, menjelaskan tasting notes serta profil produk, memberi panduan seduh, dan menunjukkan fitur Catalogue, keranjang, Coffee Lab, BYOB, Consultations, serta Wholesale & Partnership.',
  },
  {
    question: 'Dari mana Virtual Barista mendapatkan jawabannya?',
    answer:
      'Jawaban disusun dari katalog produk 52 Coffee yang telah dipublikasikan dan informasi fitur yang tersedia di website. Dengan begitu, rekomendasi tetap terhubung dengan produk dan layanan 52 Coffee, bukan dibuat sebagai pengetahuan umum tanpa konteks.',
  },
  {
    question: 'Apakah Virtual Barista dapat menjawab semua pertanyaan?',
    answer:
      'Tidak. Virtual Barista difokuskan pada katalog dan fitur 52 Coffee, sehingga pertanyaan umum, medis, politik, atau topik di luar layanan akan ditolak dan diarahkan kembali ke konteks kopi. Informasi checkout, pembayaran, pesanan, dan pelacakan juga dijelaskan sebagai simulasi, bukan transaksi nyata.',
  },
];

export default function HomePage() {
  const { addItem } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeProcess, setActiveProcess] = useState(0);
  const [draggingProducts, setDraggingProducts] = useState(false);
  const [storyVideoPlaying, setStoryVideoPlaying] = useState(false);
  const [storyVideoReady, setStoryVideoReady] = useState(false);
  const [storyPreviewMounted, setStoryPreviewMounted] = useState(false);
  const processRef = useRef<HTMLElement>(null);
  const storyPlayRef = useRef<HTMLButtonElement>(null);
  const productRailRef = useRef<HTMLDivElement>(null);
  const productDragRef = useRef({
    active: false,
    didDrag: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });
  const reducedMotion = useReducedMotion();
  const { scrollYProgress: processProgress } = useScroll({
    target: processRef,
    offset: ['start start', 'end end'],
  });
  const processStep = PROCESS_STEPS[activeProcess];

  useEffect(() => setStoryPreviewMounted(true), []);

  useMotionValueEvent(processProgress, 'change', (progress) => {
    const nextProcess = Math.min(PROCESS_STEPS.length - 1, Math.floor(progress * PROCESS_STEPS.length));
    setActiveProcess((current) => (current === nextProcess ? current : nextProcess));
  });

  const handleQuickAdd = (product: ProductItem) => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      weightGrams: product.weightGrams,
      weightLabel: product.weightLabel,
      grind: 'whole',
      grindLabel: 'Biji utuh',
      unitPrice: product.price,
      quantity: 1,
      series: product.series,
      tastingNotes: product.notes,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId((current) => (current === product.id ? null : current)), 1500);
  };

  const handleProductPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const rail = productRailRef.current;
    if (!rail) return;

    productDragRef.current = {
      active: true,
      didDrag: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: rail.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleProductPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { active, pointerId, startX, startScrollLeft } = productDragRef.current;
    if (!active || event.pointerId !== pointerId) return;
    const rail = productRailRef.current;
    if (!rail) return;

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 6) {
      productDragRef.current.didDrag = true;
      if (!draggingProducts) setDraggingProducts(true);
    }
    rail.scrollLeft = startScrollLeft - deltaX;
  };

  const handleProductPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { pointerId } = productDragRef.current;
    if (event.pointerId !== pointerId) return;

    if (event.currentTarget.hasPointerCapture(pointerId)) {
      event.currentTarget.releasePointerCapture(pointerId);
    }
    productDragRef.current.active = false;
    window.setTimeout(() => {
      productDragRef.current.didDrag = false;
      setDraggingProducts(false);
    }, 40);
  };

  const preventClickAfterDrag = (event: ReactMouseEvent) => {
    if (productDragRef.current.didDrag) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div className={styles.page}>
      <HeroSection />

      <section className={styles.manifesto} aria-labelledby="manifesto-heading">
        <p>52 Coffee &amp; Roastery / Malang</p>
        <h2 id="manifesto-heading">
          Kami menyangrai kopi. Karakter asal, profil rasa, dan ritual seduh yang mengikutinya adalah bagian dari cerita setiap cangkir.
        </h2>
      </section>

      <section className={styles.marquee} aria-label="Pilihan roastery">
        <div className={styles.marqueeViewport}>
          <div className={styles.marqueeTrack} aria-hidden="true">
            {[0, 1].map((group) => (
              <div className={styles.marqueeGroup} key={group}>
                {MARQUEE_ITEMS.map((item, itemIndex) => (
                  <span key={`${group}-${itemIndex}`}>{item}<i>•</i></span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featured} aria-labelledby="featured-heading">
        <div className={styles.sectionShell}>
          <motion.header
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55 }}
          >
            <div>
              <p className={styles.eyebrow}>Pilihan roastery / 04</p>
              <h2 id="featured-heading">Kopi dengan<br />suara yang berbeda.</h2>
            </div>
            <div className={styles.headerAside}>
              <p>Disangrai di Malang dan semua kopi fresh roast. Empat profil untuk mengenali rentang rasa 52 Coffee—dari floral dan fruity hingga karakter yang lebih intens.</p>
              <Link href="/catalog" className={styles.textLink}>
                Lihat seluruh koleksi <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <span className={styles.dragHint} aria-hidden="true">← Tarik koleksi →</span>
            </div>
          </motion.header>

          <div
            ref={productRailRef}
            className={styles.productGrid}
            data-dragging={draggingProducts}
            aria-label="Koleksi kopi pilihan. Geser secara horizontal untuk menjelajah."
            onPointerDown={handleProductPointerDown}
            onPointerMove={handleProductPointerMove}
            onPointerUp={handleProductPointerEnd}
            onPointerCancel={handleProductPointerEnd}
            onPointerLeave={(event) => {
              const { pointerId } = productDragRef.current;
              if (pointerId < 0 || !event.currentTarget.hasPointerCapture(pointerId)) {
                productDragRef.current.active = false;
                setDraggingProducts(false);
              }
            }}
            onClickCapture={preventClickAfterDrag}
          >
            {FEATURED_PRODUCTS.map((product, index) => (
              <motion.article
                key={product.id}
                className={styles.productCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
              >
                <div className={styles.productTopline}>
                  <span>{product.series}</span>
                  <span>{product.category}</span>
                </div>
                <Link href={`/catalog/${product.slug}`} className={styles.productImageLink}>
                  <Image
                    src={product.imageUrl}
                    alt={`Kemasan ${product.name}`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className={styles.productImage}
                  />
                </Link>
                <div className={styles.productInfo}>
                  <p>{product.series}</p>
                  <h3><Link href={`/catalog/${product.slug}`}>{product.name}</Link></h3>
                  <span>{product.notes.join(' · ')}</span>
                </div>
                <div className={styles.productFooter}>
                  <div>
                    <strong>{formatRupiah(product.price)}</strong>
                    <span>{product.weightLabel}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(product)}
                    aria-label={`Tambah ${product.name} ke keranjang`}
                    className={styles.quickAdd}
                    data-added={addedId === product.id}
                  >
                    {addedId === product.id ? <Check aria-hidden="true" size={17} /> : <Plus aria-hidden="true" size={17} />}
                    <span aria-live="polite">{addedId === product.id ? 'Ditambahkan' : 'Tambah'}</span>
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.catalogIndex} aria-labelledby="catalog-index-heading">
        <div className={styles.sectionShell}>
          <div className={styles.indexIntro}>
            <p>Pilih jalur eksplorasi</p>
            <h2 id="catalog-index-heading">Dari profil rasa hingga racikan kedai.</h2>
          </div>
          <nav className={styles.categoryGrid} aria-label="Kategori koleksi kopi">
            {CATEGORIES.map((category) =>
              category.id === 'barista' ? (
                <button
                  type="button"
                  onClick={openVirtualBarista}
                  key={category.id}
                  className={styles.categoryLink}
                >
                  <span className={styles.categoryText}>
                    <strong>{category.title}</strong>
                    <small>{category.subtitle}</small>
                  </span>
                  <ArrowUpRight aria-hidden="true" size={18} />
                </button>
              ) : (
                <Link href={category.href} key={category.id} className={styles.categoryLink}>
                  <span className={styles.categoryText}>
                    <strong>{category.title}</strong>
                    <small>{category.subtitle}</small>
                  </span>
                  <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
              )
            )}
          </nav>
        </div>
      </section>

      <SensorySection />

      <section ref={processRef} className={styles.process} aria-labelledby="process-heading">
        <div className={styles.processSticky}>
          <div className={styles.processStage}>
            <div className={styles.processMedia}>
              <AnimatePresence initial={false} mode="wait">
                <motion.figure
                  key={processStep.id}
                  initial={reducedMotion ? false : { opacity: .72, scale: 1.035, clipPath: 'inset(0 0 100% 0)' }}
                  animate={{ opacity: 1, scale: 1, clipPath: 'inset(0 0 0% 0)' }}
                  exit={reducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: .985, clipPath: 'inset(100% 0 0 0)' }}
                  transition={{ duration: reducedMotion ? 0 : .46, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={processStep.imageUrl}
                    alt={processStep.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 42vw, (min-width: 768px) 48vw, calc(100vw - 36px)"
                    style={{ objectPosition: processStep.imagePosition }}
                    className={styles.coverImage}
                  />
                  <figcaption>{processStep.number} / {processStep.word}</figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false} mode="wait">
              <motion.article
                key={processStep.id}
                id="process-panel"
                role="region"
                aria-labelledby="process-heading"
                className={styles.processCopy}
                initial={reducedMotion ? false : { opacity: 0, x: 34 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: reducedMotion ? 0 : .38, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className={styles.eyebrow}>Jelajahi 52 / {processStep.number}</p>
                <h2 id="process-heading">{processStep.title}</h2>
                <p className={styles.leadCopy}>{processStep.description}</p>
                <p className={styles.processDetail}>{processStep.detail}</p>
                <Link href={processStep.actionHref} className={styles.inverseLink}>
                  {processStep.actionLabel} <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </motion.article>
            </AnimatePresence>
          </div>

          <div className={styles.processSteps} aria-label="Jelajahi Background, Roasters, dan Slowbar">
            {PROCESS_STEPS.map((step, index) => (
              <button
                type="button"
                key={step.id}
                aria-pressed={activeProcess === index}
                aria-controls="process-panel"
                onClick={() => setActiveProcess(index)}
              >
                <span>{step.number}</span>
                <strong>{step.word}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="story-heading">
        <motion.figure
          className={styles.storyMedia}
          data-playing={storyVideoPlaying}
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
              <Image
                src="/images/story-v60-hd.jpg"
                alt="Proses menuang air untuk seduhan V60"
                fill
                sizes="100vw"
                className={styles.storyPoster}
              />

              {!storyVideoPlaying && storyPreviewMounted && reducedMotion === false && (
                <iframe
                  className={`${styles.storyVideo} ${styles.storyPreviewVideo}`}
                  data-ready={storyVideoReady}
                  src="https://www.youtube-nocookie.com/embed/1oB1oDrDkHM?autoplay=1&mute=1&controls=0&loop=1&playlist=1oB1oDrDkHM&rel=0&playsinline=1&disablekb=1&fs=0&cc_load_policy=0&iv_load_policy=3"
                  title="Pratinjau otomatis panduan V60"
                  tabIndex={-1}
                  aria-hidden="true"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="autoplay; encrypted-media"
                  onLoad={() => setStoryVideoReady(true)}
                />
              )}

              {storyVideoPlaying && (
                <iframe
                  className={styles.storyVideo}
                  data-ready={storyVideoReady}
                  src="https://www.youtube-nocookie.com/embed/1oB1oDrDkHM?autoplay=1&rel=0&playsinline=1"
                  title="A Better One Cup V60 Technique oleh James Hoffmann"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setStoryVideoReady(true)}
                />
              )}

              {storyVideoPlaying && !storyVideoReady && (
                <p className={styles.storyLoading} role="status">Memuat video…</p>
              )}

              {!storyVideoPlaying && (
                <div className={styles.storyOverlay}>
                  <div className={styles.storyHeader}>
                    <div className={styles.storyEyebrow}>
                      <span>Cerita dari Coffee Lab</span>
                      <span>52 / 01</span>
                    </div>
                    <h2 id="story-heading"><span>Seduh lebih</span><span>presisi.</span></h2>
                  </div>

                  <button
                    ref={storyPlayRef}
                    type="button"
                    className={styles.storyPlay}
                    onClick={() => {
                      setStoryVideoReady(false);
                      setStoryVideoPlaying(true);
                    }}
                    aria-label="Putar video panduan V60"
                  >
                    <span>Putar film</span>
                    <Play aria-hidden="true" fill="currentColor" size={17} />
                  </button>

                  <div className={styles.storyCopy}>
                    <div className={styles.storyCopyText}>
                      <div className={styles.storyMeta}>
                        <span className={styles.storyDuration}>02:30</span>
                        <span>Panduan seduh V60</span>
                      </div>
                      <h3>Satu cangkir, lebih terarah.</h3>
                      <p>
                        Sesuaikan rasio, dosis, grind size, suhu, dan waktu seduh dengan kopi pilihanmu.
                      </p>
                    </div>
                    <Link href="/coffee-lab/brewing-guidance" className={styles.storyGuideLink}>
                      Buka panduan <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  </div>
                </div>
              )}

              {storyVideoPlaying && (
                <button
                  type="button"
                  className={styles.storyClose}
                  onClick={() => {
                    setStoryVideoPlaying(false);
                    setStoryVideoReady(false);
                    window.requestAnimationFrame(() => storyPlayRef.current?.focus({ preventScroll: true }));
                  }}
                  aria-label="Tutup video dan kembali ke tampilan awal"
                  ref={(button) => button?.focus({ preventScroll: true })}
                >
                  <X aria-hidden="true" size={18} />
                  <span>Tutup video</span>
                </button>
              )}
        </motion.figure>
      </section>

      <section className={styles.b2b} aria-labelledby="b2b-heading">
        <div className={styles.b2bCopy}>
          <p className={styles.eyebrow}>Kemitraan / B2B</p>
          <h2 id="b2b-heading">Kemitraan kopi untuk bisnismu.</h2>
          <p>
            Dapatkan pasokan roast beans untuk kedai, restoran, hotel, atau kantor;
            kembangkan custom blend dan private label; serta konsultasikan konsep menu,
            SOP, peralatan, layout bar, hingga perhitungan HPP bersama tim kami.
          </p>
          <Link href="/work-with-us" className={styles.lightButton}>
            Lihat program kemitraan <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <figure className={styles.b2bMedia}>
          <Image
            src="/images/byob-craft-collage.jpg"
            alt="Kolase proses meracik kopi dan penyajian minuman"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={styles.coverImage}
          />
          <figcaption>Racik / Uji / Sajikan</figcaption>
        </figure>
      </section>

      <section className={styles.faq} aria-labelledby="faq-heading">
        <div className={styles.sectionShell}>
          <div className={styles.faqGrid}>
            <div className={styles.faqIntro}>
              <p className={styles.eyebrow}>Virtual Barista / AI</p>
              <h2 id="faq-heading">Kenali asisten kopi digital kami.</h2>
              <p>Pelajari cara menggunakan Virtual Barista untuk menjelajahi kopi dan fitur 52 Coffee dengan percakapan yang lebih personal.</p>
              <div className={styles.faqImage}>
                <Image
                  src="/images/canva-cafe-moodboard.jpg"
                  alt="Espresso mengalir dari mesin kopi ke dalam cangkir"
                  fill
                  sizes="(min-width: 1024px) 34vw, 100vw"
                  className={styles.coverImage}
                />
              </div>
            </div>

            <div className={styles.faqList}>
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                const panelId = `faq-panel-${index}`;
                const buttonId = `faq-button-${index}`;
                return (
                  <div className={styles.faqItem} key={faq.question}>
                    <button
                      type="button"
                      id={buttonId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown aria-hidden="true" size={21} data-open={isOpen} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24 }}
                          className={styles.faqPanel}
                        >
                          <p>{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-cta-heading">
        <div className={styles.sectionShell}>
          <p className={styles.eyebrow}>Mulai dari satu cangkir</p>
          <h2 id="final-cta-heading">WAKTUNYA<br />SEDUH.</h2>
          <div className={styles.finalCtaFooter}>
            <p>Temukan kopi yang cocok dengan cara kamu menikmati hari.</p>
            <div>
              <Link href="/catalog" className={styles.darkButton}>Pesan kopi <ArrowRight aria-hidden="true" size={17} /></Link>
              <Link href="/coffee-lab/brewing-guidance" className={styles.textLink}>Buka panduan seduh <ArrowUpRight aria-hidden="true" size={17} /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
