# DESIGN — 52 Coffee & Roastery
**Sitewide Design System & UX Redesign Specification**  
**Versi:** 0.1 — usulan untuk review, bukan desain final/approved  
**Tanggal:** 19 November 2026  
**Basis audit:** \`main\` @ \`eb17643c73cd08ba9a6cfc7db6be7821e6543d19\`  
**Relasi:** [PRD.md](./PRD.md) — kontrak fungsi. **DESIGN bukan izin mengubah aturan bisnis.**

> **AS-IS / TARGET dipisahkan secara eksplisit.** Kode saat ini memakai navy/teal/maroon; usulan target adalah **Warm Editorial Roastery** dengan warna brand asli sebagai aksen. Perubahan target memerlukan persetujuan brand owner/desain. Hindari menganggap contoh arah editorial dari situs inspirasi sebagai aset yang boleh disalin.

## 1. Audit visual AS-IS
**Sumber kode:** \`apps/web/tailwind.config.ts\`, \`app/globals.css\`, \`features/home/home-page.module.css\`, \`features/home/hero/HeroSection.tsx\`, \`features/catalog/catalog-content.tsx\`, \`components/layout/navbar.tsx\`, \`components/layout/footer.tsx\`, \`features/coffee-lab/**\`.

| Unsur | Implementasi aktual | Catatan |
|---|---|---|
| Warna inti | Navy \`#465C70\`, charcoal \`#2C3136\`, teal \`#8FB9BC\`, mist \`#CFE8EA\`, maroon \`#A52136\`, background \`#F8FAFC\` | \`README.md\` masih mendeskripsikan cokelat espresso/caramel lama: dokumentasi konflik |
| Tipografi | Headings Raleway; body Montserrat/Plus Jakarta Sans; numerik Cascadia Code/JetBrains Mono | README masih menyebut Playfair Display, tidak sesuai konfigurasi |
| UI primitives | \`site-container\`, \`section-space\`, \`btn-primary\`, \`btn-secondary\`, \`page-structure.tsx\`; sebagian halaman memakai CSS modules/kelas khusus | Adopsi berbeda, perlu standardisasi bertahap |
| Hero | Home memiliki carousel interaktif; Consultations punya 3D scene client-only dengan image fallback; Brewing memakai split editorial hero | Tidak ada satu sistem urutan konten/kerangka hero |
| Product | Product grids, search, Quick View, variant selector, cart, specialty notes | Katalog punya logika publikasi dan harga yang harus dijaga |
| Layout | \`site-container\` max-width 1280px; home punya sectionShell sampai 1440px | Tetapkan aturan grid dan pengecualian hero yang eksplisit |
| Motion | Framer Motion, carousel, pointer interactions dan komponen Three.js | Wajib reduced-motion, fallback dan mobile budget |
| Asset library | Foto/cutout lokal \`apps/web/public/images\`, model eksperimentasi, FigCraft \`design/\` | Verifikasi izin pakai dan kesesuaian nama/packaging sebelum publish |

**Batas audit:** Ini audit struktur dan source, **bukan** pixel-perfect QA keseluruhan website live; screenshot/browser/accessibility/performance lapangan masih gate implementasi.

## 2. Arah visual TARGET — Warm Editorial Roastery
**Tujuan:** premium, tactile, calm, specific-to-52-Coffee, bukan template SaaS generik dan bukan visual “AI-generated” yang berlebihan. Rancang rasa specialty coffee sebagai editorial: foto asli, tipografi terukur, ruang kosong yang disengaja, komposisi asimetris yang tenang, informasi produk jelas.

### Prinsip
1. **Product truth first:** visual kopi tidak mengorbankan label, stok, varian, harga, dan tindakan pembelian.
2. **One brand, different jobs:** marketing, education, commerce, B2B dan admin berbagi token/komponen tetapi punya density sesuai konteks.
3. **Photography over decoration:** utamakan hasil roasting, beans, alat, orang, ruang; 3D hanya menambah cerita, bukan menutup navigasi.
4. **Editorial hierarchy:** satu focal point per viewport, kalimat pendek, contrast jelas, bukan bertumpuk headline, badge, gradients atau floating boxes.
5. **Predictable interaction:** progress, validation, dialogs dan actions terasa konsisten di setiap route.
6. **A11y/performance by design:** tidak ada ketergantungan pada hover/WebGL untuk informasi penting.

### Direction board (proposal)
- **Mood:** modern specialty roastery + quiet editorial + warm tactile photography + technical precision.
- **Visual cadence:** sections putih hangat, off-white stone, foto full-bleed sesekali, section charcoal untuk contrast, maroon sebagai aksen intensitas rendah.
- **Hindari:** glassmorphism di semua kartu, gradasi mencolok, fake depth, coffee beans mengambang di semua halaman, ukuran H1 yang mengorbankan keterbacaan, animation-on-every-scroll, produk 3D dengan label yang keliru.
- **Tidak meniru satu website secara literal:** referensi Amble/Lightpod/Ocha dipakai sebagai inspirasi tata letak, bukan untuk mengambil aset atau komponen berlisensi.

## 3. Design tokens
### 3.1 AS-IS brand anchors (jangan dibuang tanpa approval)
| Semantik | Nilai AS-IS |
|---|---|
| brand/navy | \`#465C70\` |
| brand/charcoal | \`#2C3136\` |
| brand/teal | \`#8FB9BC\` |
| brand/mist | \`#CFE8EA\` |
| brand/maroon | \`#A52136\` |
| brand/background | \`#F8FAFC\` |

### 3.2 TARGET palette — proposal, belum diterapkan
| Token target | Hex | Peran |
|---|---|---|
| \`canvas\` | \`#F7F4EE\` | Dasar hangat, bukan putih-kaku |
| \`surface\` | \`#FFFEFB\` | Panel/kartu, konten dan form |
| \`surface-muted\` | \`#EBE6DD\` | Section transisi dan tags netral |
| \`ink\` | \`#282B2B\` | Copy utama dan section gelap |
| \`ink-muted\` | \`#626460\` | Body pendukung dan metadata |
| \`brand-primary\` | \`#465C70\` | CTA/links; pertahankan navy brand |
| \`brand-soft\` | \`#DCE7E8\` | Accent ringan, blockquote dan selection |
| \`accent-roast\` | \`#A52136\` | Aksen terbatas: labels/status editorial |
| \`border\` | \`#D8D5CE\` | Stroke dan divider |
| \`focus\` | \`#285D8F\` | Focus ring berkontras (validasi di konteks final) |
| \`success\` | \`#17624B\` | Status sukses, diuji kontras |
| \`danger\` | \`#A52136\` | Destruktif/validasi, bukan dekorasi berlebihan |

**Kebijakan:** token semantik menggantikan hex acak secara bertahap. Jangan menyamakan \`accent-roast\` dengan error hanya karena merah serupa; gunakan konteks semantics. Uji WCAG contrast setelah implementasi. Token target tidak boleh mengganti warna resmi brand tanpa persetujuan.

### 3.3 Typography
- **Fase awal yang minim risiko:** terus gunakan **Raleway** untuk display/headlines; **Montserrat** untuk body; **JetBrains Mono** (fallback) untuk metadata, angka, gramasi dan timer. Jangan menambah font web baru tanpa anggaran performa dan approval.
- Rekomendasi display scale desktop: 64–88 px (hero saja), H1 dalam 40–64 px, H2 32–48 px, H3 24–32 px, body 16–18 px, supportive 14–16 px, label minimal 12–14 px pada konteks sesuai. Gunakan \`clamp()\`, line-height ketat di headline dan long-form body 1.5–1.7.
- Hindari huruf kapital seluruhnya untuk paragraf; heading sengaja ringkas, lebar baris 12–18ch untuk hero, body 55–75ch.
- Angka harga dan takaran pakai tabular figures; format dengan helper \`formatRupiah()\`, bukan string hardcoded.

### 3.4 Grid & spacing
- Content max width 1280px; editorial full-bleed/hero tertentu boleh sampai viewport, tetapi teks tetap di safe container.
- Mobile gutter 16–20px, tablet 24–32px, desktop 40–48px; padding section 64–112px berdasarkan density.
- Gunakan 12-col desktop, 6–8-col tablet, 4-col mobile; layout konten dibangun dari 8pt spacing rhythm dengan pengecualian optik.
- Radius: image 0–12px sesuai konteks, cards 12–16px, controls 8–12px; jangan semua elemen dibuat rounded-pill.
- Shadows seminimal mungkin, utamakan border halus dan elevation hanya untuk dialog/nav sticky.

## 4. Global layout & navigation
### App shell
- Navbar konsisten di seluruh route; transparan di hero dark/photo hanya bila teks/kontrol tetap terbaca. Di scroll berubah menjadi surface yang solid untuk keterbacaan.
- Desktop: brand di kiri, 5 navigasi primer jelas, utility Search/Cart/Account; jangan terlalu banyak nested megamenu. Mobile: menu drawer yang terstruktur, akses cart dan Virtual Barista tidak menghalangi aksi.
- Footer: story pendek, navigation grouped, contact, policy, social dengan link yang valid. Hindari newsletter form jika service belum ada.
- Komponen: \`SiteHeader\`, \`MobileNav\`, \`SiteFooter\`, \`Breadcrumb\`, \`PageHero\`, \`SectionHeading\`, \`ActionLink\`, \`EmptyState\`, \`ErrorState\`, \`Skeleton\`, \`Toast\`, \`Modal\`, \`FormField\`, \`StatusPill\`; refactor reuse secara bertahap, bukan rewrite total bersamaan.

### CTA hierarchy
- **Primary:** satu tindakan dominan per area (mis. Jelajahi Katalog, Tambah ke Keranjang, Lanjut Pembayaran).
- **Secondary:** tindakan edukatif atau detail (Pelajari origin, Konsultasi, Panduan seduh).
- **Tertiary:** text-link bertanda hover/focus tanpa mengandalkan ikon satu-satunya.
- Disabled bukan satu-satunya feedback; jelas alasan tidak bisa lanjut (stok, metode bayar belum siap, input kosong).

## 5. Template & sitewide page blueprint
| Template | Halaman | Layout TARGET | CTA utama |
|---|---|---|---|
| Editorial landing | Home | Immersive photo hero + single headline; curated product rail; roastery story; sensory/learn; partnerships + café moment; final CTA | Jelajahi Katalog |
| Narrative | About, Roasters/Background | Hero photo/text split → chapters with authentic images, timeline, values, Slowbar imagery | Kenali Roastery / Lihat Katalog |
| Discovery | Catalogue | Minimal intro + clear category tabs + product grid/filter controls; product cards tactile with readable prices | Lihat Produk |
| Commerce PDP | Catalogue/[slug] | Image gallery left / sticky purchase panel right; tasting notes & origins, variant, grind, stock, shipping guidance | Tambahkan ke Keranjang |
| Product utility | Cart/Checkout/Track | Calm low-decoration forms, clear progress/status, trust text, summary sticky where safe | Lanjutkan / Konfirmasi |
| B2B landing | Partnerships | Segment cards, wholesale service narrative, process, FAQ, inquiry | Mulai Konsultasi |
| Guided workspace | Consultations | Compact editorial intro + persistent step navigation; Racikan → Estimasi HPP → Konsultasi; clear validation | Lanjutkan / Kirim Brief |
| Learning landing | Coffee Lab | Intro + 3 feature paths: Brewing, BYOB, Experiments; visual education cards | Mulai Eksperimen |
| Utility workspace | Brewing Guidance | Split parameter panel and recipe/timer, mobile sequential; no decorative blockers | Mulai Seduh |
| Blend discovery | Coffee Lab BYOB | Clear bean selection, ratio adjustment, sensory feedback, non-commercial context | Coba Racikan |
| Events | Coffee Experiments / Events | Story/event hero + searchable listing, event detail and registration states | Lihat Event |
| Account/admin | Account/Auth/Admin | Dense, readable, structured forms & tables; shared typography/colors, limited motion | Task-dependent |

### Photo guidelines
- Gunakan foto riil 52 Coffee lebih dahulu: kemasan terverifikasi, roaster, latte/slowbar, V60, tekstur beans, aktivitas cupping.
- Prioritaskan kualitas crop dan warna konsisten: daylight netral-hangat, natural material, realistis; hindari re-touch yang mengubah warna kemasan.
- Foto produk: background konsisten, label asli terbaca. Hanya pengganti placeholder dengan approval brand.
- Mobile cropping diatur khusus. Jangan mendaur ulang foto stok yang tidak merepresentasikan brand.

## 6. Components & states — implementation contract
| Komponen | Perilaku wajib |
|---|---|
| Product card | Real image / alt, name, origin, tasting notes ringkas, valid price/availability, click to PDP, safe quick add |
| Product selectors | Pilihan varian/grind, harga aktual, sold-out disabled, cart payload identik dengan kontrak Zustand |
| Search/filter | Query/deep links tetap, empty state membantu, keyboard operation |
| Chat | Response source/fallback tidak disamarkan, product action validation, loading/retry, responsive safe area |
| Inputs | Label selalu terlihat, help/error terkait \`aria-describedby\`, validasi saat tepat, tidak hapus input pengguna |
| Dialog/drawer | Focus trap, restore focus, Escape dismiss, scroll lock hanya jika diperlukan |
| Event card | Waktu, lokasi, status, detail; tidak menjanjikan slot tanpa availability yang terverifikasi |
| Admin status | Warna + label teks, tindakan konfirmasi, akses role tetap |
| Checkout | Summary pesanan, harga server, status metode pembayaran, upload proof = awaiting verification |
| Timer | Angka mudah dibaca, control sentuh besar, paused/resume/reset state yang jelas |

Design semua komponen dalam states default, hover, focus-visible, active/selected, loading, disabled, empty, error, success, mobile, reduced-motion. Jangan membiarkan state bergantung hanya pada warna.

## 7. Motion, WebGL & 3D
- **Motion strategy:** product photography dan informasi menjadi hero. Gunakan entrance halus 180–450ms, hover kecil 120–240ms, bukan parallax yang menghalangi membaca.
- **3D elective, bukan keharusan:** home atau consultations hero boleh memakai coffee bag/beans three-dimensional jika berlisensi dan proporsi/label benar. Hindari memakai satu dekorasi 3D di setiap halaman.
- Prioritaskan progressive enhancement: render image statis dahulu; baru lazy-load WebGL pada desktop/pointer baik dan pengguna tidak meminta reduced motion. Support fallback pada load failure, WebGL context loss, offline/slow connection.
- Jangan merekonstruksi kemasan brand dengan label palsu. Jika model GLB/HDR/texture belum tersedia, gunakan 2D autentik dan tetapkan status desain 3D sebagai aspirational.
- Tidak ada pointer capture yang menghalangi klik CTA; jangan membebani mobile dengan scene yang tidak perlu.
- Hero fallback harus menempati layout yang sama untuk mencegah CLS.

## 8. UX writing
- Bahasa Indonesia utama, ringkas, percaya diri, tidak hiperbolik.
- Pilihan istilah: \`Catalogue\`, \`Coffee Lab\`, \`Partnerships\` dapat tetap label navigasi, tetapi instruksi transaksi harus jelas dalam Bahasa Indonesia.
- Copy menekankan origin, roasting, profil rasa, pilihan varian dan pengalaman, bukan klaim teknis yang tidak diverifikasi.
- Status order: \`Menunggu verifikasi pembayaran\` setelah bukti masuk; jangan ubah menjadi \`Pembayaran berhasil\` sebelum disetujui.

## 9. Accessibility
- Minimum 44×44px untuk target sentuh penting; pertahankan akses keyboard pada navbar, carousel, product selector, forms dan dialog.
- Kontras teks minimal WCAG AA, 4.5:1 body dan 3:1 large text; label di atas gambar harus memiliki overlay yang teruji.
- Heading semantik, form labels, skip link, alt yang menjelaskan fungsi, icon-only accessible names, error summary, focus visible.
- Respect \`prefers-reduced-motion\`, browser zoom 200%, landscape mobile, loading skeleton, no horizontal scroll.

## 10. Performance & verification
1. Sebelum implementasi, snapshot semua template pada 390/768/1440px dengan konten/state representatif; audit Core Web Vitals dan ukuran bundle.
2. Perkenalkan tokens sebagai CSS custom properties / Tailwind config; tidak mengganti semua hex sekaligus. Buat shared primitives lalu migrasikan template satu per satu.
3. Gunakan \`next/image\`, dimensi/aspect ratio stabil, responsive \`sizes\`, prioritas hanya pada LCP hero, defer image di bawah fold.
4. Dynamic import dan fallback untuk 3D/chat berat; jangan memuat scene 3D sebelum diperlukan.
5. Gate: typecheck, lint, build, regression tests, visual diffs, keyboard/screen-reader smoke, warna/kontras, 320/390/768/1440/1920px.
6. Acceptance metric: CWV target p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; **target, bukan hasil audit**.

## 11. Workflow dan governance
- **Tahap A:** moodboard + dua arah visual/hero berdasarkan foto asli → pilihan brand owner.
- **Tahap B:** token semantic, component inventory, visual regression baseline dan template Home/Catalogue/PDP sebagai pilot.
- **Tahap C:** extension ke About, Partnerships, Coffee Lab, Events.
- **Tahap D:** checkout, account, admin (terpisah: security and state gates).
- **Tahap E:** browser QA, mobile/accessibility/perf, SEO, preview approval, controlled release.

### Change control
- Desain final baru diimplementasi setelah screenshot/mockup disetujui; catat perubahan token, komponen, routes dan semua tradeoff.
- Tidak membuat harga/produk baru; jangan menyalin business logic; semua modifikasi flow perlu mempertahankan PRD.
- Update \`README.md\` dan \`AGENTS.md\` setelah desain disetujui agar tidak ada dua set aturan aktif. \`CODEX.md\` boleh merujuk kedua dokumen.
- Implementasi dilakukan di branch terpisah, PR review; **jangan merge/deploy main tanpa arahan eksplisit**.

## 12. Existing design references (historis, bukan semua final)
- \`design/consultations-guided-workspace.figcraft\`
- \`design/guided-complete/52-coffee-guided-final.figcraft\`
- \`design/guided-complete/REVIEW.md\`
- \`design/guided-complete/3D-HEADER-PLAN.md\`
- \`design/brewing-guidance-v2-desktop.png\`
- \`design/brewing-guidance-v2-mobile.png\`
- \`references/homepage-current.png\`

## 13. Approval checklist
- [ ] Brand owner menyetujui art direction, palet dan tipografi target.
- [ ] Produk, konten, aset/foto, dan UI untuk 390/768/1440px disetujui.
- [ ] Kontrak checkout, katalog, Virtual Barista, event, admin dikonfirmasi oleh pemilik domain.
- [ ] 3D approved atau tetap static fallback.
- [ ] Pilot Home/Catalogue/PDP dan parameter QA sudah lulus sebelum rollout sitewide.

**Status:** Usulan design system yang siap ditinjau; belum kode yang diubah dan belum desain visual final.
