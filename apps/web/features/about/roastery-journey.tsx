'use client';

import { motion } from 'framer-motion';
import { Coffee, Flame, SearchCheck, Sprout } from 'lucide-react';
import Image from 'next/image';
import styles from './about-page.module.css';
const JOURNEY = [
  { icon: Sprout, label: 'Sourcing / beans', title: 'Membaca bahan baku', description: 'Origin, process, varietas, dan catatan rasa menjadi konteks awal untuk memahami potensi setiap kopi.', image: '/images/canva-coffee-cherries.jpg', alt: 'Buah kopi sebagai awal perjalanan biji kopi' },
  { icon: Flame, label: 'Roasting', title: 'Mengembangkan rasa', description: 'Profil sangrai dirancang untuk membuka karakter kopi dan menyiapkannya bagi cara seduh yang dituju.', image: '/images/canva-roaster-drum.jpg', alt: 'Mesin roasting kopi di ruang produksi' },
  { icon: SearchCheck, label: 'Quality control', title: 'Menguji setiap hasil', description: 'Cupping dan penyeduhan ulang membantu kami mengevaluasi aroma, rasa, serta konsistensi tiap batch.', image: '/images/canva-barista-roaster.jpg', alt: 'Barista mengevaluasi kopi hasil roasting' },
  { icon: Coffee, label: 'Brewing / serving', title: 'Menyelesaikan di cangkir', description: 'Parameter seduh dan dialog di slowbar menerjemahkan karakter beans menjadi pengalaman yang utuh.', image: '/images/canva-brewista-pour.jpg', alt: 'Proses manual brew di slowbar' },
];

export function RoasteryJourney({
  reveal,
  reducedMotion,
}: {
  reveal: Pick<import('framer-motion').MotionProps, 'initial' | 'whileInView' | 'viewport' | 'transition'>;
  reducedMotion: boolean | null
}) {
  return (
    <motion.section id="roastery-journey" className={styles.journey} aria-labelledby="journey-heading" {...reveal}>
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>Roastery Journey / 01–04</p>
        <h2 id="journey-heading">Empat tahap.<br />Satu alur yang terhubung.</h2>
        <p>Dari kebun sampai cangkir, setiap keputusan menjadi umpan balik untuk tahap berikutnya.</p>
      </div>
      <ol className={styles.journeyGrid}>
        {JOURNEY.map(({ icon: Icon, label, title, description, image, alt }, index) => (
          <motion.li key={label} className={styles.journeyCard} initial={reducedMotion ? false : { opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: reducedMotion ? 0 : 0.65, delay: reducedMotion ? 0 : index * 0.09 }}>
            <div className={styles.journeyImage}><Image src={image} alt={alt} fill sizes="(max-width: 768px) 88vw, (max-width: 1100px) 44vw, 23vw" className={styles.coverImage} /><span>0{index + 1}</span></div>
            <p className={styles.cardLabel}><Icon size={15} aria-hidden="true" /> {label}</p>
            <h3>{title}</h3>
            <p className={styles.cardDescription}>{description}</p>
          </motion.li>
        ))}
      </ol>
    </motion.section>
  );
}
