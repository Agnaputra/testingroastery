BEGIN;

ALTER TABLE customer_inventory ADD COLUMN verified_at TIMESTAMPTZ;

CREATE TABLE customer_inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  operation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  resource_id TEXT NOT NULL REFERENCES customer_inventory(resource_id),
  delta INTEGER NOT NULL CHECK (delta <> 0),
  reason TEXT NOT NULL CHECK (length(btrim(reason)) BETWEEN 3 AND 500),
  actor_user_id UUID REFERENCES customer_users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES customer_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_inventory_movements_resource_idx
  ON customer_inventory_movements(resource_id, created_at DESC);

CREATE TABLE customer_shipping_origin (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 2 AND 100),
  full_address TEXT NOT NULL CHECK (length(btrim(full_address)) BETWEEN 5 AND 500),
  city TEXT NOT NULL CHECK (length(btrim(city)) BETWEEN 2 AND 100),
  province TEXT NOT NULL CHECK (length(btrim(province)) BETWEEN 2 AND 100),
  postal_code CHAR(5) NOT NULL CHECK (postal_code ~ '^[0-9]{5}$'),
  verified_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE customer_shipping_rates (
  id BIGSERIAL PRIMARY KEY,
  province TEXT NOT NULL CHECK (length(btrim(province)) BETWEEN 2 AND 100),
  city TEXT NOT NULL CHECK (length(btrim(city)) BETWEEN 2 AND 100),
  district TEXT NOT NULL CHECK (length(btrim(district)) BETWEEN 2 AND 100),
  amount_idr INTEGER NOT NULL CHECK (amount_idr BETWEEN 0 AND 1000000),
  verified_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customer_shipping_rates_region_idx
  ON customer_shipping_rates(lower(province), lower(city), lower(district));

COMMIT;
