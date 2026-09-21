# Catalog Blueprint Handoff

Status: Master Catalog Mapping and Publication Guardrails Completed as of 2026-09-18.

## Completed

- Customer product detail no longer renders landed cost, HPP, packaging cost, or gross profit; replaced with "Nilai untuk setiap seduhan" value transparency.
- Public Virtual Barista and `/api/chat` responses no longer disclose 52 Coffee internal roastery parameters and redirect to store pricing calculations.
- `/catalog` and `/catalog/[slug]` use server route wrappers. Product pages provide `generateStaticParams()` and per-product metadata; client components retain filters, query-string selection, cart, size selection, and Slowbar ordering.
- `apps/web/lib/catalog-owner-snapshot.json` contains the snapshot of the owner workbook: 55 master products, 33 Slowbar rows, and 11 review items.
- `apps/web/lib/catalog-master.ts` provides strongly typed Blueprint ERD models (`MasterBean`, `ProductMappingEntry`, `OwnerCatalogProduct`, etc.), publication status classification (`published`, `draft`, `needs_owner_review`), and verified mapping (`ACTIVE_CATALOG_MAPPING`) between the 31 live website products and the 55 master rows.
- Publication gate strictly blocks unverified, draft, or provisional-price products from customer-facing interfaces (`PRODUCTS`, `getPublishedProducts()`, `/catalog`, search, quick view, cart Zustand).
- Dynamic catalog counters in `/catalog` resolve the "31 vs 25" user confusion by explicitly indicating filter roast (25), espresso roast (6), and Slowbar options (25).
- Full audit documentation delivered in `docs/catalog-owner-audit.md`.

## Source of truth during migration

1. `apps/web/lib/data.ts` serves the validated active customer catalog (31 published products), now strongly linked via `publicationStatus` and `masterRow` to `catalog-master.ts`.
2. `apps/web/lib/catalog-master.ts` is the single source of truth for the master catalog mapping, publication status rules, and audit reports.
3. `apps/web/lib/catalog-owner-snapshot.json` is owner staging data. Unapproved records remain isolated from public endpoints.

## Snapshot Status Summary

- **Total Master Products**: 55
- **Published**: 30 master rows (mapping to 31 published products; Row 15 *Ijen Full Wash* is sold in both Filter and Espresso profiles)
- **Draft**: 9 master rows (complete prices, waiting for owner release approval)
- **Needs Owner Review**: 16 master rows (5 empty prices + 10 provisional experimental prices + 1 naming ambiguity)
- **Slowbar Menu**: 33 items (25 published with 100% price match; 8 held in draft pending base bean activation)

## Required owner decisions before next batch publication

1. Confirm official retail and per-cup pricing for the 10 experimental variants (6 Kintamani + 4 Ijen) and 5 blend/drip bag items.
2. Approve release of the 9 draft items (Prau Crosswave, Jati, 52 Project, Kendal Kawiswara, Temanggung Natural, Tirta Argopuro, Bermi, Arjuna Natural, Arjuna Wash) into the web catalog.
3. Finalize canonical series naming preferences (`Sunda Series` vs `Puntang Series`, `Argopuro Walida` vs `Argopuro Series`, `Grand Reserve` vs `Grand Reserve Import`).
4. Decide on activation of Kintamani Full Wash (Row 18) filter bean and Gayo Full Wash (Row 27) filter bean (currently marked sold out).

## Verification performed

- `npm run typecheck --prefix apps/web` passed with 0 errors.
- `npm run lint --prefix apps/web` passed with 0 warnings or errors.
- Master audit report and partition verified via automated runtime execution.
