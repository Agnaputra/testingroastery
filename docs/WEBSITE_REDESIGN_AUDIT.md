# Website Audit — 52 Coffee & Roastery
**Tanggal:** 19 November 2026 | **Target:** redesign sitewide | **Sumber:** GitHub \`main\` @ \`eb17643c73cd08ba9a6cfc7db6be7821e6543d19\`

## Scope dan keterbatasan
Audit **repository source dan dokumentasi** via GitHub: tree lengkap, route, shared shell, Tailwind/globals, fitur inti, backend manifest, laporan uji dan aset desain. Belum dilakukan screenshot browser live, Lighthouse, aksesibilitas manual atau login/payments/DB integration; fitur live tidak disimpulkan dari source saja. File pada commit/branch lain dan perubahan lokal yang belum di-push tidak terlihat.

## Inventory (angka berdasarkan tree tracked Git)
| Item | Observasi |
|---|---|
| Source dan aset yang terlacak seluruhnya | 7.385 blobs |
| Route file Next \`app/**/page.tsx\` | 46 (termasuk alias, dinamis, internal) |
| Next API \`app/api/**/route.ts\` | 14 |
| File terlacak dalam \`apps/web/features\` | 102 |
| File \`design/\` | 228 (bukan berarti semua desain aktif) |
| File \`docs/\` | 10 |
| File dalam \`apps/ai-backend/.venv-broken-20261003/\` | **4.690** |
| File di \`.tmp-*\` dan \`scratch/\` | **1.435** (perlu triase, bukan hapus buta) |

**Perhatian:** yang dihitung adalah file Git *tracked*, bukan ukuran bundle/komponen yang dijalankan. Hitungan .tmp/scratch didasarkan prefix path yang diperiksa; tidak otomatis semua sampah.

## Findings
| ID | Severity | Temuan | Bukti | Tindakan |
|---|---|---|---|---|
| A01 | High | Dokumentasi identitas visual bertentangan: README memuat espresso/caramel + Playfair; Tailwind/globals memakai navy/teal/maroon + Raleway/Montserrat | \`README.md\`, \`AGENTS.md\`, \`apps/web/tailwind.config.ts\`, \`apps/web/app/globals.css\` | Setelah approval target, perbarui README/agent docs; satu design source |
| A02 | High | Tidak ada PRD/desain sistem sitewide yang terpusat pada main sebelum audit | root, docs tree, design assets | \`docs/PRD.md\` + \`docs/DESIGN.md\` di branch ini |
| A03 | High | Critical paths membutuhkan kontrak regresi ketika UI dirombak | \`catalog-master.ts\`, \`PRODUCTION_COMMERCE_REVIEW.md\`, \`CODEX.md\` | Pisahkan redesign UI dari logic harga/stok/auth/checkout, test synthetic only |
| A04 | Medium | Hero/section/card desain heterogen dan reuse primitives tidak seragam | \`features/home/hero/HeroSection.tsx\`, \`features/catalog/catalog-content.tsx\`, \`features/coffee-lab/*\`, \`components/ui/page-structure.tsx\` | Token semantic, 3–4 page templates, reusable components, per-route migration |
| A05 | Medium | Ada risiko beban animasi/3D pada home dan consultations | \`features/home/hero/*\`, \`features/partnerships/consultations/consultation-experience.tsx\` | Lazy-load, image poster fallback, reduced-motion, measure CWV |
| A06 | High | Repository berisi 4.690 file tracked pada legacy virtualenv broken; meningkatkan noise/ukuran repository | \`apps/ai-backend/.venv-broken-20261003/\` dalam Git tree | Audit .gitignore, ownership, history impact, safety; clean-up dalam PR sendiri |
| A07 | Medium | Banyak file \`.tmp-*\` dan \`scratch/\` tercatat | Git tree | Klasifikasikan build artefacts vs essential evidence sebelum cleanup |
| A08 | High | Status deployment dan test integrasi belum boleh diasumsikan dari laporan lokal | \`docs/backend-finalization.md\`, \`docs/frontend-finalization.md\`, \`PRODUCTION_COMMERCE_REVIEW.md\` | Deployment, payment, OAuth, LLM, DB perlu pemeriksaan runtime mandiri |
| A09 | Medium | Design references menyimpan beragam opsi FigCraft; tidak ada persetujuan final sitewide | \`design/\`, \`design/guided-complete/*\` | Tandai approved/deprecated, gunakan satu master design direction |
| A10 | Medium | Home \`sectionShell\` 1440px dan shared \`site-container\` 1280px; pola layout dan CSS khusus bervariasi | \`features/home/home-page.module.css\`, \`globals.css\` | Unified grid/spacing specification dengan pengecualian eksplisit |

## Yang sudah baik
- Pemisahan domain \`features/\` dan App Router sudah ada; perubahan visual tidak perlu merombak struktur core.
- \`AGENTS.md\` dan \`CODEX.md\` sudah memberikan guardrails agent dan prosedur testing.
- Katalog memiliki aturan publikasi serta batas harga dan stok yang terdokumentasi.
- Ada laporan refactor dan test offline/frontend sebelumnya sebagai referensi baseline.
- Guided Blend Workspace memiliki artefak design dan preservation checklist.
- Kode sudah memiliki image fallback untuk scene interaktif di Consultations; pelihara prinsip tersebut.

## Rekomendasi prioritas (urutan)
1. Review \`PRD.md\` dan \`DESIGN.md\`; sepakati visual direction serta area yang tidak boleh berubah.
2. Rekam visual baseline Home, About, Catalogue, PDP, checkout, Coffee Lab, Consultations, Events, Admin pada viewport representatif.
3. Bangun design tokens dan app shell baru di branch implementasi tanpa mengubah business logic.
4. Jalankan pilot Home/Catalogue/PDP dan validasi end-to-end shopping flow.
5. Sebarkan desain ke Partnerships/Coffee Lab/Events, lalu account/checkout/admin secara bertahap.
6. Jalankan visual regression, a11y, perf dan release checks; update README/AGENTS setelah approval.
7. Buka PR terpisah untuk menghapus artefak tracked yang benar-benar aman, tanpa menurunkan reproducibility skripsi.

## Acceptance gates sebelum menyebut redesign selesai
- Semua route/anchor/query dan SEO key routes lulus.
- Product publication, selected variant, price, cart, status pembayaran/akun, B2B calc, timer, events, RAG chat actions tidak regresi.
- Typecheck, lint, build, npm tests, domain/API tests, browser QA 390/768/1440px lulus.
- Tidak ada database production writes, perubahan secret, migration otomatis atau deploy tanpa persetujuan.
- Performa diukur nyata, bukan klaim; user-approved design signoff tersedia.

**Keputusan:** Buat dokumentasi baseline dulu; redesign kode sitewide **belum dilaksanakan pada branch ini**.
