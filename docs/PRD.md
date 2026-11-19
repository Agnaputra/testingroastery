# PRD — 52 Coffee & Roastery Website Redesign
**Dokumen:** Product Requirements Document (sitewide)  
**Versi:** 0.1 — baseline dan rancangan target untuk review  
**Tanggal:** 19 November 2026  
**Basis audit:** \`main\` @ \`eb17643c73cd08ba9a6cfc7db6be7821e6543d19\`  
**Ruang lingkup:** aplikasi web publik, customer commerce, Coffee Lab, Partnerships, Events, dan admin UI. Backend, database, serta riset Virtual Barista dipertahankan kecuali perubahan kontrak yang disetujui terpisah.

> **Status dokumen:** Perilaku **AS-IS** diambil dari kode dan dokumentasi; fitur **TARGET** adalah requirement redesign, bukan klaim bahwa fitur tersebut sudah live. Integrasi production, pembayaran, OAuth, live LLM, dan pengujian browser end-to-end harus divalidasi sendiri sebelum dinyatakan aktif.

## 1. Ringkasan
52 Coffee & Roastery membutuhkan satu pengalaman digital specialty-coffee yang menyatukan discovery, e-commerce, edukasi, konsultasi B2B, event komunitas, serta AI Virtual Barista. Redesign dilakukan menyeluruh pada lapisan pengalaman pengguna dan presentasi, **tanpa menulis ulang alur transaksi, katalog terverifikasi, autentikasi, evaluasi RAG, atau status admin** hanya untuk mengganti tampilan.

### Tujuan produk
1. Membuat identitas 52 Coffee konsisten dan premium di seluruh halaman.
2. Memudahkan pelanggan menemukan, memahami, memilih varian, dan membeli kopi tanpa keraguan pada harga/stok.
3. Menjadikan Virtual Barista jalur bantuan eksplorasi yang relevan, transparan, dan terhubung ke katalog.
4. Memisahkan kebutuhan konsumen, eksperimen Coffee Lab, dan perhitungan/lead B2B dengan jelas.
5. Menjaga keandalan commerce, aksesibilitas, performa mobile, SEO, dan perilaku API yang telah teruji.

### Bukan tujuan fase visual
- Mengganti seluruh stack atau memigrasikan hosting, database, ataupun model AI.
- Mengaktifkan QRIS/merchant, tarif pengiriman, stok, dan produk yang belum disetujui pemilik.
- Mengubah algoritma RAG, metrik penelitian, perhitungan harga/HPP, guardrail, atau hak akses.
- Menghapus route lama yang masih dipakai, data pelanggan, order, atau migrasi.
- Menyatakan backend Railway / Vercel / Neon production aktif hanya dari dokumentasi historis.

## 2. Bukti AS-IS, peta sistem, dan sumber kebenaran
- **Frontend:** Next.js 14 App Router, React 18, TypeScript, Tailwind, Framer Motion, Zustand; Three.js / React Three Fiber sudah menjadi dependency. UI dipisahkan ke \`apps/web/features\`, route dan API proxy tetap di \`apps/web/app\`.
- **Backend:** FastAPI, OpenAI API, PostgreSQL + pgvector, retrieval, rekomendasi, API customer/admin/events dan konfigurasi guardrail. Keberhasilan test offline bukan bukti layanan eksternal saat runtime.
- **Navigasi utama sekarang:** Beranda, About Us, Catalogue, Partnerships, Coffee Lab; lihat \`apps/web/components/layout/navbar.tsx\`.
- **Katalog:** harga dan varian yang dipublikasikan diturunkan dari \`apps/web/lib/data.ts\`, \`catalog-master.ts\`, serta publication authority yang relevan. Produk yang tidak disetujui tidak boleh tampil untuk pelanggan.
- **Customer commerce:** \`checkout\` / \`track\` / \`account\`, pembayaran manual dan approval admin dengan mode operasional/tes dan kesiapan konfigurasi. Lihat \`PRODUCTION_COMMERCE_REVIEW.md\`; status deploy harus diverifikasi ulang.
- **Sumber visual saat ini:** \`apps/web/tailwind.config.ts\`, \`apps/web/app/globals.css\`, komponen aktual, \`design/\` dan file FigCraft. \`README.md\` memiliki nilai warna/font historis.
- **Pengujian sebelumnya:** \`docs/frontend-finalization.md\` melaporkan typecheck/lint/build/test dan QA browser terbatas; \`docs/backend-finalization.md\` melaporkan 152 test offline, tetapi pengujian database tertentu serta deployment live belum diselesaikan.
- **Route audit:** 46 file \`app/**/page.tsx\` di \`main\` pada 19 Nov 2026. Tidak semua adalah route publik berbeda; ada alias/dinamis dan area internal.

### Urutan sumber kebenaran
- **Perilaku AS-IS:** kode runtime dan kontrak backend yang diverifikasi > hasil tes yang relevan > dokumentasi historis.
- **Kebutuhan TARGET:** PRD yang sudah disetujui > keputusan perubahan berikutnya yang direkam sebagai ADR/change log.
- **Desain TARGET:** \`docs/DESIGN.md\` + mockup yang disetujui > eksplorasi desain lama; token aktual tetap menentukan kondisi AS-IS sebelum migrasi.
- **Produk/harga/stok:** pemilik/otoritas publikasi dan data runtime yang sah, **bukan** angka di dokumen contoh.

## 3. Pengguna dan pekerjaan utama
| Pengguna | Kebutuhan | Hasil yang diharapkan |
|---|---|---|
| Pengunjung pertama | Memahami keunikan 52 Coffee dan menemukan kopi | Beralih dari hero/story ke katalog dan detail produk |
| Pembeli retail | Memilih profil rasa, varian, grind, jumlah, dan menyelesaikan pesanan | Keranjang/checkout jelas, status order transparan |
| Pelanggan Slowbar | Menjelajahi minuman dan informasi sajian | Bisa memahami opsi tanpa bercampur dengan retail beans |
| Mitra B2B / pemilik kedai | Mengeksplorasi racikan, HPP, dan pasokan | Mengirim brief konsultasi yang jelas tanpa bocornya data internal |
| Coffee learner | Belajar rasio seduh dan mencoba blend | Memakai workspace brewing dan blend tanpa wajib belanja |
| Peserta / penyelenggara event | Mencari, membuat, mengelola atau mengikuti event | Alur akun, status publikasi, dan registrasi yang jelas |
| Admin | Mengelola produk, order, verifikasi pembayaran, stok, events | Operasi akurat, status eksplisit, dan konfirmasi pada tindakan berisiko |

## 4. Arsitektur informasi target
**Primary navigation:** Beranda · About Us · Catalogue · Partnerships · Coffee Lab.  
**Utility navigation:** Search · Virtual Barista · Cart · Akun; gunakan menu responsive di mobile.

| Area | Route kanonis / penting | Prinsip redesign |
|---|---|---|
| Home | \`/\` | Brand story + commerce discovery + CTA berbeda |
| About | \`/about\`, jangkar \`#behind\`, \`#roastery-journey\`, \`#slowbar-ambience\` | Narrative editorial dan bukti brand nyata |
| Catalogue | \`/catalog\`, \`/catalog/[slug]\` | Retail Beans / Slowbar Beverages / Glassware / Machine & Tools; query \`category\`, \`series\` dipertahankan |
| Partnerships | \`/work-with-us\`, \`/work-with-us/consultations\`, jangkar \`#wholesale-partnership\` | Jalur B2B jelas; konsultasi dan wholesale |
| Coffee Lab | \`/coffee-lab\`, \`/coffee-lab/brewing-guidance\`, \`/coffee-lab/build-your-own-blend\`, \`/coffee-lab/coffee-experiments\` | Workspace belajar, eksperimen, dan cupping events |
| Commerce | \`/checkout\`, \`/track\`, \`/account\`, \`/account/orders*\` | Trust, status transaksi, dan operasi deterministik |
| Accounts | \`/login\`, \`/register\`, \`/verify-email\`, \`/forgot-password\`, \`/reset-password\` | Form dan feedback konsisten |
| Events | \`/events/*\`, \`/organizers/*\` | Discovery, pembuatan, pengelolaan, moderasi |
| Admin | \`/admin/*\` | Konsistensi, kepadatan data, dan operabilitas di desktop/mobile |

Route alias dan legacy seperti \`/slowbar\`, \`/blend-builder\`, \`/tools/*\`, \`/work-with-us/wholesale-partnership\` dipertahankan/redirect secara sengaja; **jangan menghapus tanpa audit inbound links dan SEO**.

## 5. Functional requirements dan acceptance criteria
Prioritas P0 = wajib sebelum rollout, P1 = bagian redesign inti, P2 = peningkatan pilihan.

### FR-01 — App shell, navigasi, discovery (P0)
- Navbar, drawer mobile, search, cart badge, akun, footer, floating Virtual Barista memiliki satu pola lintas route.
- Semua menu keyboard-accessible, focus-visible, area sentuh memadai, menutup dengan Escape jika relevan.
- Link, \`href\`, anchor, query, dan cart badge tetap bekerja.
- **Terima bila:** walkthrough seluruh navigasi 390/768/1440px lulus, tidak ada broken link, overflow horizontal, atau fokus terperangkap.

### FR-02 — Home, About, identitas brand (P1)
- Home memperlihatkan editorial hero dengan satu pesan utama, CTA katalog, CTA cerita roastery, produk pilihan dari published catalog, narasi roasting, B2B teaser dan Coffee Lab.
- About memuat Behind 52 Coffee, Roastery Journey, Slowbar Ambience dengan visual otentik.
- Gambar produk/brand tidak menampilkan label palsu atau harga yang di-hardcode.
- **Terima bila:** informasi brand cepat dipahami, CTA tepat sasaran, struktur H1–H3 semantik, visual lulus mobile dan reduced-motion.

### FR-03 — Catalogue dan PDP (P0)
- Empat tab kategori tetap tersedia; filter/sort/search yang ada tidak kehilangan state atau deep link.
- Product card dan detail menampilkan foto, nama, proses/origin, tasting notes, pilihan gramasi/grind, harga valid, ketersediaan, add-to-cart.
- Hanya item dengan izin publikasi runtime yang dapat ditransaksikan; varian dan harga mengikuti satu sumber.
- **Terima bila:** SKU/variant yang dipilih konsisten dari kartu → PDP → cart → checkout; produk draft/unverified tidak bocor; sold-out dan empty/error state jelas.

### FR-04 — Cart, checkout, tracking, akun (P0)
- Keranjang mempertahankan quantity, varian, total dan persist sesuai behavior saat ini; server tetap otoritatif untuk nominal final.
- Checkout menampilkan metode hanya ketika konfigurasi/mode operasional mengizinkan; tidak pernah membuat order production dari fallback testing.
- Upload bukti pembayaran berarti **menunggu verifikasi**, bukan otomatis lunas; admin approval/rejection dan tracking menampilkan status aktual yang diterjemahkan.
- QRIS hanya dari aset/config resmi; jangan membuat nominal/merchant sendiri atau mengaktifkan sebelum approval pemilik. Kasus luar Jawa yang membutuhkan konfirmasi ongkir manual tetap dipertahankan.
- **Terima bila:** cart & checkout regresi dengan fixture sintetis lulus; penolakan submit tidak menghapus cart; kepemilikan order dan boundary admin tidak berubah.

### FR-05 — Virtual Barista (P0)
- UI chatbot konsisten dengan brand, tidak menghalangi CTA/checkout/mobile, mendukung pesan, loading, error, retry, recommendation cards, dan action aman.
- Integrasi tetap melalui API yang ada; retrieval, NeMo/guardrail, grounding, rekomendasi berbasis preferensi dan action cart harus dipertahankan.
- Tidak mengklaim hasil RAG jika yang terjadi fallback lokal; informasi stok/harga berasal dari data valid.
- **Terima bila:** uji percakapan dan action cart yang sama menghasilkan payload/varian/jumlah benar; error backend tidak memblokir browsing; tidak ada perubahan metrik riset tanpa protokol evaluasi baru.

### FR-06 — Partnerships / B2B (P1)
- Dua intent dibedakan: (a) Consultations/workspace racikan komersial dan estimasi HPP, (b) Wholesale & Partnership/pasokan.
- Konsultasi mengikuti alur ringkas yang sudah ada: pilih & atur racikan → estimasi HPP → konsultasi/brief; jangan menduplikasi perhitungan builder.
- HPP, margin dan informasi internal ditampilkan hanya pada konteks yang diizinkan; tidak muncul di katalog/Virtual Barista publik.
- **Terima bila:** validasi input, state back/next, angka terformat, WA preview dan jalur kontak bekerja; perhitungan identik dengan versi sebelumnya.

### FR-07 — Coffee Lab (P1)
- Brewing Guidance mempertahankan pilihan metode, dosis, rasio, grind, suhu, tahapan dan timer.
- Build Your Own Blend pada Coffee Lab adalah alat eksplorasi rasa, bukan formulir penawaran B2B; implementasi blend core tetap dibagi tanpa copy-paste.
- Coffee Experiments menghubungkan content cupping, event discovery, dan tindakan lanjutan.
- **Terima bila:** output perhitungan/timer dan state lama tidak rusak; perbedaan use case Coffee Lab vs Partnerships jelas.

### FR-08 — Events & organizers (P1)
- Event discovery, pencarian/filter, detail, create, pengelolaan, moderasi, dan organizer profile mempertahankan API, auth, dan izin yang ada.
- Registrasi via WhatsApp atau kanal non-WA hanya ditampilkan bila benar-benar didukung/tersedia; tidak menyebut booking sukses sebelum sistem mengonfirmasi.
- **Terima bila:** event state loading/empty/error/published/pending dan alur pemilik/moderator diuji tanpa mengubah data production.

### FR-09 — Admin operational UI (P1)
- Konsisten pada dashboard, katalog/produk, harga, Slowbar, stok, order, pengguna, finansial dan events; prioritaskan readability daripada efek animasi.
- Setiap aksi berisiko meminta konfirmasi dan menunjukkan hasil server; role dan session tidak diubah.
- **Terima bila:** list/detail/forms/tables dengan overflow adaptif, pagination/focus, status pesanan, serta permissions tetap valid.

### FR-10 — Content, SEO, quality (P0)
- Title/meta, canonical, route semantics, gambar alt sesuai fungsi, heading hierarchy, internal linking dan schema bila sudah ada dipertahankan/ditingkatkan.
- Seluruh copy utama menggunakan Bahasa Indonesia yang natural, ringkas dan berorientasi specialty coffee. Istilah Inggris hanya ketika relevan.
- **Terima bila:** metadata tidak regresi, tidak ada placeholder yang terlihat, link/anchor/redirect terverifikasi, aksesibilitas diuji.

## 6. Non-functional requirements
| Dimensi | Target kualitas (belum terukur) | Gate |
|---|---|---|
| Accessibility | Upayakan WCAG 2.2 AA: keyboard, fokus terlihat, kontras, alt, status diumumkan, reduced motion | Audit otomatis + tes manual |
| Responsive | Baseline 390, 768, 1440 px; tambahan 320 dan 1920 untuk edge cases | Screenshot per template, cek overflow |
| Performance | Sasaran CWV lapangan: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 pada p75; anggaran 3D dibuat dari baseline riil | Lighthouse/field measurement; jangan klaim tercapai sebelum pengukuran |
| Resilience | Foto fallback ketika WebGL gagal; error API dan data tidak tersedia memiliki UI yang jelas | Browser QA dan simulated failures |
| Security | Tidak mengubah boundary auth, data payment, PII, endpoint privat, dan validasi server | Regression API dan security review |
| Research integrity | Snapshot dataset/evaluasi RAGAS, prompt, retrieval logic dan metrik tetap, kecuali perubahan ilmiah disetujui terpisah | Diff gate pada \`apps/ai-backend/evaluation\` |
| SEO | Route penting tidak hilang dan metadata indexable tidak berubah tanpa keputusan | URL/redirect/meta audit |

## 7. Pengukuran keberhasilan (baseline dahulu)
Tidak menetapkan angka konversi atau usability yang dibuat-buat. Catat baseline sebelum desain: waktu menemukan produk; task completion katalog → cart → checkout; drop-off checkout; penggunaan search/Virtual Barista; lead B2B; Core Web Vitals; mobile error dan accessibility findings. Target perubahan kuantitatif baru disahkan setelah baseline tersedia.

## 8. Tahapan implementasi
1. **P0: Audit & freeze kontrak** — katalog, routes, desain/screenshots, fixtures, accessibility, test status, mode checkout/DB, produksi. Output: audit, PRD, DESIGN, daftar perbedaan.
2. **P1: Design foundations** — token, typography, button/form/cards, nav/footer, motion primitives, page templates; implementasi tanpa perubahan API.
3. **P2: Discovery retail** — Home, About, Catalogue, PDP, cart drawer dan Virtual Barista shell.
4. **P3: Learning & B2B** — Coffee Lab, brewing, BYOB, Consultations, Wholesale, events.
5. **P4: Transaction & operations** — login, account, checkout, tracking, organizer, admin UI; uji role/data sangat ketat.
6. **P5: Stabilization & rollout** — perbandingan visual, accessibility, performance, SEO, e2e dengan data test; preview → review → release terkontrol.

Semua tahap melalui branch fitur/PR dan visual approval; **tidak ada direct deploy, merge main, migrasi DB, atau perubahan environment production otomatis**.

## 9. Definition of Done (per halaman)
- Mockup desktop/mobile dan states disetujui; gaya konsisten dengan \`docs/DESIGN.md\`.
- Fitur dan integrasi pada tabel FR terkait tetap lulus; source of truth data tidak disalin.
- Loading, empty, error, disabled, hover, focus, success, reduced-motion ditangani.
- Tidak ada overflow; navigasi keyboard; alt / semantic HTML; responsif.
- \`npm run typecheck --prefix apps/web\`, \`npm run lint --prefix apps/web\`, \`npm run build --prefix apps/web\`, \`npm test\` serta tes domain relevan lulus.
- Screenshots 390/768/1440px, desktop dan mobile; hasil tes dan selisih yang diketahui didokumentasikan.
- Tidak ada secret/PII/order riil, price invented, atau klaim pembayaran yang tidak diverifikasi.

## 10. Keputusan terbuka sebelum pixel-final
- Pilih/approve satu bahasa visual target dari \`DESIGN.md\` (editorial light diusulkan, bukan identitas final pemilik).
- Finalisasi hero photography/product asset berlisensi dan model 3D jika diperlukan.
- Verifikasi mode commerce dan environment deployment saat rollout; konfirmasi aset QRIS resmi.
- Tentukan target bisnis dan baseline performa, event registration policy, serta copy legal/policy aktual.

## 11. Referensi internal
\`AGENTS.md\`, \`CODEX.md\`, \`README.md\`, \`apps/web/components/layout/navbar.tsx\`, \`apps/web/lib/data.ts\`, \`apps/web/lib/catalog-master.ts\`, \`docs/catalog-blueprint-handoff.md\`, \`PRODUCTION_COMMERCE_REVIEW.md\`, \`docs/frontend-finalization.md\`, \`docs/backend-finalization.md\`, \`design/guided-complete/REVIEW.md\`, \`apps/ai-backend/evaluation/README.md\`.
