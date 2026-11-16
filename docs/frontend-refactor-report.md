# Laporan refactor frontend

Tanggal: 16 November 2026. Branch lokal: main. HEAD: d9f6763b9c067fb599366f6d540655298bd1cd97. Backup: backup/frontend-refactor-20261116.

Tidak ada commit, push, merge, deployment, perubahan environment tersimpan, backend FastAPI, database, atau data penelitian. Baseline awal tetap di docs/frontend-refactor-baseline.md; keterangan menunggu manifest di dokumen itu merupakan catatan historis sebelum migrasi.

## Struktur dan kontrak

- app/ tetap memiliki semua route, metadata, static params, server loader, redirect/notFound, API handlers, dan import CSS global.
- components/layout/ memuat Navbar, Footer, AppLayoutShell sebagai tiga file terpisah, beserta provider, logo, transition dan intro loader.
- features/ memiliki home, about, catalog, partnerships/consultations/wholesale, coffee-lab, virtual-barista, cart, checkout, customer, admin dan events.
- Blend Builder tetap satu implementasi di features/coffee-lab/build-your-own-blend/, dipakai Consultations dan Coffee Lab.
- Data katalog, harga/stok, store, auth, pembayaran dan utilitas lintas domain tetap di lib/. Public assets tetap di tempatnya.
- Tidak ada barrel export, dependency atau folder placeholder baru. Tailwind memindai features/.

## Pengujian

| Batch | Typecheck | ESLint | Production build | npm test |
|---|---|---|---|---|
| layout | PASS | PASS | PASS | PASS (manual rerun) |
| home-about | PASS | PASS | PASS | PASS |
| catalog | PASS | PASS | PASS | PASS |
| partnerships | PASS | PASS | PASS | PASS |
| coffee-lab | PASS | PASS | PASS | PASS |
| home-motion | PASS | PASS | PASS | PASS |
| virtual-barista | PASS | PASS | PASS | PASS |
| supporting-domains | PASS | PASS | PASS | PASS |
| final | PASS | PASS | PASS | PASS |

Log lengkap lokal: .private/frontend-refactor-logs/. Regression runner melaporkan 5 suite / 37 assertions. Layout regression dijalankan ulang manual setelah wrapper PowerShell menganggap warning stderr Node sebagai error; npm test manual lulus. Wrapper diperbaiki agar memakai exit code.

Test tambahan: scripts/check-frontend-refactor.cjs, catalog request sharing, catalog price authority, blend profile, partnership estimate, admin session, cart publication, Google OAuth route fixtures, wholesale render, dynamic QRIS dan payment configuration. Test pembayaran/auth memakai fixture/mock fetch tanpa transaksi atau sesi nyata.

check-frontend-refactor membandingkan JSX primitives, handler, teks, subtree AnimatePresence, route inventory, metadata/static params, seluruh API handler, CSS yang dipindah, dan implementasi file yang dipindah terhadap tag backup. File shell/catalog-content yang diekstrak diperiksa melalui inventaris JSX; file lain diperiksa melalui AST implementasi tanpa import.

Audit import graph terhadap backup: PASS, tidak ada cycle runtime baru (0 cycle groups). Scan path source/runner lama: tidak ditemukan import stale.

### Browser

48/48 checks PASS pada 1440, 768 dan 390 px. Bukti: .private/frontend-refactor-browser/results.json dan screenshot. Browser memakai server web localhost:3088 dan fixture katalog localhost:3089; tidak menghubungi FastAPI/database. Fixture publikasi memakai overrides kosong dan harga dari katalog frontend yang ada; tidak ada produk atau harga baru. Semua request browser eksternal diblokir.

Interaksi browser tambahan lulus: quick-add callback melalui DOM activation, cart toast/drawer, buka-tutup Virtual Barista, FAQ, dan pergantian Roastery Process. Screenshot About dan Consultations pada desktop/mobile ditinjau langsung.

Catatan terpisah: percobaan quick-add dengan klik pointer pada carousel tidak memunculkan toast dalam harness pertama. DOM activation kemudian lulus. Handler pointer capture dan handler klik pada baseline tetap identik, sehingga perilaku ini tidak diubah dalam refactor. Klik pointer fisik tetap perlu audit tersendiri; ini bukan bukti regresi baru. HTTP 304 dari cache browser ditangani sebagai navigasi valid pada harness.

Batas verifikasi: belum ada perbandingan screenshot pixel-per-pixel dengan baseline sebelum migrasi. Integrasi OAuth interaktif, admin/customer terautentikasi, backend Virtual Barista/LLM, checkout/pembayaran nyata dan database tidak diuji. Warning Node experimental type stripping/module type sudah ada pada baseline.

## File yang dipindah

Path relatif terhadap apps/web. 79 mapping pemindahan dalam tabel manifest dan 2 pemindahan CSS sesuai bagian ekstraksi route.

| Sumber | Tujuan |
|---|---|
| app/coffee-lab/coffee-experiments/cupping-event-section.tsx | features/coffee-lab/coffee-experiments/cupping-event-section.tsx |
| app/work-with-us/consultations/consultation-form-section.tsx | features/partnerships/consultations/consultation-form-section.tsx |
| app/work-with-us/wholesale-section.tsx | features/partnerships/wholesale/wholesale-section.tsx |
| app/work-with-us/wholesale.module.css | features/partnerships/wholesale/wholesale.module.css |
| components/admin-operational-commerce.tsx | features/admin/admin-operational-commerce.tsx |
| components/admin-product-manager.tsx | features/admin/admin-product-manager.tsx |
| components/admin-real-orders.tsx | features/admin/admin-real-orders.tsx |
| components/admin-users.tsx | features/admin/admin-users.tsx |
| components/admin/admin-auth-gate.tsx | features/admin/admin-auth-gate.tsx |
| components/admin/admin-context.tsx | features/admin/admin-context.tsx |
| components/admin/admin-header.tsx | features/admin/admin-header.tsx |
| components/admin/admin-sidebar.tsx | features/admin/admin-sidebar.tsx |
| components/admin/hooks/use-admin-portal.ts | features/admin/hooks/use-admin-portal.ts |
| components/admin/modals/admin-price-modal.tsx | features/admin/modals/admin-price-modal.tsx |
| components/admin/modals/admin-shipping-modal.tsx | features/admin/modals/admin-shipping-modal.tsx |
| components/admin/tabs/admin-catalog-tab.tsx | features/admin/tabs/admin-catalog-tab.tsx |
| components/admin/tabs/admin-financials-tab.tsx | features/admin/tabs/admin-financials-tab.tsx |
| components/admin/tabs/admin-orders-tab.tsx | features/admin/tabs/admin-orders-tab.tsx |
| components/admin/tabs/admin-overview-tab.tsx | features/admin/tabs/admin-overview-tab.tsx |
| components/admin/tabs/admin-slowbar-tab.tsx | features/admin/tabs/admin-slowbar-tab.tsx |
| components/admin/types.ts | features/admin/types.ts |
| components/app-layout-shell.tsx | components/layout/app-layout-shell.tsx |
| components/blend-builder-experience.tsx | features/coffee-lab/build-your-own-blend/blend-builder-experience.tsx |
| components/brewing-guidance-experience.tsx | features/coffee-lab/brewing-guidance/brewing-guidance-experience.tsx |
| components/cart-drawer.tsx | features/cart/cart-drawer.tsx |
| components/catalog-content.tsx | features/catalog/catalog-content.tsx |
| components/catalog-product-detail.tsx | features/catalog/catalog-product-detail.tsx |
| components/consultation-coffee-scene.tsx | features/partnerships/consultations/consultation-coffee-scene.tsx |
| components/consultation-experience.tsx | features/partnerships/consultations/consultation-experience.tsx |
| components/customer-account.tsx | features/customer/customer-account.tsx |
| components/customer-auth-form.tsx | features/customer/customer-auth-form.tsx |
| components/customer-checkout.tsx | features/checkout/customer-checkout.tsx |
| components/customer-order-detail.tsx | features/customer/customer-order-detail.tsx |
| components/customer-track.tsx | features/customer/customer-track.tsx |
| components/editorial-product-card.tsx | features/catalog/editorial-product-card.tsx |
| components/events/event-actions.tsx | features/events/event-actions.tsx |
| components/events/event-card.tsx | features/events/event-card.tsx |
| components/events/event-discovery.tsx | features/events/event-discovery.tsx |
| components/events/event-form.tsx | features/events/event-form.tsx |
| components/footer.tsx | components/layout/footer.tsx |
| components/grind-selector.tsx | features/catalog/grind-selector.tsx |
| components/hero/AromaParticles.tsx | features/home/hero/AromaParticles.tsx |
| components/hero/CoffeeCup.tsx | features/home/hero/CoffeeCup.tsx |
| components/hero/CoffeeLeaf.tsx | features/home/hero/CoffeeLeaf.tsx |
| components/hero/CoffeeModel.tsx | features/home/hero/CoffeeModel.tsx |
| components/hero/CoffeeScene.tsx | features/home/hero/CoffeeScene.tsx |
| components/hero/FloatingBeans.tsx | features/home/hero/FloatingBeans.tsx |
| components/hero/HeroSection.module.css | features/home/hero/HeroSection.module.css |
| components/hero/HeroSection.tsx | features/home/hero/HeroSection.tsx |
| components/hero/types.ts | features/home/hero/types.ts |
| components/logo.tsx | components/layout/logo.tsx |
| components/motion-provider.tsx | components/layout/motion-provider.tsx |
| components/navbar.tsx | components/layout/navbar.tsx |
| components/ocha/ocha-faq.tsx | features/catalog/ocha/ocha-faq.tsx |
| components/ocha/ocha-marquee.tsx | features/catalog/ocha/ocha-marquee.tsx |
| components/ocha/ocha-pill-navbar.tsx | features/catalog/ocha/ocha-pill-navbar.tsx |
| components/page-transition.tsx | components/layout/page-transition.tsx |
| components/partnership-blend-brief.tsx | features/partnerships/consultations/partnership-blend-brief.tsx |
| components/product-card.tsx | features/catalog/product-card.tsx |
| components/quick-view-modal.tsx | features/catalog/quick-view-modal.tsx |
| components/search-modal.tsx | features/catalog/search-modal.tsx |
| components/sensory/SensorySection.module.css | features/home/sensory/SensorySection.module.css |
| components/sensory/SensorySection.tsx | features/home/sensory/SensorySection.tsx |
| components/sensory/spectrum-data.ts | features/home/sensory/spectrum-data.ts |
| components/site-intro-loader.module.css | components/layout/site-intro-loader.module.css |
| components/site-intro-loader.tsx | components/layout/site-intro-loader.tsx |
| components/virtual-barista.tsx | features/virtual-barista/virtual-barista.tsx |
| components/weight-selector.tsx | features/catalog/weight-selector.tsx |
| lib/coffee-lab-content.ts | features/coffee-lab/coffee-lab-content.ts |
| lib/events.ts | features/events/events.ts |
| lib/partnership-estimate.test.ts | features/partnerships/consultations/partnership-estimate.test.ts |
| lib/partnership-estimate.ts | features/partnerships/consultations/partnership-estimate.ts |
| lib/virtual-barista-actions.test.ts | features/virtual-barista/virtual-barista-actions.test.ts |
| lib/virtual-barista-actions.ts | features/virtual-barista/virtual-barista-actions.ts |
| lib/virtual-barista-events.ts | features/virtual-barista/virtual-barista-events.ts |
| lib/virtual-barista-recommendations.test.mjs | features/virtual-barista/virtual-barista-recommendations.test.mjs |
| lib/virtual-barista-recommendations.ts | features/virtual-barista/virtual-barista-recommendations.ts |
| lib/virtual-barista-response.test.ts | features/virtual-barista/virtual-barista-response.test.ts |
| lib/virtual-barista-response.ts | features/virtual-barista/virtual-barista-response.ts |
| app/page.module.css | features/home/home-page.module.css |
| app/about/page.module.css | features/about/about-page.module.css |

## File hasil ekstraksi

Route asal tetap tersedia sebagai wrapper; implementasi tidak disalin ganda.

- apps/web/features/about/about-page.tsx
- apps/web/features/about/behind-52-coffee.tsx
- apps/web/features/about/our-story.tsx
- apps/web/features/about/roastery-journey.tsx
- apps/web/features/about/slowbar-ambience.tsx
- apps/web/features/cart/cart-toast.tsx
- apps/web/features/catalog/catalog-filters.tsx
- apps/web/features/catalog/product-grid.tsx
- apps/web/features/coffee-lab/brewing-guidance/brewing-guidance-page.tsx
- apps/web/features/coffee-lab/build-your-own-blend/build-your-own-blend-page.tsx
- apps/web/features/coffee-lab/coffee-experiments/coffee-experiments-page.tsx
- apps/web/features/coffee-lab/coffee-lab-entry.tsx
- apps/web/features/coffee-lab/coffee-lab-page.tsx
- apps/web/features/customer/track-page.tsx
- apps/web/features/events/event-detail.tsx
- apps/web/features/events/event-login.tsx
- apps/web/features/events/event-moderation.tsx
- apps/web/features/events/my-events.tsx
- apps/web/features/events/organizer-detail.tsx
- apps/web/features/events/organizer-profile.tsx
- apps/web/features/home/b2b-preview.tsx
- apps/web/features/home/catalog-preview.tsx
- apps/web/features/home/faq.tsx
- apps/web/features/home/featured-products.tsx
- apps/web/features/home/home-page.tsx
- apps/web/features/home/roastery-process.tsx
- apps/web/features/home/story.tsx
- apps/web/features/partnerships/consultations/consultations-page.tsx
- apps/web/features/partnerships/consultations/price-calculator.tsx

## Git diff --stat

Stat ini hanya memuat tracked files; Git belum menampilkan file tujuan untracked sebagai rename karena perubahan sengaja belum di-stage. Gunakan daftar mapping di atas dan status lengkap di bawah untuk membaca cakupan sebenarnya.

```text
apps/web/app/about/page.module.css                 |  145 --
 apps/web/app/about/page.tsx                        |  157 +-
 apps/web/app/account/orders/[id]/page.tsx          |    2 +-
 apps/web/app/account/page.tsx                      |    2 +-
 apps/web/app/admin/catalog/page.tsx                |    4 +-
 apps/web/app/admin/financials/page.tsx             |    2 +-
 apps/web/app/admin/layout.tsx                      |    2 +-
 apps/web/app/admin/orders/page.tsx                 |    4 +-
 apps/web/app/admin/page.tsx                        |    4 +-
 apps/web/app/admin/products/page.tsx               |    2 +-
 apps/web/app/admin/slowbar/page.tsx                |    4 +-
 apps/web/app/admin/users/page.tsx                  |    2 +-
 apps/web/app/api/chat/route.ts                     |    6 +-
 apps/web/app/blend-builder/page.tsx                |    2 +-
 apps/web/app/catalog/[slug]/page.tsx               |    2 +-
 apps/web/app/catalog/page.tsx                      |    2 +-
 apps/web/app/checkout/page.tsx                     |    2 +-
 apps/web/app/coffee-lab/[...slug]/page.tsx         |   67 +-
 apps/web/app/coffee-lab/brewing-guidance/page.tsx  |   26 +-
 .../app/coffee-lab/build-your-own-blend/page.tsx   |   35 +-
 .../coffee-experiments/cupping-event-section.tsx   |   14 -
 .../web/app/coffee-lab/coffee-experiments/page.tsx |   24 +-
 apps/web/app/coffee-lab/page.tsx                   |   85 +-
 apps/web/app/events/[slug]/page.tsx                |   40 +-
 apps/web/app/events/create/page.tsx                |    2 +-
 apps/web/app/events/login/page.tsx                 |   32 +-
 apps/web/app/events/manage/[id]/page.tsx           |    2 +-
 apps/web/app/events/moderation/page.tsx            |  841 +----------
 apps/web/app/events/my-events/page.tsx             |   36 +-
 apps/web/app/forgot-password/page.tsx              |    2 +-
 apps/web/app/guide/page.tsx                        |    2 +-
 apps/web/app/layout.tsx                            |    4 +-
 apps/web/app/login/page.tsx                        |    2 +-
 apps/web/app/organizers/[slug]/page.tsx            |    8 +-
 apps/web/app/organizers/me/page.tsx                |   40 +-
 apps/web/app/page.module.css                       | 1203 ---------------
 apps/web/app/page.tsx                              |  789 +---------
 apps/web/app/register/page.tsx                     |    2 +-
 apps/web/app/reset-password/page.tsx               |    2 +-
 apps/web/app/slowbar/page.tsx                      |    2 +-
 apps/web/app/tools/price-calculator/page.tsx       |   96 +-
 apps/web/app/track/page.tsx                        |  571 +------
 apps/web/app/verify-email/page.tsx                 |    2 +-
 .../consultations/consultation-form-section.tsx    |  215 ---
 apps/web/app/work-with-us/consultations/page.tsx   |   15 +-
 apps/web/app/work-with-us/page.tsx                 |    2 +-
 apps/web/app/work-with-us/wholesale-section.tsx    |   94 --
 apps/web/app/work-with-us/wholesale.module.css     |   63 -
 apps/web/components/admin-operational-commerce.tsx |  188 ---
 apps/web/components/admin-product-manager.tsx      |  579 -------
 apps/web/components/admin-real-orders.tsx          |  400 -----
 apps/web/components/admin-users.tsx                |  309 ----
 apps/web/components/admin/admin-auth-gate.tsx      |   23 -
 apps/web/components/admin/admin-context.tsx        |   61 -
 apps/web/components/admin/admin-header.tsx         |  117 --
 apps/web/components/admin/admin-sidebar.tsx        |  236 ---
 .../web/components/admin/hooks/use-admin-portal.ts |  425 ------
 .../components/admin/modals/admin-price-modal.tsx  |  185 ---
 .../admin/modals/admin-shipping-modal.tsx          |  110 --
 .../components/admin/tabs/admin-catalog-tab.tsx    |  334 -----
 .../components/admin/tabs/admin-financials-tab.tsx |  109 --
 .../web/components/admin/tabs/admin-orders-tab.tsx |  458 ------
 .../components/admin/tabs/admin-overview-tab.tsx   |  317 ----
 .../components/admin/tabs/admin-slowbar-tab.tsx    |  130 --
 apps/web/components/admin/types.ts                 |   37 -
 apps/web/components/app-layout-shell.tsx           |   84 --
 apps/web/components/blend-builder-experience.tsx   | 1290 ----------------
 .../web/components/brewing-guidance-experience.tsx | 1578 --------------------
 apps/web/components/cart-drawer.tsx                |  390 -----
 apps/web/components/catalog-content.tsx            |  627 --------
 apps/web/components/catalog-product-detail.tsx     |  681 ---------
 apps/web/components/consultation-coffee-scene.tsx  |   75 -
 apps/web/components/consultation-experience.tsx    |   58 -
 apps/web/components/customer-account.tsx           |  156 --
 apps/web/components/customer-auth-form.tsx         |  144 --
 apps/web/components/customer-checkout.tsx          |  203 ---
 apps/web/components/customer-order-detail.tsx      |  181 ---
 apps/web/components/customer-track.tsx             |   43 -
 apps/web/components/editorial-product-card.tsx     |  169 ---
 apps/web/components/events/event-actions.tsx       |   36 -
 apps/web/components/events/event-card.tsx          |   25 -
 apps/web/components/events/event-discovery.tsx     |   86 --
 apps/web/components/events/event-form.tsx          |   86 --
 apps/web/components/footer.tsx                     |  119 --
 apps/web/components/grind-selector.tsx             |   76 -
 apps/web/components/hero/AromaParticles.tsx        |   57 -
 apps/web/components/hero/CoffeeCup.tsx             |   32 -
 apps/web/components/hero/CoffeeLeaf.tsx            |   81 -
 apps/web/components/hero/CoffeeModel.tsx           |  204 ---
 apps/web/components/hero/CoffeeScene.tsx           |  128 --
 apps/web/components/hero/FloatingBeans.tsx         |   63 -
 apps/web/components/hero/HeroSection.module.css    |  304 ----
 apps/web/components/hero/HeroSection.tsx           |  225 ---
 apps/web/components/hero/types.ts                  |   19 -
 apps/web/components/logo.tsx                       |   78 -
 apps/web/components/motion-provider.tsx            |    7 -
 apps/web/components/navbar.tsx                     |  434 ------
 apps/web/components/ocha/ocha-faq.tsx              |  102 --
 apps/web/components/ocha/ocha-marquee.tsx          |   45 -
 apps/web/components/ocha/ocha-pill-navbar.tsx      |  339 -----
 apps/web/components/page-transition.tsx            |    7 -
 apps/web/components/partnership-blend-brief.tsx    |  124 --
 apps/web/components/product-card.tsx               |  172 ---
 apps/web/components/quick-view-modal.tsx           |  213 ---
 apps/web/components/search-modal.tsx               |  247 ---
 .../components/sensory/SensorySection.module.css   |  384 -----
 apps/web/components/sensory/SensorySection.tsx     |  191 ---
 apps/web/components/sensory/spectrum-data.ts       |  111 --
 apps/web/components/site-intro-loader.module.css   |   81 -
 apps/web/components/site-intro-loader.tsx          |  108 --
 apps/web/components/ui/loading-state.tsx           |    2 +-
 apps/web/components/ui/page-structure.tsx          |    2 +-
 apps/web/components/virtual-barista.tsx            |  627 --------
 apps/web/components/weight-selector.tsx            |   74 -
 apps/web/lib/coffee-lab-content.ts                 |  104 --
 apps/web/lib/events.ts                             |   70 -
 apps/web/lib/partnership-estimate.test.ts          |   27 -
 apps/web/lib/partnership-estimate.ts               |   28 -
 apps/web/lib/virtual-barista-actions.test.ts       |   35 -
 apps/web/lib/virtual-barista-actions.ts            |   41 -
 apps/web/lib/virtual-barista-events.ts             |    6 -
 .../lib/virtual-barista-recommendations.test.mjs   |   38 -
 apps/web/lib/virtual-barista-recommendations.ts    |   60 -
 apps/web/lib/virtual-barista-response.test.ts      |   53 -
 apps/web/lib/virtual-barista-response.ts           |   90 --
 apps/web/tailwind.config.ts                        |    1 +
 scripts/check-wholesale-render.cjs                 |    2 +-
 scripts/run-virtual-barista-tests.cjs              |    6 +-
 128 files changed, 90 insertions(+), 19719 deletions(-)
```

## Git status --short --untracked-files=all

```text
D apps/web/app/about/page.module.css
 M apps/web/app/about/page.tsx
 M apps/web/app/account/orders/[id]/page.tsx
 M apps/web/app/account/page.tsx
 M apps/web/app/admin/catalog/page.tsx
 M apps/web/app/admin/financials/page.tsx
 M apps/web/app/admin/layout.tsx
 M apps/web/app/admin/orders/page.tsx
 M apps/web/app/admin/page.tsx
 M apps/web/app/admin/products/page.tsx
 M apps/web/app/admin/slowbar/page.tsx
 M apps/web/app/admin/users/page.tsx
 M apps/web/app/api/chat/route.ts
 M apps/web/app/blend-builder/page.tsx
 M apps/web/app/catalog/[slug]/page.tsx
 M apps/web/app/catalog/page.tsx
 M apps/web/app/checkout/page.tsx
 M apps/web/app/coffee-lab/[...slug]/page.tsx
 M apps/web/app/coffee-lab/brewing-guidance/page.tsx
 M apps/web/app/coffee-lab/build-your-own-blend/page.tsx
 D apps/web/app/coffee-lab/coffee-experiments/cupping-event-section.tsx
 M apps/web/app/coffee-lab/coffee-experiments/page.tsx
 M apps/web/app/coffee-lab/page.tsx
 M apps/web/app/events/[slug]/page.tsx
 M apps/web/app/events/create/page.tsx
 M apps/web/app/events/login/page.tsx
 M apps/web/app/events/manage/[id]/page.tsx
 M apps/web/app/events/moderation/page.tsx
 M apps/web/app/events/my-events/page.tsx
 M apps/web/app/forgot-password/page.tsx
 M apps/web/app/guide/page.tsx
 M apps/web/app/layout.tsx
 M apps/web/app/login/page.tsx
 M apps/web/app/organizers/[slug]/page.tsx
 M apps/web/app/organizers/me/page.tsx
 D apps/web/app/page.module.css
 M apps/web/app/page.tsx
 M apps/web/app/register/page.tsx
 M apps/web/app/reset-password/page.tsx
 M apps/web/app/slowbar/page.tsx
 M apps/web/app/tools/price-calculator/page.tsx
 M apps/web/app/track/page.tsx
 M apps/web/app/verify-email/page.tsx
 D apps/web/app/work-with-us/consultations/consultation-form-section.tsx
 M apps/web/app/work-with-us/consultations/page.tsx
 M apps/web/app/work-with-us/page.tsx
 D apps/web/app/work-with-us/wholesale-section.tsx
 D apps/web/app/work-with-us/wholesale.module.css
 D apps/web/components/admin-operational-commerce.tsx
 D apps/web/components/admin-product-manager.tsx
 D apps/web/components/admin-real-orders.tsx
 D apps/web/components/admin-users.tsx
 D apps/web/components/admin/admin-auth-gate.tsx
 D apps/web/components/admin/admin-context.tsx
 D apps/web/components/admin/admin-header.tsx
 D apps/web/components/admin/admin-sidebar.tsx
 D apps/web/components/admin/hooks/use-admin-portal.ts
 D apps/web/components/admin/modals/admin-price-modal.tsx
 D apps/web/components/admin/modals/admin-shipping-modal.tsx
 D apps/web/components/admin/tabs/admin-catalog-tab.tsx
 D apps/web/components/admin/tabs/admin-financials-tab.tsx
 D apps/web/components/admin/tabs/admin-orders-tab.tsx
 D apps/web/components/admin/tabs/admin-overview-tab.tsx
 D apps/web/components/admin/tabs/admin-slowbar-tab.tsx
 D apps/web/components/admin/types.ts
 D apps/web/components/app-layout-shell.tsx
 D apps/web/components/blend-builder-experience.tsx
 D apps/web/components/brewing-guidance-experience.tsx
 D apps/web/components/cart-drawer.tsx
 D apps/web/components/catalog-content.tsx
 D apps/web/components/catalog-product-detail.tsx
 D apps/web/components/consultation-coffee-scene.tsx
 D apps/web/components/consultation-experience.tsx
 D apps/web/components/customer-account.tsx
 D apps/web/components/customer-auth-form.tsx
 D apps/web/components/customer-checkout.tsx
 D apps/web/components/customer-order-detail.tsx
 D apps/web/components/customer-track.tsx
 D apps/web/components/editorial-product-card.tsx
 D apps/web/components/events/event-actions.tsx
 D apps/web/components/events/event-card.tsx
 D apps/web/components/events/event-discovery.tsx
 D apps/web/components/events/event-form.tsx
 D apps/web/components/footer.tsx
 D apps/web/components/grind-selector.tsx
 D apps/web/components/hero/AromaParticles.tsx
 D apps/web/components/hero/CoffeeCup.tsx
 D apps/web/components/hero/CoffeeLeaf.tsx
 D apps/web/components/hero/CoffeeModel.tsx
 D apps/web/components/hero/CoffeeScene.tsx
 D apps/web/components/hero/FloatingBeans.tsx
 D apps/web/components/hero/HeroSection.module.css
 D apps/web/components/hero/HeroSection.tsx
 D apps/web/components/hero/types.ts
 D apps/web/components/logo.tsx
 D apps/web/components/motion-provider.tsx
 D apps/web/components/navbar.tsx
 D apps/web/components/ocha/ocha-faq.tsx
 D apps/web/components/ocha/ocha-marquee.tsx
 D apps/web/components/ocha/ocha-pill-navbar.tsx
 D apps/web/components/page-transition.tsx
 D apps/web/components/partnership-blend-brief.tsx
 D apps/web/components/product-card.tsx
 D apps/web/components/quick-view-modal.tsx
 D apps/web/components/search-modal.tsx
 D apps/web/components/sensory/SensorySection.module.css
 D apps/web/components/sensory/SensorySection.tsx
 D apps/web/components/sensory/spectrum-data.ts
 D apps/web/components/site-intro-loader.module.css
 D apps/web/components/site-intro-loader.tsx
 M apps/web/components/ui/loading-state.tsx
 M apps/web/components/ui/page-structure.tsx
 D apps/web/components/virtual-barista.tsx
 D apps/web/components/weight-selector.tsx
 D apps/web/lib/coffee-lab-content.ts
 D apps/web/lib/events.ts
 D apps/web/lib/partnership-estimate.test.ts
 D apps/web/lib/partnership-estimate.ts
 D apps/web/lib/virtual-barista-actions.test.ts
 D apps/web/lib/virtual-barista-actions.ts
 D apps/web/lib/virtual-barista-events.ts
 D apps/web/lib/virtual-barista-recommendations.test.mjs
 D apps/web/lib/virtual-barista-recommendations.ts
 D apps/web/lib/virtual-barista-response.test.ts
 D apps/web/lib/virtual-barista-response.ts
 M apps/web/tailwind.config.ts
 M scripts/check-wholesale-render.cjs
 M scripts/run-virtual-barista-tests.cjs
?? apps/web/components/layout/app-layout-shell.tsx
?? apps/web/components/layout/footer.tsx
?? apps/web/components/layout/logo.tsx
?? apps/web/components/layout/motion-provider.tsx
?? apps/web/components/layout/navbar.tsx
?? apps/web/components/layout/page-transition.tsx
?? apps/web/components/layout/site-intro-loader.module.css
?? apps/web/components/layout/site-intro-loader.tsx
?? apps/web/features/about/about-page.module.css
?? apps/web/features/about/about-page.tsx
?? apps/web/features/about/behind-52-coffee.tsx
?? apps/web/features/about/our-story.tsx
?? apps/web/features/about/roastery-journey.tsx
?? apps/web/features/about/slowbar-ambience.tsx
?? apps/web/features/admin/admin-auth-gate.tsx
?? apps/web/features/admin/admin-context.tsx
?? apps/web/features/admin/admin-header.tsx
?? apps/web/features/admin/admin-operational-commerce.tsx
?? apps/web/features/admin/admin-product-manager.tsx
?? apps/web/features/admin/admin-real-orders.tsx
?? apps/web/features/admin/admin-sidebar.tsx
?? apps/web/features/admin/admin-users.tsx
?? apps/web/features/admin/hooks/use-admin-portal.ts
?? apps/web/features/admin/modals/admin-price-modal.tsx
?? apps/web/features/admin/modals/admin-shipping-modal.tsx
?? apps/web/features/admin/tabs/admin-catalog-tab.tsx
?? apps/web/features/admin/tabs/admin-financials-tab.tsx
?? apps/web/features/admin/tabs/admin-orders-tab.tsx
?? apps/web/features/admin/tabs/admin-overview-tab.tsx
?? apps/web/features/admin/tabs/admin-slowbar-tab.tsx
?? apps/web/features/admin/types.ts
?? apps/web/features/cart/cart-drawer.tsx
?? apps/web/features/cart/cart-toast.tsx
?? apps/web/features/catalog/catalog-content.tsx
?? apps/web/features/catalog/catalog-filters.tsx
?? apps/web/features/catalog/catalog-product-detail.tsx
?? apps/web/features/catalog/editorial-product-card.tsx
?? apps/web/features/catalog/grind-selector.tsx
?? apps/web/features/catalog/ocha/ocha-faq.tsx
?? apps/web/features/catalog/ocha/ocha-marquee.tsx
?? apps/web/features/catalog/ocha/ocha-pill-navbar.tsx
?? apps/web/features/catalog/product-card.tsx
?? apps/web/features/catalog/product-grid.tsx
?? apps/web/features/catalog/quick-view-modal.tsx
?? apps/web/features/catalog/search-modal.tsx
?? apps/web/features/catalog/weight-selector.tsx
?? apps/web/features/checkout/customer-checkout.tsx
?? apps/web/features/coffee-lab/brewing-guidance/brewing-guidance-experience.tsx
?? apps/web/features/coffee-lab/brewing-guidance/brewing-guidance-page.tsx
?? apps/web/features/coffee-lab/build-your-own-blend/blend-builder-experience.tsx
?? apps/web/features/coffee-lab/build-your-own-blend/build-your-own-blend-page.tsx
?? apps/web/features/coffee-lab/coffee-experiments/coffee-experiments-page.tsx
?? apps/web/features/coffee-lab/coffee-experiments/cupping-event-section.tsx
?? apps/web/features/coffee-lab/coffee-lab-content.ts
?? apps/web/features/coffee-lab/coffee-lab-entry.tsx
?? apps/web/features/coffee-lab/coffee-lab-page.tsx
?? apps/web/features/customer/customer-account.tsx
?? apps/web/features/customer/customer-auth-form.tsx
?? apps/web/features/customer/customer-order-detail.tsx
?? apps/web/features/customer/customer-track.tsx
?? apps/web/features/customer/track-page.tsx
?? apps/web/features/events/event-actions.tsx
?? apps/web/features/events/event-card.tsx
?? apps/web/features/events/event-detail.tsx
?? apps/web/features/events/event-discovery.tsx
?? apps/web/features/events/event-form.tsx
?? apps/web/features/events/event-login.tsx
?? apps/web/features/events/event-moderation.tsx
?? apps/web/features/events/events.ts
?? apps/web/features/events/my-events.tsx
?? apps/web/features/events/organizer-detail.tsx
?? apps/web/features/events/organizer-profile.tsx
?? apps/web/features/home/b2b-preview.tsx
?? apps/web/features/home/catalog-preview.tsx
?? apps/web/features/home/faq.tsx
?? apps/web/features/home/featured-products.tsx
?? apps/web/features/home/hero/AromaParticles.tsx
?? apps/web/features/home/hero/CoffeeCup.tsx
?? apps/web/features/home/hero/CoffeeLeaf.tsx
?? apps/web/features/home/hero/CoffeeModel.tsx
?? apps/web/features/home/hero/CoffeeScene.tsx
?? apps/web/features/home/hero/FloatingBeans.tsx
?? apps/web/features/home/hero/HeroSection.module.css
?? apps/web/features/home/hero/HeroSection.tsx
?? apps/web/features/home/hero/types.ts
?? apps/web/features/home/home-page.module.css
?? apps/web/features/home/home-page.tsx
?? apps/web/features/home/roastery-process.tsx
?? apps/web/features/home/sensory/SensorySection.module.css
?? apps/web/features/home/sensory/SensorySection.tsx
?? apps/web/features/home/sensory/spectrum-data.ts
?? apps/web/features/home/story.tsx
?? apps/web/features/partnerships/consultations/consultation-coffee-scene.tsx
?? apps/web/features/partnerships/consultations/consultation-experience.tsx
?? apps/web/features/partnerships/consultations/consultation-form-section.tsx
?? apps/web/features/partnerships/consultations/consultations-page.tsx
?? apps/web/features/partnerships/consultations/partnership-blend-brief.tsx
?? apps/web/features/partnerships/consultations/partnership-estimate.test.ts
?? apps/web/features/partnerships/consultations/partnership-estimate.ts
?? apps/web/features/partnerships/consultations/price-calculator.tsx
?? apps/web/features/partnerships/wholesale/wholesale-section.tsx
?? apps/web/features/partnerships/wholesale/wholesale.module.css
?? apps/web/features/virtual-barista/virtual-barista-actions.test.ts
?? apps/web/features/virtual-barista/virtual-barista-actions.ts
?? apps/web/features/virtual-barista/virtual-barista-events.ts
?? apps/web/features/virtual-barista/virtual-barista-recommendations.test.mjs
?? apps/web/features/virtual-barista/virtual-barista-recommendations.ts
?? apps/web/features/virtual-barista/virtual-barista-response.test.ts
?? apps/web/features/virtual-barista/virtual-barista-response.ts
?? apps/web/features/virtual-barista/virtual-barista.tsx
?? docs/52coffee-frontend-refactor-manifest-main.md
?? docs/frontend-refactor-baseline.md
?? docs/frontend-refactor-report.md
?? scripts/check-frontend-refactor.cjs
```
