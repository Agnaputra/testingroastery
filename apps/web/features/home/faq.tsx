'use client';

import {
  AnimatePresence,
  motion
} from 'framer-motion';
import {
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';
import styles from './home-page.module.css';
const FAQS = [
  {
    question: 'Apa itu Virtual Barista 52 Coffee?',
    answer:
      'Virtual Barista adalah asisten berbasis AI yang membantu Anda mengenal katalog dan menggunakan fitur website 52 Coffee. Jawabannya diarahkan pada produk yang dipublikasikan, karakter rasa, panduan seduh, Coffee Lab, serta layanan kemitraan kami.',
  },
  {
    question: 'Bagaimana cara menggunakan Virtual Barista?',
    answer:
      'Klik tombol Virtual Barista di kanan bawah, lalu ceritakan kebutuhan Anda. Contohnya: “Saya suka kopi fruity untuk V60”, “Bagaimana memakai Brewing Guidance?”, atau “Di mana saya bisa mengajukan konsultasi wholesale?”',
  },
  {
    question: 'Apa saja yang bisa dibantu oleh AI ini?',
    answer:
      'AI dapat membantu memilih beans berdasarkan preferensi rasa dan metode seduh, menjelaskan tasting notes serta profil produk, memberi panduan seduh, dan menunjukkan fitur Catalogue, keranjang, Coffee Lab, BYOB, Consultations, serta Wholesale & Partnership.',
  },
  {
    question: 'Dari mana Virtual Barista mendapatkan jawabannya?',
    answer:
      'Jawaban disusun dari katalog produk 52 Coffee yang telah dipublikasikan dan informasi fitur yang tersedia di website. Dengan begitu, rekomendasi tetap terhubung dengan produk dan layanan 52 Coffee, bukan dibuat sebagai pengetahuan umum tanpa konteks.',
  },
  {
    question: 'Apakah Virtual Barista dapat menjawab semua pertanyaan?',
    answer:
      'Tidak. Virtual Barista difokuskan pada katalog dan fitur 52 Coffee, sehingga pertanyaan umum, medis, politik, atau topik di luar layanan akan ditolak dan diarahkan kembali ke konteks kopi. Informasi checkout, pembayaran, pesanan, dan pelacakan juga dijelaskan sebagai simulasi, bukan transaksi nyata.',
  },
];

export function Faq({
  reducedMotion,
  openFaq,
  setOpenFaq,
}: {
  reducedMotion: boolean | null;
  openFaq: number | null;
  setOpenFaq: React.Dispatch<React.SetStateAction<number | null>>
}) {
  return (
    <section className={styles.faq} aria-labelledby="faq-heading">
      <div className={styles.sectionShell}>
        <div className={styles.faqGrid}>
          <motion.div
            className={styles.faqIntro}
            initial={reducedMotion ? false : { opacity: 0.6, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className={styles.eyebrow}>Virtual Barista / AI</p>
            <h2 id="faq-heading">Kenali asisten kopi digital kami.</h2>
            <p>Pelajari cara menggunakan Virtual Barista untuk menjelajahi kopi dan fitur 52 Coffee dengan percakapan yang lebih personal.</p>
            <div className={styles.faqImage}>
              <Image
                src="/images/canva-cafe-moodboard.jpg"
                alt="Espresso mengalir dari mesin kopi ke dalam cangkir"
                fill
                sizes="(min-width: 1024px) 34vw, 100vw"
                className={styles.coverImage}
              />
            </div>
          </motion.div>

          <motion.div
            className={styles.faqList}
            initial={reducedMotion ? false : { opacity: 0.65, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              const panelId = `faq-panel-${index}`;
              const buttonId = `faq-button-${index}`;
              return (
                <div className={styles.faqItem} key={faq.question}>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown aria-hidden="true" size={21} data-open={isOpen} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24 }}
                        className={styles.faqPanel}
                      >
                        <p>{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
