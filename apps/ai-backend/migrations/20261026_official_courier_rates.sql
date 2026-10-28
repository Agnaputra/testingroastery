BEGIN;

ALTER TABLE customer_shipping_rates
  ADD COLUMN courier_code TEXT,
  ADD COLUMN service_name TEXT,
  ADD COLUMN max_weight_grams INTEGER,
  ADD COLUMN source_url TEXT;

ALTER TABLE customer_shipping_rates
  ADD CONSTRAINT customer_shipping_rates_official_check CHECK (
    (courier_code IS NULL AND service_name IS NULL AND max_weight_grams IS NULL AND source_url IS NULL)
    OR (courier_code IN ('jne','jnt') AND length(btrim(service_name)) BETWEEN 2 AND 100
        AND max_weight_grams BETWEEN 1 AND 100000
        AND length(source_url) BETWEEN 15 AND 500)
  );

DROP INDEX customer_shipping_rates_region_idx;
CREATE UNIQUE INDEX customer_shipping_rates_official_idx
  ON customer_shipping_rates(lower(province), lower(city), lower(district), courier_code,
                             lower(service_name), max_weight_grams) WHERE courier_code IS NOT NULL;

COMMIT;
