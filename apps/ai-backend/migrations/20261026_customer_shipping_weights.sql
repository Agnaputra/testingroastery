BEGIN;

CREATE TABLE customer_shipping_weights (
  sku_id TEXT PRIMARY KEY,
  packed_weight_grams INTEGER NOT NULL CHECK (packed_weight_grams BETWEEN 1 AND 100000),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
