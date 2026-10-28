# Persiapan freeze dataset dan checklist Tahap 3C

**Status 19 Oktober 2026: DRAFT — belum dibekukan, belum HUMAN VALIDATED.** Sumber tetap `dataset_candidates_3b.json` yang berisi 50 kandidat; 40 `proposed_final=true` menjadi usulan utama (10 per kategori, termasuk Brewing Guidance / Recipe Information). `dataset_review_3b2.md` adalah lembar pemeriksaan manusia. `dataset_signoffs_3b1_v2.json` adalah template persetujuan mesin dengan seluruh keputusan masih `false` dan identitas/tanggal kosong.

## Cara memeriksa dan mengesahkan

1. Peneliti memeriksa setiap pertanyaan, reference answer, field sumber, tingkat kesulitan, dan jawaban alternatif yang sah di `RECOMMENDATION_REVIEW_3B2.md`. Pihak 52 Coffee memeriksa fakta produk dan resep pada `SOURCE_CORRECTION_REVIEW_3B2.md`.
2. Catat keputusan kedua pihak, nama atau identitas peran, tanggal ISO `YYYY-MM-DD`, serta catatan revisi pada lembar review. Persetujuan harus terkait dengan konten yang sama.
3. Jika ada revisi pertanyaan, reference, slug, atau field sumber, simpan alasan dan perbarui **draft yang ada** sebelum persetujuan. Hash konten per fixture dan SHA-256 draft pada template signoff akan tidak cocok setelah revisi. Buat template signoff baru dengan nama versi baru, misalnya `python -m evaluation.freeze_dataset_3b1 --prepare-signoffs --signoffs-name dataset_signoffs_3b1_v3.json`; tanda tangan lama tidak dipindahkan otomatis. Jangan mengganti pertanyaan karena skor atau hasil retrieval.
4. Sesudah kedua pihak benar-benar setuju, isi template signoff: `dataset_version`, `validation_date`, dua `validators`, `reference_answers_final=true`, `source_units_confirmed=true`, dan untuk tiap 40 item `researcher` serta `owner_52_coffee` dengan `approved=true`, validator yang cocok, dan tanggal. Cadangan tetap di lembar review, tidak mendapat status final tanpa keputusan pemilihan yang terdokumentasi.
5. Jalankan preflight dari `apps/ai-backend`: `..\..\.venv\Scripts\python.exe -B -m evaluation.freeze_dataset_3b1` (tambahkan `--signoffs-name` jika menggunakan template revisi). Tanpa `--freeze`, perintah ini **tidak menulis dataset final**. Periksa semua blocker dan checksum yang diusulkan.
6. Setelah persetujuan manusia dan instruksi eksplisit untuk freeze, jalankan perintah yang sama dengan `--freeze`. Program menolak signoff kosong, hash konten yang berubah, jumlah selain 40 atau distribusi selain 10 per kategori, serta fingerprint KB yang tidak cocok. Ia juga menolak menimpa versi frozen yang sudah ada.

Output freeze yang **direncanakan**, belum dibuat: `evaluation/frozen/<dataset_version>/fixtures.json`, `manifest.json`, dan salinan `signoffs.json`. Manifest mencatat dataset version, validation date, validator, KB fingerprint, 40 pertanyaan, distribusi kategori, `dataset_checksum_sha256` dari byte fixture final, checksum draft dan signoff, revisi kode, serta waktu freeze UTC. Runner RAGAS saat ini masih membaca `evaluation/fixtures.json` milik smoke Tahap 3A; pengalihan ke fixture frozen perlu ditinjau pada Tahap 3C sebelum API berbayar. Jangan menimpa fixture atau hasil smoke.

## Checklist sebelum Tahap 3C

| Syarat | Status 19 Okt 2026 | Bukti atau tindakan |
|---|---|---|
| Human validation oleh peneliti dan 52 Coffee selesai | **BLOCKED** | 50 baris review belum ditandatangani; 40 item utama wajib dua persetujuan |
| Reference answer final dan jawaban alternatif disepakati | **BLOCKED** | Terutama alternatif `PR04`/`PR10` dan jawaban resep `BS01`–`BS10` yang baru dipersempit sesuai cakupan pertanyaan |
| Angka/satuan resep dikonfirmasi pemilik | **BLOCKED** | Encoding `°C` utuh pada 26/26 resep; akurasi resep tetap belum disahkan |
| Dataset 40 pertanyaan dibekukan | **BLOCKED** | Template signoff v2 masih kosong; template v1 historis tidak cocok dengan hash draft revisi; tidak ada direktori `frozen/` |
| KB fingerprint masih sama pada waktu freeze | **CHECK AT FREEZE** | Saat review: `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311` |
| Environment RAGAS dapat direproduksi | **RECHECK** | Lock Tahap 3A tersedia; uji instalasi bersih sebelum final |
| Kebijakan retry evaluator diterapkan dan diuji | **BLOCKED** | Protokol menyebut maksimal dua retry transient; runner saat ini belum menerapkan retry |
| Routing dan eksklusi ditetapkan sebelum hasil | **PARTIAL** | Kriteria tertulis di `PROTOCOL_3B2_DRAFT.md`. PI03 kategori informasi walau prediksi statis rekomendasi; routing aktual belum diuji. Retrieval miss pada jalur RAG tetap hasil, bukan eksklusi |
| Runner membaca fixture frozen yang benar | **BLOCKED** | `run_ragas.py` masih membaca `evaluation/fixtures.json` untuk smoke |
| Estimasi biaya dan izin API final disetujui | **BLOCKED** | Persetujuan smoke Tahap 3A tidak mencakup batch final 40 pertanyaan |

Dataset aktif: `52coffee-ragas-3b2-draft-v1`; SHA-256 draft `50fbae6ba29e5f8e6f2848c413490887235af2a8903b223e07bb334cb14c97c2`. **Ini bukan checksum dataset final.** Setelah revisi lagi, buat template signoff baru karena hash lama tidak berlaku. Template Tahap 3B.1 hanya arsip dan tidak boleh digunakan untuk freeze draft aktif.

Jangan menjalankan RAGAS final sampai semua syarat selesai. Tidak ada skor, retrieval result, atau data smoke yang dipakai untuk mengganti pertanyaan pada Tahap 3B.2.
