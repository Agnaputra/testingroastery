# Tahap 3B.4 Fase C4 — Publication Consistency Retest

Tanggal: 20 Oktober 2026. Revisi kode dasar: `2cce6728` dengan working tree lokal Fase B/C2/C3 yang tetap dipertahankan. Ini laporan pengujian development/test, bukan hasil evaluasi RAGAS atau validasi harga oleh owner.

## Dasar, isolasi, dan akar masalah

Dokumen `PUBLICATION_FIX_REPORT_3B4_PHASE_C3.md` tidak ada pada checkout ini; bukti C3 berada di bagian **C3** `PUBLICATION_FIX_REPORT_3B4_PHASE_C.md`. Kriteria asli IT01–IT07 dibaca dari `PUBLICATION_FIX_PLAN_3B4_PHASE_A.md` bagian 6.

- **IT01:** web memiliki 31 kopi Published, sedangkan KB `/api/products` memuat 26. Lima web-only: `gayo-full-wash-arabica-espresso`, `inmaculada-pink-bourbon-marfil`, `prau-not-chiroso-unchiro`, `sindoro-lavender-candy`, `telemung-honey-robusta-espresso`. Tidak ada keputusan cakupan untuk menambahnya ke KB; perbedaan seluruh katalog vs rekomendasi RAG tetap ada.
- **IT02:** C3 membuktikan request baru menolak Ijen Unpublished, tetapi teks/kartu rekomendasi yang sudah terlanjur dirender di widget tetap terlihat. Akar masalahnya adalah pesan historis tidak divalidasi ulang terhadap status publikasi/harga efektif.
- **IT04:** `clearCart()` mengosongkan sumber `grandTotal` sebelum halaman selesai membaca total; C3 menunjukkan receipt server Rp224.000 tetapi halaman sukses Rp18.000. Ada pula teks penerima/status duplikat dan klaim antrean roasting pada alur simulasi.

Frontend `127.0.0.1:3002`, FastAPI mock `127.0.0.1:8014`, PostgreSQL test `coffee_publication_it_3b4` pada `127.0.0.1:55432` dan Docker `52coffee-publication-it-3b4`. Mode harga memerlukan `ENVIRONMENT=test` dan `PUBLICATION_PRICE_TEST_MODE=1`; OpenAI Responses dan embedding diintersepsi oleh mock lokal. Tidak ada API berbayar. Database penelitian `testingroastery-pgvector` hanya dibaca untuk fingerprint. Perubahan harga/status/chunk uji dilakukan hanya pada DB test dan dipulihkan; riwayat revisi harga test tetap bertambah secara auditabel.

## Perubahan C4 dan risiko

| File | Perubahan terbatas | Risiko/sikap |
|---|---|---|
| `apps/web/lib/catalog-publication.ts` | Helper memeriksa status otoritas, fingerprint harga efektif, slug rekomendasi, dan pasangan alias sebelum jawaban katalog lama ditampilkan. | Alias tetap bergantung pada pemetaan enam pasangan yang sudah ada; uji mencakup Prau. |
| `apps/web/components/virtual-barista.tsx` | Saat widget terbuka, refresh otoritas tiap 5 detik. Jawaban, kartu, sumber, dan saran lama disembunyikan bila status/harga berubah atau tidak dapat diverifikasi. | Ada jendela maksimal sekitar 5 detik sebelum polling berikutnya; bukan pembatalan seketika lintas klien. |
| `apps/web/app/checkout/page.tsx` | Halaman selesai menyimpan total quote/receipt yang dikonfirmasi sebelum cart kosong; teks duplikat dan klaim pesanan nyata dihapus. | Hanya simulasi; tidak memproses pembayaran atau pesanan nyata. |
| `apps/web/lib/catalog-price-authority.test.mjs` | Asersi status, fingerprint, dan alias untuk jawaban katalog lama. | Tes helper tidak menggantikan bukti browser. |
| `apps/ai-backend/evaluation/c4_alias_mock_runtime.py` | Mock test-only untuk pertanyaan alias Prau, tanpa jaringan OpenAI. | Bukan keluaran model nyata; tidak digunakan sebagai data penelitian. |

Rollback kode C4: pulihkan hanya lima file di atas ke isi sebelum C4 dari cadangan/diff lokal, tanpa menyentuh perubahan Fase B/C2/C3. Jangan menjalankan `git reset --hard` pada working tree kotor. Rollback data test: nominal Ijen 100g sudah dikembalikan ke Rp65.000 pada revisi 49, status alias Published kembali, chunk alias sintetis dihapus; satu chunk Ijen sintetis dan dua override baseline test dipertahankan. Tidak ada rollback atau penulisan ke DB penelitian/production.

## Hasil IT01–IT07 menurut kriteria asli Fase A

| ID / status | Kondisi dan langkah | Expected → actual / bukti | Batas bukti |
|---|---|---|---|
| **IT01 — FAIL** | Ijen biasa dan Prau alias Published diperiksa lewat authority, detail, cart, dan widget. | Jalur produk yang ada cocok: Ijen 100g Rp65.000 baseline; Prau alias detail dan cart tersedia. Namun 31 produk web vs 26 KB masih menyisakan lima slug di atas, sehingga kriteria **semua** halaman/API/widget menampilkan cakupan produk yang sama gagal. | Tidak ada penambahan KB tanpa keputusan peneliti/owner. |
| **IT02 — FAIL (strict)** | Ijen memiliki chunk pgvector, lalu PATCH test status `false`; periksa HTTP baru dan widget dengan jawaban/kartu yang sudah tampil. | HTTP API/search/detail/cart/checkout menolak; setelah refresh otoritas, widget mengganti teks lama dengan pesan pembaruan dan menghapus kartu/tautan/saran. Namun jawaban lama sempat terlihat sampai refresh polling berikutnya (sekitar 5 detik). Syarat tidak tampil sama sekali setelah unpublish belum terbukti secara seketika. | C3 sudah memeriksa home/search/blend/Slowbar; C4 menutup celah historis secara eventual, belum menjamin invalidasi atomik pada tab terbuka. |
| **IT03 — PASS** | Unpublish/publish ulang pada DB test; validasi lagi detail/API. Kasus tanpa chunk menggunakan test publication terisolasi. | Detail Ijen kembali HTTP 200 setelah publish; suite publication 6/6 PASS dalam mode publication tanpa harga, termasuk no-chunk tidak diklaim sebagai pgvector. | Uji model OpenAI nyata tidak dilakukan. |
| **IT04 — PASS untuk kriteria asli produk retail** | Editor admin browser mengubah Ijen beans 100g Rp65.000→Rp66.000 (revisi 47→48); buka detail, cart, checkout, widget; quote dan confirm; pulihkan Rp65.000 (revisi 49). | Admin dan detail Rp66.000, cart Rp66.000, quote server revisi 48 subtotal Rp66.000 + ongkir Rp18.000 = Rp84.000, halaman selesai **Rp84.000** setelah cart 0 item. Mock context/jawaban/kartu widget juga Rp66.000. Setelah rollback nominal, jawaban lama ditandai perlu diperbarui. C3 telah menguji reload/restart admin. | BYOB/addon dan aturan biaya yang belum disahkan tetap ditolak server; ini bukan PASS untuk semua jenis checkout. Tidak ada pembayaran nyata. |
| **IT05 — FAIL (strict)** | Sisipkan chunk orphan sintetis, uji `/api/search`, bersihkan. Ubah hanya satu sisi pasangan Prau pada DB test; cek authority, `/api/products`, `/api/search`, detail, cart, dan widget yang telah memiliki jawaban/kartu alias. | Orphan tidak muncul; alias tidak dipublish parsial pada request baru: API 0 hasil, detail 404, cart item lama menjadi “Produk tidak tersedia” dan checkout nonaktif; jawaban/kartu widget alias dihapus setelah refresh. Chunk alias sintetis sementara juga tetap tidak lolos retrieval ketika status false. Semua status/chunk dipulihkan. | Tab widget yang sudah terbuka tetap dapat menampilkan jawaban lama sebelum polling berikutnya. Karena kriteria mencakup semua jalur, bukti ini belum cukup untuk PASS tanpa batas waktu yang disetujui. |
| **IT06 — PASS untuk request baru, dengan race tercatat** | Backend test dihentikan; periksa browser katalog dan modal pencarian, serta proxy authority/publication/quote. Lalu backend dihidupkan dan empat request paralel berjalan saat toggle Ijen. | Katalog 0 dan pesan unavailable; modal pencarian tanpa produk dan pesan unavailable; tiga proxy HTTP 503. C3 mencatat home/Slowbar/BYOB/detail/cart/checkout/widget fail-closed. Empat request setelah commit ke authority/products/search/chat tidak memuat slug; dua request yang mulai sebelum commit masih melihat produk. | Pesan checkout outage masih kurang spesifik. Jendela state lama pada browser dan request in-flight bukan konsistensi seketika. |
| **IT07 — PASS untuk audit snapshot** | Jalankan pembacaan fingerprint penelitian read-only dan cocokkan 40 fixture terpilih. | 26 row embedded Published; fingerprint `pgvector:f36baa310f973e0db0eeed692a357e93a86b85ae0c930a46336516f2d8d29311`; 40 fixture, `not_in_published_kb=[]`. Dataset SHA-256 `50FBAE6BA29E5F8E6F2848C413490887235AF2A8903B223E07BB334CB14C97C2`, sama dengan C3. | Ini pemeriksaan sumber otomatis, bukan HUMAN VALIDATED atau dataset freeze. |

Semua status PASS di atas dibatasi oleh kolom bukti. IT02 dan IT05 dinilai FAIL karena acceptance literal menuntut produk Unpublished tidak tampil, sedangkan polling menyisakan jendela tampilan lama. IT06 lulus untuk **request baru setelah verifikasi/commit** dan mencatat race in-flight; klaim konsistensi seketika pada semua tab tidak dibuat.

## Regresi dan data test

- Browser Chrome dan HTTP loopback nyata: Published Ijen/Prau, unpublish Ijen/alias, stale card, cart, admin harga, detail, checkout simulasi, pencarian saat outage, dan proxy 503 diperiksa. Mock hanya menggantikan panggilan berbayar OpenAI/embedding.
- `npm run typecheck --prefix apps/web`: PASS. `npm run lint --prefix apps/web`: PASS. `node --experimental-strip-types --test` pada empat file tes publication/price/cart/hydration: 4/4 PASS. Node tanpa flag tidak mengenali `.ts`; itu kesalahan perintah uji, bukan kegagalan produk.
- Backend suite dijalankan terpisah sesuai mode: `app.test_publication_integration` 6/6 PASS pada `PUBLICATION_PRICE_TEST_MODE=0`; `app.test_price_service` 6/6 PASS pada mode harga test; `app.test_evaluation_trace` 9/9 PASS pada mode publication biasa. Menjalankan ketiganya sekaligus pada mode harga menghasilkan lima error/fail karena asumsi mode dan state suite berbeda; hasil gabungan tersebut tidak dipakai sebagai PASS.
- DB test akhir: harga snapshot SHA `585925577e97df1c98faf8f494845964de81fcb0a3dec88b887e741117550838` kembali sama dengan baseline C3, Ijen 100g Rp65.000, revisi 49, satu chunk Ijen sintetis, override baseline Ijen/Sumbing true. Riwayat revisi test bertambah sebagaimana desain audit. Fingerprint KB penelitian tetap sama melalui query read-only.

## Masalah tersisa dan kesiapan dataset

1. **Keputusan cakupan diperlukan:** lima produk web-only tidak berada di KB. Jangan tambah ke snapshot penelitian atau mengubah 40+10 pertanyaan secara otomatis. IT01 tetap FAIL.
2. **Keputusan semantik konsistensi diperlukan:** polling widget menutup stale answer setelah verifikasi, tetapi tidak memberi jaminan pemblokiran seketika pada tab yang sudah terbuka. Untuk klaim ketat IT02 dan validitas keamanan publikasi, diperlukan mekanisme invalidasi langsung atau penerimaan eksplisit atas konsistensi eventual beserta ambang waktu dan prosedur uji.
3. **Aturan bisnis checkout belum lengkap:** BYOB/addon/voucher/ongkir yang belum terverifikasi tetap fail-closed sesuai C2; pengujian produk retail tidak membuktikan pembayaran atau semua variasi cart.
4. **Human validation belum selesai.** Dataset tetap DRAFT, tanpa perubahan pertanyaan, reference answer, status signoff, atau fingerprint penelitian. Belum siap freeze atau RAGAS final; validasi manusia dapat dilanjutkan untuk isi 40 pertanyaan, tetapi pengesahan dataset harus menunggu keputusan cakupan dan definisi status publikasi.

Tidak ada commit, push, deployment, perubahan aplikasi production, panggilan OpenAI berbayar, atau evaluasi RAGAS final pada C4.
