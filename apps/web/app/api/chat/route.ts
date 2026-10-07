import { NextRequest, NextResponse } from 'next/server';
import { getPublishedProducts, toWebCatalogSlug } from '../../../lib/catalog-master';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PUBLISHED_PRODUCTS = getPublishedProducts();

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // --- INPUT GUARDRAILS (Next.js layer, always active) ---
    // 1. Max length — prevents token flooding / prompt stuffing
    if (message.length > 500) {
      return NextResponse.json({
        reply: 'Pertanyaanmu terlalu panjang, kawan seduh. Coba ringkas pertanyaanmu, misalnya: "Kopi fruity untuk V60 apa yang bagus?"',
        recommendedSlugs: [],
        groundedInCatalog: true,
      });
    }

    // 2. Block only prompt injection and clearly harmful requests; ordinary topics stay open.
    const BLOCKED_PHRASES = [
      'ignore previous instructions', 'ignore all instructions',
      'system prompt', 'jailbreak', 'bypass filter', 'bypass guardrail',
      'act as dan', 'you are dan', 'pretend you are', 'roleplay as',
      'drop table', 'select * from', 'insert into', 'delete from', '--',
      'hack akun', 'cara meretas', 'ddos', 'script injection', 'xss payload',
      'cara membuat bom', 'cara membuat senjata',
    ];
    const msgLower = message.toLowerCase();
    const isBlocked = BLOCKED_PHRASES.some((phrase) => msgLower.includes(phrase));
    if (isBlocked) {
      return NextResponse.json({
        reply: 'Maaf, saya tidak dapat membantu permintaan yang mencoba membocorkan sistem, merusak layanan, atau membahayakan orang lain. Saya tetap bisa membantu dengan pertanyaan umum yang aman.',
        recommendedSlugs: [],
        groundedInCatalog: false,
      });
    }

    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';

    // A development reload can briefly make FastAPI unavailable, so retry once before fallback.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const backendRes = await fetch(`${aiBackendUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history }),
          signal: AbortSignal.timeout(25000),
        });

        if (backendRes.ok) {
          const payload = await backendRes.json();
          if (Array.isArray(payload.recommendedSlugs)) {
            payload.recommendedSlugs = payload.recommendedSlugs.map(toWebCatalogSlug);
          }
          return NextResponse.json(payload);
        }
      } catch {
        // Retry once, then let the explicit local fallback handle a real outage.
      }
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }

    const localScopeTerms = [
      '52 coffee', 'kopi', 'coffee', 'beans', 'biji', 'espresso', 'v60', 'seduh', 'roast',
      'katalog', 'produk', 'tasting', 'rasa', 'byob', 'blend', 'coffee lab', 'wholesale',
      'partnership', 'kemitraan', 'checkout', 'keranjang', 'harga', 'halo', 'hello', 'hai',
    ];
    const localQuery = message.toLowerCase();
    if (!localScopeTerms.some((term) => localQuery.includes(term))) {
      return NextResponse.json({
        reply: 'Maaf, layanan AI dan pencarian web sedang tidak tersedia. Silakan coba lagi sebentar lagi.',
        recommendedSlugs: [],
        sources: [],
        groundedInCatalog: false,
        guardrailStatus: 'backend_unavailable',
      });
    }

    // Comprehensive Context-Aware Built-in Barista Intelligence
    const query = message.toLowerCase().trim();
    const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
    let reply = '';
    const recommendedSlugs: string[] = [];

    // --- PRIORITY 0A: BYOB / BUILD YOUR OWN BLEND / RACIK BLEND / CUSTOM BLEND ---
    if (
      query.includes('byob') ||
      query.includes('by ob') ||
      query.includes('build your own') ||
      query.includes('custom blend') ||
      query.includes('racik blend') ||
      query.includes('racik kopi') ||
      query.includes('campur kopi') ||
      query.includes('blend builder') ||
      (query.includes('blend') && (query.includes('racik') || query.includes('buat') || query.includes('bikin') || query.includes('rekomendasi') || query.includes('rekomen') || query.includes('apa')))
    ) {
      recommendedSlugs.push(
        'dampit-natural-espresso',
        'kintamani-full-wash-arabica-espresso',
        'brazil-santos-espresso'
      );
      reply = `☕ **BYOB (Build Your Own Blend) Simulator 52 Coffee & Roastery**\n\n` +
        `Fitur BYOB memungkinkan kawan seduh atau pemilik kedai kopi meracik house blend signature sendiri secara langsung di website kami (/blend-builder)!\n\n` +
        `**Spesifikasi Profil Sangrai:**\n` +
        `• Profil Sangrai difokuskan pada **Dark Espresso Roast** — menghasilkan krema tebal, body mantap, dan rasa cokelat manis pekat yang sempurna untuk mesin espresso, moka pot, maupun es kopi susu gula aren.\n\n` +
        `**Rekomendasi Racikan BYOB Terfavorit:**\n` +
        `1. **Classic House Blend (70% Java Ijen + 30% Dampit Robusta)**\n` +
        `   • Harga: **Rp 220.000 / kg** (atau Rp 56.000 / 200g)\n` +
        `   • Rasa: Dark Chocolate tebal, Gula Aren murni, & Crema kokoh.\n` +
        `   • Rekomendasi: Es Kopi Susu kekinian & Cafe Latte.\n\n` +
        `2. **Fruity Caramel Espresso (70% Java Ijen + 30% Arjuna Budug Asu)**\n` +
        `   • Harga: **Rp 253.000 / kg** (atau Rp 62.000 / 200g)\n` +
        `   • Rasa: Jeruk Tangerine segar, Sweet Caramel, & body bersih.\n` +
        `   • Rekomendasi: Americano segar & Hot Cappuccino aromatik.\n\n` +
        `3. **Heritage Balanced Blend (50% Gayo + 30% Kintamani + 20% Dampit Robusta)**\n` +
        `   • Harga: **Rp 245.000 / kg**\n` +
        `   • Rasa: Sweet Cocoa, Earthy spices, & aftertaste panjang.\n\n` +
        `Kamu bisa langsung mencoba menyimulasikan rasio persentase dan melihat kalkulasi harga real-time di halaman **[Custom Blend Simulator (BYOB)](/blend-builder)**!`;
    }

    // --- PRIORITY 0B: PRICE CALCULATOR / KALKULATOR HARGA / HPP / COGS ---
    else if (
      query.includes('price calculator') ||
      query.includes('kalkulator harga') ||
      query.includes('kalkulator hpp') ||
      query.includes('hitung hpp') ||
      query.includes('hitung harga') ||
      query.includes('cogs') ||
      query.includes('margin') ||
      query.includes('susut') ||
      (query.includes('kalkulator') && !query.includes('seduh') && !query.includes('brew'))
    ) {
      reply = `📊 **Kalkulator Harga Jual Kedai**\n\n` +
        `Tool ini di /tools/price-calculator membantu pemilik kedai kopi, roaster pemula, dan pelaku bisnis F&B menghitung estimasi biaya per cangkir, harga jual, margin, serta kebutuhan pasokan.\n\n` +
        `Masukkan harga biji, dosis, biaya bahan tambahan, dan target harga jual bisnis Anda sendiri. Hasilnya dapat dipakai sebagai bahan diskusi kebutuhan pasokan B2B.\n\n` +
        `Kamu bisa mencoba simulasi di **[Kalkulator Harga Jual Kedai](/tools/price-calculator)**!`;
    }

    // --- PRIORITY 0C: BREW CALCULATOR & PANDUAN SEDUH ---
    else if (
      query.includes('brew calculator') ||
      query.includes('kalkulator seduh') ||
      query.includes('kalkulator v60') ||
      query.includes('rasio seduh') ||
      query.includes('panduan seduh') ||
      query.includes('brew guide') ||
      query.includes('resep seduh') ||
      query.includes('resep v60')
    ) {
      recommendedSlugs.push(
        'argopuro-walida-anaerob-arcapada',
        'sindoro-strawberry-selai'
      );
      reply = `⏱️ **Panduan & Kalkulator Seduh Presisi 52 Coffee**\n\n` +
        `Untuk menghasilkan cangkir seduhan yang seimbang, manis maksimal, dan bebas over-ekstraksi, gunakan **[Panduan & Kalkulator Seduh](/guide)** dalam satu halaman.\n\n` +
        `**Panduan Standar Seduh V60 52 Roastery:**\n` +
        `• **Dosis Biji**: 15 gram (Giling Medium - sehalus pasir pantai)\n` +
        `• **Air Seduh**: 225 ml (Rasio 1:15), Suhu 91°C - 93°C\n` +
        `• **Tahap Penuangan (3 Pours)**:\n` +
        `  1. *Bloom*: 45 ml air, tunggu 40 detik untuk degassing aroma kopi.\n` +
        `  2. *First Pour*: Tuang spiral perlahan hingga 135 ml (di detik 00:45).\n` +
        `  3. *Final Pour*: Tuang perlahan di tengah hingga 225 ml (di detik 01:20).\n` +
        `• **Target Total Time (Drawdown)**: 02:15 - 02:30 menit.\n\n` +
        `Coba gunakan **[Panduan & Kalkulator Seduh Interaktif](/guide)** untuk menghitung otomatis takaran air sekaligus mengikuti timer dan tahap penyeduhan!`;
    }

    // --- PRIORITY 0D: LOKASI / ALAMAT / JAM BUKA / KONTAK MALANG ---
    else if (
      query.includes('lokasi') ||
      query.includes('alamat') ||
      query.includes('dimana') ||
      query.includes('di mana') ||
      query.includes('tempat') ||
      query.includes('tasting room') ||
      query.includes('slowbar') ||
      query.includes('jam buka') ||
      query.includes('buka jam') ||
      query.includes('operasional') ||
      query.includes('kontak') ||
      query.includes('instagram') ||
      query.includes('telepon') ||
      query.includes('wa') ||
      query.includes('whatsapp')
    ) {
      reply = `📍 **Lokasi & Jam Operasional 52 Coffee & Roastery Malang**\n\n` +
        `• **Alamat Roastery & Tasting Room**:\n` +
        `  Jl. KH. Agus Salim No. 11, Kel. Sukoharjo, Kec. Klojen, Kota Malang, Jawa Timur 65118 (Dekat Alun-Alun & Pasar Besar Malang).\n\n` +
        `• **Jam Buka Slowbar & Tasting Room**:\n` +
        `  Senin - Minggu: **10.00 - 20.00 WIB**.\n\n` +
        `• **Kontak Resmi & Media Sosial**:\n` +
        `  • Instagram: **@52coffeeroastery**\n` +
        `  • Website: 52coffeeroastery.com\n` +
        `  • Layanan Pengiriman: SiCepat, JNE, GoSend/GrabExpress se-Kota Malang.\n\n` +
        `Kawan seduh dipersilakan mampir ke Slowbar kami untuk mencicipi kurasi origin mingguan atau berkonsultasi seputar beans kedai kopi!`;
    }

    // --- PRIORITY 0E: B2B WHOLESALE / KEMITRAAN KEDAI / MAKLON ---
    else if (
      query.includes('wholesale') ||
      query.includes('b2b') ||
      query.includes('kedai kopi') ||
      query.includes('cafe') ||
      query.includes('kemitraan') ||
      query.includes('maklon') ||
      query.includes('white label') ||
      query.includes('suplai') ||
      query.includes('supply') ||
      query.includes('konsultasi') ||
      query.includes('work with us')
    ) {
      recommendedSlugs.push(
        'dampit-natural-espresso',
        'kintamani-full-wash-arabica-espresso',
        'brazil-santos-espresso'
      );
      reply = `🤝 **Kemitraan Bisnis 52 Coffee & Roastery**\n\n` +
        `Kami dapat membantu kebutuhan **supplier roast beans**, **label khusus & special blends**, serta **business beverage consultation** (SOP, supply mesin, layout coffee bar, perhitungan HPP, dan signature blend).\n\n` +
        `Ceritakan kebutuhan usaha Anda melalui **[Kemitraan Bisnis](/work-with-us)**. Pilih jalur Consultations atau Wholesale & Partnership untuk menyiapkan pesan WhatsApp.`;
    }

    // --- PRIORITY 0F: TRACK ORDER / LACAK RESI ---
    else if (
      query.includes('track') ||
      query.includes('lacak') ||
      query.includes('resi') ||
      query.includes('status pesanan') ||
      query.includes('sampai mana')
    ) {
      reply = `Status pelacakan pesanan belum tersedia di website ini. Checkout saat ini masih simulasi, jadi tidak ada resi atau pesanan nyata yang diproses.`;
    }

    // --- PRIORITY 1: LAMBUNG / MAAG / GERD / RINGAN / LOW ACID / AMAN ---
    else if (
      query.includes('lambung') ||
      query.includes('maag') ||
      query.includes('gerd') ||
      query.includes('asam lambung') ||
      query.includes('perut') ||
      query.includes('sensitif') ||
      query.includes('ringan') ||
      query.includes('low acid') ||
      query.includes('tidak asam') ||
      query.includes('nggak asam') ||
      query.includes('gak asam') ||
      query.includes('kurang asam') ||
      query.includes('enteng') ||
      query.includes('lembut') ||
      query.includes('smooth') ||
      query.includes('mild')
    ) {
      if (
        query.includes('strong') ||
        query.includes('pekat') ||
        query.includes('tebal') ||
        query.includes('bold') ||
        query.includes('pahit') ||
        query.includes('mantap')
      ) {
        recommendedSlugs.push(
          'brazil-santos-espresso',
          'kintamani-full-wash-arabica-espresso',
          'dampit-natural-espresso'
        );
        reply = `Tidak ada kopi yang dapat dijamin aman untuk maag atau GERD karena respons setiap orang berbeda. Jika kamu tetap ingin karakter **strong dan tebal dengan persepsi rasa asam lebih ringan**, pertimbangkan:\n\n` +
          `1. Brazil Santos (Arabica Medium-Dark Roast)\n` +
          `   • Rasa: Dark Chocolate tebal, Roasted Peanut gurih, & Caramel manis.\n` +
          `   • Karakter sensorik: acidity rendah di lidah; ini bukan jaminan respons lambung.\n\n` +
          `2. Kintamani Full Wash (Arabica Medium Roast)\n` +
          `   • Rasa: Sweet Chocolate halus dengan aftertaste bersih.\n` +
          `   • Karakter sensorik: body seimbang dan rasa relatif lembut.\n\n` +
          `3. Dampit Natural Espresso (Fine Robusta Malang)\n` +
          `   • Cocok untuk Kopi Susu / Latte, tetapi kandungan kafeinnya tetap perlu dipertimbangkan.\n\n` +
          `Mulai dari porsi kecil dan hindari minum saat perut kosong. Jika kamu memiliki GERD atau gejala berulang, ikuti saran tenaga kesehatan.`;
      } else {
        recommendedSlugs.push(
          'kintamani-full-wash-arabica-espresso',
          'ijen-yellow-bourbon-kencana',
          'sumbing-supernova-celestia'
        );
        reply = `Tidak ada kopi yang dapat dijamin aman untuk maag atau GERD karena respons setiap orang berbeda. Jika yang dicari adalah **karakter rasa dengan persepsi asam lebih ringan**, berikut opsi sensorik kami:\n\n` +
          `1. Kintamani Full Wash (Arabica Medium Roast)\n` +
          `   • Rasa: Sweet Chocolate, hint Citrus lembut, dan aftertaste manis bersih.\n` +
          `   • Karakter sensorik: body seimbang dan rasa relatif lembut.\n\n` +
          `2. Ijen Yellow Bourbon (Honey Process)\n` +
          `   • Rasa: Manis Madu hutan alami & Gurih Kacang Almond panggang.\n` +
          `   • Karakter sensorik: acidity rendah di lidah dengan body halus.\n\n` +
          `3. Java Exotic Sumbing Deep Washed\n` +
          `   • Rasa: Brown Sugar hangat, Red Apple manis, & Black Tea halus.\n` +
          `   • Karakter sensorik: clean cup dengan body medium.\n\n` +
          `Acidity sebagai atribut rasa tidak sama dengan keamanan medis. Mulai dari porsi kecil, hindari minum saat perut kosong, dan ikuti saran tenaga kesehatan jika kamu memiliki GERD atau gejala berulang.`;
      }
    }

    // --- PRIORITY 2: FRUITY / STRAWBERRY / BUAH EXOTIC ---
    else if (
      query.includes('fruity') ||
      query.includes('buah') ||
      query.includes('stroberi') ||
      query.includes('strawberry') ||
      query.includes('berry') ||
      query.includes('nanas') ||
      query.includes('peach') ||
      query.includes('mangga') ||
      query.includes('lychee') ||
      query.includes('leci') ||
      query.includes('plum') ||
      query.includes('cherry')
    ) {
      recommendedSlugs.push(
        'sindoro-strawberry-selai',
        'argopuro-walida-anaerob-arcapada',
        'puntang-natural-aromanis'
      );
      reply = `Untuk kawan seduh yang menyukai karakter Fruity & Juicy:\n\n` +
        `1. Sindoro Strawberry Triple Yeast: Fermentasi ragi ganda dengan aroma selai stroberi kental & vanili hangat.\n` +
        `2. Argopuro Walida Natural Anaerobic: Karakter plum merah juicy, kesegaran blood orange, dan aftertaste dark cherry.\n` +
        `3. Puntang Natural: Ledakan nanas matang, berry liar, dan harum semerbak nangka.\n\n` +
        `Tips Seduh: Gunakan dripper V60 atau Origami pada suhu 91°C rasio 1:15 untuk mengeluarkan rasa manis buah secara maksimal.`;
    }

    // --- PRIORITY 3: FLORAL / JASMINE / MELATI / TEA-LIKE ---
    else if (
      query.includes('floral') ||
      query.includes('melati') ||
      query.includes('jasmine') ||
      query.includes('bunga') ||
      query.includes('tea-like') ||
      query.includes('teh') ||
      query.includes('bergamot')
    ) {
      recommendedSlugs.push(
        'el-triunfo-geisha-tolima-aurora',
        'ijen-carbonic-maceration-asmara',
        'prau-natural-el-davisio-surya'
      );
      reply = `Untuk aroma Floral Elegan & Bersih (Tea-Like):\n\n` +
        `1. El Triunfo Geisha Tolima (Colombia): Puncak keanggunan aroma melati semerbak, bergamot earl grey, dan kelembutan teh persik.\n` +
        `2. Ijen Carbonic Maceration: Biji lokal Jawa Timur dengan keharuman jasmine alami dan manisnya peach.\n` +
        `3. Prau Natural Secret Project: Bunga lily putih berpadu permen stroberi dari dataran tinggi Wonosobo (2.000 MASL).\n\n` +
        `Tips Seduh: Seduh pada rasio 1:16 dengan air bersuhu 90-92°C agar aroma floranya merekah sempurna.`;
    }

    // --- PRIORITY 4: MANUAL BREW / FILTER / V60 ---
    else if (
      cleanQuery === 'manual' ||
      cleanQuery === 'manual brew' ||
      cleanQuery === 'filter' ||
      cleanQuery === 'filter brew' ||
      cleanQuery === 'seduh manual' ||
      cleanQuery === 'v60' ||
      cleanQuery === 'pour over' ||
      cleanQuery === '1' ||
      cleanQuery === 'opsi 1' ||
      query.includes('manual brew') ||
      query.includes('seduh manual') ||
      (query.includes('manual') && !query.includes('buku')) ||
      (query.includes('filter') && !query.includes('roast'))
    ) {
      recommendedSlugs.push(
        'argopuro-walida-anaerob-arcapada',
        'sindoro-strawberry-selai',
        'ijen-carbonic-maceration-asmara'
      );
      reply = `Untuk seduhan Filter Manual Brew (V60, Kalita Wave, Aeropress, Origami), 3 kurasi terbaik kami:\n\n` +
        `1. Argopuro Walida Natural Anaerobic (New Release)\n` +
        `   • Notes: Plum matang, Blood Orange segar, & Dark Cherry juicy.\n\n` +
        `2. Sindoro Strawberry Triple Yeast (Exotic Best Seller)\n` +
        `   • Notes: Selai Stroberi kental manis & Vanilla hangat.\n\n` +
        `3. Ijen Carbonic Maceration (Signature Roastery)\n` +
        `   • Notes: Peach matang & bunga Melati (Jasmine) floral.\n\n` +
        `Rekomendasi Seduh V60: Dosis 15g kopi, 225ml air suhu 91°C-92°C, rasio 1:15 dengan waktu drawdown 2m 15s.`;
    }

    // --- PRIORITY 5: ESPRESSO / KOPI SUSU / ROBUSTA / CREMA ---
    else if (
      cleanQuery === 'kopi susu' ||
      cleanQuery === 'es kopi susu' ||
      cleanQuery === 'espresso' ||
      cleanQuery === 'susu' ||
      cleanQuery === 'latte' ||
      cleanQuery === '2' ||
      cleanQuery === 'opsi 2' ||
      query.includes('kopi susu') ||
      query.includes('es kopi susu') ||
      query.includes('espresso') ||
      query.includes('latte') ||
      query.includes('moka pot') ||
      query.includes('dampit') ||
      query.includes('robusta')
    ) {
      recommendedSlugs.push(
        'dampit-natural-espresso',
        'kintamani-full-wash-arabica-espresso',
        'brazil-santos-espresso'
      );
      reply = `Untuk kebutuhan Espresso Mesin, Moka Pot, & Es Kopi Susu Gula Aren:\n\n` +
        `1. Dampit Natural (Fine Robusta Malang)\n` +
        `   • Notes: Dark Chocolate tebal, Gula Aren murni, & Crema kokoh.\n` +
        `   • Cocok Untuk: Es kopi susu kekinian yang mantap tanpa rasa langu.\n\n` +
        `2. Kintamani Full Wash (Arabica)\n` +
        `   • Notes: Sweet Chocolate & Citrus segar halus.\n` +
        `   • Cocok Untuk: Hot Latte, Cappuccino, atau Americano yang seimbang.\n\n` +
        `3. Brazil Santos (Arabica)\n` +
        `   • Notes: Roasted Peanut, Nutty, & hint Caramel.\n\n` +
        `Resep Es Kopi Susu 52: 18g double espresso (36ml) + 120ml susu fresh + 20ml gula aren cair.`;
    }

    // --- PRIORITY 6: RESERVE / GEISHA / SIDRA / KOMPETISI ---
    else if (
      cleanQuery === 'reserve' ||
      cleanQuery === 'grand reserve' ||
      cleanQuery === 'geisha' ||
      cleanQuery === 'sidra' ||
      cleanQuery === '3' ||
      cleanQuery === 'opsi 3' ||
      query.includes('grand reserve') ||
      query.includes('geisha') ||
      query.includes('sidra') ||
      query.includes('colombia') ||
      query.includes('yaman') ||
      query.includes('yemen') ||
      query.includes('kompetisi')
    ) {
      recommendedSlugs.push(
        'magnum-sidra-el-vergel-soberano',
        'el-triunfo-geisha-tolima-aurora',
        'yemen-haraz-golden-harvest-sahara'
      );
      reply = `Lini Grand Reserve Micro-Lot menghadirkan kopi langka standar kompetisi dunia:\n\n` +
        `1. El Triunfo Geisha Tolima (Colombia)\n` +
        `   • Notes: Melati semerbak, Bergamot Earl Grey, & Peach tea.\n\n` +
        `2. Magnum Sidra El Vergel Cauca (Colombia)\n` +
        `   • Notes: Buah tropis lebat, Sirup manis, & Koji Fermentation.\n\n` +
        `3. Yemen Haraz Golden Harvest\n` +
        `   • Notes: Biji purba Haraz dengan rasa selai stroberi pekat & rempah manis.\n\n` +
        `Tersedia dalam ukuran 50g dan 200g Pouch.`;
    }

    // --- PRIORITY 7: NON-COFFEE / MINUMAN LAIN ---
    else if (
      query.includes('selain kopi') ||
      query.includes('non coffee') ||
      query.includes('non-coffee') ||
      query.includes('bukan kopi') ||
      query.includes('matcha') ||
      query.includes('cokelat') ||
      query.includes('chocolate') ||
      query.includes('mocktail')
    ) {
      reply = `Di Tasting Room & Bar 52 Coffee Malang, kami menyediakan ragam minuman non-coffee spesial:\n\n` +
        `1. Artisan Chocolate: Cokelat pekat pilihan yang gurih, creamy, dan manis pas.\n` +
        `2. Japanese Matcha Latte: Matcha otentik dengan susu segar creamy.\n` +
        `3. Refreshing Fruit Mocktails: Sari buah alami dengan sensasi soda dingin.\n` +
        `4. Artisan Tea & Cascara: Teh kulit ceri kopi organik kaya antioksidan.`;
    }

    // --- PRIORITY 8: PROMO / DISKON / ONGKIR ---
    else if (
      query.includes('promo') ||
      query.includes('diskon') ||
      query.includes('voucher') ||
      query.includes('kupon') ||
      query.includes('ongkir') ||
      query.includes('gratis ongkir')
    ) {
      reply = `Promo & Penawaran Spesial 52 Coffee & Roastery:\n\n` +
        `1. Diskon 10%: Gunakan kode voucher '52COFFEE' di halaman Checkout!\n` +
        `2. Gratis Ongkir: Otomatis aktif untuk pembelanjaan minimal Rp 250.000 ke seluruh Indonesia.\n` +
        `3. Pengiriman Cepat: Didukung oleh JNE, SiCepat, dan Kurir Instan (GoSend/Grab) di Malang.`;
    }

    // --- PRIORITY 9: GENERAL BEST SELLER / RECOMMENDATIONS ---
    else if (
      query.includes('rekomendasi') ||
      query.includes('rekomen') ||
      query.includes('best seller') ||
      query.includes('bestseller') ||
      query.includes('terlaris') ||
      query.includes('favorit') ||
      query.includes('populer') ||
      query.includes('paling enak')
    ) {
      recommendedSlugs.push(
        'argopuro-walida-anaerob-arcapada',
        'sindoro-strawberry-selai',
        'dampit-natural-espresso'
      );
      reply = `Berikut Rekomendasi Biji Kopi Terfavorit di 52 Coffee & Roastery:\n\n` +
        `1. Argopuro Walida Natural Anaerobic (Filter V60)\n` +
        `   • Rasa: Plum manis, Blood Orange segar, dan Dark Cherry juicy.\n\n` +
        `2. Sindoro Strawberry Triple Yeast (Filter V60)\n` +
        `   • Rasa: Selai Stroberi kental manis dengan aroma Vanilla hangat.\n\n` +
        `3. Dampit Natural Fine Robusta Malang (Espresso / Kopi Susu)\n` +
        `   • Rasa: Dark Chocolate tebal & gula aren murni dengan crema kokoh.\n\n` +
        `Apakah kamu lebih menyukai seduhan Manual Brew (V60), Racik BYOB Blend, atau Kopi Susu / Espresso?`;
    }

    // --- PRIORITY 10: GREETINGS & SALAM ---
    else if (
      query === 'hello' ||
      query === 'halo' ||
      query === 'hai' ||
      query === 'hi' ||
      query.startsWith('halo') ||
      query.startsWith('hai')
    ) {
      recommendedSlugs.push(
        'argopuro-walida-anaerob-arcapada',
        'sindoro-strawberry-selai'
      );
      reply = `Halo kawan seduh! Selamat datang di 52 Coffee & Roastery Malang.\n\n` +
        `Saya siap membantu memilihkan biji kopi yang paling cocok dengan selera seduhmu. Kamu bisa menanyakan:\n\n` +
        `• B.Y.O.B Simulator (Racik House Blend sendiri dengan Dark Espresso Roast)\n` +
        `• Kopi dengan persepsi asam lebih ringan (Kintamani / Ijen Yellow Bourbon)\n` +
        `• Koleksi Filter Fruity & Floral (Argopuro Walida / Sindoro Strawberry)\n` +
        `• Biji Espresso & Kopi Susu Aren (Dampit Robusta)\n` +
        `• Price Calculator & Panduan Seduh V60 Presisi\n\n` +
        `Profil rasa atau topik apa yang ingin kamu eksplorasi hari ini?`;
    }

    // --- PRIORITY 11: CHECKOUT / CARA BELI / PESAN ---
    else if (
      query.includes('checkout') ||
      query.includes('check out') ||
      query.includes('beli') ||
      query.includes('pesan') ||
      query.includes('order') ||
      query.includes('bayar')
    ) {
      recommendedSlugs.push(
        'argopuro-walida-anaerob-arcapada',
        'sindoro-strawberry-selai'
      );
      reply = `Saat ini saya belum bisa memproses pembayaran langsung dari dalam balon chat, kawan seduh. Namun kamu bisa checkout dengan sangat mudah:\n\n` +
        `1. Klik tombol **+ Cart** pada kartu produk rekomendasi di bawah obrolan ini.\n` +
        `2. Buka keranjang belanja lewat **ikon keranjang** di pojok kanan atas.\n` +
        `3. Klik tombol **Lanjut ke Checkout**.\n` +
        `4. Masukkan kode voucher promo **52COFFEE** untuk diskon 10%!\n\n` +
        `Gratis Ongkir otomatis aktif untuk pembelian minimal Rp 250.000 ke seluruh Indonesia. Apakah ada biji kopi favorit yang ingin kamu pesan sekarang?`;
    }

    // --- DEFAULT FALLBACK ---
    else {
      recommendedSlugs.push(
        'kintamani-full-wash-arabica-espresso',
        'argopuro-walida-anaerob-arcapada'
      );
      reply = `Di 52 Coffee & Roastery Malang, kami menyangrai aneka pilihan biji kopi artisanal segar dalam batch kecil.\n\n` +
        `Kamu bisa mengeksplorasi:\n` +
        `1. **B.Y.O.B Blend Simulator** (/blend-builder) — Racik house blend Dark Espresso custom.\n` +
        `2. **Kopi dengan persepsi asam lebih ringan** — Kintamani Full Wash & Ijen Yellow Bourbon.\n` +
        `3. **Filter Fruity & Floral** — Argopuro Walida & Sindoro Strawberry.\n` +
        `4. **Espresso & Kopi Susu** — Dampit Robusta & Brazil Santos.\n` +
        `5. **Kalkulator HPP & Panduan Seduh** — Simulasi biaya di Price Calculator serta rasio dan timer seduh di /guide.\n\n` +
        `Ceritakan profil rasa atau metode seduh yang kamu inginkan, dan saya akan merekomendasikan pilihan terbaik!`;
    }

    return NextResponse.json({
      reply,
      recommendedSlugs,
      groundedInCatalog: true,
    });
  } catch (error: any) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json(
      {
        reply: 'Halo kawan seduh! Saya siap membantu merekomendasikan biji kopi terbaik dari roastery kami di Malang. Ingin profil rasa fruity, floral, kopi susu, atau yang ringan di lambung?',
        recommendedSlugs: ['argopuro-walida-anaerob-arcapada', 'kintamani-full-wash-arabica-espresso'],
      },
      { status: 200 }
    );
  }
}
