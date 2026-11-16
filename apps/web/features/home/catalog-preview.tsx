'use client';

import {
  motion
} from 'framer-motion';
import {
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { openVirtualBarista } from '../virtual-barista/virtual-barista-events';
import styles from './home-page.module.css';
const CATEGORIES = [
  {
    id: 'about',
    title: 'Apa 52 Coffee Roasters',
    subtitle: 'Filosofi sangrai dan para roaster',
    href: '/about',
  },
  {
    id: 'catalog',
    title: 'Catalog',
    subtitle: 'Retail beans, slowbar, dan alat seduh',
    href: '/catalog',
  },
  {
    id: 'business',
    title: 'Kemitraan Bisnis',
    subtitle: 'Pasokan roastery, label khusus, konsultasi',
    href: '/work-with-us',
  },
  {
    id: 'lab',
    title: 'Coffee Lab',
    subtitle: 'Brewing Guidance dan racik blend (BYOB)',
    href: '/coffee-lab/brewing-guidance',
  },
  {
    id: 'barista',
    title: 'Virtual Barista',
    subtitle: 'Konsultasi rasa dan panduan seduh AI',
    href: '#virtual-barista',
  },
];

export function CatalogPreview({
  reducedMotion,
}: {
  reducedMotion: boolean | null
}) {
  return (
    <section className={styles.catalogIndex} aria-labelledby="catalog-index-heading">
      <div className={styles.sectionShell}>
        <motion.div
          className={styles.indexIntro}
          initial={reducedMotion ? false : { opacity: 0.55, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p>Pilih jalur eksplorasi</p>
          <h2 id="catalog-index-heading">Dari profil rasa hingga racikan kedai.</h2>
        </motion.div>
        <motion.nav
          className={styles.categoryGrid}
          aria-label="Kategori koleksi kopi"
          initial={reducedMotion ? false : { opacity: 0.7, clipPath: 'inset(0 0 14% 0)' }}
          whileInView={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {CATEGORIES.map((category) =>
            category.id === 'barista' ? (
              <button
                type="button"
                onClick={openVirtualBarista}
                key={category.id}
                className={styles.categoryLink}
              >
                <span className={styles.categoryText}>
                  <strong>{category.title}</strong>
                  <small>{category.subtitle}</small>
                </span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </button>
            ) : (
              <Link href={category.href} key={category.id} className={styles.categoryLink}>
                <span className={styles.categoryText}>
                  <strong>{category.title}</strong>
                  <small>{category.subtitle}</small>
                </span>
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
            )
          )}
        </motion.nav>
      </div>
    </section>
  );
}
