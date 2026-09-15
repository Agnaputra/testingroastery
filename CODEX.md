# 52 Coffee & Roastery — Codex / Cursor Agent Guidelines

Panduan ini khusus ditujukan untuk **OpenAI Codex**, **Cursor AI**, dan **GitHub Copilot**.

---

## 1. Lingkup & Konfigurasi Workspace

- Monorepo root berada di `/testingroastery/`.
- Kode frontend Next.js berada di `./apps/web/`.
- Path aliases diatur pada `apps/web/tsconfig.json`:
  ```json
  "paths": {
    "@/*": ["./*"]
  }
  ```
  *Catatan*: Di dalam file `apps/web/`, `@/components/...` atau relative path `../../components/...` dapat digunakan secara konsisten sesuai pola file sekitar.

---

## 2. Standar Penulisan Komponen & TypeScript

1. **Strict Typing**:
   - Dilarang keras menggunakan `any` tanpa alasan mutlak. Gunakan tipe dari [`apps/web/lib/data.ts`](file:///c:/laragon/www/testingroastery/apps/web/lib/data.ts) (`CoffeeProduct`, `ProductVariant`, `GrindOption`, dll.).
   - Definisikan interface props secara eksplisit untuk setiap komponen React.
2. **Modular Architecture**:
   - Pisahkan logika interaktif yang rumit ke dalam komponen mandiri di `apps/web/components/`.
   - Hindari komponen monolitik yang lebih dari 500 baris kode jika dapat dipecah menjadi sub-komponen teruji.
3. **Cart Store Access**:
   - Selalu impor cart store dari `@/lib/store/useCartStore` atau `../lib/store/useCartStore`.
   - Gunakan metode `addItem({ ... })` dengan parameter lengkap (`productId`, `name`, `slug`, `imageUrl`, `weightGrams`, `weightLabel`, `grind`, `grindLabel`, `unitPrice`, `quantity`).

---

## 3. Aturan Edit Kode (Codex / Cursor / Copilot)

- **Preserve Comments & Docstrings**: Pertahankan semua dokumentasi yang ada di dalam file.
- **Single-Purpose Edits**: Saat mengedit komponen UI, jangan mengganti struktur layout global secara tak terduga.
- **Verification Command**:
  Sebelum menandai pekerjaan selesai, jalankan:
  ```bash
  npm run typecheck --prefix apps/web
  ```

