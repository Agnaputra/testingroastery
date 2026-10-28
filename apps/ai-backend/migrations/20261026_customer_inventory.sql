BEGIN;
ALTER TABLE customer_catalog_prices ADD COLUMN category TEXT NOT NULL DEFAULT 'beans';
ALTER TABLE customer_catalog_prices ADD COLUMN weight_grams INTEGER NOT NULL DEFAULT 0;
ALTER TABLE customer_catalog_prices ADD COLUMN resource_id TEXT;
CREATE TABLE customer_blend_prices (
  slug TEXT NOT NULL,
  product_name TEXT NOT NULL,
  weight_grams INTEGER NOT NULL CHECK (weight_grams IN (250,500,1000)),
  amount_idr INTEGER NOT NULL CHECK (amount_idr > 0),
  PRIMARY KEY (slug,weight_grams)
);
CREATE TABLE customer_inventory (
  resource_id TEXT PRIMARY KEY,
  unit TEXT NOT NULL CHECK (unit IN ('gram','unit')),
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE customer_order_inventory (
  order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES customer_inventory(resource_id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (order_id,resource_id)
);
ALTER TABLE customer_orders ADD COLUMN expires_at TIMESTAMPTZ;
CREATE INDEX customer_orders_expiry_idx ON customer_orders(expires_at)
  WHERE payment_status IN ('pending','rejected');
COMMIT;
