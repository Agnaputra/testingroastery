# 52 Coffee & Roastery — Panduan Agent

Dokumen ini adalah panduan utama untuk agent yang bekerja di monorepo 52 Coffee & Roastery. Baca kode dan perubahan lokal sebelum mengedit. Instruksi khusus alat ada di [CODEX.md](./CODEX.md), [CLAUDE.md](./CLAUDE.md), dan [GEMINI.md](./GEMINI.md).

## Arsitektur dan perintah

- `apps/web`: Next.js 14 App Router, React, TypeScript strict, Tailwind CSS, Zustand, Framer Motion, Three.js, dan `lucide-react`.
- `apps/ai-backend`: FastAPI, Gemini, PostgreSQL/pgvector, dan konfigurasi guardrail. Periksa implementasi sebelum menyebut NeMo Guardrails aktif: saat ini pemeriksaan input di `app/rag_service.py` menggunakan daftar frasa, sedangkan `nemoguardrails` belum ada di `requirements.txt`.
- Root: `npm run dev`, `npm run build`, dan `npm run ai:start`.
- Frontend: `npm run lint --prefix apps/web` dan `npm run typecheck --prefix apps/web`.

## Sumber data dan perilaku saat ini

- Katalog frontend, tipe `CoffeeProduct`/`ProductVariant`/`GrindOption`, varian, stok, dan harga produk ada di [apps/web/lib/data.ts](./apps/web/lib/data.ts). Jangan menyalin daftar harga ke panduan atau komponen baru. Gunakan `formatRupiah()` untuk menampilkan nominal.
- Backend AI memiliki knowledge base sendiri di `apps/ai-backend/app/rag_service.py`. Jangan menganggap datanya otomatis tersinkron dengan katalog frontend.
- Cart menggunakan Zustand persist di [apps/web/lib/store/useCartStore.ts](./apps/web/lib/store/useCartStore.ts). Ikuti tipe `CartItemInput` terkini saat memanggil `addItem()`; pertahankan alur cart, quick view, pencarian, detail produk, dan Virtual Barista.
- `/api/chat` mencoba Gemini, lalu FastAPI, lalu jawaban lokal. Jelaskan jalur yang benar saat mengubah atau menguji perilaku AI; jangan menyebut fallback lokal sebagai hasil RAG.
- Checkout, QRIS, dan status pesanan saat ini adalah simulasi. Jangan menampilkan klaim bahwa pembayaran, pesanan, atau pengiriman nyata telah diproses tanpa integrasi yang terverifikasi.

## Desain dan pengalaman pengguna

- Arah visual: minimalist editorial specialty roastery, dengan konten dan Bahasa Indonesia milik 52 Coffee. Pertahankan fitur commerce dan B2B saat mengubah tampilan.
- Token utama di `apps/web/tailwind.config.ts`: navy `#465C70`, charcoal `#2C3136`, teal `#8FB9BC`, mist `#CFE8EA`, crimson `#A52136`, dan border `#DCE6EB`. `surface` Tailwind adalah putih; `background`/`surface-bright` adalah `#F8FAFC`.
- Heading memakai Raleway; body memakai Montserrat dengan fallback Plus Jakarta Sans; angka memakai Cascadia Code dengan fallback JetBrains Mono. Periksa `apps/web/app/layout.tsx`, `globals.css`, dan konfigurasi Tailwind sebelum menambah gaya.
- Gunakan komponen bersama di `apps/web/components/ui/page-structure.tsx` dan primitive `apps/web/app/globals.css` bila sesuai. Adopsinya belum merata di semua halaman, jadi periksa halaman terkait sebelum memperluas pola.
- Navbar tetap terlihat saat scroll. Pada halaman dengan hero, hero dimulai di tepi atas di belakang navbar; jarak aman diberikan pada isi hero, bukan berupa pita kosong sebelum hero.
- Pastikan layout mobile, tablet, dan desktop rapi; interaksi punya accessible name, fokus terlihat, target sentuh nyaman, dan animasi menghormati `prefers-reduced-motion`.

## Cara bekerja

1. Periksa struktur, dependensi, komponen terkait, dan `git status` sebelum mengubah file. Jangan menimpa perubahan lokal yang belum dibuat olehmu.
2. Buat perubahan sekecil mungkin yang menyelesaikan masalah. Jangan menambah dependency tanpa alasan kuat atau menulis rahasia ke kode client.
3. Untuk backend, validasi input, tangani kegagalan, dan jaga batas autentikasi serta data. Ubah konfigurasi/database hanya jika tugas memang memerlukannya.
4. Untuk pekerjaan frontend, jalankan `npm run typecheck --prefix apps/web`; jalankan lint atau build sesuai dampak perubahan. Periksa tampilan dan interaksi di browser bila tersedia, lalu nyatakan batas verifikasi secara jujur.
