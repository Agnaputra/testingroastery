# Protokol dataset dan evaluasi RAGAS — Tahap 3B (DRAFT)

**Arsip rancangan awal. Gunakan `PROTOCOL_3B2_DRAFT.md` untuk kategori, reference answer, dan kebijakan rekomendasi pada draft aktif.**

Dokumen ini adalah rancangan Bab III, bukan hasil penelitian. Dataset ada di `dataset_candidates_3b.json`; tabel tanda tangan ada di `dataset_review_3b.md`. Belum ada reference answer yang memperoleh status `HUMAN VALIDATED`.

## 1. Unit analisis dan snapshot sumber

Satu unit analisis adalah satu pertanyaan single-turn berbahasa Indonesia, satu respons Virtual Barista, dan satu evaluation trace dari request generation yang sama. Sumber produk adalah `coffee_knowledge.metadata` pada PostgreSQL/pgvector, dibatasi persis seperti `_search_pgvector`: embedding ada, `publication_status=published`, dan publication override mengizinkan. Pada penyusunan draft, 26 slug published di DB cocok dengan 26 produk `PUBLISHED_COFFEE_KNOWLEDGE_BASE` di `app/rag_service.py` untuk field yang dipakai dataset. Fingerprint snapshot: `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311`. Jika fingerprint atau publication berubah, hentikan batch, buat versi dataset baru, dan validasi ulang referensi.

Metadata berisi nama, slug, origin, varietal, process, roast, notes, recipe, description, category, dan sebagian harga/varian. Komposisi snapshot: 18 filter, 4 espresso, 4 reserve. Semua 26 memiliki `price_200g`; 22 memiliki `price_100g` dan `cup_price`, 17 memiliki `price_500g`, 4 memiliki `price_1000g`, serta 4 produk reserve memiliki `price_16g` dan `price_50g`. `document_chunk` embedding tidak memuat semua field itu, tetapi retrieval runtime mengembalikan **metadata** dan membangun `catalog_context` dari metadata. Karena itu seluruh reference answer harus mengacu pada metadata yang masuk context generation, bukan hanya teks chunk yang di-embed.

`evaluation/build_dataset_3b.py` adalah pembangun draft lokal: ia membaca baris published secara read-only, membandingkan field yang dipakai dengan katalog sumber, lalu menulis dua artefak draft. Perintah dari `apps/ai-backend`: `..\..\.venv\Scripts\python.exe -B -m evaluation.build_dataset_3b`. Jika file draft sudah ada, script menolak overwrite kecuali `--replace-draft`; **jangan** gunakan opsi itu setelah review manusia dimulai. Script tidak mengubah tabel atau memanggil OpenAI.

Tidak ada data penjualan atau best seller terverifikasi, keamanan medis, stok live yang dapat diaudit di snapshot ini, ongkos kirim, promosi, atau bukti bahwa metode seduh di luar `recipe` tidak cocok. Kata “cocok” pada recommendation berarti kesesuaian dengan atribut tercatat, bukan preferensi universal. Harga adalah snapshot, bukan janji harga saat pengguna membeli. Pemeriksaan Unicode Tahap 3B.1 menemukan bahwa seluruh 26 resep published memuat `°C` utuh di DB dan sumber kode; dugaan kerusakan `�C` sebelumnya berasal dari tampilan terminal. Akurasi angka dan satuan resep tetap menunggu konfirmasi 52 Coffee. Rincian ada di `SOURCE_CORRECTION_REVIEW_3B1.md`.

## 2. Penyaringan kandidat dan pemilihan 40

Terdapat 50 kandidat: 13 Product Information, 13 Product Recommendation, 12 Brewing Suitability, dan 12 Product Comparison. Sepuluh pertama setiap kategori diberi `proposed_final=true` (40 total); 10 sisanya cadangan dan/atau negative controls yang diberi alasan pada `notes` dan `route_risks`. Ini **usulan**, bukan dataset final yang disahkan. Variasi mencakup kategori filter/espresso/reserve, asal Indonesia/luar negeri, proses, notes, tingkat kesulitan, dan gaya bahasa.

Kriteria pemilihan 40 pertanyaan sebelum freeze: (1) reference answer dapat ditelusuri ke field metadata published pada snapshot yang sama; (2) peneliti dan pihak 52 Coffee menyetujui istilah, fakta, serta jawaban alternatif yang sah; (3) pertanyaan dapat dipahami tanpa riwayat, sumber eksternal, data penjualan, atau klaim medis. Pemilihan dilakukan per kategori agar tepat 10 per kategori. Cadangan hanya boleh dipertimbangkan karena masalah sumber atau validasi manusia sebelum freeze, disertai alasan dan versi dataset baru. **Jangan mengganti pertanyaan berdasarkan skor atau hasil retrieval.** Setelah freeze, setiap request dinilai eligibility-nya dari trace: `retrieval_source=pgvector`, `response_source=openai`, `catalog_context_sent=true`, pasangan `context_ids`/`context_texts` utuh, dan `catalog_context` identik dengan gabungan context yang dinilai. Jalur guardrail, deterministic response, web search, atau local/in-memory fallback dilaporkan sebagai excluded cases, tanpa mengganti fixture.

`VERIFIED BY SOURCE` hanya berarti reference dibangun dari field DB yang dibandingkan dengan sumber kode. `NEEDS REVIEW` berarti kandidat berisiko atau data tidak cukup. `HUMAN VALIDATED` diberikan hanya setelah persetujuan manusia dicatat di tabel review. Jangan menjadikan status verifikasi sumber sebagai pengganti review manusia. Setelah 40 item dikunci, kegagalan retrieval menemukan expected slug adalah hasil penelitian yang harus dilaporkan, **bukan alasan mengeluarkan kasus atau mengganti pertanyaan berdasarkan skor**.

## 3. Jalur request dan integritas context

Gunakan evaluation trace Tahap 2/3A, bukan retrieval ulang. Runner `evaluation/run_ragas.py` mengambil `trace.context_texts` dan `trace.answer` dari request yang sama, memeriksa `trace.fixture_id`, `trace.catalog_context_sent`, kesetaraan `catalog_context == "\n---\n".join(context_texts)`, dan pasangan jumlah ID/teks. Simpan hash context bersama `evaluation_request_id`; gunakan `expected_slugs` hanya untuk diagnosis retrieval, bukan sebagai context RAGAS. Pertanyaan yang secara statis terlihat layak tetap perlu pemeriksaan trace runtime karena top-k pgvector, rekomendasi/reranking, dan entity matching dapat mengubah context final.

Jangan menjalankan `run_ragas.py` langsung pada `dataset_candidates_3b.json`: runner saat ini membaca `evaluation/fixtures.json`, yang berisi fixture smoke Tahap 3A. Setelah human validation dan persetujuan pengujian final, buat **file fixture final baru** dengan pasangan `id`, `question`, `reference`, `expected_slugs` dari 40 item yang disahkan. Arsipkan SHA-256 dan jangan menimpa hasil smoke lama. Perubahan path runner untuk file final, bila perlu, harus dibatasi pada evaluasi dan ditinjau sebelum eksekusi.

## 4. Metrik dan error

Empat metrik adalah Faithfulness, Answer Relevancy, Context Precision with Reference, dan Context Recall. Input Faithfulness: pertanyaan, jawaban, context dari trace; Answer Relevancy: pertanyaan dan jawaban; dua metrik context memakai pertanyaan, jawaban referensi, dan context trace. Reference answer bukan target string exact-match; jawaban lain yang setara faktual diperbolehkan pada review kualitatif.

Untuk error evaluator, retry paling banyak **dua kali** hanya jika transient (rate limit, timeout, koneksi, 5xx) dengan backoff 2 dan 4 detik serta batas biaya yang disetujui. Jangan retry otomatis untuk input invalid, context tidak lengkap, atau reference yang salah. Simpan setiap attempt, jenis error, dan final `null` jika tetap gagal; jangan mengganti missing score dengan nol. Perubahan implementasi retry runner memerlukan review tersendiri sebelum pengujian final; runner sekarang hanya menangkap error dan memberi `None`. Nilai agregat dilaporkan bersama denominator valid per metrik, jumlah missing/error, dan distribusi per kategori. Jangan menyatukan smoke dan hasil final.

## 5. Excluded cases dan reproducibility

Catat setiap eksklusi dengan fixture ID, kategori, alasan, retrieval source, response source, fallback/guardrail status, serta apakah context lengkap. Laporkan jumlah kandidat, eligible, excluded, error, dan valid per metrik. Excluded case tidak diberi skor nol dan tidak masuk rata-rata utama. Jika pertanyaan perbandingan tidak memperoleh kedua produk dalam context, catat sebagai temuan retrieval dan pertahankan pertanyaannya; jangan menambah retrieval, mengubah algoritma, atau mengganti sampel berdasarkan hasil itu.

Manifest batch final harus menyimpan: timestamp UTC, code revision dan status dirty, hash file fixture, fingerprint knowledge base sebelum/sesudah, model generation, model evaluator, model embedding, RAGAS version, konfigurasi metrik, jumlah eligible/excluded, nilai dan error tiap metrik, serta `evaluation_request_id`/hash context tiap kasus. Gunakan satu environment lokal terisolasi dengan dependency lock Tahap 3A. Bekukan 40 pertanyaan sebelum batch; perubahan data, prompt, model, atau katalog menghasilkan versi studi baru. Jangan menganggap satu run stochastic sebagai bukti reproducibility numerik sempurna; simpan trace dan parameter untuk audit serta ulang terkontrol jika diperlukan.

## 6. Risiko yang harus diselesaikan sebelum final

- `PI12`, `PR13`, `PC12`: pertanyaan penjualan memicu `sales_question` deterministic dan tidak punya sumber penjualan.
- `PI13`, `PR12`: kesehatan memicu respons deterministic; tidak boleh diberi reference medis.
- `BS12`: navigasi Coffee Lab, bukan retrieval produk. `PC11`: perlu riwayat multi-turn dan varian produk.
- `PR11`: preferensi terlalu umum; dapat berhenti pada klarifikasi. `PI11`: harga dapat berubah.
- `PR01`–`PR10`: tidak menyebut produk target; semantic retrieval/reranking mungkin memilih jawaban alternatif yang sama-sama benar. Validasi expected slug sebagai target diagnostik, bukan satu-satunya jawaban sah.
- `PC01`–`PC10`: pencocokan entitas statis mengenali kedua slug, tetapi context generation bisa saja tidak memuat keduanya karena retrieval/reranking. Jika jalur tetap pgvector + OpenAI, nilai kehilangan context sebagai kegagalan retrieval; jangan eksklusi kasus hanya karena expected slug tidak ditemukan.
- Semua 40 usulan utama masih memerlukan pembuktian jalur pgvector + OpenAI dari trace runtime. Tidak ada API berbayar dijalankan pada Tahap 3B.

## 7. Persetujuan manusia

Peneliti memeriksa setiap reference terhadap record sumber; pihak 52 Coffee memeriksa nama produk, fakta rasa/proses/resep, dan nomenklatur yang ditampilkan ke pelanggan. Keduanya mencatat role, tanggal, keputusan, serta koreksi di `dataset_review_3b.md`. Setelah 40 item memenuhi syarat, kunci versi dataset dan minta izin terpisah sebelum evaluasi final berbayar.
