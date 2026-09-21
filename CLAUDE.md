# Panduan Claude Code — 52 Coffee & Roastery

Baca [AGENTS.md](./AGENTS.md) sebagai panduan utama. Instruksi di sini hanya menambah alur kerja Claude Code.

## Sebelum mengedit

- Periksa `git status`, file yang berkaitan, serta komponen dan token yang sudah ada. Pertahankan perubahan lokal pengguna.
- Untuk UI, gunakan skill di `.agents/skills/` bila cocok dengan tugas, misalnya `frontend-design`, `anti-ui-slop`, atau `ui-ux-pro-max`. Baca `SKILL.md` skill yang digunakan; jangan menganggap setiap skill perlu dijalankan untuk setiap perubahan kecil.
- Periksa status implementasi langsung di kode sebelum menyebut fitur pembayaran, pelacakan, RAG, atau NeMo aktif.

## Pemeriksaan UI

- Tinjau halaman yang diubah pada lebar mobile (sekitar 360px), tablet (768px), dan desktop (1280px atau lebih) bila browser tersedia. Pastikan tidak ada overflow horizontal.
- Kontrol ikon perlu accessible name pada tombol atau tautannya; ikon dekoratif gunakan `aria-hidden`. Jaga fokus keyboard, target sentuh, dan `prefers-reduced-motion`.
- Pastikan kontras teks normal minimal 4.5:1 dan teks besar minimal 3:1. Ikuti tipografi dan token di `tailwind.config.ts` serta `globals.css`.
- Jaga hero dan navbar menyatu tanpa pita latar kosong di atas halaman. Jangan menutup judul atau kontrol dengan navbar tetap.

## Verifikasi

Jalankan `npm run typecheck --prefix apps/web` setelah perubahan frontend. Gunakan `npm run lint --prefix apps/web` dan `npm run build --prefix apps/web` bila cakupan perubahan memerlukannya. Laporkan apa yang benar-benar diuji dan keterbatasan pemeriksaan visual.
