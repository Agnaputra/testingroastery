'use client';

import {
  motion
} from 'framer-motion';
import {
  ArrowRight,
  Check,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import type { CatalogPublicationAuthority } from '../../lib/catalog-publication';
import { formatRupiah } from '../../lib/data';
import styles from './home-page.module.css';
export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  weightGrams: number;
  weightLabel: string;
  price: number;
  series: string;
  notes: string[];
  imageUrl: string;
}

export function FeaturedProducts({
  reducedMotion,
  productRailRef,
  draggingProducts,
  handleProductPointerDown,
  handleProductPointerMove,
  handleProductPointerEnd,
  productDragRef,
  setDraggingProducts,
  preventClickAfterDrag,
  authority,
  activeFeaturedProducts,
  handleQuickAdd,
  addedId,
}: {
  reducedMotion: boolean | null;
  productRailRef: React.RefObject<HTMLDivElement>;
  draggingProducts: boolean;
  handleProductPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleProductPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleProductPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
  productDragRef: React.MutableRefObject<{ active: boolean; didDrag: boolean; pointerId: number; startX: number; startScrollLeft: number }>;
  setDraggingProducts: React.Dispatch<React.SetStateAction<boolean>>;
  preventClickAfterDrag: (event: ReactMouseEvent) => void;
  authority: CatalogPublicationAuthority | null;
  activeFeaturedProducts: ProductItem[];
  handleQuickAdd: (product: ProductItem) => Promise<void>;
  addedId: string | null
}) {
  return (
    <section className={styles.featured} aria-labelledby="featured-heading">
      <div className={styles.sectionShell}>
        <motion.header
          className={styles.sectionHeader}
          initial={reducedMotion ? false : { opacity: 0.6, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <p className={styles.eyebrow}>Pilihan roastery / 04</p>
            <h2 id="featured-heading">Kopi dengan<br />suara yang berbeda.</h2>
          </div>
          <div className={styles.headerAside}>
            <p>Disangrai di Malang dan semua kopi fresh roast. Empat profil untuk mengenali rentang rasa 52 Coffee—dari floral dan fruity hingga karakter yang lebih intens.</p>
            <Link href="/catalog" className={styles.textLink}>
              Lihat seluruh koleksi <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <span className={styles.dragHint} aria-hidden="true">← Tarik koleksi →</span>
          </div>
        </motion.header>

        <div
          ref={productRailRef}
          className={styles.productGrid}
          data-dragging={draggingProducts}
          aria-label="Koleksi kopi pilihan. Geser secara horizontal untuk menjelajah."
          onPointerDown={handleProductPointerDown}
          onPointerMove={handleProductPointerMove}
          onPointerUp={handleProductPointerEnd}
          onPointerCancel={handleProductPointerEnd}
          onPointerLeave={(event) => {
            const { pointerId } = productDragRef.current;
            if (pointerId < 0 || !event.currentTarget.hasPointerCapture(pointerId)) {
              productDragRef.current.active = false;
              setDraggingProducts(false);
            }
          }}
          onClickCapture={preventClickAfterDrag}
        >
          {authority?.status === 'unavailable' && <p role="status">Koleksi kopi sedang tidak tersedia. Silakan coba lagi.</p>}
          {activeFeaturedProducts.map((product, index) => (
            <motion.article
              key={product.id}
              className={styles.productCard}
              initial={reducedMotion ? false : { opacity: 0.65, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: reducedMotion ? 0 : 0.45, delay: reducedMotion ? 0 : index * 0.04, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.productTopline}>
                <span>{product.series}</span>
                <span>{product.category}</span>
              </div>
              <Link href={`/catalog/${product.slug}`} className={styles.productImageLink}>
                <Image
                  src={product.imageUrl}
                  alt={`Kemasan ${product.name}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className={styles.productImage}
                />
              </Link>
              <div className={styles.productInfo}>
                <p>{product.series}</p>
                <h3><Link href={`/catalog/${product.slug}`}>{product.name}</Link></h3>
                <span>{product.notes.join(' · ')}</span>
              </div>
              <div className={styles.productFooter}>
                <div>
                  <strong>{formatRupiah(product.price)}</strong>
                  <span>{product.weightLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(product)}
                  aria-label={`Tambah ${product.name} ke keranjang`}
                  className={styles.quickAdd}
                  data-added={addedId === product.id}
                >
                  {addedId === product.id ? <Check aria-hidden="true" size={17} /> : <Plus aria-hidden="true" size={17} />}
                  <span aria-live="polite">{addedId === product.id ? 'Ditambahkan' : 'Tambah'}</span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
