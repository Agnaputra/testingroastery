# Grand Reserve and compact Racikan revision

Updated editable design: `52-coffee-guided-3d-header.figcraft`.
Previous revision: `52-coffee-guided-3d-header.before-density-20261109.figcraft`.

## Findings and changes

- The FigCraft document contained all frames and rendered successfully; the reported empty opening was not reproduced. It had no prototype flow entry points. Desktop/mobile starts now point to Racikan, and the canvas is focused on the desktop frame. The native FigCraft prototype preview was opened and visibly rendered the workspace.
- Beans previously spanned both grid columns, reserving an empty upper-right area. Beans now belong to the left controls column; radar and price start alongside them.
- Tailwind `space-y` margins were stacked with flex `gap`. Guided mode now uses one spacing mechanism. Coffee Lab retains its existing spacing.
- The expanded price breakdown inherited dark `text-on-surface` from its own `details` element. It now uses white text on charcoal. All values and calculations are unchanged.
- The supplied Grand Reserve cutout replaces the cropped Prau texture and generic box. The full photo is mapped to a shallow curved surface with limited pointer tilt. This is photo-based depth, not a reconstructed 360-degree pouch. Mobile, reduced motion and WebGL context loss use the original static image.
- FigCraft desktop Racikan height: 1769 → 1370 px; mobile: 2297 → 2177 px. Open price-breakdown frames and prototype toggle links were added. Existing calculator, form and validation states remain.

## Verification

- PASS: TypeScript, lint and production build (89 static pages).
- PASS: Chromium at 1440, 768, 390 and 320 px; three-step flow, ratio total, Bean C, radar updates, HPP outputs, retail source, required form fields, state retention and WhatsApp URL/preview interception.
- PASS: expanded breakdown text color; desktop results align with beans; no stacked control margins or horizontal overflow.
- PASS: desktop WebGL render, pointer response and static fallback after simulated context loss (software WebGL test).
- FigCraft exports: `density-refinement-exports/`; website screenshots and results: `implementation-qa/`.
- No message was sent, no dependency was added, and no commit, push or deployment was performed. Physical-device and cross-browser testing remain unverified.
