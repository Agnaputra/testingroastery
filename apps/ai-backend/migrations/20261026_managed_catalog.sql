BEGIN;

CREATE TABLE catalog_managed_products (
  slug TEXT PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  product JSONB NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  image_data BYTEA,
  image_mime TEXT CHECK (image_mime IS NULL OR image_mime = 'image/webp'),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
