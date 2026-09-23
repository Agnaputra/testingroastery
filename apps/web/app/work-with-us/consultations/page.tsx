import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness, Calculator, Coffee, MessageSquare, SlidersHorizontal, Sparkles, TestTube2 } from 'lucide-react';
import { PageIntro, SectionIntro } from '../../../components/ui/page-structure';
import { BlendBuilderExperience } from '../../../components/blend-builder-experience';
import { ConsultationFormSection } from './consultation-form-section';

export const metadata: Metadata = {
  title: 'Consultations & Custom Blend | 52 Coffee & Roastery',
  description: 'Konsultasi custom coffee blend, formulir kemitraan, dan pricing calculator HPP untuk café, restoran, hotel, dan kebutuhan wholesale.',
  alternates: {
    canonical: '/work-with-us/consultations',
  },
};

const CONSULTATION_STEPS = [
  {
    icon: Coffee,
    title: 'Choose Your Beans',
    description: 'Origin dan komponen blend dipilih berdasarkan konsistensi pasokan, fungsi rasa, dan target biaya bisnis.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Define Your Profile',
    description: 'Memetakan target sweetness, acidity, body, mesin espresso, volume bulanan, dan karakter preferensi pelanggan Anda.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Blend Development',
    description: 'Proporsi persentase dan profil sangrai diuji di roastery kami untuk membangun rasa yang khas sekaligus stabil.',
  },
  {
    icon: TestTube2,
    title: 'Tasting & Adjustment',
    description: 'Sampel dievaluasi bersama melalui cupping sebelum resep, spesifikasi, dan jadwal pasokan ditetapkan.',
  },
];

export default function ConsultationsPage() {
  return (
    <main className="page-shell">
      {/* 1. HERO / PAGE INTRO */}
      <PageIntro
        compact
        tone="dark"
        kicker="Partnerships / Consultations"
        icon={<BriefcaseBusiness size={14} />}
        title="Konsultasi Bisnis Kopi & Custom Blend."
        description="Solusi terpadu untuk café, restoran, hotel, dan mitra wholesale. Rancang profil racikan unik, simulasikan HPP per cangkir, dan kirimkan brief konsultasi dalam satu halaman."
      />

      {/* 2. STICKY IN-PAGE NAVIGATION */}
      <nav
        aria-label="Navigasi Halaman Konsultasi"
        className="sticky top-16 z-30 border-y border-border-subtle bg-surface-bright/95 backdrop-blur-md py-3 shadow-xs"
      >
        <div className="site-container flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-maroon bg-brand-maroon/10 px-2.5 py-1 rounded-full border border-brand-maroon/20">
              Navigasi Cepat
            </span>
            <a
              href="#consultation-form"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-brand-maroon" />
              <span>01. Formulir Consultation</span>
            </a>
            <a
              href="#byob"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-maroon" />
              <span>02. Build Your Own Blend</span>
            </a>
            <a
              href="#pricing-calculator"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <Calculator className="w-3.5 h-3.5 text-brand-maroon" />
              <span>03. Pricing Calculator</span>
            </a>
          </div>
          <Link
            href="/work-with-us#wholesale-partnership"
            className="hidden sm:inline-flex items-center gap-1 font-mono text-xs font-bold text-brand-navy hover:underline shrink-0"
          >
            <span>Wholesale &amp; Partnership</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      <section className="site-container page-section space-y-20">
        {/* SECTION 1: FORMULIR CONSULTATION */}
        <section id="consultation-form" className="scroll-mt-32 space-y-6">
          <SectionIntro
            kicker="Langkah 1 • Mulai Diskusi"
            title="Formulir Consultation"
            description="Kirimkan profil usaha, estimasi kebutuhan pasokan, atau rencana racikan menu Anda. Pesan otomatis disusun dan dilanjutkan melalui WhatsApp resmi 52 Coffee (+62 857-9252-4863)."
          />
          <ConsultationFormSection />
        </section>

        {/* SECTION 2: BUILD YOUR OWN BLEND (BYOB) */}
        <section id="byob" className="scroll-mt-32 space-y-8 border-t border-border-subtle pt-16">
          <SectionIntro
            kicker="Langkah 2 • Simulasi Racikan"
            title="Build Your Own Blend (BYOB)"
            description="Rancang proporsi komponen beans espresso, tentukan ukuran kemasan, evaluasi proyeksi rasa real-time dengan radar sensorik, dan simulasikan harga racikan langsung."
          />

          <ol className="grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
            {CONSULTATION_STEPS.map(({ icon: Icon, title, description }, index) => (
              <li key={title} className="border-t-2 border-brand-charcoal pt-5">
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-brand-maroon" aria-hidden="true" />
                  <span className="font-mono text-xs font-semibold text-on-surface-variant">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-editorial text-xl font-bold text-brand-charcoal">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
              </li>
            ))}
          </ol>

          {/* Embedded Interactive Blend Builder & Pricing Calculator */}
          <div className="pt-8">
            <BlendBuilderExperience mode="partnership" />
          </div>
        </section>

        {/* FOOTER CTA BAR */}
        <div className="rounded-2xl border border-border-subtle bg-surface-container-low p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-maroon">
              WHOLESALE &amp; PARTNERSHIP
            </span>
            <h3 className="font-editorial text-2xl font-bold text-brand-charcoal mt-1">
              Ingin mempelajari skema pasokan kedai dan wholesale?
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
              Kami memasok roasted beans batch kecil ke puluhan kedai kopi di Malang, Surabaya, Bali, dan Jakarta dengan standarisasi roast profile.
            </p>
          </div>
          <Link
            href="/work-with-us#wholesale-partnership"
            className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 text-sm px-6 shrink-0"
          >
            <span>Lihat Skema Pasokan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

