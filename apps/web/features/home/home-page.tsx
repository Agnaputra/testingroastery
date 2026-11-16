'use client';

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { getPublishedProducts } from '../../lib/catalog-master';
import { getCustomerProductName } from '../../lib/data';
import { useCartStore } from '../../lib/store/useCartStore';
import { useCatalogPublication } from '../../lib/use-catalog-publication';
import { B2BPreview } from './b2b-preview';
import { CatalogPreview } from './catalog-preview';
import { Faq } from './faq';
import { FeaturedProducts, type ProductItem } from './featured-products';
import { HeroSection } from './hero/HeroSection';
import styles from './home-page.module.css';
import { RoasteryProcess } from './roastery-process';
import { SensorySection } from './sensory/SensorySection';
import { Story } from './story';



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



export default function HomePage() {
  const { addItem } = useCartStore();
  const { authority, refresh: refreshPublication } = useCatalogPublication();
  const activeFeaturedProducts = FEATURED_PRODUCTS.flatMap((product) => {
    const current = authority?.products.find((item) => item.slug === product.slug);
    const variant = current?.variants.find((item) => item.weightGrams === product.weightGrams);
    return current && variant ? [{ ...product, price: variant.price }] : [];
  });
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

  const handleQuickAdd = async (product: ProductItem) => {
    const current = await refreshPublication();
    const currentProduct = current.products.find((item) => item.slug === product.slug);
    const currentVariant = currentProduct?.variants.find((item) => item.weightGrams === product.weightGrams);
    if (current.status !== 'verified' || !currentVariant) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      weightGrams: product.weightGrams,
      weightLabel: product.weightLabel,
      grind: 'whole',
      grindLabel: 'Biji utuh',
      unitPrice: currentVariant.price,
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
  };

  const handleProductPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { active, pointerId, startX, startScrollLeft } = productDragRef.current;
    if (!active || event.pointerId !== pointerId) return;
    const rail = productRailRef.current;
    if (!rail) return;

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 6) {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
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
        <motion.p
          initial={reducedMotion ? false : { opacity: 0.55, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        >52 Coffee &amp; Roastery / Malang</motion.p>
        <motion.h2
          id="manifesto-heading"
          initial={reducedMotion ? false : { opacity: 0.6, y: 22, clipPath: 'inset(0 0 12% 0)' }}
          whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ duration: reducedMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          Kami menyangrai kopi. Karakter asal, profil rasa, dan ritual seduh yang mengikutinya adalah bagian dari cerita setiap cangkir.
        </motion.h2>
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

      <FeaturedProducts reducedMotion={reducedMotion} productRailRef={productRailRef} draggingProducts={draggingProducts} handleProductPointerDown={handleProductPointerDown} handleProductPointerMove={handleProductPointerMove} handleProductPointerEnd={handleProductPointerEnd} productDragRef={productDragRef} setDraggingProducts={setDraggingProducts} preventClickAfterDrag={preventClickAfterDrag} authority={authority} activeFeaturedProducts={activeFeaturedProducts} handleQuickAdd={handleQuickAdd} addedId={addedId} />

      <CatalogPreview reducedMotion={reducedMotion} />

      <SensorySection />

      <RoasteryProcess reducedMotion={reducedMotion} processRef={processRef} processStep={processStep} activeProcess={activeProcess} setActiveProcess={setActiveProcess} PROCESS_STEPS={PROCESS_STEPS} />

      <Story reducedMotion={reducedMotion} storyVideoPlaying={storyVideoPlaying} storyVideoReady={storyVideoReady} storyPreviewMounted={storyPreviewMounted} setStoryVideoReady={setStoryVideoReady} setStoryVideoPlaying={setStoryVideoPlaying} storyPlayRef={storyPlayRef} />

      <B2BPreview reducedMotion={reducedMotion} />

      <Faq reducedMotion={reducedMotion} openFaq={openFaq} setOpenFaq={setOpenFaq} />

      <section className={styles.finalCta} aria-labelledby="final-cta-heading">
        <div className={styles.sectionShell}>
          <motion.p
            className={styles.eyebrow}
            initial={reducedMotion ? false : { opacity: 0.55, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: reducedMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
          >Mulai dari satu cangkir</motion.p>
          <motion.h2
            id="final-cta-heading"
            initial={reducedMotion ? false : { opacity: 0.65, y: 26, clipPath: 'inset(0 0 20% 0)' }}
            whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: reducedMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}
          >WAKTUNYA<br />SEDUH.</motion.h2>
          <motion.div
            className={styles.finalCtaFooter}
            initial={reducedMotion ? false : { opacity: 0.6, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: reducedMotion ? 0 : 0.52, ease: [0.16, 1, 0.3, 1] }}
          >
            <p>Temukan kopi yang cocok dengan cara kamu menikmati hari.</p>
            <div>
              <Link href="/catalog" className={styles.darkButton}>Pesan kopi <ArrowRight aria-hidden="true" size={17} /></Link>
              <Link href="/coffee-lab/brewing-guidance" className={styles.textLink}>Buka panduan seduh <ArrowUpRight aria-hidden="true" size={17} /></Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
