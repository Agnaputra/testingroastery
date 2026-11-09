# Production commerce review — feature/customer-commerce-manual-payments

Local code preparation only. No merge, push, deploy, environment changes, seed, migration, order deletion, or database writes were performed.

## Findings and changes

- Customer checkout now fails closed when commerce is unconfigured, instead of silently selecting the local demo checkout. Legacy demo requires explicit NEXT_PUBLIC_CHECKOUT_DEMO_MODE=1; leave unset in Production.
- Checkout labels follow backend checkout-policy.mode, not branch or NODE_ENV. Production policy does not display simulation notices; testing policy does. Tracking, admin order lists, sidebar counts and verified-payment overview now select database commerce for operational mode as well as testing. Pending payment/fulfillment labels are translated without changing database enums.
- Operational payment configuration cannot fall back to PAYMENT_TEST_* or default testing bank/merchant/image values. Missing QRIS file does not fall back in operational mode. Order creation via Next proxy checks the complete payment configuration and readable JPEG before contacting the order service.
- Backend production order creation additionally requires CUSTOMER_PAYMENT_READY=1. Set only after checking the frontend payment configuration and verifying the official account/merchant/image. This is an operator readiness gate, not automatic external bank verification.
- Hardcoded bank details removed from checkout. Detail page uses authenticated configured payment instructions. Previously QRIS used a hardcoded merchant payload via QrisDynamicCard; database-backed orders now show the configured static QRIS image and ask for the exact order total. No account or image configuration was changed. Dynamic QRIS generation remains outside this production order path.
- CUSTOMER_OPERATIONAL_TEST_MODE cannot activate production. Preview database hostname must exactly match CUSTOMER_PREVIEW_DATABASE_HOST, in addition to ENVIRONMENT=preview and a Neon hostname. The configured host must be proven isolated by the operator; merely setting the variable does not prove isolation.
- New Preview/local orders carry testing mode even when testing operational stock behavior. Historical orders lacking an explicit checkoutMode are not inferred operational from a free-shipping policy: their mode is unknown unless the old simulation policy identifies them as testing. No historical records were changed.

## Server-side behavior reviewed

customer_orders.priced_lines reads authoritative catalog prices and stock, rejects client price mismatches, validates BYOB ratio sum=100 and component availability, and reserves inventory under row locks. Unit prices, subtotal, voucher discount and shipping are recalculated on the server. Vouchers SEDUPRESISI/52COFFEE apply the existing 10% discount. Java destinations retain free shipping; operational mode requires an admin-configured origin. Outside Java the flow requests shipping confirmation and blocks order creation/payment; no courier integration or delivery promise was added.

Proof upload requires the owner and a pending/rejected order. Upload changes status to awaiting_verification, never paid. Admin approval requires the admin boundary, current awaiting_verification status and receiptConfirmed. Rejection requires a reason. Fulfillment transitions require paid for processing/shipping and a tracking number for shipped. Enum and transition logic unchanged.

## Vercel configuration (names only; no secrets)

Frontend Production:
- NEXT_PUBLIC_CUSTOMER_COMMERCE_MODE=operational and CUSTOMER_COMMERCE_MODE=operational must agree.
- CUSTOMER_COMMERCE_TEST_MODE and NEXT_PUBLIC_CUSTOMER_COMMERCE_TEST_MODE unset/0; NEXT_PUBLIC_CHECKOUT_DEMO_MODE unset/0.
- PAYMENT_BCA_ACCOUNT, PAYMENT_BCA_HOLDER, PAYMENT_QRIS_MERCHANT, PAYMENT_QRIS_PATH required. QRIS path must resolve to a deployed JPEG under public or .private/payment allowed roots. Ensure deployment packaging actually includes the file. No PAYMENT_TEST_* fallback in operational mode.
- AI_BACKEND_URL, ADMIN_API_KEY, NEXT_PUBLIC_APP_URL and existing customer/admin Google OAuth variables remain required as applicable. Keep public variables free of credentials.
- NEXT_PUBLIC_PRICE_TEST_MODE unset/0 for normal published catalog behavior.

Backend Production:
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
