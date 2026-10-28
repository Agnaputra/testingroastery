# Review alternatif rekomendasi — Tahap 3B.2 (DRAFT)

Sumber: `coffee_knowledge.metadata` untuk 26 produk published pada fingerprint `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311`. `reference` di dataset tetap satu contoh jawaban faktual untuk RAGAS. Kolom alternatif di bawah adalah **produk lain yang memenuhi semua kriteria eksplisit**, bukan kewajiban agar model menyebut kedua produk. Penilaian ini baru `VERIFIED BY SOURCE`, belum persetujuan manusia.

| ID | Kriteria yang diuji | Produk utama pada reference | Alternatif diterima dan bukti | Kecocokan parsial yang tidak dimasukkan |
|---|---|---|---|---|
| PR01 | Clean, jasmine, citrus | `ijen-kenyan-wening` — notes Clean, Jasmine, Crisp Citrus | Tidak ada kecocokan lengkap lain di metadata published | Asmara dan Aurora punya jasmine tetapi tidak mencatat clean sekaligus citrus |
| PR02 | Honey dan almond | `ijen-yellow-bourbon-kencana` — notes Honey, Almond | Tidak ada | Buntu Lenta Wash dan Puntang Honey mencatat honey, tidak almond |
| PR03 | Filter, blueberry, strawberry | `buntu-lenta-natural-duharman` — kategori filter; notes Blueberry, Strawberry | Tidak ada | Sindoro Selai mencatat strawberry, tidak blueberry |
| PR04 | Espresso, chocolate, brown sugar | `kintamani-full-wash-arabica-espresso` — kategori espresso; notes Chocolate, Brown Sugar, Full Body | `dampit-natural-espresso` — kategori espresso; notes Chocolate, Brown Sugar, Full Body; `recipe` memakai Espresso Machine | Arabica Ijen dan Brazil Santos mencatat Dark Chocolate, tetapi tidak Brown Sugar |
| PR05 | Floral, peach, tea-like | `el-triunfo-geisha-tolima-aurora` — notes Jasmine, Peach, Tea-like | Tidak ada | Asmara punya Jasmine dan Peach, tetapi tidak Tea-like |
| PR06 | Mango, lychee, lime | `ijen-lactic-laras` — notes Mango, Lychee, Lime | Tidak ada | Benteng Alla mencatat Lime, tidak Mango atau Lychee |
| PR07 | Winey dan candy-like | `damarkandang-cm-kismis` — notes Winey, Candy Like Cup | Tidak ada | Sudan Rume mencatat Wine-Like tanpa candy; Arcapada mencatat candy dan boozy tanpa Winey literal |
| PR08 | Boozy dan candy-like fruit | `argopuro-walida-anaerob-arcapada` — notes Boozy, Candy Like Fruit | Tidak ada | Damarkandang mencatat Winey dan Candy Like Cup, tetapi tidak Boozy literal |
| PR09 | Lime, cashew, caramel | `benteng-alla-wash-sembada` — notes Lime, Cashew, Caramel | Tidak ada | Ijen Lactic mencatat Lime, tidak Cashew dan Caramel |
| PR10 | Espresso, earthy, dark chocolate, full body | `arabica-ijen-full-wash-espresso` — kategori espresso; notes Earthy, Dark Chocolate, Full Body | `brazil-santos-espresso` — kategori espresso; notes Earthy, Dark Chocolate, Full Body; `recipe` memakai Espresso Machine | Dampit mencatat Chocolate dan Full Body, tetapi tidak Earthy/Dark Chocolate |

## Evaluasi tambahan ketepatan rekomendasi

Bekukan himpunan yang dapat diterima **sebelum** mengamati jawaban: untuk tiap PR, gabungkan slug utama dari `expected_slugs` dengan `acceptable_alternatives[].slug`. Ambil slug yang benar-benar direkomendasikan dari respons terstruktur; validasi terhadap produk published. Laporkan secara terpisah dari empat skor RAGAS:

- `valid_product_hit`: 1 jika sedikitnya satu slug rekomendasi berada dalam himpunan diterima, selain itu 0. Ketiadaan rekomendasi adalah 0 untuk metrik ini, dengan alasan respons tetap dilaporkan.
- `recommendation_precision`: jumlah slug rekomendasi yang diterima dibagi jumlah seluruh slug rekomendasi, dengan denominator dan kasus tanpa slug dicatat terpisah. Jangan menyebut `undefined` sebagai nol.
- `unsupported_recommendation_rate`: jumlah slug yang tidak ada di katalog published atau tidak dapat dibuktikan memenuhi kriteria dibagi jumlah slug rekomendasi; pisahkan dua jenis kesalahan itu dalam laporan.

`expected_slugs` pada runner sekarang hanya slug utama dan digunakan untuk diagnostik retrieval. Itu **bukan** daftar lengkap jawaban rekomendasi sah. RAGAS dengan satu reference utama dapat memberi skor lebih rendah untuk jawaban alternatif yang benar; laporkan keterbatasan ini dan hasil evaluasi produk tambahan secara berdampingan. Jika muncul slug lain yang tampak relevan, catat sebagai kasus untuk adjudikasi manusia tanpa diam-diam mengubah himpunan diterima setelah melihat skor. Keputusan mengubah himpunan memerlukan versi dataset/protokol baru dan analisis terpisah, bukan koreksi hasil run yang sedang berlangsung.

Validasi manusia masih diperlukan untuk menyepakati sinonim sensori seperti “winey” dan “boozy”, serta apakah syarat kata sifat harus semuanya eksplisit. Daftar di atas sengaja ketat: kecocokan parsial tidak otomatis diterima.
