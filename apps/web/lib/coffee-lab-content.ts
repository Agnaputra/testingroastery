export type CoffeeLabEntry = {
  path: string;
  group: 'brewing' | 'blend' | 'experiment';
  kicker: string;
  title: string;
  description: string;
  image: string;
  sections: Array<{ id: string; title: string; body: string; points?: string[] }>;
  action: { href: string; label: string; external?: boolean };
};

export const COFFEE_LAB_CONTENT: CoffeeLabEntry[] = [
  {
    path: 'brewing-guidance',
    group: 'brewing',
    kicker: 'Coffee Lab / Brewing Guidance',
    title: 'Seduh dengan parameter yang jelas.',
    description: 'Pelajari metode, resep, grind size, serta rasio dan ekstraksi dalam satu panduan yang saling terhubung.',
    image: '/images/canva-v60-kettle-pour.jpg',
    sections: [
      {
        id: 'brewing-methods',
        title: 'Brewing Methods',
        body: 'Mulai dari karakter cangkir yang dituju, lalu pilih brewer yang memberi tingkat kejernihan, body, dan kontrol sesuai kebutuhan.',
        points: ['Pour-over untuk kejernihan dan kontrol aliran', 'Immersion untuk body dan waktu kontak yang stabil', 'Pressure untuk ekstraksi cepat dan pekat'],
      },
      {
        id: 'recipes',
        title: 'Recipes',
        body: 'Gunakan resep sebagai baseline yang dapat diulang. Catat dose, air, suhu, waktu, dan pola tuang sebelum mengubah satu variabel.',
        points: ['Tetapkan parameter awal', 'Uji satu perubahan pada satu waktu', 'Simpan hasil seduh dan catatan rasa'],
      },
      {
        id: 'grind-size',
        title: 'Grind Size',
        body: 'Ukuran giling mengatur kecepatan air mengekstrak kopi. Sesuaikan tingkat kehalusan berdasarkan metode, waktu alir, dan rasa akhir.',
        points: ['Halus untuk kontak singkat atau tekanan', 'Sedang sebagai titik awal pour-over', 'Kasar untuk immersion dan kontak lebih lama'],
      },
      {
        id: 'ratio-extraction',
        title: 'Ratio & Extraction',
        body: 'Rasio menentukan konsentrasi, sedangkan ekstraksi menjelaskan seberapa banyak material kopi larut ke dalam air.',
        points: ['Mulai dari rasio yang mudah diulang', 'Baca rasa, bukan angka saja', 'Koreksi grind, waktu, suhu, atau agitasi secara bertahap'],
      },
    ],
    action: { href: '/coffee-lab/brewing-guidance', label: 'Buka Brewing Guidance' },
  },
  {
    path: 'build-your-own-blend',
    group: 'blend',
    kicker: 'Coffee Lab / Build Your Own Blend',
    title: 'Bangun profil rasa dalam satu alur eksperimen.',
    description: 'Pilih beans, tentukan arah profil, kembangkan racikan, lalu lakukan tasting dan adjustment tanpa berpindah halaman.',
    image: '/images/byob-craft-collage.jpg',
    sections: [
      {
        id: 'choose-your-beans',
        title: 'Choose Your Beans',
        body: 'Kenali fungsi setiap komponen sebelum menentukan proporsi. Gunakan beans yang sudah dipublikasikan sebagai bahan eksplorasi.',
        points: ['Base memberi struktur dan body', 'Accent menambah aroma atau acidity', 'Bridge menyatukan karakter antarkomponen'],
      },
      {
        id: 'define-your-profile',
        title: 'Define Your Profile',
        body: 'Tentukan target body, sweetness, acidity, dan finish sebelum mengubah komposisi agar setiap percobaan memiliki arah yang jelas.',
        points: ['Tuliskan karakter yang dapat dicicipi', 'Tentukan konteks seduh', 'Pilih satu karakter utama dan satu pendukung'],
      },
      {
        id: 'blend-development',
        title: 'Blend Development',
        body: 'Bangun sampel kecil, dokumentasikan proporsi, dan bandingkan hasil dengan parameter seduh yang tetap.',
        points: ['Mulai dari dua komponen', 'Uji proporsi dengan interval yang jelas', 'Simpan setiap versi sebagai pembanding'],
      },
      {
        id: 'tasting-adjustment',
        title: 'Tasting & Adjustment',
        body: 'Cicipi secara terstruktur, bandingkan hasil dengan target awal, lalu tentukan satu perubahan untuk iterasi berikutnya.',
        points: ['Cicipi pada beberapa suhu', 'Gunakan format catatan yang sama', 'Lakukan adjustment kecil dan terukur'],
      },
    ],
    action: { href: '/blend-builder', label: 'Mulai eksperimen blend' },
  },
  {
    path: 'coffee-experiments',
    group: 'experiment',
    kicker: 'Coffee Lab / Coffee Experiments',
    title: 'Agenda eksperimen dalam satu halaman.',
    description: 'Temukan cupping, roasting experiments, dan brewing experiments 52 Coffee dalam satu rangkaian program.',
    image: '/images/roaster-footage.png',
    sections: [
      {
        id: 'cupping-events',
        title: 'Cupping Events',
        body: 'Sesi edukasi untuk membandingkan aroma dan rasa kopi dengan prosedur seduh yang seragam.',
        points: ['Membaca aroma, acidity, sweetness, body, dan aftertaste', 'Tema, kapasitas, lokasi, dan pendaftaran mengikuti agenda resmi'],
      },
      {
        id: 'roasting-experiments',
        title: 'Roasting Experiments',
        body: 'Eksplorasi bagaimana perubahan development, energi, dan profil sangrai memengaruhi karakter di dalam cangkir.',
        points: ['Bandingkan profil dengan evaluasi cangkir', 'Hasil dibagikan setelah materi dan konteks siap'],
      },
      {
        id: 'brewing-experiments',
        title: 'Brewing Experiments',
        body: 'Eksperimen terarah untuk membaca dampak grind, rasio, suhu, agitasi, dan waktu terhadap hasil seduh.',
        points: ['Ubah satu variabel pada satu waktu', 'Dokumentasikan resep dan rasa setiap percobaan'],
      },
    ],
    action: { href: 'https://luma.com/', label: 'Lihat agenda di Luma', external: true },
  },
];

export function getCoffeeLabEntry(slug: string[]) {
  return COFFEE_LAB_CONTENT.find((entry) => entry.path === slug.join('/'));
}
