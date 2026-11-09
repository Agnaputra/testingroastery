# Consultations — interactive coffee header design revision

Design only. Original `52-coffee-guided-final.figcraft` remains the backup/source. Separate revision: `52-coffee-guided-3d-header.figcraft`. All workspace controls, calculations, forms, navbar/footer and interaction-state frames are preserved. First-step desktop hero is 360px high, mobile 412px including copy/composition; later steps retain the compact light header.

## What the mockup represents

Authentic `apps/web/public/images/bag-prau-cutout.png` is placed unchanged. Existing label reads 52 COFFEE / PRAU / BLACK HONEY / TRIPLE YEAST. It is a brand visual, not a claim that this is the selected espresso ingredient. Floating beans are editable illustrative volume studies, not photorealistic models. Pointer-state images use small 2D offsets/tilts to communicate direction only; actual X/Y perspective is specified below. FigCraft is not a working WebGL scene.

Canva search found the 52 Coffee brand-guidelines design DAHC4LgNKoA; this does not establish the existence of a licensed GLB or a complete packaging texture set. Website assets include authentic photos and cutouts. No GLB/GLTF/HDR was found under public. Amble reference could not be retrieved through the web tool; no pixel-match claim is made.

## Existing architecture inspected

Next.js 14 App Router / React 18. Installed: @react-three/fiber 8.18, @react-three/drei 9.122, three 0.170. Existing `components/hero/CoffeeScene.tsx`, `CoffeeModel.tsx`, `FloatingBeans.tsx` and `types.ts` already support studio lighting, procedural bean geometry, pointer inputs, context-loss callback and motion quality tiers. CoffeeModel exports COFFEE_MODEL_URL=null and includes procedural geometry and a generated canvas label. Do not reuse that generated label for the authentic packaging brief. Reuse patterns without changing homepage components or behavior.

## Proposed scene structure (future implementation)

ConsultationCoffeeHero client boundary, with static Next/Image fallback always rendered first.

- Canvas: perspective camera, fixed hero box; transparent clear color over cream #F3F0E9.
- StudioLights: warm key, soft fill, low-resolution generated environment, no external HDR requirement.
- MotionRoot: parent pointer-follow transform.
- AuthenticPouch: centered GLB, material slots PouchFront, PouchBack, Gusset, Seal; accurate UVs, physical dimensions and clean normals.
- FloatingBeans: shared geometry/material or instanced mesh, 3–5 beans in foreground/midground/background.
- GroundShadow: baked/contact shadow, no expensive postprocessing.

Proposed asset paths, not files already supplied:

- `/models/consultations/52coffee-prau.glb`
- `/models/consultations/roasted-bean.glb` (or reuse approved procedural bean geometry)
- `/textures/consultations/prau-basecolor.webp`
- `/textures/consultations/prau-normal.webp`
- `/textures/consultations/prau-roughness.webp`
- `/images/consultations-coffee-static.webp`

Missing: approved front/back/side packaging artwork or scans; UV-mapped pouch GLB; accurate PBR material maps; realistic bean model/material approval; neutral rendered fallback with matching camera/light. A single front photo cannot faithfully reconstruct hidden package surfaces. Do not invent those labels or stretch the front photograph around the entire pouch. Until assets are approved, use the existing image composition fallback.

## Pointer contract

Desktop fine pointer only: normalize pointer within scene container to [-1,1]. target rotation X=clamp(-pointerY*8deg,-8deg,8deg), Y=clamp(pointerX*10deg,-10deg,10deg). No Z spin or drag-to-orbit. Smooth with frame-rate-independent damping, alpha=1-exp(-6*delta). Pointer leave sets target to zero. Foreground beans translate up to 12px, midground 7px, background 3px, without random motion. Rest threshold stops rendering. Left/right FigCraft states annotate these target values; 2D tilt is not an exact 3D projection.

Mobile and coarse pointer: static fallback by default, no device-orientation permissions or touch tracking. Reduced motion: static fallback, no float, parallax, entry animation or continuous render loop. Steps 2/3 use compact text header and do not mount the canvas. No automatic rotation.

Canvas pointer-events:none; capture pointer position on the decorative scene wrapper only, without preventDefault, pointer capture or global listeners. Keep links, stepper and forms outside that wrapper. Canvas aria-hidden, no tabindex; use a concise image description on the fallback and keep every instructional text in HTML.

## Loading and performance targets

Use a consultation-only client wrapper with next/dynamic ssr:false for the scene; server page remains static. Lazy load when near viewport and only for desktop fine-pointer without reduced motion; show static image immediately. Reserve exact dimensions to avoid layout shift. Swap only after onReady. On WebGL failure/context loss/model-load error, retain fallback and all workspace interactions.

Start with DPR [1,1.5], demand rendering plus invalidate during pointer settling; pause offscreen and when document hidden. Reuse geometry/materials, max five beans, no bloom/depth-of-field/continuous environment capture. Proposed budgets: pouch <25k triangles, scene <50 draw calls, 1k basecolor initially (2k only if label readability requires), compressed GLB target ≤1.5MB, fallback target ≤200KB. These are targets, not measured performance. Test on integrated GPU, mobile fallback and low-power devices before release.

## Future implementation sequence

1. Approve this design and authentic GLB/texture assets.
2. Add route-specific client hero wrapper and static fallback, leaving homepage scene untouched.
3. Load GLB with Drei/useGLTF and correct sRGB basecolor; linear normal/roughness maps; matte pouch material, minimal metalness.
4. Add pointer damping and bean depth response; no React state writes each frame.
5. Wire viewport/visibility/reduced-motion/context-loss safeguards.
6. Validate desktop 1440, tablet 768, mobile 390; keyboard, no interception, no CLS; check that all three workspace steps preserve their state.
7. Measure real bundle/network/render cost before enabling live 3D.

Official references: https://r3f.docs.pmnd.rs/advanced/scaling-performance and https://nextjs.org/docs/app/guides/lazy-loading . Follow installed Next 14 APIs during implementation; current docs can contain newer-version guidance.

No Next.js code, dependencies, model files, backend or databases were changed in this design revision. No commit, push or deploy.
