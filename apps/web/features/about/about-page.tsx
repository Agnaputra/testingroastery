'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import styles from './about-page.module.css';
import { Behind52Coffee } from './behind-52-coffee';
import { OurStory } from './our-story';
import { RoasteryJourney } from './roastery-journey';
import { SlowbarAmbience } from './slowbar-ambience';



const PRINCIPLES = [
  {
    number: '01',
    title: 'Rasa sebelum jargon',
    description: 'Kami ingin kopi terasa dekat dan dapat dipahami. Istilah teknis dipakai untuk membantu percakapan, bukan membuat pengalaman minum kopi terasa rumit.',
  },
  {
    number: '02',
    title: 'Konsistensi yang diuji',
    description: 'Setiap profil sangrai perlu dibuktikan kembali melalui cupping dan penyeduhan. Catatan rasa menjadi hasil evaluasi, bukan sekadar kata-kata pada kemasan.',
  },
  {
    number: '03',
    title: 'Terbuka untuk berkembang',
    description: 'Kopi selalu memberi ruang untuk belajar. Masukan dari barista, pelanggan, dan mitra membantu kami memperbaiki cara menyangrai, menyeduh, dan melayani.',
  },
];

const MARQUEE_ITEMS = ['SOURCE', 'ROAST', 'CUP', 'REPEAT'];

export default function AboutPage() {
  const reducedMotion = useReducedMotion();
  const reveal = {
    initial: reducedMotion ? false : { opacity: 0, y: 34 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reducedMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <main className={`${styles.page} page-shell`}>
      <Behind52Coffee reducedMotion={reducedMotion} />

      <OurStory reveal={reveal} />

      <div className={styles.marquee} aria-label="Proses 52 Coffee: source, roast, cup, repeat">
        <div className={styles.marqueeTrack} aria-hidden="true">
          {[0, 1].map((group) => (
            <div className={styles.marqueeGroup} key={group}>
              {Array.from({ length: 5 }, (_, repetition) => MARQUEE_ITEMS.map((item) => (
                <span key={`${group}-${repetition}-${item}`}>{item}<i>·</i></span>
              )))}
            </div>
          ))}
        </div>
      </div>

      <motion.section className={styles.principles} aria-labelledby="principles-heading" {...reveal}>
        <div className={styles.principlesIntro}>
          <p className={styles.eyebrow}>Cara kami memandang kopi</p>
          <h2 id="principles-heading">Teliti dalam proses.<br />Hangat dalam percakapan.</h2>
          <p>Kami bekerja dengan ketelitian seorang roaster, tetapi menyampaikan kopi dengan bahasa yang tetap ramah. Tujuannya sederhana: membantu lebih banyak orang menemukan rasa yang mereka sukai dan memahami alasan di baliknya.</p>
        </div>
        <div className={styles.principlesGrid}>
          {PRINCIPLES.map((principle, index) => (
            <motion.article key={principle.number} initial={reducedMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : index * 0.1 }}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <RoasteryJourney reveal={reveal} reducedMotion={reducedMotion} />

      <SlowbarAmbience reveal={reveal} />

      <motion.section className={styles.finalCta} aria-labelledby="about-cta-heading" {...reveal}>
        <p className={styles.eyebrow}>Temukan karakter pilihanmu</p>
        <h2 id="about-cta-heading">CERITA BERIKUTNYA<br />ADA DI CANGKIRMU.</h2>
        <Link href="/catalog">Jelajahi katalog <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </motion.section>
    </main>
  );
}
