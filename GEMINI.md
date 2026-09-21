# Panduan Gemini dan Google Antigravity — 52 Coffee & Roastery

Baca [AGENTS.md](./AGENTS.md) sebagai panduan utama. Periksa kode saat ini sebelum memakai asumsi dari percakapan atau dokumen lama.

## Alur kerja

- Mulai dengan `git status`, file terkait, tipe, komponen bersama, dan konfigurasi yang benar-benar dipakai. Pertahankan perubahan lokal pengguna.
- Untuk UI, ikuti token dan tipografi di `apps/web/tailwind.config.ts` serta `apps/web/app/globals.css`. Gunakan komponen bersama bila cocok, lalu periksa hasil di mobile dan desktop bila browser tersedia.
- Untuk katalog dan cart, ikuti `apps/web/lib/data.ts` dan `apps/web/lib/store/useCartStore.ts`. Jangan menyalin harga ke instruksi atau mengganti perilaku commerce tanpa diminta.
- Untuk AI, bedakan route Next.js `/api/chat`, backend FastAPI, knowledge base, retrieval, generation Gemini, dan fallback lokal. File konfigurasi guardrail tidak membuktikan NeMo aktif; periksa dependency dan pemanggilan nyata.
- Jangan mengklaim checkout, pembayaran, atau pelacakan nyata untuk alur yang masih simulasi.

## Verifikasi

Setelah perubahan frontend, jalankan `npm run typecheck --prefix apps/web`. Jalankan lint, build, dan pemeriksaan tampilan sesuai cakupan perubahan, lalu laporkan hasil yang benar-benar diperoleh.
