import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS, CoffeeProduct } from '../../../lib/data';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || 'AQ.Ab8RN6Ia3HCdpIY36WQhDt7NV88YtlZgmedNZvjjlPeRCSCLBA';

    // 1. Attempt to call Google Gemini API directly if GEMINI_API_KEY is available
    if (geminiApiKey) {
      try {
        const catalogContext = PRODUCTS.map((p) =>
          `• [${p.name}] (Slug: ${p.slug}, Series: ${p.series}, Category: ${p.categoryLabel}, Process: ${p.process}, Roast: ${p.roastLevel}, Notes: ${p.tastingNotes.join(', ')}, Price: Rp ${p.basePrice}/${p.defaultWeight})`
        ).join('\n');

        const systemPrompt = `Kamu adalah Virtual Barista ramah & ahli dari 52 Coffee & Roastery (Instagram: @52coffeeroastery), roastery artisanal yang menyangrai biji kopi dalam kelompok kecil (small-batch) di Jl. KH. Agus Salim No. 11 Malang, Jawa Timur (Jam Buka: 10.00-20.00 WIB).
Voucher promo: '52COFFEE' (10% OFF), Gratis Ongkir min. Rp 250.000.

Katalog Biji Kopi Tersedia:
${catalogContext}

Panduan Barista:
- Jawablah dengan ramah, hangat, antusias, dan profesional dalam bahasa Indonesia.
- Jika pengguna bertanya tentang rekomendasi umum, tanyakan preferensi atau langsung rekomendasikan kopi unggulan (Argopuro Walida, Sindoro Strawberry, Ijen Carbonic Maceration).
- Jika pengguna bertanya tentang minuman selain kopi (non-coffee), jelaskan bahwa di bar/kedai 52 Coffee Malang tersedia Artisan Chocolate, Japanese Matcha Latte, Artisan Tea, dan Refreshing Fruit Mocktails.
- Jika pengguna menjawab 'manual' / 'filter', rekomendasikan lini Single Origin filter (Argopuro Walida, Sindoro Strawberry, Puntang Natural, Ijen CM) beserta tips seduh V60.
- Jika pengguna menjawab 'kopi susu' / 'espresso', rekomendasikan Dampit Fine Robusta Malang, Kintamani Arabica, atau Brazil Santos.
- Berikan rekomendasi yang ringkas, terstruktur, dan sebutkan tasting notes serta cara seduh terbaiknya.`;

        const geminiHistory = (history || []).slice(-6).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        }));

        const targetModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash'];
        let generatedText = '';

        for (const modelName of targetModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: 'Siap! Saya adalah Virtual Barista 52 Coffee & Roastery Malang.' }] },
                    ...geminiHistory,
                    { role: 'user', parts: [{ text: message }] },
                  ],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 900,
                  },
                }),
                signal: AbortSignal.timeout(7000),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const parts = geminiData.candidates?.[0]?.content?.parts;
              generatedText = Array.isArray(parts)
                ? parts.map((p: any) => p.text).filter(Boolean).join('\n')
                : geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

              if (generatedText) break;
            }
          } catch (modelErr) {
            // Try next fast model in cascade
          }
        }

        if (generatedText) {
          // Find mentioned products in generated text
          const lowerText = (generatedText + ' ' + message).toLowerCase();
          const recommendedSlugs = PRODUCTS.filter((p) =>
            lowerText.includes(p.name.toLowerCase()) ||
            lowerText.includes(p.slug.toLowerCase()) ||
            p.tastingNotes.some((n) => lowerText.includes(n.toLowerCase()))
          ).slice(0, 3).map((p) => p.slug);

          return NextResponse.json({
            reply: generatedText,
            recommendedSlugs: recommendedSlugs.length > 0 ? recommendedSlugs : ['argopuro-walida-natural-anaerobic', 'sindoro-strawberry-triple-yeast'],
            groundedInCatalog: true,
          });
        }
      } catch (geminiErr: any) {
        console.error('Gemini API Error in route:', geminiErr?.message || geminiErr);
        // Fall through to local engine
      }
    }

    // 2. Attempt to contact Python FastAPI backend if running
    try {
      const backendRes = await fetch(`${aiBackendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: AbortSignal.timeout(2500),
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
    } catch (e) {
      // Backend not running, execute comprehensive built-in barista knowledge engine
    }

    // 3. Comprehensive Multi-Turn Context-Aware Barista Engine
    const query = message.toLowerCase().trim();
    const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
    let reply = '';
    const recommendedSlugs: string[] = [];

    // --- CASE A: USER REPLIES "MANUAL" / "FILTER" / "1" ---
    if (
      cleanQuery === 'manual' ||
      cleanQuery === 'manual brew' ||
      cleanQuery === 'filter' ||
      cleanQuery === 'filter brew' ||
      cleanQuery === 'seduh manual' ||
      cleanQuery === 'v60' ||
      cleanQuery === 'pour over' ||
      cleanQuery === '1' ||
      cleanQuery === 'opsi 1' ||
      cleanQuery === 'nomor 1' ||
      query.includes('manual brew') ||
      query.includes('seduh manual') ||
      (query.includes('manual') && !query.includes('buku') && !query.includes('manual book')) ||
      (query.includes('filter') && !query.includes('roast'))
    ) {
      recommendedSlugs.push(
        'argopuro-walida-natural-anaerobic',
        'sindoro-strawberry-triple-yeast',
        'ijen-carbonic-maceration'
      );
      reply = `Untuk seduhan Filter Manual Brew (V60, Kalita Wave, Aeropress, Origami), kami punya 3 kurasi terbaik yang sangat kaya rasa:\n\n` +
        `1. Argopuro Walida Natural Anaerobic (Hot New Release)\n` +
        `   • Notes: Plum matang, Blood Orange segar, & Dark Cherry juicy.\n` +
        `   • Karakter: Sangat manis buah dengan clarity tinggi.\n\n` +
        `2. Sindoro Strawberry Triple Yeast (Exotic Best Seller)\n` +
        `   • Notes: Selai Stroberi kental manis & Vanilla hangat.\n` +
        `   • Karakter: Aroma stroberi yang merekah begitu diseduh.\n\n` +
        `3. Ijen Carbonic Maceration (Signature Roastery)\n` +
        `   • Notes: Peach matang & bunga Melati (Jasmine) elegan.\n` +
        `   • Karakter: Lembut, floral, dan aftertaste manis panjang.\n\n` +
        `Rekomendasi Seduh V60: Dosis 15g kopi, 225ml air suhu 91°C-92°C, rasio 1:15 dengan waktu ekstraksi 2m 15s.`;
    }

    // --- CASE B: USER REPLIES "KOPI SUSU" / "ESPRESSO" / "2" ---
    else if (
      cleanQuery === 'kopi susu' ||
      cleanQuery === 'es kopi susu' ||
      cleanQuery === 'espresso' ||
      cleanQuery === 'susu' ||
      cleanQuery === 'latte' ||
      cleanQuery === '2' ||
      cleanQuery === 'opsi 2' ||
      cleanQuery === 'nomor 2' ||
      query.includes('kopi susu') ||
      query.includes('es kopi susu') ||
      query.includes('espresso') ||
      query.includes('latte') ||
      query.includes('moka pot') ||
      query.includes('dampit') ||
      query.includes('robusta')
    ) {
      recommendedSlugs.push(
        'dampit-natural-robusta',
        'kintamani-full-wash-arabica',
        'brazil-santos-arabica'
      );
      reply = `Untuk kebutuhan Espresso Mesin, Moka Pot, & Es Kopi Susu Gula Aren, rekomendasi terbaik dari roastery kami:\n\n` +
        `1. Dampit Natural (Fine Robusta Malang)\n` +
        `   • Notes: Dark Chocolate tebal, Gula Aren murni, & Crema kokoh.\n` +
        `   • Cocok Untuk: Es kopi susu aren kekinian yang mantap tanpa rasa langu.\n\n` +
        `2. Kintamani Full Wash (Arabica)\n` +
        `   • Notes: Sweet Chocolate & Citrus segar halus.\n` +
        `   • Cocok Untuk: Hot Latte, Cappuccino, atau Americano yang seimbang.\n\n` +
        `3. Brazil Santos (Arabica)\n` +
        `   • Notes: Roasted Peanut, Nutty, & hint Caramel.\n` +
        `   • Cocok Untuk: Base espresso klasik yang gurih dan smooth.\n\n` +
        `Resep Es Kopi Susu 52: 18g double espresso (36ml) + 120ml susu fresh + 20ml gula aren cair.`;
    }

    // --- CASE C: USER REPLIES "RESERVE" / "GEISHA" / "3" ---
    else if (
      cleanQuery === 'reserve' ||
      cleanQuery === 'grand reserve' ||
      cleanQuery === 'geisha' ||
      cleanQuery === 'sidra' ||
      cleanQuery === '3' ||
      cleanQuery === 'opsi 3' ||
      cleanQuery === 'nomor 3' ||
      query.includes('grand reserve') ||
      query.includes('geisha') ||
      query.includes('sidra') ||
      query.includes('colombia') ||
      query.includes('yaman') ||
      query.includes('yemen') ||
      query.includes('kompetisi')
    ) {
      recommendedSlugs.push(
        'magnum-sidra-el-vergel-cauca',
        'el-triunfo-geisha-tolima',
        'yemen-haraz-golden-harvest'
      );
      reply = `Lini Grand Reserve Micro-Lot menghadirkan kopi langka standar kompetisi dunia:\n\n` +
        `1. El Triunfo Geisha Tolima (Colombia)\n` +
        `   • Notes: Melati surgawi, Bergamot Earl Grey, & Peach tea.\n\n` +
        `2. Magnum Sidra El Vergel Cauca (Colombia)\n` +
        `   • Notes: Buah tropis lebat, Sirup manis, & Layered Cocoa Koji Fermentation.\n\n` +
        `3. Yemen Haraz Golden Harvest\n` +
        `   • Notes: Biji purba Haraz dengan rasa selai stroberi pekat & rempah manis.\n\n` +
        `Tersedia dalam ukuran Tasting Dose (16g), 50g, hingga 200g Pouch.`;
    }

    // --- CASE D: GENERAL RECOMMENDATIONS / BEST SELLERS ---
    else if (
      query.includes('rekomendasi') ||
      query.includes('rekomen') ||
      query.includes('apa yang rekomendasi') ||
      query.includes('ada apa') ||
      query.includes('best seller') ||
      query.includes('bestseller') ||
      query.includes('terlaris') ||
      query.includes('paling laku') ||
      query.includes('favorit') ||
      query.includes('populer') ||
      query.includes('paling enak') ||
      query.includes('saran') ||
      query.includes('rekomendasikan')
    ) {
      recommendedSlugs.push(
        'argopuro-walida-natural-anaerobic',
        'sindoro-strawberry-triple-yeast',
        'dampit-natural-robusta'
      );
      reply = `Berikut adalah Rekomendasi Biji Kopi Paling Populer & Best Seller di 52 Coffee & Roastery:\n\n` +
        `1. Argopuro Walida Natural Anaerobic (Rilisan Terbaru — Filter V60)\n` +
        `   • Rasa: Plum manis, Blood Orange, dan Dark Cherry yang sangat juicy.\n\n` +
        `2. Sindoro Strawberry Triple Yeast (Exotic Series — Filter V60)\n` +
        `   • Rasa: Selai Stroberi kental manis dengan aroma Vanilla hangat.\n\n` +
        `3. Dampit Natural Fine Robusta Malang (Espresso / Kopi Susu)\n` +
        `   • Rasa: Dark Chocolate gurih & gula aren murni dengan crema tebal.\n\n` +
        `Kamu lebih menyukai seduhan Manual Brew (V60) atau Kopi Susu / Espresso?`;
    }

    // --- CASE E: GREETINGS & SALAM ---
    else if (
      query === 'hello' ||
      query === 'halo' ||
      query === 'hai' ||
      query === 'hi' ||
      query === 'hei' ||
      query.startsWith('halo') ||
      query.startsWith('hai') ||
      query.includes('selamat pagi') ||
      query.includes('selamat siang') ||
      query.includes('selamat sore') ||
      query.includes('selamat malam')
    ) {
      recommendedSlugs.push(
        'argopuro-walida-natural-anaerobic',
        'ijen-carbonic-maceration',
        'sindoro-strawberry-triple-yeast'
      );
      reply = `Halo kawan seduh! Selamat datang di 52 Coffee & Roastery Malang ☕✨\n\n` +
        `Saya siap membantu kamu menemukan biji kopi yang paling cocok dengan selera seduhmu hari ini. Kamu bisa tanya tentang:\n\n` +
        `• Koleksi Filter Manual Brew (Fruity, Floral, atau Manis Karamel)\n` +
        `• Biji Kopi untuk Espresso & Es Kopi Susu (Robusta Malang / Kintamani)\n` +
        `• Rilisan Terbaru & Best Seller (Argopuro Walida & Sindoro Strawberry)\n` +
        `• Panduan Rasio Seduh V60 / Aeropress\n\n` +
        `Sedang mencari kopi untuk manual brew atau kopi susu hari ini?`;
    }

    // --- CASE F: FRUITY / STRAWBERRY / BUAH ---
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
      query.includes('leci')
    ) {
      recommendedSlugs.push(
        'sindoro-strawberry-triple-yeast',
        'argopuro-walida-natural-anaerobic',
        'puntang-natural'
      );
      reply = `Untuk kawan seduh yang menyukai karakter Fruity & Juicy, kurasi terbaik dari 52 Coffee adalah:\n\n` +
        `1. Sindoro Strawberry Triple Yeast: Inovasi fermentasi ragi ganda dengan aroma selai stroberi kental & vanili hangat.\n` +
        `2. Argopuro Walida Natural Anaerobic: Karakter plum merah juicy, kesegaran blood orange, dan aftertaste cherry.\n` +
        `3. Puntang Natural: Ledakan nanas matang, berry liar, dan harum semerbak nangka.\n\n` +
        `Tips Seduh Barista: Gunakan rasio 1:15 dengan suhu air 91°C pada dripper V60 atau Origami untuk memaksimalkan rasa manis buahnya!`;
    }

    // --- CASE G: FLORAL / JASMINE / MELATI ---
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
        'el-triunfo-geisha-tolima',
        'ijen-carbonic-maceration',
        'prau-natural-secret-project'
      );
      reply = `Untuk aroma Floral Elegan, Wangi Melati, & Bersih (Tea-Like), pilihan istimewa kami:\n\n` +
        `1. El Triunfo Geisha Tolima (Colombia): Puncak keanggunan aroma melati semerbak, bergamot earl grey, dan kelembutan teh persik.\n` +
        `2. Ijen Carbonic Maceration: Biji lokal Jawa Timur dengan keharuman jasmine alami dan manisnya peach.\n` +
        `3. Prau Natural Secret Project: Bunga putih lily berpadu permen stroberi dari dataran tinggi Wonosobo (2.000 MASL).\n\n` +
        `Tips Seduh: Seduh pada rasio 1:16 dengan air bersuhu 90-92°C agar aroma floranya merekah sempurna.`;
    }

    // --- CASE H: ASAM / TIDAK ASAM / MAAG / LAMBUNG ---
    else if (
      query.includes('tidak asam') ||
      query.includes('nggak asam') ||
      query.includes('gak asam') ||
      query.includes('ramah lambung') ||
      query.includes('maag') ||
      query.includes('asam lambung') ||
      query.includes('low acid') ||
      query.includes('kurang asam')
    ) {
      recommendedSlugs.push(
        'dampit-natural-robusta',
        'ijen-yellow-bourbon',
        'kintamani-full-wash-arabica'
      );
      reply = `Untuk kawan seduh yang mencari kopi dengan Keasaman Rendah (Low Acidity) & Ramah di Lambung:\n\n` +
        `1. Dampit Natural Fine Robusta: Tingkat keasaman hampir nol, rasa dominan dark chocolate manis dan gula aren dengan tekstur tebal.\n` +
        `2. Ijen Yellow Bourbon (Honey Process): Arabika dengan keasaman sangat lembut, dominasi rasa madu manis dan gurihnya kacang almond panggang.\n` +
        `3. Kintamani Full Wash (Medium Roast): Bersih dan nyaman di perut dengan aftertaste cocoa manis.\n\n` +
        `Tips: Seduh dengan metode Cold Brew atau French Press pada rasio 1:12 untuk mengekstrak rasa manis tanpa asam berlebih.`;
    }

    // --- CASE I: ARGOPURO / WALIDA ---
    else if (query.includes('argopuro') || query.includes('walida')) {
      recommendedSlugs.push('argopuro-walida-natural-anaerobic');
      reply = `Argopuro Walida Natural Anaerobic adalah rilisan terbaru dari seri Walida di lereng Gunung Argopuro, Jawa Timur (1.300 - 1.600 MASL).\n\n` +
        `• Proses: Natural Anaerobic Fermentation 72 Jam.\n` +
        `• Tasting Notes: Plum, Blood Orange, Dark Cherry, & Juicy Body.\n` +
        `• Harga: Mulai Rp 68.000 (100g) / Rp 128.000 (200g).\n\n` +
        `Karakter rasanya sangat manis seperti buah plum segar dengan keasaman citrus yang bersih dan aftertaste cherry yang bertahan lama di lidah!`;
    }

    // --- CASE J: IJEN SERIES ---
    else if (query.includes('ijen')) {
      recommendedSlugs.push('ijen-carbonic-maceration', 'ijen-lactic', 'ijen-yellow-bourbon');
      reply = `Koleksi Ijen Series merupakan signature 52 Coffee yang dipanen langsung dari lereng kaldera aktif Gunung Ijen (1.400 - 1.600 MASL):\n\n` +
        `• Ijen Carbonic Maceration: Peach & Jasmine floral yang semerbak.\n` +
        `• Ijen Lactic: Mango, Lychee, Lime, dengan tekstur creamy bagai susu cokelat.\n` +
        `• Ijen Yellow Bourbon: Varietal langka dengan kelembutan madu hutan dan kacang almond.\n\n` +
        `Disangrai segar dalam batch kecil di Malang!`;
    }

    // --- CASE K: PROMO / DISKON / VOUCHER / ONGKIR ---
    else if (
      query.includes('promo') ||
      query.includes('diskon') ||
      query.includes('voucher') ||
      query.includes('kupon') ||
      query.includes('ongkir') ||
      query.includes('gratis ongkir') ||
      query.includes('potongan')
    ) {
      reply = `Promo & Penawaran Spesial 52 Coffee & Roastery:\n\n` +
        `1. Diskon 10%: Gunakan kode promo 52COFFEE atau SEDUPRESISI di halaman Checkout!\n` +
        `2. Gratis Ongkir: Otomatis aktif untuk pembelanjaan minimal Rp 250.000 ke seluruh Indonesia.\n` +
        `3. Pengiriman Cepat: Didukung oleh JNE Reguler, SiCepat BEST (Next Day), dan Kurir Instan (GoSend/Grab) khusus area Kota Malang.`;
    }

    // --- CASE K2: NON-COFFEE / MINUMAN SELAIN KOPI ---
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
      reply = `Tentu ada, kawan seduh! Di Tasting Room & Bar 52 Coffee Malang, kami juga menyediakan ragam minuman non-coffee spesial:\n\n` +
        `1. Artisan Chocolate: Cokelat pekat pilihan yang gurih, creamy, dan manisnya pas.\n` +
        `2. Japanese Matcha Latte: Matcha otentik dengan susu segar creamy.\n` +
        `3. Refreshing Fruit Mocktails: Perpaduan ekstrak sari buah alami dengan sensasi soda segar dingin.\n` +
        `4. Artisan Tea: Daun teh pilihan yang wangi dan menenangkan.\n\n` +
        `Kamu juga bisa mencoba cascara tea (seduhan kulit ceri kopi organik) yang kaya antioksidan dan bercita rasa teh kismis manis!`;
    }

    // --- CASE L: LOKASI / ALAMAT / TASTING ROOM / JAM BUKA ---
    else if (
      query.includes('lokasi') ||
      query.includes('alamat') ||
      query.includes('toko') ||
      query.includes('kedai') ||
      query.includes('kafe') ||
      query.includes('cafe') ||
      query.includes('malang') ||
      query.includes('buka') ||
      query.includes('jam') ||
      query.includes('tasting room')
    ) {
      reply = `Lokasi Tasting Room & Roastery 52 Coffee:\n\n` +
        `• Alamat: Jl. KH. Agus Salim No. 11, Sukoharjo, Klojen, Kota Malang, Jawa Timur 65118.\n` +
        `• Jam Operasional: Buka Setiap Hari, pukul 10.00 - 20.00 WIB.\n` +
        `• Layanan: Slowbar manual brew, konsultasi biji kopi, pembelian roasted beans fresh, & cupping session.\n\n` +
        `Kamu juga bisa melihat petunjuk rute di Google Maps melalui tombol di halaman Tentang Kami!`;
    }

    // --- CASE M: RESEP & TEKNIK SEDUH ---
    else if (
      query.includes('resep') ||
      query.includes('rasio') ||
      query.includes('suhu') ||
      query.includes('seduh') ||
      query.includes('kalita') ||
      query.includes('french press') ||
      query.includes('tubruk')
    ) {
      reply = `Berikut resep standar V60 Pour Over Barista 52 Coffee:\n\n` +
        `• Dosis Kopi: 15 gram (Gilingan Medium)\n` +
        `• Volume Air: 225 ml (Rasio 1:15)\n` +
        `• Suhu Air: 91°C - 92°C\n` +
        `• Target Waktu: 2 menit 15 detik\n\n` +
        `Tahapan Tuangan (3 Pours):\n` +
        `1. 00:00 - 00:40: Blooming 45g air, swirl perlahan 5 detik.\n` +
        `2. 00:40 - 01:15: Tuangan kedua melingkar hingga 135g.\n` +
        `3. 01:15 - 02:00: Tuangan ketiga memusat hingga 225g.\n` +
        `4. 02:15: Drawdown selesai, tuang ke server & nikmati aromanya!\n\n` +
        `Coba juga simulator interaktif di menu Brew Calculator kami!`;
    }

    // --- CASE N: HARGA & PILIHAN GRAMASI ---
    else if (query.includes('harga') || query.includes('ukuran') || query.includes('gram') || query.includes('kemasan')) {
      reply = `Pilihan Kemasan & Kisaran Harga di 52 Coffee:\n\n` +
        `• Single Origin Filter Series (100g / 200g / 500g): Rp 59.000 - Rp 139.000 / 100g\n` +
        `• Espresso Roast & Robusta Malang: Rp 55.000 / 250g - Rp 150.000 / 1kg\n` +
        `• Grand Reserve Micro-Lot: Mulai Rp 59.000 (Tasting Dose 16g) hingga Rp 709.000 (200g Pouch)\n\n` +
        `Semua kemasan menggunakan foil pouch dengan one-way degassing valve untuk menjaga kesegaran biji kopi secara optimal!`;
    }

    // --- CASE O: DYNAMIC MATCHING ACROSS PRODUCTS ---
    else {
      const matchedProducts = PRODUCTS.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const originMatch = p.origin.toLowerCase().includes(query) || p.region.toLowerCase().includes(query);
        const noteMatch = p.tastingNotes.some((n) => query.includes(n.toLowerCase()) || n.toLowerCase().includes(query));
        const processMatch = p.process.toLowerCase().includes(query);
        const seriesMatch = p.series.toLowerCase().includes(query);
        return nameMatch || originMatch || noteMatch || processMatch || seriesMatch;
      });

      if (matchedProducts.length > 0) {
        matchedProducts.slice(0, 3).forEach((p) => recommendedSlugs.push(p.slug));
        reply = `Berdasarkan pencarianmu tentang "${message}", berikut biji kopi yang cocok:\n\n` +
          matchedProducts.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} (${p.process})\n   • Notes: ${p.tastingNotes.join(', ')}\n   • Harga: ${p.defaultWeight} — Rp ${p.basePrice.toLocaleString('id-ID')}`).join('\n\n') +
          `\n\nKamu bisa klik tombol "+ Cart" pada kartu di bawah atau buka detailnya untuk melihat panduan seduh!`;
      } else {
        recommendedSlugs.push(
          'argopuro-walida-natural-anaerobic',
          'sindoro-strawberry-triple-yeast',
          'ijen-carbonic-maceration'
        );
        reply = `Senang berdiskusi kopi denganmu! Di 52 Coffee & Roastery, kami menyangrai biji kopi artisanal dalam batch kecil di Malang.\n\n` +
          `Apakah kamu mencari:\n` +
          `1. ☕ Filter Manual Brew (Fruity, Floral, atau Sweet Strawberry)?\n` +
          `2. 🥛 Espresso & Kopi Susu (Dark Chocolate, Gula Aren, Crema Tebal)?\n` +
          `3. 🏆 Grand Reserve Micro-Lot (Colombia Geisha, Sidra, Yaman)?\n\n` +
          `Ketik "manual", "kopi susu", atau aroma favoritmu agar saya pilihkan biji yang paling pas!`;
      }
    }

    // Strip any remaining asterisks
    reply = reply.replace(/\*/g, '');

    return NextResponse.json({
      reply,
      recommendedSlugs,
      groundedInCatalog: true,
    });

    return NextResponse.json({
      reply,
      recommendedSlugs,
      groundedInCatalog: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
