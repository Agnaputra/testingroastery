'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './about-page.module.css';
export function Behind52Coffee({
  reducedMotion,
}: {
  reducedMotion: boolean | null
}) {
  return (
    <section id="behind" className={styles.hero} aria-labelledby="about-heading">
      <motion.div className={styles.heroTopline} initial={reducedMotion ? false : { opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.65 }}>
        <p>52 Coffee &amp; Roastery · Malang</p>
        <Link href="/catalog">Jelajahi beans <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </motion.div>

      <motion.div className={styles.heroCopy} initial={reducedMotion ? false : { opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}>
        <p className={styles.eyebrow}>Behind 52 Coffee</p>
        <h1 id="about-heading"><span>SETIAP CANGKIR</span><span>DIMULAI DARI</span><span>RASA INGIN TAHU.</span></h1>
        <p>Kami membaca kopi dari bahan baku, mengembangkan karakternya melalui sangrai, lalu menerjemahkannya kembali lewat seduhan dan percakapan.</p>
      </motion.div>

      <motion.div className={styles.heroCollage} aria-hidden="true" initial={reducedMotion ? false : { opacity: 0, y: 70, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reducedMotion ? 0 : 1, delay: reducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}>
        <div className={styles.heroImageLeft}><Image src="/images/canva-coffee-cherries.jpg" alt="" fill priority sizes="34vw" className={styles.coverImage} /></div>
        <div className={styles.heroImageMain}><Image src="/images/byob-roaster-craft.jpg" alt="" fill priority sizes="44vw" className={styles.coverImage} /></div>
        <div className={styles.heroImageRight}><Image src="/images/canva-brewista-pour.jpg" alt="" fill priority sizes="30vw" className={styles.coverImage} /></div>
      </motion.div>

      <a href="#our-story" className={styles.scrollCue}>Cerita kami <ArrowDownRight size={17} aria-hidden="true" /></a>
    </section>
  );
}
