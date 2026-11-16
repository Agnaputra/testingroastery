# Refactor backend — 16 November 2026

Dilakukan setelah finalisasi frontend dan commit lokal `f6570305` (`refactor(web): organize page features and finalize commerce UI`). Commit frontend mencakup semua 114 file migrasi yang sebelumnya untracked, perbaikan pointer quick-add, runner browser dan catatan finalisasi. Tidak ada push/deployment.

## Struktur aktual

```text
apps/ai-backend/
  app/
    main.py
    core/                 # config.py, database.py, postgres_pool.py
    api/routers/          # public_api, customer/auth/account/orders/payments/operations,
                          # catalog_management, events
    schemas/models.py
    services/
      rag/
      recommendation/
      conversation/
      guardrails/         # adapter + guardrails/{config.yml,prompts.yml,rails.colang}
      catalog/
      commerce/
  tests/{unit,integration,regression}/
  scripts/                # maintenance, seed/migration CLI, offline test runner
  evaluation/             # tetap: caller Python diperbarui; data/artifact tidak diubah
  migrations/             # tetap
```

43 modul Python dipindahkan. Endpoint yang sebelumnya berada di main.py dipindah utuh ke api/routers/public_api.py; main.py tetap memiliki FastAPI/CORS, pendaftaran router dan lifecycle. Entry point app.main:app dan index:app tetap. Konfigurasi NeMo dipindah bersama adapter agar relative resource lookup tetap bekerja. Tidak ada salinan service/state untuk mempertahankan import lama.

Refactor ini mempertahankan business logic dalam modul yang sudah ada; helper lokal di router commerce/events tidak dipecah ulang. Model bersama dipindah ke schemas/. Validasi/auth/SQL, prompt, katalog, harga, perhitungan checkout, response error, dan konfigurasi production tidak diganti.

## Verifikasi

| Check | Hasil |
|---|---|
| Baseline sebelum pemindahan, fixture offline | PASS — 140 test |
| Baseline test yang sama setelah pemindahan | PASS — 140 test |
| Runner akhir termasuk test script dan public API | PASS — 147 test |
| AST 24 modul runtime yang dipindah | PASS — identik selain import dan referensi bantuan CLI |
| Body seluruh fungsi handler/lifecycle main lama | PASS — identik |
| OpenAPI 75 path dan payload | PASS setelah normalisasi qualified schema identifier |
| Syntax Python, manifest 43 pemindahan dan stale import scan | PASS |
| Frontend npm test setelah refactor backend | PASS — 5 suite / 37 assertions |
| Diff migration SQL dan data/artifact penelitian | Kosong |

Command reproducible: `apps/ai-backend/.venv/Scripts/python.exe -B apps/ai-backend/scripts/run_offline_tests.py`. Runner tidak menghubungi database atau jaringan eksternal; publikasi memakai fixture kosong dan HTTP provider pada test dimock dengan key sintetis. Loopback socket internal Windows asyncio diizinkan. Tidak ada server FastAPI, health request, seed, migration atau evaluasi penelitian nyata yang dijalankan.

Test database overview/pool/events memiliki opt-in `BACKEND_DATABASE_IT=1` dan host localhost. Suite integration lain mempertahankan flag dan pembatasan target sebelumnya. Suite tersebut belum dijalankan karena membutuhkan database test terisolasi dan dapat menulis data. Test concurrency katalog tetap berjalan offline dengan mock.

Empat component identifier OpenAPI berubah dari prefix module lama menjadi `app__api__routers__...` untuk Credentials/ProfileInput yang namanya sama antar-domain. Seluruh schema dan endpoint identik setelah prefix module dinormalisasi. Konsumen yang bergantung pada nama component tersebut atau import Python lama perlu memperbarui referensinya; tidak ada compatibility shim yang menggandakan service.

Import di script pemeliharaan/evaluasi dan path file pada evaluation/trace.py diperbarui agar runner dan code fingerprint tetap menemukan source baru. Code fingerprint wajar berubah karena struktur source berubah; dataset, baseline penelitian, embeddings, hasil evaluasi, SQL dan migration tidak diregenerasi. Test trace hanya menulis temporary directory fixture.

Log lokal: `.private/backend-refactor/baseline-safe.txt`, `after-fixed.txt`, dan `offline-final.txt`. Snapshot kontrak: `.private/backend-refactor/openapi-before.json` dan `openapi-after.json`. Manifest rinci modul: `.private/backend-refactor/file-map.json`.

Pada akhir audit awal ini backend masih uncommitted dan unstaged pada main lokal; status final mengikuti laporan finalisasi. Frontend sudah di-commit terpisah; tidak ada perubahan frontend setelah commit tersebut. Tidak ada konfigurasi Vercel/Railway/Neon, environment production, atau database yang diubah. Integrasi database, OAuth/SMTP nyata, NeMo/pgvector dan OpenAI live belum diverifikasi.

## Manifest pemindahan Python

Path relatif terhadap apps/ai-backend.

| Sumber | Tujuan |
|---|---|
| app/config.py | app/core/config.py |
| app/database.py | app/core/database.py |
| app/postgres_pool.py | app/core/postgres_pool.py |
| app/models.py | app/schemas/models.py |
| app/rag_service.py | app/services/rag/rag_service.py |
| app/recommendation_service.py | app/services/recommendation/recommendation_service.py |
| app/chat_router.py | app/services/conversation/chat_router.py |
| app/conversation_state.py | app/services/conversation/conversation_state.py |
| app/action_service.py | app/services/conversation/action_service.py |
| app/website_features.py | app/services/conversation/website_features.py |
| app/guardrail_service.py | app/services/guardrails/guardrail_service.py |
| app/publication_service.py | app/services/catalog/publication_service.py |
| app/price_service.py | app/services/catalog/price_service.py |
| app/email_service.py | app/services/commerce/email_service.py |
| app/customer_shipping.py | app/services/commerce/customer_shipping.py |
| app/customer_auth.py | app/api/routers/customer_auth.py |
| app/customer_account.py | app/api/routers/customer_account.py |
| app/customer_orders.py | app/api/routers/customer_orders.py |
| app/customer_payments.py | app/api/routers/customer_payments.py |
| app/customer_operations.py | app/api/routers/customer_operations.py |
| app/catalog_management.py | app/api/routers/catalog_management.py |
| app/events.py | app/api/routers/events.py |
| app/test_action_service.py | tests/unit/test_action_service.py |
| app/test_admin_overview.py | tests/integration/test_admin_overview.py |
| app/test_catalog_concurrency.py | tests/integration/test_catalog_concurrency.py |
| app/test_catalog_conversation.py | tests/regression/test_catalog_conversation.py |
| app/test_catalog_management.py | tests/integration/test_catalog_management.py |
| app/test_config.py | tests/unit/test_config.py |
| app/test_conversation_state.py | tests/unit/test_conversation_state.py |
| app/test_customer_commerce.py | tests/integration/test_customer_commerce.py |
| app/test_customer_commerce_mode.py | tests/unit/test_customer_commerce_mode.py |
| app/test_email_service.py | tests/unit/test_email_service.py |
| app/test_evaluation_trace.py | tests/regression/test_evaluation_trace.py |
| app/test_events.py | tests/integration/test_events.py |
| app/test_health_conversation.py | tests/regression/test_health_conversation.py |
| app/test_order_batch.py | tests/unit/test_order_batch.py |
| app/test_postgres_pool.py | tests/integration/test_postgres_pool.py |
| app/test_price_service.py | tests/integration/test_price_service.py |
| app/test_publication_integration.py | tests/integration/test_publication_integration.py |
| app/test_recommendation_service.py | tests/unit/test_recommendation_service.py |
| app/test_scope.py | tests/regression/test_scope.py |
| app/seed_data.py | scripts/seed_data.py |
| app/migrate_pgvector.py | scripts/migrate_pgvector.py |

## Snapshot Git setelah finalisasi

```text
 AGENTS.md                                          |    4 +-
 apps/ai-backend/app/action_service.py              |  148 --
 apps/ai-backend/app/catalog_management.py          |  297 ----
 apps/ai-backend/app/chat_router.py                 |  112 --
 apps/ai-backend/app/config.py                      |   60 -
 apps/ai-backend/app/conversation_state.py          |  622 -------
 apps/ai-backend/app/customer_account.py            |  109 --
 apps/ai-backend/app/customer_auth.py               |  344 ----
 apps/ai-backend/app/customer_operations.py         |  310 ----
 apps/ai-backend/app/customer_orders.py             |  430 -----
 apps/ai-backend/app/customer_payments.py           |  299 ----
 apps/ai-backend/app/customer_shipping.py           |   14 -
 apps/ai-backend/app/database.py                    |   23 -
 apps/ai-backend/app/email_service.py               |  505 ------
 apps/ai-backend/app/events.py                      |  551 ------
 apps/ai-backend/app/guardrail_service.py           |  133 --
 apps/ai-backend/app/guardrails/config.yml          |   13 -
 apps/ai-backend/app/guardrails/prompts.yml         |   26 -
 apps/ai-backend/app/guardrails/rails.colang        |   16 -
 apps/ai-backend/app/main.py                        |  223 +--
 apps/ai-backend/app/migrate_pgvector.py            |   54 -
 apps/ai-backend/app/models.py                      |   83 -
 apps/ai-backend/app/postgres_pool.py               |   41 -
 apps/ai-backend/app/price_service.py               |  264 ---
 apps/ai-backend/app/publication_service.py         |   86 -
 apps/ai-backend/app/rag_service.py                 | 1848 --------------------
 apps/ai-backend/app/recommendation_service.py      |  335 ----
 apps/ai-backend/app/seed_data.py                   |  126 --
 apps/ai-backend/app/test_action_service.py         |  186 --
 apps/ai-backend/app/test_admin_overview.py         |   59 -
 apps/ai-backend/app/test_catalog_concurrency.py    |   33 -
 apps/ai-backend/app/test_catalog_conversation.py   |  104 --
 apps/ai-backend/app/test_catalog_management.py     |  104 --
 apps/ai-backend/app/test_config.py                 |   33 -
 apps/ai-backend/app/test_conversation_state.py     |  328 ----
 apps/ai-backend/app/test_customer_commerce.py      |  541 ------
 apps/ai-backend/app/test_customer_commerce_mode.py |  114 --
 apps/ai-backend/app/test_email_service.py          |   99 --
 apps/ai-backend/app/test_evaluation_trace.py       |  315 ----
 apps/ai-backend/app/test_events.py                 |   86 -
 apps/ai-backend/app/test_health_conversation.py    |   47 -
 apps/ai-backend/app/test_order_batch.py            |   48 -
 apps/ai-backend/app/test_postgres_pool.py          |   85 -
 apps/ai-backend/app/test_price_service.py          |  152 --
 .../ai-backend/app/test_publication_integration.py |  140 --
 apps/ai-backend/app/test_recommendation_service.py |  263 ---
 apps/ai-backend/app/test_scope.py                  |  254 ---
 apps/ai-backend/app/website_features.py            |   36 -
 apps/ai-backend/evaluation/build_dataset_3b.py     |    8 +-
 apps/ai-backend/evaluation/c3_chunkless_probe.py   |    4 +-
 apps/ai-backend/evaluation/c3_mock_runtime.py      |    6 +-
 apps/ai-backend/evaluation/c3_orphan_probe.py      |    4 +-
 apps/ai-backend/evaluation/c3_parallel_probe.py    |    4 +-
 .../evaluation/check_publication_snapshot_3b4.py   |    2 +-
 apps/ai-backend/evaluation/run_ragas.py            |    6 +-
 .../evaluation/seed_price_test_3b4_c2.py           |    6 +-
 apps/ai-backend/evaluation/trace.py                |    8 +-
 .../scripts/apply_customer_inventory_migration.py  |    2 +-
 .../scripts/configure_shipping_origin.py           |    2 +-
 apps/ai-backend/scripts/promote_customer_admin.py  |    2 +-
 apps/ai-backend/scripts/run_pre_evaluation.py      |   16 +-
 apps/ai-backend/scripts/seed_customer_catalog.py   |    2 +-
 62 files changed, 52 insertions(+), 10123 deletions(-)
```

```text
 M AGENTS.md
 D apps/ai-backend/app/action_service.py
 D apps/ai-backend/app/catalog_management.py
 D apps/ai-backend/app/chat_router.py
 D apps/ai-backend/app/config.py
 D apps/ai-backend/app/conversation_state.py
 D apps/ai-backend/app/customer_account.py
 D apps/ai-backend/app/customer_auth.py
 D apps/ai-backend/app/customer_operations.py
 D apps/ai-backend/app/customer_orders.py
 D apps/ai-backend/app/customer_payments.py
 D apps/ai-backend/app/customer_shipping.py
 D apps/ai-backend/app/database.py
 D apps/ai-backend/app/email_service.py
 D apps/ai-backend/app/events.py
 D apps/ai-backend/app/guardrail_service.py
 D apps/ai-backend/app/guardrails/config.yml
 D apps/ai-backend/app/guardrails/prompts.yml
 D apps/ai-backend/app/guardrails/rails.colang
 M apps/ai-backend/app/main.py
 D apps/ai-backend/app/migrate_pgvector.py
 D apps/ai-backend/app/models.py
 D apps/ai-backend/app/postgres_pool.py
 D apps/ai-backend/app/price_service.py
 D apps/ai-backend/app/publication_service.py
 D apps/ai-backend/app/rag_service.py
 D apps/ai-backend/app/recommendation_service.py
 D apps/ai-backend/app/seed_data.py
 D apps/ai-backend/app/test_action_service.py
 D apps/ai-backend/app/test_admin_overview.py
 D apps/ai-backend/app/test_catalog_concurrency.py
 D apps/ai-backend/app/test_catalog_conversation.py
 D apps/ai-backend/app/test_catalog_management.py
 D apps/ai-backend/app/test_config.py
 D apps/ai-backend/app/test_conversation_state.py
 D apps/ai-backend/app/test_customer_commerce.py
 D apps/ai-backend/app/test_customer_commerce_mode.py
 D apps/ai-backend/app/test_email_service.py
 D apps/ai-backend/app/test_evaluation_trace.py
 D apps/ai-backend/app/test_events.py
 D apps/ai-backend/app/test_health_conversation.py
 D apps/ai-backend/app/test_order_batch.py
 D apps/ai-backend/app/test_postgres_pool.py
 D apps/ai-backend/app/test_price_service.py
 D apps/ai-backend/app/test_publication_integration.py
 D apps/ai-backend/app/test_recommendation_service.py
 D apps/ai-backend/app/test_scope.py
 D apps/ai-backend/app/website_features.py
 M apps/ai-backend/evaluation/__init__.py
 M apps/ai-backend/evaluation/build_dataset_3b.py
 M apps/ai-backend/evaluation/c3_chunkless_probe.py
 M apps/ai-backend/evaluation/c3_mock_runtime.py
 M apps/ai-backend/evaluation/c3_orphan_probe.py
 M apps/ai-backend/evaluation/c3_parallel_probe.py
 M apps/ai-backend/evaluation/check_publication_snapshot_3b4.py
 M apps/ai-backend/evaluation/run_ragas.py
 M apps/ai-backend/evaluation/seed_price_test_3b4_c2.py
 M apps/ai-backend/evaluation/trace.py
 M apps/ai-backend/index.py
 M apps/ai-backend/scripts/apply_customer_inventory_migration.py
 M apps/ai-backend/scripts/authorize_gmail.py
 M apps/ai-backend/scripts/configure_shipping_origin.py
 M apps/ai-backend/scripts/promote_customer_admin.py
 M apps/ai-backend/scripts/run_pre_evaluation.py
 M apps/ai-backend/scripts/seed_customer_catalog.py
 M apps/ai-backend/scripts/test_authorize_gmail.py
 M apps/ai-backend/scripts/test_pre_evaluation.py
?? apps/ai-backend/README.md
?? apps/ai-backend/app/__init__.py
?? apps/ai-backend/app/api/__init__.py
?? apps/ai-backend/app/api/routers/__init__.py
?? apps/ai-backend/app/api/routers/catalog_management.py
?? apps/ai-backend/app/api/routers/customer_account.py
?? apps/ai-backend/app/api/routers/customer_auth.py
?? apps/ai-backend/app/api/routers/customer_operations.py
?? apps/ai-backend/app/api/routers/customer_orders.py
?? apps/ai-backend/app/api/routers/customer_payments.py
?? apps/ai-backend/app/api/routers/events.py
?? apps/ai-backend/app/api/routers/public_api.py
?? apps/ai-backend/app/core/__init__.py
?? apps/ai-backend/app/core/config.py
?? apps/ai-backend/app/core/database.py
?? apps/ai-backend/app/core/postgres_pool.py
?? apps/ai-backend/app/schemas/__init__.py
?? apps/ai-backend/app/schemas/models.py
?? apps/ai-backend/app/services/__init__.py
?? apps/ai-backend/app/services/catalog/__init__.py
?? apps/ai-backend/app/services/catalog/price_service.py
?? apps/ai-backend/app/services/catalog/publication_service.py
?? apps/ai-backend/app/services/commerce/__init__.py
?? apps/ai-backend/app/services/commerce/customer_shipping.py
?? apps/ai-backend/app/services/commerce/email_service.py
?? apps/ai-backend/app/services/conversation/__init__.py
?? apps/ai-backend/app/services/conversation/action_service.py
?? apps/ai-backend/app/services/conversation/chat_router.py
?? apps/ai-backend/app/services/conversation/conversation_state.py
?? apps/ai-backend/app/services/conversation/website_features.py
?? apps/ai-backend/app/services/guardrails/__init__.py
?? apps/ai-backend/app/services/guardrails/guardrail_service.py
?? apps/ai-backend/app/services/guardrails/guardrails/config.yml
?? apps/ai-backend/app/services/guardrails/guardrails/prompts.yml
?? apps/ai-backend/app/services/guardrails/guardrails/rails.colang
?? apps/ai-backend/app/services/rag/__init__.py
?? apps/ai-backend/app/services/rag/rag_service.py
?? apps/ai-backend/app/services/recommendation/__init__.py
?? apps/ai-backend/app/services/recommendation/recommendation_service.py
?? apps/ai-backend/scripts/migrate_pgvector.py
?? apps/ai-backend/scripts/run_offline_tests.py
?? apps/ai-backend/scripts/seed_data.py
?? apps/ai-backend/tests/__init__.py
?? apps/ai-backend/tests/integration/__init__.py
?? apps/ai-backend/tests/integration/test_admin_overview.py
?? apps/ai-backend/tests/integration/test_catalog_concurrency.py
?? apps/ai-backend/tests/integration/test_catalog_management.py
?? apps/ai-backend/tests/integration/test_customer_commerce.py
?? apps/ai-backend/tests/integration/test_events.py
?? apps/ai-backend/tests/integration/test_postgres_pool.py
?? apps/ai-backend/tests/integration/test_price_service.py
?? apps/ai-backend/tests/integration/test_publication_integration.py
?? apps/ai-backend/tests/regression/__init__.py
?? apps/ai-backend/tests/regression/test_catalog_conversation.py
?? apps/ai-backend/tests/regression/test_evaluation_trace.py
?? apps/ai-backend/tests/regression/test_health_conversation.py
?? apps/ai-backend/tests/regression/test_scope.py
?? apps/ai-backend/tests/unit/__init__.py
?? apps/ai-backend/tests/unit/test_action_service.py
?? apps/ai-backend/tests/unit/test_config.py
?? apps/ai-backend/tests/unit/test_conversation_state.py
?? apps/ai-backend/tests/unit/test_customer_commerce_mode.py
?? apps/ai-backend/tests/unit/test_email_service.py
?? apps/ai-backend/tests/unit/test_order_batch.py
?? apps/ai-backend/tests/unit/test_public_api.py
?? apps/ai-backend/tests/unit/test_recommendation_service.py
?? docs/backend-refactor-report.md
```
