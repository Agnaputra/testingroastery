# Tahap 3B.4 Fase B — Publication Consistency: laporan implementasi lokal

**Status:** implementasi gerbang publikasi lokal selesai sebagian; **Fase B belum memenuhi semua acceptance criteria**. IT04 harga efektif belum diimplementasikan. Tidak ada deployment, commit, push, RAGAS final, panggilan OpenAI berbayar, perubahan dataset, atau perubahan KB penelitian. Jangan lanjut ke human validation/freeze berdasarkan laporan ini.

## 1. Kondisi awal dan isolasi

- HEAD: `2cce6728e0ddc4eefe3e172f6ba8f1877c8ea67a`; checkout sudah dirty berisi pekerjaan Tahap 2–3B. Tidak ada reset/overwrite perubahan itu.
- DB penelitian lokal yang dibaca saja: `localhost:5432/testingroastery`. Fingerprint sebelum/sesudah: `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311` (`evaluation.trace.knowledge_base_version()`). Tidak ada SQL tulis ke DB ini.
- DB pengujian: container `52coffee-publication-it-3b4`, `pgvector/pgvector:pg16`, bound hanya `127.0.0.1:55432`, database `coffee_publication_it_3b4`. `schema.sql` hanya diterapkan di sini. `app/test_publication_integration.py` menolak host, port, database, atau `ENVIRONMENT` lain. Fixture produk/chunk sintetis ditulis hanya ke DB ini. Embedding adalah vector deterministik; panggilan pembuat embedding di-mock. OpenAI runtime disetel kosong dalam proses test.
- SHA-256 dataset draft `dataset_candidates_3b.json`: `50FBAE6BA29E5F8E6F2848C413490887235AF2A8903B223E07BB334CB14C97C2`, tidak berubah. Protokol `PROTOCOL_3B2_DRAFT.md`: `40632B937103025571744D2C4EFF065AAE73956D5B26F1E349B50909341C1043`, tidak berubah.

## 2. Implementasi dan file Fase B

| Area | File | Hasil |
|---|---|---|
| Otoritas admin/API | `app/publication_service.py`, `app/main.py` | Alias slug web/KB diperbarui atomik; slug tidak dikenal ditolak; GET `/api/products` gagal 503 bila status tidak tersedia. |
| Retrieval/chat | `app/rag_service.py` | SQL vector hanya menerima slug KB dikenal; hasil vector dan in-memory dibatasi produk aktif; chat memeriksa status ulang sebelum context OpenAI dan sebelum respons akhir. Embedding lama tidak dihapus/diubah. |
| Otoritas web bersama | `apps/web/lib/catalog-publication.ts`, `catalog-publication-server.ts`, `use-catalog-publication.ts` | Fetch `no-store`, pasangan alias diperiksa, unavailable menghasilkan daftar kosong. |
| Halaman publik | `apps/web/app/{catalog/page.tsx,slowbar/page.tsx,catalog/[slug]/page.tsx,page.tsx,coffee-lab/[...slug]/page.tsx}`, `apps/web/components/{catalog-content,search-modal,blend-builder-experience}.tsx` | List/detail/featured/search/saran blend ditahan sampai status terverifikasi. Detail Unpublished 404; status unavailable menampilkan state sementara tanpa fakta produk. |
| Aksi/cart/checkout | `apps/web/app/api/chat/route.ts`, `apps/web/app/checkout/page.tsx`, `apps/web/components/{editorial-product-card,catalog-product-detail,quick-view-modal,cart-drawer,blend-builder-experience}.tsx`, `apps/web/lib/{cart-publication.ts,store/useCartStore.ts}` | Kartu/action chat disaring; add-to-cart dan checkout memeriksa ulang status; item lama ditandai tidak tersedia; BYOB baru mencatat slug komponen. |
| Admin | `apps/web/app/admin/page.tsx` | Toggle publikasi nonaktif ketika status belum terverifikasi; setelah PATCH harus membaca ulang server. Editor harga masih state lokal dan **belum tersinkron**. |
| Test/audit | `app/test_publication_integration.py`, `evaluation/check_publication_snapshot_3b4.py`, `apps/web/lib/cart-publication.test.mjs`, laporan ini | Test DB terisolasi, pemeriksaan dataset read-only, unit cart. |

File Tahap 2–3B yang sudah dirty sebelum Fase B, termasuk `app/config.py`, `evaluation/run_ragas.py`, `evaluation/trace.py`, dan dataset, bukan perubahan implementasi Fase B.

## 3. Matriks IT01–IT07

Status pada tabel adalah **kriteria end-to-end Fase A**, bukan sekadar status unit subcheck. Seluruh test tanpa API berbayar.

| ID | Tujuan/kondisi awal | Langkah dan expected result | Actual result/bukti | Status dan batas |
|---|---|---|---|---|
| IT01 | Published baseline; chunk sintetis valid, tanpa override | GET status/produk, vector, semua halaman/widget harus sama harga dan variannya | `test_it01_published_retrieval`: vector mengembalikan slug Published; 31 web vs 26 KB tetap berbeda. Halaman/browser/widget dan kesamaan harga lintas sistem belum dijalankan | **NOT TESTED** end-to-end; subcheck pgvector PASS |
| IT02 | Unpublish dengan embedding lama tetap ada | PATCH false; list/detail/home/search/blend/cart/chat harus menolak | `test_it02_unpublish_retains_chunk_but_blocks_retrieval`: chunk count tetap 1, slug tidak ada pada `/api/products`, `/api/search`, dan search service. Test cart unit menolak slug. Browser, chat context, dan checkout runtime belum diuji | **NOT TESTED** end-to-end; backend PASS |
| IT03 | Republish dengan chunk; lalu tanpa chunk | PATCH true mengaktifkan produk; tanpa chunk tidak boleh diklaim pgvector | `test_it03_republish_and_no_chunk`: pgvector kembali saat ada chunk, kosong setelah chunk dihapus. In-memory fallback tetap jalur berbeda. Browser tidak diuji | **NOT TESTED** end-to-end; backend PASS |
| IT04 | Edit harga admin; reload/restart | Harga efektif berversi harus sama di admin, katalog, cart, checkout, context OpenAI | `saveProductPrice()` masih hanya `setMasterItems()`; tidak ada endpoint/tabel harga efektif. Cart menyimpan `unitPrice`, KB menyimpan harga tersendiri. Tidak ada PATCH DB test atau uji restart | **FAIL**. Implementasi harga dihentikan karena patch parsial berisiko memisahkan fakta penelitian dan harga transaksi |
| IT05 | Chunk orphan dan satu sisi alias diubah | Orphan tidak keluar, alias atomik, tidak ada publish sebagian | `test_it05_orphan_chunk_and_alias_pair`: chunk orphan disisipkan namun ditolak SQL whitelist; PATCH alias menghasilkan dua override false. Browser/widget belum diuji | **NOT TESTED** end-to-end; backend PASS |
| IT06 | Outage status dan race request/toggle | Semua jalur fail-closed; request pasca-commit aman; race in-flight dicatat | `test_it06_status_outage_fails_closed`: search kosong, `/api/catalog/publication` dan `/api/products` 503; helper web unit menolak respons malformed/error. Request paralel dan browser outage belum diuji | **NOT TESTED** end-to-end; outage backend PASS |
| IT07 | Audit 40 fixture tanpa generation | Semua expected slug aktif pada snapshot atau daftar terdampak, tanpa edit otomatis | `evaluation.check_publication_snapshot_3b4`: DRAFT, 40 selected, 26 embedded slug, `missing=[]`, `unpublished=[]`, koneksi read-only. Fingerprint KB sama seperti draft | **PASS untuk snapshot lokal ini**; wajib ulang tepat sebelum freeze |

Perintah bukti IT backend:

```powershell
$env:PUBLICATION_IT_3B4='1'
$env:ENVIRONMENT='test'
$env:DATABASE_URL='postgresql://postgres@127.0.0.1:55432/coffee_publication_it_3b4'
$env:OPENAI_API_KEY=''
.\.venv\Scripts\python.exe -B -m unittest -v app.test_publication_integration
```

Hasil: **6 tests OK**. Dari `apps/ai-backend`, `python -B -m evaluation.check_publication_snapshot_3b4` menghasilkan 40/40 expected slugs tersedia pada snapshot lokal read-only.

## 4. Regression testing

- Backend: `python -B -m unittest app.test_scope app.test_conversation_state app.test_recommendation_service app.test_action_service app.test_catalog_conversation app.test_health_conversation app.test_config app.test_evaluation_trace` → **109 tests OK**. Test evaluation trace adalah pekerjaan terdahulu dan tidak menghasilkan skor RAGAS baru.
- Web: `npm run typecheck --prefix apps/web` → **PASS**. `npm run lint --prefix apps/web` → **PASS, tanpa warning/error**.
- Web publication/cart/hydration: `node --experimental-strip-types --test lib/catalog-publication.test.mjs lib/cart-publication.test.mjs lib/store/cart-hydration.test.mjs` dari `apps/web` → **3 test files PASS**, termasuk 10 assertion publication dan 6 assertion cart.
- Tidak ada browser desktop/mobile, Next.js test instance, atau direct/proxy chat runtime test dalam run ini. Karena itu kesamaan tampilan dan respons pengguna belum diklaim terverifikasi.

## 5. Masalah terbuka dan risiko

1. **P0 harga:** IT04 gagal. Mapping harga admin (filter/espresso/reserve/cup) ke variant web dan metadata KB belum menjadi satu sumber efektif berversi; cart lama masih membawa `unitPrice`. Perlu implementasi atomik di DB test dan keputusan owner atas harga resmi sebelum memakai harga itu dalam context penelitian. Jangan menyalin harga test ke DB penelitian atau mengubah fingerprint KB diam-diam.
2. **P0 verifikasi lintas aplikasi:** IT01–IT03/05–IT06 belum memenuhi kriteria browser + API + widget + checkout. Unit/backend PASS tidak membuktikan seluruh jalur runtime. Test Next.js/FastAPI instance terisolasi masih perlu dilakukan.
3. **HTTP unavailable detail:** `/catalog/[slug]` menampilkan pesan sementara tanpa fakta produk, tetapi status HTTP route page dapat tetap 200, bukan 503 sesuai rencana. Perlu mekanisme status HTTP yang tepat sebelum mengklaim lulus.
4. **Race:** recheck backend memperkecil jendela bocor, tetapi perubahan status setelah recheck terakhir dan sebelum pengiriman network masih mungkin. IT06 paralel belum dijalankan; klaim konsistensi seketika tidak dibuat.
5. **Cart BYOB lama:** item BYOB persist yang dibuat sebelum `componentSlugs` ada akan tertahan checkout, sengaja fail-closed. Perlu UX migrasi atau rebuild setelah validasi.
6. **31 web vs 26 KB:** lima web-only slug tetap tidak masuk KB: `prau-not-chiroso-unchiro`, `sindoro-lavender-candy`, `inmaculada-pink-bourbon-marfil`, `telemung-honey-robusta-espresso`, `gayo-full-wash-arabica-espresso`. Tidak ada penambahan embedding/KB. Katalog dapat menampilkan mereka jika Published, namun RAG tidak memiliki context produk untuk klaim faktual.

## 6. Arsitektur, penelitian, rollback, dan status berikutnya

Next.js tetap berbicara dengan FastAPI melalui REST; filter publikasi dibagi antara helper web dan backend pgvector. Alias mapping masih diduplikasi lintas bahasa, sehingga drift mapping menjadi risiko modularitas. Data 40+10 dataset, reference answer, validation status, prompt/model, dan KB tidak diubah. Trace RAGAS tetap harus memakai context yang benar-benar dikirim pada request generation yang sama; perubahan publication gate dapat menyebabkan excluded case, bukan nilai nol atau penggantian fixture.

**Rollback lokal:** revert hanya file Fase B yang tercantum pada §2 menggunakan salinan/diff spesifik, jangan `git reset --hard` pada checkout dirty. Test DB dapat dibuang terpisah setelah bukti diverifikasi. Rollback filter publikasi mengembalikan risiko Unpublished bocor; gunakan hanya untuk diagnosis lokal, bukan deployment.

**Kesiapan:** **BELUM SIAP** untuk human validation/freeze. Selesaikan sumber harga efektif test-only, uji IT01–IT06 end-to-end (terutama chat context dan outage browser), perbaiki status unavailable detail, lalu ulang IT07 serta fingerprint tepat sebelum keputusan freeze. Persetujuan peneliti dan 52 Coffee tetap diperlukan; laporan ini tidak memberikan `HUMAN VALIDATED`.
