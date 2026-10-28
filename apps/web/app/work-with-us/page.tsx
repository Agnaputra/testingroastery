import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { WholesaleSection } from './wholesale-section';
import styles from './page.module.css';

export default function WorkWithUsPage() {
  return (
    <main className={`${styles.page} page-shell`}>
      <section className={styles.hero} aria-labelledby="partnership-hero-heading">
        <div className={`${styles.heroInner} site-container`}>
          <div className={`${styles.heroCopy} editorial-hero-copy`}>
            <p className={styles.eyebrow}>52 Coffee / Partnerships</p>
            <h1 id="partnership-hero-heading">Kopi yang bekerja untuk bisnismu.</h1>
            <p className={styles.heroDescription}>Rancang karakter rasa sendiri atau bangun pasokan roasted beans yang konsisten bersama tim roastery.</p>
            <a href="#partnerships" className={styles.heroLink}>Jelajahi kerja sama <ArrowDownRight size={18} aria-hidden="true" /></a>
          </div>
          <figure className={`${styles.heroVisual} editorial-hero-media`}>
            <div className={styles.heroImage}><Image src="/images/canva-barista-roaster.jpg" alt="Barista menyiapkan kopi untuk pelanggan bisnis" fill priority sizes="(min-width: 1024px) 390px, 100vw" className={styles.image} /></div>
            <figcaption>Roasted in Malang <span>52 Coffee &amp; Roastery</span></figcaption>
          </figure>
          <div className={styles.heroIndex} aria-label="Dua jalur kerja sama"><span>01 / Consultation</span><span>02 / Wholesale &amp; Partnership</span></div>
        </div>
      </section>

      <section id="partnerships" className={`${styles.paths} site-container editorial-reveal`} aria-labelledby="partnership-intro-heading">
        <div className={styles.pathsIntro}><p className={styles.eyebrow}>Bentuk kerja sama</p><h2 id="partnership-intro-heading">Pilih titik mulainya.</h2><p>Dua cara memulai, sesuai kebutuhan bisnismu.</p></div>
        <div className={styles.pathLinks}>
          <div id="consultations" className={styles.path}><span>01 / Merancang rasa</span><h3>Consultation</h3><p>Eksplorasi blend, hitung HPP, dan sampaikan brief kepada tim roastery.</p><Link href="/work-with-us/consultations">Mulai konsultasi <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
          <div className={styles.path}><span>02 / Menjaga konsistensi</span><h3>Wholesale &amp; Partnership</h3><p>Pilih pasokan roasted beans, special blend, atau pendampingan menu.</p><a href="#wholesale-services">Lihat pilihan layanan <ArrowUpRight size={18} aria-hidden="true" /></a></div>
        </div>
      </section>

      <WholesaleSection />
    </main>
  );
}