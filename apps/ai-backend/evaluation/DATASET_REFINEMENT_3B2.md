# Audit dan changelog dataset Tahap 3B.2 (DRAFT)

Draft ini diturunkan dari `dataset_candidates_3b1_snapshot.json` (SHA-256 `30abc738ad4e34ef2ad5a43fcba872fc950206641f46c70a8c8ca031e8d859e7`) ke `dataset_candidates_3b.json` (SHA-256 `50fbae6ba29e5f8e6f2848c413490887235af2a8903b223e07bb334cb14c97c2`). Kedua file mempertahankan 50 fixture ID dan **seluruh 50 teks pertanyaan identik**. KB fingerprint tetap `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311`. Tidak ada skor RAGAS atau hasil retrieval yang dipakai untuk memilih/mengubah pertanyaan.

## Hasil audit per kategori

| Kategori draft aktif | Utama | Cadangan | Hasil |
|---|---:|---:|---|
| Product Information | 10 | 3 | Reference bersumber. PI03 tetap informasi produk; `static_intent=product_recommendation` dipicu substring `manis` pada `Aromanis`, bukan bukti runtime. PI11-PI13 tetap cadangan karena harga saat ini, data penjualan, atau klaim medis. |
| Product Recommendation | 10 | 3 | Dua pertanyaan punya alternatif produk yang memenuhi semua atribut: PR04 dan PR10. PR04 reference dipersempit. Sepuluh utama lain tetap memiliki reference utama terpisah dari daftar alternatif. |
| Brewing Guidance / Recipe Information | 10 | 2 | Kategori diganti dari Brewing Suitability karena seluruh pertanyaan utama meminta informasi resep/metode tercatat. Delapan reference dipersempit; dua reference resep penuh (BS06, BS08) tetap karena pertanyaan meminta resep lengkap. |
| Product Comparison | 10 | 2 | Setiap reference utama memuat kedua produk dan field sumbernya; pencocokan entitas statis menemukan kedua slug tanpa ambiguitas. Keberadaan keduanya di context generation belum diverifikasi. |

## Temuan menurut prioritas

- **P0 metodologi:** human validation, konfirmasi resep, dan freeze belum terjadi. RAGAS dengan satu reference utama dapat kurang menghargai alternatif PR04/PR10; laporkan metrik ketepatan produk terpisah.
- **P1:** PI03 berbeda antara kategori penelitian dan prediksi router statis; jangan ditafsirkan sebagai jalur aktual atau alasan eksklusi. Semua PC tetap memerlukan dua target; retrieval miss nanti dilaporkan sebagai kegagalan retrieval.
- **P1:** reference recipe yang terlalu luas dapat memberi fakta tambahan di luar cakupan pertanyaan; sembilan reference direvisi berbasis recipe metadata tanpa mengubah pertanyaan.
- **P2:** kategori Brewing dan dua tingkat kesulitan diperjelas agar definisi Bab III konsisten.

## Perubahan reference answer (before / after)

| ID | Before | After | Alasan berbasis pertanyaan dan metadata |
|---|---|---|---|
| PR04 | Kintamani Full Wash Arabica Espresso adalah salah satu opsi: kategori espresso, notes Chocolate, Brown Sugar, Full Body, dengan resep Espresso Machine: 18g in, 36g out, 28 detik suhu 93°C. | Kintamani Full Wash Arabica Espresso sesuai sebagai salah satu opsi: kategori espresso dengan notes Chocolate, Brown Sugar, Full Body. | Pertanyaan meminta rekomendasi rasa dan metode espresso; angka resep tidak diperlukan. |
| BS01 | Resep Ijen Carbonic Maceration (Asmara) menyebut V60 15g kopi, 225ml air (1:15), 92°C, 2m 15s. Bloom 45g 40s. | Resep Ijen Carbonic Maceration (Asmara) mencantumkan V60. | Pertanyaan hanya meminta metode seduh yang tercatat. |
| BS02 | Resep Ijen Kenyan (Wening): V60 15g kopi, 240ml air (1:16), 93°C, 2m 10s. Bloom 45g 35s. | Resep V60 Ijen Kenyan (Wening) menggunakan 15g kopi dan 240ml air. | Pertanyaan hanya meminta dosis kopi dan air. |
| BS03 | Resep Ijen Anaerob (Rahsa) mencantumkan Kalita Wave 15g kopi, 225ml air (1:15), 91°C, 2m 20s. | Resep Ijen Anaerob (Rahsa) mencantumkan Kalita Wave. | Pertanyaan hanya meminta alat seduh. |
| BS04 | Resep Ijen Lactic (Laras): Origami / V60 15g, 225ml air (1:15), 91°C, 2m 25s. | Resep Ijen Lactic (Laras) mencantumkan Origami dan V60. | Pertanyaan hanya meminta apakah dua metode disebut. |
| BS05 | Resep Puntang Honey (Gulali): V60 16g kopi, 250ml air (1:15.6), 92°C, 2m 30s. | Resep Puntang Honey (Gulali) menggunakan 16g kopi, 250ml air, dengan rasio 1:15.6. | Pertanyaan hanya meminta rasio serta dosis kopi/air. |
| BS07 | Resep Ijen Full Wash (Washey) menyebut V60 15g, 225ml air (1:15), 90°C, 2m 15s. | Resep Ijen Full Wash (Washey) mencantumkan V60. | Pertanyaan hanya meminta alat seduh. |
| BS09 | Resep Kintamani Full Wash Arabica Espresso: Espresso Machine: 18g in, 36g out, 28 detik suhu 93°C. | Resep Kintamani Full Wash Arabica Espresso menggunakan 18g kopi masuk dan menghasilkan 36g espresso. | Pertanyaan hanya meminta input dan output espresso. |
| BS10 | Resep El Triunfo Geisha Tolima (Aurora): Hario V60 Plastic 16g kopi, 256ml air (1:16), 93°C, 2m 15s. Bloom 50g 45s. | Resep Hario V60 Plastic untuk El Triunfo Geisha Tolima (Aurora) menggunakan 16g kopi dan 256ml air. | Pertanyaan hanya meminta gram kopi dan volume air. |

## Perubahan lain (before / after)

| Item | Before | After | Alasan |
|---|---|---|---|
| BS01-BS12 `category` | Brewing Suitability | Brewing Guidance / Recipe Information | Mengukur ekstraksi dan penyajian resep tercatat, bukan kecocokan eksklusif metode. 10 utama dan 2 cadangan tetap. |
| BS04 `difficulty` | medium | easy | Satu produk; hanya identifikasi Origami dan V60 dari satu field recipe. |
| BS10 `difficulty` | hard | medium | Satu produk; dua angka dosis/air dari satu field recipe. |
| PI03 anotasi routing | Tidak ada penjelasan | `routing_review` menjelaskan substring `manis` dalam `Aromanis` | Kategori tetap Product Information; prediksi statis bukan runtime. |
| PR04 `acceptable_alternatives` | Belum ada | `dampit-natural-espresso` | Kategori espresso, notes Chocolate/Brown Sugar/Full Body, recipe Espresso Machine. |
| PR10 `acceptable_alternatives` | Belum ada | `brazil-santos-espresso` | Kategori espresso, notes Earthy/Dark Chocolate/Full Body, recipe Espresso Machine. |
| Kandidat lain dan seluruh pertanyaan | Tidak berubah | Tidak berubah | Tidak ada alasan berbasis sumber untuk mengubahnya. |

## Rubrik dan review kesulitan 40 utama

- **easy:** satu produk, satu atribut langsung atau kelompok tasting notes yang eksplisit.
- **medium:** satu produk dengan beberapa atribut/angka resep, atau dua produk dengan perbandingan langsung.
- **hard:** dua produk yang memadukan varietal dengan alias atau profil proses dan rasa reserve lintas origin; alias saja tidak otomatis hard.

| ID | Kategori | Level draft aktif | Dasar klasifikasi |
|---|---|---|---|
| PI01 | Product Information | easy | Satu produk; atribut langsung dari metadata |
| PI02 | Product Information | easy | Satu produk; atribut langsung dari metadata |
| PI03 | Product Information | easy | Satu produk; atribut langsung dari metadata |
| PI04 | Product Information | medium | Satu produk; beberapa atribut atau terminologi proses/roast/origin |
| PI05 | Product Information | easy | Satu produk; atribut langsung dari metadata |
| PI06 | Product Information | medium | Satu produk; beberapa atribut atau terminologi proses/roast/origin |
| PI07 | Product Information | medium | Satu produk; beberapa atribut atau terminologi proses/roast/origin |
| PI08 | Product Information | medium | Satu produk; beberapa atribut atau terminologi proses/roast/origin |
| PI09 | Product Information | medium | Satu produk; beberapa atribut atau terminologi proses/roast/origin |
| PI10 | Product Information | medium | Satu produk; beberapa atribut atau terminologi proses/roast/origin |
| PR01 | Product Recommendation | easy | Satu atau lebih kandidat; notes eksplisit yang spesifik |
| PR02 | Product Recommendation | easy | Satu atau lebih kandidat; notes eksplisit yang spesifik |
| PR03 | Product Recommendation | easy | Satu atau lebih kandidat; notes eksplisit yang spesifik |
| PR04 | Product Recommendation | medium | Satu atau lebih kandidat; kombinasi preferensi, kategori, atau alternatif yang perlu dipertimbangkan |
| PR05 | Product Recommendation | medium | Satu atau lebih kandidat; kombinasi preferensi, kategori, atau alternatif yang perlu dipertimbangkan |
| PR06 | Product Recommendation | easy | Satu atau lebih kandidat; notes eksplisit yang spesifik |
| PR07 | Product Recommendation | medium | Satu atau lebih kandidat; kombinasi preferensi, kategori, atau alternatif yang perlu dipertimbangkan |
| PR08 | Product Recommendation | medium | Satu atau lebih kandidat; kombinasi preferensi, kategori, atau alternatif yang perlu dipertimbangkan |
| PR09 | Product Recommendation | medium | Satu atau lebih kandidat; kombinasi preferensi, kategori, atau alternatif yang perlu dipertimbangkan |
| PR10 | Product Recommendation | medium | Satu atau lebih kandidat; kombinasi preferensi, kategori, atau alternatif yang perlu dipertimbangkan |
| BS01 | Brewing Guidance / Recipe Information | easy | Satu produk; identifikasi metode dari recipe |
| BS02 | Brewing Guidance / Recipe Information | medium | Satu produk; angka dosis/rasio atau resep dengan beberapa parameter |
| BS03 | Brewing Guidance / Recipe Information | easy | Satu produk; identifikasi metode dari recipe |
| BS04 | Brewing Guidance / Recipe Information | easy | Satu produk; identifikasi metode dari recipe |
| BS05 | Brewing Guidance / Recipe Information | medium | Satu produk; angka dosis/rasio atau resep dengan beberapa parameter |
| BS06 | Brewing Guidance / Recipe Information | medium | Satu produk; angka dosis/rasio atau resep dengan beberapa parameter |
| BS07 | Brewing Guidance / Recipe Information | easy | Satu produk; identifikasi metode dari recipe |
| BS08 | Brewing Guidance / Recipe Information | medium | Satu produk; angka dosis/rasio atau resep dengan beberapa parameter |
| BS09 | Brewing Guidance / Recipe Information | medium | Satu produk; angka dosis/rasio atau resep dengan beberapa parameter |
| BS10 | Brewing Guidance / Recipe Information | medium | Satu produk; angka dosis/rasio atau resep dengan beberapa parameter |
| PC01 | Product Comparison | medium | Dua produk; dua atribut yang dibandingkan langsung |
| PC02 | Product Comparison | medium | Dua produk; dua atribut yang dibandingkan langsung |
| PC03 | Product Comparison | medium | Dua produk; dua atribut yang dibandingkan langsung |
| PC04 | Product Comparison | medium | Dua produk; dua atribut yang dibandingkan langsung |
| PC05 | Product Comparison | medium | Dua produk; dua atribut yang dibandingkan langsung |
| PC06 | Product Comparison | medium | Dua produk; dua atribut yang dibandingkan langsung |
| PC07 | Product Comparison | hard | Dua produk; varietal/alias atau profil reserve lintas atribut |
| PC08 | Product Comparison | medium | Dua produk; dua atribut yang dibandingkan langsung |
| PC09 | Product Comparison | hard | Dua produk; varietal/alias atau profil reserve lintas atribut |
| PC10 | Product Comparison | hard | Dua produk; varietal/alias atau profil reserve lintas atribut |

Distribusi sebelum: 11 easy, 25 medium, 4 hard. Sesudah: 12 easy, 25 medium, 3 hard. Tingkat kesulitan menjelaskan beban informasi, **bukan** dugaan skor atau performa retrieval.

## Integritas dan batas verifikasi

- `dataset_status=DRAFT`, `human_validation=PENDING`; tidak ada item HUMAN VALIDATED dan tidak ada direktori frozen.
- Kedua produk pada PC01-PC10 tetap target evaluasi. Jika salah satu hilang dari context pada jalur RAG, catat sebagai retrieval failure.
- 10 cadangan tidak dihapus; status NEEDS REVIEW dan alasan tetap ada.
- Pemeriksaan pada dokumen ini bersifat statis dan sumber. Tidak ada generation request terhadap 40 pertanyaan, evaluator berbayar, atau RAGAS final.
