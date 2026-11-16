# Finalisasi kompatibilitas backend

16 November 2026, main lokal, basis sebelum refactor backend: commit frontend `f6570305`. Refactor backend dikumpulkan menjadi satu commit lokal terpisah setelah pemeriksaan ini. Tidak ada push, merge atau deployment.

## Hasil

| Pemeriksaan | Status dan bukti |
|---|---|
| OpenAPI | PASS: JSON schema final sama persis sebagai object dengan snapshot sebelum refactor, 75 path, seluruh nama component dan `$ref` dipertahankan |
| Entry point | PASS: `uvicorn.importer.import_from_string` untuk `app.main:app` dan `index:app` mengembalikan instance FastAPI yang sama |
| ASGI smoke | PASS: `/` dan `/openapi.json` memakai ASGITransport, tanpa lifespan/startup dan dengan koneksi database diblokir |
| Test offline | PASS: seluruh 147 test sebelumnya + 2 test kompatibilitas OpenAPI + 3 test pembatasan target database = 152 test |
| Import dan syntax | PASS: 88 file Python diperiksa; seluruh suite final berhasil mengimpor modul baru. Tidak ada import literal ke modul lama pada source/caller yang diaudit |
| Data penelitian/SQL | PASS: 70 artifact non-Python yang dilacak Git pada evaluation/migrations tetap sama terhadap f6570305 (normalisasi CRLF/LF); schema.sql juga tidak berubah |
| Algoritma evaluasi | PASS: 14 file Python evaluation dibandingkan via AST; perubahan hanya import, referensi module, dan lokasi source pada trace.code_version |
| Dependencies | PASS lokal Windows/Python 3.12: 19 requirement langsung terpasang dan memenuhi constraint; closure 94 kombinasi package/extra tanpa requirement hilang atau konflik |
| Deployment config | PASS statis: Dockerfile, requirements, ignore files, index.py dan script startup root tidak berubah; Docker tetap menjalankan `uvicorn index:app --host 0.0.0.0 --port ${PORT:-8000}` dari /app |
| Tiga suite database | BLOCKED: belum ada database test terisolasi yang terverifikasi; hanya container proyek existing pgvector:pg16 pada port 5432 terlihat. Tidak ada koneksi ke database tersebut |
| Build/deployment Railway aktual | BELUM DIUJI: tidak melakukan Linux image build, install ulang dependency dari registry, akses environment Railway, deploy, atau health check live |

`pip check` tidak tersedia karena venv ini tidak memasang pip. Audit dependency memakai importlib.metadata dan packaging terhadap requirements serta dependency closure yang aktif pada platform lokal. Tidak ada package yang di-install/di-upgrade atau file dependency yang diubah. Resolusi fresh install di Linux tetap perlu diverifikasi dalam build terisolasi.

## OpenAPI

Empat nama yang sempat berubah:

| Nama internal hasil pemindahan | Nama publik baseline yang dipertahankan |
|---|---|
| app__api__routers__customer_auth__Credentials | app__customer_auth__Credentials |
| app__api__routers__customer_account__ProfileInput | app__customer_account__ProfileInput |
| app__api__routers__events__Credentials | app__events__Credentials |
| app__api__routers__events__ProfileInput | app__events__ProfileInput |

`app/core/openapi.py` membungkus generator OpenAPI bawaan FastAPI, mengganti key component dan `$ref` secara terarah, serta tetap memakai cache/invalidation generator bawaan. Tidak ada perubahan `__module__` class, model bisnis, endpoint, auth, request/response payload, atau service singleton. Snapshot final dibandingkan langsung dengan baseline tanpa normalisasi nama lagi.

## Keamanan test database

Overview, pool, dan events sekarang fail-closed melalui `tests/integration/database_target.py`: harus opt-in `BACKEND_DATABASE_IT=1`, environment test, host localhost/127.0.0.1, port 55433 dan database `coffee_backend_refactor_it`. Target penelitian `testingroastery`, port 5432, host remote, environment production, dan URL malformed ditolak oleh unit test. Host localhost saja tidak dianggap bukti isolasi.

Tidak membuat container/database baru, menerapkan migration, menyalin data, menjalankan seed, atau menjalankan ketiga suite tersebut dalam finalisasi ini. Pemeriksaan Docker hanya inventory nama/port/image, tanpa inspect environment/kredensial atau query database. Runner offline selalu memblokir psycopg2.connect.

## Integritas penelitian

Tidak menjalankan RAGAS live, menyunting dataset/fixture, meregenerasi embedding, atau menulis hasil eksperimen. Caller Python evaluasi mengikuti import baru; `evaluation/trace.py` mengikuti lokasi source baru untuk code fingerprint. Karena source direfactor, code fingerprint dapat berbeda; itu bukan hasil evaluasi baru. Test trace memakai temporary directory.

## Reproduksi dan bukti lokal

```powershell
apps/ai-backend/.venv/Scripts/python.exe -B apps/ai-backend/scripts/run_offline_tests.py
```

Log: `.private/backend-refactor/finalization-offline.txt`. Snapshot: `openapi-before.json` dan `openapi-final.json` di direktori yang sama. Audit dependencies: `dependencies-final.json`, `dependency-closure-final.json`; integritas penelitian: `research-integrity-final.json`. File bukti lokal ini diabaikan Git; ringkasan hasil dan runner/test masuk commit.

## Langkah integrasi berikutnya

1. Siapkan pgvector PostgreSQL 16 disposable dengan storage baru dan target khusus localhost:55433/coffee_backend_refactor_it; verifikasi host/port/nama database dan ketiadaan data production/penelitian sebelum menjalankan SQL atau tests. Gunakan credential test tersendiri, jangan menyalin environment production.
2. Setelah setup target tersebut diotorisasi, terapkan schema/migration yang dibutuhkan hanya di database disposable, gunakan fixture sintetis, lalu jalankan tests.integration.test_admin_overview, test_postgres_pool dan test_events dengan opt-in. Jangan memakai container existing port 5432.
3. Build Docker Linux dari context apps/ai-backend dalam lingkungan terisolasi untuk memeriksa fresh dependency resolution dan resource guardrail. Tidak diperlukan perubahan startup command untuk refactor ini.
4. Setelah deployment nanti diinstruksikan, verifikasi revision, startup, database target, auth, SMTP, pgvector/NeMo dan live LLM secara terpisah. Test offline bukan bukti integrasi tersebut aktif.
