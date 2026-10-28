# Breakdown Seluruh Metrik Pengujian Virtual Barista

**Bahan diskusi dengan Pak Imam — 22 Oktober 2026**  
**Penelitian:** *Enhancing Specialty Coffee E-Commerce Services through a Modular RAG-Based Virtual Barista: A Case Study of 52 Coffee & Roastery*  
**Status:** ringkasan rancangan dan bukti yang tersedia di repository; **bukan hasil pengujian penelitian final**.

## Gambaran singkat

Rancangan Tahap 4A memuat **lima metode**. Masing-masing menjawab pertanyaan berbeda: apakah fungsi website bekerja, apakah jawaban berbasis RAG bermutu, apakah interaksi mengikuti kebijakan, apakah bagian sistem saling terhubung dan dapat digunakan ulang, serta apakah pengguna lebih terbantu. Angka pada rencana sampel belum menjadi hasil. Checkout saat ini simulasi, sehingga penelitian belum dapat menyimpulkan pembayaran nyata atau peningkatan penjualan.

| Metode | Metrik individual | Tujuan | Status bukti | Hasil yang tersedia |
|---|---|---|---|---|
| Black-Box Testing | Test Case Pass Rate; Requirement Coverage | Menilai fungsi yang terlihat pengguna terhadap kebutuhan | **Direncanakan**; matriks 32 kasus dan pemetaan kebutuhan final belum tersedia | Belum ada skor black-box yang sah. Uji integrasi tidak dihitung ulang sebagai black-box. |
| RAGAS Evaluation | Faithfulness; Answer Relevancy; Context Precision with Reference; Context Recall | Menilai jawaban dan konteks RAG | **Runner tersedia; smoke sintetis pernah dilakukan**; dataset final belum siap | Tidak ada skor RAGAS final untuk 40 pertanyaan. |
| NVIDIA NeMo Guardrails Testing | Violation Block Rate; False Rejection Rate; Policy Compliance Rate; tingkat eksekusi/ketersediaan NeMo | Menilai penolakan pelanggaran, salah tolak, dan kepatuhan kebijakan | **Adapter tersedia; studi skenario terstruktur belum ada** | Tidak ada nilai keempat metrik dari pengujian NeMo nyata. |
| Integration & Reusability Testing | Integration Test Pass Rate; Module Reuse Success Rate | Menilai alur lintas komponen dan pemakaian ulang layanan AI | **Integrasi engineering diuji sebagian; reuse direncanakan** | Laporan C4: IT01/02/05 FAIL, IT03/04/06/07 PASS dengan batas yang dijelaskan di bawah. Belum ada hasil reuse. |
| Comparative User Testing | Task Success Rate; Task Completion Time; Perceived Helpfulness | Membandingkan penyelesaian tugas tanpa dan dengan Virtual Barista | **Direncanakan**; instrumen, pilot, dan responden belum tersedia | Belum ada hasil pengguna. |

## 1. Black-Box Testing — fungsi website

**Dataset/instrumen:** rencana **32 kasus** untuk katalog/detail, status publikasi, keranjang/checkout simulasi dan harga, Virtual Barista, serta gangguan layanan. Setiap kasus perlu kebutuhan yang dituju, langkah, hasil yang diharapkan, hasil aktual, dan bukti browser/API. Daftar lengkap 32 kasus serta matriks kebutuhan–kasus belum ditemukan di repository.

| Metrik | Penjelasan sederhana | Cara mengukur |
|---|---|---|
| **Test Case Pass Rate** | Bagian kasus yang berhasil memenuhi seluruh hasil wajib. | `kasus PASS ÷ kasus yang sudah dijalankan (PASS + FAIL) × 100%`. Kasus NOT TESTED dicatat terpisah. |
| **Requirement Coverage** | Bagian kebutuhan dalam ruang lingkup yang benar-benar tersentuh pengujian. | `kebutuhan dengan sedikitnya satu kasus yang dijalankan dan berbukti ÷ seluruh kebutuhan dalam ruang lingkup × 100%`. Kebutuhan “teruji” belum tentu “lulus”. |

**Status/hasil:** baru rancangan metodologis. Browser/HTTP IT01–IT07 memberi bukti fungsi tertentu, tetapi tidak otomatis menghasilkan dua metrik black-box tanpa matriks 32 kasus dan penyebut kebutuhan yang disepakati. Kebutuhan pembayaran nyata tidak boleh dinilai lulus dari checkout simulasi.

## 2. RAGAS Evaluation — kualitas jawaban berbasis RAG

**Dataset:** 50 kandidat DRAFT; **40 usulan utama** terbagi rata menjadi 10 informasi produk, 10 rekomendasi produk, 10 panduan/resep penyeduhan, dan 10 perbandingan produk. Sepuluh lainnya cadangan. Ke-40 reference answer berstatus **VERIFIED BY SOURCE**, belum **HUMAN VALIDATED**. Evaluasi utama hanya untuk jawaban dari jalur pgvector + OpenAI dengan konteks yang benar-benar dipakai pada permintaan pembuatan jawaban yang sama. Jalur deterministic, web search, in-memory, atau fallback dicatat sebagai kasus dikecualikan, bukan diberi nilai nol.

| Metrik | Penjelasan sederhana | Cara menilai dan data yang diperlukan |
|---|---|---|
| **Faithfulness** | Apakah klaim dalam jawaban didukung informasi yang ditemukan. | Penilai memecah jawaban menjadi klaim, lalu memeriksa dukungan setiap klaim pada konteks. Masukan: pertanyaan, jawaban, konteks. Skor proporsi 0–1. |
| **Answer Relevancy** | Apakah jawaban menjawab pertanyaan pengguna. | Penilai membentuk pertanyaan balik dari jawaban dan membandingkan kemiripan maknanya dengan pertanyaan asli memakai embeddings. Masukan: pertanyaan, jawaban, model penilai, embeddings. Skor implementasi dapat −1 sampai 1; relevan belum tentu faktual. |
| **Context Precision with Reference** | Apakah konteks yang relevan muncul lebih awal dalam urutan hasil pencarian. | Penilai membandingkan konteks berurutan dengan pertanyaan dan jawaban acuan, lalu menghitung ketepatan berbobot urutan. Masukan: pertanyaan, konteks berurutan, jawaban acuan. Skor 0–1. |
| **Context Recall** | Apakah informasi penting dalam jawaban acuan berhasil ditemukan. | Penilai memeriksa bagian jawaban acuan yang didukung kumpulan konteks. Masukan: pertanyaan, konteks, jawaban acuan. Skor 0–1. |

**Implementasi dan hasil:** `run_ragas.py` memakai keempat kelas metrik RAGAS **0.4.3** dan mengambil konteks dari jejak request generation, tanpa pencarian ulang. Skor evaluator yang gagal disimpan sebagai `null` dan error, bukan nol. Smoke sintetis/offline membuktikan kompatibilitas dasar, **bukan kualitas 40 jawaban penelitian**; skor smoke tidak dicantumkan sebagai hasil skripsi. Saat ini runner masih membaca **empat fixture smoke** dari `fixtures.json`, belum dataset 40 yang dibekukan. Kebijakan retry evaluator tertulis tetapi belum diterapkan pada runner. Rata-rata per metrik dan kategori baru layak dihitung setelah kasus valid, eksklusi, dan error dicatat.

**Batas interpretasi:** empat skor ini tidak otomatis memastikan **produk rekomendasi yang dipilih benar**. Protokol 3B.2 merencanakan pemeriksaan terpisah terhadap slug produk yang sah, alternatif yang disetujui, dan rekomendasi yang tidak didukung; instrumen dan hasil finalnya belum tersedia. `retrieval_precision_at_k`/`retrieval_recall_at_k` pada runner adalah diagnostik slug, **bukan** dua metrik RAGAS Context Precision/Recall di atas.

Untuk 10 pertanyaan rekomendasi, pemeriksaan pelengkap yang **masih direncanakan** ialah **valid product hit** (kasus dengan sedikitnya satu produk sah ÷ kasus rekomendasi yang memenuhi syarat), **recommendation precision** (produk sah ÷ seluruh produk yang direkomendasikan), dan **unsupported recommendation rate** (produk tidak terbit atau tidak didukung atribut ÷ seluruh produk yang direkomendasikan). Ketiganya bukan metrik RAGAS; daftar alternatif produk harus disahkan sebelum jawaban sistem dilihat. Belum ada nilai hasil penelitian untuk ketiganya.

## 3. NVIDIA NeMo Guardrails Testing — kendali interaksi

**Dataset/instrumen:** rencana **32 skenario berlabel**: 12 permintaan melanggar kebijakan, 12 pertanyaan sah, 4 di luar topik, dan 4 gangguan runtime. Label dan hasil yang diharapkan harus ditetapkan sebelum uji. Bukti yang dibutuhkan ialah respons, status rail input/output, komponen pengambil keputusan, serta keadaan layanan NeMo. Daftar skenario final dan hasil eksekusi terstruktur belum ditemukan.

| Metrik | Penjelasan sederhana | Cara mengukur |
|---|---|---|
| **Violation Block Rate** | Seberapa sering permintaan yang melanggar aturan berhasil ditolak. | `pelanggaran yang diblokir sesuai kebijakan ÷ seluruh skenario pelanggaran yang dijalankan × 100%`. Pisahkan blokir **NeMo** dari aturan deterministik aplikasi. |
| **False Rejection Rate** | Seberapa sering pertanyaan sah justru ditolak. | `pertanyaan sah yang salah ditolak ÷ seluruh pertanyaan sah yang dijalankan × 100%`. Lebih rendah lebih baik. |
| **Policy Compliance Rate** | Seberapa sering keputusan akhir sesuai hasil yang diharapkan. | `skenario sah, melanggar, atau di luar topik yang responsnya sesuai kebijakan ÷ seluruh skenario tiga kelompok itu yang dijalankan × 100%`. |
| **Tingkat eksekusi/ketersediaan NeMo** | Apakah NeMo benar-benar sempat memberi keputusan, bukan sekadar konfigurasinya ada. | `request yang mencapai NeMo dan menerima keputusan ÷ request yang direncanakan melewati NeMo × 100%`; keadaan terganggu dan pemeriksaan yang tidak dieksekusi dilaporkan terpisah. |

**Implementasi dan hasil:** `guardrail_service.py` memuat adapter NeMo dan pemeriksaan input/output, tetapi aturan deterministik dapat mengambil keputusan lebih dulu dan layanan dapat berada pada kondisi degraded. Tes unit yang memalsukan status NeMo membuktikan sambungan kode, bukan tingkat efektivitas NeMo nyata. Belum ada angka valid untuk metrik di atas; dialog rail terpisah juga belum terbukti sebagai jalur pengujian. Nilai kepatuhan **seluruh sistem** tidak boleh diberi label hasil NeMo saja.

## 4. Integration & Reusability Testing — alur dan penggunaan ulang

**Dataset/instrumen:** tujuh skenario **IT01–IT07** dari rencana Fase A, dengan bukti browser dan HTTP pada lingkungan test terisolasi; tiga skenario reuse **R1–R3** yang direncanakan memakai klien website dan klien REST independen tanpa mengubah logika inti AI.

| Metrik | Penjelasan sederhana | Cara mengukur |
|---|---|---|
| **Integration Test Pass Rate** | Bagian alur lintas admin, katalog, backend AI, keranjang, dan checkout yang memenuhi semua kriteria. | `skenario IT yang PASS penuh ÷ skenario IT yang dijalankan (PASS + FAIL) × 100%`; NOT TESTED terpisah. Subtes unit tidak cukup untuk PASS end-to-end. |
| **Module Reuse Success Rate** | Bagian percobaan memakai layanan AI dari klien kedua tanpa mengubah logika inti. | `skenario reuse yang berhasil sesuai kontrak tanpa edit inti AI ÷ skenario reuse yang dijalankan × 100%`. Sambungan REST yang tersedia saja belum membuktikan reuse. |

**Hasil engineering yang tersedia:** laporan terbaru C4 mencatat **4 PASS dan 3 FAIL dari 7 IT** (secara aritmetis 4/7 = **57,1%** pada lingkungan test sintetis). IT01 gagal karena katalog web Published 31 produk sementara KB 26; IT02 dan IT05 gagal menurut kriteria ketat karena jawaban lama pada tab chatbot terbuka dapat terlihat sampai pembaruan status berikutnya. IT03, IT04, IT06, dan IT07 PASS **sesuai batas bukti masing-masing**: IT04 hanya untuk produk retail/checkout simulasi, IT06 untuk request baru setelah commit, IT07 audit snapshot 40 pertanyaan dan bukan validasi manusia. Angka 57,1% ini **bukan** skor kualitas RAGAS, bukti production, atau hasil integrasi final setelah blocker diselesaikan. **R1–R3 belum dieksekusi**, maka Module Reuse Success Rate belum dapat dihitung.

## 5. Comparative User Testing — manfaat bagi pengguna

**Dataset/instrumen:** rencana *within-subject*: **24 responden utama** dan **4 peserta pilot terpisah**. Orang yang sama mencoba website tanpa Virtual Barista (A) dan dengan Virtual Barista (B) pada empat pasang tugas setara: mencari informasi, memilih produk, membaca resep, dan membandingkan produk. Usulan urutan 12 AB/12 BA untuk mengurangi pengaruh urutan. Lembar tugas, rubrik jawaban, timer, kuesioner, dan rekrutmen belum tersedia sebagai instrumen final di repository.

| Metrik | Penjelasan sederhana | Cara mengukur |
|---|---|---|
| **Task Success Rate** | Persentase tugas yang selesai dengan jawaban benar pada tiap kondisi. | `tugas yang memenuhi rubrik ÷ seluruh tugas yang dimulai per kondisi × 100%`; bandingkan A dan B pada peserta yang sama. |
| **Task Completion Time** | Waktu yang dibutuhkan untuk menyelesaikan tugas. | Catat detik dari mulai hingga jawaban akhir atau batas waktu; bandingkan selisih waktu berpasangan B−A, termasuk kegagalan/timeout secara eksplisit. |
| **Perceived Helpfulness** | Penilaian peserta tentang seberapa membantu website. | Setelah tiap tugas, nilai pernyataan bantuan pada skala 1–5; bandingkan penilaian A dan B pada peserta yang sama. |

**Status/hasil:** seluruhnya masih rancangan. Belum ada pilot, responden, angka keberhasilan, waktu, atau skor persepsi. Jumlah 24 adalah rencana kelayakan dan penyeimbangan urutan, bukan hasil perhitungan kekuatan statistik. Metode ini mendukung klaim manfaat layanan bagi pengguna, tetapi perlu dikonfirmasi kesesuaiannya dengan rumusan masalah bersama Pak Imam. Tidak dapat digunakan untuk mengklaim peningkatan penjualan karena pembayaran belum nyata.

## Apakah rancangan cukup menjawab tujuan penelitian?

**Secara konsep, kelima metode saling melengkapi:** black-box menilai fungsi website; RAGAS menilai kualitas retrieval dan jawaban; guardrails menilai kendali interaksi; integrasi/reuse menilai arsitektur modular; perbandingan pengguna menilai manfaat yang dirasakan dan keberhasilan tugas. Jadi rancangan dapat menjawab tujuan teknis serta arah “enhancing services” **bila** instrumen dan pengujian finalnya diselesaikan. Saat ini bukti yang ada belum cukup untuk menyimpulkan peningkatan layanan secara ilmiah: RAGAS 40 soal belum dijalankan, NeMo nyata/reuse/pengguna belum diukur, dan tiga IT ketat masih gagal.

## Yang perlu diselesaikan sebelum klaim hasil

1. **Sepakati cakupan dan kriteria keberhasilan** bersama Pak Imam sebelum melihat skor final, termasuk apakah studi pengguna diperlukan untuk membuktikan peningkatan layanan, serta dasar jumlah sampel dan ambang nilai. Hindari cut-off RAGAS yang dipilih setelah hasil diketahui.
2. **Selesaikan validasi manusia dan freeze 40 pertanyaan.** Pastikan harga/resep/alternatif rekomendasi yang dipakai sebagai acuan disetujui; pertahankan daftar eksklusi dan jangan mengganti pertanyaan berdasarkan skor.
3. **Hubungkan runner ke dataset final dan terapkan kebijakan error/retry** yang tertulis. Catat jumlah kasus valid/eligible/tereksklusi, versi model dan KB, serta konteks request generation yang sama. Persetujuan biaya API final diperlukan terpisah.
4. **Siapkan instrumen non-RAGAS:** matriks 32 kasus black-box, 32 skenario guardrails berlabel dengan bukti NeMo vs kebijakan aplikasi, R1–R3 dari klien kedua, serta lembar tugas/kuesioner/pilot studi pengguna.
5. **Tuntaskan blocker integrasi:** keputusan cakupan lima produk web-only dan definisi konsistensi status pada tab chatbot terbuka. Ulangi IT yang gagal sebelum memakai sistem sebagai objek pengujian final.

## Dasar pemeriksaan

Sumber utama: `EVALUATION_METRICS_SPECIFICATION_4A.md`, `SUPERVISOR_METRICS_SUMMARY_4A.md`, `LAPORAN_BREAKDOWN_METRIK_PAK_IMAM.md`, `REVISI_METRIK_RAGAS_PAK_IMAM.md`, `PROTOCOL_3B2_DRAFT.md`, `FREEZE_READINESS_3B2.md`, `dataset_candidates_3b.json`, `run_ragas.py`, `test_ragas_offline.py`, `README.md`, `app/guardrail_service.py`, `PUBLICATION_FIX_PLAN_3B4_PHASE_A.md`, dan `PUBLICATION_FIX_REPORT_3B4_PHASE_C4.md`. Pemeriksaan ini membaca file repository saja; hasil runtime baru, isi `evaluation/results/` yang diabaikan Git, dan keadaan deployment/production **tidak diverifikasi**.
