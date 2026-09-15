# 52 Coffee & Roastery — AI Agent Instructions & Guidelines

Selamat datang di monorepo **52 Coffee & Roastery**. Dokumen ini adalah panduan standar (*source of truth*) untuk semua AI Agent (Gemini, Codex, Claude, Cursor, Copilot, dll.) yang bekerja di repositori ini.

---

## 1. Ikhtisar Proyek & Arsitektur

Monorepo ini terdiri dari dua aplikasi utama:

```
testingroastery/
├── apps/
│   ├── web/                     # Frontend: Next.js 14 (App Router) + TypeScript + Tailwind
│   └── ai-backend/              # Backend AI: FastAPI + PostgreSQL (pgvector) + Gemini + NeMo
├── package.json                 # Monorepo root scripts
├── AGENTS.md                    # Panduan universal agent (dokumen ini)
├── GEMINI.md                    # Panduan khusus Gemini / Google Antigravity
├── CODEX.md                     # Panduan khusus OpenAI Codex / Cursor
└── CLAUDE.md                    # Panduan khusus Anthropic Claude Code
```

### Perintah Utama (Root)
- Menjalankan Frontend Web: `npm run dev` (atau `npm run dev --prefix apps/web`)
- Build Frontend Web: `npm run build` (atau `npm run build --prefix apps/web`)
- Typecheck Frontend: `npm run typecheck --prefix apps/web`
- Menjalankan AI Backend: `npm run ai:start` (atau `cd apps/ai-backend && uvicorn app.main:app --reload --port 8000`)

---

## 2. Frontend Web (`apps/web`)

### Tech Stack
- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand (dengan persist middleware untuk cart) di [`apps/web/lib/store/useCartStore.ts`](file:///c:/laragon/www/testingroastery/apps/web/lib/store/useCartStore.ts)
- **Animation**: Framer Motion
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Icons**: `lucide-react`

### Design System & Identitas Visual
Proyek ini mengusung estetika *Minimalist Editorial Specialty Roastery* dengan identitas warna resmi 52 Coffee:

#### Token Warna (`tailwind.config.ts` & `globals.css`)
- **Primary / Brand Navy**: `#465C70` (`brand-navy` / `primary`) — Deep Steel Blue
- **Charcoal**: `#2C3136` (`brand-charcoal` / `brand-navy-dark`) — Teks heading gelap & kontainer
- **Soft Teal**: `#8FB9BC` (`brand-teal`) — Aksen sekunder segar
- **Light Mist**: `#CFE8EA` (`brand-mist` / `brand-teal-light`) — Soft background & border aksen
- **Crimson Roast**: `#A52136` (`brand-maroon` / `roastery-caramel`) — Aksen tombol aksi, highlight promo, badge
- **Dark Crimson**: `#5D1823` (`brand-maroon-dark`)
- **Surface Parchment**: `#F8FAFC` (`surface` / `surface-bright`)
- **Card Background**: `#FFFFFF` (`surface-white`)
- **Subtle Border**: `#DCE6EB` (`border-subtle`)

#### Tipografi
- **Headings & Display**: `Raleway` (`font-headline`, `font-editorial`, `font-serif`)
- **Body & UI**: `Montserrat`, fallback `Plus Jakarta Sans` (`font-sans`)
- **Metrics, Gramatur & Harga**: `JetBrains Mono`, `Cascadia Code` (`font-mono`, `font-mono-numeric`)

---

## 3. Data Produk & Domain Kopi (`apps/web/lib/data.ts`)

Seluruh data produk tersimpan di [`apps/web/lib/data.ts`](file:///c:/laragon/www/testingroastery/apps/web/lib/data.ts).
Struktur data mencakup:
- **Kategori**: `filter`, `espresso`, `reserve`
- **Series Terkurasi**: `Ijen Series`, `Java Exotic`, `Argopuro Walida`, `Grand Reserve`, `Enrekang Series`, `Sunda Series`, `Arjuna Series`, `Dewata Series`, `Aceh Series`, `Robusta Espresso`, `Arabica Espresso`.
- **Mode Penyajian**:
  - `beans`: Biji kopi kemasan (varian gramasi: 16g, 50g, 100g, 200g, 500g, 1kg).
  - `slowbar`: Minuman seduh manual per cangkir (menggunakan `cupPrice` dan `slowbarAlias`).
- **Gilingan (Grind Options)**: `whole` (Biji utuh), `coarse`, `medium`, `fine`.

---

## 4. Aturan Penting untuk Semua Agent (Do's & Don'ts)

### ✅ WAJIB DILAKUKAN (Do's):
1. **Preserve Working Features**: Jangan pernah merusak atau menghapus fitur yang sudah berfungsi (keranjang belanja Zustand, quick view modal, Virtual Barista chatbot, routing slug detail produk).
2. **Design Integrity**: Ikuti standar visual editorial mewah (whitespaces yang proporsional, tipografi berhierarki, contrast rasio minimal 4.5:1 untuk teks utama).
3. **Accessibility (a11y)**: Pastikan setiap tombol dan interaktif elemen memiliki label terjangkau (`aria-label`, visible focus rings, touch target minimal 44x44px di mobile).
4. **Validasi**: Selalu jalankan `npm run typecheck` dan verifikasi bahwa tidak ada kesalahan sintaksis atau tipe sebelum menyelesaikan tugas.

### ❌ DILARANG (Don'ts):
1. **Jangan menggunakan styling generik/slop**: Hindari gradasi neon menyilaukan, emoji sebagai pengganti ikon profesional, atau card template generik e-commerce marketplace murah.
2. **Jangan ubah konfigurasi backend/database tanpa alasan eksplisit**: Modifikasi pada `ai-backend` hanya dilakukan jika tugas secara khusus berkaitan dengan endpoint atau model RAG.
3. **Jangan hardcode harga atau token**: Selalu gunakan fungsi `formatRupiah()` dari `lib/data.ts` untuk harga.

