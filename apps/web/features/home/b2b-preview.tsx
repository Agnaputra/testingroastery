'use client';

import {
  motion
} from 'framer-motion';
import {
  ArrowUpRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './home-page.module.css';
export function B2BPreview({
  reducedMotion,
}: {
  reducedMotion: boolean | null
}) {
  return (
    <section className={styles.b2b} aria-labelledby="b2b-heading">
      <motion.div
        className={styles.b2bCopy}
        initial={reducedMotion ? false : { opacity: 0.55, x: -24 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: reducedMotion ? 0 : 0.58, ease: [0.16, 1, 0.3, 1] }}
      >
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
      </motion.div>
      <motion.figure
        className={styles.b2bMedia}
        initial={reducedMotion ? false : { opacity: 0.7, clipPath: 'inset(0 0 0 12%)' }}
        whileInView={{ opacity: 1, clipPath: 'inset(0 0 0 0%)' }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reducedMotion ? 0 : 0.68, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src="/images/byob-craft-collage.jpg"
          alt="Kolase proses meracik kopi dan penyajian minuman"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={styles.coverImage}
        />
        <figcaption>Racik / Uji / Sajikan</figcaption>
      </motion.figure>
    </section>
  );
}
