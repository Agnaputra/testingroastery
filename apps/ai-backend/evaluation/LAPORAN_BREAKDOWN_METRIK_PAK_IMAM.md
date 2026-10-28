# Rincian Metrik Pengujian Sistem Virtual Barista Berbasis Modular RAG

**Judul penelitian:** *Enhancing Specialty Coffee E-Commerce Services through a Modular RAG-Based Virtual Barista: A Case Study of 52 Coffee & Roastery*  
**Status:** rancangan untuk konsultasi metodologi; belum ada hasil pengujian final.

## Tujuan pengujian

Pengujian dirancang untuk menilai fungsi website 52 Coffee & Roastery, kualitas jawaban Virtual Barista, pengendalian interaksi, kerja sama antarbagian sistem, kemungkinan penggunaan ulang komponennya, serta bantuan yang dirasakan pengguna. Penilaian manfaat pengguna merupakan usulan tambahan yang perlu dipastikan kesesuaiannya dengan tujuan skripsi bersama Pak Imam.

## Rincian metrik

| Metode pengujian | Metrik | Apa yang diukur | Cara menghitung / menilai |
|---|---|---|---|
| **Black-Box Testing** | Test Case Pass Rate | Proporsi kasus fungsi website yang memenuhi hasil yang diharapkan. | Kasus yang **lulus** dibagi seluruh kasus yang **dijalankan** (lulus dan gagal), lalu dinyatakan dalam persen. Kasus yang belum diuji dilaporkan terpisah. |
| Black-Box Testing | Requirement Coverage | Cakupan kebutuhan sistem yang benar-benar diperiksa. | Kebutuhan yang memiliki setidaknya satu kasus yang dijalankan dan bukti hasil dibagi seluruh kebutuhan dalam ruang lingkup, lalu dinyatakan dalam persen. Ini tidak sama dengan persentase kebutuhan yang lulus. |
| **RAGAS Evaluation** | Faithfulness | Apakah pernyataan dalam jawaban didukung informasi yang ditemukan sistem. | Penilai RAGAS membandingkan klaim jawaban dengan informasi yang digunakan; hasilnya berupa proporsi klaim yang didukung, pada skala **0–1**. |
| RAGAS Evaluation | Answer Relevancy | Seberapa sesuai jawaban dengan pertanyaan pengguna. | RAGAS menilai kesamaan makna pertanyaan dan jawaban; hasilnya **skor** yang dapat berada antara **−1 dan 1**, bukan persentase kasus lulus. Jawaban relevan belum tentu benar secara fakta. |
| RAGAS Evaluation | Context Precision with Reference | Apakah informasi yang relevan muncul lebih awal di antara informasi yang ditemukan. | RAGAS menilai relevansi dan urutannya dengan membandingkan pertanyaan serta jawaban acuan; skor **0–1**. |
| RAGAS Evaluation | Context Recall | Apakah informasi penting dalam jawaban acuan berhasil ditemukan. | RAGAS menilai bagian jawaban acuan yang didukung informasi hasil pencarian; skor **0–1**. |
| **NVIDIA NeMo Guardrails Testing** | Violation Block Rate | Proporsi permintaan yang melanggar aturan dan berhasil ditolak. | Permintaan melanggar aturan yang ditolak dibagi seluruh permintaan melanggar aturan yang diuji, dalam persen. Hasil NeMo dan aturan tambahan aplikasi dicatat terpisah. |
| NVIDIA NeMo Guardrails Testing | False Rejection Rate | Seberapa sering pertanyaan sah keliru ditolak. | Pertanyaan sah yang salah ditolak dibagi seluruh pertanyaan sah yang diuji, dalam persen. Nilai lebih rendah lebih baik. |
| NVIDIA NeMo Guardrails Testing | Policy Compliance Rate | Kesesuaian keputusan akhir dengan aturan percakapan yang ditetapkan. | Skenario yang keputusan akhirnya sesuai aturan dibagi seluruh skenario sah, melanggar, dan di luar topik yang diuji, dalam persen. |
| **Integration & Reusability Testing** | Integration Test Pass Rate | Keberhasilan alur yang melibatkan beberapa bagian sistem. | Skenario integrasi yang lulus seluruh kriteria dibagi skenario integrasi yang dijalankan (lulus dan gagal), dalam persen; yang belum diuji dilaporkan terpisah. |
| Integration & Reusability Testing | Module Reuse Success Rate | Apakah komponen Virtual Barista dapat dipakai di sistem lain. | Skenario penggunaan ulang yang berhasil **tanpa mengubah logika inti AI** dibagi seluruh skenario penggunaan ulang yang dijalankan, dalam persen. Uji ini perlu mencakup antarmuka chatbot dan layanan AI, sesuai cakupan Bab I. |
| **Comparative User Testing** | Task Success Rate | Keberhasilan pengguna menyelesaikan tugas pada masing-masing kondisi website. | Tugas yang selesai dengan benar dibagi seluruh tugas yang dimulai pada kondisi tersebut, dalam persen. Orang yang sama mencoba website tanpa dan dengan Virtual Barista. |
| Comparative User Testing | Task Completion Time | Lama waktu pengguna menyelesaikan tugas. | Catat **detik** dari mulai sampai selesai atau batas waktu; bandingkan waktu kedua kondisi untuk peserta yang sama. |
| Comparative User Testing | Perceived Helpfulness | Seberapa membantu website menurut pengguna. | Setelah tiap tugas, peserta memberi nilai **1–5**; bandingkan penilaian kedua kondisi untuk peserta yang sama. |

**Catatan penilaian:** Skor yang tidak dapat dihitung dicatat sebagai tidak tersedia, bukan diberi nilai nol. Kualitas rekomendasi produk diperiksa tersendiri karena skor RAGAS tidak otomatis memastikan pilihan produknya tepat. Pada pengujian pengendalian interaksi, catat pula apakah NeMo benar-benar berjalan atau layanan sedang terganggu; keputusan aturan aplikasi tidak diklaim sebagai hasil NeMo.

## Jumlah pengujian yang direncanakan

| Metode | Jumlah | Cakupan singkat |
|---|---:|---|
| Black-Box Testing | **32 kasus** | Fungsi website, katalog, keranjang, checkout simulasi, dan Virtual Barista. |
| RAGAS Evaluation | **40 pertanyaan** | 10 informasi produk, 10 rekomendasi produk, 10 panduan/resep penyeduhan, 10 perbandingan produk. |
| NeMo Guardrails Testing | **32 skenario** | Pertanyaan sah, pelanggaran aturan, di luar topik, dan gangguan layanan. |
| Integration & Reusability Testing | **7 + 3 skenario** | Tujuh alur integrasi dan tiga percobaan penggunaan ulang komponen. |
| Comparative User Testing | **24 + 4 orang** | 24 responden utama; empat peserta pilot terpisah untuk mencoba instrumen. |

## Pertanyaan 

1. Apakah kelima metode dan metrik ini sudah sesuai dengan rumusan masalah dan tujuan penelitian, khususnya pengujian manfaat pengguna sebagai tambahan?
2. Apakah jumlah kasus, pertanyaan, skenario, dan responden yang direncanakan sudah memadai?
3. Apakah tiap metrik memerlukan batas nilai keberhasilan? Jika ya, dasar apa yang sebaiknya digunakan sebelum pengujian final?

## Status dan batas kesimpulan

Dataset dan instrumen masih disiapkan; **pengujian final belum dilakukan**. Metode pembayaran final masih dalam pembahasan dengan owner 52 Coffee & Roastery. Transfer bank dan QRIS tertulis dalam Bab I sebagai rencana awal, tetapi belum menjadi keputusan bisnis final; checkout yang tersedia saat ini masih simulasi. Karena itu, pengujian belum dapat menyimpulkan keberhasilan pembayaran nyata atau peningkatan penjualan. Cakupan pengujian pembayaran perlu disesuaikan setelah keputusan owner disepakati dengan pembimbing.
