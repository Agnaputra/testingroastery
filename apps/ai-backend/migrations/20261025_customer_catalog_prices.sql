-- Restricted local/staging commerce price snapshot. Sync from the published web catalog.
BEGIN;
CREATE TABLE customer_catalog_prices (
  sku_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  amount_idr INTEGER NOT NULL CHECK (amount_idr > 0),
  in_stock BOOLEAN NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_catalog_prices_slug_idx ON customer_catalog_prices(slug);
COMMIT;
