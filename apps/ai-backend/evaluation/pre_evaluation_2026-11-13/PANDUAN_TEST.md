# Menjalankan ulang pengujian internal

Semua perintah di bawah dijalankan dari PowerShell pada root repository:

```powershell
cd C:\laragon\www\testingroastery
```

## Database pengujian

Environment pada workspace ini sudah disiapkan:

- Container `52coffee-preeval-20261113`, PostgreSQL/pgvector.
- Binding hanya `127.0.0.1:55434`, database `testingroastery`.
- 26 record KB publik beserta embedding dan 126 SKU checkout publik.
- Stok dan seluruh akun/order yang dibuat tes bersifat sintetis.
- Tidak ada akun, pesanan, bukti pembayaran, atau kredensial production yang disalin.
- Koneksi disimpan di `.private/pre-evaluation.env`, bukan di Git atau environment production.

Periksa container:

```powershell
docker ps --filter name=52coffee-preeval-20261113
```

Jika container yang sama sedang berhenti:

```powershell
docker start 52coffee-preeval-20261113
```

Runner memeriksa hostname, port, nama DB, label tujuan container, dan binding
loopback sebelum mengimpor aplikasi. Jika tidak sesuai, runner berhenti.
Jangan mengganti URL dengan database cloud atau port database lokal yang lama.
Jika private config/container hilang pada komputer lain, siapkan DB sintetis baru;
perintah ini tidak otomatis menyentuh atau memigrasikan database lain.

## 1. Regression test dan frontend checks

```powershell
npm run test:pre-evaluation
```

Menjalankan backend regression terpilih, frontend Virtual Barista tests,
TypeScript dan lint. Model/email menggunakan mock atau placeholder; jaringan
eksternal diblokir. Akses database regression dibuat read-only.

`npm test` yang lama tetap hanya menjalankan test frontend Virtual Barista.

## 2. Checkout, bukti pembayaran, dan admin melalui API

```powershell
apps/ai-backend/.venv/Scripts/python.exe -B apps/ai-backend/scripts/run_pre_evaluation.py --suite commerce
```

Suite ini membuat akun/order/bukti sintetis, menguji status dan kepemilikan,
total server-side, idempotency, stok, expiry, approval/rejection, serta autentikasi.
Email dan Google provider dimock; tidak ada email pelanggan atau WhatsApp terkirim.
Cleanup menghapus fixture yang dibuat tes pada database khusus tersebut.
Ini bukti integration API, bukan bukti klik browser atau dana diterima.

Jangan jalankan bersamaan dengan suite lain: fixture commerce mengubah stok
dan data sintetis selama tes.

## 3. Smoke Virtual Barista dengan model nyata

```powershell
apps/ai-backend/.venv/Scripts/python.exe -B apps/ai-backend/scripts/run_pre_evaluation.py --suite smoke
```

Menggunakan OpenAI/NeMo lokal serta DB test read-only; memakai endpoint FastAPI
melalui ASGITransport tanpa startup DDL. Termasuk budget, follow-up, comparison
tanpa data dan comparison dua produk yang tersedia, brewing, action cart, injection,
dan off-topic. Memiliki assertion kontrak/harga, bukan hanya HTTP 200.

BT03 Prau–Gayo tetap dicatat: karena Gayo belum ada di KB, perilaku aman yang
diperiksa adalah abstention/klarifikasi. Comparison penuh memakai pasangan
Prau–Buntu Lenta sebagai **kasus tambahan**, bukan pengganti tersembunyi kasus gagal.

Action cart diuji sebagai JSON usulan; suite tidak menjalankan browser/cart badge.
API calls pada suite ini memakai kuota dan biaya provider.

## 4. Guardrails dengan NeMo nyata

```powershell
apps/ai-backend/.venv/Scripts/python.exe -B apps/ai-backend/scripts/run_pre_evaluation.py --suite guardrails
```

Sepuluh kasus internal: enam yang diharapkan ditolak dan empat yang diharapkan
diterima. Laporan membedakan `blocked_*_policy`, `blocked_*_nemo`, `passed_nemo`,
dan degraded. Jangan menyebut seluruh penolakan sebagai hasil NeMo.
Label ini adalah rubrik pilot peneliti, belum instrumen keamanan final yang disahkan.

## 5. Pilot RAGAS

```powershell
apps/ai-backend/.venv/Scripts/python.exe -B apps/ai-backend/scripts/run_pre_evaluation.py --suite ragas
```

Menggunakan Python terpisah di `apps/ai-backend/evaluation/.venv`, RAGAS 0.4.3
dan OpenAI SDK evaluasi 2.54.0. Environment backend tidak diganti.
Snapshot paket aktual ada di `follow_up/evaluation-environment.txt`.

Runner masih memakai **empat fixture smoke**, bukan 40 pertanyaan penelitian final.
Context diambil dari request generation yang sama melalui trace. Semua kasus,
termasuk excluded atau score error/null, harus dilaporkan. Jangan mengulang run
hanya untuk memilih skor tertinggi. API evaluator dan embeddings memakai kuota/biaya.
Jangan menjalankan batch final 40 sebelum reference disahkan dan protokol disetujui.

## Membaca hasil

Setiap invocation membuat folder baru:

```text
apps/ai-backend/evaluation/results/internal-<suite>-<timestamp>/
```

- `summary.json`: status dan ruang lingkup hasil.
- `tests.txt`: nama dan hasil backend/integration test, jika relevan.
- `web-checks.txt`: output frontend test/typecheck/lint.
- `api-smoke.json`: pertanyaan/respons dan assertion smoke, jika relevan.
- RAGAS: tambahan `evaluation/results/ragas-<timestamp>.json` dan
  `evaluation/results/evaluation-traces.jsonl`.

Exit code nonzero berarti gagal atau error; tetap simpan artefaknya. `PASS` hanya
berlaku untuk scope suite. HTTP 200, unit test PASS, atau API action benar tidak
berarti UI sudah lulus. Data pengguna nyata tidak digunakan dalam fixture.

## Yang membutuhkan manusia/browser

- BT06/BT09: cart badge, varian, subtotal, dan perilaku browser.
- BT10–BT12: integration API tersedia, tetapi perjalanan UI tetap perlu diperiksa
  terhadap backend/database sintetis ini, bukan production.
- Validasi reference dan fakta oleh peneliti/owner; jangan mengisi signoff otomatis.
- Studi pengguna dengan consent, task timing, dan jawaban peserta nyata.
- Persetujuan metode dan instrumen oleh Pak Imam sebelum final.

Hasil terkini dibaca bersama `HASIL_LANJUTAN.md`; laporan audit awal dipertahankan
sebagai baseline sebelum perbaikan.
