'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Coffee, Flame, MapPin, SearchCheck, Sprout } from 'lucide-react';
import styles from './page.module.css';

const JOURNEY = [
  { icon: Sprout, label: 'Sourcing / beans', title: 'Membaca bahan baku', description: 'Origin, process, varietas, dan catatan rasa menjadi konteks awal untuk memahami potensi setiap kopi.', image: '/images/canva-coffee-cherries.jpg', alt: 'Buah kopi sebagai awal perjalanan biji kopi' },
  { icon: Flame, label: 'Roasting', title: 'Mengembangkan rasa', description: 'Profil sangrai dirancang untuk membuka karakter kopi dan menyiapkannya bagi cara seduh yang dituju.', image: '/images/canva-roaster-drum.jpg', alt: 'Mesin roasting kopi di ruang produksi' },
  { icon: SearchCheck, label: 'Quality control', title: 'Menguji setiap hasil', description: 'Cupping dan penyeduhan ulang membantu kami mengevaluasi aroma, rasa, serta konsistensi tiap batch.', image: '/images/canva-barista-roaster.jpg', alt: 'Barista mengevaluasi kopi hasil roasting' },
  { icon: Coffee, label: 'Brewing / serving', title: 'Menyelesaikan di cangkir', description: 'Parameter seduh dan dialog di slowbar menerjemahkan karakter beans menjadi pengalaman yang utuh.', image: '/images/canva-brewista-pour.jpg', alt: 'Proses manual brew di slowbar' },
];

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

      <motion.section className={styles.finalCta} aria-labelledby="about-cta-heading" {...reveal}>
        <p className={styles.eyebrow}>Temukan karakter pilihanmu</p>
        <h2 id="about-cta-heading">CERITA BERIKUTNYA<br />ADA DI CANGKIRMU.</h2>
        <Link href="/catalog">Jelajahi katalog <ArrowUpRight size={18} aria-hidden="true" /></Link>
      </motion.section>
    </main>
  );
}
