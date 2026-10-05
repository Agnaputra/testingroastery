# Panduan Codex, Cursor, dan Copilot — 52 Coffee & Roastery

Baca [AGENTS.md](./AGENTS.md) sebagai panduan utama. Instruksi ini berlaku untuk pekerjaan di workspace monorepo.

## Sebelum mengubah kode

- Periksa `git status` dan diff lokal, lalu baca file, tipe, dan komponen yang berkaitan. Jangan menimpa perubahan pengguna.
- Frontend berada di `apps/web`; alias `@/*` mengarah ke root `apps/web` menurut `tsconfig.json`. Ikuti pola impor terdekat dalam file yang diedit.
- Gunakan `apps/web/components/ui/page-structure.tsx` dan primitive di `apps/web/app/globals.css` saat cocok; periksa adopsi aktual pada halaman terkait.

## TypeScript dan fitur commerce

- Pertahankan strict typing. Gunakan tipe dari `apps/web/lib/data.ts` dan tipe fitur setempat; hindari `any` baru tanpa alasan.
- Cart store ada di `@/lib/store/useCartStore`. `addItem()` menerima `CartItemInput = Omit<CartItem, 'id'>`; kontrak saat ini mencakup `productId`, `name`, `slug`, `imageUrl`, `weightGrams`, `weightLabel`, `grind`, `grindLabel`, `unitPrice`, `quantity`, `series`, dan `tastingNotes`. Periksa tipe sumber sebelum mengubah pemanggilan.
- Ambil harga produk dari data yang ada, dan format tampilan nominal dengan `formatRupiah()`. Pertahankan quick view, pencarian, detail produk, dan cart.
- Jangan menyatakan checkout atau pelacakan sebagai transaksi nyata. Jelaskan apakah respons Virtual Barista berasal dari OpenAI melalui FastAPI atau fallback lokal bila hal itu relevan.

## Penyelesaian

Jaga edit tetap terarah dan kode tetap mudah dipelihara. Untuk perubahan frontend, jalankan `npm run typecheck --prefix apps/web`; tambahkan lint, build, dan pemeriksaan browser sesuai risikonya. Ringkas penyebab, perubahan, hasil verifikasi, dan keterbatasan yang masih ada.
