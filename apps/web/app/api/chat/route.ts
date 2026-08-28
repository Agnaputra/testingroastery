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
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';

    // 1. Attempt to call Google Gemini API if a valid Gemini API key is configured
    if (geminiApiKey && geminiApiKey.startsWith('AIzaSy')) {
      try {
        const catalogContext = PRODUCTS.map((p) =>
          `• [${p.name}] (Slug: ${p.slug}, Series: ${p.series}, Category: ${p.categoryLabel}, Process: ${p.process}, Roast: ${p.roastLevel}, Notes: ${p.tastingNotes.join(', ')}, Price: Rp ${p.basePrice}/${p.defaultWeight})`
        ).join('\n');

        const systemPrompt = `Kamu adalah Virtual Barista ramah, cerdas, dan ahli dari 52 Coffee & Roastery (Instagram: @52coffeeroastery), roastery artisanal yang menyangrai biji kopi dalam batch kecil di Jl. KH. Agus Salim No. 11 Malang, Jawa Timur (Jam Buka: 10.00-20.00 WIB).
Voucher promo: '52COFFEE' (10% OFF), Gratis Ongkir min. Rp 250.000.

Katalog Biji Kopi Tersedia:
${catalogContext}

Panduan Barista:
- Jawablah secara akurat, ramah, antusias, dan profesional dalam bahasa Indonesia.
- Jangan menggunakan emoticon atau emoji yang berlebihan.
- Jika pengguna bertanya tentang kopi aman untuk lambung / maag / GERD / ringan: jelaskan bahwa kopi Arabika Specialty medium roast (seperti Kintamani Full Wash, Ijen Yellow Bourbon, atau Sumbing Washed) atau metode Cold Brew sangat ramah untuk lambung karena asam klorogenatnya terkontrol dan kafein lebih bersahabat daripada Robusta pekat.
- Jika pengguna bertanya tentang rekomendasi umum: tanyakan preferensi atau rekomendasikan kopi unggulan (Argopuro Walida, Sindoro Strawberry, Ijen Carbonic Maceration).
- Jika pengguna bertanya tentang minuman selain kopi: jelaskan ketersediaan Artisan Chocolate, Matcha Latte, Artisan Tea, dan Fruit Mocktail di slowbar Malang.
- Berikan rekomendasi yang ringkas, terstruktur, dan sebutkan tasting notes serta cara seduhnya.`;

        const geminiHistory = (history || []).slice(-6).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        }));

        const targetModels = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];
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
            // Try next model
          }
        }

        if (generatedText) {
          const lowerText = (generatedText + ' ' + message).toLowerCase();
          const recommendedSlugs = PRODUCTS.filter((p) =>
            lowerText.includes(p.name.toLowerCase()) ||
            lowerText.includes(p.slug.toLowerCase()) ||
            p.tastingNotes.some((n) => lowerText.includes(n.toLowerCase()))
          ).slice(0, 3).map((p) => p.slug);

          return NextResponse.json({
            reply: generatedText,
            recommendedSlugs: recommendedSlugs.length > 0 ? recommendedSlugs : ['kintamani-full-wash-arabica', 'ijen-yellow-bourbon'],
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
      recommendedSlugs.push(
        'kintamani-full-wash-arabica',
        'ijen-yellow-bourbon',
        'sumbing-deep-washed'
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
        'sindoro-strawberry-triple-yeast',
        'argopuro-walida-natural-anaerobic',
        'puntang-natural'
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
        'el-triunfo-geisha-tolima',
        'ijen-carbonic-maceration',
        'prau-natural-secret-project'
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
        'argopuro-walida-natural-anaerobic',
        'sindoro-strawberry-triple-yeast',
        'ijen-carbonic-maceration'
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
        'dampit-natural-robusta',
        'kintamani-full-wash-arabica',
        'brazil-santos-arabica'
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
        'magnum-sidra-el-vergel-cauca',
        'el-triunfo-geisha-tolima',
        'yemen-haraz-golden-harvest'
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
        'argopuro-walida-natural-anaerobic',
        'sindoro-strawberry-triple-yeast',
        'dampit-natural-robusta'
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
        'argopuro-walida-natural-anaerobic',
        'sindoro-strawberry-triple-yeast'
      );
      reply = `Halo kawan seduh! Selamat datang di 52 Coffee & Roastery Malang.\n\n` +
        `Saya siap membantu memilihkan biji kopi yang paling cocok dengan selera seduhmu. Kamu bisa menanyakan:\n\n` +
        `• Kopi yang Ringan & Aman untuk Lambung (Kintamani / Ijen Yellow Bourbon)\n` +
        `• Koleksi Filter Fruity & Floral (Argopuro Walida / Sindoro Strawberry)\n` +
        `• Biji Espresso & Kopi Susu Aren (Dampit Robusta)\n` +
        `• Panduan Rasio Seduh V60 Presisi\n\n` +
        `Profil rasa atau metode seduh apa yang ingin kamu eksplorasi hari ini?`;
    }

    // --- DEFAULT FALLBACK ---
    else {
      recommendedSlugs.push(
        'kintamani-full-wash-arabica',
        'argopuro-walida-natural-anaerobic'
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
        recommendedSlugs: ['argopuro-walida-natural-anaerobic', 'kintamani-full-wash-arabica'],
      },
      { status: 200 }
    );
  }
}
