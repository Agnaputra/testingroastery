'use client';

import {
  motion
} from 'framer-motion';
import {
  ArrowRight,
  Play,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './home-page.module.css';
export function Story({
  reducedMotion,
  storyVideoPlaying,
  storyVideoReady,
  storyPreviewMounted,
  setStoryVideoReady,
  setStoryVideoPlaying,
  storyPlayRef,
}: {
  reducedMotion: boolean | null;
  storyVideoPlaying: boolean;
  storyVideoReady: boolean;
  storyPreviewMounted: boolean;
  setStoryVideoReady: React.Dispatch<React.SetStateAction<boolean>>;
  setStoryVideoPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  storyPlayRef: React.RefObject<HTMLButtonElement>
}) {
  return (
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
  );
}
