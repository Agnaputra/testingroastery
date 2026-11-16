'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './about-page.module.css';
export function SlowbarAmbience({
  reveal,
}: {
  reveal: Pick<import('framer-motion').MotionProps, 'initial' | 'whileInView' | 'viewport' | 'transition'>
}) {
  return (
    <motion.section id="slowbar-ambience" className={styles.slowbar} aria-labelledby="slowbar-heading" {...reveal}>
      <div className={styles.slowbarHeading}>
        <div><p className={styles.eyebrow}>Slowbar Ambience</p><h2 id="slowbar-heading">Ruang untuk menyeduh lebih pelan.</h2></div>
        <p>Di sini, pilihan beans, teknik seduh, dan percakapan bertemu dalam satu meja. Pengunjung dapat mengeksplorasi karakter kopi, membandingkan metode, dan memahami bagaimana perubahan kecil memengaruhi hasil akhir.</p>
      </div>
      <div className={styles.slowbarGallery}>
        <figure className={styles.slowbarTall}><Image src="/images/tasting-room-footage.png" alt="Suasana Slowbar 52 Coffee" fill sizes="(max-width: 768px) 100vw, 42vw" className={styles.coverImage} /></figure>
        <figure><Image src="/images/canva-lamarzocco-espresso.jpg" alt="Barista menyiapkan espresso" fill sizes="(max-width: 768px) 100vw, 28vw" className={styles.coverImage} /></figure>
        <figure><Image src="/images/canva-morning-v60.jpg" alt="Proses menyeduh kopi dengan V60" fill sizes="(max-width: 768px) 100vw, 28vw" className={styles.coverImage} /></figure>
      </div>
      <div className={styles.visitStrip}>
        <div><p className={styles.eyebrow}>Your neighborhood roastery</p><h3>Seduh, cicip, lalu bicarakan.</h3></div>
        <p><MapPin size={17} aria-hidden="true" /> Jl. KH. Agus Salim No. 11, Sukoharjo, Klojen, Kota Malang</p>
        <Link href="/slowbar">Kunjungi Slowbar <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </div>
    </motion.section>
  );
}
