# Guided Blend Workspace — design review package

Scope: `/work-with-us/consultations`, design only. No application files edited in this task. New editable document: `52-coffee-guided-complete.figcraft`. Thirty full screens plus ten detail/behavior boards. PNG filenames identify viewport, step and state. All screens represent ONE route, with mutually exclusive active step content; frames are prototype snapshots, not separate routes.

## Feature preservation checklist

| Existing feature | Design location / contract |
|---|---|
| Published, available espresso beans | Step 1, all six locally published espresso products; runtime authority must still be verified |
| Required A/B and optional C | Step 1 component selector; two/three-bean frames; selected cards carry A/B/C markers |
| Authentic image mapping | `catalog.json` generated through getPublishedProducts + getProductDisplayImage; Robusta uses bag-prau and Arabica Espresso bag-sumbing, exactly as current fallback mapping |
| Names, price and process | Product cards; 250g price derived by getPackagePrice, including current nearest-variant conversion |
| Complete specifications | Expanded detail state; product/process/region/species/tasting notes retained; each product's original data in catalog.json |
| Unavailable or fewer than two eligible beans | Unavailable frames; reload catalog and consultation without estimate; no fabricated price |
| Separate ratio controls | Step 2 A/B, plus C in three-bean frame; percentage must be numeric-editable as well as draggable in implementation |
| Ratio constraints | Two beans 10–90%; three beans 5–90%; changing one redistributes the remainder proportionally and corrects rounding, exactly per handlers |
| Adding/removing C | 70/30 → 56/24/20 on add; removing C normalizes A/B back to 100% |
| Presets and roaster picks | Step 2 disclosure and detail board; preserve source arrays and applyPreset behavior, including removal of C on applying a two-bean recommendation |
| Six sensory axes + roast modifier | Radar generated from source equations, with 0–10 axis grid and current 1–10 clamp; calculated-snapshots.json records actual values |
| Tasting notes | combineBlendTastingNotes, maximum four, ratio-ordered and deduplicated |
| Roast behavior | Fixed Dark Espresso Roast; character copy follows robusta-share / acidity / body / sweetness branch order |
| Package selection | 250g, 500g, 1kg; active price, equivalent kg price and per-component contributions in cost disclosure |
| HPP sources | BYOB and Retail Beans; retail detail board retains product and in-stock variant selectors |
| HPP inputs | Dose 8–24g; other cost ≥0; selling price ≥0; daily cups 0–1000; operating days 0–31; preserve source handling |
| HPP outputs | Raw-material price/kg; coffee HPP/cup; total HPP/cup; contribution/cup; kg/month; monthly contribution; no relabeling contribution as net profit |
| HPP equations | Imported calculatePartnershipEstimate; snapshots are generated values, not replacement formulas |
| Missing selling price | Contribution and monthly contribution stay unavailable (dash), as existing formula; never interpreted as zero profit |
| Consultation summary | Beans, ratios, package, source and HPP; Edit blend returns to configuration |
| Required form fields | businessName, contactName, whatsapp, city, businessType, serviceType, useCase, profile |
| Optional form fields | usage, equipment, notes; no new mandatory fields |
| Form options | All original values listed below and in four detail boards |
| Validation | Native required semantics; error text beside first invalid field; no extra phone-format or business validation invented |
| WhatsApp preview | Collapsed/expanded and partial/completed frames; source message contents retained; expansion uses page scroll |
| WhatsApp handoff | Opens encoded message in new tab; opening does not send. Prototype deliberately sends nothing |
| State preservation | One shared draft outside step panels; unmounting active panel must not reset beans, ratios, size, calculator or form. Return-state board specifies same values; this is a handoff contract, not a working app |
| Commerce/share controls | Preserve source mode conditions: lab-only actions must not be introduced into partnership mode |

## Exact dropdown options

- businessType: Café / coffee shop; Restoran; Hotel / HORECA; Office / corporate; Retail / reseller; Lainnya.
- serviceType: Pasokan beans rutin; Custom blend / label khusus; Konsultasi menu, SOP, mesin, dan HPP; Masih ingin dikonsultasikan.
- useCase: Espresso & milk-based; Black coffee; Manual brew; Ready-to-drink; House blend multipurpose; Masih ingin dikonsultasikan.
- profile: Chocolatey & nutty; Sweet & balanced; Fruity & bright; Bold & full-bodied; Masih ingin dieksplorasi.

## Navigation and accessibility

Stepper shows completed checkmarks, active navy background and upcoming numbers. Back/Next, optional C, details, presets, preview and Edit blend have prototype links. Completed steps remain revisitable; no requirement to re-enter values. Validation applies at the existing form handoff, not arbitrary gates. When catalog is unavailable, go directly to consultation without estimates.

Implementation contract: semantic buttons, aria-current=step, visible focus, focus heading on step change, associate error with field, arrow-key sliders plus numeric inputs, 44px minimum hit targets, no horizontal page overflow or nested panel scrolling. Reduced-motion mode uses instant step changes. Tablet: 1024px supports two columns only with adequate control width; 768px stacks controls then results and uses two-column form where practical.

## Visual system and comparison

Charcoal #2C3136 content/hero, navy #465C70 navigation, crimson #A52136 primary action, mist #CFE8EA summaries, white surfaces and #F8FAFC canvas. Raleway headings, Montserrat body/controls, Cascadia Code financial data. Body/input 16px, labels 14px, headings 26–42px. Text navy on white is approximately 7:1; white on crimson approximately 7:1. These are web foundations, not a claim of Apple-native convention compliance.

Current reference: desktop 5300px, mobile 8785px, all tasks visible simultaneously. Proposed default desktop screens approximately 1429–1675px; mobile approximately 1873–2235px. Each shows only one task, with compact hero and ordinary page scroll. Disclosure and expanded-preview states intentionally add height when requested. The original long-page reference is embedded in the new editable document for comparison.

## Evidence and limitations

Read: blend-builder-experience.tsx, partnership-blend-brief.tsx, data.ts, catalog-master.ts, blend-profile.ts, partnership-estimate.ts and catalog-publication.ts. Data and calculation snapshots generated locally, not fetched from a live verified catalog API. Consequently these are catalog-derived review examples, not current stock/price guarantees.

FigCraft contains editable text, vector chart geometry and photo fills. It represents interaction states and click navigation; arbitrary slider dragging, typing, live calculation, actual keyboard semantics, backend verification and browser state persistence are not implemented or claimed. Complete form values are explicitly fictional review data. No WhatsApp message was sent.

The current product-photo fallback itself has generic pouch labels. It is retained because replacing it would change the source mapping; dedicated product photography remains a catalog-content concern.

All Next.js/backend/database changes were excluded. No commit, push or deploy. Review this design before implementation.
