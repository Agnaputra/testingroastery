// Database Hardware & Scientific Engine ala BrewLogic untuk 52 Coffee & Roastery

export interface BrewerHardware {
  id: string;
  name: string;
  brand: string;
  category: 'cone' | 'flat' | 'immersion' | 'hybrid' | 'espresso';
  hasValve: boolean;
  filterType: string;
  description: string;
}

export interface GrinderRange {
  min: number;
  max: number;
}

export interface GrinderModel {
  id: string;
  name: string;
  brand: string;
  unit: 'Klik' | 'Putaran' | 'Nomor' | 'Setting' | 'Notch' | 'Angka' | 'Mark' | 'Klik/Putaran';
  halus: GrinderRange;
  sedang: GrinderRange;
  kasar: GrinderRange;
}

export interface WaterSource {
  id: string;
  name: string;
  ppm: number;
  description: string;
}

export interface TargetProfile {
  id: 'balance' | 'sweet' | 'acidity' | 'body';
  label: string;
  description: string;
}

// 1. DRIPPER & BREWER HARDWARE DATABASE (30+ Pilihan Lengkap)
export const BREWER_HARDWARE: BrewerHardware[] = [
  { id: 'hario_v60', name: 'Hario V60 (Plastic/Ceramic)', brand: 'Hario', category: 'cone', hasValve: false, filterType: 'Hario 01/02 Paper Filter', description: 'Cone 60° dengan alur spiral untuk laju alir cepat dan kejernihan tinggi.' },
  { id: 'kalita_wave', name: 'Kalita Wave 155 / 185', brand: 'Kalita', category: 'flat', hasValve: false, filterType: 'Kalita Wave Wave Paper', description: 'Dasar rata dengan 3 lubang untuk ekstraksi merata dan konsisten.' },
  { id: 'origami_dripper', name: 'Origami Dripper (S/M)', brand: 'Origami', category: 'cone', hasValve: false, filterType: 'Cone atau Wave Paper Filter', description: '20 alur vertikal untuk fleksibilitas laju alir dan aroma floral.' },
  { id: 'aeropress', name: 'AeroPress (Standard / Inverted)', brand: 'AeroPress', category: 'immersion', hasValve: false, filterType: 'AeroPress Micro-filter Paper', description: 'Kombinasi rendam dan tekanan udara untuk body tebal dan ekstraksi cepat.' },
  { id: 'hario_switch', name: 'Hario Switch Immersion', brand: 'Hario', category: 'hybrid', hasValve: true, filterType: 'Hario V60 Paper Filter', description: 'Dripper hibrida dengan katup bola baja untuk kontrol waktu kontak immersion.' },
  { id: 'clever_dripper', name: 'Clever Coffee Dripper', brand: 'Clever', category: 'hybrid', hasValve: true, filterType: 'Melitta 102/104 Paper', description: 'Immersion dripper berkatup otomatis yang aktif saat diletakkan di atas server.' },
  { id: 'cafec_flower', name: 'Cafec Flower Dripper', brand: 'Cafec', category: 'cone', hasValve: false, filterType: 'Cafec Abaca / V60 Filter', description: 'Alur kelopak bunga dengan rusuk aerasi untuk sweetness dan body seimbang.' },
  { id: 'cafec_deep27', name: 'Cafec Deep 27', brand: 'Cafec', category: 'cone', hasValve: false, filterType: 'Cafec Deep 27 Dedicated Filter', description: 'Sudut runcing 27° yang menciptakan kedalaman bed bubuk kopi ekstrem.' },
  { id: 'fellow_stagg', name: 'Fellow Stagg [X] / [XF]', brand: 'Fellow', category: 'flat', hasValve: false, filterType: 'Fellow Stagg Flat Paper', description: 'Dinding ganda berinsulasi vakum untuk stabilitas retensi suhu ekstraksi.' },
  { id: 'chemex', name: 'Chemex Classic 6-Cup', brand: 'Chemex', category: 'cone', hasValve: false, filterType: 'Chemex Bonded Thick Filter', description: 'Kertas saring tebal khusus yang menyerap minyak alami untuk cangkir ultra-clean.' },
  { id: 'april_brewer', name: 'April Brewer (Glass/Ceramic)', brand: 'April', category: 'flat', hasValve: false, filterType: 'April / Kalita Wave Filter', description: 'Dirancang untuk laju alir lambat yang menghasilkan kompleksitas manis buah.' },
  { id: 'timemore_b75', name: 'Timemore B75', brand: 'Timemore', category: 'flat', hasValve: false, filterType: 'Kalita 155 Wave Filter', description: 'Sudut 75° flat-bottom dengan alur bergaris untuk ekstraksi manis yang cepat.' },
  { id: 'kono_meimon', name: 'Kono Meimon Dripper', brand: 'Kono', category: 'cone', hasValve: false, filterType: 'Kono / V60 Filter', description: 'Alur hanya di paruh bawah kerucut untuk retensi air di paruh atas.' },
  { id: 'orea_v3', name: 'Orea V3 / V4', brand: 'Orea', category: 'flat', hasValve: false, filterType: 'Kalita 185 / Flat Filter', description: 'Brewer terbuka dengan kecepatan alir tinggi untuk meminimalkan astringent.' },
  { id: 'hario_mugen', name: 'Hario Mugen Single Pour', brand: 'Hario', category: 'cone', hasValve: false, filterType: 'Hario V60 Paper Filter', description: 'Dinding tanpa alur untuk ekstraksi satu kali tuang perlahan.' },
  { id: 'kalita_102', name: 'Kalita 102 (Trapezoid)', brand: 'Kalita', category: 'flat', hasValve: false, filterType: 'Trapezoid 102 Paper', description: 'Bentuk trapesium klasik dengan 3 lubang kecil untuk ekstraksi body mantap.' },
  { id: 'french_press', name: 'French Press (Classic Plunger)', brand: 'Bodum / Generic', category: 'immersion', hasValve: false, filterType: 'Metal Mesh Filter', description: 'Immersion penuh tanpa kertas untuk melarutkan minyak alami dan body tebal.' },
  { id: 'suji_v60', name: 'Suji V60 Dripper', brand: 'Suji', category: 'cone', hasValve: false, filterType: 'V60 Paper Filter', description: 'Dripper kerucut kaca buatan lokal dengan spiral teratur.' },
  { id: 'suji_wave', name: 'Suji Wave Dripper', brand: 'Suji', category: 'flat', hasValve: false, filterType: 'Wave 155/185 Paper', description: 'Flat-bottom kaca buatan lokal dengan lubang aliran presisi.' },
  { id: 'torch_mountain', name: 'Torch Mountain Dripper', brand: 'Torch', category: 'cone', hasValve: false, filterType: 'V60 atau Wave Paper', description: 'Kerucut keramik berlubang tengah besar dengan cincin kayu.' },
  { id: 'blue_bottle', name: 'Blue Bottle Dripper', brand: 'Blue Bottle', category: 'flat', hasValve: false, filterType: 'Bamboo Wave Filter', description: 'Alur kapiler mikro dari keramik Arita untuk aliran hidrolik teratur.' },
  { id: 'brewista_gem', name: 'Brewista Gem Series', brand: 'Brewista', category: 'cone', hasValve: false, filterType: 'V60 Paper Filter', description: 'Bentuk berlian dengan lid pengunci aroma karya Stefanos Domatiotis.' },
  { id: 'brewista_tornado', name: 'Brewista Tornado Duo', brand: 'Brewista', category: 'cone', hasValve: false, filterType: 'V60 Paper Filter', description: 'Rusuk spiral 18 alur untuk pusaran air dinamis.' },
  { id: 'loveramics', name: 'Loveramics Brewers', brand: 'Loveramics', category: 'cone', hasValve: false, filterType: 'V60 Filter', description: 'Tiga varian alur: Mellow, Smooth, dan Strong.' },
  { id: 'melitta_1x2', name: 'Melitta (Aromaboy / 1x2)', brand: 'Melitta', category: 'flat', hasValve: false, filterType: 'Melitta Paper Filter', description: 'Desain satu lubang orisinal untuk ekstraksi teratur.' },
  { id: 'mhw_elf', name: 'MHW-3Bomber Elf Dripper', brand: 'MHW-3Bomber', category: 'cone', hasValve: false, filterType: 'V60 Paper Filter', description: 'Dripper akrilik berpresisi tinggi dengan ekstraksi merata.' },
  { id: 'vietnam_drip', name: 'Vietnam Drip (Phin)', brand: 'Generic', category: 'immersion', hasValve: false, filterType: 'Metal Filter Screwed', description: 'Saringan logam gravitasi untuk seduhan sangat kental dan pekat.' },
];

// 2. GRINDER DATABASE (25+ Grinder Populer Lengkap dengan Kalibrasi Klik)
export const GRINDER_DATABASE: GrinderModel[] = [
  { id: 'timemore_c2', name: 'Timemore C2 / C3', brand: 'Timemore', unit: 'Klik', halus: { min: 10, max: 12 }, sedang: { min: 13, max: 16 }, kasar: { min: 20, max: 26 } },
  { id: 'timemore_c3esp', name: 'Timemore C3 ESP', brand: 'Timemore', unit: 'Klik/Putaran', halus: { min: 0.8, max: 1.1 }, sedang: { min: 14, max: 18 }, kasar: { min: 21, max: 25 } },
  { id: 'comandante_c40', name: 'Comandante C40 MK4', brand: 'Comandante', unit: 'Klik', halus: { min: 10, max: 15 }, sedang: { min: 18, max: 24 }, kasar: { min: 25, max: 32 } },
  { id: 'comandante_c60', name: 'Comandante C60 Baracuda', brand: 'Comandante', unit: 'Klik', halus: { min: 10, max: 18 }, sedang: { min: 20, max: 30 }, kasar: { min: 35, max: 45 } },
  { id: '1zpresso_kultra', name: '1Zpresso K-Ultra', brand: '1Zpresso', unit: 'Nomor', halus: { min: 3, max: 4.5 }, sedang: { min: 6, max: 7.5 }, kasar: { min: 8, max: 9 } },
  { id: '1zpresso_jultra', name: '1Zpresso J-Ultra', brand: '1Zpresso', unit: 'Putaran', halus: { min: 1, max: 1.6 }, sedang: { min: 2.5, max: 3.5 }, kasar: { min: 3.5, max: 4.5 } },
  { id: '1zpresso_xpro', name: '1Zpresso X-Pro / X-Ultra', brand: '1Zpresso', unit: 'Putaran', halus: { min: 0.3, max: 0.5 }, sedang: { min: 1.2, max: 1.5 }, kasar: { min: 2, max: 2.4 } },
  { id: '1zpresso_zp6', name: '1Zpresso ZP6 Special', brand: '1Zpresso', unit: 'Nomor', halus: { min: 0, max: 0 }, sedang: { min: 3.5, max: 5.5 }, kasar: { min: 6, max: 7.5 } },
  { id: '1zpresso_q2', name: '1Zpresso Q Air / Q2', brand: '1Zpresso', unit: 'Klik', halus: { min: 10, max: 14 }, sedang: { min: 15, max: 20 }, kasar: { min: 22, max: 26 } },
  { id: 'kingrinder_k6', name: 'Kingrinder K6', brand: 'Kingrinder', unit: 'Klik', halus: { min: 30, max: 50 }, sedang: { min: 60, max: 90 }, kasar: { min: 90, max: 120 } },
  { id: 'kingrinder_p', name: 'Kingrinder P0 / P1 / P2', brand: 'Kingrinder', unit: 'Klik', halus: { min: 15, max: 20 }, sedang: { min: 20, max: 30 }, kasar: { min: 35, max: 45 } },
  { id: 'fellow_ode', name: 'Fellow Ode Gen 1 / 2', brand: 'Fellow', unit: 'Setting', halus: { min: 1, max: 2.5 }, sedang: { min: 3, max: 5 }, kasar: { min: 6, max: 8 } },
  { id: 'baratza_encore', name: 'Baratza Encore / ESP', brand: 'Baratza', unit: 'Setting', halus: { min: 8, max: 12 }, sedang: { min: 14, max: 18 }, kasar: { min: 22, max: 28 } },
  { id: 'breville_smart', name: 'Breville Smart Grinder Pro', brand: 'Breville', unit: 'Setting', halus: { min: 1, max: 25 }, sedang: { min: 30, max: 45 }, kasar: { min: 50, max: 60 } },
  { id: 'latina_sumba', name: 'Latina Sumba / Sumbawa', brand: 'Latina', unit: 'Klik', halus: { min: 3, max: 5 }, sedang: { min: 7, max: 10 }, kasar: { min: 10, max: 14 } },
  { id: 'latina_sumo', name: 'Latina Sumo', brand: 'Latina', unit: 'Klik', halus: { min: 8, max: 12 }, sedang: { min: 15, max: 20 }, kasar: { min: 20, max: 25 } },
  { id: 'hario_minislim', name: 'Hario Mini Slim+', brand: 'Hario', unit: 'Klik', halus: { min: 3, max: 5 }, sedang: { min: 7, max: 10 }, kasar: { min: 10, max: 13 } },
  { id: 'hario_skerton', name: 'Hario Skerton Pro', brand: 'Hario', unit: 'Notch', halus: { min: 1, max: 4 }, sedang: { min: 5, max: 7 }, kasar: { min: 8, max: 10 } },
  { id: 'hario_canister', name: 'Hario Canister (C-20)', brand: 'Hario', unit: 'Notch', halus: { min: 1, max: 1 }, sedang: { min: 2, max: 3 }, kasar: { min: 4, max: 5 } },
  { id: 'kinu_m47', name: 'Kinu M47', brand: 'Kinu', unit: 'Putaran', halus: { min: 0.8, max: 1.2 }, sedang: { min: 2.5, max: 3.5 }, kasar: { min: 4, max: 5 } },
  { id: 'mazzer_omega', name: 'Mazzer Omega', brand: 'Mazzer', unit: 'Angka', halus: { min: 1, max: 3 }, sedang: { min: 6, max: 8 }, kasar: { min: 9, max: 11 } },
  { id: 'pietro', name: 'Pietro (Flat Burr)', brand: 'Pietro', unit: 'Angka', halus: { min: 1, max: 2.5 }, sedang: { min: 5, max: 7 }, kasar: { min: 7, max: 9 } },
  { id: 'porlex_mini', name: 'Porlex Mini II', brand: 'Porlex', unit: 'Klik', halus: { min: 3, max: 5 }, sedang: { min: 7, max: 9 }, kasar: { min: 10, max: 13 } },
  { id: 'starseeker_edge', name: 'Starseeker Edge / Edge+', brand: 'Starseeker', unit: 'Klik', halus: { min: 20, max: 40 }, sedang: { min: 50, max: 70 }, kasar: { min: 80, max: 100 } },
  { id: 'etzinger_etzi', name: 'Etzinger etz-I', brand: 'Etzinger', unit: 'Angka', halus: { min: 4, max: 8 }, sedang: { min: 12, max: 16 }, kasar: { min: 18, max: 22 } },
  { id: 'oe_lido', name: 'OE Lido 3 / OG', brand: 'Orphan Espresso', unit: 'Mark', halus: { min: 2, max: 4 }, sedang: { min: 6, max: 10 }, kasar: { min: 12, max: 15 } },
];

// 3. WATER SOURCES DATABASE (Karakteristik Mineral Air Indonesia)
export const WATER_SOURCES: WaterSource[] = [
  { id: 'aqua', name: 'Aqua (Danone)', ppm: 140, description: 'Mineral seimbang ~140 PPM. Ekstraksi cepat dan body kuat, jaga suhu tidak terlalu tinggi.' },
  { id: 'le_minerale', name: 'Le Minerale', ppm: 100, description: 'Kaya bikarbonat ~100 PPM. Memberikan manis manis bulat dengan acidity yang halus.' },
  { id: 'nestle', name: 'Nestle Pure Life', ppm: 50, description: 'TDS rendah ~50 PPM. Menonjolkan keasaman buah jernih dan floral yang terang.' },
  { id: 'cleo', name: 'Cleo (Distilled / RO)', ppm: 10, description: 'Ultra rendah mineral ~10 PPM. Butuh suhu ekstraksi sedikit lebih tinggi untuk sweetness.' },
  { id: 'amidis', name: 'Amidis (Distilled 0 PPM)', ppm: 0, description: 'Air demineralisasi murni. Keasaman sangat tajam dan transparan, cocok untuk resep kompetisi.' },
  { id: 'custom', name: 'Custom Water PPM / TDS', ppm: 80, description: 'Input nilai TDS meter air seduh Anda sendiri.' },
];

// 4. PROCESS & VARIETY OPTIONS
export const PROCESS_OPTIONS = [
  'Washed / Fully Washed',
  'Natural / Dry Process',
  'Honey / Pulped Natural',
  'Anaerobic / Fermented',
  'Carbonic Maceration (CM)',
  'Wet Hulled (Giling Basah)',
  'Experimental / Yeast / Koji',
  'Lainnya (Input Manual)',
];

export const VARIETY_OPTIONS = [
  'Typica',
  'Bourbon',
  'Catimor',
  'Caturra / Catuai',
  'Geisha',
  'S795 (Jember)',
  'Sigararutang / Ateng',
  'Ethiopian Heirlooms',
  'P88',
  'Abyssinia',
  'Fine Robusta',
  'Mix Variety',
  'Lainnya (Input Manual)',
];

export const TARGET_PROFILES: TargetProfile[] = [
  { id: 'balance', label: 'Balance & Clean', description: 'Ekstraksi harmonis antara keasaman buah, rasa manis, dan kejernihan cangkir.' },
  { id: 'sweet', label: 'More Sweetness', description: 'Memaksimalkan senyawa karamel dan rasa manis matang dengan agitasi lebih halus.' },
  { id: 'acidity', label: 'More Acidity', description: 'Menonjolkan kecerahan asam buah tropis dan wangi floral dengan flow lebih cepat.' },
  { id: 'body', label: 'More Body', description: 'Mengekstrak mouthfeel tebal, tekstur creamy, dan aftertaste cokelat kakao pekat.' },
];

export interface PrecisionRecipeStep {
  time: string;
  startSec: number;
  endSec: number;
  action: string;
  amount: number;
  cumulativeAmount: number;
  note: string;
  valve: 'BUKA' | 'TUTUP' | 'TIDAK ADA';
}

export interface PrecisionRecipeResult {
  origin: string;
  roastLevel: 'light' | 'medium' | 'dark';
  temperatureStyle: 'hot' | 'iced';
  brewerName: string;
  brewerHardware: BrewerHardware;
  grinderName: string;
  grinderSetting: string;
  grinderUnit: string;
  targetProfile: TargetProfile;
  waterPPM: number;
  dose: number;
  ratio: string;
  ratioMultiplier: number;
  temp: number;
  time: string;
  targetSeconds: number;
  totalWater: number;
  brewingWater: number;
  iceAmount: number;
  steps: PrecisionRecipeStep[];
}

// 5. PRECISION ENGINE ALGORITHM (Menghitung Suhu, Waktu, Klik Grinder, dan Sekuens Tuang)
export function calculatePrecisionRecipe(input: {
  origin: string;
  dose: number;
  temperatureStyle: 'hot' | 'iced';
  roastLevel: 'light' | 'medium' | 'dark';
  process: string;
  variety: string;
  brewerId: string;
  grinderId: string;
  waterSourceId: string;
  customPPM?: number;
  targetProfileId: 'balance' | 'sweet' | 'acidity' | 'body';
}): PrecisionRecipeResult {
  const {
    origin,
    dose,
    temperatureStyle,
    roastLevel,
    process,
    brewerId,
    grinderId,
    waterSourceId,
    customPPM,
    targetProfileId,
  } = input;

  const brewer = BREWER_HARDWARE.find((b) => b.id === brewerId) || BREWER_HARDWARE[0];
  const grinder = GRINDER_DATABASE.find((g) => g.id === grinderId) || GRINDER_DATABASE[0];
  const water = WATER_SOURCES.find((w) => w.id === waterSourceId) || WATER_SOURCES[0];
  const effectivePPM = water.id === 'custom' ? customPPM || 80 : water.ppm;
  const targetProfile = TARGET_PROFILES.find((p) => p.id === targetProfileId) || TARGET_PROFILES[0];

  // 1. Suhu Air Dasar berdasarkan Roast Level
  let baseTemp = 92;
  if (roastLevel === 'light') baseTemp = 93;
  if (roastLevel === 'medium') baseTemp = 91;
  if (roastLevel === 'dark') baseTemp = 87;

  // Modifikasi Suhu berdasarkan TDS Air (PPM)
  // Air rendah PPM (Cleo/Amidis) mengekstrak lebih lambat, butuh +1°C
  // Air tinggi PPM (Aqua 140) mengekstrak sangat cepat, -1°C untuk mencegah astringent
  if (effectivePPM < 40) baseTemp += 1;
  else if (effectivePPM > 120) baseTemp -= 1;

  // Modifikasi Suhu berdasarkan Target Profil
  if (targetProfileId === 'acidity') baseTemp += 1;
  else if (targetProfileId === 'sweet') baseTemp -= 1;

  // Batas aman suhu
  baseTemp = Math.min(95, Math.max(85, baseTemp));

  // 2. Rasio Seduh
  let ratioMultiplier = 15;
  if (temperatureStyle === 'iced') {
    ratioMultiplier = 15; // Rasio total tetap 1:15, tapi dibagi es & air panas
  } else {
    if (targetProfileId === 'acidity') ratioMultiplier = 16.5;
    else if (targetProfileId === 'sweet') ratioMultiplier = 15.5;
    else if (targetProfileId === 'body') ratioMultiplier = 14;
    else ratioMultiplier = 15;
  }

  const totalWater = Math.round(dose * ratioMultiplier);
  let iceAmount = 0;
  let brewingWater = totalWater;

  if (temperatureStyle === 'iced') {
    iceAmount = Math.round(totalWater * 0.4); // 40% es batu di server
    brewingWater = totalWater - iceAmount; // 60% air panas untuk konsentrat
  }

  // 3. Kalibrasi Grinder Klik Presisi
  // Hitung index 0 (paling halus) s.d. 1 (paling kasar)
  let grindIndex = 0.5; // default sedang

  if (brewer.category === 'flat') grindIndex += 0.05; // sedikit lebih kasar di flat bottom
  if (brewer.category === 'immersion') grindIndex = 0.85; // kasar di immersion
  if (brewer.category === 'hybrid') grindIndex = 0.45; // medium-fine di hybrid/switch

  if (targetProfileId === 'acidity') grindIndex += 0.05; // agak kasar untuk flow cepat
  if (targetProfileId === 'body') grindIndex -= 0.08; // agak halus untuk ekstraksi padat
  if (temperatureStyle === 'iced') grindIndex -= 0.08; // lebih halus untuk ekstraksi konsentrat es

  // Gilingan Sedang grinder bersangkutan
  const gMin = grinder.sedang.min;
  const gMax = grinder.sedang.max;
  let calculatedNumber = gMin + (gMax - gMin) * grindIndex;

  // Format angka klik sesuai unit grinder
  let grinderSettingFormatted = '';
  if (grinder.unit === 'Nomor' || grinder.unit === 'Putaran' || grinder.unit === 'Klik/Putaran') {
    grinderSettingFormatted = `${calculatedNumber.toFixed(1)} ${grinder.unit}`;
  } else {
    grinderSettingFormatted = `${Math.round(calculatedNumber)} ${grinder.unit}`;
  }

  // 4. Target Waktu Seduh
  let targetSeconds = 150; // 02:30
  if (brewer.category === 'immersion') targetSeconds = 240; // 04:00
  if (temperatureStyle === 'iced') targetSeconds = 120; // 02:00

  // 5. Sekuens Tuangan Bertahap (Extraction Sequence)
  const steps: PrecisionRecipeStep[] = [];

  if (brewer.hasValve) {
    // Sekuens untuk Dripper Berkatup (Hario Switch / Clever Dripper)
    const bloomAmount = Math.round(brewingWater * 0.3);
    const mainAmount = brewingWater - bloomAmount;

    steps.push({
      time: '00:00 - 00:45',
      startSec: 0,
      endSec: 45,
      action: 'Blooming & Rendam Awal',
      amount: bloomAmount,
      cumulativeAmount: bloomAmount,
      note: 'Tuang air merata ke seluruh bubuk kopi untuk melepas gas CO2 alami.',
      valve: 'TUTUP',
    });

    steps.push({
      time: '00:45 - 01:45',
      startSec: 45,
      endSec: 105,
      action: 'Tuangan Utama (Full Steeping)',
      amount: mainAmount,
      cumulativeAmount: brewingWater,
      note: 'Tuang seluruh sisa air panas, biarkan kopi terendam penuh hingga waktu kontak optimal.',
      valve: 'TUTUP',
    });

    steps.push({
      time: '01:45 - 02:30',
      startSec: 105,
      endSec: 150,
      action: 'Buka Katup & Drawdown',
      amount: 0,
      cumulativeAmount: brewingWater,
      note: 'Tekan tuas sakelar untuk membuka katup, biarkan ekstrak kopi turun bersih ke server.',
      valve: 'BUKA',
    });
  } else if (temperatureStyle === 'iced') {
    // Sekuens Japanese Iced (Flash Chilled)
    const bloom = Math.round(brewingWater * 0.25);
    const pour2 = Math.round(brewingWater * 0.45);
    const pour3 = brewingWater - bloom - pour2;

    steps.push({
      time: '00:00 - 00:35',
      startSec: 0,
      endSec: 35,
      action: 'Blooming di Atas Es',
      amount: bloom,
      cumulativeAmount: bloom,
      note: `Pastikan ${iceAmount}g es batu sudah ada di server. Basahi bubuk kopi untuk blooming cepat.`,
      valve: 'TIDAK ADA',
    });

    steps.push({
      time: '00:35 - 01:15',
      startSec: 35,
      endSec: 75,
      action: 'Ekstraksi Konsentrat Manis',
      amount: pour2,
      cumulativeAmount: bloom + pour2,
      note: 'Tuang aliran memusat perlahan untuk mengekstrak sari pati manis buah kopi.',
      valve: 'TIDAK ADA',
    });

    steps.push({
      time: '01:15 - 02:00',
      startSec: 75,
      endSec: 120,
      action: 'Final Pour & Flash Chill',
      amount: pour3,
      cumulativeAmount: brewingWater,
      note: 'Tuang sisa air hingga batas target. Kopi langsung mendingin mengunci aroma buah.',
      valve: 'TIDAK ADA',
    });
  } else {
    // Sekuens Standar Pour Over 3-Pours (V60, Kalita, Origami, dll.)
    const bloom = Math.round(brewingWater * 0.2); // 20%
    const pour2 = Math.round(brewingWater * 0.4); // 40%
    const pour3 = brewingWater - bloom - pour2; // 40%

    steps.push({
      time: '00:00 - 00:40',
      startSec: 0,
      endSec: 40,
      action: 'Blooming & Gentle Swirl',
      amount: bloom,
      cumulativeAmount: bloom,
      note: 'Tuang air melingkar dari tengah ke luar, lakukan swirl lembut 3 detik untuk melepas gas CO2.',
      valve: 'TIDAK ADA',
    });

    steps.push({
      time: '00:40 - 01:15',
      startSec: 40,
      endSec: 75,
      action: 'Tuangan Kedua (Center Spiral)',
      amount: pour2,
      cumulativeAmount: bloom + pour2,
      note: 'Tuang stabil dari tengah ke tepi tanpa menyiram dinding kertas untuk sweetness & body.',
      valve: 'TIDAK ADA',
    });

    steps.push({
      time: '01:15 - 01:50',
      startSec: 75,
      endSec: 110,
      action: 'Tuangan Ketiga (Finishing)',
      amount: pour3,
      cumulativeAmount: brewingWater,
      note: 'Tuang memusat perlahan hingga mencapai total target timbangan. Beri 1 gentle tap.',
      valve: 'TIDAK ADA',
    });

    steps.push({
      time: '01:50 - 02:30',
      startSec: 110,
      endSec: 150,
      action: 'Drawdown & Penyajian',
      amount: 0,
      cumulativeAmount: brewingWater,
      note: 'Biarkan air turun habis dengan permukaan bed rata. Swirl server sebelum disajikan!',
      valve: 'TIDAK ADA',
    });
  }

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return {
    origin: origin || '52 Coffee Specialty Bean',
    roastLevel,
    temperatureStyle,
    brewerName: brewer.name,
    brewerHardware: brewer,
    grinderName: grinder.name,
    grinderSetting: grinderSettingFormatted,
    grinderUnit: grinder.unit,
    targetProfile,
    waterPPM: effectivePPM,
    dose,
    ratio: `1:${ratioMultiplier}`,
    ratioMultiplier,
    temp: baseTemp,
    time: formatSec(targetSeconds),
    targetSeconds,
    totalWater,
    brewingWater,
    iceAmount,
    steps,
  };
}

export interface BrewTopic {
  id: string;
  num: string;
  tag: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  defaultDose: number;
  ratioMultiplier: number;
  defaultTemp: number;
  grindSize: string;
  waterTemp: string;
  targetSeconds: number;
  filterType: string;
  cupProfile: {
    clarity: number;
    sweetness: number;
    body: number;
    acidity: number;
  };
}

export const BREW_TOPICS: BrewTopic[] = [
  {
    id: 'v60-filter',
    num: '01',
    tag: 'MANUAL BREW',
    category: 'Percolation',
    title: 'V60 Pour Over',
    subtitle: 'Daily Filter — Clean & Bright Acidity',
    description: 'Metode standar Slowbar 52 Coffee untuk mengekstraksi aroma floral melati dan keasaman manis buah tropis yang seimbang.',
    defaultDose: 15,
    ratioMultiplier: 15,
    defaultTemp: 92,
    grindSize: 'Medium-Fine',
    waterTemp: '91°C – 93°C',
    targetSeconds: 150,
    filterType: 'Hario Tab 01/02 Paper Filter',
    cupProfile: { clarity: 5, sweetness: 4, body: 2, acidity: 5 },
  },
  {
    id: 'kalita-wave',
    num: '02',
    tag: 'FLAT BOTTOM',
    category: 'Flat Bottom',
    title: 'Kalita Wave',
    subtitle: 'Balanced Filter — Sweet & Rounded Body',
    description: 'Dasar rata dengan 3 lubang aliran yang menjaga ekstraksi merata di seluruh bed kopi, meminimalkan channeling.',
    defaultDose: 16,
    ratioMultiplier: 15.5,
    defaultTemp: 91,
    grindSize: 'Medium',
    waterTemp: '90°C – 93°C',
    targetSeconds: 150,
    filterType: 'Kalita Wave 155/185 Wave Paper',
    cupProfile: { clarity: 4, sweetness: 5, body: 3, acidity: 4 },
  },
  {
    id: 'aeropress',
    num: '03',
    tag: 'IMMERSION PRESS',
    category: 'Immersion Press',
    title: 'AeroPress',
    subtitle: 'Versatile & Punchy — Juicy Fruit Body',
    description: 'Kombinasi rendam dan dorongan tekanan udara manual untuk menghasilkan body padat serta karakter buah yang intens.',
    defaultDose: 16,
    ratioMultiplier: 13.5,
    defaultTemp: 89,
    grindSize: 'Medium-Fine',
    waterTemp: '87°C – 92°C',
    targetSeconds: 105,
    filterType: 'AeroPress Micro-filter Paper',
    cupProfile: { clarity: 4, sweetness: 4, body: 4, acidity: 4 },
  },
  {
    id: 'french-press',
    num: '04',
    tag: 'FULL IMMERSION',
    category: 'Full Immersion',
    title: 'French Press',
    subtitle: 'Classic Immersion — Rich Body & Cocoa Notes',
    description: 'Perendaman penuh tanpa kertas saring yang mempertahankan minyak alami kopi untuk tekstur creamy dan aroma kakao hangat.',
    defaultDose: 20,
    ratioMultiplier: 14,
    defaultTemp: 94,
    grindSize: 'Coarse',
    waterTemp: '92°C – 95°C',
    targetSeconds: 270,
    filterType: 'Stainless Steel Mesh Filter',
    cupProfile: { clarity: 2, sweetness: 4, body: 5, acidity: 2 },
  },
  {
    id: 'japanese-iced',
    num: '05',
    tag: 'ICED FILTER',
    category: 'Flash Chilled',
    title: 'Japanese Iced Drip',
    subtitle: 'Flash Brew — Trapping Volatile Aromatics',
    description: 'Seduh konsentrat panas langsung di atas es batu di server untuk mengunci aroma volatil dan kesegaran buah segar.',
    defaultDose: 18,
    ratioMultiplier: 15,
    defaultTemp: 94,
    grindSize: 'Medium-Fine',
    waterTemp: '93°C – 95°C',
    targetSeconds: 120,
    filterType: 'V60 / Kalita Paper Filter',
    cupProfile: { clarity: 5, sweetness: 4, body: 3, acidity: 5 },
  },
  {
    id: 'espresso-calibration',
    num: '06',
    tag: 'ESPRESSO BAR',
    category: 'Espresso Bar',
    title: 'Kalibrasi Espresso',
    subtitle: '9 Bar Extraction — Syrupy Crema',
    description: 'Parameter ekstraksi espresso harian Slowbar 52 Coffee untuk crema tebal dan rasa manis cokelat karamel.',
    defaultDose: 18,
    ratioMultiplier: 2,
    defaultTemp: 93,
    grindSize: 'Fine Espresso',
    waterTemp: '92.5°C – 93.5°C',
    targetSeconds: 30,
    filterType: '58mm Precision Basket',
    cupProfile: { clarity: 3, sweetness: 5, body: 5, acidity: 3 },
  },
];

export const CURATED_RECIPES = [
  {
    id: 'recipe-ijen-cm',
    beanId: 'ijen-carbonic-maceration-asmara',
    beanName: 'Ijen Carbonic Maceration (Asmara)',
    methodId: 'v60-filter',
    methodName: 'V60 Pour Over',
    dose: 15,
    ratio: 15,
    waterYield: 225,
    temp: 92,
    time: '02:15',
    grind: 'Medium-Fine (Garam meja)',
    notes: ['Boozy Cherry', 'Jasmine', 'Tropical Fruit'],
    quote: 'Menonjolkan aroma jasmine dan ledakan rasa manis ceri matang dari lot fermentasi karbonik juara.',
  },
  {
    id: 'recipe-sunda-aromanis',
    beanId: 'sunda-aromanis-honey',
    beanName: 'Sunda Aromanis Honey',
    methodId: 'kalita-wave',
    methodName: 'Kalita Wave',
    dose: 16,
    ratio: 15.5,
    waterYield: 248,
    temp: 91,
    time: '02:30',
    grind: 'Medium (Pasir bersih)',
    notes: ['Floral Honey', 'Ripe Mango', 'Silky Body'],
    quote: 'Flat-bottom dripper menjaga ekstraksi manis madu Priangan tetap stabil tanpa rasa sepat.',
  },
  {
    id: 'recipe-argopuro-iced',
    beanId: 'argopuro-walida-natural-arcapada',
    beanName: 'Argopuro Walida Natural',
    methodId: 'japanese-iced',
    methodName: 'Japanese Iced Drip',
    dose: 18,
    ratio: 15,
    waterYield: 270,
    temp: 94,
    time: '02:00',
    grind: 'Medium-Fine',
    notes: ['Red Grape', 'Fermented Sweetness', 'Dark Chocolate'],
    quote: 'Ekstraksi konsentrat panas langsung ke atas es batu untuk mengunci aroma anggur merah yang segar.',
  },
  {
    id: 'recipe-house-blend',
    beanId: '52-house-blend-espresso',
    beanName: '52 House Blend Espresso',
    methodId: 'espresso-calibration',
    methodName: 'Espresso Calibration (9 Bar)',
    dose: 18,
    ratio: 2,
    waterYield: 36,
    temp: 93,
    time: '00:28',
    grind: 'Fine Espresso',
    notes: ['Dark Cocoa', 'Toasted Almond', 'Golden Crema'],
    quote: 'Rasio 1:2 harian untuk minuman berbasis susu atau dinikmati langsung sebagai espresso tebal yang manis.',
  },
];

export const GRIND_CHART = [
  {
    level: 'Extra Fine',
    micron: '180 – 250 µm',
    analogy: 'Tepung terigu / Bedak halus',
    methods: ['Turkish Ibrik', 'Manual Rok Presso'],
    characteristics: 'Permukaan partikel sangat luas, resistensi air maksimum, ekstraksi ultra-cepat.',
  },
  {
    level: 'Fine',
    micron: '250 – 350 µm',
    analogy: 'Garam meja ultra halus / Gula halus',
    methods: ['Espresso Machine (9 Bar)', 'Moka Pot Kompor', 'Kopi Tubruk Halus'],
    characteristics: 'Menahan tekanan pompa espresso untuk membentuk crema tebal keemasan.',
  },
  {
    level: 'Medium-Fine',
    micron: '400 – 600 µm',
    analogy: 'Garam meja dapur biasa',
    methods: ['V60 Pour Over', 'AeroPress Standar', 'Origami Dripper'],
    characteristics: 'Keseimbangan ideal antara laju alir air (flow rate) dan ekstraksi clarity buah.',
  },
  {
    level: 'Medium',
    micron: '600 – 800 µm',
    analogy: 'Pasir pantai kering bersih',
    methods: ['Kalita Wave', 'Clever Dripper', 'Siphon Brewer', 'Automatic Drip Maker'],
    characteristics: 'Laju alir teratur pada flat bottom, meminimalkan channeling dan rasa sepat.',
  },
  {
    level: 'Medium-Coarse',
    micron: '800 – 1000 µm',
    analogy: 'Garam kosher kasar / Pasir kasar',
    methods: ['Chemex 6-Cup', 'Kalita Wave Batch Besar'],
    characteristics: 'Mengimbangi kertas filter tebal Chemex agar total waktu drawdown tidak over-ekstraksi.',
  },
  {
    level: 'Coarse',
    micron: '1000 – 1400 µm',
    analogy: 'Sea salt kristal / Remah biskuit kasar',
    methods: ['French Press', 'Cold Brew Immersion', 'Cupping Bowl Standar SCA'],
    characteristics: 'Memungkinkan kontak air lama (4–18 jam) tanpa melepaskan tanin pahit.',
  },
];
