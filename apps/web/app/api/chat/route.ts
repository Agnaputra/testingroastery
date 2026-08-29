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

    // --- INPUT GUARDRAILS (Next.js layer, always active) ---
    // 1. Max length — prevents token flooding / prompt stuffing
    if (message.length > 500) {
      return NextResponse.json({
        reply: 'Pertanyaanmu terlalu panjang, kawan seduh. Coba ringkas pertanyaanmu, misalnya: "Kopi fruity untuk V60 apa yang bagus?"',
        recommendedSlugs: [],
        groundedInCatalog: true,
      });
    }

    // 2. Blocked phrases — prompt injection, SQL, jailbreak, off-topic abuse
    const BLOCKED_PHRASES = [
      'ignore previous instructions', 'ignore all instructions',
      'system prompt', 'jailbreak', 'bypass filter', 'bypass guardrail',
      'act as dan', 'you are dan', 'pretend you are', 'roleplay as',
      'drop table', 'select * from', 'insert into', 'delete from', '--',
      'hack', 'meretas', 'ddos', 'script injection', 'xss',
      'judi', 'togel', 'politik', 'presiden', 'narkoba', 'drugs',
      'cara membuat bom', 'weapons', 'senjata',
    ];
    const msgLower = message.toLowerCase();
    const isBlocked = BLOCKED_PHRASES.some((phrase) => msgLower.includes(phrase));
    if (isBlocked) {
      return NextResponse.json({
        reply: 'Mohon maaf kawan seduh 🙏 Saya adalah Virtual Barista khusus 52 Coffee & Roastery. Saya hanya dapat membantu seputar rekomendasi biji kopi, profil rasa, dan panduan seduh presisi. Ada yang ingin kamu ketahui tentang kopi kami?',
        recommendedSlugs: ['argopuro-walida-anaerob-arcapada', 'sindoro-strawberry-selai'],
        groundedInCatalog: true,
      });
    }

    const aiBackendUrl = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';
    const geminiApiKey = getApiKey();

    // 1. Attempt to call Google Gemini API if a valid Gemini API key is configured
    if (geminiApiKey && (geminiApiKey.startsWith('AIzaSy') || geminiApiKey.startsWith('AQ.'))) {
      try {
        const catalogContext = PRODUCTS.map((p) =>
          `• [${p.name}] (Slug: ${p.slug}, Series: ${p.series}, Category: ${p.categoryLabel}, Process: ${p.process}, Roast: ${p.roastLevel}, Notes: ${p.tastingNotes.join(', ')}, Price: Rp ${p.basePrice}/${p.defaultWeight})`
        ).join('\n');

        const systemPrompt = `Kamu adalah Virtual Barista ramah, cerdas, dan ahli dari 52 Coffee & Roastery (Instagram: @52coffeeroastery), roastery artisanal yang menyangrai biji kopi dalam batch kecil di Jl. KH. Agus Salim No. 11 Malang, Jawa Timur (Jam Buka: Senin - Jumat 11.00-16.00 WIB).
Voucher promo: '52COFFEE' (10% OFF), Gratis Ongkir min. Rp 250.000.

Fitur & Tools Roastery yang Tersedia di Website:
1. BYOB (Build Your Own Blend) di menu /blend-builder: Simulator racik blend sendiri dengan kalkulasi harga transparan per kg dan prediksi profil rasa radar. Profil sangrai dikhususkan pada 'Dark Espresso Roast' untuk mesin espresso & kopi susu.
2. Price Calculator (Kalkulator Harga / HPP) di menu /tools/price-calculator: Simulator finansial kedai kopi untuk menghitung HPP biji sangrai, susut bobot roasting (~19.93%), biaya listrik gas (Rp 10.000/kg), kemasan pouch, serta target margin keuntungan retail.
3. Brew Calculator di menu /tools/brew-calculator: Kalkulator rasio seduh presisi V60, Aeropress, French Press, dan Cold Brew.
4. Slowbar & Retail Catalog di /catalog: Pilihan single origin Java Exotic, Kaldera Ijen, Walida, hingga Grand Reserve Micro-Lot.
5. B2B Wholesale / Work With Us di /work-with-us: Solusi pasokan biji kopi roasted & green bean untuk kedai kopi di seluruh Indonesia.
6. Order Tracker di /track: Lacak status pemrosesan dan resi pengiriman kurir.

Katalog Biji Kopi Tersedia:
${catalogContext}

Panduan Barista:
- PENTING: Langsung berikan jawaban akhir yang ramah, sopan, solutif, dan informatif dalam Bahasa Indonesia. JANGAN PERNAH menyertakan proses berpikir, catatan internal, atau teks seperti '(Self-correction...)' atau 'Let\'s write the response'.
- Jika ditanya tentang BYOB / racik blend: jelaskan fitur BYOB di /blend-builder, profil sangrai Dark Espresso Roast, dan berikan rekomendasi racikan (misal: 70% Java Ijen + 30% Dampit Robusta seharga Rp 220.000/kg atau 70% Java Ijen + 30% Arjuna Budug seharga Rp 253.000/kg).
- Jika ditanya tentang Price Calculator / Hitung HPP: jelaskan fungsinya di /tools/price-calculator untuk menghitung biaya produksi, susut sangrai 19.93%, kemasan, dan margin profit kedai kopi.
- Jika ditanya tentang lokasi / alamat / jam buka: jelaskan lokasinya di Jl. KH. Agus Salim No. 11, Klojen, Kota Malang (Senin-Jumat 11:00-16:00 WIB).
- Jika ditanya tentang kopi lambung / GERD: rekomendasikan Kintamani Full Wash atau Ijen Yellow Bourbon.
- Berikan rekomendasi yang terstruktur dan sebutkan tasting notes serta saran penyajiannya.`;

        const geminiHistory = (history || []).slice(-6).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        }));

        const targetModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'];
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
              geminiSlugs = ['brazil-santos-espresso', 'dampit-natural-espresso'];
            } else if (lowerText.includes('lambung') || lowerText.includes('maag') || lowerText.includes('mild')) {
              geminiSlugs = ['kintamani-full-wash-arabica-espresso', 'ijen-yellow-bourbon-kencana'];
            } else {
              geminiSlugs = ['argopuro-walida-anaerob-arcapada', 'sindoro-strawberry-selai'];
            }
          }

          return NextResponse.json({
            reply: generatedText,
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
      reply = `📊 **Fungsi Price Calculator (Kalkulator Harga & HPP Roastery)**\n\n` +
        `Tool **Price Calculator** di 52 Coffee (/tools/price-calculator) dibuat khusus untuk membantu pemilik kedai kopi, roaster pemula, dan pelaku bisnis F&B menghitung Harga Pokok Produksi (HPP) dan menentukan harga jual biji kopi sangrai secara transparan & akurat.\n\n` +
        `**Komponen yang Dihitung Secara Presisi:**\n` +
        `1. **Landed Green Coffee Cost**: Biaya pembelian biji mentah per kilogram.\n` +
        `2. **Roasting Shrink Loss (Susut Bobot ~19.93%)**: Biji kopi mentah akan menyusut kadar airnya saat disangrai. Kalkulator otomatis menghitung berapa kg green bean yang dibutuhkan untuk menghasilkan 1 kg roasted bean murni.\n` +
        `3. **Operational & Energy Cost**: Biaya listrik infrared & gas operasional roaster (standar Rp 10.000/kg).\n` +
        `4. **Packaging & Valve Pouch**: Biaya standing pouch food-grade dengan one-way degassing valve dan label craft (Rp 5.000 - Rp 10.000).\n` +
        `5. **Target Margin & Profit Projection**: Menampilkan rekomendasi harga jual eceran (retail) dan harga grosir (B2B wholesale) serta estimasi laba bersih.\n\n` +
        `Kamu bisa mencoba memasukkan parameter biaya kedai kopimu langsung di menu **[Price Calculator](/tools/price-calculator)**!`;
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
      reply = `⏱️ **Brew Calculator & Panduan Seduh Presisi 52 Coffee**\n\n` +
        `Untuk menghasilkan cangkir seduhan yang seimbang, manis maksimal, dan bebas over-ekstraksi, kami menyediakan tool **[Brew Calculator](/tools/brew-calculator)** dan **[Brew Guide](/guide)**.\n\n` +
        `**Panduan Standar Seduh V60 52 Roastery:**\n` +
        `• **Dosis Biji**: 15 gram (Giling Medium - sehalus pasir pantai)\n` +
        `• **Air Seduh**: 225 ml (Rasio 1:15), Suhu 91°C - 93°C\n` +
        `• **Tahap Penuangan (3 Pours)**:\n` +
        `  1. *Bloom*: 45 ml air, tunggu 40 detik untuk degassing aroma kopi.\n` +
        `  2. *First Pour*: Tuang spiral perlahan hingga 135 ml (di detik 00:45).\n` +
        `  3. *Final Pour*: Tuang perlahan di tengah hingga 225 ml (di detik 01:20).\n` +
        `• **Target Total Time (Drawdown)**: 02:15 - 02:30 menit.\n\n` +
        `Coba gunakan **[Brew Calculator Interaktif](/tools/brew-calculator)** untuk menghitung otomatis takaran air sesuai gramatur kopimu!`;
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
        `  Senin - Jumat: **11.00 - 16.00 WIB** (Sabtu & Minggu: Khusus Pemesanan Online & Event Cupping).\n\n` +
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
      reply = `🤝 **Kemitraan B2B & Wholesale Kedai Kopi 52 Roastery**\n\n` +
        `Kami bermitra dengan puluhan coffee shop di Malang, Surabaya, Jabodetabek, dan kota lainnya di Indonesia.\n\n` +
        `**Layanan B2B yang Kami Sediakan:**\n` +
        `1. **Suplai House Blend & Single Origin (Kemasan 1 kg)**: Harga bertingkat (Tiered Wholesale Price) dengan jaminan profil sangrai yang konsisten setiap batch.\n` +
        `2. **Custom Profiling & White Label (Maklon Sangrai)**: Kami dapat membuatkan profil sangrai unik dan kemasan khusus merek kafe Anda.\n` +
        `3. **Sample Pack & Barista Calibration**: Dapatkan sample kit untuk uji rasa (cupping) di kedai Anda.\n\n` +
        `Pelajari penawaran lengkap dan ajukan formulir kemitraan di menu **[Work With Us / B2B Solutions](/work-with-us)**!`;
    }

    // --- PRIORITY 0F: TRACK ORDER / LACAK RESI ---
    else if (
      query.includes('track') ||
      query.includes('lacak') ||
      query.includes('resi') ||
      query.includes('status pesanan') ||
      query.includes('sampai mana')
    ) {
      reply = `📦 **Lacak Pesanan Biji Kopi Anda**\n\n` +
        `Anda dapat memantau status sangrai dan nomor resi ekspedisi secara real-time melalui menu **[Track Order](/track)**.\n\n` +
        `Cukup masukkan **Order ID (Contoh: 52C-XXXXXX)** atau Nomor WhatsApp yang Anda gunakan saat checkout!`;
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
        `• Kopi yang Ringan & Aman untuk Lambung (Kintamani / Ijen Yellow Bourbon)\n` +
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
        `2. **Kopi Ringan & Ramah Lambung** — Kintamani Full Wash & Ijen Yellow Bourbon.\n` +
        `3. **Filter Fruity & Floral** — Argopuro Walida & Sindoro Strawberry.\n` +
        `4. **Espresso & Kopi Susu** — Dampit Robusta & Brazil Santos.\n` +
        `5. **Price & Brew Calculator** — Simulasi HPP dan rasio seduh presisi.\n\n` +
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
