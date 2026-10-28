-- Apply only to a verified development/staging database.
BEGIN;

CREATE TABLE customer_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  google_sub TEXT UNIQUE,
  role VARCHAR(10) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  disabled_at TIMESTAMPTZ
);
CREATE TABLE customer_sessions (
  token_hash CHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_sessions_user_idx ON customer_sessions(user_id);
CREATE TABLE customer_auth_tokens (
  token_hash CHAR(64) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE,
  purpose VARCHAR(16) NOT NULL CHECK (purpose IN ('verify','reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);
CREATE TABLE customer_auth_attempts (
  key_hash CHAR(64) PRIMARY KEY,
  attempts INTEGER NOT NULL CHECK (attempts >= 0),
  window_started_at TIMESTAMPTZ NOT NULL
);
CREATE TABLE customer_profiles (
  user_id UUID PRIMARY KEY REFERENCES customer_users(id) ON DELETE CASCADE,
  display_name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(16) CHECK (whatsapp ~ '^[1-9][0-9]{7,14}$'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(16) NOT NULL CHECK (whatsapp ~ '^[1-9][0-9]{7,14}$'),
  province VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  postal_code VARCHAR(10) NOT NULL,
  full_address TEXT NOT NULL,
  notes VARCHAR(500) NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_addresses_user_idx ON customer_addresses(user_id);
CREATE UNIQUE INDEX customer_addresses_default_idx ON customer_addresses(user_id) WHERE is_default;
CREATE TABLE customer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES customer_users(id) ON DELETE RESTRICT,
  idempotency_key UUID NOT NULL,
  request_hash CHAR(64) NOT NULL,
  shipping_snapshot JSONB NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
  shipping_cost INTEGER NOT NULL CHECK (shipping_cost >= 0),
  total INTEGER NOT NULL CHECK (total = subtotal - discount + shipping_cost),
  payment_method VARCHAR(16) NOT NULL CHECK (payment_method IN ('qris_static','bca_transfer')),
  payment_status VARCHAR(24) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','awaiting_verification','paid','rejected','cancelled')),
  fulfillment_status VARCHAR(16) NOT NULL DEFAULT 'pending'
    CHECK (fulfillment_status IN ('pending','processing','roasting','shipped','completed','cancelled')),
  tracking_number VARCHAR(100),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);
CREATE INDEX customer_orders_user_idx ON customer_orders(user_id, created_at DESC);
CREATE INDEX customer_orders_admin_idx ON customer_orders(payment_status, fulfillment_status, created_at DESC);
CREATE TABLE customer_order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE RESTRICT,
  sku_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  grind_label TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  line_total INTEGER NOT NULL CHECK (line_total = unit_price * quantity)
);
CREATE INDEX customer_order_items_order_idx ON customer_order_items(order_id);
CREATE TABLE customer_payments (
  order_id UUID PRIMARY KEY REFERENCES customer_orders(id) ON DELETE RESTRICT,
  method VARCHAR(16) NOT NULL CHECK (method IN ('qris_static','bca_transfer')),
  status VARCHAR(24) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','awaiting_verification','paid','rejected','cancelled')),
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE customer_payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES customer_users(id) ON DELETE RESTRICT,
  mime_type VARCHAR(20) NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','application/pdf')),
  content BYTEA NOT NULL CHECK (octet_length(content) BETWEEN 1 AND 5000000),
  sha256 CHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_payment_proofs_order_idx ON customer_payment_proofs(order_id, created_at DESC);
CREATE TABLE customer_order_status_history (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE RESTRICT,
  actor_user_id UUID REFERENCES customer_users(id) ON DELETE SET NULL,
  actor_role VARCHAR(10) NOT NULL CHECK (actor_role IN ('customer','admin','system')),
  field VARCHAR(12) NOT NULL CHECK (field IN ('payment','fulfillment')),
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_order_history_order_idx ON customer_order_status_history(order_id, created_at);

COMMIT;
