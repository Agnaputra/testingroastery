# Tahap 4A — spesifikasi metrik dan protokol pengujian penelitian (DRAFT)

**Penelitian:** *Enhancing Specialty Coffee E-Commerce Services through a Modular RAG-Based Virtual Barista: A Case Study of 52 Coffee & Roastery*  
**Tanggal rancangan:** 20 Oktober 2026. Dokumen ini menetapkan cara mengukur, **bukan hasil final**. Tidak ada ambang kelulusan numerik yang disahkan dosen. Nilai contoh di bawah seluruhnya ilustrasi.

## 1. Dasar bukti dan batas penelitian

| Artefak | Yang sudah ada | Batas bukti |
|---|---|---|
| `dataset_candidates_3b.json`, `dataset_review_3b2.md`, `DATASET_REFINEMENT_3B2.md`, `RECOMMENDATION_REVIEW_3B2.md` | 50 kandidat DRAFT; 40 utama (10/kategori), 10 cadangan; reference dan slug bersumber pada KB; alternatif PR04/PR10 dicatat | Belum `HUMAN VALIDATED`, belum frozen. Tidak boleh mengubah pertanyaan/reference karena skor |
| `PROTOCOL_3B2_DRAFT.md`, `FREEZE_READINESS_3B2.md` | Unit request single-turn, gate trace pgvector+OpenAI, kebijakan eksklusi, retry yang direncanakan, manifest/review/freeze | Runner masih membaca 4 `fixtures.json` smoke; retry 2× belum diimplementasikan |
| `run_ragas.py`, `trace.py`, `test_ragas_offline.py`, `README.md` | Empat kelas metrik RAGAS 0.4.3 dipanggil; trace menyimpan context generation; skor error `null`; smoke offline dan fixture sintetis telah digunakan | Belum ada run final 40 pertanyaan; smoke bukan hasil penelitian. Trace tidak berarti semua request melewati RAG |
| `guardrail_service.py`, `guardrails/{config.yml,rails.colang,prompts.yml}`, `rag_service.py` | Adapter NeMo input/output, deterministic policy, status degraded, dan pencatatan keputusan | Konfigurasi file atau mock `passed_nemo` bukan bukti NeMo dieksekusi pada setiap skenario; tidak ada metrik guardrail penelitian final |
| `PUBLICATION_FIX_PLAN_3B4_PHASE_A.md`, laporan Fase B/C | IT01–IT07 dan browser/HTTP test terisolasi C3; IT03/IT07 PASS, IT01/IT02/IT04 FAIL, IT05/IT06 belum lengkap | Mock OpenAI dan DB sintetis; bukan validasi full KB production. Halaman checkout sukses salah total; kartu chat lama tetap terlihat sesudah unpublish; web 31 vs KB 26 |

Status keseluruhan: protokol dan instrumen **sebagian tersedia**, lima metode belum menghasilkan kesimpulan ilmiah final. Fingerprint KB yang dibaca read-only di C3: `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311` (26 produk Published). Nilai ini wajib dicek lagi pada saat freeze dan setiap batch; bukan janji bahwa KB tidak berubah. Harga efektif runtime berversi terpisah dari snapshot metadata/embedding; catat revisi harga dan jangan menyebut fingerprint KB sebagai bukti harga identik. Checkout/pembayaran adalah simulasi.

## 2. Matriks metode, unit, instrumen, dan kesiapan

| Metode | Metrik utama | Unit/denominator | Instrumen utama | Status 4A |
|---|---|---|---|---|
| Black-box | Test Case Pass Rate; Requirement Coverage | test case; requirement | matriks requirement–case, log HTTP, rekaman browser, expected/actual | **Dirancang**; kasus C3 tersedia tetapi belum matriks black-box lengkap |
| RAGAS | Faithfulness; Answer Relevancy; Context Precision with Reference; Context Recall | skor per fixture eligible dan per kategori | frozen fixture, trace request yang sama, runner RAGAS 0.4.3 | **Dukungan kode dan smoke**; dataset final/runner/retry belum siap |
| NeMo Guardrails | Violation Block Rate; False Rejection Rate; Policy Compliance Rate; availability/degraded rate | skenario berlabel dan per komponen keputusan | suite skenario, `/health`, API response + trace input/output | **Dirancang**; adapter ada, studi NeMo nyata belum dilakukan |
| Integration & Reusability | Integration Test Pass Rate; Module Reuse Success Rate | IT end-to-end; skenario reuse independen | IT01–IT07, dua klien REST, trace/HTTP/DB test | **Sebagian diuji**; C3 memiliki FAIL/NOT TESTED; reuse belum dibuktikan |
| Comparative user | Task Success Rate; Task Completion Time; Perceived Helpfulness | percobaan tugas per responden per kondisi | lembar tugas, timer/event log, rubrik dan kuesioner | **Dirancang**; belum rekrut/pilot |

### Aturan umum pelaporan

Selalu tampilkan pembilang, denominator, persentase, kategori, alasan eksklusi, status `PASS/FAIL/NOT TESTED`, versi instrumen, dan bukti. `NOT TESTED`, skor `null`, dan error evaluator **bukan nol maupun PASS**. Jangan memakai unit/backend mock sebagai pengganti bukti browser end-to-end, NeMo runtime, atau pengalaman responden. Kriteria kelulusan *release gate* berbeda dari hipotesis peningkatan pengalaman pengguna. Threshold yang diusulkan di §8 memerlukan persetujuan dosen sebelum melihat data final.

## 3. Black-box testing

**Definisi operasional.** Satu test case memuat requirement ID, precondition, input/aksi melalui antarmuka publik, expected result yang dapat diamati, actual result, evidence (HTTP/DOM/screenshot/log), tingkat kritis, dan status. Black-box menguji kontrak yang terlihat pengguna tanpa menyimpulkan kebenaran fungsi internal. Integration testing di §6 menguji propagasi antar modul/status lintas layanan dan memiliki denominator tersendiri; satu eksekusi boleh menjadi bukti kedua metode hanya jika kedua kriteria terdokumentasi, tanpa menjumlahkan kasus dua kali.

- `Test Case Pass Rate = jumlah case PASS / jumlah case yang dieksekusi (PASS+FAIL) × 100%`; laporkan juga `NOT TESTED / seluruh case yang direncanakan`. Case multi-langkah PASS hanya jika seluruh expected result wajib terpenuhi. Contoh ilustrasi: 27 PASS, 3 FAIL, 2 NOT TESTED dari 32 rencana → pass rate `27/30=90%`, execution coverage `30/32=93,75%`.
- `Requirement Coverage = jumlah requirement yang memiliki ≥1 case dieksekusi dengan evidence / seluruh requirement in-scope × 100%`. Laporkan **verified requirement coverage** terpisah: requirement yang seluruh case wajibnya PASS dibagi seluruh requirement. Contoh: 12 dari 15 requirement tersentuh → 80%; 9 dari 15 lulus seluruhnya → 60%.
- Rencana **32 case** sebagai ukuran kerja awal: katalog/detail 6, status publikasi 6, cart/checkout simulasi dan harga 8, Virtual Barista 8, kegagalan layanan/aksesibilitas dasar 4. Jumlah final ditentukan setelah pemetaan requirement, bukan dipaksakan untuk mencapai skor. Minimal satu kasus normal dan satu kasus gagal/batas untuk tiap requirement kritis (Unpublished, harga server, privasi, outage, status pesanan simulasi). Browser desktop dan viewport mobile yang benar-benar terukur, API direct/proxy, serta log revisi dipakai sesuai kasus.
- **Kriteria usulan:** seluruh requirement keselamatan publikasi, harga transaksi, dan privasi harus terverifikasi PASS; seluruh case direncanakan harus dieksekusi atau diberi alasan `NOT TESTED`; pass rate keseluruhan dilaporkan tanpa cut-off statistik yang belum disetujui. Ini release gate berbasis risiko kebocoran produk/nominal, bukan bukti kualitas RAG. IT01/IT02/IT04 C3 membuat gate saat ini belum terpenuhi.

## 4. RAGAS evaluation dan ketepatan produk

**Sampel.** Tepat 40 utama dari draft 3B.2, masing-masing 10 Product Information, Product Recommendation, Brewing Guidance / Recipe Information, Product Comparison. Pertanyaan single-turn dan reference tetap. Sepuluh cadangan tidak otomatis menggantikan fixture yang gagal route/retrieval. Hanya jalur trace `retrieval_source=pgvector`, `response_source=openai`, `catalog_context_sent=true`, pasangan ID/teks utuh berurutan, dan `catalog_context == "\n---\n".join(context_texts)` yang masuk skor utama. Trace dan jawaban harus dari **request generation yang sama**; dilarang retrieval kedua untuk scoring. Retrieval miss pada jalur eligible tetap kasus penelitian, bukan eksklusi. Catat semua kasus noneligible dengan alasan (deterministic, web, in-memory, local fallback, guardrail, authority gagal), tanpa skor nol. Jika penulisan trace gagal, fixture/batch ditandai error, bukan dianggap tidak ada.

| Metrik RAGAS 0.4.3 (`ragas.metrics.collections`) | Definisi operasional dan mekanisme | Input runner | Skor |
|---|---|---|---|
| `Faithfulness` | LLM evaluator memecah jawaban menjadi klaim, menilai apakah setiap klaim didukung retrieved contexts; proporsi klaim didukung. Tidak otomatis membuktikan fakta sumber benar | `user_input`, `response`, `retrieved_contexts`, evaluator LLM | 0–1; 1 = semua klaim yang dinilai didukung. Jawaban kosong/klaim tak terurai = error/missing sesuai output evaluator, bukan diasumsikan benar |
| `AnswerRelevancy` | Evaluator menghasilkan pertanyaan balik dari jawaban; embedding membandingkan kesamaan semantik dengan pertanyaan asli (rata-rata sampel). Mengukur responsivitas, bukan kebenaran faktual | `user_input`, `response`, evaluator LLM, evaluator embeddings | Skor implementasi dapat berada `−1..1` (runner mengizinkan itu); jangan paksa negatif menjadi 0. Semakin tinggi semakin relevan; label kualitas perlu kalibrasi |
| `ContextPrecisionWithReference` | Evaluator memberi label relevansi pada context **sesuai urutan retrieval** terhadap pertanyaan dan reference, lalu menghitung precision berbobot peringkat/AP | `user_input`, `reference`, `retrieved_contexts`, evaluator LLM | 0–1; tinggi berarti context relevan cenderung muncul lebih awal |
| `ContextRecall` | Evaluator memecah reference menjadi pernyataan dan memeriksa bagian yang didukung gabungan contexts | `user_input`, `reference`, `retrieved_contexts`, evaluator LLM | 0–1; tinggi berarti fakta reference tercakup context. Reference yang belum sah mengganggu interpretasi |

Nama field dan kelas di atas mengikuti `run_ragas.py`; version pin evaluasi lokal adalah **RAGAS 0.4.3**, LangChain 0.3.27, OpenAI SDK 2.54.0, default evaluator `gpt-4.1-mini` dan embeddings `text-embedding-3-small` dari `app/config.py`. Simpan nilai aktual dari environment/batch, jangan menganggap default pasti dipakai. Empat metrik memakai reference manusia yang disahkan; Faithfulness dan Answer Relevancy tidak memakai reference sebagai input langsung. Context Precision/Recall bergantung pada reference. Skor RAGAS adalah estimasi evaluator LLM, bukan ground truth; audit manual sampel kasus ekstrem dan perbedaan antar kategori diperlukan.

**Agregasi:** tampilkan skor per fixture; mean dan median per metrik untuk case dengan skor valid; `n_valid/n_eligible/40`, missing/error, mean per kategori (n=10 hanya jika semua eligible/valid), dan sebaran/rentang. Jangan menghitung satu angka komposit dari empat metrik karena konstruksinya berlainan. Contoh ilustrasi Faithfulness `[1, 0,5, null]` → mean `0,75` dari 2 valid, `1/3` missing; bukan `0,5`. Skor negatif Answer Relevancy tetap dicatat, tidak dipotong. Jika jumlah eligible rendah, simpulkan keterbatasan coverage, jangan hanya memamerkan mean tinggi pada subset.

**Error/retry:** protokol 3B.2 mengusulkan maksimal dua retry untuk timeout, koneksi, 429/5xx, jeda 2 dan 4 detik serta plafon biaya; input invalid/reference salah/context hilang tidak diulang. Simpan attempt, jenis error, dan skor akhir `null` jika gagal. **Runner saat ini belum menerapkan retry terkontrol**: `score_metrics()` menangkap exception per metrik dan menulis `None/score_errors`; kemungkinan retry internal SDK/library harus diinventarisasi sebelum estimasi biaya dan tidak boleh disebut sesuai protokol tanpa verifikasi. Tetapkan kebijakan serta uji offline sebelum batch final.

**Metrik rekomendasi terpisah (PR01–PR10).** RAGAS tidak memastikan slug produk tepat. Gunakan daftar slug utama dan `acceptable_alternatives` yang disahkan **sebelum** melihat jawaban: `valid_product_hit = case dengan ≥1 rekomendasi sah / seluruh case PR eligible`; `recommendation_precision = slug sah / semua slug yang direkomendasikan` (undefined bila tidak ada slug); `unsupported_recommendation_rate = slug tidak terbit/tidak didukung atribut / semua slug rekomendasi`. Laporkan kasus tanpa rekomendasi dan ketidaksesuaian reference tunggal PR04/PR10. Untuk PC, audit kedua slug dalam context dan jawaban secara terpisah. Harga dinilai terhadap price revision runtime, bukan dianggap benar karena cocok dengan metadata KB lama.

## 5. NVIDIA NeMo Guardrails testing

**Label skenario sebelum eksekusi:** `V` = permintaan melanggar kebijakan (prompt injection, permintaan system prompt, data privat/HPP, penyalahgunaan); `L` = permintaan kopi/katalog sah; `O` = off-topic/di luar scope; `D` = gangguan runtime NeMo. Minimal rencana awal **32 skenario unik**: 12 V, 12 L, 4 O, 4 D. Parafrasa Indonesia/Inggris dan injeksi yang menyisipkan instruksi dalam pertanyaan/context perlu tercakup. Label expected decision disetujui peneliti sebelum uji; off-topic jangan otomatis diperlakukan sebagai pelanggaran keamanan.

| Metrik | Rumus dan denominator | Catatan interpretasi |
|---|---|---|
| Violation Block Rate (VBR) | `V yang diblokir sesuai policy / seluruh V yang dieksekusi × 100%` | Pecah `blocked_input_nemo`, `blocked_output_nemo`, dan `blocked_*_policy`. Total sistem tidak boleh dinamai efektivitas NeMo |
| False Rejection Rate (FRR) | `L sah yang ditolak secara keliru / seluruh L yang dieksekusi × 100%` | `degraded_custom_*` yang tetap menjawab bukan rejection; salah menjawab diukur terpisah |
| Policy Compliance Rate (PCR) | `skenario yang respons akhirnya sesuai expected policy / semua V+L+O yang dieksekusi × 100%` | Termasuk kasus V lolos, L ditolak, O dijawab general; klasifikasi kegagalan per lapisan |
| NeMo execution/availability rate | `request yang benar-benar mencapai rail NeMo dan memperoleh verdict / request yang direncanakan untuk NeMo × 100%` | Laporkan runtime ready, error, `degraded_custom_*`, dan not-executed. Pada D, ukur apakah fallback deterministic tetap aman; jangan masukkan D ke VBR NeMo normal tanpa strata |

**Bukti:** `/health.guardrails` sebelum/selama batch, trace `input_guardrail` dan `output_guardrail`, `guardrailStatus`, route/response source, HTTP reply. `guardrail_service.check_input/check_output` menjalankan deterministic phrase check **sebelum** `_rails.check`; status `blocked_*_policy` adalah aplikasi, `blocked_*_nemo` adalah NeMo. Saat NeMo tidak tersedia, adapter mengizinkan dengan `degraded_custom_*` kecuali phrase policy mendeteksi pelanggaran: ini **degraded/fail-open terhadap kasus yang tidak terjangkau phrase list**, sehingga harus dilaporkan, bukan dihitung sebagai NeMo PASS. Beberapa response deterministic berhenti sebelum output rail; catat `not_executed`. `rails.colang/config.yml` mendefinisikan input/output rails; **dialog rails tidak terpasang sebagai alur terpisah yang dapat diklaim diuji**. Pengujian NeMo nyata mungkin memakai evaluator model berbayar; estimasi dan izin terpisah sebelum memanggilnya. Mock dapat menguji plumbing/status, bukan akurasi kebijakan NeMo.

Contoh ilustrasi: 9 dari 12 V diblokir sistem = VBR sistem 75%; jika 3 oleh policy dan 6 oleh NeMo, laporkan 3/12 dan 6/12 beserta overlap/urutan, bukan menulis NeMo 75%. Jika 1 dari 12 L salah ditolak, FRR 8,33%.

## 6. Integration dan reusability testing

`Integration Test Pass Rate = IT end-to-end PASS / IT yang dieksekusi PASS+FAIL × 100%`, dengan `NOT TESTED` dan jumlah semua 7 dilaporkan. IT01 Published lintas API/UI/widget; IT02 Unpublished meski embedding lama; IT03 republish/chunkless; IT04 edit harga/revisi lintas admin–checkout–chat; IT05 orphan/alias; IT06 outage dan race; IT07 audit dataset/snapshot tanpa generation. Definisi PASS adalah **seluruh acceptance criteria Fase A**, bukan subtest unit. Berdasarkan C3: 2 PASS (`IT03`, `IT07`), 3 FAIL (`IT01`, `IT02`, `IT04`), 2 NOT TESTED penuh (`IT05`, `IT06`): pass rate teramati `2/5=40%`, execution coverage penuh `5/7`. Ini **status pengujian engineering C3 pada environment sintetis**, bukan skor akhir penelitian atau bukti integrasi production.

`Module Reuse Success Rate = skenario reuse yang selesai tanpa perubahan logika inti AI / seluruh skenario reuse yang dieksekusi × 100%`. Rencana **3 skenario**, untuk dua klien REST terisolasi: (R1) klien Next.js memanggil FastAPI `/api/chat`; (R2) klien kedua berupa script HTTP independen dengan skema request yang sama, memeriksa jawaban terstruktur dan trace; (R3) klien kedua menjalankan query produk dan skenario guardrail/error serta memvalidasi kontrak tanpa import Next.js/ubah `rag_service.py`. Keduanya memakai KB dan konfigurasi test yang sama, data Published, request ID terpisah; catat jumlah file AI yang diubah (target 0), status HTTP, schema, source, latency, serta apakah konfigurasi URL/credential diubah. Keberhasilan arsitektur terpisah saja belum membuktikan R1–R3; adaptor 52 Coffee, slug/format harga, dan katalog tetap ketergantungan domain yang perlu dinyatakan. Contoh ilustrasi: 2 PASS, 1 FAIL → `2/3=66,7%`; belum ada hasil aktual.

## 7. Comparative user testing (within-subject)

**Kondisi:** A = website tanpa akses Virtual Barista; B = website dengan Virtual Barista. Katalog, harga, status Published, perangkat, koneksi, dan task brief dibekukan sama; checkout adalah simulasi. Rencana awal **24 responden** yang sesuai target pengguna (misalnya calon pembeli kopi specialty dengan variasi pengalaman), plus pilot 4 orang yang **tidak** masuk analisis utama. Angka 24 dipilih karena memungkinkan 12 urutan AB dan 12 BA serta studi kelayakan skripsi; **bukan** hasil power analysis atau dasar klaim efek kecil. Jika dosen meminta inferensi dengan power tertentu, lakukan perhitungan sampel sebelum rekrutmen final.

Setiap responden menyelesaikan **4 pasangan tugas setara** (informasi produk, memilih produk sesuai preferensi, resep seduh, membandingkan dua produk), satu versi A dan satu versi B per pasangan, total 8 trial/responden. Dua set pertanyaan paralel disusun dan divalidasi kesulitannya; jangan menggunakan 40 fixture RAGAS sebagai instruksi yang dihafal/dibocorkan. Counterbalance 12 AB/12 BA; rotasi set X/Y dan urutan empat kategori dengan Latin-square sederhana agar urutan dan pembelajaran tidak searah. Catat pengalaman kopi awal, literasi digital, perangkat, serta urutan. Beri batas waktu seragam yang disetujui dosen (usulan 5 menit/trial); timeout = gagal dengan waktu tersensor pada batas tersebut.

| Metrik | Definisi dan rumus | Instrumen |
|---|---|---|
| Task Success Rate | `trial yang memenuhi rubrik hasil benar / seluruh trial yang dimulai per kondisi × 100%`; rubrik sebelum uji: produk Published dan atribut/resep benar, dua produk untuk comparison, tidak memilih klaim medis/best seller tanpa data. Bantuan moderator = gagal atau strata terpisah yang ditetapkan sebelum uji | lembar task, jawaban akhir, rubrik penilai yang tidak melihat kondisi bila mungkin |
| Task Completion Time | detik dari instruksi selesai dibaca/klik mulai sampai jawaban akhir dikirim atau timeout; bandingkan median, IQR, dan selisih berpasangan B−A. Jangan menghitung hanya trial sukses tanpa melaporkan bias seleksi; laporkan juga waktu pada sukses saja sebagai analisis sekunder | timer/event log lokal, timestamp dan aturan pause yang sama |
| Perceived Helpfulness | skor 1–5 sesudah tiap trial untuk pernyataan “Fitur website membantu saya menyelesaikan tugas ini”; ringkas median/distribusi dan selisih berpasangan. Instrumen bahasa Indonesia diuji coba pilot; tambahan komentar bebas untuk alasan skor | skala Likert 1 sangat tidak setuju–5 sangat setuju, form anonim |

Analisis utama memakai **pasangan responden**: selisih proporsi sukses per peserta B−A, median selisih waktu, dan median selisih helpfulness; tampilkan tabel per kategori/urutan AB-BA dan interval ketidakpastian bootstrap berpasangan bila jumlah data memadai. Uji McNemar untuk sukses berpasangan pada pasangan tugas setara; Wilcoxon signed-rank atau bootstrap paired untuk waktu/helpfulness jika layak, laporkan effect size dan CI, bukan hanya p-value. Karena 4 tugas berulang per orang, analisis trial tidak boleh menganggap 192 trial independen; agregasikan per peserta atau gunakan model berkelompok bila dipraregistrasi. Semua data pengguna diberi ID anonim dan hanya hasil tugas/penilaian minimal disimpan dengan persetujuan; jangan simpan identitas atau chat pribadi mentah.

Ancaman: pembelajaran lintas kondisi, perbedaan kesulitan set X/Y, novelty chatbot, pengalaman kopi, gangguan backend/degraded mode, bias moderator, dan penilai mengetahui kondisi. Counterbalance, pilot, skrip instruksi identik, rubrik buta, dan pencatatan outage mengurangi tetapi tidak menghapusnya. **Jangan mengklaim peningkatan penjualan/conversion** karena checkout dan pembayaran hanya simulasi.

## 8. Kriteria keberhasilan dan keputusan sebelum data final

1. **Gate teknis wajib:** semua requirement kritis Black-box PASS dan IT01–IT07 PASS end-to-end pada environment yang didefinisikan; 100% cakupan requirement kritis. Ini didasarkan pada tidak dapat diterimanya produk Unpublished/harga salah, bukan threshold kualitas model. Jika scope 31 web vs 26 KB tetap berbeda, IT01 perlu keputusan tertulis: perbaiki sistem atau revisi klaim/kriteria melalui protokol versi baru **sebelum** run final; jangan memalsukan PASS.
2. **RAGAS:** laporkan empat distribusi beserta coverage/error; **tidak menetapkan cut-off 0,8/0,9 secara arbitrer**. Usulan keputusan ilmiah adalah membandingkan kategori dan audit jawaban buruk dengan rubrik manusia; dosen menyetujui apakah perlu ambang minimum dan dasar empirisnya (pilot/rujukan atau kebutuhan bisnis) sebelum melihat final.
3. **Guardrails:** zero toleransi untuk kebocoran informasi sensitif yang terbukti pada skenario wajib; VBR, FRR, PCR dan availability tetap dilaporkan sebagai nilai observasi, dipisah NeMo/aplikasi. Nol pelanggaran pada sampel kecil tidak membuktikan keamanan universal. Tentukan target numerik dengan dosen/pemilik berdasarkan risiko dan jumlah skenario, sebelum pengujian.
4. **Reuse:** R1–R3 harus berhasil tanpa edit logika AI untuk klaim reuse pada kontrak yang diuji; tidak mengklaim portable lintas seluruh e-commerce. **User comparison:** perbedaan B−A, CI, dan pola kategori dilaporkan; klaim “enhancing” hanya bila efek teramati konsisten, bukan karena satu metrik signifikan atau kesan peserta saja. Tetapkan minimal effect yang bermakna dan power/sampel bersama dosen.

## 9. Urutan eksekusi dan manifest bukti

1. Sahkan definisi requirement, rubrik, target sampel/threshold, serta instrumen bersama dosen. Selesaikan FAIL C3 dan kasus NOT TESTED; bedakan keputusan bisnis lima produk web-only dari perbaikan kode.
2. Human validation peneliti + pihak 52 Coffee untuk 40 reference, alternatif rekomendasi, resep/satuan, dan harga baseline bila harga diuji. Setelah itu baru freeze dataset dengan manifest/checksum. Jangan memindahkan status `VERIFIED BY SOURCE` menjadi `HUMAN VALIDATED` otomatis.
3. Verifikasi environment RAGAS clean install, fingerprint KB read-only, price revision, route eligibility, pengalihan runner ke frozen fixture, retry/budget. Estimasi dan minta izin API berbayar **tersendiri**. Jalankan batch final sekali menurut protokol, arsipkan trace, termasuk excluded/missing.
4. Jalankan black-box dan integration pada snapshot terkunci, guardrail suite dengan runtime NeMo yang dibuktikan, kemudian reuse test dua klien. Urutan ini bisa disesuaikan untuk menghindari perubahan sistem setelah freeze; setiap perubahan menghasilkan versi run baru yang dijelaskan.
5. Pilot lalu comparative user study ketika website stabil. Pisahkan hasil smoke, engineering, pilot, dan penelitian final.

Manifest setiap batch: timestamp UTC, environment, Git revision **dan dirty diff/hash**, dataset version/checksum, KB fingerprint sebelum/sesudah, price revision, model generation/evaluator/embedding, RAGAS/SDK versions, request/fixture ID, context hash dan ID berurutan, guardrail route/status, outcome/error/retry, serta bukti instrumen. Simpan data anonim dengan akses terbatas; trace katalog publik bukan izin untuk menyimpan percakapan pelanggan.

## 10. Keputusan yang perlu persetujuan Pak Imam/peneliti

| ID | Keputusan sebelum uji final | Usulan untuk dibahas |
|---|---|---|
| M1 | Rumusan hipotesis dan prioritas outcome | Nyatakan RAGAS/guardrail sebagai kualitas sistem; pengalaman pengguna sebagai efek comparative; tanpa klaim transaksi nyata |
| M2 | Ambang kualitas RAGAS dan gate lain | Jangan menetapkan angka tanpa dasar; gunakan distribusi + audit manusia, atau kalibrasi pilot/rujukan yang disetujui sebelum final |
| M3 | 32 black-box case dan pemetaan requirement | Setujui daftar requirement kritis, rubrik PASS, perangkat/browser, serta apakah semua tujuh IT wajib sebagai gate |
| M4 | 32 guardrail scenario, pelabelan dan biaya | Setujui policy V/L/O/D dan apakah memerlukan run NeMo berbayar; pisahkan NeMo dari deterministic/degraded |
| M5 | 24 responden, 4 pasangan tugas, batas waktu dan analisis | Setujui kelayakan/power, rekruitmen, counterbalance, kuesioner dan consent |
| M6 | Scope 31 web vs 26 KB dan harga | Putuskan klaim cakupan chatbot/IT01; validasi harga/resep pemilik tanpa mengubah KB penelitian diam-diam |
| M7 | Risiko C3 dan freeze | Perbaiki IT02/IT04, lengkapi IT05/IT06, tentukan gate human validation/freeze sebelum final |

**Status:** draft untuk review metodologi. Tidak ada pengujian final, API berbayar, freeze, atau perubahan aplikasi/KB pada Tahap 4A.
