import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Coffee, Layers, SlidersHorizontal, TestTube2 } from 'lucide-react';
import { SectionIntro } from '../../../components/ui/page-structure';
import { ReserveLayout } from '../../../components/ui/reserve-layout';
import { BlendBuilderExperience } from '../../../components/blend-builder-experience';

export const metadata: Metadata = {
  title: 'Build Your Own Blend (BYOB) | Coffee Lab 52 Coffee',
  description: 'Eksplorasi dan bangun racikan kopi specialty Anda sendiri. Pilih beans, tentukan profil rasa, kembangkan proporsi, dan lakukan tasting & adjustment dalam satu halaman.',
  alternates: {
    canonical: '/coffee-lab/build-your-own-blend',
  },
};

const BLEND_STAGES = [
  {
    id: 'choose-your-beans',
    icon: Coffee,
    title: 'Choose Your Beans',
    description: 'Kenali fungsi setiap komponen: Base memberi struktur body, Accent menambah aroma floral/fruity, dan Bridge menyatukan karakter rasa antarkomponen.',
    points: [
      'Gunakan single-origin fresh roast yang terverifikasi',
      'Pilih 2 hingga 3 origin pelengkap (Arabica, Robusta, Liberica, Excelsa)',
      'Perhatikan proses pascapanen (Washed, Natural, Honey, Anaerob)',
    ],
  },
  {
    id: 'define-your-profile',
    icon: SlidersHorizontal,
    title: 'Define Your Profile',
    description: 'Tentukan target cangkir sebelum meracik: apakah Anda mengejar body tebal untuk milk-based espresso, atau cangkir manis beraroma citrus dan floral yang kompleks.',
    points: [
      'Petakan target acidity, sweetness, dan body',
      'Tentukan metode ekstraksi utama (Espresso, Filter, Cold Brew)',
      'Gunakan radar sensorik real-time untuk memantau keseimbangan',
    ],
  },
  {
    id: 'blend-development',
    icon: Layers,
    title: 'Blend Development',
    description: 'Simulasikan perbandingan rasio persentase tiap beans. Uji coba formula dengan interval terukur dan simpan racikan ke keranjang belanja Anda.',
    points: [
      'Mulai dari proporsi 70:30 atau 60:40',
      'Uji penambahan komponen ketiga (maks 15%) untuk aksen aromatik',
      'Periksa estimasi harga racikan per gramasi (250g, 500g, 1kg)',
    ],
  },
  {
    id: 'tasting-adjustment',
    icon: TestTube2,
    title: 'Tasting & Adjustment',
    description: 'Seduh sampel racikan, cicipi pada rentang suhu berbeda (panas, hangat, dingin), lalu lakukan penyesuaian rasio kecil untuk menyempurnakan hasil.',
    points: [
      'Evaluasi aroma kering (dry aroma) dan aroma basah (crust)',
      'Catat rasa dominan dan aftertaste pada lembar cupping',
      'Lakukan adjustment bertahap (5-10%) pada iterasi berikutnya',
    ],
  },
];

export default function BuildYourOwnBlendLabPage() {
  return (
    <main className="page-shell nav-offset relative">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[76px] bg-brand-navy" aria-hidden="true" />
      {/* 2. STICKY IN-PAGE NAVIGATION */}
      <nav
        aria-label="Navigasi Build Your Own Blend"
        className="sticky top-[76px] z-30 border-y border-border-subtle bg-surface-bright/95 backdrop-blur-md py-3 shadow-xs"
      >
        <div className="site-container flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-maroon bg-brand-maroon/10 px-2.5 py-1 rounded-full border border-brand-maroon/20">
              4 Tahap BYOB
            </span>
            <a
              href="#choose-your-beans"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <span>01. Choose Your Beans</span>
            </a>
            <a
              href="#define-your-profile"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <span>02. Define Your Profile</span>
            </a>
            <a
              href="#blend-development"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <span>03. Blend Development</span>
            </a>
            <a
              href="#tasting-adjustment"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <span>04. Tasting &amp; Adjustment</span>
            </a>
          </div>

          <Link
            href="/work-with-us/consultations"
            className="hidden sm:inline-flex items-center gap-1 font-mono text-xs font-bold text-brand-navy hover:underline shrink-0"
          >
            <span>Kebutuhan Komersial Café?</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      {/* INTERACTIVE BLEND BUILDER SIMULATOR (BLEND DEVELOPMENT) */}
      <ReserveLayout
        id="blend-development"
        kicker="Lab workspace"
        title="Bangun blend langkah demi langkah."
        description="Pilih origin, atur rasio, lalu baca perubahan profil sensorik dan harga racikan secara langsung."
        workspaceClassName="p-4 sm:p-6"
        details={BLEND_STAGES.map(({ icon: Icon, title, description }) => ({
          icon: <Icon key={title} className="h-4 w-4" aria-hidden="true" />,
          title,
          description,
        }))}
      >
        <div className="space-y-6">
          <span id="choose-your-beans" className="sr-only" />
          <div id="define-your-profile" className="scroll-mt-32">
            <SectionIntro
              kicker="Simulator Interaktif • Lab Workspace"
              title="Workspace Blend Development & Sensorik"
              description="Pilih origin beans, sesuaikan slider rasio persentase, amati perubahan profil rasa di Dynamic Real Time Taste radar chart, dan pesan racikan custom Anda langsung."
            />
          </div>

          <div className="pt-4">
            <BlendBuilderExperience mode="lab" embedded />
          </div>
        </div>
      </ReserveLayout>

      <section className="site-container page-section">
        {/* CTA TO COMMERCIAL CONSULTATIONS */}
        <div className="rounded-2xl border border-border-subtle bg-surface-container-low p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-maroon">
              KEMITRAAN BISNIS &amp; HORECA
            </span>
            <h3 className="font-editorial text-2xl font-bold text-brand-charcoal mt-1">
              Butuh racikan house blend eksklusif untuk bisnis kedai kopi Anda?
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
              Gunakan formulir konsultasi dan pricing calculator HPP untuk menghitung biaya per cangkir dan kebutuhan operasional bulanan Anda.
            </p>
          </div>
          <Link
            href="/work-with-us/consultations"
            className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 text-sm px-6 shrink-0"
          >
            <span>Buka Halaman Konsultasi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

