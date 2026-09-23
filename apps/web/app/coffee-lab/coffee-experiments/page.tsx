import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Beaker,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Droplets,
  Flame,
  FlaskConical,
  Gauge,
  Info,
  MapPin,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import { PageIntro, SectionIntro } from '../../../components/ui/page-structure';

export const metadata: Metadata = {
  title: 'Coffee Experiments | Coffee Lab 52 Coffee',
  description: 'Catatan riset dan eksperimen laboratorium 52 Coffee: Cupping Events, Roasting Experiments, dan Brewing Experiments dalam satu halaman komprehensif.',
  alternates: {
    canonical: '/coffee-lab/coffee-experiments',
  },
};

export default function CoffeeExperimentsPage() {
  return (
    <main className="page-shell">
      {/* 1. HERO / PAGE INTRO */}
      <PageIntro
        compact
        tone="dark"
        kicker="Coffee Lab / Coffee Experiments"
        icon={<FlaskConical size={14} />}
        title="Agenda eksperimen dalam satu halaman."
        description="Ruang riset terbuka 52 Coffee & Roastery. Kami mendokumentasikan sesi cupping berkala, eksplorasi profil sangrai inframerah, dan pengujian variabel ekstraksi seduh untuk memahami karakter rasa secara empiris."
        visual={
          <div className="relative aspect-[4/3] min-h-[240px] overflow-hidden rounded-md bg-brand-charcoal">
            <Image
              src="/images/roaster-footage.png"
              alt="Eksperimen roasting dan cupping di lab 52 Coffee"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover opacity-90"
              priority
            />
          </div>
        }
      />

      {/* 2. STICKY IN-PAGE NAVIGATION */}
      <nav
        aria-label="Navigasi Coffee Experiments"
        className="sticky top-16 z-30 border-y border-border-subtle bg-surface-bright/95 backdrop-blur-md py-3 shadow-xs"
      >
        <div className="site-container flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-brand-maroon bg-brand-maroon/10 px-2.5 py-1 rounded-full border border-brand-maroon/20">
              3 Pilar Riset
            </span>
            <a
              href="#cupping-events"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <Coffee className="w-3.5 h-3.5 text-brand-maroon" />
              <span>01. Cupping Events</span>
            </a>
            <a
              href="#roasting-experiments"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <Flame className="w-3.5 h-3.5 text-brand-maroon" />
              <span>02. Roasting Experiments</span>
            </a>
            <a
              href="#brewing-experiments"
              className="inline-flex min-h-10 items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold text-brand-charcoal hover:text-brand-maroon hover:bg-surface-container-low transition-colors"
            >
              <Beaker className="w-3.5 h-3.5 text-brand-maroon" />
              <span>03. Brewing Experiments</span>
            </a>
          </div>

          <Link
            href="/coffee-lab/brewing-guidance"
            className="hidden sm:inline-flex items-center gap-1 font-mono text-xs font-bold text-brand-navy hover:underline shrink-0"
          >
            <span>Buka Brewing Guidance</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </nav>

      <section className="site-container page-section space-y-20">
        {/* ========================================================= */}
        {/* SECTION 1: CUPPING EVENTS */}
        {/* ========================================================= */}
        <section id="cupping-events" className="scroll-mt-32 space-y-8">
          <SectionIntro
            kicker="Pilar 1 • Sensorik & Evaluasi"
            title="Cupping Events"
            description="Sesi evaluasi sensorik terstandarisasi untuk membandingkan aroma, keasaman, rasa manis, dan kejernihan antar origin dalam protokol penyeduhan yang seragam."
          />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Cupping Protocols Guide */}
            <div className="space-y-6">
              <div className="ui-surface rounded-2xl border-2 border-[#2C3136] bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#2C3136]">
                <h3 className="font-editorial text-2xl font-bold text-brand-charcoal">
                  Protokol Cupping Terstandarisasi SCA di 52 Coffee
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
                  Setiap batch sangrai dievaluasi secara buta (blind cupping) 48 jam pasca sangrai untuk memastikan parameter mutu specialty grade tercapai sebelum dikemas.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-maroon">Rasio Cupping</span>
                    <p className="font-bold text-base text-brand-charcoal">8.25 g / 150 ml air</p>
                    <p className="text-[11px] text-gray-600">Sesuai standar toleransi ± 0.25g</p>
                  </div>
                  <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-maroon">Suhu &amp; Air</span>
                    <p className="font-bold text-base text-brand-charcoal">93°C • 120-150 PPM</p>
                    <p className="text-[11px] text-gray-600">Air mineral terkontrol kandungan Ca/Mg</p>
                  </div>
                  <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-maroon">Waktu Infusi</span>
                    <p className="font-bold text-base text-brand-charcoal">4 Menit (Break Crust)</p>
                    <p className="text-[11px] text-gray-600">3 kali dorongan sendok perlahan</p>
                  </div>
                  <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-maroon">Waktu Mencicip</span>
                    <p className="font-bold text-base text-brand-charcoal">Menit 8 - 12 (70°C - 55°C)</p>
                    <p className="text-[11px] text-gray-600">Evaluasi perubahan aroma seiring pendinginan</p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-border-subtle space-y-2">
                  <h4 className="font-editorial text-base font-bold text-brand-charcoal">
                    Atribut Sensorik yang Dinilai:
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                    {['Fragrance / Aroma', 'Flavor', 'Aftertaste', 'Acidity', 'Body', 'Balance', 'Uniformity', 'Clean Cup', 'Sweetness'].map((attr) => (
                      <span key={attr} className="px-3 py-1 rounded-full bg-brand-navy/10 text-brand-navy font-bold border border-brand-navy/20">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Cupping Schedule Card */}
            <aside className="rounded-2xl border-2 border-[#2C3136] bg-[#CFE8EA]/40 p-6 sm:p-8 space-y-5 h-fit shadow-[4px_4px_0px_#2C3136]">
              <div className="flex items-center gap-2 text-brand-charcoal">
                <Calendar className="w-5 h-5 text-brand-maroon" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  AGENDA RUTIN ROASTERY
                </span>
              </div>

              <div>
                <h3 className="font-editorial text-2xl font-bold text-brand-charcoal leading-snug">
                  Saturday Public Cupping Session
                </h3>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Terbuka untuk home brewer, barista, dan penikmat kopi yang ingin melatih kepekaan indra perasa bersama tim roaster kami.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs border-y border-[#2C3136]/20 py-4 text-[#2C3136]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-maroon shrink-0" />
                  <span>Setiap Sabtu • 10:00 - 12:00 WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-maroon shrink-0" />
                  <span>Slowbar 52 Coffee, Klojen, Kota Malang</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-maroon shrink-0" />
                  <span>Cicipi 6 Origin Terpilih • Gratis (RSVP)</span>
                </div>
              </div>

              <a
                href="https://wa.me/6285792524863?text=Halo%2052%20Coffee,%20saya%20tertarik%20RSVP%20untuk%20Saturday%20Public%20Cupping%20Session."
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#2C3136] bg-[#2C3136] px-5 py-3 font-mono text-xs font-bold uppercase text-white hover:bg-[#8FB9BC] hover:text-[#2C3136] transition-colors"
              >
                <span>RSVP Sesi Sabtu Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </aside>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: ROASTING EXPERIMENTS */}
        {/* ========================================================= */}
        <section id="roasting-experiments" className="scroll-mt-32 space-y-8 border-t border-border-subtle pt-16">
          <SectionIntro
            kicker="Pilar 2 • Termodinamika & Profil Sangrai"
            title="Roasting Experiments"
            description="Eksplorasi bagaimana variasi energi inframerah, Rate of Rise (RoR), dan Development Time Ratio (DTR) memengaruhi struktur seluler biji dan pembentukan senyawa aromatik."
          />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="ui-surface rounded-2xl border-2 border-[#2C3136] bg-white p-6 shadow-[3px_3px_0px_#2C3136] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-maroon/10 border border-brand-maroon/20 flex items-center justify-center text-brand-maroon">
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase text-brand-maroon">Eksperimen 01</span>
              <h3 className="font-editorial text-xl font-bold text-brand-charcoal">
                Infrared vs Direct Conduction
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pengujian penetrasi panas gelombang inframerah ke inti biji kopi. Hasil cupping membuktikan inframerah menghasilkan pematangan merata pada proses anaerobik tanpa scorch di permukaan.
              </p>
              <div className="border-t border-border-subtle pt-3 font-mono text-[11px] text-[#2C3136] space-y-1">
                <div>• Penetrasi panas: <strong>Merata hingga embrio</strong></div>
                <div>• Karakter rasa: <strong>Asam lebih bulat, body lebih licin</strong></div>
              </div>
            </div>

            <div className="ui-surface rounded-2xl border-2 border-[#2C3136] bg-white p-6 shadow-[3px_3px_0px_#2C3136] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase text-brand-navy">Eksperimen 02</span>
              <h3 className="font-editorial text-xl font-bold text-brand-charcoal">
                DTR Variance (12% vs 15% vs 18%)
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Menguji durasi fase development setelah First Crack pada origin Ijen Carbonic Maceration. DTR 14.5% terbukti mempertahankan kompleksitas aroma floral jasmine sekaligus memaksimalkan karamelisasi sukrosa.
              </p>
              <div className="border-t border-border-subtle pt-3 font-mono text-[11px] text-[#2C3136] space-y-1">
                <div>• DTR 12%: <strong>Floral tajam, body ringan</strong></div>
                <div>• DTR 15%: <strong>Strawberry manis, aroma peach intens</strong></div>
              </div>
            </div>

            <div className="ui-surface rounded-2xl border-2 border-[#2C3136] bg-white p-6 shadow-[3px_3px_0px_#2C3136] space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-charcoal/10 border border-brand-charcoal/20 flex items-center justify-center text-brand-charcoal">
                <Thermometer className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold uppercase text-brand-charcoal">Eksperimen 03</span>
              <h3 className="font-editorial text-xl font-bold text-brand-charcoal">
                Resting Time &amp; Degassing Degas
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Pengukuran pelepasan gas CO2 pasca sangrai dari hari ke-1 hingga hari ke-30. Biji kopi specialty 52 Coffee mencapai puncak kejernihan rasa dan ekstraksi optimal antara hari ke-7 hingga hari ke-21.
              </p>
              <div className="border-t border-border-subtle pt-3 font-mono text-[11px] text-[#2C3136] space-y-1">
                <div>• Hari 1-3: <strong>Penuh gas, crema espresso liar</strong></div>
                <div>• Hari 7-21: <strong>Sweetness &amp; notes terdefinisi sempurna</strong></div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: BREWING EXPERIMENTS */}
        {/* ========================================================= */}
        <section id="brewing-experiments" className="scroll-mt-32 space-y-8 border-t border-border-subtle pt-16">
          <SectionIntro
            kicker="Pilar 3 • Ekstraksi & Kimia Air"
            title="Brewing Experiments"
            description="Uji coba variabel seduh manual: mineral air, kurva suhu air penyeduhan, turbulensi tuangan, dan dampaknya terhadap Total Dissolved Solids (TDS) dan Extraction Yield."
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="ui-surface rounded-2xl border-2 border-[#2C3136] bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#2C3136] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/20 border border-brand-teal flex items-center justify-center text-brand-charcoal">
                  <Droplets className="w-5 h-5 text-[#2C3136]" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-brand-maroon">UJI MINERAL AIR</span>
                  <h3 className="font-editorial text-xl font-bold text-brand-charcoal">
                    TDS Air: Demineral (0 PPM) vs Aqua (120 PPM) vs Amidis (4 PPM)
                  </h3>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Air dengan kandungan ion Magnesium (Mg2+) dan Kalsium (Ca2+) yang seimbang membantu mengekstrak senyawa volatil beraroma buah. Air tanpa mineral (0 PPM) menghasilkan cangkir flat dan asam tajam, sementara air 120-140 PPM membuka rasa manis alami kopi.
              </p>

              <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Amidis (4 PPM):</span>
                  <span className="font-bold text-brand-charcoal">Acidity tinggi, clarity tinggi, body tipis</span>
                </div>
                <div className="flex justify-between">
                  <span>Aqua (120-140 PPM):</span>
                  <span className="font-bold text-brand-maroon">Sweetness optimal, body sedang, seimbang</span>
                </div>
                <div className="flex justify-between">
                  <span>Air Sadah (&gt;250 PPM):</span>
                  <span className="font-bold text-gray-500">Muted flavors, aftertaste berdebu</span>
                </div>
              </div>
            </div>

            <div className="ui-surface rounded-2xl border-2 border-[#2C3136] bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#2C3136] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-maroon/10 border border-brand-maroon/20 flex items-center justify-center text-brand-maroon">
                  <Thermometer className="w-5 h-5 text-brand-maroon" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-brand-maroon">UJI SUHU EKSTRAKSI</span>
                  <h3 className="font-editorial text-xl font-bold text-brand-charcoal">
                    Suhu Air 88°C vs 92°C vs 96°C
                  </h3>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Profil sangrai Light Roast 52 Coffee memiliki densitas tinggi sehingga membutuhkan suhu air 92°C - 94°C untuk melarutkan senyawa asam organik dan sukrosa. Pada suhu 88°C ekstraksi cenderung under, sedangkan di atas 95°C timbul rasa pahit astringent.
              </p>

              <div className="rounded-xl border border-border-subtle bg-surface-container-low p-4 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span>88°C (Under-extracted):</span>
                  <span className="font-bold text-gray-500">Sour, rasa kacang mentah, TDS rendah</span>
                </div>
                <div className="flex justify-between">
                  <span>92°C - 94°C (Sweet Spot):</span>
                  <span className="font-bold text-brand-maroon">Tasting notes akurat, manis, aftertaste panjang</span>
                </div>
                <div className="flex justify-between">
                  <span>96°C (Over-extracted):</span>
                  <span className="font-bold text-gray-500">Dry finish, pahit kayu, body kental getir</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM NAVIGATION BANNER */}
        <div className="rounded-2xl border border-border-subtle bg-surface-container-low p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-maroon">
              COFFEE LAB SUITE
            </span>
            <h3 className="font-editorial text-2xl font-bold text-brand-charcoal mt-1">
              Ingin menerapkan hasil eksperimen ke seduhan harian Anda?
            </h3>
            <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
              Gunakan Brewing Guidance untuk menghitung resep presisi dengan live timer, atau mulai meracik blend Anda sendiri di Build Your Own Blend.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/coffee-lab/brewing-guidance"
              className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 text-sm px-6"
            >
              <span>Brewing Guidance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/coffee-lab/build-your-own-blend"
              className="btn-secondary inline-flex min-h-12 items-center justify-center gap-2 text-sm px-6"
            >
              <span>Build Your Own Blend</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

