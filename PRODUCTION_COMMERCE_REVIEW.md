# Production commerce review — feature/customer-commerce-manual-payments

Initial local audit followed by release preparation on 9 November 2026. Backend production remains Railway; Vercel backend is Preview only. See the latest release section below for deployment and test evidence. No production data was modified or deleted.

## Findings and changes

- Customer checkout now fails closed when commerce is unconfigured, instead of silently selecting the local demo checkout. Legacy demo requires explicit NEXT_PUBLIC_CHECKOUT_DEMO_MODE=1; leave unset in Production.
- Checkout labels follow backend checkout-policy.mode, not branch or NODE_ENV. Production policy does not display simulation notices; testing policy does. Tracking, admin order lists, sidebar counts and verified-payment overview now select database commerce for operational mode as well as testing. Pending payment/fulfillment labels are translated without changing database enums.
- Operational payment configuration cannot fall back to PAYMENT_TEST_* or default testing bank/merchant/image values. Order creation validates only the selected enabled method. BCA requires its account and holder; QRIS requires its merchant and readable JPEG. Disabled QRIS does not block BCA.
- Backend production order creation additionally requires CUSTOMER_PAYMENT_READY=1. Set only after checking the frontend payment configuration and verifying the official account/merchant/image. This is an operator readiness gate, not automatic external bank verification.
- Hardcoded bank details removed from checkout. Detail page uses authenticated configured payment instructions. Previously QRIS used a hardcoded merchant payload via QrisDynamicCard; database-backed orders now show the configured static QRIS image and ask for the exact order total. No account or image configuration was changed. Dynamic QRIS generation remains outside this production order path.
- CUSTOMER_OPERATIONAL_TEST_MODE cannot activate production. Preview database hostname must exactly match CUSTOMER_PREVIEW_DATABASE_HOST, in addition to ENVIRONMENT=preview and a Neon hostname. The configured host must be proven isolated by the operator; merely setting the variable does not prove isolation.
- New Preview/local orders carry testing mode even when testing operational stock behavior. Historical orders lacking an explicit checkoutMode are not inferred operational from a free-shipping policy: their mode is unknown unless the old simulation policy identifies them as testing. No historical records were changed.

## Server-side behavior reviewed

customer_orders.priced_lines reads authoritative catalog prices and stock, rejects client price mismatches, validates BYOB ratio sum=100 and component availability, and reserves inventory under row locks. Unit prices, subtotal, voucher discount and shipping are recalculated on the server. Vouchers SEDUPRESISI/52COFFEE apply the existing 10% discount. Java destinations retain free shipping; operational mode requires an admin-configured origin. Outside Java the flow requests shipping confirmation and blocks order creation/payment; no courier integration or delivery promise was added.

Proof upload requires the owner and a pending/rejected order. Upload changes status to awaiting_verification, never paid. Admin approval requires the admin boundary, current awaiting_verification status and receiptConfirmed. Rejection requires a reason. Fulfillment transitions require paid for processing/shipping and a tracking number for shipped. Enum and transition logic unchanged.

## Deployment configuration (names only; no secrets)

Frontend Production:
- NEXT_PUBLIC_CUSTOMER_COMMERCE_MODE=operational and CUSTOMER_COMMERCE_MODE=operational must agree.
- CUSTOMER_COMMERCE_TEST_MODE and NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE unset/0; NEXT_PUBLIC_CHECKOUT_DEMO_MODE unset/0.
- CUSTOMER_PAYMENT_METHODS=bca_transfer for production once the existing BCA recipient has been approved; missing allowlist disables all production methods. PAYMENT_BCA_ACCOUNT and PAYMENT_BCA_HOLDER required for BCA. QRIS remains excluded until an official company asset is available and approved. PAYMENT_QRIS_MERCHANT/PAYMENT_QRIS_PATH are required only when QRIS is explicitly enabled. Existing QRIS artwork and recipients were not replaced.
- AI_BACKEND_URL, ADMIN_API_KEY, NEXT_PUBLIC_APP_URL and existing customer/admin Google OAuth variables remain required as applicable. Keep public variables free of credentials.
- NEXT_PUBLIC_PRICE_TEST_MODE unset/0 for normal published catalog behavior.

Backend Production (Railway, not Vercel):
- CUSTOMER_PAYMENT_METHODS=bca_transfer; QRIS requests rejected server-side before any order write. Keep CUSTOMER_PAYMENT_READY=0 until readiness is confirmed.
- ENVIRONMENT=production, CUSTOMER_COMMERCE_MODE=operational, CUSTOMER_COMMERCE_TEST_MODE unset/0, CUSTOMER_OPERATIONAL_TEST_MODE unset/0.
- CUSTOMER_PAYMENT_READY=1 only after manual payment configuration readiness is confirmed; otherwise order creation returns 503 before writing an order.
- DATABASE_URL must be the intended production database (not localhost); existing auth/session/admin/email configuration must be verified.
- CUSTOMER_PAYMENT_HOURS optional (24 default, 1–168 hours). CUSTOMER_CUP_GRAMS required if cup products are sold (5–50). Legacy CUSTOMER_TEST_PAYMENT_HOURS/CUSTOMER_TEST_CUP_GRAMS remain compatibility aliases; prefer neutral names.
- PUBLICATION_PRICE_TEST_MODE unset/0. CORS_ORIGINS and CUSTOMER_GOOGLE_REDIRECT_URI must match the real frontend origin; use existing variable names from config/auth.

Frontend Preview:
- NEXT_PUBLIC_CUSTOMER_COMMERCE_MODE=testing, CUSTOMER_COMMERCE_MODE=testing, CUSTOMER_COMMERCE_TEST_MODE=1, NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE=1.
- Use Vercel's VERCEL_ENV=preview; payment configuration may use PAYMENT_TEST_* with synthetic fixtures. Do not copy real customer/payment data into Preview.
- NEXT_PUBLIC_CHECKOUT_DEMO_MODE unset unless explicitly testing the old demo; PRICE_TEST_MODE is a separate isolated pricing-evaluation feature, not the commerce switch.

Backend Preview:
- CUSTOMER_PAYMENT_METHODS=bca_transfer,qris_static (both enabled by default outside production). Temporary QRIS is testing only.
- ENVIRONMENT=preview, CUSTOMER_COMMERCE_MODE=testing, CUSTOMER_COMMERCE_TEST_MODE=1.
- DATABASE_URL points to the isolated Preview database; CUSTOMER_PREVIEW_DATABASE_HOST contains its exact host, without credentials.
- CUSTOMER_OPERATIONAL_TEST_MODE=1 only when testing operational inventory rules in Preview; records still marked testing.
- Configure test payment hours/cup grams/shipping fixture variables as required by the tested endpoint; verified email or tester allowlist remains applicable. Operational mode is not enabled for Preview payments.

## Data separation and remaining blockers

Orders share customer_orders/customer_payments tables; new data is differentiated by shipping_snapshot.checkoutMode, not separate tables. Historic missing markers can be ambiguous. This audit did not connect to a database or inspect customer/order rows, so mixing counts and actual production/Preview isolation remain unverified. No cleanup or backfill was run.

Integration test_customer_commerce is opt-in and deletes its fixture orders/users in tearDown; it was intentionally not enabled under the instruction not to delete testing orders. Seven mode/security unit tests passed; five database integration tests skipped. The readiness test verifies both QRIS/BCA are blocked before opening a database connection when production readiness is absent. A separate Node check verifies production payment configuration fails closed for test-only values, missing QRIS and operational Preview. Browser/OAuth/upload/approve/reject/customer-status E2E must be rerun manually against an authorized isolated target. The user's prior successful QRIS/BCA/admin test is prior-session evidence, not a new test result from this audit.

PR can be opened for review, but this is NOT an unconditional production rollout approval. Before merge/release: verify intended merchant and QRIS image, deployed image availability, exact frontend/backend mode agreement, isolated Preview hostname, production database readiness and admin stock/shipping origin, historical mode ambiguity, and E2E of configured static QRIS/BCA + upload + admin approve/reject + customer statuses. Test legacy-demo flag stays disabled in Production. Validate a missing payment config attempt creates no order.

## Final validation

Frontend typecheck, lint and production build passed. Browser automation was attempted but both native pipe and browser access host were unavailable; no new browser E2E result is claimed. Routing-mode self-check covers operational/testing/disabled, including the production admin/tracking selection fix.

## Latest release preparation (Railway retained)

- Owner confirmed NANA STORE QRIS is temporary testing only; do not enable it for production customers. Existing account, merchant and QRIS asset values are unchanged.
- Railway CLI authenticated and linked to the existing production service. Domain targets port 8080, but the service had no active deployment and its last deployment (29 October) was failed/stopped. Historical build/deploy logs were unavailable; the underlying historical failure cause is not established.
- Direct read-only connection using Railway's configured DATABASE_URL succeeded and matched the Neon main endpoint. Orders schema, auth schema and inventory schema exist; observed 0 orders, 3 users and 0 verified inventory rows. No production database updates, cleanup, seeding or migrations were run. Stock must be verified by the owner/admin, not fabricated for release tests.
- Google OAuth backend configuration exists and callback points to the production frontend /api/customer/google/callback. This is configuration evidence, not a successful interactive Google login.
- Payment allowlists are enforced in the Next proxy, payment instructions/image routes, checkout UI and backend order endpoint. Production defaults to no active methods unless CUSTOMER_PAYMENT_METHODS is explicitly configured. Preview defaults to BCA plus QRIS.
- Nine mode/security unit tests passed; five local database integration tests skipped. New assertions cover independent BCA configuration, missing/disabled QRIS, explicit production activation and direct backend QRIS rejection. TypeScript and lint passed; production build checked separately.
- PR #2 remains unmerged. CUSTOMER_PAYMENT_READY must not be enabled until BCA approval/configuration, actual runtime readiness and remaining release checks pass. Prior synthetic Preview orders stay testing; they are not production revenue.

## Railway Free validation and latest Preview BCA result

Railway workspace was HOBBY with no active subscription and expired trial. The documented customerCreateFreePlanSubscription API activated Free without purchasing a paid plan. A subsequent read returned plan=FREE, an active subscription and $1 remaining usage credit. App Sleeping is enabled and /health is configured as the deployment health check. PORT=8080 matches the existing domain target. Production remains the same Railway project/service/domain.

Deployment e20ae2b7-31c1-4dd3-8457-bf730bbed095 uploaded application revision 9fe1ca90630c0b44e5d4432390a7adf8891670f7. Live /health returned HTTP 200, status healthy, that exact revision, ENVIRONMENT=production, the expected Neon main host, database reachable and NeMo runtime ready. Six subsequent live health requests all passed; the slowest measured request was 2766 ms. This is a short smoke test, not an availability SLA or load-test conclusion.

Railway metrics over the observed 15-minute window: memory current 98.95 MB, maximum 165.45 MB, platform limit 524.288 MB; CPU maximum 0.0431 vCPU, limit 1 vCPU. A separate local Docker test used a fresh database, an internal-only network, a dummy API key and 512 MiB/1 CPU limit. Twenty HTTP requests returned the expected ten health 200s and ten unauthenticated 401s; no OOM occurred, cgroup memory peak was 119226368 bytes (113.7 MiB). Local health was degraded because the isolated database had no retrieval knowledge base, so this is only a resource/HTTP smoke test. The actual Railway runtime, in contrast, reported healthy. Temporary containers/network and session files were removed; other local containers were left intact. Docker build now excludes .private and .env.*.

Live production guard checks: QRIS order submission rejected with 422 before database writes; BCA order submission rejected with 503 because CUSTOMER_PAYMENT_READY=0. A subsequent read-only production count remained 0 orders and 0 verified inventory rows. No real payment or order was made. CUSTOMER_PAYMENT_METHODS=bca_transfer is stored on both production services; temporary QRIS remains excluded. Production bank/merchant/artwork values and DATABASE_URL were not replaced.

Latest tested Preview frontend: https://52coffee-roastery-gx7r148m4-agnaputras-projects.vercel.app
Latest tested Preview backend: https://52coffee-ai-backend-o0exgd3yq-agnaputras-projects.vercel.app (application revision 1e0e9640; 9fe1ca90 changes Docker ignore only). Backend health proves the isolated Preview database host. Frontend branch configuration is pinned to this backend for subsequent builds.

Latest BCA API flow passed on this pair: testing policy exposes BCA and temporary QRIS; manipulated client price rejected; subtotal 65000, 10% discount 6500 and Java shipping 0 produce total 58500; BCA instructions match the order total; a BCA order cannot fetch a QRIS image; synthetic proof upload gives awaiting_verification; customer admin decision is forbidden; admin rejection yields customer rejected; reupload followed by approval yields customer paid; approval without receipt confirmation is rejected; paid order payment instructions return 409 to prevent repeat payment. Order 3f921b74-0854-40a6-9e62-a9b78861ee06 is explicitly testing and retained. Synthetic fixture users were disabled and sessions expired afterward; this does not represent money received.

Google OAuth smoke: production start endpoint returned 307 to accounts.google.com with state and PKCE and the correct frontend callback host. Preview start redirects to its configured canonical branch hostname. Interactive Google account login/callback and browser UI remain untested because browser automation host is unavailable.

Free is sufficient for these short startup/health tests; the $1 monthly credit and stability for real traffic have not been demonstrated. No subscription upgrade or paid API generation test was performed. CUSTOMER_PAYMENT_READY stays 0 pending confirmation of the existing BCA recipient, admin-verified production inventory/shipping/catalog readiness and remaining release checks. PR #2 must remain unmerged. Saved frontend production test/demo flags are set to 0 only after operational backend/database verification; this does not update the already-running frontend until a separately reviewed release deployment.
