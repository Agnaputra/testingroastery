# AI backend

Entry point tetap `app.main:app` (lokal) dan `index:app` (hosting). `main.py` memiliki konfigurasi FastAPI, CORS, router registration, dan lifecycle; startup tetap dapat menjalankan DDL publikasi, sehingga jangan menyalakan server tanpa memeriksa target database.

```text
app/
  main.py
  core/                  # settings, database, connection pool
  api/routers/           # endpoint publik, catalog management, customer, events
  schemas/               # model request/response bersama
  services/
    rag/
    recommendation/
    conversation/
    guardrails/          # adapter dan konfigurasi NeMo di guardrails/
    catalog/
    commerce/
tests/
  unit/
  integration/
  regression/
evaluation/              # runner/trace dan data penelitian; bukan tempat test aplikasi
migrations/
scripts/
```

Refactor ini memindahkan ownership modul dan endpoint dari `main.py`, tanpa menulis ulang business logic. Router commerce/events yang sudah ada tetap mempertahankan validasi dan helper lokalnya. Data, schema SQL, migration, dan artifact penelitian tidak dimigrasikan.

Jalankan regression yang tidak memerlukan database dari root repository:

```powershell
apps/ai-backend/.venv/Scripts/python.exe -B apps/ai-backend/scripts/run_offline_tests.py
```

Runner tersebut memblokir koneksi database dan jaringan eksternal, memakai fixture publikasi serta key sintetis untuk HTTP calls yang dimock, dan tidak menjalankan lifecycle server. Hasilnya tidak membuktikan integrasi pgvector, NeMo/LLM, email, atau pembayaran nyata.

Test database dipisahkan di `tests/integration/` dan tidak dijalankan oleh runner offline, kecuali concurrency test yang seluruh akses katalognya dimock. Test overview/pool/events memerlukan `BACKEND_DATABASE_IT=1`, `ENVIRONMENT=test`, dan target khusus `localhost:55433/coffee_backend_refactor_it` (atau host 127.0.0.1); commerce/publication/price tetap memakai opt-in serta pembatasan target yang sudah ada. Verifikasi database test terisolasi sebelum mengaktifkan test yang menulis data.

Import lama `app.config`, `app.rag_service`, dan `app.test_*` sudah diganti di caller dan test runner. Script pemeliharaan kini dipanggil sebagai `python -m scripts.seed_data` / `python -m scripts.migrate_pgvector`; jangan menjalankannya sebagai bagian smoke test karena mengubah database.

Endpoint, payload, dan seluruh identifier schema OpenAPI tetap sama dengan baseline. `app/core/openapi.py` mempertahankan empat nama schema `Credentials`/`ProfileInput` beserta `$ref` pada dokumen OpenAPI, tanpa mengubah class model atau handler. Import Python eksternal di luar repository tetap perlu mengikuti lokasi modul baru. Lihat `docs/backend-finalization.md` di root repository untuk hasil verifikasi dan batas integrasi.
