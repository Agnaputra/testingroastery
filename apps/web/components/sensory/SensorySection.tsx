'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SENSORY_PROFILES } from './spectrum-data';
import styles from './SensorySection.module.css';

export function SensorySection() {
  return (
    <section id="sensory-spectrum" aria-labelledby="sensory-heading" className={styles.section}>
      <div className={`site-container ${styles.layout}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>SENSORY TASTE SPECTRUM</p>
          <h2 id="sensory-heading" className={styles.heading}>
            <span>Kenali Rasa di</span>{' '}
            <span>Setiap Seduhan.</span>
          </h2>
          <p className={styles.description}>
            Setiap kopi yang kami sangrai dikurasi melalui peta rasa sensorik. Dari floral yang lembut hingga cokelat yang pekat, temukan karakter yang paling sesuai dengan seleramu.
          </p>
        </div>

        <figure className={styles.visual}>
          <div className={styles.artworkStage}>
            <Image
              src="/images/flavor-wheel-52coffee.jpg"
              alt="Peta spektrum rasa 52 Coffee Roastery dengan enam kelompok karakter kopi"
              width={896}
              height={1200}
              sizes="(min-width: 1024px) 540px, (min-width: 768px) 48vw, 400px"
              className={styles.artwork}
            />
          </div>
          <figcaption className={styles.caption}>52 Coffee Sensory Flavor Spectrum</figcaption>
        </figure>

        <div className={styles.notes}>
          <p className={styles.notesLabel}>FLAVOR NOTES</p>
          <ul className={styles.flavorList} aria-label="Daftar kategori rasa kopi">
            {SENSORY_PROFILES.map((item) => (
              <li
                key={item.id}
                className={styles.flavorItem}
                data-flavor={item.id}
                style={{ '--flavor-color': item.color } as CSSProperties}
              >
                <span className={styles.dot} aria-hidden="true" />
                <span>
                  <strong className={styles.flavorTitle}>{item.name}</strong>
                  <span className={styles.flavorDescription}>{item.notes}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href="/catalog" className={`btn-primary ${styles.primaryAction}`}>
            Jelajahi kopi berdasarkan rasa <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/blend-builder" className={styles.secondaryAction}>
            <Sparkles size={16} aria-hidden="true" />Coba Sensory Simulator
          </Link>
        </div>
      </div>
    </section>
  );
}
