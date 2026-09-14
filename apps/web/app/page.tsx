'use client';

import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { HeroSection } from '../components/hero/HeroSection';
import { SensorySection } from '../components/sensory/SensorySection';
import { PRODUCTS, formatRupiah } from '../lib/data';
import { useCartStore } from '../lib/store/useCartStore';
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

const FEATURED_CONFIG = [
  { slug: 'sumbing-supernova-celestia', imageUrl: '/images/bag-sumbing.jpg' },
  { slug: 'prau-natural-el-davisio-surya', imageUrl: '/images/bag-prau.jpg' },
  { slug: 'inmaculada-pink-bourbon-marfil', imageUrl: '/images/bag-grand-reserve.jpg' },
  { slug: 'argopuro-walida-anaerob-arcapada', imageUrl: '/images/bag-walida.jpg' },
];

const FEATURED_PRODUCTS: ProductItem[] = FEATURED_CONFIG.flatMap(({ slug, imageUrl }) => {
  const product = PRODUCTS.find((item) => item.slug === slug);
  if (!product) return [];

  const variant = product.variants.find((item) => item.weightGrams === 200) ?? product.variants[0];
  return [{
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.categoryLabel,
    weightGrams: variant.weightGrams,
    weightLabel: variant.weightLabel,
    price: variant.price,
    series: product.series,
    notes: product.tastingNotes,
    imageUrl,
  }];
});

const CATEGORIES = [
  {
    id: 'filter',
    title: 'Filter Roast',
    subtitle: 'Ijen, Java Exotic, Walida, Sunda',
    href: '/catalog?category=filter',
  },
  {
    id: 'espresso',
    title: 'Espresso Roast',
    subtitle: 'Robusta Dampit & Arabica',
    href: '/catalog?category=espresso',
  },
  {
    id: 'reserve',
    title: 'Grand Reserve',
    subtitle: 'Pilihan micro-lot',
    href: '/catalog?category=reserve',
  },
  {
    id: 'beverages',
    title: 'Seduhan Slowbar',
    subtitle: 'Koleksi kopi per cangkir',
    href: '/catalog?category=beverages',
  },
  {
    id: 'byob',
    title: 'Racik BYOB',
    subtitle: 'Simulator profil sangrai',
    href: '/blend-builder',
  },
];

const MARQUEE_ITEMS = ['PILIHAN ROASTERY', 'PILIHAN ROASTERY', 'PILIHAN ROASTERY'];

const PROCESS_STEPS = [
  {
    id: 'asal',
    number: '01',
    word: 'ASAL',
    title: 'Karakter dimulai sebelum kopi tiba di roastery.',
    description:
      'Dari lereng Kaldera Ijen, Gunung Sumbing, hingga pilihan micro-lot dunia, setiap kopi dikurasi agar karakter asalnya tetap terbaca di cangkir.',
    detail: 'Kaldera Ijen · Gunung Sumbing · Argopuro Walida',
    imageUrl: '/images/the-roastery-behind-your-business.png',
    imageAlt: 'Kolase origin, biji kopi, dan proses produksi 52 Coffee Roastery',
    imagePosition: 'center',
    actionHref: '/about',
    actionLabel: 'Kenali filosofi kami',
  },
  {
    id: 'sangrai',
    number: '02',
    word: 'SANGRAI',
    title: 'Profil rasa dibentuk lewat sangrai yang presisi.',
    description:
      'Setiap batch disangrai menggunakan teknologi infrared untuk membentuk profil ekstraksi yang konsisten, manis, dan jernih.',
    detail: 'Small-batch · Profil ekstraksi · Konsistensi',
    imageUrl: '/images/roaster-footage.png',
    imageAlt: 'Tim 52 Coffee bekerja di depan mesin sangrai',
    imagePosition: 'center 42%',
    actionHref: '/about',
    actionLabel: 'Lihat proses roastery',
  },
  {
    id: 'seduh',
    number: '03',
    word: 'SEDUH',
    title: 'Rasa diselesaikan lewat cara seduhmu.',
    description:
      'Gunakan panduan seduh untuk menyesuaikan rasio, dosis, dan waktu agar karakter kopi yang sudah dibentuk saat roasting tetap terasa jelas.',
    detail: 'Rasio · Dosis · Waktu',
    imageUrl: '/images/canva-hero-pour.jpg',
    imageAlt: 'Proses menuang air untuk seduhan pour-over 52 Coffee',
    imagePosition: 'center',
    actionHref: '/guide',
    actionLabel: 'Buka panduan seduh',
  },
];

const FAQS = [
  {
    question: 'Apakah biji kopi di 52 Coffee selalu fresh roasted?',
    answer:
      'Ya, seluruh biji kopi disangrai dalam batch kecil (small-batch) setiap minggunya di roastery kami di Malang. Tanggal sangrai (Roast Date) selalu tertera jelas pada kemasan agar Anda menikmati masa resting optimal (7-30 hari setelah sangrai).',
  },
  {
    question: 'Bagaimana cara memilih ukuran gilingan (grind size) yang tepat?',
    answer:
      'Saat memesan di website, Anda bisa memilih varian Whole Bean (biji utuh untuk menjaga kesegaran maksimal), Giling Kasar (Cold Brew, French Press), Giling Medium (V60, Aeropress, Kalita Wave), atau Giling Halus (Espresso, Mokapot, Tubruk).',
  },
  {
    question: 'Apakah 52 Coffee melayani pengiriman ke seluruh Indonesia?',
    answer:
      'Tentu! Kami melayani pengiriman ke seluruh kota di Indonesia dengan packing kardus khusus dan bubble wrap tebal. Seluruh pesanan yang masuk sebelum pukul 15.00 WIB akan diproses kirim di hari yang sama.',
  },
  {
    question: 'Apakah bisa memesan custom blend atau harga wholesale untuk kedai kopi?',
    answer:
      'Sangat bisa! Kami bermitra dengan puluhan coffee shop di Malang, Surabaya, dan kota lainnya. Anda dapat menggunakan fitur BYOB Blend Simulator kami atau langsung menghubungi tim wholesale kami di menu Work With Us.',
  },
  {
    question: 'Kapan jam operasional Slowbar & Tasting Room di Malang?',
    answer:
      'Slowbar & Tasting Room kami buka Senin - Jumat, pukul 11.00 - 16.00 WIB di Jl. KH Agus Salim No. 11, Klojen, Kota Malang. Anda bisa langsung datang untuk mencicipi kurasi origin terbaru kami.',
  },
];

export default function HomePage() {
  const { addItem } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeProcess, setActiveProcess] = useState(0);
  const [draggingProducts, setDraggingProducts] = useState(false);
  const marqueeRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const productRailRef = useRef<HTMLDivElement>(null);
  const productDragRef = useRef({
    active: false,
    didDrag: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
  });
  const reducedMotion = useReducedMotion();
  const { scrollYProgress: marqueeProgress } = useScroll({
    target: marqueeRef,
    offset: ['start end', 'end start'],
  });
  const marqueeX = useTransform(marqueeProgress, [0, 1], ['4%', '-18%']);
  const { scrollYProgress: processProgress } = useScroll({
    target: processRef,
    offset: ['start start', 'end end'],
  });
  const processStep = PROCESS_STEPS[activeProcess];

  useMotionValueEvent(processProgress, 'change', (progress) => {
    const nextProcess = Math.min(PROCESS_STEPS.length - 1, Math.floor(progress * PROCESS_STEPS.length));
    setActiveProcess((current) => (current === nextProcess ? current : nextProcess));
  });

  const handleProductPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;

    productDragRef.current = {
      active: true,
      didDrag: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
    };
  };

  const handleProductPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = productDragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;

    const distance = event.clientX - drag.startX;
    if (!drag.didDrag && Math.abs(distance) < 6) return;

    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    drag.didDrag = true;
    setDraggingProducts(true);
    event.currentTarget.scrollLeft = drag.startScrollLeft - distance;
  };

  const handleProductPointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = productDragRef.current;
    if (drag.pointerId !== event.pointerId) return;

    drag.active = false;
    setDraggingProducts(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag.didDrag) {
      window.setTimeout(() => {
        productDragRef.current.didDrag = false;
      }, 0);
    }
  };

  const preventClickAfterDrag = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!productDragRef.current.didDrag) return;
    event.preventDefault();
    event.stopPropagation();
    productDragRef.current.didDrag = false;
  };

  const handleQuickAdd = (product: ProductItem) => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      weightGrams: product.weightGrams,
      weightLabel: product.weightLabel,
      grind: 'whole',
      grindLabel: 'Whole Beans (Biji Utuh)',
      unitPrice: product.price,
      quantity: 1,
      series: product.series,
      tastingNotes: product.notes,
    });
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1500);
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

      <section ref={marqueeRef} className={styles.marquee} aria-label="Pilihan roastery">
        <div className={styles.marqueeViewport}>
          <motion.div
            className={styles.marqueeTrack}
            aria-hidden="true"
            style={reducedMotion ? undefined : { x: marqueeX }}
          >
            {[0, 1].map((group) => (
              <div className={styles.marqueeGroup} key={group}>
                {MARQUEE_ITEMS.map((item, itemIndex) => (
                  <span key={`${group}-${itemIndex}`}>{item}<i>•</i></span>
                ))}
              </div>
            ))}
          </motion.div>
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
              <p>Empat profil untuk mengenali rentang rasa 52 Coffee—dari floral dan fruity hingga karakter yang lebih intens.</p>
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
            {CATEGORIES.map((category) => (
              <Link href={category.href} key={category.id} className={styles.categoryLink}>
                <span className={styles.categoryText}>
                  <strong>{category.title}</strong>
                  <small>{category.subtitle}</small>
                </span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            ))}
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
                <p className={styles.eyebrow}>Perjalanan rasa / {processStep.number}</p>
                <h2 id="process-heading">{processStep.title}</h2>
                <p className={styles.leadCopy}>{processStep.description}</p>
                <p className={styles.processDetail}>{processStep.detail}</p>
                <Link href={processStep.actionHref} className={styles.inverseLink}>
                  {processStep.actionLabel} <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </motion.article>
            </AnimatePresence>
          </div>

          <div className={styles.processSteps} aria-label="Tahap perjalanan rasa">
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
        <div className={styles.sectionShell}>
          <div className={styles.storyGrid}>
            <motion.div
              className={styles.storyCopy}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55 }}
            >
              <p className={styles.eyebrow}>Filosofi 52</p>
              <h2 id="story-heading">Dari karakter asal, menuju cangkir yang personal.</h2>
              <p>
                Selamat datang di 52 Coffee &amp; Roastery. Dedikasi kami adalah menghadirkan specialty coffee dalam pengalaman yang mudah dijelajahi—dari memilih biji hingga menemukan cara seduhnya.
              </p>
              <Link href="/guide" className={styles.inverseLink}>
                Buka panduan &amp; kalkulator seduh <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </motion.div>
            <figure className={styles.storyMedia}>
              <Image
                src="/images/hero-52coffee-dripbox.png"
                alt="52 Coffee drip box dalam penataan studio"
                fill
                sizes="(min-width: 1024px) 56vw, 100vw"
                className={styles.coverImage}
              />
              <figcaption>52 Coffee / Drip Box</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={styles.b2b} aria-labelledby="b2b-heading">
        <div className={styles.b2bCopy}>
          <p className={styles.eyebrow}>Kemitraan / B2B</p>
          <h2 id="b2b-heading">Kopi untuk ruang yang kamu bangun.</h2>
          <p>
            Jelajahi kebutuhan wholesale, racikan BYOB, dan dukungan untuk membentuk profil kopi yang sesuai dengan arah kedaimu.
          </p>
          <Link href="/work-with-us" className={styles.lightButton}>
            Mulai percakapan <ArrowUpRight aria-hidden="true" size={17} />
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
              <p className={styles.eyebrow}>Informasi / FAQ</p>
              <h2 id="faq-heading">Yang sering ditanyakan sebelum menyeduh.</h2>
              <p>Pertanyaan umum seputar sangrai, pengiriman, pilihan gilingan, dan layanan 52 Coffee.</p>
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
              <Link href="/guide" className={styles.textLink}>Buka panduan seduh <ArrowUpRight aria-hidden="true" size={17} /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
