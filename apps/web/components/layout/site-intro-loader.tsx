'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FiftyTwoLogo } from './logo';
import styles from './site-intro-loader.module.css';

const INTRO_STORAGE_KEY = '52coffee:intro-seen';

export function SiteIntroLoader() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let hasSeenIntro = false;

    try {
      hasSeenIntro = window.sessionStorage.getItem(INTRO_STORAGE_KEY) === 'true';
    } catch {
      // The intro still works when storage is unavailable.
    }

    if (hasSeenIntro) {
      setVisible(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
      } catch {
        // Storage is optional; never keep the visitor behind the intro.
      }
      document.body.style.overflow = previousOverflow;
      setVisible(false);
    }, reducedMotion ? 120 : 760);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [reducedMotion]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.dataset.introSeen = 'true';
      }}
    >
      {visible && (
        <motion.div
          className={`${styles.loader} site-intro-loader`}
          aria-hidden="true"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { y: '-100%' }}
          transition={
            reducedMotion
              ? { duration: 0.12 }
              : { duration: 0.46, ease: [0.76, 0, 0.24, 1] }
          }
        >
          <div className={styles.content}>
            <motion.p
              className={styles.eyebrow}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.04 }}
            >
              Roasted with precision · Malang
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.46, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <FiftyTwoLogo size="xl" textColor="light" />
            </motion.div>

            <div className={styles.rule}>
              <motion.span
                className={styles.ruleFill}
                initial={reducedMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.52, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <motion.div
              className={styles.stages}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <span>Asal</span>
              <span>Sangrai</span>
              <span>Seduh</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
