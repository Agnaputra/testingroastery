'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { WholesaleSection } from './wholesale-section';
import styles from './page.module.css';

const consultationFeatures = [
  ['Formulir Consultation', 'Ceritakan kebutuhan dan kondisi bisnismu.'],
  ['Build Your Own Blend', 'Kembangkan profil rasa dan racikan yang merepresentasikan bisnismu.'],
  ['Pricing Calculator', 'Perkirakan kebutuhan dan biaya sebelum memulai.'],
] as const;

const processSteps = [
  ['Ceritakan kebutuhan', 'Kenalkan bisnis, konsep, dan kebutuhan kopimu.'],
  ['Temukan arah', 'Kami membantu menentukan kopi atau solusi yang sesuai.'],
  ['Tasting & penyesuaian', 'Evaluasi profil rasa dan lakukan penyesuaian bila diperlukan.'],
  ['Mulai kemitraan', 'Solusi yang telah disepakati siap diterapkan pada bisnismu.'],
] as const;

export default function WorkWithUsPage() {
  const reducedMotion = useReducedMotion();
  const reveal = {
    initial: reducedMotion ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.16 },
    transition: { duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <div className={`${styles.page} page-shell`}>
      <section className={styles.hero} aria-labelledby="partnership-hero-heading">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>KEMITRAAN / B2B</p>
          <h1 id="partnership-hero-heading">
            <span>Partner untuk</span>
            <span>kebutuhan kopi</span>
            <span>bisnismu.</span>
          </h1>
          <p className={styles.heroDescription}>
            Bangun kebutuhan kopi bisnismu bersama 52 Coffee &amp; Roastery melalui
            konsultasi yang terarah atau kemitraan wholesale untuk kebutuhan
            jangka panjang.
          </p>
          <a href="#partnerships" className={styles.heroLink}>
            Jelajahi Kemitraan <ArrowDownRight size={18} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.heroMedia}>
          <Image
            src="/images/roaster-footage.png"
            alt="Tim 52 Coffee bekerja di depan mesin roasting"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 48vw"
            className={styles.image}
          />
        </div>
      </section>

      <motion.section id="partnerships" className={`${styles.intro} site-container`} aria-labelledby="partnership-intro-heading" {...reveal}>
        <p className={styles.eyebrow}>Bentuk Kemitraan / 02</p>
        <div className={styles.introCopy}>
          <h2 id="partnership-intro-heading">Dua cara untuk<br />memulai bersama.</h2>
          <p>
            Setiap bisnis memiliki kebutuhan yang berbeda. Mulai dari merancang arah kopi
            hingga membangun pasokan yang konsisten, pilih bentuk kemitraan yang paling
            sesuai dengan kebutuhanmu.
          </p>
        </div>
      </motion.section>

      <motion.section id="consultations" className={styles.consultations} aria-labelledby="consultations-heading" {...reveal}>
        <div className={`${styles.serviceGrid} site-container`}>
          <div className={styles.serviceMedia}>
            <Image
              src="/images/byob-roaster-craft.jpg"
              alt="Roaster 52 Coffee mengevaluasi biji kopi untuk profil racikan bisnis"
              fill
              sizes="(max-width: 767px) 100vw, 42vw"
              className={styles.image}
            />
          </div>
          <div className={styles.serviceContent}>
            <motion.div className={styles.rule} aria-hidden="true" initial={reducedMotion ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: reducedMotion ? 0 : 0.8 }} />
            <div className={styles.serviceLabel}><span>01</span><span>Consultations</span></div>
            <h2 id="consultations-heading">Mulai dari sebuah<br />percakapan.</h2>
            <p className={styles.serviceDescription}>
              Ceritakan kebutuhan, konsep, dan arah kopimu. Kami membantu menerjemahkannya
              menjadi pilihan yang lebih terarah untuk bisnismu.
            </p>
            <ol className={styles.featureList}>
              {consultationFeatures.map(([title, description], index) => (
                <li key={title}>
                  <span className={styles.featureNumber}>0{index + 1}</span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                </li>
              ))}
            </ol>
            <Link href="/work-with-us/consultations" className={styles.serviceLink}>
              Explore Consultations <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </motion.section>

      <WholesaleSection />

      <motion.section className={`${styles.process} site-container`} aria-labelledby="process-heading" {...reveal}>
        <p className={styles.eyebrow}>Proses Kemitraan / 04</p>
        <h2 id="process-heading">Dari percakapan<br />menjadi sajian.</h2>
        <ol className={styles.processList}>
          {processSteps.map(([title, description], index) => (
            <li key={title}>
              <span className={styles.processNumber}>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </motion.section>

      <motion.section className={styles.final} aria-labelledby="final-heading" {...reveal}>
        <div className={`${styles.finalInner} site-container`}>
          <p className={styles.eyebrow}>Mulai Bersama / 52 Coffee</p>
          <h2 id="final-heading">Mari bangun sesuatu<br />bersama.</h2>
          <p>Ceritakan kebutuhan kopimu dan temukan bentuk kemitraan yang sesuai dengan bisnismu.</p>
          <div className={styles.finalActions}>
            <Link href="/work-with-us/consultations" className={styles.finalPrimary}>
              Mulai Konsultasi <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
            <Link href="/work-with-us#wholesale-partnership" className={styles.finalSecondary}>
              Wholesale &amp; Partnership <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
