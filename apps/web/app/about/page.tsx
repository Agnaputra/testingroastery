import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Coffee, Flame, MapPin, SearchCheck, Sparkles, Sprout } from 'lucide-react';
import { PageIntro, SectionIntro } from '../../components/ui/page-structure';

const JOURNEY = [
  { icon: Sprout, label: 'Sourcing / beans', title: 'Membaca karakter bahan baku', description: 'Origin, process, varietas, dan catatan rasa menjadi konteks awal untuk memahami potensi setiap kopi.', image: '/images/canva-coffee-cherries.jpg', alt: 'Buah kopi sebagai awal perjalanan biji kopi' },
  { icon: Flame, label: 'Roasting', title: 'Mengembangkan profil sangrai', description: 'Proses sangrai diarahkan untuk membuka karakter kopi dan menyiapkannya bagi cara seduh yang dituju.', image: '/images/canva-roaster-drum.jpg', alt: 'Mesin roasting kopi di ruang produksi' },
  { icon: SearchCheck, label: 'Quality control', title: 'Mengevaluasi hasil di dalam cangkir', description: 'Cupping dan penyeduhan ulang membantu membaca aroma, rasa, serta konsistensi sebelum kopi disajikan.', image: '/images/canva-barista-roaster.jpg', alt: 'Barista mengevaluasi kopi hasil roasting' },
  { icon: Coffee, label: 'Brewing / serving', title: 'Menerjemahkan beans menjadi pengalaman', description: 'Parameter seduh dan dialog di slowbar membantu setiap kopi disajikan dengan konteks yang lebih mudah dipahami.', image: '/images/canva-brewista-pour.jpg', alt: 'Proses manual brew di slowbar' },
];

export default function AboutPage() {
  return (
    <main id="behind" className="page-shell scroll-mt-28">
      <PageIntro align="center" compact kicker="Behind 52 Coffee & Roastery" icon={<Sparkles size={14} />} title="Roastery dan slowbar dalam satu percakapan rasa." description="52 Coffee & Roastery mempertemukan pemilihan beans, proses sangrai, evaluasi, dan penyeduhan agar kopi dapat dipahami dari bahan baku hingga cangkir." />

      <section className="site-container page-section grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="section-kicker">Filosofi brand</p>
          <h2 className="mt-3 font-editorial text-3xl font-bold leading-tight text-brand-charcoal sm:text-4xl">Kopi yang baik dimulai dari rasa ingin tahu.</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-on-surface-variant">
            <p>Pendekatan specialty coffee membantu kami membaca setiap kopi dengan lebih teliti: apa yang ada pada beans, bagaimana panas mengubahnya, dan bagaimana air mengekstraknya.</p>
            <p>Roastery mengembangkan karakter kopi. Slowbar menerjemahkannya melalui seduhan dan percakapan. Keduanya memberi ruang untuk belajar, mengevaluasi, dan menyempurnakan hasil.</p>
          </div>
          <Link href="/catalog" className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-maroon hover:underline">Jelajahi Retail Beans <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="relative min-h-[340px] overflow-hidden rounded-md bg-brand-charcoal sm:min-h-[420px] lg:col-span-7 lg:min-h-[500px]">
          <Image src="/images/byob-roaster-craft.jpg" alt="Aktivitas di ruang roasting 52 Coffee" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover opacity-90" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-24 text-white sm:p-8"><p className="max-w-lg font-editorial text-2xl font-semibold leading-snug">Dari profil sangrai ke parameter seduh, setiap tahap saling memberi umpan balik.</p></div>
        </div>
      </section>

      <section id="roastery-journey" className="scroll-mt-28 border-y border-border-subtle bg-surface-container-low">
        <div className="site-container page-section">
          <SectionIntro kicker="Roastery Journey" title="Empat tahap, satu alur yang terhubung" description="Gambaran proses ini menjelaskan cara kami memandang perjalanan kopi tanpa menggantikan detail origin dan produk pada katalog." />
          <ol className="grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
            {JOURNEY.map(({ icon: Icon, label, title, description, image, alt }, index) => (
              <li key={label} className="group border-t-2 border-brand-charcoal pt-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface-container"><Image src={image} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.02]" /></div>
                <div className="pt-5">
                  <div className="flex items-center justify-between gap-4"><span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-maroon"><Icon className="h-4 w-4" aria-hidden="true" /> {label}</span><span className="font-mono text-xs text-on-surface-variant">0{index + 1}</span></div>
                  <h3 className="mt-4 font-editorial text-xl font-bold text-brand-charcoal">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="slowbar-ambience" className="site-container page-section scroll-mt-28">
        <SectionIntro kicker="Slowbar Ambience" title="Ruang untuk menyeduh lebih pelan" description="Slowbar mempertemukan atmosfer, teknik seduh, dan interaksi barista dalam pengalaman yang lebih dekat dengan karakter kopi." />
        <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
          <div className="relative min-h-[320px] overflow-hidden rounded-md bg-brand-charcoal sm:min-h-[420px] lg:col-span-7 lg:row-span-2"><Image src="/images/tasting-room-footage.png" alt="Suasana slowbar 52 Coffee" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" /></div>
          <div className="relative min-h-[220px] overflow-hidden rounded-md bg-surface-container sm:min-h-[260px] lg:col-span-5"><Image src="/images/canva-brewista-pour.jpg" alt="Pengalaman manual brew di slowbar" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" /></div>
          <div className="flex min-h-[250px] flex-col justify-between rounded-md bg-brand-charcoal p-6 text-white sm:p-7 lg:col-span-5">
            <div><Coffee className="h-6 w-6 text-brand-teal" aria-hidden="true" /><h3 className="mt-8 font-editorial text-2xl font-bold">Seduh, cicip, lalu bicarakan.</h3><p className="mt-3 text-sm leading-7 text-white/70">Barista membantu menjelaskan pilihan beans dan variabel seduh sesuai pengalaman yang ingin dieksplorasi.</p></div>
            <div className="mt-8 flex items-start gap-2 text-xs leading-5 text-white/70"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" aria-hidden="true" /><span>Jl. KH. Agus Salim No. 11, Sukoharjo, Klojen, Kota Malang, Jawa Timur 65118</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
