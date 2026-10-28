# Tahap 3B.3 — Audit Publication Status & Knowledge Base Consistency

**Tanggal audit:** 19 Oktober 2026. **Status dataset:** DRAFT; 40 pertanyaan utama dan 10 cadangan, belum HUMAN VALIDATED dan belum frozen. **Batas bukti:** checkout lokal HEAD `2cce6728e0ddc4eefe3e172f6ba8f1877c8ea67a` dengan perubahan kerja Tahap 3B yang belum di-commit, serta database yang ditunjuk konfigurasi backend lokal. Identitas database tersebut sebagai production **tidak diverifikasi**. Pemeriksaan database bersifat read-only. Tidak ada API berbayar, toggle status, seed, atau RAGAS final.

## 1. Ringkasan arsitektur status

Terdapat tiga lapisan berbeda, bukan satu CMS produk terpadu:

1. **Admin UI:** `apps/web/app/admin/page.tsx:52-62,85-101,128-129,197-230` memuat 55 item owner snapshot ke React state. Sebanyak 31 mapping web yang telah dikodekan menjadi default Published. Toggle master row mengirim web slug dan `knowledgeSlug` pasangannya melalui `PATCH /api/catalog/publication`; UI melakukan rollback bila PATCH gagal. Harga diedit hanya di React state (`:238-263`), dan tombol Ready/Habis Slowbar hanya mengubah state lokal (`:132,987-1021`). Tidak ditemukan alur create produk persisten dari UI ini.
2. **PostgreSQL:** `app/publication_service.py:10-47` menyimpan hanya override per slug di `catalog_publication_overrides(slug, is_published, updated_at)`. Tidak adanya override berarti status default dari data dasar tetap berlaku. `app/main.py:119-145` melindungi PATCH dengan admin key dan memvalidasi bentuk slug, tetapi tidak memvalidasi slug terhadap katalog atau pasangan web/knowledge slug. `products.is_active` ada dalam `schema.sql`, namun tidak digunakan sebagai otoritas publikasi di API/chat/retrieval.
3. **Data dasar terpisah:** katalog frontend di `apps/web/lib/data.ts` dan mapping di `apps/web/lib/catalog-master.ts:94-140`; katalog AI di `app/rag_service.py:608-612`; embedding/metadata di `coffee_knowledge`. Perubahan status override tidak menyinkronkan atribut, harga, stock, atau embedding.

## 2. Temuan yang terverifikasi

| ID | Temuan | Bukti | Dampak |
|---|---|---|---|
| V1 | Katalog list `/catalog` memfilter override saat backend tersedia, tetapi mengembalikan seluruh produk default ketika backend gagal. | `apps/web/app/catalog/page.tsx:15-29`, `apps/web/components/catalog-content.tsx:67-76` | Produk yang di-unpublish dapat muncul lagi dalam kondisi layanan status gagal. |
| V2 | Halaman detail, homepage, search modal, dan sebagian Coffee Lab memakai Published statis tanpa override runtime. | `apps/web/app/catalog/[slug]/page.tsx:17-40`, `apps/web/lib/data.ts:1693-1709`, `apps/web/app/page.tsx:44-54`, `apps/web/components/search-modal.tsx:8-10`, `apps/web/app/coffee-lab/[...slug]/page.tsx:43` | Unpublish belum menjamin produk hilang dari semua halaman dan URL langsung. |
| V3 | SQL pgvector menyaring override `false`, termasuk ketika embedding masih ada. | `app/rag_service.py:792-820` memakai `COALESCE(publication.is_published, TRUE)=TRUE` | Untuk slug yang tepat dan override yang terbaca, embedding lama tidak muncul dari query vector. |
| V4 | SQL pgvector tidak membatasi hasil ke katalog aktif di kode maupun `products.is_active`; metadata tanpa `publication_status` dianggap Published. Seed mengganti chunk per slug yang masih di-seed, tanpa menghapus slug yang dikeluarkan. | `app/rag_service.py:792-820`, `app/seed_data.py:90-116` | Chunk residu/orphan dengan override kosong dapat lolos. Ini risiko desain; belum ditemukan pada snapshot DB yang dibaca. |
| V5 | Jalur product recommendation memakai `active_products` sebagai eligibility dan mengabaikan semantic slug di luar daftar itu. Jalur catalog/comparison dan `/api/search` memakai hasil vector secara langsung untuk konteks/kartu; tidak ada filter ulang terhadap `active_slugs` setelah retrieval. | `app/recommendation_service.py:163-188`, `app/rag_service.py:1322-1399`, `app/main.py:88-109` | Risiko residu vector terutama pada jawaban/konteks catalog dan comparison, bukan ranking recommendation utama. |
| V6 | Saat otoritas status DB tidak tersedia, backend menolak intent produk yang membutuhkan otoritas. Fallback in-memory juga mengambil `active_products`, bukan seluruh KB. Proxy chat dan widget menyaring kartu/action, tetapi teks jawaban tetap perlu dijaga oleh backend. | `app/rag_service.py:677-684,822-883,1032-1046,1122-1134`; `apps/web/app/api/chat/route.ts:10-12,110-155`; `apps/web/lib/catalog-publication.ts:18-39`; `apps/web/components/virtual-barista.tsx:210-265` | Ada lapisan perlindungan, tetapi bukan jaminan semua jalur dan teks bebas dari produk Unpublished. |
| V7 | Snapshot DB saat audit: 26 row `products` (semua `is_active=true`), 26 chunk ber-embedding/26 slug, 0 override, 0 varian DB; seluruh metadata chunk tidak memiliki `publication_status`. Fingerprint sama dengan dataset 3B.2. | Query read-only terhadap `products`, `coffee_knowledge`, `catalog_publication_overrides`, `product_variants`; `evaluation/trace.py:82-108` | Menetapkan snapshot lokal yang dapat diulang, tanpa membuktikan kondisi production atau skenario sesudah toggle. |
| V8 | 40 pertanyaan utama merujuk ke 26 slug unik yang semuanya ada di hasil filter Published pada snapshot DB. Tidak ada expected slug atau field sumber yang hilang. PC01–PC10 masing-masing memiliki dua sumber. | `evaluation/dataset_candidates_3b.json`; query DB read-only; `evaluation/PROTOCOL_3B2_DRAFT.md:5-20` | Validasi sumber pada snapshot ini lulus. Ketersediaan dua context di generation request dan routing pgvector + OpenAI tetap harus diuji dengan trace. |
| V9 | Frontend memiliki 31 produk Published statis; KB AI memiliki 26. Lima yang ada di web tetapi tidak di KB: `prau-not-chiroso-unchiro`, `sindoro-lavender-candy`, `inmaculada-pink-bourbon-marfil`, `telemung-honey-robusta-espresso`, `gayo-full-wash-arabica-espresso`. | Eksekusi read-only terhadap `PRODUCTS` di `apps/web/lib/data.ts` dan `PUBLISHED_COFFEE_KNOWLEDGE_BASE` di `app/rag_service.py`, dicocokkan dengan alias produk. | Virtual Barista tidak memiliki fakta RAG untuk kelima produk yang tampil di katalog web. Tak satu pun menjadi sumber 40 pertanyaan utama saat ini. |
| V10 | Untuk 26 produk yang cocok: nama, varietas, proses, roast, tasting notes, dan harga varian pada **berat yang sama** cocok; origin tidak identik sebagai string karena frontend memisahkan region/altitude sementara metadata KB menggabungkannya. Tidak ada selisih harga cup pada 22 produk KB yang memilikinya. | Pembacaan `apps/web/lib/data.ts` dan `app/rag_service.py`; pembandingan varian `weightGrams` dengan `price_<weight>g`. | Reference origin yang lebih rinci dapat tetap benar, tetapi perlu dijelaskan bahwa format tampilan web berbeda. Jangan membandingkan `basePrice` reserve 16g dengan harga KB 100g. |
| V11 | Tab Slowbar admin memuat semua 33 item owner snapshot; seluruh alias dan harga cup cocok dengan PDF menu, tetapi delapan item memiliki `listedOnWeb=Tidak`. Ready/Habis dan edit harga tidak disimpan. Tampilan harga cup admin menambahkan `k` pada angka rupiah penuh. | `apps/web/app/admin/page.tsx:975-1025`, `apps/web/lib/catalog-owner-snapshot.json`, PDF resmi `E:\Downloads\Slowbar Menu - 52 Coffee & Roastery.pdf` halaman 3-5. Rincian di `PUBLICATION_AUDIT_PRE_FREEZE.md`. | Tampilan dan status menu admin tidak boleh disamakan dengan otoritas publikasi produk pada DB. PDF bukan sumber status terkini. |

**Fingerprint snapshot:** `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311`, sama dengan `dataset_candidates_3b.json`. Jumlah kandidat utama per kategori: Product Information 10; Product Recommendation 10; Brewing Guidance / Recipe Information 10; Product Comparison 10. Semua status utama masih `VERIFIED BY SOURCE`, bukan `HUMAN VALIDATED`.

## 3. Risiko yang belum terbukti dalam runtime

- **R1: stale embedding/orphan slug.** Kode memungkinkan residu chunk masuk ke hasil pgvector jika tidak memiliki override false, tetapi snapshot DB saat ini tidak memiliki orphan atau slug mismatch. Perlu uji pada DB test, bukan menyisipkan data ke DB aktif.
- **R2: race status antar pembacaan.** `active_products` dan query vector menggunakan koneksi/pembacaan berbeda. Bila unpublish terjadi di tengah request, hasil dapat merepresentasikan dua waktu berbeda. Perlu uji konkurensi terisolasi.
- **R3: cache dan navigasi client.** `/catalog` menggunakan `force-dynamic` dan fetch `no-store`; tidak terlihat cache aplikasi/Redis untuk retrieval. Namun halaman yang sudah terbuka, prefetch/router cache Next.js, dan state widget sebelum refresh belum diuji setelah toggle. Jangan klaim semua cache aman atau bermasalah tanpa pengujian browser.
- **R4: production dan kredensial deployment.** Snapshot database yang dibaca adalah konfigurasi lokal. Kesamaan dengan production, waktu perubahan terakhir, serta override production belum diverifikasi.
- **R5: jalur aktual 40 fixture.** Kesesuaian sumber statis tidak membuktikan setiap request melewati pgvector + OpenAI atau memuat kedua produk comparison. Penilaian eligibility harus memakai trace request yang sama sesuai protokol 3B.2, tanpa API berbayar pada tahap ini.

## 4. Masalah sebelum freeze dan keputusan peneliti

| Prioritas | Masalah | Keputusan yang diperlukan |
|---|---|---|
| P0 | Kebijakan Published tidak konsisten pada semua permukaan publik dan fail-open katalog list. | Setujui otoritas status tunggal serta perilaku ketika DB status tidak tersedia, lalu perbaiki dan uji terpisah sebelum freeze. |
| P0 | Invarian “hanya Published” belum dibuktikan untuk stale vector, slug baru, dan race. | Jalankan integration tests pada DB test; tambahkan filter defensif/rekonsiliasi seed setelah hasil dan persetujuan. |
| P1 | Lima produk web Published tidak ada di KB; proses create/edit/publish tidak memperbarui embedding otomatis. | Tentukan apakah katalog dan KB harus diselaraskan sebelum penelitian, atau cakupan penelitian dibatasi eksplisit ke 26 produk pada snapshot. Jangan menyisipkan atau mengganti fixture berdasarkan skor. |
| P1 | Status nama, harga, stok, dan resep resmi belum disahkan pemilik. PDF dan snapshot owner tidak menyatakan Published terkini. | Pihak 52 Coffee mengonfirmasi versi sumber, atribut, dan status; peneliti menyetujui reference serta jawaban alternatif. |
| P1 | 40 fixture DRAFT merujuk ke 26 slug yang sekarang lolos; perubahan override/KB akan mengubah fingerprint. | Tepat sebelum freeze, periksa ulang semua slug/field dan dokumentasikan dampaknya. Jika ada sumber yang menjadi Unpublished, catat fixture ID dan minta keputusan peneliti; jangan mengganti pertanyaan otomatis. |
| P1 | Protokol 3B.2 masih membutuhkan implementasi retry evaluator dan runner fixture final; human signoff belum lengkap. | Selesaikan gate evaluasi terpisah. Tidak ada RAGAS final pada tahap ini. |

## 5. Rekomendasi Integration Testing untuk Bab III

**Lingkungan:** database PostgreSQL/pgvector test terisolasi dengan data sintetis atau salinan publik yang disetujui; FastAPI/Next.js test instance; mock/stub embedding dan OpenAI. Jangan menulis ke DB yang digunakan audit atau production. Catat code revision, fingerprint sebelum/sesudah, slug web/knowledge, timestamp, request ID, respons HTTP, trace context IDs, dan status pengecualian.

| Skenario | Langkah ringkas | Assertion utama |
|---|---|---|
| IT01 Published baseline | Satu produk biasa dan satu pasangan web/knowledge slug Published. Baca admin, list/detail/search, `/api/products`, `/api/search`, chat dan widget. | Produk konsisten, context dan kartu sesuai status; atribut/harga sama menurut berat. |
| IT02 Unpublish dengan embedding lama | Ubah override pada DB test melalui admin; jangan hapus embedding; ulang semua pembacaan. | Tidak muncul di katalog, URL detail, homepage/search, vector result, prompt context, teks rekomendasi, kartu atau action. Catat setiap kegagalan secara terpisah. |
| IT03 Publish kembali | Aktifkan kembali slug berpasangan; uji dengan chunk valid dan tanpa chunk. | Produk hanya menjadi sumber RAG bila konten/embedding valid; status UI dan backend konsisten. |
| IT04 Update atribut/harga | Edit lewat admin test, reload browser/server; periksa state, `products`, metadata/chunk, frontend, dan jawaban. | Ketidaksinkronan saat ini muncul sebagai test failure terdokumentasi; setelah perbaikan baru dinilai lulus. |
| IT05 Residu/orphan dan slug ganda | Suntik chunk stale serta override hanya pada satu slug mapping di DB test. | SQL, active catalog, semua intent chat, dan `/api/search` menolak slug tidak berotoritas. |
| IT06 Outage dan concurrency | Putus layanan status sementara; lakukan request bersamaan dengan toggle. | Tidak ada fail-open produk Unpublished atau campuran context antarreques; hasil yang tidak dapat diverifikasi jelas ditandai. |
| IT07 Dataset gate | Cek 40 `expected_slugs` dan `supporting_kb_source` terhadap snapshot test/final tanpa generation. | Semua 40 layak atau daftar fixture terdampak dibawa ke keputusan peneliti; tidak ada edit otomatis. |

Untuk pelaporan Bab III, tampilkan matriks per skenario × permukaan, status sebelum/sesudah, jumlah lolos/gagal, dan bukti trace. Pisahkan kegagalan publikasi dari kegagalan retrieval, generation, atau evaluator. Jangan gunakan hasil integration test sebagai skor RAGAS final.

## 6. Langkah berikutnya

1. Peneliti dan pihak 52 Coffee meninjau lima produk web yang tidak ada di KB serta kebijakan Published/Unpublished dan sumber menu resmi.
2. Setelah persetujuan terpisah, perbaiki gate publikasi P0 dan sinkronisasi yang disepakati; siapkan DB test dan jalankan IT01–IT07.
3. Periksa ulang fingerprint dan 40 sumber pada snapshot final; putuskan secara terdokumentasi bila ada fixture terdampak. Lanjutkan human validation dan freeze hanya setelah gate protokol 3B.2 selesai.

**Tidak ada pertanyaan dataset yang diubah, tidak ada status yang diubah, dan tidak ada dataset freeze.**
