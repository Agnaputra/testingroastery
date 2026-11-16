# Manifest migrasi frontend — 52 Coffee & Roastery

> **KEPUTUSAN TERBARU (16 November 2026):** Manifest file-per-file di bawah ini telah disetujui pengguna. Kerjakan perubahan **langsung di branch `main` lokal**, bukan di `chore/repository-cleanup`. Pengecualian ini menggantikan instruksi pembuatan branch pada bagian "Batch dan gate" nomor 0.
>
> **Baseline sudah selesai:** `origin/main` telah tersinkron, worktree awal bersih, tag backup lokal `backup/frontend-refactor-20261116` telah dibuat, dan typecheck, lint, regression, serta production build sudah PASS (lihat `docs/frontend-refactor-baseline.md` di workspace). Verifikasi ulang keadaan Git saat mulai, namun **jangan ulangi pembuatan tag dengan nama yang sama**.
>
> **Tidak boleh commit/push/merge otomatis** dan tidak boleh mengubah backend, database, konfigurasi production, atau environment. Ikuti migrasi bertahap dan pengujian tiap batch.

Audit repository read-only, 16 November 2026. Branch main; worktree awal bersih. Belum ada migrasi, penggantian branch, commit, push, perubahan environment atau database. Dokumen audit dibuat di TEMP di luar repository.

## Kontrak arsitektur

app/ tetap pemilik route, metadata/generateMetadata, generateStaticParams, redirect/notFound, params/searchParams, layout, loading, CSS global dan API handlers. features/ pemilik implementasi halaman dan domain. components/layout/navbar.tsx, footer.tsx dan app-layout-shell.tsx adalah tiga implementasi terpisah. components/ui/ hanya primitive generik. Komponen domain reusable dimiliki satu fitur dan diimpor eksplisit oleh konsumen; jangan menggandakan state/data. Tidak menambah barrel export, dependency, atau folder placeholder. Pertahankan directive use client, dynamic imports, SSR dan lazy loading.

## Keputusan batas domain

Katalog: data.ts, catalog-master, snapshot, publication server/client/hook dan accessories tetap sumber bersama di lib/ karena digunakan home, catalog, admin, chatbot dan blend. Store cart/order, hydration, customer API/types/payment server, session, qris, brewlogic dan blend-profile tetap di lib/ pada tahap ini untuk menghindari pemindahan massal lintas domain. Generic visual flavor-radar-chart dan sensory-tag tetap di components/ sementara; jangan paksa business component ke ui/. qris-dynamic-card tetap path semula dalam migrasi awal agar perubahan ownership tidak bercampur dengan route pembayaran.

Blend builder tetap satu implementasi dalam coffee-lab/build-your-own-blend dan diimpor konsultasi; kalkulasi HPP dan brief/kontak dimiliki partnerships/consultations. Tidak mengubah mode atau perhitungan. Shared domain dependency ini eksplisit, bukan membuat salinan builder. Virtual Barista: UI dan modules actions/events/recommendations/response dipindah; hook dan API client baru hanya bila ekstraksi logic yang ada diperlukan. /api/chat tetap di app/api/chat/route.ts; pemisahan UI/hooks/API lebih lanjut dilakukan setelah batch pemindahan lulus.

## Batch dan gate

0. Setelah persetujuan: periksa ulang status lalu checkout/create chore/repository-cleanup dari basis yang disepakati; jangan reset atau menimpa branch yang sudah ada. Rekam baseline typecheck/lint/build/regression dan route/link/anchor/query/SEO/browser. Tambahkan ./features/**/*.{js,ts,jsx,tsx,mdx} ke Tailwind sebelum memindah komponen.
1. Layout: pindah file shell/navigation/provider/loader bersama CSS, perbarui seluruh caller. Ekstrak CartToast dari shell ke features/cart/cart-toast.tsx tanpa perubahan JSX/perilaku.
2. Home/about: ekstrak komposisi halaman ke fitur, kemudian section terpisah dengan state tetap pada orchestrator; CSS dipindah bersama pemiliknya. Hero dan sensory pindah utuh, dynamic imports ikut.
3. Catalog: pindah komponen, selector, modal, search dan cards ke fitur; ekstrak filters/grid dari implementasi saat ini. Tidak membuat UI retail/beverages/glassware/tools baru.
4. Partnerships/Coffee Lab: pindah semua tabel manifest; ekstrak body halaman menjadi page experience, metadata/redirect tetap di app. Perbarui test wholesale dan konsultasi.
5. Virtual Barista: modules dan UI; perbarui API handler imports, script runner dan semua test path literal.
6. Cart/checkout/customer/admin/events: pindah komponen domain, ekstrak body route besar hanya bila berisi UI/logic fitur. Route API/auth server boundary tetap.
7. Verifikasi akhir: scan unresolved/stale imports, import cycles, client/server boundary dan tidak ada folder kosong. Bandingkan seluruh route, anchors, queries, SEO, desain dan perilaku dengan baseline.

Setiap batch: npm run typecheck --prefix apps/web; npm run lint --prefix apps/web; npm run build --prefix apps/web; npm test + suite regression domain terkait. Jalankan build berurutan, jangan bersamaan dengan proses yang menulis distDir sama. Perbaiki kegagalan baru sebelum batch berikutnya; catat kegagalan baseline secara terpisah.

Regression tambahan yang tersedia: test *.test.mjs via node --experimental-strip-types; partnership-estimate.test.ts melalui runner/transpile yang kompatibel; scripts/check-catalog-request-sharing.cjs, check-wholesale-render.cjs, check-dynamic-qris.cjs, check-production-payment-config.cjs dan check-guided-consultations.cjs setelah memeriksa side effects masing-masing. Jangan menjalankan script browser/payment terhadap remote atau DB tanpa memastikan target aman. Test browser yang memerlukan login interaktif dicatat BLOCKED jika sesi tidak tersedia. Jangan menyalakan backend otomatis: startup dapat mengakses DB. Backend FastAPI tidak diedit.

## Ekstraksi file-per-file dari route (route asal tetap ada)

- app/page.tsx -> features/home/home-page.tsx + hero/ yang sudah ada, featured-products.tsx, catalog-preview.tsx, sensory/ yang sudah ada, roastery-process.tsx, story.tsx, b2b-preview.tsx, faq.tsx. Manifesto/final CTA tetap di orchestrator bila ekstraksi tidak membantu. app/page.module.css -> features/home/home-page.module.css.
- app/about/page.tsx -> features/about/about-page.tsx, behind-52-coffee.tsx, our-story.tsx, roastery-journey.tsx, slowbar-ambience.tsx; principles tetap terjaga. app/about/page.module.css -> features/about/about-page.module.css.
- components/catalog-content.tsx -> fitur catalog; ekstrak product-grid.tsx dan catalog-filters.tsx dengan props/state yang sama. Retail Beans, Slowbar Beverages, Glassware, Machine & Tools dipetakan ke UI/data yang sudah ada; tidak wajib satu folder per kategori. app/slowbar/page.tsx tetap server loader dan memakai UI catalog bila ada ekstraksi.
- app/work-with-us/page.tsx -> wrapper yang memakai wholesale; page.module.css tetap selama masih dimiliki wrapper. consultations/page.tsx tetap metadata + wrapper; consultations.css tetap di route pada batch awal untuk menjaga urutan cascade.
- app/coffee-lab/page.tsx -> features/coffee-lab/coffee-lab-page.tsx; [...slug]/page.tsx tetap metadata/static params/redirect dan memanggil coffee-lab-entry.tsx; coffee-experiments/page.tsx -> coffee-experiments/coffee-experiments-page.tsx. brewing-guidance.css tetap import route pada batch awal.
- app/tools/price-calculator/page.tsx -> features/partnerships/consultations/price-calculator.tsx, route /tools/price-calculator tetap.
- app/track/page.tsx -> features/customer/track-page.tsx, pertahankan cabang commerce/legacy order, Suspense dan query order.
- app/events/login/page.tsx, my-events/page.tsx, moderation/page.tsx, app/organizers/me/page.tsx -> features/events/event-login.tsx, my-events.tsx, event-moderation.tsx, organizer-profile.tsx.
- app/events/[slug]/page.tsx dan app/organizers/[slug]/page.tsx: loader/metadata/dynamic/notFound tetap; ekstrak JSX ke features/events/event-detail.tsx dan organizer-detail.tsx.
- Route kecil auth/account/checkout/admin/catalog/alias/guide/background/roasters/privacy tetap file route yang ada; hanya ubah import bila target dipindah. Tidak perlu membuat feature tambahan untuk halaman statis yang di luar cakupan.

## Manifest seluruh file sumber/config

Setiap baris adalah satu file; tujuan sama berarti tetap. Untuk page.tsx, lihat ekstraksi di atas. Semua caller tercatat dalam lampiran import, termasuk type imports, export-from, dynamic import dan require literal. Test/config/script yang menyimpan path sebagai string juga harus dicari ulang saat batch karena bukan module import.

| Sumber relatif apps/web (atau scripts/) | Tujuan relatif apps/web |
|---|---|
| .eslintrc.json | .eslintrc.json |
| .vercel/project.json | .vercel/project.json |
| app/about/page.module.css | app/about/page.module.css |
| app/about/page.tsx | app/about/page.tsx |
| app/account/orders/[id]/page.tsx | app/account/orders/[id]/page.tsx |
| app/account/orders/page.tsx | app/account/orders/page.tsx |
| app/account/page.tsx | app/account/page.tsx |
| app/admin/catalog/page.tsx | app/admin/catalog/page.tsx |
| app/admin/financials/page.tsx | app/admin/financials/page.tsx |
| app/admin/layout.tsx | app/admin/layout.tsx |
| app/admin/orders/page.tsx | app/admin/orders/page.tsx |
| app/admin/page.tsx | app/admin/page.tsx |
| app/admin/products/page.tsx | app/admin/products/page.tsx |
| app/admin/slowbar/page.tsx | app/admin/slowbar/page.tsx |
| app/admin/users/page.tsx | app/admin/users/page.tsx |
| app/api/admin/session/route.ts | app/api/admin/session/route.ts |
| app/api/catalog/authority/route.ts | app/api/catalog/authority/route.ts |
| app/api/catalog/managed/[[...path]]/route.ts | app/api/catalog/managed/[[...path]]/route.ts |
| app/api/catalog/prices/route.ts | app/api/catalog/prices/route.ts |
| app/api/catalog/publication/route.ts | app/api/catalog/publication/route.ts |
| app/api/chat/route.ts | app/api/chat/route.ts |
| app/api/checkout/confirm/route.ts | app/api/checkout/confirm/route.ts |
| app/api/checkout/quote/route.ts | app/api/checkout/quote/route.ts |
| app/api/customer/[...path]/route.ts | app/api/customer/[...path]/route.ts |
| app/api/customer/google/callback/route.ts | app/api/customer/google/callback/route.ts |
| app/api/customer/google/start/route.ts | app/api/customer/google/start/route.ts |
| app/api/customer/payment-instructions/image/route.ts | app/api/customer/payment-instructions/image/route.ts |
| app/api/customer/payment-instructions/route.ts | app/api/customer/payment-instructions/route.ts |
| app/api/events/[...path]/route.ts | app/api/events/[...path]/route.ts |
| app/background/page.tsx | app/background/page.tsx |
| app/blend-builder/page.tsx | app/blend-builder/page.tsx |
| app/catalog/[slug]/layout.tsx | app/catalog/[slug]/layout.tsx |
| app/catalog/[slug]/page.tsx | app/catalog/[slug]/page.tsx |
| app/catalog/page.tsx | app/catalog/page.tsx |
| app/checkout/page.tsx | app/checkout/page.tsx |
| app/coffee-lab/[...slug]/page.tsx | app/coffee-lab/[...slug]/page.tsx |
| app/coffee-lab/brewing-guidance/brewing-guidance.css | app/coffee-lab/brewing-guidance/brewing-guidance.css |
| app/coffee-lab/brewing-guidance/page.tsx | app/coffee-lab/brewing-guidance/page.tsx |
| app/coffee-lab/build-your-own-blend/page.tsx | app/coffee-lab/build-your-own-blend/page.tsx |
| app/coffee-lab/coffee-experiments/cupping-event-section.tsx | features/coffee-lab/coffee-experiments/cupping-event-section.tsx |
| app/coffee-lab/coffee-experiments/page.tsx | app/coffee-lab/coffee-experiments/page.tsx |
| app/coffee-lab/page.tsx | app/coffee-lab/page.tsx |
| app/events/[slug]/page.tsx | app/events/[slug]/page.tsx |
| app/events/create/page.tsx | app/events/create/page.tsx |
| app/events/login/page.tsx | app/events/login/page.tsx |
| app/events/manage/[id]/page.tsx | app/events/manage/[id]/page.tsx |
| app/events/moderation/page.tsx | app/events/moderation/page.tsx |
| app/events/my-events/page.tsx | app/events/my-events/page.tsx |
| app/forgot-password/page.tsx | app/forgot-password/page.tsx |
| app/globals.css | app/globals.css |
| app/guide/page.tsx | app/guide/page.tsx |
| app/layout.tsx | app/layout.tsx |
| app/loading.tsx | app/loading.tsx |
| app/login/page.tsx | app/login/page.tsx |
| app/organizers/[slug]/page.tsx | app/organizers/[slug]/page.tsx |
| app/organizers/me/page.tsx | app/organizers/me/page.tsx |
| app/page.module.css | app/page.module.css |
| app/page.tsx | app/page.tsx |
| app/privacy/page.tsx | app/privacy/page.tsx |
| app/register/page.tsx | app/register/page.tsx |
| app/reset-password/page.tsx | app/reset-password/page.tsx |
| app/roasters/page.tsx | app/roasters/page.tsx |
| app/slowbar/page.tsx | app/slowbar/page.tsx |
| app/tools/brew-calculator/page.tsx | app/tools/brew-calculator/page.tsx |
| app/tools/price-calculator/page.tsx | app/tools/price-calculator/page.tsx |
| app/track/page.tsx | app/track/page.tsx |
| app/verify-email/page.tsx | app/verify-email/page.tsx |
| app/work-with-us/blend-builder/page.tsx | app/work-with-us/blend-builder/page.tsx |
| app/work-with-us/consultations/consultation-form-section.tsx | features/partnerships/consultations/consultation-form-section.tsx |
| app/work-with-us/consultations/consultations.css | app/work-with-us/consultations/consultations.css |
| app/work-with-us/consultations/page.tsx | app/work-with-us/consultations/page.tsx |
| app/work-with-us/page.module.css | app/work-with-us/page.module.css |
| app/work-with-us/page.tsx | app/work-with-us/page.tsx |
| app/work-with-us/wholesale-partnership/page.tsx | app/work-with-us/wholesale-partnership/page.tsx |
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
| components/flavor-radar-chart.tsx | components/flavor-radar-chart.tsx |
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
| components/sensory-tag.tsx | components/sensory-tag.tsx |
| components/sensory/SensorySection.module.css | features/home/sensory/SensorySection.module.css |
| components/sensory/SensorySection.tsx | features/home/sensory/SensorySection.tsx |
| components/sensory/spectrum-data.ts | features/home/sensory/spectrum-data.ts |
| components/site-intro-loader.module.css | components/layout/site-intro-loader.module.css |
| components/site-intro-loader.tsx | components/layout/site-intro-loader.tsx |
| components/ui/back-button.tsx | components/ui/back-button.tsx |
| components/ui/loading-state.tsx | components/ui/loading-state.tsx |
| components/ui/page-structure.tsx | components/ui/page-structure.tsx |
| components/ui/qris-dynamic-card.tsx | components/ui/qris-dynamic-card.tsx |
| components/ui/reserve-layout.tsx | components/ui/reserve-layout.tsx |
| components/virtual-barista.tsx | features/virtual-barista/virtual-barista.tsx |
| components/weight-selector.tsx | features/catalog/weight-selector.tsx |
| lib/accessories.ts | lib/accessories.ts |
| lib/admin-session.test.mjs | lib/admin-session.test.mjs |
| lib/admin-session.ts | lib/admin-session.ts |
| lib/blend-profile.test.mjs | lib/blend-profile.test.mjs |
| lib/blend-profile.ts | lib/blend-profile.ts |
| lib/brewlogic-database.ts | lib/brewlogic-database.ts |
| lib/cart-publication.test.mjs | lib/cart-publication.test.mjs |
| lib/cart-publication.ts | lib/cart-publication.ts |
| lib/catalog-master.ts | lib/catalog-master.ts |
| lib/catalog-owner-snapshot.json | lib/catalog-owner-snapshot.json |
| lib/catalog-price-authority.test.mjs | lib/catalog-price-authority.test.mjs |
| lib/catalog-publication-client.ts | lib/catalog-publication-client.ts |
| lib/catalog-publication-server.ts | lib/catalog-publication-server.ts |
| lib/catalog-publication.test.mjs | lib/catalog-publication.test.mjs |
| lib/catalog-publication.ts | lib/catalog-publication.ts |
| lib/coffee-lab-content.ts | features/coffee-lab/coffee-lab-content.ts |
| lib/customer-api.ts | lib/customer-api.ts |
| lib/customer-commerce-mode.ts | lib/customer-commerce-mode.ts |
| lib/customer-order-labels.ts | lib/customer-order-labels.ts |
| lib/customer-payment-server.ts | lib/customer-payment-server.ts |
| lib/customer-types.ts | lib/customer-types.ts |
| lib/data.ts | lib/data.ts |
| lib/events.ts | features/events/events.ts |
| lib/google-oauth-routes.test.cjs | lib/google-oauth-routes.test.cjs |
| lib/partnership-estimate.test.ts | features/partnerships/consultations/partnership-estimate.test.ts |
| lib/partnership-estimate.ts | features/partnerships/consultations/partnership-estimate.ts |
| lib/qr-generator.ts | lib/qr-generator.ts |
| lib/qris.ts | lib/qris.ts |
| lib/store/cart-hydration.test.mjs | lib/store/cart-hydration.test.mjs |
| lib/store/cart-hydration.ts | lib/store/cart-hydration.ts |
| lib/store/useCartHydration.ts | lib/store/useCartHydration.ts |
| lib/store/useCartStore.ts | lib/store/useCartStore.ts |
| lib/store/useOrderStore.ts | lib/store/useOrderStore.ts |
| lib/use-catalog-publication.ts | lib/use-catalog-publication.ts |
| lib/virtual-barista-actions.test.ts | features/virtual-barista/virtual-barista-actions.test.ts |
| lib/virtual-barista-actions.ts | features/virtual-barista/virtual-barista-actions.ts |
| lib/virtual-barista-events.ts | features/virtual-barista/virtual-barista-events.ts |
| lib/virtual-barista-recommendations.test.mjs | features/virtual-barista/virtual-barista-recommendations.test.mjs |
| lib/virtual-barista-recommendations.ts | features/virtual-barista/virtual-barista-recommendations.ts |
| lib/virtual-barista-response.test.ts | features/virtual-barista/virtual-barista-response.test.ts |
| lib/virtual-barista-response.ts | features/virtual-barista/virtual-barista-response.ts |
| next-env.d.ts | next-env.d.ts |
| next.config.mjs | next.config.mjs |
| package-lock.json | package-lock.json |
| package.json | package.json |
| scripts/export-customer-catalog.cjs | scripts/export-customer-catalog.cjs |
| tailwind.config.ts | tailwind.config.ts |
| tsconfig.json | tsconfig.json |
| types/styles.d.ts | types/styles.d.ts |
| vercel.json | vercel.json |
| scripts/check-catalog-request-sharing.cjs | Tetap; update literal path bila terdampak |
| scripts/check-dynamic-qris.cjs | Tetap; update literal path bila terdampak |
| scripts/check-guided-consultations.cjs | Tetap; update literal path bila terdampak |
| scripts/check-production-payment-config.cjs | Tetap; update literal path bila terdampak |
| scripts/check-wholesale-render.cjs | Tetap; update literal path bila terdampak |
| scripts/run-virtual-barista-tests.cjs | Tetap; update literal path bila terdampak |

## Lampiran seluruh import

| Caller:line | Jenis | Specifier | Resolusi lokal / external |
|---|---|---|---|
| apps/web/app/about/page.tsx:3 | import | next/image | external/package |
| apps/web/app/about/page.tsx:4 | import | next/link | external/package |
| apps/web/app/about/page.tsx:5 | import | framer-motion | external/package |
| apps/web/app/about/page.tsx:6 | import | lucide-react | external/package |
| apps/web/app/about/page.tsx:7 | import | ./page.module.css | apps/web/app/about/page.module.css |
| apps/web/app/account/orders/page.tsx:1 | import | next/navigation | external/package |
| apps/web/app/account/orders/[id]/page.tsx:1 | import | ../../../../components/customer-order-detail | apps/web/components/customer-order-detail.tsx |
| apps/web/app/account/page.tsx:1 | import | ../../components/customer-account | apps/web/components/customer-account.tsx |
| apps/web/app/admin/catalog/page.tsx:3 | import | ../../../components/admin/admin-context | apps/web/components/admin/admin-context.tsx |
| apps/web/app/admin/catalog/page.tsx:4 | import | ../../../components/admin/tabs/admin-catalog-tab | apps/web/components/admin/tabs/admin-catalog-tab.tsx |
| apps/web/app/admin/financials/page.tsx:3 | import | ../../../components/admin/tabs/admin-financials-tab | apps/web/components/admin/tabs/admin-financials-tab.tsx |
| apps/web/app/admin/layout.tsx:1 | import | next | external/package |
| apps/web/app/admin/layout.tsx:2 | import | react | external/package |
| apps/web/app/admin/layout.tsx:3 | import | ../../components/admin/admin-context | apps/web/components/admin/admin-context.tsx |
| apps/web/app/admin/orders/page.tsx:3 | import | ../../../components/admin/admin-context | apps/web/components/admin/admin-context.tsx |
| apps/web/app/admin/orders/page.tsx:4 | import | ../../../components/admin/tabs/admin-orders-tab | apps/web/components/admin/tabs/admin-orders-tab.tsx |
| apps/web/app/admin/page.tsx:3 | import | ../../components/admin/admin-context | apps/web/components/admin/admin-context.tsx |
| apps/web/app/admin/page.tsx:4 | import | ../../components/admin/tabs/admin-overview-tab | apps/web/components/admin/tabs/admin-overview-tab.tsx |
| apps/web/app/admin/products/page.tsx:1 | import | next/headers | external/package |
| apps/web/app/admin/products/page.tsx:2 | import | next/navigation | external/package |
| apps/web/app/admin/products/page.tsx:3 | import | ../../../lib/admin-session | apps/web/lib/admin-session.ts |
| apps/web/app/admin/products/page.tsx:4 | import | ../../../components/admin-product-manager | apps/web/components/admin-product-manager.tsx |
| apps/web/app/admin/products/page.tsx:5 | import | ../../../components/ui/back-button | apps/web/components/ui/back-button.tsx |
| apps/web/app/admin/slowbar/page.tsx:3 | import | ../../../components/admin/admin-context | apps/web/components/admin/admin-context.tsx |
| apps/web/app/admin/slowbar/page.tsx:4 | import | ../../../components/admin/tabs/admin-slowbar-tab | apps/web/components/admin/tabs/admin-slowbar-tab.tsx |
| apps/web/app/admin/users/page.tsx:1 | import | ../../../components/admin-users | apps/web/components/admin-users.tsx |
| apps/web/app/api/admin/session/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/admin/session/route.ts:2 | import | ../../../../lib/admin-session | apps/web/lib/admin-session.ts |
| apps/web/app/api/catalog/authority/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/catalog/managed/[[...path]]/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/catalog/managed/[[...path]]/route.ts:2 | import | ../../../../../lib/admin-session | apps/web/lib/admin-session.ts |
| apps/web/app/api/catalog/prices/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/catalog/prices/route.ts:2 | import | ../../../../lib/admin-session | apps/web/lib/admin-session.ts |
| apps/web/app/api/catalog/publication/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/catalog/publication/route.ts:2 | import | ../../../../lib/admin-session | apps/web/lib/admin-session.ts |
| apps/web/app/api/chat/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/chat/route.ts:2 | import | ../../../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/app/api/chat/route.ts:3 | import | ../../../lib/virtual-barista-actions | apps/web/lib/virtual-barista-actions.ts |
| apps/web/app/api/chat/route.ts:4 | import | ../../../lib/virtual-barista-recommendations | apps/web/lib/virtual-barista-recommendations.ts |
| apps/web/app/api/chat/route.ts:5 | import | ../../../lib/virtual-barista-response | apps/web/lib/virtual-barista-response.ts |
| apps/web/app/api/chat/route.ts:6 | import | ../../../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/app/api/checkout/confirm/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/checkout/quote/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/customer/google/callback/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/customer/google/callback/route.ts:2 | import | ../../../../../lib/admin-session | apps/web/lib/admin-session.ts |
| apps/web/app/api/customer/google/start/route.ts:1 | import | crypto | external/package |
| apps/web/app/api/customer/google/start/route.ts:2 | import | next/server | external/package |
| apps/web/app/api/customer/payment-instructions/image/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/customer/payment-instructions/image/route.ts:2 | import | ../../../../../lib/customer-payment-server | apps/web/lib/customer-payment-server.ts |
| apps/web/app/api/customer/payment-instructions/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/customer/payment-instructions/route.ts:2 | import | ../../../../lib/customer-payment-server | apps/web/lib/customer-payment-server.ts |
| apps/web/app/api/customer/[...path]/route.ts:1 | import | ../../../../lib/customer-payment-server | apps/web/lib/customer-payment-server.ts |
| apps/web/app/api/customer/[...path]/route.ts:2 | import | next/server | external/package |
| apps/web/app/api/customer/[...path]/route.ts:3 | import | ../../../../lib/admin-session | apps/web/lib/admin-session.ts |
| apps/web/app/api/events/[...path]/route.ts:1 | import | next/server | external/package |
| apps/web/app/api/events/[...path]/route.ts:2 | import | ../../../../lib/admin-session | apps/web/lib/admin-session.ts |
| apps/web/app/background/page.tsx:1 | import | next | external/package |
| apps/web/app/background/page.tsx:2 | import | next/image | external/package |
| apps/web/app/background/page.tsx:3 | import | next/link | external/package |
| apps/web/app/background/page.tsx:4 | import | lucide-react | external/package |
| apps/web/app/background/page.tsx:5 | import | ../../components/ui/page-structure | apps/web/components/ui/page-structure.tsx |
| apps/web/app/blend-builder/page.tsx:1 | import | ../../components/blend-builder-experience | apps/web/components/blend-builder-experience.tsx |
| apps/web/app/catalog/page.tsx:1 | import | next | external/package |
| apps/web/app/catalog/page.tsx:2 | import | ../../components/catalog-content | apps/web/components/catalog-content.tsx |
| apps/web/app/catalog/page.tsx:3 | import | ../../lib/catalog-publication-server | apps/web/lib/catalog-publication-server.ts |
| apps/web/app/catalog/[slug]/layout.tsx:1 | import | next/navigation | external/package |
| apps/web/app/catalog/[slug]/layout.tsx:2 | import | ../../../lib/data | apps/web/lib/data.ts |
| apps/web/app/catalog/[slug]/page.tsx:1 | import | next | external/package |
| apps/web/app/catalog/[slug]/page.tsx:2 | import | next/navigation | external/package |
| apps/web/app/catalog/[slug]/page.tsx:3 | import | ../../../components/catalog-product-detail | apps/web/components/catalog-product-detail.tsx |
| apps/web/app/catalog/[slug]/page.tsx:4 | import | ../../../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/app/catalog/[slug]/page.tsx:5 | import | ../../../lib/catalog-publication-server | apps/web/lib/catalog-publication-server.ts |
| apps/web/app/checkout/page.tsx:3 | import | ../../lib/customer-commerce-mode | apps/web/lib/customer-commerce-mode.ts |
| apps/web/app/checkout/page.tsx:5 | import | react | external/package |
| apps/web/app/checkout/page.tsx:6 | import | next/link | external/package |
| apps/web/app/checkout/page.tsx:7 | import | next/image | external/package |
| apps/web/app/checkout/page.tsx:8 | import | lucide-react | external/package |
| apps/web/app/checkout/page.tsx:20 | import | ../../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/app/checkout/page.tsx:21 | import | ../../lib/store/useOrderStore | apps/web/lib/store/useOrderStore.ts |
| apps/web/app/checkout/page.tsx:22 | import | ../../lib/data | apps/web/lib/data.ts |
| apps/web/app/checkout/page.tsx:23 | import | ../../lib/use-catalog-publication | apps/web/lib/use-catalog-publication.ts |
| apps/web/app/checkout/page.tsx:24 | import | ../../lib/cart-publication | apps/web/lib/cart-publication.ts |
| apps/web/app/checkout/page.tsx:25 | import | ../../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/app/checkout/page.tsx:26 | import | ../../components/customer-checkout | apps/web/components/customer-checkout.tsx |
| apps/web/app/checkout/page.tsx:27 | import | ../../components/ui/qris-dynamic-card | apps/web/components/ui/qris-dynamic-card.tsx |
| apps/web/app/coffee-lab/brewing-guidance/page.tsx:1 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/coffee-lab/brewing-guidance/page.tsx:2 | import | next | external/package |
| apps/web/app/coffee-lab/brewing-guidance/page.tsx:3 | import | react | external/package |
| apps/web/app/coffee-lab/brewing-guidance/page.tsx:4 | import | next/image | external/package |
| apps/web/app/coffee-lab/brewing-guidance/page.tsx:5 | import | lucide-react | external/package |
| apps/web/app/coffee-lab/brewing-guidance/page.tsx:6 | import | ../../../components/brewing-guidance-experience | apps/web/components/brewing-guidance-experience.tsx |
| apps/web/app/coffee-lab/brewing-guidance/page.tsx:7 | import | ./brewing-guidance.css | apps/web/app/coffee-lab/brewing-guidance/brewing-guidance.css |
| apps/web/app/coffee-lab/build-your-own-blend/page.tsx:1 | import | next | external/package |
| apps/web/app/coffee-lab/build-your-own-blend/page.tsx:2 | import | next/image | external/package |
| apps/web/app/coffee-lab/build-your-own-blend/page.tsx:3 | import | next/link | external/package |
| apps/web/app/coffee-lab/build-your-own-blend/page.tsx:4 | import | lucide-react | external/package |
| apps/web/app/coffee-lab/build-your-own-blend/page.tsx:5 | import | ../../../components/blend-builder-experience | apps/web/components/blend-builder-experience.tsx |
| apps/web/app/coffee-lab/coffee-experiments/cupping-event-section.tsx:1 | import | next/image | external/package |
| apps/web/app/coffee-lab/coffee-experiments/cupping-event-section.tsx:2 | import | next/link | external/package |
| apps/web/app/coffee-lab/coffee-experiments/cupping-event-section.tsx:3 | import | lucide-react | external/package |
| apps/web/app/coffee-lab/coffee-experiments/page.tsx:1 | import | next | external/package |
| apps/web/app/coffee-lab/coffee-experiments/page.tsx:2 | import | next/image | external/package |
| apps/web/app/coffee-lab/coffee-experiments/page.tsx:3 | import | next/link | external/package |
| apps/web/app/coffee-lab/coffee-experiments/page.tsx:4 | import | lucide-react | external/package |
| apps/web/app/coffee-lab/coffee-experiments/page.tsx:5 | import | ./cupping-event-section | apps/web/app/coffee-lab/coffee-experiments/cupping-event-section.tsx |
| apps/web/app/coffee-lab/coffee-experiments/page.tsx:6 | import | ../../../components/events/event-discovery | apps/web/components/events/event-discovery.tsx |
| apps/web/app/coffee-lab/page.tsx:1 | import | next | external/package |
| apps/web/app/coffee-lab/page.tsx:2 | import | next/image | external/package |
| apps/web/app/coffee-lab/page.tsx:3 | import | next/link | external/package |
| apps/web/app/coffee-lab/page.tsx:4 | import | lucide-react | external/package |
| apps/web/app/coffee-lab/page.tsx:5 | import | ../../components/ui/page-structure | apps/web/components/ui/page-structure.tsx |
| apps/web/app/coffee-lab/[...slug]/page.tsx:1 | import | next | external/package |
| apps/web/app/coffee-lab/[...slug]/page.tsx:2 | import | next/image | external/package |
| apps/web/app/coffee-lab/[...slug]/page.tsx:3 | import | next/link | external/package |
| apps/web/app/coffee-lab/[...slug]/page.tsx:4 | import | lucide-react | external/package |
| apps/web/app/coffee-lab/[...slug]/page.tsx:5 | import | next/navigation | external/package |
| apps/web/app/coffee-lab/[...slug]/page.tsx:6 | import | ../../../components/ui/page-structure | apps/web/components/ui/page-structure.tsx |
| apps/web/app/coffee-lab/[...slug]/page.tsx:7 | import | ../../../lib/coffee-lab-content | apps/web/lib/coffee-lab-content.ts |
| apps/web/app/coffee-lab/[...slug]/page.tsx:8 | import | ../../../lib/catalog-publication-server | apps/web/lib/catalog-publication-server.ts |
| apps/web/app/events/create/page.tsx:1 | import | ../../../components/events/event-form | apps/web/components/events/event-form.tsx |
| apps/web/app/events/login/page.tsx:3 | import | react | external/package |
| apps/web/app/events/login/page.tsx:4 | import | next/link | external/package |
| apps/web/app/events/login/page.tsx:5 | import | next/navigation | external/package |
| apps/web/app/events/login/page.tsx:6 | import | ../../../lib/events | apps/web/lib/events.ts |
| apps/web/app/events/manage/[id]/page.tsx:1 | import | ../../../../components/events/event-form | apps/web/components/events/event-form.tsx |
| apps/web/app/events/moderation/page.tsx:3 | import | react | external/package |
| apps/web/app/events/moderation/page.tsx:4 | import | next/link | external/package |
| apps/web/app/events/moderation/page.tsx:5 | import | lucide-react | external/package |
| apps/web/app/events/moderation/page.tsx:24 | import | ../../../lib/events | apps/web/lib/events.ts |
| apps/web/app/events/moderation/page.tsx:32 | import | ../../../components/ui/back-button | apps/web/components/ui/back-button.tsx |
| apps/web/app/events/my-events/page.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/events/my-events/page.tsx:5 | import | react | external/package |
| apps/web/app/events/my-events/page.tsx:6 | import | next/link | external/package |
| apps/web/app/events/my-events/page.tsx:7 | import | next/navigation | external/package |
| apps/web/app/events/my-events/page.tsx:8 | import | ../../../lib/events | apps/web/lib/events.ts |
| apps/web/app/events/[slug]/page.tsx:1 | import | next | external/package |
| apps/web/app/events/[slug]/page.tsx:2 | import | next/image | external/package |
| apps/web/app/events/[slug]/page.tsx:3 | import | next/link | external/package |
| apps/web/app/events/[slug]/page.tsx:4 | import | next/navigation | external/package |
| apps/web/app/events/[slug]/page.tsx:5 | import | ../../../components/events/event-actions | apps/web/components/events/event-actions.tsx |
| apps/web/app/events/[slug]/page.tsx:6 | import | ../../../components/events/event-card | apps/web/components/events/event-card.tsx |
| apps/web/app/events/[slug]/page.tsx:7 | import | ../../../lib/events | apps/web/lib/events.ts |
| apps/web/app/forgot-password/page.tsx:1 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/forgot-password/page.tsx:2 | import | react | external/package |
| apps/web/app/forgot-password/page.tsx:3 | import | ../../components/customer-auth-form | apps/web/components/customer-auth-form.tsx |
| apps/web/app/guide/page.tsx:1 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/guide/page.tsx:2 | import | next | external/package |
| apps/web/app/guide/page.tsx:3 | import | next/image | external/package |
| apps/web/app/guide/page.tsx:4 | import | react | external/package |
| apps/web/app/guide/page.tsx:5 | import | lucide-react | external/package |
| apps/web/app/guide/page.tsx:6 | import | ../../components/ui/page-structure | apps/web/components/ui/page-structure.tsx |
| apps/web/app/guide/page.tsx:7 | import | ../../components/brewing-guidance-experience | apps/web/components/brewing-guidance-experience.tsx |
| apps/web/app/layout.tsx:2 | import | next | external/package |
| apps/web/app/layout.tsx:3 | import | ./globals.css | apps/web/app/globals.css |
| apps/web/app/layout.tsx:4 | import | ../components/motion-provider | apps/web/components/motion-provider.tsx |
| apps/web/app/layout.tsx:5 | import | ../components/app-layout-shell | apps/web/components/app-layout-shell.tsx |
| apps/web/app/loading.tsx:1 | import | ../components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/login/page.tsx:1 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/login/page.tsx:2 | import | react | external/package |
| apps/web/app/login/page.tsx:3 | import | ../../components/customer-auth-form | apps/web/components/customer-auth-form.tsx |
| apps/web/app/organizers/me/page.tsx:3 | import | react | external/package |
| apps/web/app/organizers/me/page.tsx:4 | import | next/navigation | external/package |
| apps/web/app/organizers/me/page.tsx:5 | import | next/link | external/package |
| apps/web/app/organizers/me/page.tsx:6 | import | ../../../lib/events | apps/web/lib/events.ts |
| apps/web/app/organizers/[slug]/page.tsx:1 | import | next | external/package |
| apps/web/app/organizers/[slug]/page.tsx:2 | import | next/image | external/package |
| apps/web/app/organizers/[slug]/page.tsx:3 | import | next/link | external/package |
| apps/web/app/organizers/[slug]/page.tsx:4 | import | next/navigation | external/package |
| apps/web/app/organizers/[slug]/page.tsx:5 | import | ../../../components/events/event-card | apps/web/components/events/event-card.tsx |
| apps/web/app/organizers/[slug]/page.tsx:6 | import | ../../../lib/events | apps/web/lib/events.ts |
| apps/web/app/page.tsx:3 | import | react | external/package |
| apps/web/app/page.tsx:4 | import | react | external/package |
| apps/web/app/page.tsx:5 | import | next/image | external/package |
| apps/web/app/page.tsx:6 | import | next/link | external/package |
| apps/web/app/page.tsx:7 | import | framer-motion | external/package |
| apps/web/app/page.tsx:14 | import | lucide-react | external/package |
| apps/web/app/page.tsx:23 | import | ../components/hero/HeroSection | apps/web/components/hero/HeroSection.tsx |
| apps/web/app/page.tsx:24 | import | ../components/sensory/SensorySection | apps/web/components/sensory/SensorySection.tsx |
| apps/web/app/page.tsx:25 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/app/page.tsx:26 | import | ../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/app/page.tsx:27 | import | ../lib/use-catalog-publication | apps/web/lib/use-catalog-publication.ts |
| apps/web/app/page.tsx:28 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/app/page.tsx:29 | import | ../lib/virtual-barista-events | apps/web/lib/virtual-barista-events.ts |
| apps/web/app/page.tsx:30 | import | ./page.module.css | apps/web/app/page.module.css |
| apps/web/app/privacy/page.tsx:1 | import | next | external/package |
| apps/web/app/privacy/page.tsx:2 | import | next/link | external/package |
| apps/web/app/register/page.tsx:1 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/register/page.tsx:2 | import | react | external/package |
| apps/web/app/register/page.tsx:3 | import | ../../components/customer-auth-form | apps/web/components/customer-auth-form.tsx |
| apps/web/app/reset-password/page.tsx:1 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/reset-password/page.tsx:2 | import | react | external/package |
| apps/web/app/reset-password/page.tsx:3 | import | ../../components/customer-auth-form | apps/web/components/customer-auth-form.tsx |
| apps/web/app/roasters/page.tsx:1 | import | next | external/package |
| apps/web/app/roasters/page.tsx:2 | import | next/image | external/package |
| apps/web/app/roasters/page.tsx:3 | import | next/link | external/package |
| apps/web/app/roasters/page.tsx:4 | import | lucide-react | external/package |
| apps/web/app/roasters/page.tsx:5 | import | ../../components/ui/page-structure | apps/web/components/ui/page-structure.tsx |
| apps/web/app/slowbar/page.tsx:1 | import | ../../components/catalog-content | apps/web/components/catalog-content.tsx |
| apps/web/app/slowbar/page.tsx:2 | import | ../../lib/catalog-publication-server | apps/web/lib/catalog-publication-server.ts |
| apps/web/app/tools/brew-calculator/page.tsx:1 | import | next/navigation | external/package |
| apps/web/app/tools/price-calculator/page.tsx:3 | import | react | external/package |
| apps/web/app/tools/price-calculator/page.tsx:4 | import | next/link | external/package |
| apps/web/app/tools/price-calculator/page.tsx:5 | import | lucide-react | external/package |
| apps/web/app/tools/price-calculator/page.tsx:6 | import | ../../../components/ui/page-structure | apps/web/components/ui/page-structure.tsx |
| apps/web/app/tools/price-calculator/page.tsx:7 | import | ../../../lib/data | apps/web/lib/data.ts |
| apps/web/app/tools/price-calculator/page.tsx:8 | import | ../../../lib/partnership-estimate | apps/web/lib/partnership-estimate.ts |
| apps/web/app/track/page.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/track/page.tsx:5 | import | ../../lib/customer-commerce-mode | apps/web/lib/customer-commerce-mode.ts |
| apps/web/app/track/page.tsx:7 | import | react | external/package |
| apps/web/app/track/page.tsx:8 | import | next/link | external/package |
| apps/web/app/track/page.tsx:9 | import | next/navigation | external/package |
| apps/web/app/track/page.tsx:10 | import | framer-motion | external/package |
| apps/web/app/track/page.tsx:11 | import | lucide-react | external/package |
| apps/web/app/track/page.tsx:25 | import | ../../components/ui/page-structure | apps/web/components/ui/page-structure.tsx |
| apps/web/app/track/page.tsx:26 | import | ../../lib/store/useOrderStore | apps/web/lib/store/useOrderStore.ts |
| apps/web/app/track/page.tsx:27 | import | ../../lib/data | apps/web/lib/data.ts |
| apps/web/app/track/page.tsx:28 | import | ../../components/customer-track | apps/web/components/customer-track.tsx |
| apps/web/app/verify-email/page.tsx:1 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/app/verify-email/page.tsx:2 | import | react | external/package |
| apps/web/app/verify-email/page.tsx:3 | import | ../../components/customer-auth-form | apps/web/components/customer-auth-form.tsx |
| apps/web/app/work-with-us/blend-builder/page.tsx:1 | import | next/navigation | external/package |
| apps/web/app/work-with-us/consultations/consultation-form-section.tsx:3 | import | react | external/package |
| apps/web/app/work-with-us/consultations/consultation-form-section.tsx:4 | import | lucide-react | external/package |
| apps/web/app/work-with-us/consultations/consultation-form-section.tsx:5 | import | ../../../lib/data | apps/web/lib/data.ts |
| apps/web/app/work-with-us/consultations/page.tsx:1 | import | next | external/package |
| apps/web/app/work-with-us/consultations/page.tsx:2 | import | next/link | external/package |
| apps/web/app/work-with-us/consultations/page.tsx:3 | import | lucide-react | external/package |
| apps/web/app/work-with-us/consultations/page.tsx:4 | import | ../../../components/consultation-experience | apps/web/components/consultation-experience.tsx |
| apps/web/app/work-with-us/consultations/page.tsx:5 | import | ./consultations.css | apps/web/app/work-with-us/consultations/consultations.css |
| apps/web/app/work-with-us/page.tsx:1 | import | ./wholesale-section | apps/web/app/work-with-us/wholesale-section.tsx |
| apps/web/app/work-with-us/page.tsx:2 | import | ./page.module.css | apps/web/app/work-with-us/page.module.css |
| apps/web/app/work-with-us/wholesale-partnership/page.tsx:1 | import | next/navigation | external/package |
| apps/web/app/work-with-us/wholesale-section.tsx:3 | import | react | external/package |
| apps/web/app/work-with-us/wholesale-section.tsx:4 | import | next/image | external/package |
| apps/web/app/work-with-us/wholesale-section.tsx:5 | import | next/link | external/package |
| apps/web/app/work-with-us/wholesale-section.tsx:6 | import | ../../lib/data | apps/web/lib/data.ts |
| apps/web/app/work-with-us/wholesale-section.tsx:7 | import | ./wholesale.module.css | apps/web/app/work-with-us/wholesale.module.css |
| apps/web/components/admin/admin-auth-gate.tsx:3 | import | next/link | external/package |
| apps/web/components/admin/admin-auth-gate.tsx:4 | import | lucide-react | external/package |
| apps/web/components/admin/admin-context.tsx:3 | import | react | external/package |
| apps/web/components/admin/admin-context.tsx:4 | import | ./hooks/use-admin-portal | apps/web/components/admin/hooks/use-admin-portal.ts |
| apps/web/components/admin/admin-context.tsx:5 | import | ./admin-auth-gate | apps/web/components/admin/admin-auth-gate.tsx |
| apps/web/components/admin/admin-context.tsx:6 | import | ./admin-sidebar | apps/web/components/admin/admin-sidebar.tsx |
| apps/web/components/admin/admin-context.tsx:7 | import | ./admin-header | apps/web/components/admin/admin-header.tsx |
| apps/web/components/admin/admin-context.tsx:8 | import | ./modals/admin-price-modal | apps/web/components/admin/modals/admin-price-modal.tsx |
| apps/web/components/admin/admin-context.tsx:9 | import | ./modals/admin-shipping-modal | apps/web/components/admin/modals/admin-shipping-modal.tsx |
| apps/web/components/admin/admin-header.tsx:3 | import | react | external/package |
| apps/web/components/admin/admin-header.tsx:4 | import | next/link | external/package |
| apps/web/components/admin/admin-header.tsx:5 | import | next/navigation | external/package |
| apps/web/components/admin/admin-header.tsx:6 | import | lucide-react | external/package |
| apps/web/components/admin/admin-sidebar.tsx:3 | import | ../../lib/customer-commerce-mode | apps/web/lib/customer-commerce-mode.ts |
| apps/web/components/admin/admin-sidebar.tsx:5 | import | react | external/package |
| apps/web/components/admin/admin-sidebar.tsx:6 | import | next/link | external/package |
| apps/web/components/admin/admin-sidebar.tsx:7 | import | next/navigation | external/package |
| apps/web/components/admin/admin-sidebar.tsx:8 | import | lucide-react | external/package |
| apps/web/components/admin/admin-sidebar.tsx:21 | import | ./admin-context | apps/web/components/admin/admin-context.tsx |
| apps/web/components/admin/hooks/use-admin-portal.ts:3 | import | react | external/package |
| apps/web/components/admin/hooks/use-admin-portal.ts:4 | import | ../../../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/admin/hooks/use-admin-portal.ts:5 | import | ../../../lib/data | apps/web/lib/data.ts |
| apps/web/components/admin/hooks/use-admin-portal.ts:6 | import | ../../../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/components/admin/hooks/use-admin-portal.ts:11 | import | ../../../lib/store/useOrderStore | apps/web/lib/store/useOrderStore.ts |
| apps/web/components/admin/hooks/use-admin-portal.ts:12 | import | ../../../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/components/admin/hooks/use-admin-portal.ts:13 | import | ../types | apps/web/components/admin/types.ts |
| apps/web/components/admin/modals/admin-price-modal.tsx:3 | import | react | external/package |
| apps/web/components/admin/modals/admin-price-modal.tsx:4 | import | lucide-react | external/package |
| apps/web/components/admin/modals/admin-price-modal.tsx:5 | import | ../../../lib/data | apps/web/lib/data.ts |
| apps/web/components/admin/modals/admin-price-modal.tsx:6 | import | ../../../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/components/admin/modals/admin-price-modal.tsx:7 | import | ../../../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/components/admin/modals/admin-shipping-modal.tsx:3 | import | react | external/package |
| apps/web/components/admin/modals/admin-shipping-modal.tsx:4 | import | lucide-react | external/package |
| apps/web/components/admin/modals/admin-shipping-modal.tsx:5 | import | ../../../lib/store/useOrderStore | apps/web/lib/store/useOrderStore.ts |
| apps/web/components/admin/tabs/admin-catalog-tab.tsx:3 | import | react | external/package |
| apps/web/components/admin/tabs/admin-catalog-tab.tsx:4 | import | next/link | external/package |
| apps/web/components/admin/tabs/admin-catalog-tab.tsx:5 | import | next/image | external/package |
| apps/web/components/admin/tabs/admin-catalog-tab.tsx:6 | import | lucide-react | external/package |
| apps/web/components/admin/tabs/admin-catalog-tab.tsx:13 | import | ../../../lib/data | apps/web/lib/data.ts |
| apps/web/components/admin/tabs/admin-catalog-tab.tsx:14 | import | ../../../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/components/admin/tabs/admin-catalog-tab.tsx:15 | import | ../../../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/components/admin/tabs/admin-catalog-tab.tsx:16 | import | ../types | apps/web/components/admin/types.ts |
| apps/web/components/admin/tabs/admin-financials-tab.tsx:3 | import | react | external/package |
| apps/web/components/admin/tabs/admin-financials-tab.tsx:4 | import | lucide-react | external/package |
| apps/web/components/admin/tabs/admin-orders-tab.tsx:3 | import | ../../../lib/customer-commerce-mode | apps/web/lib/customer-commerce-mode.ts |
| apps/web/components/admin/tabs/admin-orders-tab.tsx:5 | import | react | external/package |
| apps/web/components/admin/tabs/admin-orders-tab.tsx:6 | import | next/link | external/package |
| apps/web/components/admin/tabs/admin-orders-tab.tsx:7 | import | next/image | external/package |
| apps/web/components/admin/tabs/admin-orders-tab.tsx:8 | import | lucide-react | external/package |
| apps/web/components/admin/tabs/admin-orders-tab.tsx:24 | import | ../../../lib/data | apps/web/lib/data.ts |
| apps/web/components/admin/tabs/admin-orders-tab.tsx:25 | import | ../../admin-real-orders | apps/web/components/admin-real-orders.tsx |
| apps/web/components/admin/tabs/admin-orders-tab.tsx:26 | import | ../../../lib/store/useOrderStore | apps/web/lib/store/useOrderStore.ts |
| apps/web/components/admin/tabs/admin-overview-tab.tsx:3 | import | react | external/package |
| apps/web/components/admin/tabs/admin-overview-tab.tsx:4 | import | next/link | external/package |
| apps/web/components/admin/tabs/admin-overview-tab.tsx:5 | import | lucide-react | external/package |
| apps/web/components/admin/tabs/admin-overview-tab.tsx:12 | import | ../../../lib/data | apps/web/lib/data.ts |
| apps/web/components/admin/tabs/admin-overview-tab.tsx:13 | import | ../../ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/admin/tabs/admin-overview-tab.tsx:14 | import | ../../../lib/customer-order-labels | apps/web/lib/customer-order-labels.ts |
| apps/web/components/admin/tabs/admin-overview-tab.tsx:15 | import | ../admin-context | apps/web/components/admin/admin-context.tsx |
| apps/web/components/admin/tabs/admin-overview-tab.tsx:16 | import | ../types | apps/web/components/admin/types.ts |
| apps/web/components/admin/tabs/admin-slowbar-tab.tsx:3 | import | react | external/package |
| apps/web/components/admin/tabs/admin-slowbar-tab.tsx:4 | import | lucide-react | external/package |
| apps/web/components/admin/tabs/admin-slowbar-tab.tsx:5 | import | ../../../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/components/admin/types.ts:1 | import | ../../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/components/admin/types.ts:2 | import | ../../lib/store/useOrderStore | apps/web/lib/store/useOrderStore.ts |
| apps/web/components/admin/types.ts:3 | import | ../../lib/customer-types | apps/web/lib/customer-types.ts |
| apps/web/components/admin-operational-commerce.tsx:3 | import | react | external/package |
| apps/web/components/admin-operational-commerce.tsx:4 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/admin-operational-commerce.tsx:5 | import | ../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/admin-product-manager.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/admin-product-manager.tsx:5 | import | react | external/package |
| apps/web/components/admin-product-manager.tsx:6 | import | next/image | external/package |
| apps/web/components/admin-product-manager.tsx:7 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/admin-real-orders.tsx:2 | import | ../lib/customer-order-labels | apps/web/lib/customer-order-labels.ts |
| apps/web/components/admin-real-orders.tsx:4 | import | react | external/package |
| apps/web/components/admin-real-orders.tsx:5 | import | next/image | external/package |
| apps/web/components/admin-real-orders.tsx:6 | import | next/link | external/package |
| apps/web/components/admin-real-orders.tsx:7 | import | lucide-react | external/package |
| apps/web/components/admin-real-orders.tsx:8 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/admin-real-orders.tsx:9 | import | ../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/admin-real-orders.tsx:10 | import | ../lib/customer-types | apps/web/lib/customer-types.ts |
| apps/web/components/admin-users.tsx:3 | import | react | external/package |
| apps/web/components/admin-users.tsx:4 | import | lucide-react | external/package |
| apps/web/components/admin-users.tsx:15 | import | ../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/app-layout-shell.tsx:3 | import | react | external/package |
| apps/web/components/app-layout-shell.tsx:4 | import | next/navigation | external/package |
| apps/web/components/app-layout-shell.tsx:5 | import | ./navbar | apps/web/components/navbar.tsx |
| apps/web/components/app-layout-shell.tsx:6 | import | ./footer | apps/web/components/footer.tsx |
| apps/web/components/app-layout-shell.tsx:7 | import | ./cart-drawer | apps/web/components/cart-drawer.tsx |
| apps/web/components/app-layout-shell.tsx:8 | import | ./virtual-barista | apps/web/components/virtual-barista.tsx |
| apps/web/components/app-layout-shell.tsx:9 | import | ./page-transition | apps/web/components/page-transition.tsx |
| apps/web/components/app-layout-shell.tsx:10 | import | ./site-intro-loader | apps/web/components/site-intro-loader.tsx |
| apps/web/components/app-layout-shell.tsx:11 | import | lucide-react | external/package |
| apps/web/components/app-layout-shell.tsx:12 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/blend-builder-experience.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/blend-builder-experience.tsx:5 | import | react | external/package |
| apps/web/components/blend-builder-experience.tsx:6 | import | next/image | external/package |
| apps/web/components/blend-builder-experience.tsx:7 | import | framer-motion | external/package |
| apps/web/components/blend-builder-experience.tsx:8 | import | lucide-react | external/package |
| apps/web/components/blend-builder-experience.tsx:15 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/blend-builder-experience.tsx:16 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/blend-builder-experience.tsx:17 | import | ../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/components/blend-builder-experience.tsx:18 | import | ../lib/use-catalog-publication | apps/web/lib/use-catalog-publication.ts |
| apps/web/components/blend-builder-experience.tsx:19 | import | ../lib/blend-profile | apps/web/lib/blend-profile.ts |
| apps/web/components/blend-builder-experience.tsx:20 | import | ../lib/partnership-estimate | apps/web/lib/partnership-estimate.ts |
| apps/web/components/blend-builder-experience.tsx:21 | import | ./flavor-radar-chart | apps/web/components/flavor-radar-chart.tsx |
| apps/web/components/blend-builder-experience.tsx:22 | import | ./partnership-blend-brief | apps/web/components/partnership-blend-brief.tsx |
| apps/web/components/blend-builder-experience.tsx:23 | import | ./ui/page-structure | apps/web/components/ui/page-structure.tsx |
| apps/web/components/brewing-guidance-experience.tsx:3 | import | react | external/package |
| apps/web/components/brewing-guidance-experience.tsx:4 | import | next/link | external/package |
| apps/web/components/brewing-guidance-experience.tsx:5 | import | next/image | external/package |
| apps/web/components/brewing-guidance-experience.tsx:6 | import | next/navigation | external/package |
| apps/web/components/brewing-guidance-experience.tsx:7 | import | framer-motion | external/package |
| apps/web/components/brewing-guidance-experience.tsx:8 | import | lucide-react | external/package |
| apps/web/components/brewing-guidance-experience.tsx:30 | import | ../lib/brewlogic-database | apps/web/lib/brewlogic-database.ts |
| apps/web/components/cart-drawer.tsx:3 | import | react | external/package |
| apps/web/components/cart-drawer.tsx:4 | import | next/link | external/package |
| apps/web/components/cart-drawer.tsx:5 | import | next/image | external/package |
| apps/web/components/cart-drawer.tsx:6 | import | lucide-react | external/package |
| apps/web/components/cart-drawer.tsx:7 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/cart-drawer.tsx:8 | import | ../lib/use-catalog-publication | apps/web/lib/use-catalog-publication.ts |
| apps/web/components/cart-drawer.tsx:9 | import | ../lib/cart-publication | apps/web/lib/cart-publication.ts |
| apps/web/components/cart-drawer.tsx:10 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/cart-drawer.tsx:11 | import | ../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/components/cart-drawer.tsx:12 | import | ../lib/accessories | apps/web/lib/accessories.ts |
| apps/web/components/catalog-content.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/catalog-content.tsx:5 | import | react | external/package |
| apps/web/components/catalog-content.tsx:6 | import | next/navigation | external/package |
| apps/web/components/catalog-content.tsx:7 | import | next/image | external/package |
| apps/web/components/catalog-content.tsx:8 | import | next/link | external/package |
| apps/web/components/catalog-content.tsx:9 | import | framer-motion | external/package |
| apps/web/components/catalog-content.tsx:10 | import | lucide-react | external/package |
| apps/web/components/catalog-content.tsx:17 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/catalog-content.tsx:21 | import | ../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/components/catalog-content.tsx:22 | import | ./editorial-product-card | apps/web/components/editorial-product-card.tsx |
| apps/web/components/catalog-product-detail.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/catalog-product-detail.tsx:5 | import | react | external/package |
| apps/web/components/catalog-product-detail.tsx:6 | import | next/navigation | external/package |
| apps/web/components/catalog-product-detail.tsx:7 | import | next/link | external/package |
| apps/web/components/catalog-product-detail.tsx:8 | import | next/image | external/package |
| apps/web/components/catalog-product-detail.tsx:9 | import | framer-motion | external/package |
| apps/web/components/catalog-product-detail.tsx:10 | import | lucide-react | external/package |
| apps/web/components/catalog-product-detail.tsx:26 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/catalog-product-detail.tsx:35 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/catalog-product-detail.tsx:36 | import | ../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/components/catalog-product-detail.tsx:37 | import | ./flavor-radar-chart | apps/web/components/flavor-radar-chart.tsx |
| apps/web/components/consultation-coffee-scene.tsx:3 | import | react | external/package |
| apps/web/components/consultation-coffee-scene.tsx:4 | import | @react-three/fiber | external/package |
| apps/web/components/consultation-coffee-scene.tsx:5 | import | @react-three/drei | external/package |
| apps/web/components/consultation-coffee-scene.tsx:6 | import | three | external/package |
| apps/web/components/consultation-experience.tsx:3 | import | next/dynamic | external/package |
| apps/web/components/consultation-experience.tsx:4 | import | next/image | external/package |
| apps/web/components/consultation-experience.tsx:5 | import | next/link | external/package |
| apps/web/components/consultation-experience.tsx:6 | import | react | external/package |
| apps/web/components/consultation-experience.tsx:7 | import | ./blend-builder-experience | apps/web/components/blend-builder-experience.tsx |
| apps/web/components/consultation-experience.tsx:8 | import | ./consultation-coffee-scene | apps/web/components/consultation-coffee-scene.tsx |
| apps/web/components/consultation-experience.tsx:10 | import | ./consultation-coffee-scene | apps/web/components/consultation-coffee-scene.tsx |
| apps/web/components/customer-account.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/customer-account.tsx:5 | import | ../lib/customer-order-labels | apps/web/lib/customer-order-labels.ts |
| apps/web/components/customer-account.tsx:7 | import | react | external/package |
| apps/web/components/customer-account.tsx:8 | import | next/link | external/package |
| apps/web/components/customer-account.tsx:9 | import | next/navigation | external/package |
| apps/web/components/customer-account.tsx:10 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/customer-account.tsx:11 | import | ../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/customer-account.tsx:12 | import | ../lib/customer-types | apps/web/lib/customer-types.ts |
| apps/web/components/customer-auth-form.tsx:3 | import | react | external/package |
| apps/web/components/customer-auth-form.tsx:4 | import | next/link | external/package |
| apps/web/components/customer-auth-form.tsx:5 | import | next/navigation | external/package |
| apps/web/components/customer-auth-form.tsx:6 | import | ../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/customer-checkout.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/customer-checkout.tsx:5 | import | react | external/package |
| apps/web/components/customer-checkout.tsx:6 | import | next/link | external/package |
| apps/web/components/customer-checkout.tsx:7 | import | next/navigation | external/package |
| apps/web/components/customer-checkout.tsx:8 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/customer-checkout.tsx:9 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/customer-checkout.tsx:10 | import | ../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/customer-checkout.tsx:11 | import | ../lib/customer-types | apps/web/lib/customer-types.ts |
| apps/web/components/customer-order-detail.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/customer-order-detail.tsx:5 | import | react | external/package |
| apps/web/components/customer-order-detail.tsx:6 | import | next/image | external/package |
| apps/web/components/customer-order-detail.tsx:7 | import | next/link | external/package |
| apps/web/components/customer-order-detail.tsx:8 | import | next/navigation | external/package |
| apps/web/components/customer-order-detail.tsx:9 | import | lucide-react | external/package |
| apps/web/components/customer-order-detail.tsx:10 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/customer-order-detail.tsx:11 | import | ../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/customer-order-detail.tsx:12 | import | ../lib/customer-types | apps/web/lib/customer-types.ts |
| apps/web/components/customer-order-detail.tsx:13 | import | ../lib/customer-order-labels | apps/web/lib/customer-order-labels.ts |
| apps/web/components/customer-track.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/customer-track.tsx:5 | import | react | external/package |
| apps/web/components/customer-track.tsx:6 | import | next/link | external/package |
| apps/web/components/customer-track.tsx:7 | import | next/navigation | external/package |
| apps/web/components/customer-track.tsx:8 | import | ../lib/customer-api | apps/web/lib/customer-api.ts |
| apps/web/components/customer-track.tsx:9 | import | ../lib/customer-order-labels | apps/web/lib/customer-order-labels.ts |
| apps/web/components/customer-track.tsx:10 | import | ../lib/customer-types | apps/web/lib/customer-types.ts |
| apps/web/components/editorial-product-card.tsx:3 | import | react | external/package |
| apps/web/components/editorial-product-card.tsx:4 | import | next/link | external/package |
| apps/web/components/editorial-product-card.tsx:5 | import | next/image | external/package |
| apps/web/components/editorial-product-card.tsx:6 | import | lucide-react | external/package |
| apps/web/components/editorial-product-card.tsx:7 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/editorial-product-card.tsx:8 | import | ./quick-view-modal | apps/web/components/quick-view-modal.tsx |
| apps/web/components/editorial-product-card.tsx:9 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/editorial-product-card.tsx:10 | import | ../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/components/events/event-actions.tsx:3 | import | react | external/package |
| apps/web/components/events/event-actions.tsx:4 | import | ../../lib/events | apps/web/lib/events.ts |
| apps/web/components/events/event-card.tsx:1 | import | next/image | external/package |
| apps/web/components/events/event-card.tsx:2 | import | next/link | external/package |
| apps/web/components/events/event-card.tsx:3 | import | lucide-react | external/package |
| apps/web/components/events/event-card.tsx:4 | import | ../../lib/events | apps/web/lib/events.ts |
| apps/web/components/events/event-discovery.tsx:3 | import | @/components/ui/loading-state | apps/web/components/ui/loading-state.tsx |
| apps/web/components/events/event-discovery.tsx:5 | import | react | external/package |
| apps/web/components/events/event-discovery.tsx:6 | import | next/link | external/package |
| apps/web/components/events/event-discovery.tsx:7 | import | lucide-react | external/package |
| apps/web/components/events/event-discovery.tsx:8 | import | ../../lib/events | apps/web/lib/events.ts |
| apps/web/components/events/event-discovery.tsx:9 | import | ./event-card | apps/web/components/events/event-card.tsx |
| apps/web/components/events/event-form.tsx:3 | import | react | external/package |
| apps/web/components/events/event-form.tsx:4 | import | next/link | external/package |
| apps/web/components/events/event-form.tsx:5 | import | next/navigation | external/package |
| apps/web/components/events/event-form.tsx:6 | import | ../../lib/events | apps/web/lib/events.ts |
| apps/web/components/flavor-radar-chart.tsx:3 | import | react | external/package |
| apps/web/components/flavor-radar-chart.tsx:4 | import | framer-motion | external/package |
| apps/web/components/footer.tsx:1 | import | react | external/package |
| apps/web/components/footer.tsx:2 | import | next/link | external/package |
| apps/web/components/footer.tsx:3 | import | ./logo | apps/web/components/logo.tsx |
| apps/web/components/footer.tsx:4 | import | lucide-react | external/package |
| apps/web/components/footer.tsx:6 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/grind-selector.tsx:3 | import | react | external/package |
| apps/web/components/grind-selector.tsx:4 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/grind-selector.tsx:5 | import | lucide-react | external/package |
| apps/web/components/hero/AromaParticles.tsx:3 | import | react | external/package |
| apps/web/components/hero/AromaParticles.tsx:4 | import | @react-three/fiber | external/package |
| apps/web/components/hero/AromaParticles.tsx:5 | import | three | external/package |
| apps/web/components/hero/AromaParticles.tsx:6 | import | ./types | apps/web/components/hero/types.ts |
| apps/web/components/hero/CoffeeCup.tsx:3 | import | react | external/package |
| apps/web/components/hero/CoffeeCup.tsx:4 | import | three | external/package |
| apps/web/components/hero/CoffeeLeaf.tsx:3 | import | react | external/package |
| apps/web/components/hero/CoffeeLeaf.tsx:4 | import | @react-three/fiber | external/package |
| apps/web/components/hero/CoffeeLeaf.tsx:5 | import | three | external/package |
| apps/web/components/hero/CoffeeModel.tsx:3 | import | react | external/package |
| apps/web/components/hero/CoffeeModel.tsx:4 | import | @react-three/drei | external/package |
| apps/web/components/hero/CoffeeModel.tsx:5 | import | @react-three/fiber | external/package |
| apps/web/components/hero/CoffeeModel.tsx:6 | import | three | external/package |
| apps/web/components/hero/CoffeeScene.tsx:3 | import | react | external/package |
| apps/web/components/hero/CoffeeScene.tsx:4 | import | @react-three/fiber | external/package |
| apps/web/components/hero/CoffeeScene.tsx:5 | import | @react-three/drei | external/package |
| apps/web/components/hero/CoffeeScene.tsx:6 | import | three | external/package |
| apps/web/components/hero/CoffeeScene.tsx:7 | import | ./CoffeeModel | apps/web/components/hero/CoffeeModel.tsx |
| apps/web/components/hero/CoffeeScene.tsx:8 | import | ./CoffeeCup | apps/web/components/hero/CoffeeCup.tsx |
| apps/web/components/hero/CoffeeScene.tsx:9 | import | ./FloatingBeans | apps/web/components/hero/FloatingBeans.tsx |
| apps/web/components/hero/CoffeeScene.tsx:10 | import | ./CoffeeLeaf | apps/web/components/hero/CoffeeLeaf.tsx |
| apps/web/components/hero/CoffeeScene.tsx:11 | import | ./AromaParticles | apps/web/components/hero/AromaParticles.tsx |
| apps/web/components/hero/CoffeeScene.tsx:12 | import | ./types | apps/web/components/hero/types.ts |
| apps/web/components/hero/FloatingBeans.tsx:3 | import | react | external/package |
| apps/web/components/hero/FloatingBeans.tsx:4 | import | @react-three/fiber | external/package |
| apps/web/components/hero/FloatingBeans.tsx:5 | import | three | external/package |
| apps/web/components/hero/FloatingBeans.tsx:6 | import | ./types | apps/web/components/hero/types.ts |
| apps/web/components/hero/HeroSection.tsx:3 | import | react | external/package |
| apps/web/components/hero/HeroSection.tsx:4 | import | react | external/package |
| apps/web/components/hero/HeroSection.tsx:5 | import | next/image | external/package |
| apps/web/components/hero/HeroSection.tsx:6 | import | next/link | external/package |
| apps/web/components/hero/HeroSection.tsx:7 | import | lucide-react | external/package |
| apps/web/components/hero/HeroSection.tsx:8 | import | framer-motion | external/package |
| apps/web/components/hero/HeroSection.tsx:9 | import | ./HeroSection.module.css | apps/web/components/hero/HeroSection.module.css |
| apps/web/components/hero/types.ts:1 | import | react | external/package |
| apps/web/components/logo.tsx:1 | import | react | external/package |
| apps/web/components/logo.tsx:2 | import | next/image | external/package |
| apps/web/components/motion-provider.tsx:3 | import | framer-motion | external/package |
| apps/web/components/navbar.tsx:3 | import | react | external/package |
| apps/web/components/navbar.tsx:4 | import | next/link | external/package |
| apps/web/components/navbar.tsx:5 | import | next/navigation | external/package |
| apps/web/components/navbar.tsx:6 | import | lucide-react | external/package |
| apps/web/components/navbar.tsx:7 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/navbar.tsx:8 | import | ../lib/store/cart-hydration | apps/web/lib/store/cart-hydration.ts |
| apps/web/components/navbar.tsx:9 | import | ../lib/store/useCartHydration | apps/web/lib/store/useCartHydration.ts |
| apps/web/components/navbar.tsx:10 | import | ./search-modal | apps/web/components/search-modal.tsx |
| apps/web/components/navbar.tsx:11 | import | ./logo | apps/web/components/logo.tsx |
| apps/web/components/ocha/ocha-faq.tsx:3 | import | react | external/package |
| apps/web/components/ocha/ocha-faq.tsx:4 | import | framer-motion | external/package |
| apps/web/components/ocha/ocha-faq.tsx:5 | import | lucide-react | external/package |
| apps/web/components/ocha/ocha-marquee.tsx:1 | import | react | external/package |
| apps/web/components/ocha/ocha-pill-navbar.tsx:3 | import | react | external/package |
| apps/web/components/ocha/ocha-pill-navbar.tsx:4 | import | next/link | external/package |
| apps/web/components/ocha/ocha-pill-navbar.tsx:5 | import | next/navigation | external/package |
| apps/web/components/ocha/ocha-pill-navbar.tsx:6 | import | lucide-react | external/package |
| apps/web/components/ocha/ocha-pill-navbar.tsx:16 | import | ../../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/ocha/ocha-pill-navbar.tsx:17 | import | ../navbar | apps/web/components/navbar.tsx |
| apps/web/components/page-transition.tsx:3 | import | react | external/package |
| apps/web/components/partnership-blend-brief.tsx:3 | import | react | external/package |
| apps/web/components/partnership-blend-brief.tsx:4 | import | lucide-react | external/package |
| apps/web/components/partnership-blend-brief.tsx:5 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/product-card.tsx:3 | import | react | external/package |
| apps/web/components/product-card.tsx:4 | import | next/link | external/package |
| apps/web/components/product-card.tsx:5 | import | next/image | external/package |
| apps/web/components/product-card.tsx:6 | import | lucide-react | external/package |
| apps/web/components/product-card.tsx:7 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/product-card.tsx:8 | import | ./quick-view-modal | apps/web/components/quick-view-modal.tsx |
| apps/web/components/quick-view-modal.tsx:3 | import | react | external/package |
| apps/web/components/quick-view-modal.tsx:4 | import | next/image | external/package |
| apps/web/components/quick-view-modal.tsx:5 | import | next/link | external/package |
| apps/web/components/quick-view-modal.tsx:6 | import | lucide-react | external/package |
| apps/web/components/quick-view-modal.tsx:7 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/quick-view-modal.tsx:8 | import | ./weight-selector | apps/web/components/weight-selector.tsx |
| apps/web/components/quick-view-modal.tsx:9 | import | ./grind-selector | apps/web/components/grind-selector.tsx |
| apps/web/components/quick-view-modal.tsx:10 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/quick-view-modal.tsx:11 | import | ../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/components/quick-view-modal.tsx:12 | import | ./sensory-tag | apps/web/components/sensory-tag.tsx |
| apps/web/components/search-modal.tsx:3 | import | react | external/package |
| apps/web/components/search-modal.tsx:4 | import | next/image | external/package |
| apps/web/components/search-modal.tsx:5 | import | next/link | external/package |
| apps/web/components/search-modal.tsx:6 | import | lucide-react | external/package |
| apps/web/components/search-modal.tsx:7 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/search-modal.tsx:8 | import | ../lib/use-catalog-publication | apps/web/lib/use-catalog-publication.ts |
| apps/web/components/search-modal.tsx:9 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/sensory/SensorySection.tsx:3 | import | react | external/package |
| apps/web/components/sensory/SensorySection.tsx:4 | import | next/image | external/package |
| apps/web/components/sensory/SensorySection.tsx:5 | import | next/link | external/package |
| apps/web/components/sensory/SensorySection.tsx:6 | import | framer-motion | external/package |
| apps/web/components/sensory/SensorySection.tsx:7 | import | lucide-react | external/package |
| apps/web/components/sensory/SensorySection.tsx:8 | import | ./spectrum-data | apps/web/components/sensory/spectrum-data.ts |
| apps/web/components/sensory/SensorySection.tsx:9 | import | ./SensorySection.module.css | apps/web/components/sensory/SensorySection.module.css |
| apps/web/components/sensory-tag.tsx:3 | import | react | external/package |
| apps/web/components/site-intro-loader.tsx:3 | import | react | external/package |
| apps/web/components/site-intro-loader.tsx:4 | import | framer-motion | external/package |
| apps/web/components/site-intro-loader.tsx:5 | import | ./logo | apps/web/components/logo.tsx |
| apps/web/components/site-intro-loader.tsx:6 | import | ./site-intro-loader.module.css | apps/web/components/site-intro-loader.module.css |
| apps/web/components/ui/back-button.tsx:3 | import | react | external/package |
| apps/web/components/ui/back-button.tsx:4 | import | next/navigation | external/package |
| apps/web/components/ui/back-button.tsx:5 | import | lucide-react | external/package |
| apps/web/components/ui/back-button.tsx:6 | import | clsx | external/package |
| apps/web/components/ui/loading-state.tsx:1 | import | lucide-react | external/package |
| apps/web/components/ui/loading-state.tsx:2 | import | ../logo | apps/web/components/logo.tsx |
| apps/web/components/ui/page-structure.tsx:1 | import | react | external/package |
| apps/web/components/ui/page-structure.tsx:2 | import | next/image | external/package |
| apps/web/components/ui/page-structure.tsx:3 | import | clsx | external/package |
| apps/web/components/ui/page-structure.tsx:4 | import | ../logo | apps/web/components/logo.tsx |
| apps/web/components/ui/qris-dynamic-card.tsx:3 | import | react | external/package |
| apps/web/components/ui/qris-dynamic-card.tsx:4 | import | next/image | external/package |
| apps/web/components/ui/qris-dynamic-card.tsx:5 | import | lucide-react | external/package |
| apps/web/components/ui/qris-dynamic-card.tsx:6 | import | ../../lib/qris | apps/web/lib/qris.ts |
| apps/web/components/ui/qris-dynamic-card.tsx:7 | import | ../../lib/data | apps/web/lib/data.ts |
| apps/web/components/ui/reserve-layout.tsx:1 | import | react | external/package |
| apps/web/components/virtual-barista.tsx:3 | import | react | external/package |
| apps/web/components/virtual-barista.tsx:4 | import | next/link | external/package |
| apps/web/components/virtual-barista.tsx:5 | import | next/image | external/package |
| apps/web/components/virtual-barista.tsx:6 | import | framer-motion | external/package |
| apps/web/components/virtual-barista.tsx:7 | import | lucide-react | external/package |
| apps/web/components/virtual-barista.tsx:13 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/virtual-barista.tsx:14 | import | ../lib/catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/components/virtual-barista.tsx:15 | import | ../lib/store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/components/virtual-barista.tsx:16 | import | ./logo | apps/web/components/logo.tsx |
| apps/web/components/virtual-barista.tsx:17 | import | ../lib/virtual-barista-events | apps/web/lib/virtual-barista-events.ts |
| apps/web/components/virtual-barista.tsx:18 | import | ../lib/virtual-barista-actions | apps/web/lib/virtual-barista-actions.ts |
| apps/web/components/virtual-barista.tsx:24 | import | ../lib/virtual-barista-recommendations | apps/web/lib/virtual-barista-recommendations.ts |
| apps/web/components/virtual-barista.tsx:28 | import | ../lib/catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/components/virtual-barista.tsx:29 | import | ../lib/use-catalog-publication | apps/web/lib/use-catalog-publication.ts |
| apps/web/components/weight-selector.tsx:3 | import | react | external/package |
| apps/web/components/weight-selector.tsx:4 | import | ../lib/data | apps/web/lib/data.ts |
| apps/web/components/weight-selector.tsx:5 | import | lucide-react | external/package |
| apps/web/lib/admin-session.test.mjs:1 | import | node:assert/strict | external/package |
| apps/web/lib/admin-session.test.mjs:2 | import | ./admin-session.ts | apps/web/lib/admin-session.ts |
| apps/web/lib/blend-profile.test.mjs:1 | import | node:assert/strict | external/package |
| apps/web/lib/blend-profile.test.mjs:2 | import | ./blend-profile.ts | apps/web/lib/blend-profile.ts |
| apps/web/lib/blend-profile.ts:1 | import | ./data | apps/web/lib/data.ts |
| apps/web/lib/cart-publication.test.mjs:1 | import | node:assert/strict | external/package |
| apps/web/lib/cart-publication.test.mjs:2 | import | ./cart-publication.ts | apps/web/lib/cart-publication.ts |
| apps/web/lib/cart-publication.ts:1 | import | ./store/useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/lib/catalog-master.ts:1 | import | ./catalog-owner-snapshot.json | apps/web/lib/catalog-owner-snapshot.json |
| apps/web/lib/catalog-master.ts:2 | import | ./data | apps/web/lib/data.ts |
| apps/web/lib/catalog-price-authority.test.mjs:1 | import | node:assert/strict | external/package |
| apps/web/lib/catalog-price-authority.test.mjs:4 | import | ./catalog-publication.ts?price-test | apps/web/lib/catalog-publication.ts |
| apps/web/lib/catalog-publication-client.ts:1 | import | ./catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/lib/catalog-publication-client.ts:2 | import | ./catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/lib/catalog-publication-server.ts:1 | import | ./catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/lib/catalog-publication-server.ts:2 | import | ./catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/lib/catalog-publication.test.mjs:1 | import | node:assert/strict | external/package |
| apps/web/lib/catalog-publication.test.mjs:2 | import | ./data.ts | apps/web/lib/data.ts |
| apps/web/lib/catalog-publication.test.mjs:3 | import | ./catalog-publication.ts | apps/web/lib/catalog-publication.ts |
| apps/web/lib/catalog-publication.ts:1 | import | ./data | apps/web/lib/data.ts |
| apps/web/lib/customer-order-labels.ts:1 | import | ./customer-types | apps/web/lib/customer-types.ts |
| apps/web/lib/customer-payment-server.ts:1 | import | qrcode | external/package |
| apps/web/lib/customer-payment-server.ts:2 | import | ./qris | apps/web/lib/qris.ts |
| apps/web/lib/customer-payment-server.ts:3 | import | next/server | external/package |
| apps/web/lib/data.ts:1 | import | ./catalog-master | apps/web/lib/catalog-master.ts |
| apps/web/lib/events.ts:70 | import | ./data | apps/web/lib/data.ts |
| apps/web/lib/google-oauth-routes.test.cjs:1 | require | node:assert/strict | external/package |
| apps/web/lib/google-oauth-routes.test.cjs:2 | require | node:fs | external/package |
| apps/web/lib/google-oauth-routes.test.cjs:3 | require | node:path | external/package |
| apps/web/lib/google-oauth-routes.test.cjs:4 | require | node:vm | external/package |
| apps/web/lib/google-oauth-routes.test.cjs:5 | require | typescript | external/package |
| apps/web/lib/google-oauth-routes.test.cjs:6 | require | next/server | external/package |
| apps/web/lib/partnership-estimate.test.ts:1 | import | node:assert/strict | external/package |
| apps/web/lib/partnership-estimate.test.ts:2 | import | ./partnership-estimate | apps/web/lib/partnership-estimate.ts |
| apps/web/lib/partnership-estimate.test.ts:3 | import | ./blend-profile | apps/web/lib/blend-profile.ts |
| apps/web/lib/qr-generator.ts:1 | import | qrcode | external/package |
| apps/web/lib/qris.ts:13 | import | ./qr-generator | apps/web/lib/qr-generator.ts |
| apps/web/lib/store/cart-hydration.test.mjs:1 | import | node:assert/strict | external/package |
| apps/web/lib/store/cart-hydration.test.mjs:2 | import | ./cart-hydration.ts | apps/web/lib/store/cart-hydration.ts |
| apps/web/lib/store/useCartHydration.ts:3 | import | react | external/package |
| apps/web/lib/store/useCartHydration.ts:4 | import | ./useCartStore | apps/web/lib/store/useCartStore.ts |
| apps/web/lib/store/useCartStore.ts:1 | import | zustand | external/package |
| apps/web/lib/store/useCartStore.ts:2 | import | zustand/middleware | external/package |
| apps/web/lib/store/useCartStore.ts:3 | import | ../data | apps/web/lib/data.ts |
| apps/web/lib/store/useOrderStore.ts:1 | import | zustand | external/package |
| apps/web/lib/store/useOrderStore.ts:2 | import | zustand/middleware | external/package |
| apps/web/lib/use-catalog-publication.ts:3 | import | react | external/package |
| apps/web/lib/use-catalog-publication.ts:4 | import | ./catalog-publication | apps/web/lib/catalog-publication.ts |
| apps/web/lib/use-catalog-publication.ts:5 | import | ./catalog-publication-client | apps/web/lib/catalog-publication-client.ts |
| apps/web/lib/virtual-barista-actions.test.ts:1 | import | ./virtual-barista-actions | apps/web/lib/virtual-barista-actions.ts |
| apps/web/lib/virtual-barista-recommendations.test.mjs:1 | import | node:assert/strict | external/package |
| apps/web/lib/virtual-barista-recommendations.test.mjs:2 | import | ./data.ts | apps/web/lib/data.ts |
| apps/web/lib/virtual-barista-recommendations.test.mjs:3 | import | ./virtual-barista-recommendations.ts | apps/web/lib/virtual-barista-recommendations.ts |
| apps/web/lib/virtual-barista-recommendations.ts:1 | import | ./data | apps/web/lib/data.ts |
| apps/web/lib/virtual-barista-response.test.ts:1 | import | ./virtual-barista-response | apps/web/lib/virtual-barista-response.ts |
| apps/web/lib/virtual-barista-response.ts:1 | import | ./virtual-barista-actions | apps/web/lib/virtual-barista-actions.ts |
| apps/web/scripts/export-customer-catalog.cjs:2 | require | node:fs | external/package |
| apps/web/scripts/export-customer-catalog.cjs:3 | require | typescript | external/package |
| apps/web/scripts/export-customer-catalog.cjs:10 | require | ../lib/catalog-master.ts | apps/web/lib/catalog-master.ts |
| apps/web/scripts/export-customer-catalog.cjs:11 | require | ../lib/blend-profile.ts | apps/web/lib/blend-profile.ts |
| apps/web/scripts/export-customer-catalog.cjs:12 | require | ../lib/accessories.ts | apps/web/lib/accessories.ts |
| apps/web/tailwind.config.ts:1 | import | tailwindcss | external/package |
| scripts/check-catalog-request-sharing.cjs:1 | require | ../apps/web/node_modules/sucrase/register | dependency package; resolusi Node directory |
| scripts/check-catalog-request-sharing.cjs:2 | require | node:assert/strict | external/package |
| scripts/check-catalog-request-sharing.cjs:3 | require | ../apps/web/lib/catalog-publication-client.ts | apps/web/lib/catalog-publication-client.ts |
| scripts/check-dynamic-qris.cjs:1 | require | node:assert/strict | external/package |
| scripts/check-dynamic-qris.cjs:2 | require | node:fs | external/package |
| scripts/check-dynamic-qris.cjs:3 | require | ../apps/web/node_modules/typescript | dependency package; resolusi Node directory |
| scripts/check-dynamic-qris.cjs:7 | require | ../apps/web/lib/qris.ts | apps/web/lib/qris.ts |
| scripts/check-dynamic-qris.cjs:8 | require | ../apps/web/lib/customer-payment-server.ts | apps/web/lib/customer-payment-server.ts |
| scripts/check-dynamic-qris.cjs:28 | require | ../apps/web/node_modules/next/server | apps/web/node_modules/next/server.js |
| scripts/check-dynamic-qris.cjs:29 | require | ../apps/web/app/api/customer/payment-instructions/image/route.ts | apps/web/app/api/customer/payment-instructions/image/route.ts |
| scripts/check-guided-consultations.cjs:1 | require | node:assert/strict | external/package |
| scripts/check-guided-consultations.cjs:2 | require | node:fs | external/package |
| scripts/check-guided-consultations.cjs:3 | require | node:path | external/package |
| scripts/check-guided-consultations.cjs:4 | require | puppeteer | external/package |
| scripts/check-production-payment-config.cjs:1 | require | node:assert/strict | external/package |
| scripts/check-production-payment-config.cjs:2 | require | node:fs | external/package |
| scripts/check-production-payment-config.cjs:3 | require | ../apps/web/node_modules/typescript | dependency package; resolusi Node directory |
| scripts/check-production-payment-config.cjs:7 | require | ../apps/web/lib/customer-payment-server.ts | apps/web/lib/customer-payment-server.ts |
| scripts/check-wholesale-render.cjs:1 | require | node:fs | external/package |
| scripts/check-wholesale-render.cjs:2 | require | node:assert/strict | external/package |
| scripts/check-wholesale-render.cjs:3 | require | ../apps/web/node_modules/typescript | dependency package; resolusi Node directory |
| scripts/check-wholesale-render.cjs:10 | require | ../apps/web/node_modules/react | dependency package; resolusi Node directory |
| scripts/check-wholesale-render.cjs:11 | require | ../apps/web/node_modules/react-dom/server | apps/web/node_modules/react-dom/server.js |
| scripts/check-wholesale-render.cjs:12 | require | ../apps/web/app/work-with-us/wholesale-section.tsx | apps/web/app/work-with-us/wholesale-section.tsx |
| scripts/run-virtual-barista-tests.cjs:1 | require | node:child_process | external/package |
| scripts/run-virtual-barista-tests.cjs:2 | require | node:path | external/package |
| scripts/run-virtual-barista-tests.cjs:4 | require | ../apps/web/node_modules/sucrase/register | dependency package; resolusi Node directory |
| scripts/run-virtual-barista-tests.cjs:6 | require | ../apps/web/lib/virtual-barista-actions.test.ts | apps/web/lib/virtual-barista-actions.test.ts |
| scripts/run-virtual-barista-tests.cjs:7 | require | ../apps/web/lib/virtual-barista-response.test.ts | apps/web/lib/virtual-barista-response.test.ts |

## Kontrak URL dan render (inventaris statis)

### apps/web/app/about/page.tsx

```text
47: <section id="behind" className={styles.hero} aria-labelledby="about-heading">
55: <h1 id="about-heading"><span>SETIAP CANGKIR</span><span>DIMULAI DARI</span><span>RASA INGIN TAHU.</span></h1>
68: <motion.section id="our-story" className={styles.story} aria-labelledby="story-heading" {...reveal}>
71: <h2 id="story-heading">Roastery dan slowbar dalam satu percakapan rasa.</h2>
100: <h2 id="principles-heading">Teliti dalam proses.<br />Hangat dalam percakapan.</h2>
114: <motion.section id="roastery-journey" className={styles.journey} aria-labelledby="journey-heading" {...reveal}>
117: <h2 id="journey-heading">Empat tahap.<br />Satu alur yang terhubung.</h2>
132: <motion.section id="slowbar-ambience" className={styles.slowbar} aria-labelledby="slowbar-heading" {...reveal}>
134: <div><p className={styles.eyebrow}>Slowbar Ambience</p><h2 id="slowbar-heading">Ruang untuk menyeduh lebih pelan.</h2></div>
151: <h2 id="about-cta-heading">CERITA BERIKUTNYA<br />ADA DI CANGKIRMU.</h2>
```

### apps/web/app/account/orders/page.tsx

```text
4: redirect('/account');
```

### apps/web/app/admin/layout.tsx

```text
5: export const metadata: Metadata = {
```

### apps/web/app/admin/products/page.tsx

```text
7: export const dynamic = 'force-dynamic';
9: export default async function AdminProductsPage({ searchParams }: { searchParams: { edit?: string; new?: string } }) {
10: if (!await hasAuthorizedAdminSession({ cookies: cookies() })) redirect('/admin');
23: <AdminProductManager initialSlug={searchParams.edit} createOnLoad={searchParams.new === '1'} />
```

### apps/web/app/api/admin/session/route.ts

```text
8: export const dynamic = 'force-dynamic';
```

### apps/web/app/api/catalog/authority/route.ts

```text
3: export const dynamic = 'force-dynamic';
```

### apps/web/app/api/catalog/managed/[[...path]]/route.ts

```text
4: export const dynamic = 'force-dynamic';
```

### apps/web/app/api/catalog/prices/route.ts

```text
4: export const dynamic = 'force-dynamic';
```

### apps/web/app/api/catalog/publication/route.ts

```text
4: export const dynamic = 'force-dynamic';
```

### apps/web/app/api/chat/route.ts

```text
8: export const dynamic = 'force-dynamic';
```

### apps/web/app/api/checkout/confirm/route.ts

```text
3: export const dynamic = 'force-dynamic';
```

### apps/web/app/api/checkout/quote/route.ts

```text
3: export const dynamic = 'force-dynamic';
```

### apps/web/app/api/customer/[...path]/route.ts

```text
5: export const dynamic = 'force-dynamic';
6: export const runtime = 'nodejs';
```

### apps/web/app/api/customer/google/callback/route.ts

```text
4: export const dynamic = 'force-dynamic';
5: export const runtime = 'nodejs';
11: fallback.searchParams.set('reason', reason);
12: const response = NextResponse.redirect(fallback, { headers: { 'Cache-Control': 'no-store' } });
29: const state = request.nextUrl.searchParams.get('state');
30: const code = request.nextUrl.searchParams.get('code');
32: if (!code) return fail(request.nextUrl.searchParams.has('error') ? 'google_denied' : 'code_missing');
60: const response = NextResponse.redirect(new URL(next, request.url), { headers: { 'Cache-Control': 'no-store' } });
```

### apps/web/app/api/customer/google/start/route.ts

```text
4: export const dynamic = 'force-dynamic';
5: export const runtime = 'nodejs';
17: return NextResponse.redirect(canonicalStart, { headers: { 'Cache-Control': 'no-store' } });
22: const nextParam = request.nextUrl.searchParams.get('next') ?? '/account';
29: const link = request.nextUrl.searchParams.get('link') === '1';
37: const response = NextResponse.redirect(url, { headers: { 'Cache-Control': 'no-store' } });
```

### apps/web/app/api/customer/payment-instructions/image/route.ts

```text
4: export const dynamic = 'force-dynamic';
5: export const runtime = 'nodejs';
10: const order = await paymentOrder(request, request.nextUrl.searchParams.get('order') ?? '');
20: 'Content-Disposition': request.nextUrl.searchParams.get('download') === '1'
```

### apps/web/app/api/customer/payment-instructions/route.ts

```text
4: export const dynamic = 'force-dynamic';
5: export const runtime = 'nodejs';
8: const order = await paymentOrder(request, request.nextUrl.searchParams.get('order') ?? '');
```

### apps/web/app/api/events/[...path]/route.ts

```text
4: export const dynamic = 'force-dynamic';
5: export const runtime = 'nodejs';
```

### apps/web/app/background/page.tsx

```text
7: export const metadata: Metadata = {
```

### apps/web/app/catalog/[slug]/page.tsx

```text
7: export const dynamic = 'force-dynamic';
15: export function generateStaticParams() {
19: export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
```

### apps/web/app/catalog/page.tsx

```text
5: export const dynamic = 'force-dynamic';
7: export const metadata: Metadata = {
```

### apps/web/app/checkout/page.tsx

```text
438: id="checkout-name"
451: id="checkout-phone"
464: id="checkout-email"
476: id="checkout-address"
489: id="checkout-city"
500: id="checkout-postal"
512: id="checkout-notes"
752: <h3 id="payment-simulation-title" className="font-bold text-sm">Simulasi Pembayaran</h3>
```

### apps/web/app/coffee-lab/[...slug]/page.tsx

```text
10: export const dynamic = 'force-dynamic';
28: export function generateStaticParams() {
32: export function generateMetadata({ params }: Props): Metadata {
39: if (legacyTarget) permanentRedirect(legacyTarget);
69: <article id={section.id} key={section.id} className={`${entry.group === 'experiment' ? 'ui-surface p-6 sm:p-7' : 'border-t-2 border-brand-charcoal pt-5'} scroll-mt-28`}>
```

### apps/web/app/coffee-lab/brewing-guidance/page.tsx

```text
9: export const metadata: Metadata = {
20: <div className="editorial-hero-copy"><p className="lab-hero__eyebrow">Coffee Lab / Brewing Guidance</p><h1 id="brewing-title" className="lab-hero__title">Setiap seduhan berarti.</h1><p className="lab-hero__description">Dari gilingan pertama hingga tuangan terakhir. Kenali metode, susun resep, dan seduh dengan percaya diri.</p><div className="lab-hero__actions"><a href="#precision-console" className="lab-hero__primary">Mulai menyeduh <ArrowRight className="h-4 w-4" aria-hidden="true" /></a></div></div>
```

### apps/web/app/coffee-lab/build-your-own-blend/page.tsx

```text
7: export const metadata: Metadata = {
25: <div className="editorial-hero-copy"><p className="lab-hero__eyebrow">Coffee Lab / Build Your Own Blend</p><h1 id="lab-blend-title" className="lab-hero__title">Racik kopi dari rasa yang kamu suka.</h1><p className="lab-hero__description">Kenali karakter beans. Atur proporsi dan lihat bagaimana profil rasa berubah.</p><div className="lab-hero__actions"><a href="#blend-lab" className="lab-hero__primary">Mulai meracik <ArrowRight className="h-4 w-4" aria-hidden="true" /></a></div></div>
30: <section id="blend-lab" className="scroll-mt-28 bg-white py-20 sm:py-28" aria-labelledby="blend-workspace-title">
32: <div className="grid gap-7 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-20 editorial-reveal"><div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-brand-maroon">Eksplorasi rasa</p><h2 id="blend-workspace-title" className="mt-5 max-w-[14ch] font-editorial text-4xl font-extrabold leading-[1.06] tracking-tight text-brand-charcoal sm:text-5xl">Racikanmu, seleramu.</h2></div><p className="max-w-xl self-end text-sm leading-7 text-on-surface-variant sm:text-base">Pilih beans yang tersedia, atur rasio, dan baca perubahan aroma, body, acidity, serta sweetness. Ini adalah ruang belajar rasa.</p></div>
33: <ol className="mt-12 grid border-y border-border-subtle md:grid-cols-4 editorial-reveal-list">{stages.map(([id, title, description], index) => <li id={id} key={id} className="scroll-mt-28 border-b border-border-subtle py-5 last:border-b-0 md:border-b-0 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0"><span className="font-mono text-xs font-bold text-brand-maroon">0{index + 1}</span><h3 className="mt-4 font-editorial text-base font-bold text-brand-charcoal">{title}</h3><p className="mt-2 text-xs leading-5 text-on-surface-variant">{description}</p></li>)}</ol>
```

### apps/web/app/coffee-lab/coffee-experiments/cupping-event-section.tsx

```text
7: <section id="cupping-events" aria-labelledby="cupping-title" className="lab-hero scroll-mt-32">
9: <div className="editorial-hero-copy"><p className="lab-hero__eyebrow">Coffee Lab / Cupping Events</p><h1 id="cupping-title" className="lab-hero__title">Kenali kopi lewat satu meja.</h1><p className="lab-hero__description">Temukan sesi cupping dan workshop, baca detailnya, lalu hubungi organizer melalui WhatsApp untuk meminta tempat.</p><div className="lab-hero__actions"><a href="#agenda-events" className="lab-hero__primary">Lihat agenda <ArrowRight className="h-4 w-4" aria-hidden="true" /></a><Link href="/events/create" className="lab-hero__secondary">Buat event</Link></div></div>
```

### apps/web/app/coffee-lab/coffee-experiments/page.tsx

```text
8: export const metadata: Metadata = {
21: <div><p className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-brand-maroon">Panduan cupping</p><h2 id="flavor-guide-heading" className="mt-5 max-w-[17ch] font-editorial text-4xl font-extrabold leading-[1.06] tracking-tight text-brand-charcoal sm:text-5xl">Kenali rasa sebelum duduk di meja cupping.</h2><p className="mt-5 max-w-[50ch] text-sm leading-7 text-on-surface-variant">Jelajahi aroma, acidity, sweetness, body, dan aftertaste untuk membantumu mendeskripsikan setiap cangkir.</p><Link href="/#sensory-spectrum" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-navy underline underline-offset-4">Jelajahi Flavor Wheel <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
```

### apps/web/app/coffee-lab/page.tsx

```text
7: export const metadata: Metadata = {
68: <section id="coffee-experiments" className="editorial-reveal scroll-mt-28 border-y border-border-subtle bg-surface-container-low">
```

### apps/web/app/events/[slug]/page.tsx

```text
9: export const dynamic = 'force-dynamic';
22: export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
49: <section className="mt-10 border-t border-border-subtle pt-8" aria-labelledby="about-event"><h2 id="about-event" className="font-editorial text-2xl font-bold text-brand-charcoal">Tentang event</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{event.description}</p>{event.instructions ? <><h3 className="mt-8 font-editorial text-xl font-bold text-brand-charcoal">Sebelum datang</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{event.instructions}</p></> : null}</section>
```

### apps/web/app/guide/page.tsx

```text
9: export const metadata: Metadata = {
```

### apps/web/app/layout.tsx

```text
7: export const metadata: Metadata = {
```

### apps/web/app/organizers/[slug]/page.tsx

```text
8: export const dynamic = 'force-dynamic';
19: export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
```

### apps/web/app/page.tsx

```text
307: id="manifesto-heading"
342: <h2 id="featured-heading">Kopi dengan<br />suara yang berbeda.</h2>
431: <h2 id="catalog-index-heading">Dari profil rasa hingga racikan kedai.</h2>
501: id="process-panel"
511: <h2 id="process-heading">{processStep.title}</h2>
593: <h2 id="story-heading"><span>Seduh lebih</span><span>presisi.</span></h2>
656: <h2 id="b2b-heading">Kemitraan kopi untuk bisnismu.</h2>
695: <h2 id="faq-heading">Kenali asisten kopi digital kami.</h2>
723: id={buttonId}
734: id={panelId}
765: id="final-cta-heading"
```

### apps/web/app/privacy/page.tsx

```text
4: export const metadata: Metadata = {
```

### apps/web/app/roasters/page.tsx

```text
7: export const metadata: Metadata = {
```

### apps/web/app/slowbar/page.tsx

```text
4: export const dynamic = 'force-dynamic';
6: export const metadata = {
```

### apps/web/app/tools/brew-calculator/page.tsx

```text
4: permanentRedirect('/coffee-lab/brewing-guidance');
```

### apps/web/app/tools/price-calculator/page.tsx

```text
50: <MoneyField id="bean-price" label="Harga bahan baku per kg" value={beanPrice} onChange={setBeanPrice} placeholder="Contoh: 180000" />
51: <NumberField id="dose" label="Takaran kopi per porsi (gram)" value={dose} onChange={setDose} placeholder="Contoh: 18" />
52: <MoneyField id="other-cost" label="Biaya variabel lain per porsi" value={otherCost} onChange={setOtherCost} placeholder="Susu, kemasan, filter, dan biaya variabel lain" required={false} />
53: <MoneyField id="selling-price" label="Harga jual per porsi" value={sellingPrice} onChange={setSellingPrice} placeholder="Opsional" required={false} />
54: <NumberField id="daily-cups" label="Target penjualan per hari" value={dailyCups} onChange={setDailyCups} placeholder="Opsional" required={false} />
55: <NumberField id="days" label="Hari operasional per bulan" value={days} onChange={setDays} placeholder="Opsional" required={false} />
88: return <label htmlFor={id} className="space-y-1.5"><span className="field-label">{label}{required && ' *'}</span><input id={id} type="number" min="0" step="any" inputMode="decimal" required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-control" /></label>;
92: return <label htmlFor={id} className="space-y-1.5"><span className="field-label">{label}{required && ' *'}</span><span className="relative block"><span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-on-surface-variant">Rp</span><input id={id} type="number" min="0" step="any" inputMode="decimal" required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-control pl-10" /></span></label>;
```

### apps/web/app/track/page.tsx

```text
44: const searchParams = useSearchParams();
45: const initialOrder = searchParams.get('order') || '';
58: const orderParam = searchParams.get('order');
63: }, [searchParams]);
183: id="order-code"
212: id="phone"
227: id="email"
```

### apps/web/app/work-with-us/blend-builder/page.tsx

```text
4: permanentRedirect('/work-with-us/consultations');
```

### apps/web/app/work-with-us/consultations/consultation-form-section.tsx

```text
64: id="b2b-biz-name"
79: id="b2b-contact-name"
96: id="b2b-phone"
111: id="b2b-city"
127: id="b2b-service"
143: id="b2b-volume"
163: id="b2b-custom-volume"
178: id="b2b-notes"
```

### apps/web/app/work-with-us/consultations/page.tsx

```text
7: export const metadata: Metadata = {
```

### apps/web/app/work-with-us/wholesale-partnership/page.tsx

```text
4: redirect('/work-with-us#wholesale-partnership');
```

### apps/web/app/work-with-us/wholesale-section.tsx

```text
48: <h1 id="partnership-hero-heading">Pasokan kopi yang berawal dari kebutuhanmu.</h1>
52: <section className={styles.briefCard} aria-labelledby="partnership-brief-title"><h2 id="partnership-brief-title">Brief kemitraan</h2><dl><div><dt>Layanan</dt><dd>{services.find(service => service.value === serviceType)?.title}</dd></div><div><dt>Kebutuhan</dt><dd>{estimatedVolume || 'Belum ditentukan'}</dd></div><div><dt>Lokasi</dt><dd>{city || 'Belum diinformasikan'}</dd></div></dl></section>
53: <section className={styles.nextSteps} aria-labelledby="partnership-next-title"><h2 id="partnership-next-title">Setelah brief dikirim</h2><ol><li>Diskusikan kebutuhan bisnis.</li><li>Sesuaikan pilihan beans atau blend.</li><li>Sepakati volume dan jadwal.</li></ol></section>
57: <section id="wholesale-partnership" className={`${styles.workspace} site-container`} aria-labelledby="wholesale-title">
58: <header id="wholesale-services" className={styles.intro}><span id="partnerships" />
60: <h2 id="wholesale-title">Mulai dari kebutuhanmu.</h2>
74: <Link id="consultations" href="/work-with-us/consultations">Rancang blend & hitung HPP</Link>
76: <form id="wholesale-business-form" onSubmit={submit} className={styles.form} aria-describedby="wholesale-note">
79: <label>Nama bisnis / kedai kopi *<input id="business-name" name="businessName" required autoComplete="organization" value={businessName} onChange={e => setBusinessName(e.target.value)} aria-invalid={validation && !businessName.trim() || undefined} className="field-control" />{validation && !businessName.trim() && <span className={styles.error}>Isi nama bisnis.</span>}</label>
80: <label>Nama kontak *<input id="contact-name" name="contactName" required autoComplete="name" value={contactName} onChange={e => setContactName(e.target.value)} aria-invalid={validation && !contactName.trim() || undefined} className="field-control" />{validation && !contactName.trim() && <span className={styles.error}>Isi nama kontak.</span>}</label>
81: <label>Nomor WhatsApp aktif *<input id="business-phone" name="phone" type="tel" required inputMode="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} aria-invalid={validation && !phone.trim() || undefined} className="field-control" />{validation && !phone.trim() && <span className={styles.error}>Isi nomor WhatsApp.</span>}</label>
82: <label>Alamat / lokasi bisnis<input id="business-location" name="city" autoComplete="street-address" value={city} onChange={e => setCity(e.target.value)} className="field-control" placeholder="Contoh: Malang / Surabaya" /></label>
83: <label>Jenis layanan kemitraan<select id="service-type" name="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value)} className="field-control">{services.map(service => <option key={service.value} value={service.value}>{service.value}</option>)}</select></label>
84: <label>Estimasi kebutuhan biji kopi<input id="estimated-volume" name="estimatedVolume" value={estimatedVolume} onChange={e => setEstimatedVolume(e.target.value)} className="field-control" placeholder="Contoh: 25 kg / bulan" /></label>
85: <label className={styles.notes}>Catatan tambahan / profil rasa yang dicari<textarea id="partnership-notes" name="message" rows={3} value={message} onChange={e => setMessage(e.target.value)} className="field-control" placeholder="Profil rasa, target menu, atau mesin yang digunakan." /></label>
88: <p id="wholesale-note" className={styles.note}>Membuka WhatsApp belum mengirim pesan. Periksa pesan, lalu tekan Kirim di WhatsApp resmi 52 Coffee.</p>
```


## Batas audit

Inventaris mengecualikan generated .next* dan node_modules. Semua import literal sumber dipetakan; require/import computed dan path dalam string runner perlu pemeriksaan referensi tambahan per batch. Public assets tidak dipindah. Audit ini statis; typecheck/lint/build/regression/browser belum dijalankan. Tidak ada klaim runtime/backend sehat dari audit ini.
