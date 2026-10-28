BEGIN;

CREATE TABLE customer_shipping_quote_attempts (
  user_id UUID NOT NULL REFERENCES customer_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX customer_shipping_quote_attempts_user_time_idx
  ON customer_shipping_quote_attempts(user_id, created_at DESC);

COMMIT;
