'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Coffee, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { SENSORY_PROFILES } from './spectrum-data';
import styles from './SensorySection.module.css';

export function SensorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<(typeof SENSORY_PROFILES)[number] | null>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const artworkRotate = useTransform(scrollYProgress, [0, 1], [-7, 8]);
  const artworkY = useTransform(scrollYProgress, [0, 1], [28, -24]);

  useEffect(() => {
    if (!selectedFlavor) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedFlavor(null);
      if (event.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>('button, a[href]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      previouslyFocused?.focus();
    };
  }, [selectedFlavor]);

  return (
    <section ref={sectionRef} id="sensory-spectrum" aria-labelledby="sensory-heading" className={styles.section}>
      <div className={`site-container ${styles.layout}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>SENSORY TASTE SPECTRUM</p>
          <h2 id="sensory-heading" className={styles.heading}>
            <span>Kenali Rasa di</span>{' '}
            <span>Setiap Seduhan.</span>
          </h2>
          <p className={styles.description}>
            Setiap kopi yang kami sangrai dikurasi melalui peta rasa sensorik. Dari floral yang lembut hingga cokelat yang pekat, temukan karakter yang paling sesuai dengan seleramu.
          </p>
        </div>

        <figure className={styles.visual}>
          <div className={styles.artworkStage}>
            <motion.div className={styles.artworkMotion} style={reducedMotion ? undefined : { rotate: artworkRotate, y: artworkY }}>
              <Image
                src="/images/coffee-tasting-notes.png"
                alt="Coffee tasting notes wheel dengan kategori floral, fruity, sour, green, spice, nutty, dan sweet"
                width={1312}
                height={1199}
                sizes="(min-width: 1024px) 560px, (min-width: 768px) 42vw, calc(100vw - 24px)"
                className={styles.artwork}
              />
              <div className={styles.wheelMap} aria-label="Area interaktif kategori rasa">
                {SENSORY_PROFILES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.wheelSegment}
                    style={{
                      '--flavor-color': item.color,
                      '--segment-rotation': `${item.rotation}deg`,
                    } as CSSProperties}
                    onClick={() => setSelectedFlavor(item)}
                    aria-label={`Buka penjelasan rasa ${item.name}`}
                    aria-haspopup="dialog"
                    title={item.name}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          <figcaption className={styles.caption}>52 Coffee Sensory Flavor Spectrum</figcaption>
          <p className={styles.interactionHint}>Tekan area warna untuk mengenali karakternya.</p>
        </figure>

        <div className={styles.notes}>
          <p className={styles.notesLabel}>FLAVOR NOTES</p>
          <ul className={styles.flavorList} aria-label="Daftar kategori rasa kopi">
            {SENSORY_PROFILES.map((item) => (
              <li
                key={item.id}
                className={styles.flavorItem}
                data-flavor={item.id}
                style={{ '--flavor-color': item.color } as CSSProperties}
              >
                <button type="button" className={styles.flavorButton} onClick={() => setSelectedFlavor(item)} aria-haspopup="dialog">
                  <span className={styles.dot} aria-hidden="true" />
                  <span>
                    <strong className={styles.flavorTitle}>{item.name}</strong>
                    <span className={styles.flavorDescription}>{item.notes}</span>
                  </span>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href="/catalog" className={`btn-primary ${styles.primaryAction}`}>
            Jelajahi kopi berdasarkan rasa <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/blend-builder" className={styles.secondaryAction}>
            <Sparkles size={16} aria-hidden="true" />Coba Sensory Simulator
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {selectedFlavor && (
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : .2 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedFlavor(null);
            }}
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`flavor-${selectedFlavor.id}-title`}
              aria-describedby={`flavor-${selectedFlavor.id}-description`}
              className={styles.modal}
              style={{ '--flavor-color': selectedFlavor.color } as CSSProperties}
              initial={reducedMotion ? false : { opacity: 0, y: 24, scale: .97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: .98 }}
              transition={{ duration: reducedMotion ? 0 : .32, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.modalTopline}>
                <span><Coffee size={16} aria-hidden="true" /> Catatan sensorik</span>
                <button ref={closeButtonRef} type="button" onClick={() => setSelectedFlavor(null)} aria-label="Tutup penjelasan rasa">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.modalBody}>
                <span className={styles.modalSwatch} aria-hidden="true" />
                <p className={styles.modalKicker}>{selectedFlavor.notes}</p>
                <h3 id={`flavor-${selectedFlavor.id}-title`}>{selectedFlavor.name}</h3>
                <p id={`flavor-${selectedFlavor.id}-description`} className={styles.modalDescription}>{selectedFlavor.description}</p>
                <div className={styles.tastingCue}>
                  <span>Cara mengenalinya</span>
                  <p>{selectedFlavor.cue}</p>
                </div>
                <Link href="/catalog" className={styles.modalAction} onClick={() => setSelectedFlavor(null)}>
                  Lihat kopi dengan profil ini <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
