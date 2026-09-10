# Coffee hero model

The landing page currently uses a procedural standing pouch. No external model,
HDRI, font texture, or stock 3D asset is downloaded by the scene.

To replace the pouch:

1. Place the final file here as `coffee-bag.glb`.
2. In `components/hero/CoffeeModel.tsx`, change `COFFEE_MODEL_URL` from `null` to
   `'/models/coffee-bag.glb'`.

`CoffeeScene` and its animation do not need to change. The model loader centers
the object and scales its height to 2.75 scene units. Export upright along +Y,
with the front label facing +Z, and apply object transforms before exporting.
Embed textures in the GLB; use standard PBR materials. Draco and Meshopt decoding
are disabled to avoid implicit remote decoder downloads. The procedural pouch is
shown while the model loads; a failed scene uses the existing product photograph.

Recommended next asset pass: a real pouch mesh with gentle folds, a verified
product label, and baked normal/roughness maps. Aim for under 2 MB, modest polygon
counts, and textures no larger than 1024 px for the mobile hero. Profile the final
asset on real mid-range phones before raising these budgets.
