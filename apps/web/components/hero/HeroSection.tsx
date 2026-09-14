'use client';

import type { KeyboardEvent, PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import styles from './HeroSection.module.css';

const HERO_SLIDES = [
  {
    src: '/images/canva-brewista-pour.jpg',
    alt: 'Barista menuang air untuk seduhan manual 52 Coffee',
    label: 'Seduh',
    note: 'Ritual harian',
    position: 'center 46%',
  },
  {
    src: '/images/byob-roaster-craft.jpg',
    alt: 'Roaster 52 Coffee mencatat hasil peracikan kopi',
    label: 'Racik',
    note: 'Dibuat presisi',
    position: 'center 42%',
  },
  {
    src: '/images/canva-lamarzocco-espresso.jpg',
    alt: 'Ekstraksi espresso di mesin kopi 52 Coffee',
    label: 'Slowbar',
    note: 'Temui kami',
    position: 'center 45%',
  },
  {
    src: '/images/canva-cafe-table.jpg',
    alt: 'Sajian kopi dan pastry di meja 52 Coffee',
    label: 'Nikmati',
    note: 'Di meja yang sama',
    position: 'center 52%',
  },
  {
    src: '/images/roaster-footage.png',
    alt: 'Tim 52 Coffee bekerja di depan mesin sangrai',
    label: 'Sangrai',
    note: 'Dikerjakan di Malang',
    position: 'center 42%',
  },
];

function circularOffset(index: number, activeIndex: number) {
  let offset = index - activeIndex;
  const midpoint = HERO_SLIDES.length / 2;

  if (offset > midpoint) offset -= HERO_SLIDES.length;
  if (offset < -midpoint) offset += HERO_SLIDES.length;
  return offset;
}

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(2);
  const [cursorVisible, setCursorVisible] = useState(false);
  const hoverSlideRef = useRef(activeSlide);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothCursorX = useSpring(cursorX, { stiffness: 620, damping: 44, mass: 0.32 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 620, damping: 44, mass: 0.32 });
  const activeItem = HERO_SLIDES[activeSlide];

  useEffect(() => () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }, []);

  const selectFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = Math.min(bounds.width - 1, Math.max(0, event.clientX - bounds.left));
    const relativeY = Math.min(bounds.height, Math.max(0, event.clientY - bounds.top));
    const nextSlide = Math.min(
      HERO_SLIDES.length - 1,
      Math.floor((relativeX / bounds.width) * HERO_SLIDES.length),
    );

    cursorX.set(relativeX);
    cursorY.set(relativeY);
    setCursorVisible(true);
    if (hoverSlideRef.current === nextSlide) return;

    hoverSlideRef.current = nextSlide;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setActiveSlide(nextSlide), 85);
  };

  const stopPointerSelection = () => {
    setCursorVisible(false);
    hoverSlideRef.current = activeSlide;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  };

  const handleKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setActiveSlide((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setActiveSlide(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      setActiveSlide(HERO_SLIDES.length - 1);
    }
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-heading" aria-describedby="hero-description">
      <div className={styles.frame}>
        <Link href="/catalog" className={styles.orderPill}>
          <span aria-hidden="true" /> Pesan Kopi <ArrowRight aria-hidden="true" size={15} />
        </Link>

        <motion.h1
          id="hero-heading"
          className={styles.wordmark}
          initial={{ opacity: 0, scale: .94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : .85, ease: [0.16, 1, 0.3, 1] }}
        >
          52 COFFEE
        </motion.h1>

        <div
          className={styles.carousel}
          role="group"
          tabIndex={0}
          aria-label="Galeri 52 Coffee. Gerakkan pointer atau gunakan tombol panah kiri dan kanan."
          onPointerMove={selectFromPointer}
          onPointerLeave={stopPointerSelection}
          onKeyDown={handleKeyboard}
        >
          {HERO_SLIDES.map((item, index) => {
            const offset = circularOffset(index, activeSlide);
            const distance = Math.abs(offset);
            const scale = distance === 0 ? 1 : distance === 1 ? .76 : .56;

            return (
              <motion.button
                type="button"
                key={item.src}
                className={styles.carouselItem}
                animate={{
                  x: `${offset * 27}vw`,
                  y: `${distance * 7.2}vh`,
                  rotate: offset * 7,
                  scale,
                  opacity: distance > 2 ? 0 : distance === 2 ? .58 : 1,
                }}
                transition={reducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 155, damping: 24, mass: .92 }}
                onClick={() => { hoverSlideRef.current = index; setActiveSlide(index); }}
                onFocus={() => { hoverSlideRef.current = index; setActiveSlide(index); }}
                aria-label={`Tampilkan visual ${item.label}: ${item.note}`}
                aria-current={activeSlide === index ? 'true' : undefined}
                data-active={activeSlide === index}
                style={{ zIndex: 8 - distance }}
              >
                <span className={styles.media}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    priority={index === 2}
                    sizes="(min-width: 1024px) 31vw, (min-width: 768px) 38vw, 66vw"
                    style={{ objectPosition: item.position }}
                  />
                </span>
                <span className={styles.itemMeta}>
                  <span>{item.label}</span>
                  <small>{item.note}</small>
                </span>
              </motion.button>
            );
          })}

          <motion.div
            className={styles.cursorCue}
            aria-hidden="true"
            data-visible={cursorVisible}
            style={{ x: smoothCursorX, y: smoothCursorY }}
          >
            <ArrowLeft size={14} /> Gerakkan <ArrowRight size={14} />
          </motion.div>
        </div>

        <motion.div
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : .65, delay: reducedMotion ? 0 : .16 }}
        >
          <p id="hero-description">Karakter asal, presisi sangrai, dan ritual seduh dalam satu pengalaman.</p>
          <span aria-live="polite">{String(activeSlide + 1).padStart(2, '0')} / 05 — {activeItem.label}</span>
        </motion.div>

        <p className={styles.location}>Malang · Indonesia</p>
        <p className={styles.scrollCue}>Gulir <span aria-hidden="true">↓</span></p>
      </div>
    </section>
  );
}
