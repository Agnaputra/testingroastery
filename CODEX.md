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

## Stack dan layanan yang dipakai

- Monorepo: `apps/web` memakai Next.js 14 App Router, React, TypeScript strict, Tailwind CSS, Zustand, dan Framer Motion; `apps/ai-backend` memakai FastAPI, Pydantic, SQLAlchemy/psycopg2, PostgreSQL, dan pgvector. Periksa implementasi aktual sebelum menyatakan suatu integrasi AI atau guardrail aktif.
- Virtual Barista memakai OpenAI dari backend; retrieval pgvector memiliki fallback in-memory. Katalog website dan knowledge base AI punya sumber serta jalur pembaruan berbeda.
- Login customer mendukung email/password dan Google OAuth. Portal `/admin` memakai alur Google tersendiri dengan cookie admin terpisah; backend memeriksa role `admin`. `ADMIN_API_KEY` tetap dipakai untuk proxy API admin, bukan sebagai login pengguna.
- Checkout memakai pesanan database dengan QRIS statis atau transfer BCA manual sesuai mode lingkungan. Konfirmasi pembayaran dan status pengiriman dilakukan admin; jangan menganggap klik atau unggah bukti sebagai dana diterima.
- Hosting yang teramati: frontend dan backend Preview berjalan sebagai project Vercel terpisah. Database cloud memakai Neon; PostgreSQL lokal memakai database `testingroastery`. Jangan menganggap Railway aktif hanya karena pernah dibahas: verifikasi deployment yang sedang dipakai sebelum mengubahnya.

## Lingkungan dan batas data

- Lokal: `npm run dev` untuk web di `127.0.0.1:3031`, `npm run ai:start` untuk FastAPI di `127.0.0.1:8013`; web mengakses backend melalui `AI_BACKEND_URL`. Jalankan PostgreSQL lokal sebelum fitur database. Next.js memakai `.next-dev` untuk dev dan `.next` untuk build agar cache tidak bertabrakan.
- Preview branch `feature/customer-commerce-manual-payments` harus memakai branch Neon Preview yang terisolasi. Branch yang pernah disiapkan adalah `preview/customer-commerce-manual-payments` (`br-icy-meadow-b3bj54j6`), tetapi **nilai efektif `DATABASE_URL` deployment backend belum terverifikasi**. Jangan menulis seed, mengaktifkan checkout, atau melakukan migration sebelum target koneksi dibuktikan.
- Audit terakhir menemukan backend Preview berkonfigurasi `ENVIRONMENT=production` dan `CUSTOMER_COMMERCE_MODE=operational`; frontend Preview menampilkan mode testing. Guard checkout backend saat ini hanya menerima test mode pada PostgreSQL localhost. Perbaiki ketidakcocokan ini dengan pembatasan Preview yang eksplisit dan tes sebelum transaksi uji.
- URL callback Google harus cocok persis dengan hostname frontend yang diuji serta konfigurasi Google OAuth dan backend. Alias branch dan URL deployment unik tidak otomatis saling menggantikan.
- `main` adalah jalur production. Jangan merge, push ke `main`, mengubah environment production, menyalin data pelanggan/order atau kredensial pembayaran, maupun menjalankan migration production tanpa instruksi pengguna. Secret disimpan di environment lokal/dashboard; jangan dicetak atau di-commit.

## Penyelesaian

Jaga edit tetap terarah dan kode tetap mudah dipelihara. Untuk perubahan frontend, jalankan `npm run typecheck --prefix apps/web`; tambahkan lint, build, dan pemeriksaan browser sesuai risikonya. Ringkas penyebab, perubahan, hasil verifikasi, dan keterbatasan yang masih ada.
