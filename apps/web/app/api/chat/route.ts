import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '../../../lib/data';
import * as fsSync from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getApiKey(): string {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_AI_API_KEY) return process.env.GOOGLE_AI_API_KEY;
  try {
    const envPaths = [
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), '..', '..', '.env.local')
    ];
    for (const p of envPaths) {
      if (fsSync.existsSync(p)) {
        const text = fsSync.readFileSync(p, 'utf8');
        const match = text.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
        if (match) return match[1].trim();
      }
    }
  } catch (e) {}
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const geminiApiKey = getApiKey();

    // 1. Attempt to call Google Gemini API if a valid Gemini API key is configured
    if (geminiApiKey && (geminiApiKey.startsWith('AIzaSy') || geminiApiKey.startsWith('AQ.'))) {
      try {
        const catalogContext = PRODUCTS.map((p) =>
          `• [${p.name}] (Slug: ${p.slug}, Series: ${p.series}, Category: ${p.categoryLabel}, Process: ${p.process}, Roast: ${p.roastLevel}, Notes: ${p.tastingNotes.join(', ')}, Price: Rp ${p.basePrice}/${p.defaultWeight})`
        ).join('\n');

        const systemPrompt = `Kamu adalah Virtual Barista ramah, cerdas, dan ahli dari 52 Coffee & Roastery (Instagram: @52coffeeroastery), roastery artisanal yang menyangrai biji kopi dalam batch kecil di Jl. KH. Agus Salim No. 11 Malang, Jawa Timur (Jam Buka: 10.00-20.00 WIB).
Voucher promo: '52COFFEE' (10% OFF), Gratis Ongkir min. Rp 250.000.

Katalog Biji Kopi Tersedia:
${catalogContext}

Panduan Barista:
- PENTING: Langsung berikan jawaban akhir yang ramah, sopan, dan solutif dalam Bahasa Indonesia. JANGAN PERNAH menyertakan proses berpikir, catatan internal, atau teks seperti '(Self-correction...)' atau 'Let\'s write the response'.
- Jika pengguna bertanya tentang kopi aman untuk lambung / maag / GERD: jelaskan opsi kopi low acidity seperti Kintamani Full Wash dan Ijen Yellow Bourbon, atau metode Cold Brew.
- Jika pengguna bertanya tentang kopi STRONG tapi AMAN DI LAMBUNG: rekomendasikan biji Arabika Specialty low acidity dengan profil dark chocolate/nutty (Brazil Santos atau Kintamani) atau metode Cold Brew pekat dan Kopi Susu (lemak susu melindungi lambung).
- Jika pengguna bertanya tentang checkout / memesan / membeli / bayar: jelaskan bahwa mereka dapat langsung klik tombol '+ Cart' pada kartu produk di bawah chat, lalu klik ikon keranjang di kanan atas untuk menuju halaman Checkout dengan voucher promo '52COFFEE'.
- Jika pengguna bertanya tentang rekomendasi best seller: rekomendasikan Argopuro Walida (Fruity), Sindoro Strawberry (Manis Selai), dan Dampit Natural Fine Robusta (Kopi Susu).
- Berikan rekomendasi yang terstruktur, jelas, dan sebutkan tasting notes serta saran penyajiannya.`;

        const geminiHistory = (history || []).slice(-6).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        }));

        const targetModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];
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
                    maxOutputTokens: 2500,
                  },
                }),
                signal: AbortSignal.timeout(12000),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const parts = geminiData.candidates?.[0]?.content?.parts;
              let rawText = Array.isArray(parts)
                ? parts.map((p: any) => p.text).filter(Boolean).join('\n')
                : geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

              if (rawText) {
                generatedText = rawText
                  .replace(/^\s*\([\s\S]*?(?:self-correction|thinking|internal note)[\s\S]*?\)\s*/gi, '')
                  .replace(/^[\s\S]*?(?:let's write the response|here is the response)[.:]\s*/gi, '')
                  .trim();
                break;
              }
            }
          } catch (modelErr) {
            // Try next model
          }
        }

        if (generatedText) {
          const genLower = generatedText.toLowerCase();
          const lowerText = (generatedText + ' ' + message).toLowerCase();

          if (recommendedSlugs.length === 0) {
          // 1. Direct match by product name, slug, or slowbar alias
          const directMatches = PRODUCTS.filter((p) =>
            genLower.includes(p.name.toLowerCase()) ||
            genLower.includes(p.slug.toLowerCase()) ||
            (p.slowbarAlias && genLower.includes(p.slowbarAlias.toLowerCase()))
          ).map((p) => p.slug);

          let geminiSlugs = Array.from(new Set(directMatches)).slice(0, 3);

          // 2. Contextual tasting notes match if fewer than 3
          if (geminiSlugs.length < 3) {
            const contextualMatches = PRODUCTS.filter((p) =>
              !geminiSlugs.includes(p.slug) &&
              p.tastingNotes.some((n) => n.length > 5 && genLower.includes(n.toLowerCase()))
            ).map((p) => p.slug);

            geminiSlugs = Array.from(new Set([...geminiSlugs, ...contextualMatches])).slice(0, 3);
          }

          // 3. Fallback defaults based on intent if none matched
          if (geminiSlugs.length === 0) {
            if (lowerText.includes('strong') || lowerText.includes('susu') || lowerText.includes('espresso')) {
              recommendedSlugs = ['brazil-santos-espresso', 'dampit-natural-espresso'];
              geminiSlugs = ['brazil-santos-espresso', 'dampit-natural-espresso'];
            } else if (lowerText.includes('lambung') || lowerText.includes('maag') || lowerText.includes('mild')) {
              recommendedSlugs = ['kintamani-full-wash-arabica-espresso', 'ijen-yellow-bourbon-kencana'];
              geminiSlugs = ['kintamani-full-wash-arabica-espresso', 'ijen-yellow-bourbon-kencana'];
            } else {
              recommendedSlugs = ['argopuro-walida-anaerob-arcapada', 'sindoro-strawberry-selai'];
              geminiSlugs = ['argopuro-walida-anaerob-arcapada', 'sindoro-strawberry-selai'];
            }
          }

          return NextResponse.json({
            reply: generatedText,
            recommendedSlugs,
            recommendedSlugs: geminiSlugs,
            groundedInCatalog: true,
          });
        }
      } catch (geminiErr: any) {
        console.error('Gemini API Error in route:', geminiErr?.message || geminiErr);
      }
    }

    // 2. Attempt to contact Python FastAPI backend if running
    try {
      const backendRes = await fetch(`${aiBackendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: AbortSignal.timeout(1500),
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        return NextResponse.json(backendData);
      }
    } catch (e) {
      // Backend not running, proceed to expert built-in barista knowledge engine
    }

    // 3. Comprehensive Context-Aware Built-in Barista Intelligence
    const query = message.toLowerCase().trim();
    const cleanQuery = query.replace(/[^\w\s]/gi, '').trim();
    let reply = '';
    const recommendedSlugs: string[] = [];

    // --- PRIORITY 1: LAMBUNG / MAAG / GERD / RINGAN / LOW ACID / AMAN ---
    if (
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
      query.includes('aman') ||
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
        reply = `Untuk kawan seduh yang menginginkan kopi berkarakter **Strong, Tebal, & Mantap tapi Tetap Aman di Lambung**, ini rahasia & kurasi terbaik kami:\n\n` +
          `1. Brazil Santos (Arabica Medium-Dark Roast)\n` +
          `   • Rasa: Dark Chocolate tebal, Roasted Peanut gurih, & Caramel manis.\n` +
          `   • Mengapa Aman: Biji Arabika alami dengan keasaman (acidity) sangat rendah, sehingga tidak memicu asam lambung berlebih meski rasanya tebal.\n\n` +
          `2. Kintamani Full Wash (Arabica Medium Roast)\n` +
          `   • Rasa: Sweet Chocolate halus dengan aftertaste bersih.\n` +
          `   • Mengapa Aman: Proses wash membuang asam liar, memberikan body seimbang tanpa rasa perih di lambung.\n\n` +
          `3. Dampit Natural Espresso (Fine Robusta Malang)\n` +
          `   • Cocok diseduh menjadi Kopi Susu / Latte yang nendang tanpa rasa langu.\n\n` +
          `Tips Barista agar Kopi Strong Tetap Nyaman di Lambung:\n` +
          `• **Seduh Metode Cold Brew Pekat**: Rendaman dingin 12 jam menghasilkan ekstrak yang sangat pekat & bold, namun kadar asam klorogenatnya turun drastis hingga 67%!\n` +
          `• **Tambahkan Susu Fresh (Cafe Latte / Flat White)**: Lemak dan kalsium susu membentuk lapisan pelindung pada dinding lambung sekaligus menetralkan keasaman.\n` +
          `• **Waktu Seduh Terbaik**: Nikmati 30-60 menit setelah sarapan/makan ringan, hindari minum saat perut kosong.`;
      } else {
        recommendedSlugs.push(
          'kintamani-full-wash-arabica-espresso',
          'ijen-yellow-bourbon-kencana',
          'sumbing-supernova-celestia'
        );
        reply = `Untuk kawan seduh yang mencari kopi yang Ringan, Lembut, dan Ramah/Aman di Lambung, berikut kurasi terbaik kami:\n\n` +
          `1. Kintamani Full Wash (Arabica Medium Roast)\n` +
          `   • Rasa: Sweet Chocolate, hint Citrus lembut, dan aftertaste manis bersih.\n` +
          `   • Karakter: Proses washed menghilangkan keasaman liar sehingga sangat nyaman di perut.\n\n` +
          `2. Ijen Yellow Bourbon (Honey Process)\n` +
          `   • Rasa: Manis Madu hutan alami & Gurih Kacang Almond panggang.\n` +
          `   • Karakter: Keasaman sangat rendah (low acidity) dengan body yang halus.\n\n` +
          `3. Java Exotic Sumbing Deep Washed\n` +
          `   • Rasa: Brown Sugar hangat, Red Apple manis, & Black Tea halus.\n` +
          `   • Karakter: Clean cup tinggi dengan body medium yang tidak membebani pencernaan.\n\n` +
          `Tips Barista untuk Lambung Sensitif:\n` +
          `• Hindari seduhan Robusta pekat/dark roast yang tinggi kafein.\n` +
          `• Seduh dengan metode Cold Brew (rendam dingin 12 jam) atau V60 dengan suhu air 88-90°C rasio 1:16 untuk hasil seduhan yang ekstra aman dan manis alami.`;
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
        `Apakah kamu lebih menyukai seduhan Manual Brew (V60) atau Kopi Susu / Espresso?`;
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
        `• Kopi yang Ringan & Aman untuk Lambung (Kintamani / Ijen Yellow Bourbon)\n` +
        `• Koleksi Filter Fruity & Floral (Argopuro Walida / Sindoro Strawberry)\n` +
        `• Biji Espresso & Kopi Susu Aren (Dampit Robusta)\n` +
        `• Panduan Rasio Seduh V60 Presisi\n\n` +
        `Profil rasa atau metode seduh apa yang ingin kamu eksplorasi hari ini?`;
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
        `Kamu bisa memilih:\n` +
        `1. Kopi Ringan & Ramah Lambung (Kintamani Full Wash & Ijen Yellow Bourbon)\n` +
        `2. Filter Fruity & Floral (Argopuro Walida & Sindoro Strawberry)\n` +
        `3. Espresso & Kopi Susu (Dampit Robusta & Brazil Santos)\n` +
        `4. Grand Reserve Micro-Lot (Colombia Geisha & Sidra)\n\n` +
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
