# 52 Coffee & Roastery — Claude Code Agent Guidelines

Panduan ini khusus ditujukan untuk **Anthropic Claude Code** CLI & Claude AI.

---

## 1. Integrasi Skills Lokal (`.agents/skills/`)

Repositori ini memiliki skill desain tingkat tinggi yang terpasang di `.agents/skills/`:
- **`anti-ui-slop`**: Mencegah keluaran antarmuka generik. Mengharuskan desain berbobot kuat, bebas dari template murahan, dan lolos finish gate.
- **`frontend-design`**: Panduan tipografi berkarakter, whitespace editorial, dan pengambilan keputusan visual yang terarah.
- **`ui-ux-pro-max`**: Standar audit interaksi, a11y, performa render, dan fluid responsiveness.

Gunakan standar skill tersebut setiap kali merancang, memodifikasi, atau mereview halaman web.

---

## 2. Finish Gate Kualitas UI

Sebelum menganggap pekerjaan UI selesai, Claude Code wajib memvalidasi kriteria finish gate:
1. **Responsive Checklist**:
   - Mobile: 360px – 480px (tidak ada horizontal scroll, touch target minimal 44px).
   - Tablet: 768px – 1024px (grid tertata rapi, layout seimbang).
   - Desktop: 1280px+ (spacious editorial spacing, kontras visual tajam).
2. **Accessibility (a11y)**:
   - Warna teks terhadap latar belakang wajib memenuhi rasio kontras WCAG AA (minimal 4.5:1).
   - Setiap ikon interaktif wajib memiliki `aria-label` atau tag `title`.
   - Menghormati preferensi pengguna untuk `prefers-reduced-motion`.
3. **Typography & Brand Alignment**:
   - Judul Display menggunakan `font-headline` (Raleway).
   - Body menggunakan `font-sans` (Montserrat / Plus Jakarta Sans).
   - Angka & metrik menggunakan `font-mono` (JetBrains Mono / Cascadia Code).

---

## 3. Perintah Kerja Cepat

- **Dev server**: `npm run dev`
- **Lint**: `npm run lint --prefix apps/web`
- **Typecheck**: `npm run typecheck --prefix apps/web`
- **Build**: `npm run build --prefix apps/web`

