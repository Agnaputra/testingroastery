# Tahap 3B.4 — Fase A: Rencana Publication Consistency Fix

**Status:** menunggu persetujuan peneliti; belum ada implementasi. Dasar: `PUBLICATION_AUDIT_3B3.md`, `PROTOCOL_3B2_DRAFT.md`, dan `dataset_candidates_3b.json`. Checkout saat perencanaan masih memiliki perubahan lokal Tahap 2–3B yang belum di-commit; perubahan itu harus dipertahankan. Dataset tetap 50 kandidat DRAFT (40 utama, 10 cadangan). DB audit berisi 26 slug/embedding dan 0 override; bukan bukti production.

## 1. Perilaku yang dituju

Otoritas publikasi adalah gabungan **daftar produk dasar yang memang boleh diterbitkan** dan override PostgreSQL. `false` pada slug web **atau** knowledge slug pasangannya menolak produk. Status harus diverifikasi per request/fetch; tidak ada fallback statis saat layanan status gagal. Untuk request yang dimulai setelah unpublish committed, semua permukaan katalog dan Virtual Barista harus menolak produk. Request yang telah berjalan bersamaan dengan toggle dilaporkan sebagai kondisi race tersendiri pada IT06; klaim konsistensi seketika lintas sistem tidak dibuat tanpa bukti.

Pada admin, kegagalan GET status tidak boleh membuat toggle tetap aktif dengan `publishedRows` default seolah status sudah diketahui. Tampilkan status belum terverifikasi dan nonaktifkan Publish/Unpublish sampai pembacaan ulang berhasil; setelah PATCH, muat ulang status server sebelum menyatakan perubahan tersimpan.

### Permukaan publik yang perlu diperbaiki

| Permukaan | Kondisi saat ini | Rencana fail-closed |
|---|---|---|
| `/catalog` dan `/slowbar` | `/catalog` membaca override tetapi fail-open; `/slowbar` memakai `CatalogContent` tanpa daftar status runtime. | Satu helper server status terverifikasi, `cache: no-store`. Kedua halaman mengirim hanya slug aktif. Bila gagal, tampilkan state layanan katalog tidak tersedia tanpa kartu/harga/aksi produk. |
| `/catalog/[slug]` dan metadata | `getProductBySlug()` hanya memeriksa status statis; route statis tetap dapat dibuka. | Periksa status runtime sebelum render detail dan metadata. Unpublished -> 404; otoritas unavailable -> state 503/temporary unavailable, tanpa fakta produk. |
| Homepage featured | `FEATURED_PRODUCTS` dibuat dari status statis saat module load. | Client tidak merender product rail/quick add sampai status terverifikasi, lalu filter slug. Bagian editorial homepage tetap dapat tampil. |
| Search modal | Mencari `PUBLISHED_PRODUCTS` statis. | Fetch status saat dibuka; sembunyikan hasil dan add-to-cart sampai verified, tampilkan loading/unavailable yang jelas. |
| Coffee Lab blend suggestions dan Blend Builder | Keduanya memakai `getPublishedProducts()` statis. | Server route Coffee Lab memakai helper status; Blend Builder memakai client authority yang sama dan menahan pilihan, harga, serta add-to-cart ketika unavailable. |
| Chat proxy/widget | Proxy memvalidasi kartu/action terhadap daftar statis; widget mengambil status runtime tetapi teks backend tetap lewat. | Proxy wajib memperoleh status runtime untuk respons katalog sebelum melepas kartu/action atau reply yang memuat produk. Widget tetap memvalidasi ulang. Jika authority unavailable, respons katalog memakai pesan tidak tersedia dengan struktur API yang valid; tidak ada kartu/action. |
| Cart/checkout dari Zustand persist | Produk yang ditambahkan sebelum unpublish tetap di browser. | Revalidasi slug sebelum checkout/aksi beli. Item lama ditandai generik “tidak tersedia” dan tidak dapat diproses sampai status terverifikasi; jangan diam-diam menghapus riwayat/cart pengguna. Harga checkout berasal dari sumber harga efektif yang sama. |

Helper server baru membaca `/api/catalog/publication` atau FastAPI langsung sesuai sisi server, memvalidasi bentuk payload, menerapkan mapping web ↔ knowledge slug, dan mengembalikan `{status:'verified', activeSlugs}` atau `{status:'unavailable'}`. Helper client `apps/web/lib/catalog-publication.ts` diperluas dengan semantik identik. Untuk slug ganda, perubahan API admin harus atomik dan validasi pasangan dilakukan terhadap mapping yang diketahui; tidak boleh menerima slug arbitrer sebagai cara menerbitkan record baru. Hindari menyebarkan logika filter baru ke tiap komponen.

## 2. Perlindungan retrieval dan stale embedding

1. `_search_pgvector` tetap melakukan filter SQL override, lalu membatasi slug hasil ke daftar KB yang memang publishable dan produk aktif pada snapshot request. `/api/search` harus memakai gerbang aktif yang sama dengan chat. `metadata.publication_status` yang hilang tidak dapat menjadikan slug yang tidak dikenal otomatis Published.
2. Chat mengambil `active_products` sekali dan meneruskannya ke retrieval; hasil vector maupun fallback in-memory disaring kembali terhadap `active_slugs` sebelum disusun menjadi `catalog_context`, kartu, action, atau fallback text. Produk yang tidak dikenal/di-unpublish tidak boleh masuk prompt OpenAI.
3. Untuk perubahan publish/unpublish, **jangan** regenerasi atau hapus embedding otomatis. Override false harus membuat embedding lama tidak eligible. Seed/rekonsiliasi di lingkungan test mengidentifikasi chunk orphan dan mismatch slug; prosedur publish konten baru menjadi langkah terpisah setelah fakta dan fingerprint disahkan.
4. Simpan trace evaluasi dari context yang benar-benar digunakan. Bila gerbang menolak request, tandai noneligible sesuai protokol; jangan menjadikannya skor nol atau mengganti fixture.

## 3. Harga admin dan sinkronisasi data

Saat ini `saveProductPrice()` hanya mengubah React state. Rencana: buat **sumber harga efektif di PostgreSQL test** yang menyimpan canonical web slug, variant weight/cup, nilai rupiah integer, versi, dan waktu perubahan. PATCH harga melalui session admin dan backend key; validasi slug, variant yang ada, nilai positif, dan satuan. Satu transaksi menulis seluruh varian yang diedit; kegagalan tidak boleh meninggalkan sebagian harga berubah. GET publik hanya mengembalikan harga untuk produk Published. Frontend katalog/detail/cart/checkout dan backend konteks generation membaca harga efektif yang sama, memakai nilai statis hanya sebagai baseline ketika status/harga terverifikasi belum diubah. Jika layanan harga gagal, jangan memproses checkout atau menyatakan harga edit berhasil.

Harga **tidak ditulis diam-diam ke `coffee_knowledge.metadata` atau embedding penelitian**. Metadata/embedding snapshot 3B.2 tetap. Jika harga runtime dimasukkan ke `catalog_context`, trace menyimpan konteks final dan fingerprint **effective catalog + price version**; batch penelitian diblokir bila versi berubah. Karena ini dapat mengubah jawaban harga dan perilaku commerce, implementasi harga dipisahkan dari gate publikasi dan diuji di DB test. Tidak ada penambahan lima produk KB atau penggantian reference. Sebelum aktivasi harga edit di lingkungan mana pun selain test, peneliti dan pemilik harus memutuskan harga resmi serta strategi versioning dataset.

## 4. Selisih 31 web versus 26 KB

Lima produk web Published statis yang tidak ada di KB 26: `prau-not-chiroso-unchiro`, `sindoro-lavender-candy`, `inmaculada-pink-bourbon-marfil`, `telemung-honey-robusta-espresso`, dan `gayo-full-wash-arabica-espresso`. Rencana ini **tidak** menambah mereka ke KB dan tidak mengubah 40 pertanyaan. Katalog publik tetap dapat menampilkan produk tersebut bila status web terverifikasi; Virtual Barista tidak boleh mengarang fakta RAG untuk mereka. Keputusan menyamakan cakupan katalog dan KB berada pada peneliti/pihak 52 Coffee, dengan versi KB/dataset baru bila kelak diubah.

## 5. File yang direncanakan untuk Fase B

| Kelompok | File | Perubahan terbatas |
|---|---|---|
| Otoritas publikasi web | `apps/web/lib/catalog-publication.ts`, helper server baru di `apps/web/lib/`, `apps/web/lib/catalog-master.ts` | Validasi status, mapping slug, helper fail-closed; tidak mengubah data 31 produk. |
| Halaman publik | `apps/web/app/catalog/page.tsx`, `apps/web/app/slowbar/page.tsx`, `apps/web/components/catalog-content.tsx`, `apps/web/app/catalog/[slug]/page.tsx`, mungkin layout detail, `apps/web/app/page.tsx`, `apps/web/components/search-modal.tsx`, `apps/web/app/coffee-lab/[...slug]/page.tsx`, `apps/web/components/blend-builder-experience.tsx` | Konsumsi status terverifikasi dan state loading/unavailable; jangan render kartu/aksi saat status tidak diketahui. |
| Chat dan commerce | `apps/web/app/api/chat/route.ts`, `apps/web/components/virtual-barista.tsx`, `apps/web/components/cart-drawer.tsx`, `apps/web/app/checkout/page.tsx`, shared cart validation bila perlu | Filter respons/kartu/action dengan authority runtime; cegah item lama diproses setelah unpublish. |
| Backend retrieval | `apps/ai-backend/app/rag_service.py`, `apps/ai-backend/app/main.py`, `apps/ai-backend/app/publication_service.py` | Filter SQL dan pascaretrieval, canonical slug validation, reuse snapshot aktif dalam request. `seed_data.py` hanya ditinjau untuk prosedur rekonsiliasi; tidak dijalankan pada DB aktif. |
| Harga test-only | `apps/web/app/admin/page.tsx`, route admin harga baru di `apps/web/app/api/catalog/`, service/backend endpoint harga baru di `apps/ai-backend/app/`, schema migration test, helper harga frontend/backend, `apps/ai-backend/evaluation/trace.py` bila effective price masuk context | Harga persisten dan terverifikasi pada DB test; fingerprint harga eksplisit. Tidak mengubah harga/metadata/embedding production. |
| Test dan dokumentasi | Unit/integration tests web/backend baru, runner IT01–IT07 dan hasil di `apps/ai-backend/evaluation/` | Fixture sintetis, matriks PASS/FAIL/NOT TESTED, fingerprint dan trace; tidak menyentuh dataset 3B.2. |

Daftar akhir dipersempit setelah inspeksi Fase B; tidak semua file harus berubah jika helper bersama cukup. Tidak direncanakan perubahan pada `dataset_candidates_3b.json`, signoffs, `coffee_knowledge` penelitian, prompt/model, atau katalog statis.

## 6. IT01–IT07, kriteria lulus, dan bukti

Gunakan PostgreSQL/pgvector **test terisolasi** dengan sample sintetis, Next.js/FastAPI test instance, mock embedding/OpenAI; tulis status hanya di DB test. Sebelum uji, verifikasi host/database name test secara eksplisit dan tolak URL yang menunjuk database audit/production. Catat request ID, status before/after, effective slug pair, HTTP response, context IDs, dan harga/version bila relevan.

| ID | Skenario | PASS bila |
|---|---|---|
| IT01 | Published baseline untuk slug biasa dan pasangan alias | Semua halaman/API/widget menampilkan produk yang sama dengan harga dan varian konsisten. |
| IT02 | Unpublish, embedding tetap ada | Tidak tampil pada list/detail/home/search/blend/checkout, `/api/search`, context chat, reply rekomendasi, kartu/action. |
| IT03 | Publish ulang dengan chunk valid dan tanpa chunk | Produk yang ada kembali sesuai otoritas; kasus tanpa chunk tidak diklaim sebagai pgvector retrieval. |
| IT04 | Edit harga admin, reload dan restart server | Harga efektif konsisten di admin, frontend, cart/checkout, dan context backend; versi harga/fingerprint berubah terkendali. |
| IT05 | Chunk stale/orphan dan hanya satu slug pasangan diubah | Semua jalur menolak slug yang tidak lolos gerbang; mismatch terdeteksi, tidak dipublish sebagian. |
| IT06 | Outage status dan request paralel/toggle | Semua permukaan fail-closed; request sesudah commit unpublish tidak bocor; in-flight race dicatat, tidak disembunyikan. |
| IT07 | Audit 40 fixture pada snapshot test/final tanpa generation | Seluruh slug/field aktif atau daftar fixture terdampak dilaporkan untuk keputusan peneliti, tanpa edit otomatis. |

Laporkan setiap skenario `PASS`, `FAIL`, atau `NOT TESTED` dengan bukti; pisahkan unit test, integration test, dan browser check. Jangan menjalankan RAGAS final atau OpenAI berbayar. Regresi: typecheck/lint frontend; tes publication/cart/chat backend; API direct dan proxy; browser desktop/mobile untuk state Published, Unpublished, unavailable; cek bahwa produk yang masih Published, panduan kopi umum, dan fitur nonkatalog tetap bekerja.

## 7. Risiko dan rollback

| Risiko | Mitigasi sebelum perubahan | Rollback lokal |
|---|---|---|
| Fail-closed menyembunyikan seluruh produk saat backend status bermasalah | State unavailable jelas, health check status, uji outage; jangan menghidupkan kembali fallback statis. | Revert perubahan kode pada file Fase B sambil tetap tidak menggunakan DB production; dokumentasikan bahwa kode lama memiliki kebocoran status. |
| SSR/client dapat berbeda setelah status berubah | Gunakan satu snapshot per request, no-store dan revalidasi pada aksi; uji navigasi/router cache. | Revert komponen/helper terkait secara terarah, tanpa mengembalikan dataset. |
| Filter vector terlalu ketat mengurangi retrieval | Uji 26 slug Published dan hasil context baseline, laporkan kehilangan recall. | Revert filter baru di branch lokal dan perbaiki logika; jangan mengubah embedding/KB agar lulus. |
| Sinkronisasi harga mengubah fakta jawaban/fingerprint | Pisahkan price version, uji hanya di DB test, blokir freeze ketika berubah. | Nonaktifkan endpoint/overlay harga test, pulihkan snapshot test dari seed lokal; metadata/embedding penelitian tetap utuh. |
| Slug mapping web/KB salah | Uji seluruh 31 mapping, terutama lima slug berbeda, dan validasi API. | Kembalikan mapping kode dari checkout awal; reset hanya DB test. |

Rollback berarti perubahan lokal Fase B yang tercatat secara file-by-file, **bukan** `git reset` terhadap checkout yang sudah dirty. Tidak ada commit, push, deployment, perubahan status/DB production, atau freeze dalam Fase A maupun rencana Fase B.
