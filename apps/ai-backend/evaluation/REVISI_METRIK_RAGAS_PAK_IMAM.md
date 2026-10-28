# Usulan revisi metrik RAGAS untuk konsultasi Pak Imam

**Tanggal arahan:** 20 Oktober 2026  
**Status:** usulan naskah; belum dimasukkan ke proposal dan belum menjadi hasil pengujian.

## Ringkasan revisi metodologi

Sesuai arahan Pak Imam, hanya empat metrik **RAGAS** yang dijabarkan. Metode pengujian lain dalam rancangan Tahap 4A tetap dapat disebut sebagai bagian rencana penelitian, tetapi rincian metrik, rumus, dan tabel panjangnya tidak perlu dimasukkan ke proposal untuk konsultasi ini. Dokumen `EVALUATION_METRICS_SPECIFICATION_4A.md` tetap disimpan sebagai dokumentasi teknis internal; usulan ini tidak menghapus atau mengganti rancangan tersebut.

| Metrik RAGAS | Hal yang dinilai secara singkat |
|---|---|
| **Faithfulness** | Apakah pernyataan dalam jawaban Virtual Barista didukung konteks yang ditemukan sistem. |
| **Answer Relevancy** | Apakah jawaban sesuai dengan pertanyaan pengguna. Relevan belum tentu benar secara fakta. |
| **Context Precision with Reference** | Apakah konteks yang relevan terhadap pertanyaan dan jawaban acuan berada lebih awal dalam hasil pencarian. |
| **Context Recall** | Apakah informasi penting dalam jawaban acuan tercakup oleh konteks yang ditemukan. |

Rencana sampel tetap **40 pertanyaan utama**, terdiri dari 10 informasi produk, 10 rekomendasi produk, 10 panduan atau resep penyeduhan, dan 10 perbandingan produk. Dataset dan jawaban acuan masih berstatus **DRAFT** serta menunggu validasi manusia sebelum evaluasi final. Konteks yang dinilai harus merupakan konteks dari permintaan yang sama dengan proses pembuatan jawaban; pertanyaan yang tidak melalui jalur RAG utama dicatat terpisah. Skor empat metrik tidak dengan sendirinya membuktikan bahwa produk yang direkomendasikan sudah tepat.

## Paragraf usulan untuk proposal

> Evaluasi kualitas jawaban Virtual Barista direncanakan menggunakan Retrieval-Augmented Generation Assessment (RAGAS) pada 40 pertanyaan yang mencakup informasi produk, rekomendasi produk, panduan penyeduhan, dan perbandingan produk. Metrik yang diukur adalah **Faithfulness** untuk menilai dukungan konteks terhadap jawaban, **Answer Relevancy** untuk menilai kesesuaian jawaban dengan pertanyaan, **Context Precision with Reference** untuk menilai ketepatan urutan konteks yang relevan berdasarkan jawaban acuan, serta **Context Recall** untuk menilai kelengkapan informasi acuan yang ditemukan. Pertanyaan dan jawaban acuan akan divalidasi sebelum evaluasi final dilakukan.

## Lokasi usulan dalam proposal

1. **Bab III, subbagian metode pengujian atau evaluasi kualitas jawaban Virtual Barista** — tempatkan paragraf di atas setelah penjelasan alur RAG dan sebelum uraian dataset/prosedur pengujian. Pada PDF proposal yang tersedia (`_Bab I Proposal Skripsi _ Agna Putra _TI-4i.pdf`, 19 halaman), **Bab III belum ada**, sehingga nomor subbagian dan halaman belum dapat ditentukan. Proposal saat ini berbahasa Inggris; paragraf Indonesia ini perlu diterjemahkan dan diselaraskan dengan bahasa naskah ketika Bab III disusun, tanpa mengubah nama metrik.
2. **Bab I §1.2 butir 3, §1.3 butir 4, dan §1.4 butir 3** sudah menyatakan evaluasi menggunakan metrik RAGAS terpilih. Tidak perlu menambahkan breakdown di ketiga bagian itu.
3. **Bab II §2.2.7 RAGAS** sudah menjelaskan kerangka RAGAS dan menyatakan metrik spesifik serta dataset akan dijelaskan dalam metodologi. Pertahankan fungsi Bab II sebagai landasan teori; rincian empat metrik cukup pada Bab III atau lampiran metodologi jika diminta pembimbing.

Black-Box Testing, NVIDIA NeMo Guardrails Testing, Integration & Reusability Testing, dan Comparative User Testing tetap tercatat dalam rancangan Tahap 4A. Dalam proposal, sebutkan metode tersebut sesuai tujuan dan batasan penelitian tanpa tabel breakdown metrik individual. Cakupan Comparative User Testing masih memerlukan konfirmasi kesesuaiannya dengan rumusan masalah Bab I; usulan ini tidak menetapkan metode itu sebagai hasil atau kewajiban final.

**Batas usulan:** Tidak ada perubahan pada naskah PDF, spesifikasi 4A, dataset, kode aplikasi, database, atau hasil pengujian. Tidak ada skor RAGAS final yang diklaim.
