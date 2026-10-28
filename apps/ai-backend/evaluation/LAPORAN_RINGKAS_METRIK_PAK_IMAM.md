# Rancangan Metrik Pengujian Sistem Virtual Barista Berbasis Modular RAG

**Bahan konsultasi metodologi skripsi dengan Pak Imam**  
**Status:** rancangan pengujian, belum memuat hasil akhir.

## A. Tujuan Pengujian

Pengujian ini bertujuan menilai apakah fungsi website berjalan sesuai kebutuhan, jawaban Virtual Barista didukung informasi yang relevan, responsnya mengikuti batas keamanan, bagian-bagian sistem bekerja bersama, dan chatbot membantu pengguna menyelesaikan tugas.

## B. Rencana Metode dan Metrik Pengujian

| Metode Pengujian | Metrik | Apa yang Diukur | Cara Pengukuran | Jumlah Pengujian |
|---|---|---|---|---|
| **Black-Box Testing** | Test Case Pass Rate; Requirement Coverage | Persentase kasus yang berhasil dan cakupan kebutuhan sistem yang diperiksa. | Jalankan kasus dari sisi pengguna, bandingkan hasil aktual dengan hasil yang diharapkan, lalu petakan setiap kasus ke kebutuhan sistem. | **32 kasus** direncanakan. |
| **RAGAS Evaluation** | Faithfulness; Answer Relevancy; Context Precision with Reference; Context Recall | Dukungan informasi pada jawaban, kesesuaian jawaban, dan mutu informasi yang ditemukan sistem. | Nilai jawaban dan informasi yang benar-benar digunakan untuk menjawab, dibandingkan dengan jawaban acuan yang telah diperiksa. Hasil tiap metrik dilaporkan terpisah. | **40 pertanyaan**: 10 per kategori. |
| **NVIDIA NeMo Guardrails Testing** | Violation Block Rate; False Rejection Rate; Policy Compliance Rate | Kemampuan menolak permintaan yang melanggar aturan tanpa salah menolak pertanyaan yang sah. | Uji pertanyaan yang sah, melanggar aturan, dan di luar topik. Catat apakah keputusan berasal dari NeMo atau aturan aplikasi. | **32 skenario** direncanakan. |
| **Integration & Reusability Testing** | Integration Test Pass Rate; Module Reuse Success Rate | Kesesuaian kerja antarbagian sistem dan kemampuan modul Virtual Barista digunakan oleh aplikasi lain. | Periksa alur dari website sampai layanan Virtual Barista; coba gunakan layanan yang sama dari aplikasi pengakses kedua tanpa mengubah logika intinya. | **7 skenario integrasi** dan **3 skenario penggunaan ulang**. |
| **Comparative User Testing** | Task Success Rate; Task Completion Time; Perceived Helpfulness | Keberhasilan tugas, lama penyelesaian, dan penilaian pengguna terhadap bantuan website. | Orang yang sama mencoba website tanpa dan dengan Virtual Barista. Urutan kedua kondisi dibagi seimbang; hasil tugas, waktu, dan penilaian dibandingkan. | **24 responden**; **4 peserta pilot** terpisah. |

Jumlah tersebut masih berupa rencana dan perlu disetujui sebelum pengujian final. Pengujian integrasi menilai hubungan antarbagian sistem; Black-Box Testing menilai hasil fungsi yang terlihat oleh pengguna.

## C. Penjelasan Khusus RAGAS

- **Faithfulness:** menilai apakah pernyataan dalam jawaban chatbot didukung oleh informasi yang ditemukan sistem.
- **Answer Relevancy:** menilai seberapa sesuai jawaban dengan pertanyaan pengguna. Jawaban yang relevan belum tentu benar secara fakta.
- **Context Precision with Reference:** menilai apakah informasi yang paling relevan muncul lebih awal dalam hasil pencarian, dengan jawaban acuan sebagai pembanding.
- **Context Recall:** menilai apakah informasi penting yang diperlukan untuk menjawab pertanyaan berhasil ditemukan.

Empat puluh pertanyaan terdiri atas **10 informasi produk, 10 rekomendasi produk, 10 panduan atau resep penyeduhan, dan 10 perbandingan produk**. Ketepatan produk yang direkomendasikan akan diperiksa terpisah karena empat metrik RAGAS tidak mengukurnya secara lengkap.

## D. Hal yang Memerlukan Arahan Dosen

1. Apakah metode dan metrik pengujian ini sudah sesuai dengan tujuan penelitian?
2. Apakah jumlah pertanyaan, skenario, dan responden yang direncanakan sudah memadai?
3. Apakah perlu menetapkan batas nilai keberhasilan tertentu untuk RAGAS dan metode lainnya? Jika perlu, apa dasar penetapannya?

## E. Status Penelitian

Dokumen ini masih berupa **rancangan pengujian**. Dataset dan instrumen sedang disiapkan serta memerlukan pemeriksaan lebih lanjut; pengujian final belum dilakukan.
