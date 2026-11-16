'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './about-page.module.css';
export function OurStory({
  reveal,
}: {
  reveal: Pick<import('framer-motion').MotionProps, 'initial' | 'whileInView' | 'viewport' | 'transition'>
}) {
  return (
    <motion.section id="our-story" className={styles.story} aria-labelledby="story-heading" {...reveal}>
      <div className={styles.storyCopy}>
        <p className={styles.eyebrow}>A good coffee should be understood</p>
        <h2 id="story-heading">Roastery dan slowbar dalam satu percakapan rasa.</h2>
        <div className={styles.storyBody}>
          <p>52 Coffee &amp; Roastery lahir dari keinginan untuk memahami apa yang membuat sebuah kopi terasa berbeda. Bagi kami, rasa tidak muncul dari satu tahap saja, tetapi dari rangkaian keputusan sejak memilih bahan baku hingga menentukan cara menyeduhnya.</p>
          <p>Roastery mengembangkan karakter setiap beans melalui profil panas yang terukur. Slowbar membawa hasilnya kembali ke meja: dicicipi, dibicarakan, dan disesuaikan agar setiap kopi hadir dengan identitas yang jelas tanpa kehilangan kenyamanan saat diminum.</p>
        </div>
      </div>
      <div className={styles.storyGallery}>
        <figure className={styles.storyFrameOne}><Image src="/images/canva-farmer-harvest.jpg" alt="Petani memanen buah kopi" fill sizes="(max-width: 768px) 84vw, 23vw" className={styles.coverImage} /></figure>
        <figure className={styles.storyFrameTwo}><Image src="/images/canva-roaster-drum.jpg" alt="Proses pengembangan profil sangrai" fill sizes="(max-width: 768px) 84vw, 27vw" className={styles.coverImage} /></figure>
        <figure className={styles.storyFrameThree}><Image src="/images/canva-cafe-table.jpg" alt="Kopi tersaji di meja slowbar" fill sizes="(max-width: 768px) 84vw, 25vw" className={styles.coverImage} /></figure>
        <figure className={styles.storyFrameFour}><Image src="/images/tasting-room-footage.png" alt="Suasana Tasting Room 52 Coffee" fill sizes="(max-width: 768px) 84vw, 29vw" className={styles.coverImage} /></figure>
      </div>
    </motion.section>
  );
}
